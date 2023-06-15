// @ts-check
const price = 0.03 / 1000;

export function setSessionTokens(tokens, sessionContext) {
    sessionContext.tokens = `${tokens} tokens (${(price * Number(tokens || 0)).toFixed(2)}$)`;
    updateTitle(sessionContext)
}

export function setSessionWorkspace(workspace, sessionContext) {
    sessionContext.workspace = workspace;
    updateTitle(sessionContext)
}

export function setSessionAction(action, sessionContext) {
    sessionContext.action = action;
    updateTitle(sessionContext)
}

function updateTitle(sessionContext) {
    process.stdout.write(
        String.fromCharCode(27) + "]0;" + sessionContext.tokens + ' - ' + sessionContext.workspace + ' - ' + sessionContext.action + String.fromCharCode(7)
    );
}