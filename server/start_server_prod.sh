#!/bin/sh
git fetch && git reset --hard origin/feature/deploy_server && npm install && npm run build && (fuser -k 3000/tcp ; npm run start:prod)