#!/bin/bash

ACTION_NAME="TempLinkSrv"
MAIN_FILENAME="src/runtime/index.ts"
LOG_PREFIX="\e[36m[TempLinkSrv]\e[0m"

pm2 --silent info ${ACTION_NAME}
if [ $? -eq 0 ]; then
    pm2 restart ${ACTION_NAME}
    echo -e "${LOG_PREFIX} Restarted ${ACTION_NAME}!"
else
    pm2 start --name="${ACTION_NAME}" --interpreter="deno" --interpreter-args="run --allow-read --allow-env --allow-net" "$(dirname $0)/${MAIN_FILENAME}"
    echo -e "${LOG_PREFIX} Okay pm2, executing 'pm2 save'..."
    pm2 save
    echo -e "${LOG_PREFIX} Started ${MAIN_FILENAME} as ${ACTION_NAME}!"
fi
