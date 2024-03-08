import { JSONWriterBehavior } from '../../behavior/JSONWriterBehavior';
import { CedarArtifactId } from '../../model/cedar/types/beans/CedarArtifactId';
import { CedarArtifactType } from '../../model/cedar/types/beans/CedarArtifactType';
import { JavascriptType } from '../../model/cedar/types/beans/JavascriptType';
import { CedarDate } from '../../model/cedar/types/beans/CedarDate';
import { CedarUser } from '../../model/cedar/types/beans/CedarUser';
import { BiboStatus } from '../../model/cedar/types/beans/BiboStatus';
import { PavVersion } from '../../model/cedar/types/beans/PavVersion';
import { CedarSchema } from '../../model/cedar/types/beans/CedarSchema';
import { SchemaVersion } from '../../model/cedar/types/beans/SchemaVersion';
import { NumberType, NumberTypeValue } from '../../model/cedar/types/beans/NumberType';
import { TemporalType, TemporalTypeValue } from '../../model/cedar/types/beans/TemporalType';
import { TemporalGranularity, TemporalGranularityValue } from '../../model/cedar/types/beans/TemporalGranularity';
import { TimeFormat, TimeFormatValue } from '../../model/cedar/types/beans/TimeFormat';
import { UiInputType, UiInputTypeValue } from '../../model/cedar/types/beans/UiInputType';
import { AdditionalProperties } from '../../model/cedar/types/beans/AdditionalProperties';
import { NullableString } from '../../model/cedar/types/basic-types/NullableString';
import { JsonNode } from '../../model/cedar/types/basic-types/JsonNode';
import { CedarJSONTemplateFieldContentDynamic } from '../../model/cedar/util/serialization/CedarJSONTemplateFieldContentDynamic';

export class JSONAtomicWriter {
  private behavior: JSONWriterBehavior;

  public constructor(behavior: JSONWriterBehavior) {
    this.behavior = behavior;
  }

  public write(
    arg:
      | CedarArtifactId
      | CedarArtifactType
      | JavascriptType
      | CedarDate
      | CedarUser
      | BiboStatus
      | PavVersion
      | CedarSchema
      | SchemaVersion
      | NumberType
      | TemporalType
      | TemporalGranularity
      | TimeFormat
      | UiInputType
      | AdditionalProperties
      | null,
  ): string | number | boolean | JsonNode | null {
    if (arg == null) {
      return null;
    }
    if (arg instanceof CedarArtifactId) {
      return this.writeCedarArtifactId(arg);
    } else if (arg instanceof CedarArtifactType) {
      return this.writeCedarArtifactType(arg);
    } else if (arg instanceof JavascriptType) {
      return this.writeJavascriptType(arg);
    } else if (arg instanceof CedarDate) {
      return this.writeCedarDate(arg);
    } else if (arg instanceof CedarUser) {
      return this.writeCedarUser(arg);
    } else if (arg instanceof BiboStatus) {
      return this.writeBiboStatus(arg);
    } else if (arg instanceof PavVersion) {
      return this.writePavVersion(arg);
    } else if (arg instanceof CedarSchema) {
      return this.writeCedarSchema(arg);
    } else if (arg instanceof SchemaVersion) {
      return this.writeSchemaVersion(arg);
    } else if (arg instanceof NumberType) {
      return this.writeNumberType(arg);
    } else if (arg instanceof TemporalType) {
      return this.writeTemporalType(arg);
    } else if (arg instanceof TemporalGranularity) {
      return this.writeTemporalGranularity(arg);
    } else if (arg instanceof TimeFormat) {
      return this.writeTimeFormat(arg);
    } else if (arg instanceof UiInputType) {
      return this.writeUiInputType(arg);
    } else if (arg instanceof AdditionalProperties) {
      return this.writeAdditionalProperties(arg);
    } else {
      throw new Error('Unsupported type');
    }
  }

  private writeCedarArtifactId(id: CedarArtifactId): NullableString {
    return id.getValue();
  }

  private writeCedarArtifactType(type: CedarArtifactType): NullableString {
    return type.getValue();
  }

  private writeJavascriptType(type: JavascriptType): NullableString {
    return type.getValue();
  }

  private writeCedarDate(date: CedarDate): NullableString {
    return date.getValue();
  }

  private writeCedarUser(user: CedarUser): NullableString {
    return user.getValue();
  }

  private writeBiboStatus(status: BiboStatus): NullableString {
    return status.getValue();
  }

  private writePavVersion(version: PavVersion): NullableString {
    return version.getValue();
  }

  private writeCedarSchema(schema: CedarSchema): NullableString {
    return schema.getValue();
  }

  private writeSchemaVersion(schemaVersion: SchemaVersion): NullableString {
    return schemaVersion.getValue();
  }

  private writeNumberType(numberType: NumberType): NumberTypeValue {
    return numberType.getValue();
  }

  private writeTemporalType(temporalType: TemporalType): TemporalTypeValue {
    return temporalType.getValue();
  }

  private writeTemporalGranularity(temporalGranularity: TemporalGranularity): TemporalGranularityValue {
    return temporalGranularity.getValue();
  }

  private writeTimeFormat(timeFormat: TimeFormat): TimeFormatValue {
    return timeFormat.getValue();
  }

  private writeUiInputType(uiInputType: UiInputType): UiInputTypeValue {
    return uiInputType.getValue();
  }

  private writeAdditionalProperties(additionalProperties: AdditionalProperties): JsonNode | boolean | null {
    if (additionalProperties === AdditionalProperties.FALSE) {
      return false;
    } else if (additionalProperties === AdditionalProperties.ALLOW_ATTRIBUTE_VALUE) {
      return CedarJSONTemplateFieldContentDynamic.ADDITIONAL_PROPERTIES_VERBATIM_ATTRIBUTE_VALUE_OUTSIDE;
    }
    return null;
  }
}
