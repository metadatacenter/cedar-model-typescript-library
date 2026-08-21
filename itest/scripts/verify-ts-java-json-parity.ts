import { isDeepStrictEqual } from 'node:util';
import { CedarArtifactType } from '../../src';
import { elementTestNumbers, fieldTestNumbers, instanceTestNumbers, templateTestNumbers } from '../resources/generatedTestCases';
import { TestResource } from '../TestResource';
import { TestUtil } from '../TestUtil';

const cohorts: Array<{ type: CedarArtifactType; numbers: number[] }> = [
  { type: CedarArtifactType.TEMPLATE_FIELD, numbers: fieldTestNumbers },
  { type: CedarArtifactType.TEMPLATE_ELEMENT, numbers: elementTestNumbers },
  { type: CedarArtifactType.TEMPLATE, numbers: templateTestNumbers },
  { type: CedarArtifactType.TEMPLATE_INSTANCE, numbers: instanceTestNumbers },
];

let failures = 0;
for (const { type, numbers } of cohorts) {
  const differing: number[] = [];
  for (const number of numbers) {
    const resource = TestResource.artifact(number, type);
    try {
      const javaJson = JSON.parse(TestUtil.readJavaLibJson(resource));
      const typeScriptJson = JSON.parse(TestUtil.readTSLibJson(resource));
      if (!isDeepStrictEqual(typeScriptJson, javaJson)) differing.push(number);
    } catch (error) {
      console.error(`Could not compare ${resource}:`, error);
      failures++;
    }
  }

  console.log(`${type.getYamlValue()}: ${numbers.length} compared, ${differing.length} structurally differing`);
  for (const number of differing) console.error(`  DIVERGENCE: ${TestResource.artifact(number, type)}`);
  failures += differing.length;
}

if (failures > 0) {
  console.error(`\nJava/TypeScript JSON parity failed with ${failures} problem${failures === 1 ? '' : 's'}.`);
  process.exitCode = 1;
} else {
  console.log('\nJava and TypeScript JSON output is structurally identical for all shared artifacts.');
}
