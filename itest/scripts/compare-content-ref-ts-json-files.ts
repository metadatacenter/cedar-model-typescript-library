import { elementTestNumbers, fieldTestNumbers, templateTestNumbers } from '../resources/generatedTestCases';
import { CedarArtifactType } from '../../src';
import { CompareFileSource } from '../../src/org/metadatacenter/model/cedar/types/helper-types/CompareFileSource';
import { CompareFileFormat } from '../../src/org/metadatacenter/model/cedar/types/helper-types/CompareFileFormat';
import { ContentComparator } from './ContentComparator';

const comparator: ContentComparator = new ContentComparator();
comparator.compare(
  fieldTestNumbers,
  CedarArtifactType.TEMPLATE_FIELD,
  CompareFileSource.REF,
  CompareFileSource.TS_LIB,
  CompareFileFormat.JSON,
);
comparator.compare(
  elementTestNumbers,
  CedarArtifactType.TEMPLATE_ELEMENT,
  CompareFileSource.REF,
  CompareFileSource.TS_LIB,
  CompareFileFormat.JSON,
);
comparator.compare(
  templateTestNumbers,
  CedarArtifactType.TEMPLATE,
  CompareFileSource.REF,
  CompareFileSource.TS_LIB,
  CompareFileFormat.JSON,
);
