import { JsonWriterBehavior } from '../../../behavior/JsonWriterBehavior';
import { CedarArtifactId } from '../../../model/cedar/types/cedar-types/CedarArtifactId';
import { CedarArtifactType } from '../../../model/cedar/types/cedar-types/CedarArtifactType';
import { JavascriptType } from '../../../model/cedar/types/wrapped-types/JavascriptType';
import { IsoDate } from '../../../model/cedar/types/wrapped-types/IsoDate';
import { CedarUser } from '../../../model/cedar/types/cedar-types/CedarUser';
import { BiboStatus } from '../../../model/cedar/types/wrapped-types/BiboStatus';
import { PavVersion } from '../../../model/cedar/types/wrapped-types/PavVersion';
import { ArtifactSchema } from '../../../model/cedar/types/wrapped-types/ArtifactSchema';
import { SchemaVersion } from '../../../model/cedar/types/wrapped-types/SchemaVersion';
import { NumberType, NumberTypeValue } from '../../../model/cedar/types/wrapped-types/NumberType';
import { TemporalType, TemporalTypeValue } from '../../../model/cedar/types/wrapped-types/TemporalType';
import { TemporalGranularity, TemporalGranularityValue } from '../../../model/cedar/types/wrapped-types/TemporalGranularity';
import { TimeFormat, TimeFormatValue } from '../../../model/cedar/types/wrapped-types/TimeFormat';
import { UiInputType, UiInputTypeValue } from '../../../model/cedar/types/wrapped-types/UiInputType';
import { AdditionalProperties } from '../../../model/cedar/types/wrapped-types/AdditionalProperties';
import { NullableString } from '../../../model/cedar/types/basic-types/NullableString';
import { JsonNode } from '../../../model/cedar/types/basic-types/JsonNode';
import { JsonTemplateFieldContentDynamic } from '../../../model/cedar/util/serialization/JsonTemplateFieldContentDynamic';
import { Iri } from '../../../model/cedar/types/wrapped-types/Iri';
import { BioportalTermType, BioportalTermTypeJsonValue } from '../../../model/cedar/types/bioportal-types/BioportalTermType';
import { Language } from '../../../model/cedar/types/wrapped-types/Language';

export class JsonAtomicWriter {
  private behavior: JsonWriterBehavior;

  public constructor(behavior: JsonWriterBehavior) {
    this.behavior = behavior;
  }

  public write(
    arg:
      | CedarArtifactId
      | CedarArtifactType
      | JavascriptType
      | IsoDate
      | CedarUser
      | BiboStatus
      | PavVersion
      | ArtifactSchema
      | SchemaVersion
      | NumberType
      | TemporalType
      | TemporalGranularity
      | TimeFormat
      | UiInputType
      | AdditionalProperties
      | Iri
      | BioportalTermType
      | Language
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
    } else if (arg instanceof IsoDate) {
      return this.writeCedarDate(arg);
    } else if (arg instanceof CedarUser) {
      return this.writeCedarUser(arg);
    } else if (arg instanceof BiboStatus) {
      return this.writeBiboStatusJson(arg);
    } else if (arg instanceof PavVersion) {
      return this.writePavVersion(arg);
    } else if (arg instanceof ArtifactSchema) {
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
    } else if (arg instanceof Iri) {
      return this.writeURI(arg);
    } else if (arg instanceof BioportalTermType) {
      return this.writeBioportalTermTypeJson(arg);
    } else if (arg instanceof Language) {
      return this.writeLanguage(arg);
    } else {
      throw new Error('Unsupported type');
    }
  }

  private writeCedarArtifactId(id: CedarArtifactId): NullableString {
    return id.getValue();
  }

  protected writeCedarArtifactType(type: CedarArtifactType): NullableString {
    return type.getValue();
  }

  private writeJavascriptType(type: JavascriptType): NullableString {
    return type.getValue();
  }

  private writeCedarDate(date: IsoDate): NullableString {
    return date.getValue();
  }

  private writeCedarUser(user: CedarUser): NullableString {
    return user.getValue();
  }

  private writeBiboStatusJson(status: BiboStatus): NullableString {
    return status.getJsonValue();
  }

  private writePavVersion(version: PavVersion): NullableString {
    return version.getValue();
  }

  private writeCedarSchema(schema: ArtifactSchema): NullableString {
    return schema.getValue();
  }

  private writeSchemaVersion(schemaVersion: SchemaVersion): NullableString {
    if (schemaVersion.getValue() !== null) {
      return schemaVersion.getValue();
    } else {
      return SchemaVersion.CURRENT.getValue();
    }
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
      return JsonTemplateFieldContentDynamic.ADDITIONAL_PROPERTIES_VERBATIM_ATTRIBUTE_VALUE_OUTSIDE;
    }
    return null;
  }

  private writeURI(uri: Iri): string {
    return uri.getValue();
  }

  private writeBioportalTermTypeJson(termType: BioportalTermType): BioportalTermTypeJsonValue {
    return termType.getJsonValue();
  }

  private writeLanguage(language: Language): string | null {
    return language.getValue();
  }
}
