import { readdirSync, readFileSync, statSync } from 'node:fs';
import { extname, join, relative, resolve } from 'node:path';
import ts from 'typescript';

const sourceRoot = resolve('src');
const japanesePattern = /[\u3040-\u30ff\u3400-\u9fff]/;
const failures = [];

const fail = (message) => {
  failures.push(message);
};

const getPropertyName = (name) => {
  if (!name) return null;
  if (ts.isIdentifier(name) || ts.isStringLiteral(name) || ts.isNumericLiteral(name)) {
    return name.text;
  }
  return null;
};

const getObjectProperty = (objectNode, propertyName) => {
  for (const property of objectNode.properties) {
    if (!ts.isPropertyAssignment(property)) continue;

    const name = getPropertyName(property.name);
    if (name === propertyName && ts.isObjectLiteralExpression(property.initializer)) {
      return property.initializer;
    }
  }

  return null;
};

const unwrapExpression = (node) => {
  if (ts.isAsExpression(node) || ts.isSatisfiesExpression(node)) {
    return unwrapExpression(node.expression);
  }

  return node;
};

const extractStrings = (node, path = []) => {
  const target = unwrapExpression(node);
  const entries = new Map();

  if (ts.isStringLiteral(target) || ts.isNoSubstitutionTemplateLiteral(target)) {
    entries.set(path.join('.'), target.text);
    return entries;
  }

  if (ts.isArrayLiteralExpression(target)) {
    target.elements.forEach((element, index) => {
      for (const [key, value] of extractStrings(element, [...path, String(index)])) {
        entries.set(key, value);
      }
    });
    return entries;
  }

  if (ts.isObjectLiteralExpression(target)) {
    for (const property of target.properties) {
      if (!ts.isPropertyAssignment(property)) continue;

      const name = getPropertyName(property.name);
      if (!name) continue;

      for (const [key, value] of extractStrings(property.initializer, [...path, name])) {
        entries.set(key, value);
      }
    }
  }

  return entries;
};

const collectSourceFiles = (directory) => {
  const files = [];

  for (const entry of readdirSync(directory)) {
    const path = join(directory, entry);
    const stats = statSync(path);

    if (stats.isDirectory()) {
      files.push(...collectSourceFiles(path));
      continue;
    }

    if (['.ts', '.tsx'].includes(extname(path))) {
      files.push(path);
    }
  }

  return files;
};

const validateCopyPair = ({ filePath, label, jaNode, enNode }) => {
  const ja = extractStrings(jaNode);
  const en = extractStrings(enNode);
  const location = `${relative(process.cwd(), filePath)}:${label}`;

  for (const key of ja.keys()) {
    if (!en.has(key)) {
      fail(`${location} is missing en.${key}`);
    }
  }

  for (const key of en.keys()) {
    if (!ja.has(key)) {
      fail(`${location} is missing ja.${key}`);
    }
  }

  for (const [key, value] of [...ja, ...en]) {
    if (value.trim().length === 0) {
      fail(`${location}.${key} must not be empty`);
    }
  }

  for (const [key, value] of en) {
    if (japanesePattern.test(value)) {
      fail(`${location}.en.${key} contains Japanese text: "${value}"`);
    }
  }
};

let checkedPairs = 0;

for (const filePath of collectSourceFiles(sourceRoot)) {
  const source = ts.createSourceFile(
    filePath,
    readFileSync(filePath, 'utf8'),
    ts.ScriptTarget.Latest,
    true,
    filePath.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
  );

  const visit = (node) => {
    if (ts.isVariableDeclaration(node) && node.initializer) {
      const initializer = unwrapExpression(node.initializer);

      if (ts.isObjectLiteralExpression(initializer)) {
        const jaNode = getObjectProperty(initializer, 'ja');
        const enNode = getObjectProperty(initializer, 'en');

        if (jaNode && enNode) {
          checkedPairs += 1;
          const label = ts.isIdentifier(node.name) ? node.name.text : 'copy';
          validateCopyPair({ filePath, label, jaNode, enNode });
        }
      }
    }

    ts.forEachChild(node, visit);
  };

  visit(source);
}

if (checkedPairs === 0) {
  fail('No ja/en copy pairs were found.');
}

if (failures.length > 0) {
  console.error('i18n copy safety test failed:');
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log(`i18n copy safety checks passed (${checkedPairs} copy pairs).`);
