Commit all changes, push to master, rebuild, and restart the server. Do all of this without asking for confirmation.

Steps:
1. `git add -A` and commit with a concise message describing the changes
2. `git push origin master`
3. `npm run build` to rebuild the frontend
4. Find the running `node server/index.js` process, kill it, and restart it with `nohup node server/index.js > /tmp/ipad-screen.log 2>&1 &`
5. Verify the server started by checking the log output
6. Report what was deployed in one sentence
