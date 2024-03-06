import { Node, NodeClass } from '../model/cedar/util/types/Node';
import { ParsingResult } from '../model/cedar/util/compare/ParsingResult';
import { CedarJsonPath } from '../model/cedar/util/path/CedarJsonPath';
import { CedarField } from '../model/cedar/field/CedarField';
import { CedarArtifactId } from '../model/cedar/beans/CedarArtifactId';
import { ReaderUtil } from './ReaderUtil';
import { JsonSchema } from '../model/cedar/constants/JsonSchema';
import { TemplateProperty } from '../model/cedar/constants/TemplateProperty';
import { CedarUser } from '../model/cedar/beans/CedarUser';
import { CedarDate } from '../model/cedar/beans/CedarDate';
import { SchemaVersion } from '../model/cedar/beans/SchemaVersion';
import { PavVersion } from '../model/cedar/beans/PavVersion';
import { BiboStatus } from '../model/cedar/beans/BiboStatus';
import { ObjectComparator } from '../model/cedar/util/compare/ObjectComparator';
import { CedarArtifactType } from '../model/cedar/beans/CedarArtifactType';
import { JavascriptType } from '../model/cedar/beans/JavascriptType';
import { CedarModel } from '../model/cedar/CedarModel';
import { CedarSchema } from '../model/cedar/beans/CedarSchema';
import { CedarTemplateFieldContent } from '../model/cedar/util/serialization/CedarTemplateFieldContent';
import { InputType } from '../model/cedar/constants/InputType';
import { JSONFieldReaderTextField } from './field/JSONFieldReaderTextField';
import { JSONFieldReaderPageBreak } from './field/JSONFieldReaderPageBreak';
import { JSONFieldReaderSectionBreak } from './field/JSONFieldReaderSectionBreak';
import { JSONFieldReaderImage } from './field/JSONFieldReaderImage';
import { JSONFieldReaderRichText } from './field/JSONFieldReaderRichText';
import { JSONFieldReaderYoutube } from './field/JSONFieldReaderYoutube';
import { JSONFieldReaderLink } from './field/JSONFieldReaderLink';
import { CedarStaticTemplateFieldContent } from '../model/cedar/util/serialization/CedarStaticTemplateFieldContent';
import { JSONFieldReaderTemporal } from '../model/cedar/field/temporal/JSONFieldReaderTemporal';

export class JSONFieldReader {
  static readFromObject(fieldSourceObject: Node, parsingResult: ParsingResult, path: CedarJsonPath): CedarField | null {
    const field: CedarField | null = this.readFieldSpecificAttributes(fieldSourceObject, parsingResult, path);
    if (field != null) {
      this.readNonReportableAttributes(field, fieldSourceObject);
      this.readReportableAttributes(field, fieldSourceObject, parsingResult, path);
    }

    return field;
  }

  private static readNonReportableAttributes(field: CedarField, fieldSourceObject: Node) {
    // Read in non-reportable properties
    field.at_id = CedarArtifactId.forValue(ReaderUtil.getString(fieldSourceObject, JsonSchema.atId));
    field.title = ReaderUtil.getString(fieldSourceObject, TemplateProperty.title);
    field.description = ReaderUtil.getString(fieldSourceObject, TemplateProperty.description);
    field.schema_name = ReaderUtil.getString(fieldSourceObject, JsonSchema.schemaName);
    field.schema_description = ReaderUtil.getString(fieldSourceObject, JsonSchema.schemaDescription);
    field.pav_createdBy = CedarUser.forValue(ReaderUtil.getString(fieldSourceObject, JsonSchema.pavCreatedBy));
    field.pav_createdOn = CedarDate.forValue(ReaderUtil.getString(fieldSourceObject, JsonSchema.pavCreatedOn));
    field.oslc_modifiedBy = CedarUser.forValue(ReaderUtil.getString(fieldSourceObject, JsonSchema.oslcModifiedBy));
    field.pav_lastUpdatedOn = CedarDate.forValue(ReaderUtil.getString(fieldSourceObject, JsonSchema.pavLastUpdatedOn));
    field.schema_schemaVersion = SchemaVersion.forValue(ReaderUtil.getString(fieldSourceObject, JsonSchema.schemaVersion));
    field.pav_version = PavVersion.forValue(ReaderUtil.getString(fieldSourceObject, JsonSchema.pavVersion));
    field.bibo_status = BiboStatus.forValue(ReaderUtil.getString(fieldSourceObject, JsonSchema.biboStatus));
    field.skos_prefLabel = ReaderUtil.getString(fieldSourceObject, CedarModel.skosPrefLabel);
  }

  private static readReportableAttributes(field: CedarField, fieldSourceObject: Node, parsingResult: ParsingResult, path: CedarJsonPath) {
    // Read and validate, but do not store top level @type

    // Read and validate, but do not store top level @context
    const topContextNode: Node = ReaderUtil.getNode(fieldSourceObject, JsonSchema.atContext);
    let blueprintAtContext: Node = NodeClass.EMPTY;
    if (field.cedarArtifactType == CedarArtifactType.TEMPLATE_FIELD) {
      blueprintAtContext = CedarTemplateFieldContent.CONTEXT_VERBATIM;
    } else if (field.cedarArtifactType == CedarArtifactType.STATIC_TEMPLATE_FIELD) {
      blueprintAtContext = CedarStaticTemplateFieldContent.CONTEXT_VERBATIM;
    }
    ObjectComparator.compareBothWays(parsingResult, blueprintAtContext, topContextNode, path.add(JsonSchema.atContext));

    // Read and validate, but do not store top level type
    ObjectComparator.comparePrimitive(
      parsingResult,
      JavascriptType.OBJECT.getValue(),
      ReaderUtil.getString(fieldSourceObject, CedarModel.type),
      path.add(CedarModel.type),
    );

    // Read and validate, but do not store top level additionalProperties
    ObjectComparator.comparePrimitive(
      parsingResult,
      false,
      ReaderUtil.getBoolean(fieldSourceObject, TemplateProperty.additionalProperties),
      path.add(TemplateProperty.additionalProperties),
    );

    // Read and validate, but do not store top level $schema
    ObjectComparator.comparePrimitive(
      parsingResult,
      CedarSchema.CURRENT.getValue(),
      ReaderUtil.getString(fieldSourceObject, CedarModel.schema),
      path.add(CedarModel.schema),
    );
  }

  private static readFieldSpecificAttributes(
    fieldSourceObject: Node,
    parsingResult: ParsingResult,
    path: CedarJsonPath,
  ): CedarField | null {
    const artifactType: CedarArtifactType = CedarArtifactType.forValue(ReaderUtil.getString(fieldSourceObject, JsonSchema.atType));
    const uiNode = ReaderUtil.getNode(fieldSourceObject, CedarModel.ui);
    const uiInputType: string | null = ReaderUtil.getString(uiNode, CedarModel.inputType);
    if (artifactType == CedarArtifactType.STATIC_TEMPLATE_FIELD) {
      if (uiInputType == InputType.pageBreak) {
        return JSONFieldReaderPageBreak.read(fieldSourceObject, parsingResult, path);
      } else if (uiInputType == InputType.sectionBreak) {
        return JSONFieldReaderSectionBreak.read(fieldSourceObject, parsingResult, path);
      } else if (uiInputType == InputType.image) {
        return JSONFieldReaderImage.read(fieldSourceObject, parsingResult, path);
      } else if (uiInputType == InputType.richText) {
        return JSONFieldReaderRichText.read(fieldSourceObject, parsingResult, path);
      } else if (uiInputType == InputType.youtube) {
        return JSONFieldReaderYoutube.read(fieldSourceObject, parsingResult, path);
      }
    } else if (artifactType == CedarArtifactType.TEMPLATE_FIELD) {
      if (uiInputType == InputType.text) {
        return JSONFieldReaderTextField.read(fieldSourceObject, parsingResult, path);
      } else if (uiInputType == InputType.link) {
        return JSONFieldReaderLink.read(fieldSourceObject, parsingResult, path);
      } else if (uiInputType == InputType.temporal) {
        return JSONFieldReaderTemporal.read(fieldSourceObject, parsingResult, path);
      }
    }
    return null;
  }
}
