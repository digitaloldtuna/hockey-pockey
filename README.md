# Hockey Pockey 💃

code for the draft site
hosted at https://hockey-pockey.up.railway.app/

### how to run locally

run `npm i` in client, server, and root

1. client-side: `npm run start`
2. server-side: `npm run dev`

### deploying

remember to lint with `npm run lint:fix` and ensure that the prettier precommit runs, and then just push!

### getting into shell

- run `npx tsx` in `server`
- to include env variables, run the following:

```
const { default: dotenv } = await import("dotenv");
dotenv.config()

// example job
const { PopulateTeamsDB } = await import("./src/jobs/nhl.ts");
await PopulateTeamsDB();
```

### resources

- NHL API: https://github.com/Zmalski/NHL-API-Reference
