// Gates this library's YAML against the Java library's, over every artifact in the corpus and in both
// forms. The TypeScript side is regenerated from the corpus first, so the run measures the library as
// it stands; the Java side is read from the fixtures committed alongside it, which is what lets this
// run on a plain clone with no Java toolchain present.
//
// The artifacts below are known to differ, and the run passes only if exactly they do. An artifact
// that starts differing fails the build. One that stops differing fails it too, so that closing a
// divergence is recorded here rather than leaving an allowance nobody revisits. The reasons live in
// cedar-development/ops/BACKEND-RUNBOOK.md, under "YAML is a native artifact format".
import { elementTestNumbers, fieldTestNumbers, instanceTestNumbers, templateTestNumbers } from '../resources/generatedTestCases';
import { CedarArtifactType } from '../../src';
import { VerbatimComparator } from './VerbatimComparator';
import { CompareFileSource } from '../../src/org/metadatacenter/model/cedar/types/helper-types/CompareFileSource';
import { CompareFileFormat } from '../../src/org/metadatacenter/model/cedar/types/helper-types/CompareFileFormat';

// Nothing diverges. Every artifact in the corpus comes out of the two libraries byte for byte the
// same, in both forms, so any difference this run reports is a regression in one of them.
const KNOWN_DIVERGENCES: Array<{
  testNumbers: number[];
  artifactType: CedarArtifactType;
  full: number[];
  compact: number[];
}> = [
  { testNumbers: fieldTestNumbers, artifactType: CedarArtifactType.TEMPLATE_FIELD, full: [], compact: [] },
  { testNumbers: elementTestNumbers, artifactType: CedarArtifactType.TEMPLATE_ELEMENT, full: [], compact: [] },
  { testNumbers: templateTestNumbers, artifactType: CedarArtifactType.TEMPLATE, full: [], compact: [] },
  { testNumbers: instanceTestNumbers, artifactType: CedarArtifactType.TEMPLATE_INSTANCE, full: [], compact: [] },
];

const comparator = new VerbatimComparator();
for (const { testNumbers, artifactType, full, compact } of KNOWN_DIVERGENCES) {
  comparator.compare(testNumbers, artifactType, CompareFileSource.TS_LIB, CompareFileSource.JAVA_LIB, CompareFileFormat.YAML, false, full);
  comparator.compare(
    testNumbers,
    artifactType,
    CompareFileSource.TS_LIB,
    CompareFileSource.JAVA_LIB,
    CompareFileFormat.YAML,
    true,
    compact,
  );
}

if (process.exitCode) {
  console.log(
    '\nThe two libraries no longer diverge exactly where they are recorded to. Regenerate both sides if a\n' +
      'writer changed, or update this script and the backend runbook if a divergence opened or closed.',
  );
}
