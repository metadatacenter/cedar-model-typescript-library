import { YamlKeyTracking } from './YamlKeyTracking';
import { YamlSourcePolicy } from './YamlSourcePolicy';
import { JsonNode } from '../../../model/cedar/types/basic-types/JsonNode';
import { CedarArtifactId } from '../../../model/cedar/types/cedar-types/CedarArtifactId';
import { CedarArtifactType } from '../../../model/cedar/types/cedar-types/CedarArtifactType';
import { CedarUser } from '../../../model/cedar/types/cedar-types/CedarUser';
import { IsoDate } from '../../../model/cedar/types/wrapped-types/IsoDate';
import { YamlArtifactType } from '../../../model/cedar/types/wrapped-types/YamlArtifactType';
import { YamlReaderBehavior } from '../../../behavior/YamlReaderBehavior';
import { YamlArtifactParsingResult } from '../../../model/cedar/util/compare/YamlArtifactParsingResult';
import { ComparisonError } from '../../../model/cedar/util/compare/ComparisonError';
import { YamlComparisonErrorType } from '../../../model/cedar/util/compare/YamlComparisonErrorType';
import { JsonPath } from '../../../model/cedar/util/path/JsonPath';
import { YamlKeys } from '../../../model/cedar/constants/YamlKeys';
import { ElementInstance } from '../../../model/cedar/template-instance/ElementInstance';
import { AttributeValueNamePolicy } from '../../../model/cedar/template-instance/AttributeValueNamePolicy';
import { ReaderUtil } from '../ReaderUtil';
import { YamlAbstractArtifactReader } from './YamlAbstractArtifactReader';
import { YamlTemplateInstanceReader } from './YamlTemplateInstanceReader';
import { YamlElementInstanceReaderResult } from './YamlElementInstanceReaderResult';

/**
 * Read an element instance that stands on its own, as Java's `YamlArtifactReader.readElementInstanceArtifact`
 * reads one. The document states `type: element-instance`, and may state a name, a description, its
 * identifier, its classes under `instanceType` and the four provenance keys. Its children and its
 * attribute-value fields are read as a nested element's are. It names no template, and a key the
 * reader does not read refuses the document.
 */
export class YamlElementInstanceReader extends YamlAbstractArtifactReader {
  protected knownArtifactType: CedarArtifactType = CedarArtifactType.ELEMENT_INSTANCE;
  private readonly dataReader: YamlTemplateInstanceReader;

  private constructor(behavior: YamlReaderBehavior) {
    super(behavior);
    this.dataReader = YamlTemplateInstanceReader.getForBehavior(behavior);
  }

  public static getStrict(): YamlElementInstanceReader {
    return new YamlElementInstanceReader(YamlReaderBehavior.STRICT);
  }

  public static getForBehavior(behavior: YamlReaderBehavior): YamlElementInstanceReader {
    return new YamlElementInstanceReader(behavior);
  }

  public readFromString(instanceSourceString: string): YamlElementInstanceReaderResult {
    return this.readFromObject(YamlSourcePolicy.parse(instanceSourceString));
  }

  public readFromObject(sourceObject: JsonNode): YamlElementInstanceReaderResult {
    return YamlKeyTracking.read(sourceObject, '', (instanceSourceObject) => {
      const parsingResult = new YamlArtifactParsingResult();
      const instance = ElementInstance.buildEmptyWithNullValues();
      const source = instanceSourceObject ?? {};
      YamlAbstractArtifactReader.refuseNullAndEmptyValues(source, '', true);
      YamlAbstractArtifactReader.assertType(source, YamlArtifactType.ELEMENT_INSTANCE, 'An element instance');

      // Unlike a template instance's, an element instance's name is optional, as in Java's reader.
      YamlAbstractArtifactReader.assertText(source, YamlKeys.name, '');
      instance.schema_name = ReaderUtil.getString(source, YamlKeys.name);
      YamlAbstractArtifactReader.assertText(source, YamlKeys.description, '');
      instance.schema_description = ReaderUtil.getString(source, YamlKeys.description) ?? '';
      instance.descriptionWasAbsent = ReaderUtil.getString(source, YamlKeys.description) === null;
      YamlAbstractArtifactReader.refuseEmptyIdentifier(source, YamlKeys.createdBy);
      YamlAbstractArtifactReader.refuseEmptyIdentifier(source, YamlKeys.modifiedBy);
      instance.pav_createdBy = CedarUser.forValue(ReaderUtil.getString(source, YamlKeys.createdBy));
      instance.pav_createdOn = IsoDate.forValue(ReaderUtil.getString(source, YamlKeys.createdOn));
      instance.oslc_modifiedBy = CedarUser.forValue(ReaderUtil.getString(source, YamlKeys.modifiedBy));
      instance.pav_lastUpdatedOn = IsoDate.forValue(ReaderUtil.getString(source, YamlKeys.modifiedOn));

      instance.dataContainer = this.dataReader.readElementInstanceData(source);
      instance.at_id = CedarArtifactId.forValue(instance.dataContainer.id);
      for (const conflict of AttributeValueNamePolicy.findConflicts(instance.dataContainer, 'element', true)) {
        parsingResult.addBlueprintComparisonError(
          new ComparisonError(
            'YamlElementInstanceReader',
            YamlComparisonErrorType.VALUE_MISMATCH,
            new JsonPath(...AttributeValueNamePolicy.locationOf(conflict)),
            'a unique, non-reserved attribute-value name',
            conflict.name,
          ),
        );
      }
      return new YamlElementInstanceReaderResult(instance, parsingResult, sourceObject ?? {});
    });
  }
}
