import { JsonNode } from '../../../model/cedar/types/basic-types/JsonNode';
import { SimpleYamlSerializer } from './SimpleYamlSerializer';
import { YamlWriterBehavior } from '../../../behavior/YamlWriterBehavior';
import { CedarYamlWriters } from './CedarYamlWriters';
import { YamlAbstractArtifactWriter } from './YamlAbstractArtifactWriter';
import { TemplateInstance } from '../../../model/cedar/template-instance/TemplateInstance';
import { InstanceDataContainer } from '../../../model/cedar/template-instance/InstanceDataContainer';
import { InstanceDataAtomType } from '../../../model/cedar/template-instance/InstanceDataAtomType';
import { InstanceDataAttributeValueField } from '../../../model/cedar/template-instance/InstanceDataAttributeValueField';
import { InstanceDataStringAtom } from '../../../model/cedar/template-instance/InstanceDataStringAtom';
import { InstanceDataLinkAtom } from '../../../model/cedar/template-instance/InstanceDataLinkAtom';
import { InstanceDataTypedAtom } from '../../../model/cedar/template-instance/InstanceDataTypedAtom';
import { InstanceDataControlledAtom } from '../../../model/cedar/template-instance/InstanceDataControlledAtom';
import { YamlKeys } from '../../../model/cedar/constants/YamlKeys';

export class YamlTemplateInstanceWriter extends YamlAbstractArtifactWriter {
  private constructor(behavior: YamlWriterBehavior, writers: CedarYamlWriters) {
    super(behavior, writers);
  }

  public static getFor(behavior: YamlWriterBehavior, writers: CedarYamlWriters): YamlTemplateInstanceWriter {
    return new YamlTemplateInstanceWriter(behavior, writers);
  }

  public getYamlAsJsonNode(instance: TemplateInstance): JsonNode {
    // build the final object
    const template: JsonNode = {
      ...this.macroType(instance),
      ...this.macroNameAndDescription(instance),
      ...this.macroId(instance),
      ...this.macroIsBasedOn(instance),
      ...this.macroDerivedFrom(instance),
      ...this.macroProvenance(instance),
      ...this.getDataTree(instance),
      ...this.macroAnnotations(instance),
    };
    return template;
  }

  public getAsYamlString(instance: TemplateInstance): string {
    return SimpleYamlSerializer.serialize(this.getYamlAsJsonNode(instance));
  }

  private getDataTree(instance: TemplateInstance): JsonNode {
    const ret: JsonNode = JsonNode.getEmpty();
    this.serializeDataLevelInto(instance.dataContainer, ret);
    return ret;
  }

  private serializeDataLevelInto(dataContainer: InstanceDataContainer, into: JsonNode) {
    if (dataContainer.id !== null) {
      into[YamlKeys.id] = dataContainer.id;
    }
    const target = JsonNode.getEmpty();
    into[YamlKeys.children] = target;
    Object.keys(dataContainer.values).forEach((key) => {
      const dataAtom: InstanceDataAtomType = dataContainer.values[key];
      if (Array.isArray(dataAtom)) {
        const dataArray: JsonNode[] = JsonNode.getEmptyList();
        target[key] = dataArray;
        dataAtom.forEach((arrayElement: InstanceDataAtomType, _index: number) => {
          const serializedData: JsonNode | null = this.serializeCommonType(arrayElement);
          if (serializedData !== null) {
            dataArray.push(serializedData);
          }
        });
      } else {
        const serializedData: JsonNode | null = this.serializeCommonType(dataAtom);
        if (serializedData !== null) {
          target[key] = serializedData;
        }
      }
    });

    this.serializeAttributeValueFields(dataContainer, into);
  }

  private serializeAttributeValueFields(dataContainer: InstanceDataContainer, into: JsonNode) {
    Object.keys(dataContainer.values).forEach((key) => {
      const dataAtom: InstanceDataAtomType = dataContainer.values[key];
      if (dataAtom instanceof InstanceDataAttributeValueField) {
        const wrapper: JsonNode = JsonNode.getEmpty();
        let addedav = false;
        Object.keys(dataAtom.values).forEach((subKey) => {
          const atom = dataAtom.values[subKey];
          if (atom instanceof InstanceDataStringAtom) {
            wrapper[subKey] = this.serializeAtomString(atom);
            addedav = true;
          }
        });
        if (addedav) {
          into[key] = wrapper;
        }
      }
    });
  }

  private serializeCommonType(atom: InstanceDataAtomType): JsonNode | null {
    if (atom instanceof InstanceDataStringAtom) {
      return this.serializeAtomString(atom);
    }
    if (atom instanceof InstanceDataTypedAtom) {
      const ret = { [YamlKeys.datatype]: atom.type };
      if (atom.value !== null) {
        ret[YamlKeys.value] = atom.value;
      }
      return ret;
    }
    if (atom instanceof InstanceDataControlledAtom) {
      return { [YamlKeys.id]: atom.id, [YamlKeys.label]: atom.label };
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
    return { [YamlKeys.value]: atom.value };
  }

  private serializeAtomLink(atom: InstanceDataLinkAtom) {
    return { [YamlKeys.id]: atom.id };
  }
}
