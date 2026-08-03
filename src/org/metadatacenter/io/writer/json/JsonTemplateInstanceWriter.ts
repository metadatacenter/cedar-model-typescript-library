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
import { InstanceDataAttributeValueFieldName } from '../../../model/cedar/template-instance/InstanceDataAttributeValueFieldName';
import { InstanceDataControlledAtom } from '../../../model/cedar/template-instance/InstanceDataControlledAtom';
import { InstanceDataLinkAtom } from '../../../model/cedar/template-instance/InstanceDataLinkAtom';
import { InstanceDataEmptyAtom } from '../../../model/cedar/template-instance/InstanceDataEmptyAtom';
import { InstanceDataEmptyNode } from '../../../model/cedar/template-instance/InstanceDataEmptyNode';

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
          if (arrayElement instanceof InstanceDataAttributeValueFieldName) {
            // An attribute-value slot holds the attribute's *name*, and a list
            // can hold names alongside unfilled slots — a field with two slots
            // where the user has named one. `packAttributeValues` only folds a
            // list into an attribute-value field when every entry is a name, so
            // a part-named list arrives here as an ordinary list and the names
            // in it were dropped on the floor: the field came back missing the
            // attribute the user had named, while the property it pointed at
            // stayed behind as an orphan.
            const attributeName: string | null = (arrayElement as InstanceDataAttributeValueFieldName).name;
            dataArray.push(attributeName as unknown as JsonNode);
            return;
          }
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

    const atContext: JsonNode = JsonNode.getEmpty();
    Object.keys(dataContainer.iris).forEach((key) => {
      atContext[key] = dataContainer.iris[key];
    });
    into[JsonSchema.atContext] = atContext;
  }

  /**
   * One value atom as the JSON a CEDAR instance carries.
   *
   * The mirror of `JsonTemplateInstanceReader.readValueNode`, and public for
   * the same reason: a consumer writing values into an instance otherwise
   * spells the shapes out by hand — `{'@value': …}` here, `{'@id': …,
   * 'rdfs:label': …}` there — and the two ends drift. Values only; an element
   * is a container and needs a writer with the rest of the instance in hand.
   */
  public static writeValueNode(atom: InstanceDataAtomType): JsonNode | null {
    if (atom instanceof InstanceDataStringAtom) {
      return { [JsonSchema.atValue]: atom.value };
    }
    if (atom instanceof InstanceDataTypedAtom) {
      return { [JsonSchema.atValue]: atom.value, [JsonSchema.atType]: atom.type };
    }
    if (atom instanceof InstanceDataControlledAtom) {
      return { [JsonSchema.atId]: atom.id, [JsonSchema.rdfsLabel]: atom.label };
    }
    if (atom instanceof InstanceDataLinkAtom) {
      return { [JsonSchema.atId]: atom.id };
    }
    if (atom instanceof InstanceDataEmptyAtom || atom instanceof InstanceDataEmptyNode) {
      // An empty controlled-term field is `{}` in the instance, and it is a
      // present-but-unfilled field rather than an absent one. Returning null
      // here made the caller skip the key entirely, so the field disappeared
      // from the output — the reader had already classified it correctly as an
      // empty atom, and only the writer lost it.
      return JsonNode.getEmpty();
    }
    return null;
  }

  private serializeCommonType(atom: InstanceDataAtomType): JsonNode | null {
    if (atom instanceof InstanceDataContainer) {
      const elementContainer: JsonNode = JsonNode.getEmpty();
      this.serializeDataLevelInto(atom, elementContainer);
      return elementContainer;
    }
    return JsonTemplateInstanceWriter.writeValueNode(atom);
  }

  private serializeAtomString(atom: InstanceDataStringAtom) {
    return { [JsonSchema.atValue]: atom.value };
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
      ...this.macroAnnotations(instance),
      [JsonSchema.atContext]: extendedContext,
      ...this.macroIsBasedOn(instance),
      ...this.macroProvenance(instance, this.atomicWriter),
      ...this.macroDerivedFrom(instance),
    };
  }
}
