import { GoogleGenAI, Type } from "@google/genai";
import { execSync } from "child_process";
import fs from "fs";
import path from "path";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Disallowed directories and extensions to protect token context
const BLOCKED_DIRECTORIES = ["node_modules", ".git", "dist", "build", "coverage", ".next"];
const BLOCKED_EXTENSIONS = [
  ".png", ".jpg", ".jpeg", ".gif", ".svg", ".webp", ".ico",
  ".pdf", ".zip", ".tar", ".gz", ".lock", ".woff", ".woff2", ".ttf"
];
const BLOCKED_EXACT_FILES = ["package-lock.json", "pnpm-lock.yaml", "yarn.lock"];

function isPathForbidden(filePath) {
  const normalized = path.normalize(filePath).replace(/\\/g, "/");
  const segments = normalized.split("/");
  const fileName = path.basename(normalized);
  const ext = path.extname(normalized).toLowerCase();

  if (segments.some((seg) => BLOCKED_DIRECTORIES.includes(seg))) {
    return `Access denied: Directory in '${filePath}' is excluded from agent context.`;
  }
  if (BLOCKED_EXACT_FILES.includes(fileName)) {
    return `Access denied: '${fileName}' is excluded due to token payload size.`;
  }
  if (BLOCKED_EXTENSIONS.includes(ext)) {
    return `Access denied: Binary or static asset extension '${ext}' cannot be ingested.`;
  }
  return null;
}

const tools = [
  {
    functionDeclarations: [
      {
        name: "readFile",
        description: "Read file contents from repository",
        parameters: {
          type: Type.OBJECT,
          properties: {
            filePath: { type: Type.STRING, description: "Path relative to root" }
          },
          required: ["filePath"]
        }
      },
      {
        name: "writeFile",
        description: "Write code to a repository file",
        parameters: {
          type: Type.OBJECT,
          properties: {
            filePath: { type: Type.STRING, description: "Path relative to root" },
            content: { type: Type.STRING, description: "Full file content" }
          },
          required: ["filePath", "content"]
        }
      },
      {
        name: "runCommand",
        description: "Run safe shell verification commands (build/test/lint)",
        parameters: {
          type: Type.OBJECT,
          properties: {
            command: { type: Type.STRING, description: "Command to execute" }
          },
          required: ["command"]
        }
      },
      {
        name: "getGitDiff",
        description: "Get the current git diff of files modified relative to the base branch",
        parameters: {
          type: Type.OBJECT,
          properties: {
            baseBranch: { type: Type.STRING, description: "Base branch to compare against (e.g. 'main')" }
          },
          required: ["baseBranch"]
        }
      }
    ]
  }
];

function executeTool(name, args) {
  if (name === "readFile") {
    const violation = isPathForbidden(args.filePath);
    if (violation) return violation;

    if (!fs.existsSync(args.filePath)) {
      return `Error: File ${args.filePath} not found.`;
    }

    const stats = fs.statSync(args.filePath);
    if (stats.size > 250_000) {
      return `Error: File ${args.filePath} exceeds maximum safety read limit (250KB).`;
    }

    return fs.readFileSync(args.filePath, "utf8");
  }

  if (name === "writeFile") {
    const violation = isPathForbidden(args.filePath);
    if (violation) return violation;

    fs.mkdirSync(path.dirname(args.filePath), { recursive: true });
    fs.writeFileSync(args.filePath, args.content, "utf8");
    return `Successfully written to ${args.filePath}`;
  }

  if (name === "runCommand") {
    try {
      const output = execSync(args.command, { encoding: "utf8", timeout: 60000 });
      return `Success:\n${output}`;
    } catch (err) {
      return `Failed:\n${err.stdout || err.message}`;
    }
  }

  if (name === "getGitDiff") {
    try {
      const diff = execSync(`git diff origin/${args.baseBranch}...HEAD --stat -p`, {
        encoding: "utf8",
        maxBuffer: 1024 * 500
      });
      return diff.slice(0, 50000);
    } catch (err) {
      return `Error reading diff: ${err.message}`;
    }
  }

  throw new Error(`Unknown tool: ${name}`);
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function sendWithRetry(chatSession, payload, maxRetries = 5) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await chatSession.sendMessage(payload);
    } catch (err) {
      const status = err.status || err.code;
      const isRateLimit = status === 429 || (err.message && err.message.includes("429"));
      const isServerTransient = status === 503 || status === 500 || (err.message && (err.message.includes("503") || err.message.includes("high demand")));
      const isNetworkError =
        err?.cause?.code === "UND_ERR_HEADERS_TIMEOUT" ||
        (err?.message && err.message.includes("fetch failed"));

      if ((isRateLimit || isServerTransient || isNetworkError) && attempt < maxRetries) {
        const jitter = Math.floor(Math.random() * 3000);
        let waitMs = attempt * 15000 + jitter;

        if (isRateLimit) {
          const retryDelayMatch = err.message?.match(/retry in ([0-9.]+)s/);
          waitMs = retryDelayMatch 
            ? Math.ceil(parseFloat(retryDelayMatch[1]) * 1000) + 2000 + jitter
            : waitMs;
          console.warn(`[429 Rate Limit] Backing off for ${Math.round(waitMs / 1000)}s (Attempt ${attempt}/${maxRetries})...`);
        } else if (isNetworkError) {
          console.warn(`[Network/Timeout] Fetch connection error. Retrying in ${Math.round(waitMs / 1000)}s (Attempt ${attempt}/${maxRetries})...`);
        } else {
          console.warn(`[503 Server Busy] High demand spike. Retrying in ${Math.round(waitMs / 1000)}s (Attempt ${attempt}/${maxRetries})...`);
        }

        await sleep(waitMs);
        continue;
      }
      throw err;
    }
  }
}

async function runAgentTurn(systemPrompt, userPrompt) {
  const session = ai.chats.create({
    model: "gemini-3.5-flash-lite",
    config: {
      systemInstruction: systemPrompt,
      tools: tools
    }
  });

  let response = await sendWithRetry(session, { message: userPrompt });
  let turnCount = 0;
  const MAX_TURNS = 18;

  while (response.functionCalls && response.functionCalls.length > 0) {
    turnCount++;
    if (turnCount > MAX_TURNS) {
      console.warn(`[Turn Limit] Hit maximum turn count (${MAX_TURNS}). Terminating agent loop.`);
      break;
    }

    const call = response.functionCalls[0];
    console.log(`Executing tool (${turnCount}/${MAX_TURNS}): ${call.name}(${JSON.stringify(call.args)})`);
    const toolResult = executeTool(call.name, call.args);

    await sleep(12500);

    response = await sendWithRetry(session, {
      message: [
        {
          functionResponse: {
            name: call.name,
            response: { result: toolResult }
          }
        }
      ]
    });
  }

  return response.text;
}

function extractScope(body) {
  if (!body) return "monorepo";
  const match = body.match(/###\s*Target Scope\s*\n+([^\n\r]+)/i);
  return match ? match[1].trim().toLowerCase() : "monorepo";
}

async function main() {
  const isRemediation = process.argv.includes("--mode=remediate");

  if (isRemediation) {
    const feedback = process.env.