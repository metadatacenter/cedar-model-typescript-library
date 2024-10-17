import { elementTestNumbers, fieldTestNumbers, instanceTestNumbers, templateTestNumbers } from '../resources/generatedTestCases';
import { CedarArtifactType } from '../../src';
import { CompareFileSource } from '../../src/org/metadatacenter/model/cedar/types/helper-types/CompareFileSource';
import { CompareFileFormat } from '../../src/org/metadatacenter/model/cedar/types/helper-types/CompareFileFormat';
import { DiffComparator } from './DiffComparator';

const comparator: DiffComparator = new DiffComparator();
comparator.compare(
  fieldTestNumbers,
  CedarArtifactType.TEMPLATE_FIELD,
  CompareFileSource.JAVA_LIB,
  CompareFileSource.TS_LIB,
  CompareFileFormat.JSON,
);
comparator.compare(
  elementTestNumbers,
  CedarArtifactType.TEMPLATE_ELEMENT,
  CompareFileSource.JAVA_LIB,
  CompareFileSource.TS_LIB,
  CompareFileFormat.JSON,
);
comparator.compare(
  templateTestNumbers,
  CedarArtifactType.TEMPLATE,
  CompareFileSource.JAVA_LIB,
  CompareFileSource.TS_LIB,
  CompareFileFormat.JSON,
);
comparator.compare(
  instanceTestNumbers,
  CedarArtifactType.TEMPLATE_INSTANCE,
  CompareFileSource.JAVA_LIB,
  CompareFileSource.TS_LIB,
  CompareFileFormat.JSON,
);
