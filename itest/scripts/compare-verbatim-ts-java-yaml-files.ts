import { elementTestNumbers, fieldTestNumbers, templateTestNumbers } from '../resources/generatedTestCases';
import { CedarArtifactType } from '../../src';
import { VerbatimComparator } from './VerbatimComparator';
import { CompareFileSource } from '../../src/org/metadatacenter/model/cedar/types/helper-types/CompareFileSource';
import { CompareFileFormat } from '../../src/org/metadatacenter/model/cedar/types/helper-types/CompareFileFormat';

const comparator: VerbatimComparator = new VerbatimComparator();
comparator.compare(
  fieldTestNumbers,
  CedarArtifactType.TEMPLATE_FIELD,
  CompareFileSource.TS_LIB,
  CompareFileSource.JAVA_LIB,
  CompareFileFormat.YAML,
);
comparator.compare(
  elementTestNumbers,
  CedarArtifactType.TEMPLATE_ELEMENT,
  CompareFileSource.TS_LIB,
  CompareFileSource.JAVA_LIB,
  CompareFileFormat.YAML,
);
comparator.compare(
  templateTestNumbers,
  CedarArtifactType.TEMPLATE,
  CompareFileSource.TS_LIB,
  CompareFileSource.JAVA_LIB,
  CompareFileFormat.YAML,
);
