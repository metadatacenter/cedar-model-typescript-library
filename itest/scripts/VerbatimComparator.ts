import { CedarArtifactType } from '../../src';
import { CompareFileSource } from '../../src/org/metadatacenter/model/cedar/types/helper-types/CompareFileSource';
import { CompareFileFormat } from '../../src/org/metadatacenter/model/cedar/types/helper-types/CompareFileFormat';
import { TestResource } from '../TestResource';
import { TestUtil } from '../TestUtil';

export class VerbatimComparator {
  compare(
    testNumbers: number[],
    artifactType: CedarArtifactType,
    leftSource: CompareFileSource,
    rightSource: CompareFileSource,
    format: CompareFileFormat,
    isCompact: boolean = false,
  ) {
    let compared = 0;
    const skipped: number[] = [];
    let differing = 0;
    let failed = 0;

    for (const testNumber of testNumbers) {
      const testResource: TestResource = TestResource.artifact(testNumber, artifactType);
      let left: string;
      let right: string;
      try {
        left = TestUtil.readArtifact(testResource, leftSource, format, isCompact);
        right = TestUtil.readArtifact(testResource, rightSource, format, isCompact);
      } catch (error) {
        // A case with output from only one library is skipped, not failed.
        // Several are deliberate: boolean fields have no Java counterpart
        // because the Java library has no such type, and the newer external
        // authority types have not been generated on that side. Printing a
        // stack trace for each buried the one real diff among seven of them.
        if ((error as NodeJS.ErrnoException)?.code === 'ENOENT') {
          skipped.push(testNumber);
          continue;
        }
        console.error(`Failed to process ${artifactType.getYamlValue()} ${testNumber}!`, error);
        failed++;
        continue;
      }

      compared++;
      if (left.trim() !== right.trim()) {
        differing++;
        console.log('DIFF FOUND: ' + testResource);
      }
    }

    const skippedNote = skipped.length > 0 ? `, ${skipped.length} skipped — no output on one side: ${skipped.join(', ')}` : '';
    const compactNote = isCompact ? ' (compact)' : '';
    console.log(`${artifactType.getYamlValue()}${compactNote}: ${compared} compared, ${differing} differing${skippedNote}`);
    if (differing > 0 || failed > 0) {
      process.exitCode = 1;
    }
  }
}
