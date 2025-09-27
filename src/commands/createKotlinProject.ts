import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { KotlinProjectGenerator } from '../generators/kotlinProjectGenerator';

export async function createKotlinProject(uri?: vscode.Uri): Promise<void> {
    try {
        // Get the target directory
        let targetDir: string;
        if (uri && uri.fsPath) {
            targetDir = uri.fsPath;
        } else {
            const workspaceFolders = vscode.workspace.workspaceFolders;
            if (!workspaceFolders) {
                vscode.window.showErrorMessage('Please open a workspace first');
                return;
            }
            targetDir = workspaceFolders[0].uri.fsPath;
        }

        // Prompt for project name
        const projectName = await vscode.window.showInputBox({
            prompt: 'Enter project name',
            placeHolder: 'my-kotlin-project',
            validateInput: (value: string) => {
                if (!value) {
                    return 'Project name is required';
                }
                if (!/^[a-zA-Z0-9_-]+$/.test(value)) {
                    return 'Project name can only contain letters, numbers, underscores, and hyphens';
                }
                return null;
            }
        });

        if (!projectName) {
            return;
        }

        // Prompt for package name
        const packageName = await vscode.window.showInputBox({
            prompt: 'Enter package name',
            placeHolder: 'com.example',
            value: 'com.example',
            validateInput: (value: string) => {
                if (!value) {
                    return 'Package name is required';
                }
                if (!new RegExp('^[a-zA-Z][a-zA-Z0-9_]*(\\.[a-zA-Z][a-zA-Z0-9_]*)*$').test(value)) {
                    return 'Invalid package name format';
                }
                return null;
            }
        });

        if (!packageName) {
            return;
        }

        // Create project generator instance
        const generator = new KotlinProjectGenerator(targetDir, projectName, packageName);
        
        // Generate the project
        await generator.generate();
        
        vscode.window.showInformationMessage(
            `Kotlin project '${projectName}' created successfully!`,
            'Open Project'
        ).then(selection => {
            if (selection === 'Open Project') {
                const projectPath = path.join(targetDir, projectName);
                vscode.commands.executeCommand('vscode.openFolder', vscode.Uri.file(projectPath));
            }
        });

    } catch (error) {
        vscode.window.showErrorMessage(`Failed to create Kotlin project: ${error}`);
    }
}