import assert from 'node:assert/strict';
import {spawn, execFile} from 'node:child_process';
import {mkdtemp, readFile, rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createInterface} from 'node:readline';
import {promisify} from 'node:util';

/** Start the real Java validator and reader. Schema drift and a missing toolchain fail the gate. */
export async function createJavaOracle(schemaDigests, stringify = JSON.stringify) {
  const directory = await mkdtemp(join(tmpdir(), 'cedar-schema-oracle-'));
  let child;
  try {
    const classpathFile = join(directory, 'classpath');
    await promisify(execFile)('mvn', ['-q', '-f', fileURLToPath(new URL('pom.xml', import.meta.url)),
      'org.apache.maven.plugins:maven-dependency-plugin:3.8.1:build-classpath', `-Dmdep.outputFile=${classpathFile}`],
    {timeout: 300000, maxBuffer: 4 * 1024 * 1024});
    const classpath = (await readFile(classpathFile, 'utf8')).trim();
    child = spawn(process.env.JAVA_HOME ? join(process.env.JAVA_HOME, 'bin/java') : 'java',
      ['--class-path', classpath, fileURLToPath(new URL('CedarSchemaOracle.java', import.meta.url))],
      {stdio: ['pipe', 'pipe', 'pipe']});
    let stderr = '', failure, sequence = 0;
    const waiting = new Map();
    child.stderr.on('data', data => { stderr = (stderr + data).slice(-16000); });
    const rejectAll = error => {
      failure = error;
      for (const waiter of waiting.values()) {clearTimeout(waiter.timer); waiter.reject(error);}
      waiting.clear();
    };
    const expect = seq => new Promise((resolve, reject) => {
      if (failure) return reject(failure);
      const timer = setTimeout(() => {rejectAll(new Error(`Java oracle timed out: ${stderr}`)); child.kill();}, 60000);
      waiting.set(seq, {resolve, reject, timer});
    });
    const hello = expect('hello');
    const lines = createInterface({input: child.stdout});
    lines.on('line', line => {
      try {
        const value = JSON.parse(line), key = value.seq ?? 'hello', waiter = waiting.get(key);
        if (!waiter) throw new Error('Unexpected Java oracle response: ' + line);
        clearTimeout(waiter.timer); waiting.delete(key); waiter.resolve(value);
      } catch (error) {rejectAll(error); child.kill();}
    });
    child.on('error', rejectAll);
    child.on('exit', code => rejectAll(new Error(`Java oracle exited (${code}): ${stderr}`)));
    const identity = await hello;
    assert.equal(identity.java, 17, 'The authoring conformance gate requires Java 17');
    assert.deepEqual(identity.schemas, schemaDigests, 'Browser meta-schemas differ from the Java libraries under test. Sync the canonical schemas and rebuild Java.');
    return {
      async validate(artifact, kind) {
        const seq = ++sequence, result = expect(seq);
        child.stdin.write(stringify({seq, kind, artifact}) + '\n');
        const verdict = await result;
        assert.equal(verdict.exception, undefined, 'Java oracle threw: ' + verdict.exception);
        return verdict;
      },
      async close() {child.stdin.end(); child.kill(); lines.close(); await rm(directory, {recursive: true, force: true});},
    };
  } catch (error) {
    child?.kill(); await rm(directory, {recursive: true, force: true}); throw error;
  }
}
