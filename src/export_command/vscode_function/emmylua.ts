import * as vscode from 'vscode';
import path from 'path';

let pending = Promise.resolve();
function enqueue(operation: () => Promise<void>): Promise<void> {
    const result = pending.then(operation);
    pending = result.catch(() => {});
    return result;
}

interface State {
    version: string;
    status: 'applying' | 'active' | 'restoring' | 'inactive';
    originalWorkspaceLibrary: string[] | undefined;
    addedLibrary: string[];
    setRuntime: boolean;
}

const names = ['Scribunto', 'loadable', 'Modules'];
const stateKey = 'emmyLua.state';
let extensionContext: vscode.ExtensionContext | undefined;
let configListener: vscode.Disposable | undefined;

async function apply(context: vscode.ExtensionContext) {
    if (
        !vscode.workspace.workspaceFile &&
        !vscode.workspace.workspaceFolders?.length
    ) {
        return;
    }

    const version: string = context.extension.packageJSON.version;
    let state = context.workspaceState.get<State>(stateKey);
    // Restore old paths before applying this version, including unversioned state.
    if (state && (state.version !== version || state.status === 'restoring')) {
        await restore(context);
        state = undefined;
    } else if (state?.status === 'active') {
        return;
    }

    let config = vscode.workspace.getConfiguration('Lua');
    if (state?.status !== 'applying') {
        const originalWorkspaceLibrary =
            config.inspect<string[]>('workspace.library')?.workspaceValue;
        state = {
            version,
            status: 'applying',
            originalWorkspaceLibrary,
            addedLibrary: names
                .map((name) =>
                    path.join(context.extensionPath, 'EmmyLua', name),
                )
                .filter(
                    (folder) => !originalWorkspaceLibrary?.includes(folder),
                ),
            setRuntime:
                config.inspect('runtime.version')?.workspaceValue === undefined,
        };
    }
    // Persist before every attempt: a failed Memento save may still be cached.
    await context.workspaceState.update(stateKey, state);

    config = vscode.workspace.getConfiguration('Lua');
    if (
        state.setRuntime &&
        config.inspect('runtime.version')?.workspaceValue === undefined
    ) {
        await config.update(
            'runtime.version',
            'Lua 5.1',
            vscode.ConfigurationTarget.Workspace,
        );
    }

    // Re-read settings after awaits; retries add only paths still missing.
    config = vscode.workspace.getConfiguration('Lua');
    const library =
        config.inspect<string[]>('workspace.library')?.workspaceValue ?? [];
    const missing = state.addedLibrary.filter(
        (folder) => !library.includes(folder),
    );
    if (missing.length > 0) {
        await config.update(
            'workspace.library',
            [...library, ...missing],
            vscode.ConfigurationTarget.Workspace,
        );
    }
    await context.workspaceState.update(stateKey, {
        ...state,
        status: 'active',
    } satisfies State);
}

async function restore(context: vscode.ExtensionContext) {
    let state = context.workspaceState.get<State>(stateKey);
    if (!state || state.status === 'inactive') {
        return;
    }
    state = { ...state, status: 'restoring' };
    await context.workspaceState.update(stateKey, state);

    let config = vscode.workspace.getConfiguration('Lua');
    if (
        state.setRuntime &&
        config.inspect('runtime.version')?.workspaceValue === 'Lua 5.1'
    ) {
        await config.update(
            'runtime.version',
            undefined,
            vscode.ConfigurationTarget.Workspace,
        );
    }

    config = vscode.workspace.getConfiguration('Lua');
    const current =
        config.inspect<string[]>('workspace.library')?.workspaceValue;
    const library = (current ?? []).filter(
        (folder) => !state.addedLibrary.includes(folder),
    );
    const restored =
        library.length > 0 || state.originalWorkspaceLibrary !== undefined
            ? library
            : undefined;
    if (
        current?.length !== restored?.length ||
        current?.some((v, i) => v !== restored?.[i])
    ) {
        await config.update(
            'workspace.library',
            restored,
            vscode.ConfigurationTarget.Workspace,
        );
    }

    // Keep the full state until every cleanup write has succeeded.
    await context.workspaceState.update(stateKey, {
        version: context.extension.packageJSON.version,
        status: 'inactive',
        originalWorkspaceLibrary: undefined,
        addedLibrary: [],
        setRuntime: false,
    } satisfies State);
}

async function onChange() {
    const context = extensionContext;
    if (context) {
        await enqueue(() =>
            vscode.workspace
                .getConfiguration('wikitext')
                .get<boolean>('enableEmmyLuaIntegration') === true
                ? apply(context)
                : restore(context),
        );
    }
}

export let lua = {
    async onActivate(context: vscode.ExtensionContext) {
        extensionContext = context;
        configListener?.dispose();
        configListener = vscode.workspace.onDidChangeConfiguration((event) => {
            if (
                event.affectsConfiguration('wikitext.enableEmmyLuaIntegration')
            ) {
                onChange().catch((error: unknown) => {
                    console.error(
                        'Failed to update EmmyLua integration state:',
                        error,
                    );
                });
            }
        });
        context.subscriptions.push(configListener);

        // Recover unfinished transactions even when integration is disabled.
        await onChange();
    },

    async onDeactivate() {
        const context = extensionContext;
        configListener?.dispose();
        configListener = undefined;
        extensionContext = undefined;
        if (context) {
            await enqueue(() => restore(context));
        }
    },

    enableFactory(context: vscode.ExtensionContext, isBrowser: boolean) {
        return async function enable(): Promise<void> {
            await vscode.workspace
                .getConfiguration('wikitext')
                .update(
                    'enableEmmyLuaIntegration',
                    true,
                    vscode.ConfigurationTarget.Workspace,
                );
        };
    },

    disableFactory(context: vscode.ExtensionContext, isBrowser: boolean) {
        return async function disable(): Promise<void> {
            await vscode.workspace
                .getConfiguration('wikitext')
                .update(
                    'enableEmmyLuaIntegration',
                    false,
                    vscode.ConfigurationTarget.Workspace,
                );
        };
    },
};
