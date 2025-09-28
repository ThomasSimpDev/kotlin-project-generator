import * as assert from 'assert';
import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs-extra';
import { KotlinProjectGenerator } from '../../generators/kotlinProjectGenerator';

suite('Kotlin Project Generator Extension Test Suite', () => {

    const testRoot = path.join(__dirname, '..', '..', '..', 'test-output');
    const projectName = 'TestKotlinProject';
    const packageName = 'com.example';

    setup(async () => {
        // Ensure clean test folder
        await fs.remove(testRoot);
        await fs.mkdirp(testRoot);
    });

    teardown(async () => {
        // Clean up after tests
        await fs.remove(testRoot);
    });

    test('Extension should be activated', async () => {
        const ext = vscode.extensions.getExtension('thomas-dev.kotlin-project-generator');
        assert.ok(ext, 'Extension not found');

        await ext?.activate();
        assert.ok(ext?.isActive, 'Extension failed to activate');
    });

    test('Command should be registered', async () => {
        const commands = await vscode.commands.getCommands(true);
        const found = commands.includes('kotlin-project-generator.createKotlinProject');
        assert.strictEqual(found, true, 'Command not registered');
    });

    test('Project generator should create expected structure', async () => {
        const generator = new KotlinProjectGenerator(testRoot, projectName, packageName);
        await generator.generate();

        const projectPath = path.join(testRoot, projectName);
        assert.ok(fs.existsSync(projectPath), 'Project folder not created');

        // Check gradle files
        assert.ok(fs.existsSync(path.join(projectPath, 'build.gradle.kts')), 'build.gradle.kts missing');
        assert.ok(fs.existsSync(path.join(projectPath, 'settings.gradle.kts')), 'settings.gradle.kts missing');

        // Check main source file
        const mainKt = path.join(
            projectPath,
            'src',
            'main',
            'kotlin',
            ...packageName.split('.'),
            'Main.kt'
        );
        assert.ok(fs.existsSync(mainKt), 'Main.kt missing');

        // Check test file
        const testKt = path.join(
            projectPath,
            'src',
            'test',
            'kotlin',
            ...packageName.split('.'),
            'CalculatorTest.kt'
        );
        assert.ok(fs.existsSync(testKt), 'CalculatorTest.kt missing');
    });
});
