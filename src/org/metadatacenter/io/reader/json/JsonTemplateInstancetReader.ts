import { CedarArtifactType } from '../../../model/cedar/types/cedar-types/CedarArtifactType';
import { JsonNode } from '../../../model/cedar/types/basic-types/JsonNode';
import { JsonArtifactParsingResult } from '../../../model/cedar/util/compare/JsonArtifactParsingResult';
import { JsonPath } from '../../../model/cedar/util/path/JsonPath';
import { JsonReaderBehavior } from '../../../behavior/JsonReaderBehavior';
import { JsonAbstractInstanceArtifactReader } from './JsonAbstractInstanceArtifactReader';
import { TemplateInstance } from '../../../model/cedar/template-instance/TemplateInstance';
import { JsonTemplateInstanceReaderResult } from './JsonTemplateInstanceReaderResult';
import { ReaderUtil } from '../ReaderUtil';
import { JsonSchema } from '../../../model/cedar/constants/JsonSchema';
import { InstanceDataContainer } from '../../../model/cedar/template-instance/InstanceDataContainer';
import { InstanceDataStringAtom } from '../../../model/cedar/template-instance/InstanceDataStringAtom';
import { InstanceDataAtomList } from '../../../model/cedar/template-instance/InstanceDataAtomList';
import { InstanceDataLinkAtom } from '../../../model/cedar/template-instance/InstanceDataLinkAtom';
import { InstanceDataAtomType } from '../../../model/cedar/template-instance/InstanceDataAtomType';
import { InstanceDataEmptyAtom } from '../../../model/cedar/template-instance/InstanceDataEmptyAtom';
import { InstanceDataControlledAtom } from '../../../model/cedar/template-instance/InstanceDataControlledAtom';
import { InstanceDataTypedAtom } from '../../../model/cedar/template-instance/InstanceDataTypedAtom';
import { InstanceDataEmptyNode } from '../../../model/cedar/template-instance/InstanceDataEmptyNode';
import { InstanceDataAttributeValueFieldName } from '../../../model/cedar/template-instance/InstanceDataAttributeValueFieldName';
import { InstanceDataAttributeValueField } from '../../../model/cedar/template-instance/InstanceDataAttributeValueField';

export class JsonTemplateInstanceReader extends JsonAbstractInstanceArtifactReader {
  protected knownArtifactType: CedarArtifactType = CedarArtifactType.TEMPLATE_INSTANCE;
  protected knownKeys = {
    [JsonSchema.atId]: true,
    [JsonSchema.oslcModifiedBy]: true,
    [JsonSchema.pavLastUpdatedOn]: true,
    [JsonSchema.pavCreatedBy]: true,
    [JsonSchema.pavCreatedOn]: true,
    [JsonSchema.schemaDescription]: true,
    [JsonSchema.schemaName]: true,
    [JsonSchema.schemaIsBasedOn]: true,
    [JsonSchema.atContext]: true,
  };

  private constructor(behavior: JsonReaderBehavior) {
    super(behavior);
  }

  public static getStrict(): JsonTemplateInstanceReader {
    return new JsonTemplateInstanceReader(JsonReaderBehavior.STRICT);
  }

  public static getFebruary2024(): JsonTemplateInstanceReader {
    return new JsonTemplateInstanceReader(JsonReaderBehavior.FEBRUARY_2024);
  }

  public static getForBehavior(behavior: JsonReaderBehavior): JsonTemplateInstanceReader {
    return new JsonTemplateInstanceReader(behavior);
  }

  public readFromString(instanceSourceString: string): JsonTemplateInstanceReaderResult {
    let instanceObject;
    try {
      instanceObject = JSON.parse(instanceSourceString);
    } catch (Exception) {
      instanceObject = {};
    }
    return this.readFromObject(instanceObject, new JsonPath());
  }

  public readFromObject(instanceSourceObject: JsonNode, _topPath: JsonPath): JsonTemplateInstanceReaderResult {
    const parsingResult: JsonArtifactParsingResult = new JsonArtifactParsingResult();
    const instance = TemplateInstance.buildEmptyWithNullValues();

    this.readNonReportableAttributes(instance, instanceSourceObject);

    this.readInstanceData(instanceSourceObject, instance, new JsonPath());

    return new JsonTemplateInstanceReaderResult(instance, parsingResult, instanceSourceObject);
  }

  protected readInstanceData(sourceObject: JsonNode, instance: TemplateInstance, path: JsonPath): void {
    instance.dataContainer = this.readInstanceContainer(sourceObject, path);
  }

  private readInstanceContainer(sourceObject: JsonNode, path: JsonPath): InstanceDataContainer {
    return this.parseContainer(sourceObject, path);
  }

  protected isKnownKey(key: string): boolean {
    return Object.hasOwn(this.knownKeys, key);
  }

  // private parseAtValueForObject(content: JsonNode, key: string, dataContainer: InstanceDataContainer, _jsonPath: JsonPath) {
  //   dataContainer.setValue(key, this.parseDataAtom(content), null);
  // }

  private parseContainer(sourceObject: JsonNode, path: JsonPath): InstanceDataContainer {
    const ret: InstanceDataContainer = new InstanceDataContainer();
    Object.keys(sourceObject).forEach((key) => {
      if (!this.isKnownKey(key)) {
        const content: JsonNode = ReaderUtil.getNode(sourceObject, key);
        if (Array.isArray(content)) {
          const arrayContainer: InstanceDataAtomList = [];
          ret.setValue(key, arrayContainer);
          content.forEach((arrayElement: JsonNode, index: number) => {
            arrayContainer[index] = this.parseNode(arrayElement, path.add(key, index));
          });
        } else {
          ret.setValue(key, this.parseNode(content, path.add(key)));
        }
      }
    });
    this.packAttributeValues(ret);

    if (Object.hasOwn(sourceObject, JsonSchema.atContext)) {
      const atContext = ReaderUtil.getNode(sourceObject, JsonSchema.atContext);
      // add iri mapping for regular fields
      Object.keys(ret.values).forEach((key) => {
        const iri = ReaderUtil.getString(atContext, key);
        if (iri !== null) {
          //console.log('-----------------------------SET IRI', key, iri);
          ret.setIri(key, iri);
        }
      });

      // add iri for AV fields
      Object.keys(ret.values).forEach((key: string) => {
        const field = ret.values[key];
        if (field instanceof InstanceDataAttributeValueField) {
          Object.keys(field.values).forEach((avElementName: string) => {
            const iri = ReaderUtil.getString(atContext, avElementName);
            if (iri !== null) {
              //console.log('-----------------------------SET IRI avElementName', key, iri);
              ret.setIri(avElementName, iri);
            }
          });
        }
      });
    }

    // add @id
    if (Object.hasOwn(sourceObject, JsonSchema.atId)) {
      const atId = ReaderUtil.getString(sourceObject, JsonSchema.atId);
      if (atId !== null) {
        ret.id = atId;
      }
    }
    return ret;
  }

  private parseNode(sourceObject: JsonNode, path: JsonPath): InstanceDataAtomType {
    if (Object.hasOwn(sourceObject, JsonSchema.atValue)) {
      return this.parseDataAtom(sourceObject);
    } else if (Object.hasOwn(sourceObject, JsonSchema.atContext)) {
      return this.parseContainer(sourceObject, path);
    } else if (Object.hasOwn(sourceObject, JsonSchema.atId)) {
      return this.parseDataAtom(sourceObject);
    }
    if (typeof sourceObject === 'string') {
      return new InstanceDataAttributeValueFieldName(sourceObject);
    }
    return new InstanceDataEmptyNode();
  }

  private parseDataAtom(content: JsonNode): InstanceDataAtomType {
    if (Object.hasOwn(content, JsonSchema.atValue)) {
      const value = ReaderUtil.getString(content, JsonSchema.atValue);
      const type = ReaderUtil.getString(content, JsonSchema.atType);
      if (type === null) {
        return new InstanceDataStringAtom(value);
      } else {
        return new InstanceDataTypedAtom(value, type);
      }
    }
    if (Object.hasOwn(content, JsonSchema.atId)) {
      const id = ReaderUtil.getString(content, JsonSchema.atId);
      const label = ReaderUtil.getString(content, JsonSchema.rdfsLabel);
      if (label === null) {
        return new InstanceDataLinkAtom(id);
      } else {
        return new InstanceDataControlledAtom(id, label);
      }
    }
    return new InstanceDataEmptyAtom();
  }

  private packAttributeValues(dataContainer: InstanceDataContainer) {
    //console.log('-------------------------------');
    //console.log(dataContainer);
    const values = dataContainer.values;
    const newAttributeValues: InstanceDataAttributeValueField[] = [];
    Object.keys(values).forEach((key) => {
      const value: InstanceDataAtomType = values[key];
      if (Array.isArray(value)) {
        let foundNonAttributeValueName = false;
        value.forEach((arrayElement: InstanceDataAtomType, _index: number) => {
          if (!(arrayElement instanceof InstanceDataAttributeValueFieldName)) {
            foundNonAttributeValueName = true;
          }
        });
        if (!foundNonAttributeValueName) {
          const avField = new InstanceDataAttributeValueField(key);
          newAttributeValues.push(avField);
          //console.log('PACK AV field:' + key);
          value.forEach((arrayElement: InstanceDataAttributeValueFieldName, _index: number) => {
            const avName: string | null = arrayElement.name;
            if (avName !== null) {
              if (Object.hasOwn(values, avName)) {
                const avValue: InstanceDataStringAtom = values[avName] as InstanceDataStringAtom;
                avField.addValue(avName, avValue);
                //console.log('Value for: ' + avName + ' => ' + avValue.value);
              }
            }
          });
        }
      }
    });

    //console.log('NEW     => ');
    //console.log(newAttributeValues);

    newAttributeValues.forEach((avField: InstanceDataAttributeValueField, _index: number) => {
      const avName: string | null = avField.name;
      if (avName !== null) {
        values[avName] = avField;
        Object.keys(avField.values).forEach((key) => {
          if (Object.hasOwn(values, key)) {
            delete values[key];
          }
        });
      }
    });

    dataContainer.values = values;
    //console.log(dataContainer);
  }
}
