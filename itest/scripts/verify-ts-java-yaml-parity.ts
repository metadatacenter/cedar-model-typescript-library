// Gates this library's YAML against the Java library's, over every artifact in the corpus and in both
// forms. The TypeScript side is regenerated from the corpus first, so the run measures the library as
// it stands; the Java side is read from the fixtures committed alongside it, which is what lets this
// run on a plain clone with no Java toolchain present.
//
// All corpus artifacts must match in both forms, the CEE suite's templates and instances among them.
// A CEE suite case only one library renders is an open defect listed in ceeSuiteParity.ts.
import { elementTestNumbers, fieldTestNumbers, instanceTestNumbers, templateTestNumbers } from '../resources/generatedTestCases';
import { CedarArtifactType } from '../../src';
import { VerbatimComparator } from './VerbatimComparator';
import { verifyCeeSuiteParity } from './ceeSuiteParity';
import { CompareFileSource } from '../../src/org/metadatacenter/model/cedar/types/helper-types/CompareFileSource';
import { CompareFileFormat } from '../../src/org/metadatacenter/model/cedar/types/helper-types/CompareFileFormat';

const kinds: Array<[number[], CedarArtifactType]> = [
  [fieldTestNumbers, CedarArtifactType.TEMPLATE_FIELD],
  [elementTestNumbers, CedarArtifactType.TEMPLATE_ELEMENT],
  [templateTestNumbers, CedarArtifactType.TEMPLATE],
  [instanceTestNumbers, CedarArtifactType.TEMPLATE_INSTANCE],
];

const comparator = new VerbatimComparator();
for (const [testNumbers, artifactType] of kinds) {
  for (const compact of [false, true]) {
    comparator.compare(testNumbers, artifactType, CompareFileSource.TS_LIB, CompareFileSource.JAVA_LIB, CompareFileFormat.YAML, compact);
  }
}
verifyCeeSuiteParity('yaml');
verifyCeeSuiteParity('compact');

if (process.exitCode) {
  console.log(
    '\nJava and TypeScript YAML differ. Inspect the writer output and regenerate the affected fixtures after resolving the difference.',
  );
}
