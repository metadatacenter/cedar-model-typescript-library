import { Annotation } from './Annotation';

export class AnnotationAtValue implements Annotation {
  private name: string;
  private value: string;

  constructor(name: string, value: string) {
    this.name = name;
    this.value = value;
  }
  getName(): string {
    return this.name;
  }

  getAtValue(): string {
    return this.value;
  }
}
