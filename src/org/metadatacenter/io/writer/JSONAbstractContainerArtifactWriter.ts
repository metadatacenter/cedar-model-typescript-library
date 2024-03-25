import { JSONAbstractArtifactWriter } from './JSONAbstractArtifactWriter';
import { AbstractContainerArtifact } from '../../model/cedar/AbstractContainerArtifact';
import { JSONContainerArtifactContent } from '../../model/cedar/util/serialization/JSONContainerArtifactContent';

export abstract class JSONAbstractContainerArtifactWriter extends JSONAbstractArtifactWriter {
  protected macroContext(_artifact: AbstractContainerArtifact) {
    if (this.behavior.includeBiboInContext()) {
      return JSONContainerArtifactContent.CONTEXT_VERBATIM;
    } else {
      return JSONContainerArtifactContent.CONTEXT_VERBATIM_NO_BIBO;
    }
  }
}
