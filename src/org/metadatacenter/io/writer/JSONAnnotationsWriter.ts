import { JSONWriterBehavior } from '../../behavior/JSONWriterBehavior';
import { JsonNode, JsonNodeClass } from '../../model/cedar/types/basic-types/JsonNode';
import { Annotations } from '../../model/cedar/annotation/Annotations';
import { CedarModel } from '../../model/cedar/constants/CedarModel';
import { AnnotationAtId } from '../../model/cedar/annotation/AnnotationAtId';
import { JsonSchema } from '../../model/cedar/constants/JsonSchema';
import { AnnotationAtValue } from '../../model/cedar/annotation/AnnotationAtValue';

export class JSONAnnotationsWriter {
  private behavior: JSONWriterBehavior;

  public constructor(behavior: JSONWriterBehavior) {
    this.behavior = behavior;
  }

  public write(annotations: Annotations | null): JsonNode {
    const annotationsJson: JsonNode = JsonNodeClass.getEmpty();
    if (annotations !== null && annotations.getSize() > 0) {
      const anno = JsonNodeClass.getEmpty();
      annotations.getAnnotationNames().forEach((name) => {
        const annot = annotations.get(name);
        if (annot instanceof AnnotationAtId) {
          anno[name] = {
            [JsonSchema.atId]: annot.getAtId(),
          };
        } else if (annot instanceof AnnotationAtValue) {
          anno[name] = {
            [JsonSchema.atValue]: annot.getAtValue(),
          };
        }
      });
      annotationsJson[CedarModel.annotations] = anno;
    }
    return annotationsJson;
  }
}
