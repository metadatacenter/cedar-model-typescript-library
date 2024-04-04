import { JsonWriterBehavior } from '../../../behavior/JsonWriterBehavior';
import { JsonAtomicWriter } from '../json/JsonAtomicWriter';
import { CedarArtifactType } from '../../../model/cedar/types/cedar-types/CedarArtifactType';
import { NullableString } from '../../../model/cedar/types/basic-types/NullableString';
import { BioportalTermType, BioportalTermTypeYamlValue } from '../../../model/cedar/types/bioportal-types/BioportalTermType';
import { JsonNode } from '../../../model/cedar/types/basic-types/JsonNode';
import { CedarArtifactId } from '../../../model/cedar/types/cedar-types/CedarArtifactId';
import { JavascriptType } from '../../../model/cedar/types/wrapped-types/JavascriptType';
import { ISODate } from '../../../model/cedar/types/wrapped-types/ISODate';
import { CedarUser } from '../../../model/cedar/types/cedar-types/CedarUser';
import { BiboStatus } from '../../../model/cedar/types/wrapped-types/BiboStatus';
import { PavVersion } from '../../../model/cedar/types/wrapped-types/PavVersion';
import { ArtifactSchema } from '../../../model/cedar/types/wrapped-types/ArtifactSchema';
import { SchemaVersion } from '../../../model/cedar/types/wrapped-types/SchemaVersion';
import { NumberType } from '../../../model/cedar/types/wrapped-types/NumberType';
import { TemporalType } from '../../../model/cedar/types/wrapped-types/TemporalType';
import { TemporalGranularity } from '../../../model/cedar/types/wrapped-types/TemporalGranularity';
import { TimeFormat } from '../../../model/cedar/types/wrapped-types/TimeFormat';
import { UiInputType } from '../../../model/cedar/types/wrapped-types/UiInputType';
import { AdditionalProperties } from '../../../model/cedar/types/wrapped-types/AdditionalProperties';
import { URI } from '../../../model/cedar/types/wrapped-types/URI';
import { YamlWriterBehavior } from '../../../behavior/YamlWriterBehavior';

export class YamlAtomicWriter extends JsonAtomicWriter {
  public constructor(_behavior: YamlWriterBehavior) {
    super(JsonWriterBehavior.STRICT);
  }

  protected override writeCedarArtifactType(type: CedarArtifactType): NullableString {
    return type.getYamlValue();
  }

  public write(
    arg:
      | CedarArtifactId
      | CedarArtifactType
      | JavascriptType
      | ISODate
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
      | URI
      | BioportalTermType
      | null,
  ): string | number | boolean | JsonNode | null {
    if (arg == null) {
      return null;
    }
    if (arg instanceof BiboStatus) {
      return this.writeBiboStatusYaml(arg);
    } else if (arg instanceof BioportalTermType) {
      return this.writeBioportalTermTypeYaml(arg);
    } else {
      return super.write(arg);
    }
  }

  private writeBiboStatusYaml(status: BiboStatus): NullableString {
    return status.getYamlValue();
  }

  private writeBioportalTermTypeYaml(termType: BioportalTermType): BioportalTermTypeYamlValue {
    return termType.getYamlValue();
  }
}
