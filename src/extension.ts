import * as vscode from 'vscode';
import { createKotlinProject } from './commands/createKotlinProject';

export function activate(context: vscode.ExtensionContext) {
    console.log('Kotlin Project Generator extension is now active!');

    // Register the command
    let disposable = vscode.commands.registerCommand(
        'kotlin-project-generator.createKotlinProject',
        async (uri?: vscode.Uri) => {
            await createKotlinProject(uri);
        }
    );

    context.subscriptions.push(disposable);
}

export function deactivate() {}