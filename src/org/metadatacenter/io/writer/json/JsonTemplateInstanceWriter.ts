import { JsonWriterBehavior } from '../../../behavior/JsonWriterBehavior';
import { ReaderUtil } from '../../reader/ReaderUtil';
import { JsonSchema } from '../../../model/cedar/constants/JsonSchema';
import { JsonNode } from '../../../model/cedar/types/basic-types/JsonNode';
import { CedarJsonWriters } from './CedarJsonWriters';
import { JsonAbstractArtifactWriter } from './JsonAbstractArtifactWriter';
import { TemplateInstance } from '../../../model/cedar/template-instance/TemplateInstance';
import { AbstractInstanceArtifact } from '../../../model/cedar/AbstractInstanceArtifact';
import { JsonTemplateInstanceContent } from '../../../model/cedar/util/serialization/JsonTemplateInstanceContent';
import { InstanceDataContainer } from '../../../model/cedar/template-instance/InstanceDataContainer';
import { InstanceDataAtomType } from '../../../model/cedar/template-instance/InstanceDataAtomType';
import { InstanceDataStringAtom } from '../../../model/cedar/template-instance/InstanceDataStringAtom';
import { InstanceDataTypedAtom } from '../../../model/cedar/template-instance/InstanceDataTypedAtom';
import { InstanceDataAttributeValueField } from '../../../model/cedar/template-instance/InstanceDataAttributeValueField';
import { InstanceDataControlledAtom } from '../../../model/cedar/template-instance/InstanceDataControlledAtom';
import { InstanceDataLinkAtom } from '../../../model/cedar/template-instance/InstanceDataLinkAtom';
import { InstanceDataAtomStringOrLinkType } from '../../../model/cedar/template-instance/InstanceDataAtomStringOrLinkType';
import { CedarModel } from '../../../model/cedar/constants/CedarModel';

export class JsonTemplateInstanceWriter extends JsonAbstractArtifactWriter {
  private constructor(behavior: JsonWriterBehavior, writers: CedarJsonWriters) {
    super(behavior, writers);
  }

  protected macroContext(_artifact: AbstractInstanceArtifact) {
    return JsonTemplateInstanceContent.CONTEXT_VERBATIM;
  }

  public static getFor(behavior: JsonWriterBehavior, writers: CedarJsonWriters): JsonTemplateInstanceWriter {
    return new JsonTemplateInstanceWriter(behavior, writers);
  }

  private buildContext(instance: TemplateInstance): JsonNode {
    // clone, because we will need to modify deep content
    const context = ReaderUtil.deepClone(JsonTemplateInstanceContent.CONTEXT_VERBATIM);

    Object.keys(instance.dataContainer.iris).forEach((key) => {
      context[key] = instance.dataContainer.iris[key];
    });

    // include the field/element definitions
    const extendedContext = {
      ...context,
    };

    return extendedContext;
  }

  private getDataTree(instance: TemplateInstance): JsonNode {
    const ret: JsonNode = JsonNode.getEmpty();
    this.serializeDataLevelInto(instance.dataContainer, ret);
    return ret;
  }

  private serializeDataLevelInto(dataContainer: InstanceDataContainer, into: JsonNode) {
    if (dataContainer.id !== null) {
      into[JsonSchema.atId] = dataContainer.id;
    }
    Object.keys(dataContainer.values).forEach((key) => {
      const dataAtom: InstanceDataAtomType = dataContainer.values[key];
      if (Array.isArray(dataAtom)) {
        const dataArray: JsonNode[] = JsonNode.getEmptyList();
        into[key] = dataArray;
        dataAtom.forEach((arrayElement: InstanceDataAtomType, _index: number) => {
          const serializedData: JsonNode | null = this.serializeCommonType(arrayElement);
          if (serializedData !== null) {
            dataArray.push(serializedData);
          }
        });
      } else {
        const serializedData: JsonNode | null = this.serializeCommonType(dataAtom);
        if (serializedData !== null) {
          into[key] = serializedData;
        }
        if (dataAtom instanceof InstanceDataAttributeValueField) {
          const keyList: string[] = [];
          Object.keys(dataAtom.values).forEach((subKey) => {
            keyList.push(subKey);
          });
          into[key] = keyList;
        }
      }
    });

    this.serializeAttributeValueFields(dataContainer, into);

    this.serializeAnnotations(dataContainer, into);

    const atContext: JsonNode = JsonNode.getEmpty();
    Object.keys(dataContainer.iris).forEach((key) => {
      atContext[key] = dataContainer.iris[key];
    });
    into[JsonSchema.atContext] = atContext;
  }

  private serializeCommonType(atom: InstanceDataAtomType): JsonNode | null {
    if (atom instanceof InstanceDataStringAtom) {
      return this.serializeAtomString(atom);
    }
    if (atom instanceof InstanceDataTypedAtom) {
      return { [JsonSchema.atValue]: atom.value, [JsonSchema.atType]: atom.type };
    }
    if (atom instanceof InstanceDataControlledAtom) {
      return { [JsonSchema.atId]: atom.id, [JsonSchema.rdfsLabel]: atom.label };
    }
    if (atom instanceof InstanceDataLinkAtom) {
      return this.serializeAtomLink(atom);
    }
    if (atom instanceof InstanceDataContainer) {
      const elementContainer: JsonNode = JsonNode.getEmpty();
      this.serializeDataLevelInto(atom, elementContainer);
      return elementContainer;
    }

    return null;
  }

  private serializeAtomString(atom: InstanceDataStringAtom) {
    return { [JsonSchema.atValue]: atom.value };
  }

  private serializeAtomLink(atom: InstanceDataLinkAtom) {
    return { [JsonSchema.atId]: atom.id };
  }

  private serializeAttributeValueFields(dataContainer: InstanceDataContainer, into: JsonNode) {
    Object.keys(dataContainer.values).forEach((key) => {
      const dataAtom: InstanceDataAtomType = dataContainer.values[key];
      if (dataAtom instanceof InstanceDataAttributeValueField) {
        Object.keys(dataAtom.values).forEach((subKey) => {
          const atom = dataAtom.values[subKey];
          if (atom instanceof InstanceDataStringAtom) {
            into[subKey] = this.serializeAtomString(atom);
          }
        });
      }
    });
  }

  private serializeAnnotations(dataContainer: InstanceDataContainer, into: JsonNode) {
    if (dataContainer.annotations !== null) {
      const annotations = dataContainer.annotations;
      if (annotations.values !== null) {
        const aValues = annotations.values;
        const jsonAnnotationContainer: JsonNode = JsonNode.getEmpty();
        Object.keys(aValues).forEach((key) => {
          if (Object.hasOwn(aValues, key)) {
            const dataAtom: InstanceDataAtomStringOrLinkType = aValues[key];
            if (dataAtom instanceof InstanceDataStringAtom) {
              jsonAnnotationContainer[key] = this.serializeAtomString(dataAtom);
            }
            if (dataAtom instanceof InstanceDataLinkAtom) {
              jsonAnnotationContainer[key] = this.serializeAtomLink(dataAtom);
            }
          }
        });
        into[CedarModel.annotations] = jsonAnnotationContainer;
      }
    }
  }

  public getAsJsonString(instance: TemplateInstance, indent: number = 2): string {
    return JSON.stringify(this.getAsJsonNode(instance), null, indent);
  }

  public getAsJsonNode(instance: TemplateInstance): JsonNode {
    const extendedContext: JsonNode = this.buildContext(instance);

    // build the final object
    return {
      [JsonSchema.atId]: this.atomicWriter.write(instance.at_id),
      ...this.macroSchemaNameAndDescription(instance),
      ...this.getDataTree(instance),
      [JsonSchema.atContext]: extendedContext,
      ...this.macroIsBasedOn(instance),
      ...this.macroProvenance(instance, this.atomicWriter),
      ...this.macroDerivedFrom(instance),
    };
  }
}
