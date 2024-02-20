#!/bin/bash

cd $(dirname $0)

ACTION_NAME="TempLinkSrv"
MAIN_FILENAME="src/runtime/server/TempLinkSrv.ts"
SETUP_FILENAME="src/setup/index.ts"
LOG_PREFIX="\e[36m[TempLinkSrv]\e[0m"

ALLOWED_NET="$(deno run --allow-read=. --allow-write=. ${SETUP_FILENAME} | awk '$1 != "--" {print $0}')"
INTERPRETER_ARGS="run --allow-read=. --allow-write=. --allow-env --allow-net=${ALLOWED_NET}" 

if [ $1 == "setup" ]; then
    exit 0
elif [ $1 == "start" ]; then
    deno ${INTERPRETER_ARGS} ${MAIN_FILENAME}
elif [ $1 == "pm2" ]; then
    pm2 --silent info ${ACTION_NAME}
    if [ $? -eq 0 ]; then
        pm2 restart ${ACTION_NAME} --interpreter-args="${INTERPRETER_ARGS}"
        echo -e "${LOG_PREFIX} Restarted ${ACTION_NAME}!"
    else
        pm2 start --name="${ACTION_NAME}" --interpreter="deno" --interpreter-args="${INTERPRETER_ARGS}" "${MAIN_FILENAME}"
        echo -e "${LOG_PREFIX} Okay pm2, executing 'pm2 save'..."
        pm2 save
        echo -e "${LOG_PREFIX} Started ${MAIN_FILENAME} as ${ACTION_NAME}!"
    fi
else
    echo -e "${LOG_PREFIX} Invalid option: $1" >&2
fi
