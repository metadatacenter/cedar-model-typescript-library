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
    const ret = JsonNode.getEmpty();
    this.serializeDataLevelInto(instance.dataContainer, ret);
    return ret;
  }

  private serializeDataLevelInto(dataContainer: InstanceDataContainer, ret: JsonNode) {
    if (dataContainer.id !== null) {
      ret[JsonSchema.atId] = dataContainer.id;
    }
    Object.keys(dataContainer.values).forEach((key) => {
      const dataAtom: InstanceDataAtomType = dataContainer.values[key];
      if (Array.isArray(dataAtom)) {
        console.log('KEY array:' + key);
        const dataArray: JsonNode[] = JsonNode.getEmptyList();
        ret[key] = dataArray;
        dataAtom.forEach((arrayElement: InstanceDataAtomType, _index: number) => {
          // TODO: handle these cases together
          if (arrayElement instanceof InstanceDataStringAtom) {
            dataArray.push({ [JsonSchema.atValue]: arrayElement.value });
          }
          if (arrayElement instanceof InstanceDataTypedAtom) {
            dataArray.push({ [JsonSchema.atValue]: arrayElement.value, [JsonSchema.atType]: arrayElement.type });
          }
          if (arrayElement instanceof InstanceDataContainer) {
            const elementContainer = JsonNode.getEmpty();
            dataArray.push(elementContainer);
            this.serializeDataLevelInto(arrayElement, elementContainer);
          }
        });
      } else {
        console.log('KEY single:' + key);
        // TODO: handle these cases together
        if (dataAtom instanceof InstanceDataStringAtom) {
          ret[key] = { [JsonSchema.atValue]: dataAtom.value };
        }
        if (dataAtom instanceof InstanceDataTypedAtom) {
          ret[key] = { [JsonSchema.atValue]: dataAtom.value, [JsonSchema.atType]: dataAtom.type };
        }
        if (dataAtom instanceof InstanceDataContainer) {
          const elementContainer = JsonNode.getEmpty();
          ret[key] = elementContainer;
          this.serializeDataLevelInto(dataAtom, elementContainer);
        }
        if (dataAtom instanceof InstanceDataAttributeValueField) {
          const keyList: string[] = [];
          Object.keys(dataAtom.values).forEach((subKey) => {
            keyList.push(subKey);
          });
          ret[key] = keyList;
        }
      }
    });

    //serialize AV field values
    Object.keys(dataContainer.values).forEach((key) => {
      const dataAtom: InstanceDataAtomType = dataContainer.values[key];
      if (dataAtom instanceof InstanceDataAttributeValueField) {
        Object.keys(dataAtom.values).forEach((subKey) => {
          const atom = dataAtom.values[subKey];
          // TODO: handle these cases together
          if (atom instanceof InstanceDataStringAtom) {
            ret[subKey] = { [JsonSchema.atValue]: atom.value };
          }
        });
      }
    });

    const atContext = JsonNode.getEmpty();
    Object.keys(dataContainer.iris).forEach((key) => {
      atContext[key] = dataContainer.iris[key];
    });
    ret[JsonSchema.atContext] = atContext;
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
