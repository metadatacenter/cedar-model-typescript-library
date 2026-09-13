import { AbstractDynamicChildDeploymentInfo } from './AbstractDynamicChildDeploymentInfo';

/**
 * What a parent decides about a dynamic field it holds.
 *
 * `continuePreviousLine` and `valueRecommendationEnabled` live here rather than on the dynamic child above,
 * because the CEDAR model gives it to a dynamic field and to nothing else:
 * `literalFieldUIContent` and `iriFieldUIContent` declare it, while an element's
 * `_ui` admits only its order, property labels and property descriptions and a
 * static field's admits only its input type, content, size and hidden flag. All
 * of those close the door with `additionalProperties: false`, so an element
 * carrying either setting is an element the validation library rejects. Both used
 * to sit one level up, where an element child inherited them: the YAML writer then
 * wrote a line placement the JSON writer had nowhere to keep and the Java library
 * ignored, and a value recommendation reached an element that no writer would ever
 * emit one for.
 */
export abstract class AbstractFieldChildDeploymentInfo extends AbstractDynamicChildDeploymentInfo {
  protected _continuePreviousLine: boolean = false;
  protected _valueRecommendationEnabled: boolean = false;

  protected constructor(name: string) {
    super(name);
  }

  get continuePreviousLine(): boolean {
    return this._continuePreviousLine;
  }

  set continuePreviousLine(value: boolean) {
    this._continuePreviousLine = value;
  }

  get valueRecommendationEnabled(): boolean {
    return this._valueRecommendationEnabled;
  }

  set valueRecommendationEnabled(value: boolean) {
    this._valueRecommendationEnabled = value;
  }
}
