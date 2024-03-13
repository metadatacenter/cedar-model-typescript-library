import { JSONReaderBehavior } from '../../behavior/JSONReaderBehavior';
import { JSONAbstractArtifactReader } from './JSONAbstractArtifactReader';
import { JSONFieldReader } from './JSONFieldReader';

export abstract class JSONContainerArtifactReader extends JSONAbstractArtifactReader {
  protected fieldReader: JSONFieldReader;

  protected constructor(behavior: JSONReaderBehavior) {
    super(behavior);
    this.fieldReader = JSONFieldReader.getForBehavior(behavior);
  }
}
