// Compares the compact YAML the two libraries generate for the same artifact, byte for byte. The
// full-form comparison is its sister script; compact was never compared, which is how the missing
// identifier in this library's compact output went unnoticed for as long as it did.
import { elementTestNumbers, fieldTestNumbers, instanceTestNumbers, templateTestNumbers } from '../resources/generatedTestCases';
import { CedarArtifactType } from '../../src';
import { VerbatimComparator } from './VerbatimComparator';
import { CompareFileSource } from '../../src/org/metadatacenter/model/cedar/types/helper-types/CompareFileSource';
import { CompareFileFormat } from '../../src/org/metadatacenter/model/cedar/types/helper-types/CompareFileFormat';

const comparator: VerbatimComparator = new VerbatimComparator();
const kinds: Array<[number[], CedarArtifactType]> = [
  [fieldTestNumbers, CedarArtifactType.TEMPLATE_FIELD],
  [elementTestNumbers, CedarArtifactType.TEMPLATE_ELEMENT],
  [templateTestNumbers, CedarArtifactType.TEMPLATE],
  [instanceTestNumbers, CedarArtifactType.TEMPLATE_INSTANCE],
];

for (const [testNumbers, artifactType] of kinds) {
  comparator.compare(testNumbers, artifactType, CompareFileSource.TS_LIB, CompareFileSource.JAVA_LIB, CompareFileFormat.YAML, true);
}
