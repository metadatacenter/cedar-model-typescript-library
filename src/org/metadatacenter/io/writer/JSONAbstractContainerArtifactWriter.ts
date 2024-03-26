import { JSONAbstractArtifactWriter } from './JSONAbstractArtifactWriter';
import { AbstractContainerArtifact } from '../../model/cedar/AbstractContainerArtifact';
import { JSONContainerArtifactContent } from '../../model/cedar/util/serialization/JSONContainerArtifactContent';

export abstract class JSONAbstractContainerArtifactWriter extends JSONAbstractArtifactWriter {
  protected macroContext(_artifact: AbstractContainerArtifact) {
    return JSONContainerArtifactContent.CONTEXT_VERBATIM;
  }
}
