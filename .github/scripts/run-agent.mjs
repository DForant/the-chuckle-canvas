import { GoogleGenAI, Type } from "@google/genai";
import { execSync } from "child_process";
import fs from "fs";
import path from "path";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

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
    return fs.existsSync(args.filePath)
      ? fs.readFileSync(args.filePath, "utf8")
      : `Error: File ${args.filePath} not found.`;
  }
  if (name === "writeFile") {
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

      if ((isRateLimit || isServerTransient) && attempt < maxRetries) {
        let waitMs = attempt * 15000;

        if (isRateLimit) {
          const retryDelayMatch = err.message?.match(/retry in ([0-9.]+)s/);
          waitMs = retryDelayMatch 
            ? Math.ceil(parseFloat(retryDelayMatch[1]) * 1000) + 2000 
            : waitMs;
          console.warn(`[429 Rate Limit] Backing off for ${waitMs / 1000}s (Attempt ${attempt}/${maxRetries})...`);
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
    model: "gemini-3.5-flash-lite", // Switch while 3.6-flash is capped at 20 RPD
    config: {
      systemInstruction: systemPrompt,
      tools: tools
    }
  });

  let response = await sendWithRetry(session, { message: userPrompt });
  let turnCount = 0;
  const MAX_TURNS = 8; // Hard cutoff to prevent runaway quota burn

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