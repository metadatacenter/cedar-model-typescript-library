// Rebuild every package format together: watching webpack alone leaves esm/ stale.
const { watch } = require('node:fs');
const { resolve } = require('node:path');
const { spawn } = require('node:child_process');
const root = resolve(__dirname, '..');
let child;
let pending = false;
let timer;
let stopping = false;
function build() {
  if (stopping) return;
  if (child) {
    pending = true;
    return;
  }
  pending = false;
  child = spawn(process.platform === 'win32' ? 'npm.cmd' : 'npm', ['run', 'build'], { cwd: root, stdio: 'inherit' });
  child.on('exit', () => {
    child = undefined;
    if (pending) build();
  });
}
const changed = () => {
  clearTimeout(timer);
  timer = setTimeout(build, 150);
};
const watchers = [
  ...['src', 'scripts'].map((directory) => watch(resolve(root, directory), { recursive: true }, changed)),
  ...['webpack.config.js', 'tsconfig.json', 'package.json', 'README.md'].map((file) => watch(resolve(root, file), changed)),
];
for (const signal of ['SIGINT', 'SIGTERM'])
  process.on(signal, () => {
    stopping = true;
    clearTimeout(timer);
    for (const watcher of watchers) watcher.close();
    child?.kill(signal);
  });
build();
