# Hockey Pockey 💃

code for the draft site

### how to run locally
1. client-side: `npm run start`
2. server-side: `npm run dev`

**notes:** running the client-side script will update on change so that it is easy to see updates. For PROD, the pre-commit hook will run and build the FE, and in cPanel, the BE will host the build files.

### check deploy will work locally
1. client-side
   1. `npm run build`
2. server-side
   1. `npx tsc`
   2. `cd dist && node index.js`

make sure it compiles and loads correctly

### deploying
1. push changes, make sure FE build also gets pushed
2. pull changes in cPanel dash
3. double check changes in hosted app

### resources
- NHL API: https://github.com/Zmalski/NHL-API-Reference