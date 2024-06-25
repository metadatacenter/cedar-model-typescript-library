import { Annotation } from './Annotation';

export class AnnotationAtValue implements Annotation {
  private readonly name: string;
  private readonly value: string;

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
