// Keep module boundaries for bundlers. The existing single-file CJS, ESM and UMD
// outputs remain available to hosts that copy a script without its dependencies.
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
const webpack = require('webpack');

const root = path.resolve(__dirname, '..');
const source = path.join(root, 'src');
const output = path.join(root, 'dist/esm');
const configuration = ts.readConfigFile(path.join(root, 'tsconfig.json'), ts.sys.readFile);
if (configuration.error) throw new Error(ts.flattenDiagnosticMessageText(configuration.error.messageText, '\n'));
const parsed = ts.parseJsonConfigFileContent(configuration.config, ts.sys, root, {
  module: ts.ModuleKind.ESNext,
  moduleResolution: ts.ModuleResolutionKind.Bundler,
  outDir: output,
  declaration: false,
  declarationMap: false,
});

// Rewrite before emission so source maps still describe the emitted module.
const imports = (context) => (file) => {
  const location = path.join(output, path.relative(source, file.fileName));
  const specifier = (value) => {
    if (value === 'yaml') {
      const relative = path.relative(path.dirname(location), path.join(output, 'vendor/yaml/index.js')).split(path.sep).join('/');
      return relative.startsWith('.') ? relative : './' + relative;
    }
    if (value.startsWith('.')) return value.endsWith('.js') ? value : value + '.js';
    throw new Error(`Unpackaged runtime dependency ${value} in ${file.fileName}`);
  };
  const visit = (node) => {
    if (ts.isImportDeclaration(node) && ts.isStringLiteral(node.moduleSpecifier)) {
      return context.factory.updateImportDeclaration(
        node,
        node.modifiers,
        node.importClause,
        context.factory.createStringLiteral(specifier(node.moduleSpecifier.text)),
        node.attributes,
      );
    }
    if (ts.isExportDeclaration(node) && node.moduleSpecifier && ts.isStringLiteral(node.moduleSpecifier)) {
      return context.factory.updateExportDeclaration(
        node,
        node.modifiers,
        node.isTypeOnly,
        node.exportClause,
        context.factory.createStringLiteral(specifier(node.moduleSpecifier.text)),
        node.attributes,
      );
    }
    return ts.visitEachChild(node, visit, context);
  };
  return ts.visitNode(file, visit);
};
const program = ts.createProgram(parsed.fileNames, parsed.options);
const result = program.emit(undefined, undefined, undefined, false, { after: [imports] });
const diagnostics = [...parsed.errors, ...ts.getPreEmitDiagnostics(program), ...result.diagnostics];
if (diagnostics.length)
  throw new Error(
    ts.formatDiagnosticsWithColorAndContext(diagnostics, {
      getCanonicalFileName: (file) => file,
      getCurrentDirectory: () => root,
      getNewLine: () => '\n',
    }),
  );
fs.writeFileSync(path.join(output, 'package.json'), JSON.stringify({ type: 'module', sideEffects: false }) + '\n');

// Vendor the same YAML browser implementation the standalone webpack builds use.
// It needs no extra install or network request and retains its own ESM boundaries.
const yaml = path.dirname(require.resolve('yaml/package.json'));
fs.cpSync(path.join(yaml, 'browser'), path.join(output, 'vendor/yaml'), { recursive: true });
fs.copyFileSync(path.join(yaml, 'LICENSE'), path.join(output, 'vendor/yaml/LICENSE'));

// The previous webpack ESM entries expose a default namespace as well as named
// exports. Keep that contract (including Vite's CommonJS interop) without making
// named-import consumers retain the namespace or any unused implementation.
for (const entry of ['index', 'policy', 'schema']) {
  fs.writeFileSync(
    path.join(output, entry + '-namespace.js'),
    `import * as api from './${entry}.js';\nexport * from './${entry}.js';\nexport default api;\n`,
  );
}

// AJV's checked-in validators are CommonJS. Bundle only those files and their tiny
// AJV runtime helpers; keep SchemaFormats external so all three entries share the
// same policies and class identities. No schema or validation rule is changed.
const generated = 'org/metadatacenter/model/cedar/validation/generated';
const compiler = webpack(
  ['artifact-schemas', 'constraint-links'].map((name) => ({
    mode: 'production',
    entry: path.join(source, generated, name + '.js'),
    output: { path: path.join(output, generated), filename: name + '.js', library: { type: 'modern-module' } },
    experiments: { outputModule: true },
    externalsType: 'module',
    externals: { '../SchemaFormats': '../SchemaFormats.js' },
    optimization: { minimize: false },
    devtool: 'source-map',
    performance: false,
  })),
);
compiler.run((error, stats) => {
  compiler.close((closeError) => {
    if (error || closeError || stats.hasErrors()) {
      console.error(error || closeError || stats.toString({ all: false, errors: true }));
      process.exitCode = 1;
    } else console.log('Built modular ESM entries with shared policies and vendored YAML.');
  });
});
