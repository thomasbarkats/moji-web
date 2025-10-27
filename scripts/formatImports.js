#!/usr/bin/env node

import fs from 'fs';
import { glob } from 'glob';

const config = {
  extensions: ['.ts', '.tsx', '.js', '.jsx'],
  rootDir: './src',
  newlinesAfterImports: 2,
  newlineBetweenExternalAndInternal: false,
  multilineAfterAll: true,
  groups: [
    { name: 'external', test: (s) => /^[a-z@]/.test(s.trim()) },
    { name: 'internal', test: (s) => s.startsWith('../') },
    { name: 'local', test: (s) => s.startsWith('./') && s.length > 2 },
    { name: 'dot', test: (s) => s === '.' || s === './' || s === './index' },
  ],
  priorities: ['type', 'side-effect', 'default', 'named'],
  maxLineLength: 100,
};

function isMultilineImport(importLine) {
  return /\n/.test(importLine);
}

function formatImportLine(importLine) {
  if (importLine.length <= config.maxLineLength) return importLine;
  const m = importLine.match(/import\s+\{([\s\S]+)\}\s+from\s+['"]([^'"]+)['"]/);
  if (!m) return importLine;
  const items = m[1].split(',').map(i => i.trim()).filter(Boolean);
  const source = m[2];
  const lines = items.map(i => `  ${i},`);
  return `import {\n${lines.join('\n')}\n} from '${source}';`;
}

function classifyImport(importLine) {
  const isOriginallyMultiline = isMultilineImport(importLine);
  const willBeFormatted = importLine.length > config.maxLineLength;

  const line = formatImportLine(importLine);
  const matchFrom = line.match(/from\s+['"]([^'"]+)['"]/s);
  const matchSide = line.match(/^\s*import\s+['"]([^'"]+)['"]/m);
  const source = (matchFrom && matchFrom[1]) || (matchSide && matchSide[1]) || '';
  const group = config.groups.find((g) => g.test(source))?.name || 'external';

  let kind = 'named';
  if (/^\s*import\s+type\s/.test(line)) kind = 'type';
  else if (/^\s*import\s+['"]/.test(line)) kind = 'side-effect';
  else if (/^\s*import\s+[^{}'"]+from/.test(line)) kind = 'default';

  const multiline = isOriginallyMultiline || willBeFormatted;

  return { line, source, group, kind, multiline };
}

function sortImports(imports) {
  const groups = {};
  const multilineImports = [];

  for (const imp of imports) {
    if (config.multilineAfterAll && imp.multiline) {
      multilineImports.push(imp);
    } else {
      if (!groups[imp.group]) groups[imp.group] = [];
      groups[imp.group].push(imp);
    }
  }

  const orderedGroups = config.groups.map((g) => g.name);
  const sortedLines = [];
  let isFirstGroup = true;

  for (const groupName of orderedGroups) {
    const group = groups[groupName];
    if (!group || group.length === 0) continue;

    if (!isFirstGroup && config.newlineBetweenExternalAndInternal && groupName === 'internal') {
      sortedLines.push({ line: '', isBlank: true });
    }

    const simple = group.filter((g) => !g.multiline);
    const multiline = group.filter((g) => g.multiline);

    const sortedSimple = simple.sort((a, b) => {
      const ia = config.priorities.indexOf(a.kind);
      const ib = config.priorities.indexOf(b.kind);
      if (ia !== ib) return ia - ib;
      return a.source.localeCompare(b.source);
    });

    const sortedMultiline = multiline.sort((a, b) => {
      const ia = config.priorities.indexOf(a.kind);
      const ib = config.priorities.indexOf(b.kind);
      if (ia !== ib) return ia - ib;
      return a.source.localeCompare(b.source);
    });

    sortedLines.push(...sortedSimple, ...sortedMultiline);
    isFirstGroup = false;
  }

  if (multilineImports.length > 0) {
    const sortedMultiline = multilineImports.sort((a, b) => {
      const ia = config.priorities.indexOf(a.kind);
      const ib = config.priorities.indexOf(b.kind);
      if (ia !== ib) return ia - ib;
      return a.source.localeCompare(b.source);
    });

    sortedLines.push(...sortedMultiline);
  }

  return sortedLines.map((i) => i.isBlank ? '' : i.line).join('\n');
}

function extractImportStatements(content) {
  const importRegex = /^\s*import[\s\S]+?;$/gm;
  const imports = [...content.matchAll(importRegex)].map((m) => m[0]);
  const rest = content.replace(importRegex, '').trimStart();
  return { imports, rest };
}

function processFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const { imports, rest } = extractImportStatements(content);
  if (!imports.length) return;
  const sorted = sortImports(imports.map(classifyImport));
  const result = sorted + '\n'.repeat(config.newlinesAfterImports + 1) + rest;
  if (result !== content) {
    fs.writeFileSync(filePath, result, 'utf8');
    console.log(`Imports sorted: ${filePath}`);
  }
}

function sortAllImports() {
  const pattern = `${config.rootDir}/**/*{${config.extensions.join(',')}}`;
  const files = glob.sync(pattern, { absolute: true });
  files.forEach(processFile);
}

sortAllImports();
