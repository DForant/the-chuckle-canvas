import { GoogleGenAI, Type } from "@google/genai";
import { execSync } from "child_process";
import fs from "fs";
import path from "path";

// Prevent HeadersTimeoutError / fetch failed on large inference turns
setGlobalDispatcher(
  new Agent({
    headersTimeout: 900_000, // 15 minutes
    bodyTimeout: 900_000,
    connectTimeout: 60_000,
  })
);

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
      const isTimeout =
        err?.cause?.code === "UND_ERR_HEADERS_TIMEOUT" ||
        (err?.message && err.message.includes("fetch failed"));

      if ((isRateLimit || isServerTransient || isTimeout) && attempt < maxRetries) {
        let waitMs = attempt * 15000;

        if (isRateLimit) {
          const retryDelayMatch = err.message?.match(/retry in ([0-9.]+)s/);
          waitMs = retryDelayMatch 
            ? Math.ceil(parseFloat(retryDelayMatch[1]) * 1000) + 2000 
            : waitMs;
          console.warn(`[429 Rate Limit] Backing off for ${waitMs / 1000}s (Attempt ${attempt}/${maxRetries})...`);
        } else if (isTimeout) {
          console.warn(`[Network/Timeout] Undici fetch timeout. Retrying in ${waitMs / 1000}s (Attempt ${attempt}/${maxRetries})...`);
        } else {
          console.warn(`[503 Server Busy] High demand spike. Retrying in ${waitMs / 1000}s (Attempt ${attempt}/${maxRetries})...`);
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
    model: "gemini-2.5-flash",
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
  const issueBody = process.env.ISSUE_BODY || "";
  const scope = extractScope(issueBody);

  const apiPrompt = fs.readFileSync(".github/agents/prompts/server-agent.md", "utf8");
  const clientPrompt = fs.readFileSync(".github/agents/prompts/client-agent.md", "utf8");
  const qaPrompt = fs.readFileSync(".github/agents/prompts/qa-agent.md", "utf8");

  console.log(`Executing pipeline for scope: [${scope}]`);

  switch (scope) {
    case "client":
      await runAgentTurn(clientPrompt, `Implement frontend task:\n${issueBody}`);
      break;

    case "server":
      await runAgentTurn(apiPrompt, `Implement server/API task:\n${issueBody}`);
      break;

    case "testing":
      await runAgentTurn(qaPrompt, `Implement testing task or fix failing suites:\n${issueBody}`);
      break;

    case "monorepo":
    default:
      await runAgentTurn(apiPrompt, `Implement backend requirements:\n${issueBody}`);
      await runAgentTurn(clientPrompt, `Implement frontend requirements:\n${issueBody}`);
      await runAgentTurn(qaPrompt, "Run all workspace tests and resolve any failures.");
      break;
  }
}

main().catch((err) => {
  console.error("Runner failed:", err);
  process.exit(1);
});