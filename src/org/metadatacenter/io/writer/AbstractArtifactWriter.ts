import { CedarWriters } from './CedarWriters';
import { JSONWriterBehavior } from '../../behavior/JSONWriterBehavior';

export abstract class AbstractArtifactWriter {
  protected behavior: JSONWriterBehavior;
  protected writers: CedarWriters;

  protected constructor(behavior: JSONWriterBehavior, writers: CedarWriters) {
    this.behavior = behavior;
    this.writers = writers;
  }
}
