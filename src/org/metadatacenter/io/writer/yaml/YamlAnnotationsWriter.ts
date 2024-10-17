import { JsonNode } from '../../../model/cedar/types/basic-types/JsonNode';
import { Annotations } from '../../../model/cedar/annotation/Annotations';
import { AnnotationAtId } from '../../../model/cedar/annotation/AnnotationAtId';
import { AnnotationAtValue } from '../../../model/cedar/annotation/AnnotationAtValue';
import { YamlKeys } from '../../../model/cedar/constants/YamlKeys';
import { YamlValues } from '../../../model/cedar/constants/YamlValues';
import { YamlWriterBehavior } from '../../../behavior/YamlWriterBehavior';

export class YamlAnnotationsWriter {
  private behavior: YamlWriterBehavior;

  public constructor(behavior: YamlWriterBehavior) {
    this.behavior = behavior;
  }

  public write(annotations: Annotations | null): JsonNode {
    const annotationsJson: JsonNode = JsonNode.getEmpty();
    const annotationMap: JsonNode = JsonNode.getEmpty();
    if (annotations !== null && annotations.getSize() > 0) {
      annotations.getAnnotationNames().forEach((name) => {
        const src = annotations.get(name);
        if (src instanceof AnnotationAtId) {
          const annotation = {
            [YamlKeys.datatype]: YamlValues.iri,
            [YamlKeys.value]: src.getAtId(),
          };
          annotationMap[name] = annotation;
        } else if (src instanceof AnnotationAtValue) {
          const annotation = {
            [YamlKeys.datatype]: YamlValues.string,
            [YamlKeys.value]: src.getAtValue(),
          };
          annotationMap[name] = annotation;
        }
      });
      annotationsJson[YamlKeys.annotations] = annotationMap;
    }
    return annotationsJson;
  }
}
