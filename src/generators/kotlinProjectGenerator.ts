import * as fs from 'fs';
import * as path from 'path';

export class KotlinProjectGenerator {
    constructor(
        private targetDir: string,
        private projectName: string,
        private packageName: string
    ) {}

    async generate(): Promise<void> {
        const projectPath = path.join(this.targetDir, this.projectName);
        
        // Create project directory structure
        this.createDirectoryStructure(projectPath);
        
        // Generate project files
        this.generateProjectFiles(projectPath);
    }

    private createDirectoryStructure(projectPath: string): void {
        const directories = [
            projectPath,
            path.join(projectPath, 'src', 'main', 'kotlin', ...this.packageName.split('.')),
            path.join(projectPath, 'src', 'test', 'kotlin', ...this.packageName.split('.')),
            path.join(projectPath, 'gradle', 'wrapper'),
            path.join(projectPath, '.vscode')
        ];

        for (const dir of directories) {
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
        }
    }

    private generateProjectFiles(projectPath: string): void {
        // Generate build.gradle.kts
        const buildGradleContent = this.getBuildGradleTemplate();
        fs.writeFileSync(path.join(projectPath, 'build.gradle.kts'), buildGradleContent);

        // Generate settings.gradle.kts
        const settingsGradleContent = this.getSettingsGradleTemplate();
        fs.writeFileSync(path.join(projectPath, 'settings.gradle.kts'), settingsGradleContent);

        // Generate gradle.properties
        const gradlePropertiesContent = this.getGradlePropertiesTemplate();
        fs.writeFileSync(path.join(projectPath, 'gradle.properties'), gradlePropertiesContent);

        // Generate gradlew and gradlew.bat
        this.generateGradleWrapper(projectPath);

        // Generate Main.kt
        const mainKtContent = this.getMainKtTemplate();
        const packagePath = path.join(projectPath, 'src', 'main', 'kotlin', ...this.packageName.split('.'));
        fs.writeFileSync(path.join(packagePath, 'Main.kt'), mainKtContent);

        // Generate CalculatorTest.kt
        const testKtContent = this.getTestKtTemplate();
        const testPackagePath = path.join(projectPath, 'src', 'test', 'kotlin', ...this.packageName.split('.'));
        fs.writeFileSync(path.join(testPackagePath, 'CalculatorTest.kt'), testKtContent);

        // Generate VS Code settings
        this.generateVSCodeSettings(projectPath);
    }

    private getBuildGradleTemplate(): string {
        return `plugins {
    id("org.jetbrains.kotlin.jvm") version "1.9.0"
    application
}

repositories {
    mavenCentral()
}

dependencies {
    implementation(platform("org.jetbrains.kotlin:kotlin-bom"))
    implementation("org.jetbrains.kotlin:kotlin-stdlib-jdk8")
    
    testImplementation("org.jetbrains.kotlin:kotlin-test")
    testImplementation("org.jetbrains.kotlin:kotlin-test-junit")
}

application {
    mainClass.set("${this.packageName}.MainKt")
}

tasks.test {
    useJUnit()
}

tasks.withType<org.jetbrains.kotlin.gradle.tasks.KotlinCompile> {
    kotlinOptions {
        jvmTarget = "17"
    }
}
`;
    }

    private getSettingsGradleTemplate(): string {
        return `rootProject.name = "${this.projectName}"
`;
    }

    private getGradlePropertiesTemplate(): string {
        return `org.gradle.jvmargs=-Xmx2g
kotlin.code.style=official
`;
    }

    private getMainKtTemplate(): string {
        const className = this.packageName.split('.').pop() || 'Main';
        return `package ${this.packageName}

fun main() {
    println("Hello from ${this.projectName}!")
    
    val calculator = Calculator()
    println("2 + 3 = \${calculator.add(2, 3)}")
    println("5 - 2 = \${calculator.subtract(5, 2)}")
}

class Calculator {
    fun add(a: Int, b: Int): Int = a + b
    fun subtract(a: Int, b: Int): Int = a - b
}
`;
    }

    private getTestKtTemplate(): string {
        return `package ${this.packageName}

    import kotlin.test.Test
    import kotlin.test.assertEquals

    class CalculatorTest {

        private val calculator = Calculator()

        @Test
        fun testAdd() {
            assertEquals(5, calculator.add(2, 3))
        }

        @Test
        fun testSubtract() {
            assertEquals(3, calculator.subtract(5, 2))
        }
    }
    `;
    }

    private generateGradleWrapper(projectPath: string): void {
        const gradleWrapperDir = path.join(projectPath, 'gradle', 'wrapper');
        
        // Generate gradle-wrapper.properties
        const wrapperProperties = `distributionBase=GRADLE_USER_HOME
distributionPath=wrapper/dists
distributionUrl=https\\://services.gradle.org/distributions/gradle-8.2.1-bin.zip
networkTimeout=10000
zipStoreBase=GRADLE_USER_HOME
zipStorePath=wrapper/dists
`;
        fs.writeFileSync(path.join(gradleWrapperDir, 'gradle-wrapper.properties'), wrapperProperties);

        // Generate simple gradlew scripts (in real implementation, you'd copy actual gradle wrapper files)
        const gradlewContent = `#!/bin/bash
./gradlew "\$@"
`;
        fs.writeFileSync(path.join(projectPath, 'gradlew'), gradlewContent);
        fs.chmodSync(path.join(projectPath, 'gradlew'), 0o755);

        const gradlewBatContent = `@echo off
gradlew.bat %*
`;
        fs.writeFileSync(path.join(projectPath, 'gradlew.bat'), gradlewBatContent);
    }

    private generateVSCodeSettings(projectPath: string): void {
        const settings = {
            "files.exclude": {
                "**/.gradle": true,
                "**/build": true,
                "**/.git": true
            },
            "java.configuration.updateBuildConfiguration": "automatic"
        };

        fs.writeFileSync(
            path.join(projectPath, '.vscode', 'settings.json'),
            JSON.stringify(settings, null, 2)
        );

        // Generate launch.json for debugging
        const launchConfig = {
            "version": "0.2.0",
            "configurations": [
                {
                    "type": "kotlin",
                    "request": "launch",
                    "name": "Run Kotlin Application",
                    "projectRoot": "\${workspaceFolder}",
                    "mainClass": "${this.packageName}.MainKt"
                }
            ]
        };

        fs.writeFileSync(
            path.join(projectPath, '.vscode', 'launch.json'),
            JSON.stringify(launchConfig, null, 2)
        );
    }
}