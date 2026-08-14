import { CedarArtifactType } from '../../src';
import { CompareFileSource } from '../../src/org/metadatacenter/model/cedar/types/helper-types/CompareFileSource';
import { CompareFileFormat } from '../../src/org/metadatacenter/model/cedar/types/helper-types/CompareFileFormat';
import { TestResource } from '../TestResource';
import { TestUtil } from '../TestUtil';

export class VerbatimComparator {
  /**
   * Compares one library's output against the other's, artifact by artifact.
   *
   * `expectedDifferences` names the artifacts already known to differ, so a run can be a gate rather
   * than a report: any artifact that starts differing fails, and so does any that stops, since a
   * closed divergence should be recorded rather than left as a standing allowance. Passing no set
   * demands that nothing differ at all.
   */
  compare(
    testNumbers: number[],
    artifactType: CedarArtifactType,
    leftSource: CompareFileSource,
    rightSource: CompareFileSource,
    format: CompareFileFormat,
    isCompact: boolean = false,
    expectedDifferences: number[] | null = null,
  ) {
    let compared = 0;
    const skipped: number[] = [];
    const differing: number[] = [];
    let failed = 0;

    for (const testNumber of testNumbers) {
      const testResource: TestResource = TestResource.artifact(testNumber, artifactType);
      let left: string;
      let right: string;
      try {
        left = TestUtil.readArtifact(testResource, leftSource, format, isCompact);
        right = TestUtil.readArtifact(testResource, rightSource, format, isCompact);
      } catch (error) {
        // A case with output from only one library is skipped, not failed. Printing a stack trace for
        // each buried the one real diff among the several deliberate ones.
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
        differing.push(testNumber);
      }
    }

    const kind = `${artifactType.getYamlValue()}${isCompact ? ' (compact)' : ''}`;
    const skippedNote = skipped.length > 0 ? `, ${skipped.length} skipped — no output on one side: ${skipped.join(', ')}` : '';
    console.log(`${kind}: ${compared} compared, ${differing.length} differing${skippedNote}`);

    if (expectedDifferences === null) {
      differing.forEach((testNumber) => console.log(`  DIFF FOUND: ${TestResource.artifact(testNumber, artifactType)}`));
      if (differing.length > 0 || failed > 0) {
        process.exitCode = 1;
      }
      return;
    }

    const unexpected = differing.filter((testNumber) => !expectedDifferences.includes(testNumber));
    const resolved = expectedDifferences.filter((testNumber) => !differing.includes(testNumber));
    unexpected.forEach((testNumber) => console.log(`  NEW DIVERGENCE: ${TestResource.artifact(testNumber, artifactType)}`));
    resolved.forEach((testNumber) =>
      console.log(`  NO LONGER DIVERGING: ${TestResource.artifact(testNumber, artifactType)} — record it as closed`),
    );
    if (unexpected.length > 0 || resolved.length > 0 || failed > 0) {
      process.exitCode = 1;
    }
  }
}
