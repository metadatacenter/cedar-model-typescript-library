import { JSONWriterBehavior } from '../../../behavior/JSONWriterBehavior';
import { JsonNode, JsonNodeClass } from '../../../model/cedar/types/basic-types/JsonNode';
import { Annotations } from '../../../model/cedar/annotation/Annotations';
import { CedarModel } from '../../../model/cedar/constants/CedarModel';
import { AnnotationAtId } from '../../../model/cedar/annotation/AnnotationAtId';
import { JsonSchema } from '../../../model/cedar/constants/JsonSchema';
import { AnnotationAtValue } from '../../../model/cedar/annotation/AnnotationAtValue';

export class JSONAnnotationsWriter {
  private behavior: JSONWriterBehavior;

  public constructor(behavior: JSONWriterBehavior) {
    this.behavior = behavior;
  }

  public write(annotations: Annotations | null): JsonNode {
    const annotationsJson: JsonNode = JsonNodeClass.getEmpty();
    if (annotations !== null && annotations.getSize() > 0) {
      const annotation = JsonNodeClass.getEmpty();
      annotations.getAnnotationNames().forEach((name) => {
        const src = annotations.get(name);
        if (src instanceof AnnotationAtId) {
          annotation[name] = {
            [JsonSchema.atId]: src.getAtId(),
          };
        } else if (src instanceof AnnotationAtValue) {
          annotation[name] = {
            [JsonSchema.atValue]: src.getAtValue(),
          };
        }
      });
      annotationsJson[CedarModel.annotations] = annotation;
    }
    return annotationsJson;
  }
}
