# Local development policy

Read AGENTS.md before editing. Use docs/AI_DEVELOPMENT.md for scoped task prompts.
Preserve games, assets, URLs, dependencies, Git history and deployment settings.
Work only on the requested feature. Inspect relevant files rather than scanning the repo.
Never treat clement-arcade/dist as generated output; only its server/ and .openai/ folders are generated.
Do not read credentials, local databases or unrelated scratch copies in tmp/ or work/.

Start in Plan mode and propose a short file list before Act mode. Keep Cline's
Auto Approve, command execution, outside-workspace access and YOLO mode disabled.
Review each edit and terminal command; these instructions are guidance, not a sandbox.
Never deploy, apply remote D1 migrations, push, install dependencies, enable billing,
change accounts, delete data or run destructive Git commands without explicit approval.
Use small tasks and checkpoints; finish with a diff summary and the relevant check.
Do not add another AI agent or send work to subagents by default.
