import { Language } from '../../types/wrapped-types/Language';
import { AbstractChildDeploymentInfo } from '../../deployment/AbstractChildDeploymentInfo';
import { ChildDeploymentInfo } from '../../deployment/ChildDeploymentInfo';
import { JsonTemplateFieldWriterInternal } from '../../../../io/writer/json/JsonTemplateFieldWriterInternal';
import { JsonWriterBehavior } from '../../../../behavior/JsonWriterBehavior';
import { StaticImageField } from './image/StaticImageField';
import { JsonNode } from '../../types/basic-types/JsonNode';
import { JsonSchema } from '../../constants/JsonSchema';
import { JsonTemplateFieldContentStatic } from '../../util/serialization/JsonTemplateFieldContentStatic';
import { CedarModel } from '../../constants/CedarModel';
import { JavascriptType } from '../../types/wrapped-types/JavascriptType';
import { TemplateProperty } from '../../constants/TemplateProperty';
import { AdditionalProperties } from '../../types/wrapped-types/AdditionalProperties';
import { ArtifactSchema } from '../../types/wrapped-types/ArtifactSchema';
import { TemplateField } from '../TemplateField';
import { CedarJsonWriters } from '../../../../io/writer/json/CedarJsonWriters';

export class JsonStaticFieldWriter extends JsonTemplateFieldWriterInternal {
  constructor(behavior: JsonWriterBehavior, writers: CedarJsonWriters) {
    super(behavior, writers);
  }

  protected expandUiNode(_uiNode: JsonNode, _field: TemplateField): void {}

  protected buildUIObject(field: TemplateField): JsonNode {
    const uiNode: JsonNode = {
      [CedarModel.inputType]: this.atomicWriter.write(field.cedarFieldType.getUiInputType()),
    };
    this.expandUiNode(uiNode, field);
    // Every static field's `_ui` carries `_content`, which the CEDAR meta-schema requires of it
    // (`staticFieldUIContent`). A page break and a section break have none to carry, and the key was
    // left out for them, which the canonical validator rejects.
    if (!(CedarModel.content in uiNode)) {
      uiNode[CedarModel.content] = null;
    }
    return {
      [CedarModel.ui]: uiNode,
    } as JsonNode;
  }

  override getAsJsonNode(field: StaticImageField, childInfo: AbstractChildDeploymentInfo = ChildDeploymentInfo.empty()): JsonNode {
    // Build ui wrapper
    const uiObject: JsonNode = this.buildUIObject(field);
    if (childInfo.hidden) (uiObject[CedarModel.ui] as JsonNode)[CedarModel.Ui.hidden] = true;
    return {
      [JsonSchema.atId]: this.atomicWriter.write(field.at_id),
      [JsonSchema.atType]: this.atomicWriter.write(field.cedarArtifactType),
      [JsonSchema.atContext]: this.macroContext(field),
      [CedarModel.type]: this.atomicWriter.write(JavascriptType.OBJECT),
      [TemplateProperty.title]: field.title,
      [TemplateProperty.description]: field.description,
      ...uiObject,
      ...this.macroSchemaNameAndDescription(field),
      ...this.macroProvenance(field, this.atomicWriter),
      ...this.macroSkos(field),
      ...this.macroSchemaIdentifier(field),
      ...this.macroAnnotations(field),
      ...this.macroDerivedFrom(field),
      ...this.macroPreviousVersion(field),
      [JsonSchema.schemaVersion]: this.atomicWriter.write(field.schema_schemaVersion),
      [TemplateProperty.additionalProperties]: this.atomicWriter.write(AdditionalProperties.FALSE),
      ...this.macroStatusAndVersion(field, this.atomicWriter),
      [CedarModel.schema]: this.atomicWriter.write(ArtifactSchema.CURRENT),
    };
  }

  protected override macroContext(field: StaticImageField) {
    const context = { ...JsonTemplateFieldContentStatic.CONTEXT_VERBATIM };
    if (field.language !== Language.NULL) context[JsonSchema.atLanguage] = this.atomicWriter.write(field.language);
    return context;
  }
}
