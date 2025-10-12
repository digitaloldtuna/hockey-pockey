# Hockey Pockey 💃

code for the draft site

### how to run locally
1. client-side: ``

### check deploy will work locally
1. client-side
   1. `npm run build`
2. server-side
   1. `npx tsc`
   2. `cd dist && node index.js`

make sure it compiles and loads correctly

### deploying
1. `ssh` into the cPanel terminal
2. in `hockey-pockey` pull the changes
3. `cd hockey-pockey/client && npm run build`
4. `cd ../server && npx tsc`
5. reload the Node.js app

### to do list
[ ] update FE fetch prefix to use `/hockey/api` so we don't manually have to add `/hockey`
[ ] update BE to host all url at `/api` except for the main app