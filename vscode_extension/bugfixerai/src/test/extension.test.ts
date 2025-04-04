import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
    let disposable = vscode.commands.registerCommand('extension.helloWorld', () => {
        vscode.window.showInformationMessage('Hello, VS Code Extension!');
    });

    context.subscriptions.push(disposable);
}

export function deactivate() {}
