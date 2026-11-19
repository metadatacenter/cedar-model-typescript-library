const { readdirSync, readFileSync } = require('node:fs');
const { join, relative } = require('node:path');

// Jest has no forbidOnly. A focused test runs alone, the rest of its file is reported as skipped and
// the suite still passes, so a focused test anywhere a test can live fails the run before it starts.
const FOCUSED = /\b(?:describe|it|test)\.only\b|\b(?:fdescribe|fit)\s*\(/;
const isTestSource = (name, inTestTree) => name.endsWith('.ts') && (inTestTree || /\.(?:spec|test)\.ts$/.test(name));

module.exports = async (globalConfig) => {
  const root = globalConfig.rootDir;
  const focused = [];
  const scan = (directory, inTestTree) => {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      const path = join(directory, entry.name);
      if (entry.isDirectory()) {
        if (entry.name !== 'node_modules') scan(path, inTestTree);
      } else if (isTestSource(entry.name, inTestTree)) {
        readFileSync(path, 'utf8')
          .split('\n')
          .forEach((line, index) => {
            if (FOCUSED.test(line)) focused.push(`${relative(root, path)}:${index + 1}`);
          });
      }
    }
  };
  scan(join(root, 'src'), false);
  scan(join(root, 'test'), true);
  scan(join(root, 'itest'), true);
  if (focused.length > 0) {
    throw new Error(`A focused test runs alone while the suite passes. Remove the focus at ${focused.join(', ')}.`);
  }
};
