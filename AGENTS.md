# Agent guidance (this repository)

## Where code lives

- **FlowBoard (application)** — Implement at **this directory** (repository root): `package.json`, `app/`, `public/`, Next.js config, and future API/database code. Run `npm run dev`, `npm run build`, and app tests from here.
- **Pinion (coordination only)** — The `pinion/` subtree is the Pinion tooling and its `.pinion/` state. Do **not** put FlowBoard application code, `package.json` for the app, or app `node_modules` inside `pinion/`. From repo root, Pinion CLI: `cd pinion && ./bin/pinion …`.

For Pinion workflows, commands, and Python tooling details, see **[pinion/AGENTS.md](pinion/AGENTS.md)**.
