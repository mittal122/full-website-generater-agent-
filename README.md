# FullAgentMaker

An autonomous multi-agent system that generates a website or application from a single natural language prompt.

## Agents

An orchestrator in `server/agents/AgentOrchestrator.ts` coordinates five agents:

- **Requirement Agent:** parses the prompt into a structured project plan
- **Frontend Agent:** builds the UI from the plan
- **Backend Agent:** builds the server-side logic when required
- **Validator Agent:** reviews and debugs the code from both agents
- **Deployment Agent:** packages the validated project

## Stack

React, TypeScript, Tailwind CSS, Express and the Google Gemini API.

## Run

The app is in `FullAgentMaker/`. It needs a `GEMINI_API_KEY` environment variable.

```sh
cd FullAgentMaker
npm install
npm run dev
```

The `dev` script uses Unix-style environment syntax, so on Windows run it from Git Bash or WSL.
