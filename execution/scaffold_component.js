/**
 * Execution Script: Scaffold Component
 * Usage: node execution/scaffold_component.js --name=ComponentName --path=optional/subpath
 * 
 * Creates:
 * components/[subpath]/[kebab-case-name].tsx
 */

const fs = require('fs');
const path = require('path');

// Helper to convert PascalCase to kebab-case
const toKebabCase = (str) => {
    return str.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
};

const args = process.argv.slice(2);
const nameArg = args.find(arg => arg.startsWith('--name='));
const pathArg = args.find(arg => arg.startsWith('--path='));

if (!nameArg) {
    console.error('Error: Please provide a component name via --name=MyComponent');
    process.exit(1);
}

const componentName = nameArg.split('=')[1];
const subDir = pathArg ? pathArg.split('=')[1] : '';
const fileName = toKebabCase(componentName);

// Target Directory
const targetDir = path.join(process.cwd(), 'components', subDir);

// Ensure directory exists
if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
}

// File Content
const fileContent = `"use client";

import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';;

interface ${componentName}Props {
  className?: string;
}

export function ${componentName}({ className }: ${componentName}Props) {
  const { t } = useTranslation();

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      <h2 className="text-xl font-bold">{t('demo.title', '${componentName}')}</h2>
      <p className="text-muted-foreground">{t('demo.description', 'Component scaffolding successful')}</p>
    </div>
  );
}
`;

const filePath = path.join(targetDir, `${fileName}.tsx`);

if (fs.existsSync(filePath)) {
    console.error(`Error: File already exists at ${filePath}`);
    process.exit(1);
}

fs.writeFileSync(filePath, fileContent);
console.log(`✅ Scaffolding complete: ${filePath}`);
