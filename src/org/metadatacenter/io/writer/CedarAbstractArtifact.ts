import { CedarDate } from '../../model/cedar/types/beans/CedarDate';
import { CedarUser } from '../../model/cedar/types/beans/CedarUser';
import { PavVersion } from '../../model/cedar/types/beans/PavVersion';
import { BiboStatus } from '../../model/cedar/types/beans/BiboStatus';

export abstract class CedarAbstractArtifact {
  // provenance
  public pav_createdOn: CedarDate | null = CedarDate.forValue(null);
  public pav_createdBy: CedarUser = CedarUser.forValue(null);
  public pav_lastUpdatedOn: CedarDate | null = CedarDate.forValue(null);
  public oslc_modifiedBy: CedarUser = CedarUser.forValue(null);
  // status and version
  public pav_version: PavVersion = PavVersion.NULL;
  public bibo_status: BiboStatus = BiboStatus.NULL;
  // schema name and description
  public schema_name: string | null = null;
  public schema_description: string | null = null;
}
