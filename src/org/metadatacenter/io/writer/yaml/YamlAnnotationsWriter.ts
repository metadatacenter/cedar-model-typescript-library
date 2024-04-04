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
    const annotationList: JsonNode[] = JsonNode.getEmptyList();
    if (annotations !== null && annotations.getSize() > 0) {
      annotations.getAnnotationNames().forEach((name) => {
        const src = annotations.get(name);
        if (src instanceof AnnotationAtId) {
          const annotation = {
            [YamlKeys.name]: name,
            [YamlKeys.type]: YamlValues.iri,
            [YamlKeys.value]: src.getAtId(),
          };
          annotationList.push(annotation);
        } else if (src instanceof AnnotationAtValue) {
          const annotation = {
            [YamlKeys.name]: name,
            [YamlKeys.type]: YamlValues.string,
            [YamlKeys.value]: src.getAtValue(),
          };
          annotationList.push(annotation);
        }
      });
      annotationsJson[YamlKeys.annotations] = annotationList;
    }
    return annotationsJson;
  }
}
