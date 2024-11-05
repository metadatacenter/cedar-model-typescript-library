import { execSync } from 'child_process';
import { CedarArtifactType } from '../../src';
import { CompareFileSource } from '../../src/org/metadatacenter/model/cedar/types/helper-types/CompareFileSource';
import { CompareFileFormat } from '../../src/org/metadatacenter/model/cedar/types/helper-types/CompareFileFormat';
import { TestResource } from '../TestResource';
import { TestUtil } from '../TestUtil';

export class DiffComparator {
  compare(
    testNumbers: number[],
    artifactType: CedarArtifactType,
    leftSource: CompareFileSource,
    rightSource: CompareFileSource,
    format: CompareFileFormat,
  ) {
    for (const testNumber of testNumbers) {
      const testResource: TestResource = TestResource.artifact(testNumber, artifactType);
      const leftFile = TestUtil.getArtifactPath(testResource, leftSource, format, false);
      const rightFile = TestUtil.getArtifactPath(testResource, rightSource, format, false);

      console.log('----------------------------------');
      console.log('\n\n\n');
      console.log(`Comparing files:\n${leftFile}\n${rightFile}`);

      try {
        // Run OS diff command on the two files
        const diffCommand = `diff ${leftFile} ${rightFile}`;
        try {
          const diffOutput = execSync(diffCommand, { encoding: 'utf8', stdio: 'pipe' });
          if (diffOutput) {
            console.log(`DIFF FOUND for ${artifactType.getYamlValue()} ${testNumber}:\n${diffOutput}`);
          } else {
            console.log(`No differences found for ${artifactType.getYamlValue()} ${testNumber}.`);
          }
        } catch (error: any) {
          // Check if the error is a result of differences found (exit code 1)
          if (error.status === 1 && error.stdout) {
            console.log(`DIFF FOUND for ${artifactType.getYamlValue()} ${testNumber}:\n${error.stdout}`);
          } else {
            // Any other error (non-diff related)
            console.error(`Error running diff for ${artifactType.getYamlValue()} ${testNumber}:`, error.message);
          }
        }
      } catch (error: any) {
        console.error(`Failed to process ${artifactType.getYamlValue()} ${testNumber}!`, error.message);
      }
      console.log('\n\n\n');
    }
  }
}
