import { JSONWriterBehavior } from '../../behavior/JSONWriterBehavior';
import { CedarArtifactId } from '../../model/cedar/beans/CedarArtifactId';
import { CedarArtifactType } from '../../model/cedar/beans/CedarArtifactType';
import { JavascriptType } from '../../model/cedar/beans/JavascriptType';
import { CedarDate } from '../../model/cedar/beans/CedarDate';
import { CedarUser } from '../../model/cedar/beans/CedarUser';
import { BiboStatus } from '../../model/cedar/beans/BiboStatus';
import { PavVersion } from '../../model/cedar/beans/PavVersion';
import { CedarSchema } from '../../model/cedar/beans/CedarSchema';
import { SchemaVersion } from '../../model/cedar/beans/SchemaVersion';
import { NumberType } from '../../model/cedar/beans/NumberType';
import { TemporalType } from '../../model/cedar/beans/TemporalType';
import { TemporalGranularity } from '../../model/cedar/beans/TemporalGranularity';
import { TimeFormat } from '../../model/cedar/beans/TimeFormat';

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
      | null,
  ): string | number | boolean | null {
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
    } else {
      throw new Error('Unsupported type');
    }
  }

  private writeCedarArtifactId(id: CedarArtifactId): string | null {
    return id.getValue();
  }

  private writeCedarArtifactType(type: CedarArtifactType): string | null {
    return type.getValue();
  }

  private writeJavascriptType(type: JavascriptType): string | null {
    return type.getValue();
  }

  private writeCedarDate(date: CedarDate): string | null {
    return date.getValue();
  }
  private writeCedarUser(user: CedarUser): string | null {
    return user.getValue();
  }

  private writeBiboStatus(status: BiboStatus): string | null {
    return status.getValue();
  }

  private writePavVersion(version: PavVersion): string | null {
    return version.getValue();
  }
  private writeCedarSchema(schema: CedarSchema): string | null {
    return schema.getValue();
  }

  private writeSchemaVersion(schemaVersion: SchemaVersion) {
    return schemaVersion.getValue();
  }
  private writeNumberType(numberType: NumberType) {
    return numberType.getValue();
  }

  private writeTemporalType(temporalType: TemporalType) {
    return temporalType.getValue();
  }

  private writeTemporalGranularity(temporalGranularity: TemporalGranularity) {
    return temporalGranularity.getValue();
  }

  private writeTimeFormat(timeFormat: TimeFormat) {
    return timeFormat.getValue();
  }
}
