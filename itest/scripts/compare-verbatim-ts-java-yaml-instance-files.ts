import { instanceTestNumbers } from '../resources/generatedTestCases';
import { CedarArtifactType } from '../../src';
import { VerbatimComparator } from './VerbatimComparator';
import { CompareFileSource } from '../../src/org/metadatacenter/model/cedar/types/helper-types/CompareFileSource';
import { CompareFileFormat } from '../../src/org/metadatacenter/model/cedar/types/helper-types/CompareFileFormat';

new VerbatimComparator().compare(
  instanceTestNumbers,
  CedarArtifactType.TEMPLATE_INSTANCE,
  CompareFileSource.TS_LIB,
  CompareFileSource.JAVA_LIB,
  CompareFileFormat.YAML,
);

new VerbatimComparator().compare(
  instanceTestNumbers,
  CedarArtifactType.TEMPLATE_INSTANCE,
  CompareFileSource.TS_LIB,
  CompareFileSource.JAVA_LIB,
  CompareFileFormat.YAML,
  true,
);
