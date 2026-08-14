// Gates this library's YAML against the Java library's, over every artifact in the corpus and in both
// forms. The TypeScript side is regenerated from the corpus first, so the run measures the library as
// it stands; the Java side is read from the fixtures committed alongside it, which is what lets this
// run on a plain clone with no Java toolchain present.
//
// The artifacts below are known to differ, and the run passes only if exactly they do. An artifact
// that starts differing fails the build. One that stops differing fails it too, so that closing a
// divergence is recorded here rather than leaving an allowance nobody revisits. The reasons live in
// cedar-development/ops/MODEL-LIBRARY-PARITY.md.
import { elementTestNumbers, fieldTestNumbers, instanceTestNumbers, templateTestNumbers } from '../resources/generatedTestCases';
import { CedarArtifactType } from '../../src';
import { VerbatimComparator } from './VerbatimComparator';
import { CompareFileSource } from '../../src/org/metadatacenter/model/cedar/types/helper-types/CompareFileSource';
import { CompareFileFormat } from '../../src/org/metadatacenter/model/cedar/types/helper-types/CompareFileFormat';

// The value-constraint key naming: this library writes acronym / ontologyName / termLabel / iri /
// maxDepth where the Java library writes sourceAcronym / sourceName. Each library refuses the other's
// document for these, so the divergence is a model-owner decision rather than a rendering detail.
const KNOWN_DIVERGENCES: Array<{
  testNumbers: number[];
  artifactType: CedarArtifactType;
  full: number[];
  compact: number[];
}> = [
  { testNumbers: fieldTestNumbers, artifactType: CedarArtifactType.TEMPLATE_FIELD, full: [], compact: [] },
  { testNumbers: elementTestNumbers, artifactType: CedarArtifactType.TEMPLATE_ELEMENT, full: [6], compact: [6] },
  {
    testNumbers: templateTestNumbers,
    artifactType: CedarArtifactType.TEMPLATE,
    full: [7, 9, 22, 23, 24, 28, 29, 30, 35, 36],
    // Template 22's difference shows only in the full form.
    compact: [7, 9, 23, 24, 28, 29, 30, 35, 36],
  },
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
      'writer changed, or update this script and MODEL-LIBRARY-PARITY.md if a divergence opened or closed.',
  );
}
