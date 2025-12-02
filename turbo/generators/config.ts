import type { PlopTypes } from "@turbo/gen";

// Utility Functions
const validateAppName = (input: string): string | boolean => {
  if (input.includes(".")) {
    return "App name cannot include an extension";
  }
  if (input.includes(" ")) {
    return "App name cannot include spaces";
  }
  if (!input) {
    return "App name is required";
  }
  return true;
};

const createAddManyAction = (templateName: string) => ({
  type: "addMany" as const,
  destination: "{{ turbo.paths.root }}/apps/{{ name }}",
  base: `{{ turbo.paths.root }}/turbo/generators/templates/${templateName}`,
  templateFiles: `{{ turbo.paths.root }}/turbo/generators/templates/${templateName}/**/*`,
  globOptions: {
    dot: true,
  },
});

const modifyPackageJsonName = {
  type: "modify" as const,
  path: "{{ turbo.paths.root }}/apps/{{ name }}/package.json",
  pattern: /"name": ".*"/g,
  template: `"name": "{{ name }}"`,
};

const modifyWranglerTomlName = {
  type: "modify" as const,
  path: "{{ turbo.paths.root }}/apps/{{ name }}/wrangler.toml",
  pattern: /name = ".*"/g,
  template: `name = "astra-{{ name }}"`,
};

const modifyTsConfigActions = [
  {
    type: "modify" as const,
    path: "{{ turbo.paths.root }}/apps/{{ name }}/tsconfig.json",
    pattern: /"name": ".*"/g,
    template: `"name": "{{ name }}"`,
  },
  {
    type: "modify" as const,
    path: "{{ turbo.paths.root }}/apps/{{ name }}/tsconfig.json",
    pattern: /^(\s*{)/,
    template: `$1\n  "extends": "@repo/typescript-config/react-vite.json",`,
  },
];

const installDependenciesAction = (appType: string) => {
  return (answers: any) => {
    const { execSync } = require('child_process');
    const path = require('path');
    const fs = require('fs');

    try {
      console.log(`Installing dependencies for ${answers.name}...`);
      const rootPath = path.resolve(__dirname, '../..');
      execSync(`pnpm install --filter="${answers.name}"`, {
        stdio: 'inherit',
        cwd: rootPath,
        encoding: 'utf8'
      });
      console.log(`\n✅ Dependencies installed successfully for ${answers.name}`);

      console.log(`\n📋 Next steps:`);
      console.log(`   Dev:     pnpm dev --filter ${answers.name}`);
      console.log(`   Build:   pnpm build --filter ${answers.name}`);
      console.log(`   Preview: pnpm preview --filter ${answers.name}`);
      console.log(`\n   Or with turbo:`);
      console.log(`   Dev:     turbo dev --filter=${answers.name}`);
      console.log(`   Build:   turbo build --filter=${answers.name}`);

      return `${appType} app generated and dependencies installed successfully!`;
    } catch (error) {
      console.error(`\n❌ Generator Error: Failed to install dependencies for ${answers.name}`);
      console.error(`Error details: ${(error as Error).message}`);

      // Rollback: Remove generated app directory
      const appPath = path.join(path.resolve(__dirname, '../..'), 'apps', answers.name);
      try {
        if (fs.existsSync(appPath)) {
          console.log(`\n🔄 Rolling back: Removing generated app directory...`);
          fs.rmSync(appPath, { recursive: true, force: true });
          console.log(`✅ Rollback completed: ${appPath} removed`);
        }
      } catch (rollbackError) {
        console.error(`❌ Rollback failed: ${(rollbackError as Error).message}`);
      }

      console.log(`\n🐛 This appears to be an issue with the generator template or configuration.`);
      console.log(`Please check:`);
      console.log(`   - Generator template files in turbo/generators/templates/${appType}/`);
      console.log(`   - Generator configuration in turbo/generators/config.ts`);
      console.log(`   - Project dependencies and pnpm workspace setup`);

      throw new Error(`Generator failed and changes have been rolled back. Original error: ${(error as Error).message}`);
    }
  };
};

export default function generator(plop: PlopTypes.NodePlopAPI): void {
  // App generator
  plop.setGenerator("react-vite-basic", {
    description: "Basic Vite React app",
    prompts: [
      {
        type: "input",
        name: "name",
        message: "What is the name of the new app?",
        validate: validateAppName,
      },
    ],
    actions: [
      createAddManyAction("react-vite-basic"),
      modifyPackageJsonName,
      modifyWranglerTomlName,
      ...modifyTsConfigActions,
      installDependenciesAction("Basic React Vite"),
    ],
  });
}