import { Annotation } from './Annotation';

export class Annotations {
  private annotations: Map<string, Annotation> = new Map<string, Annotation>();

  add(annotation: Annotation) {
    this.annotations.set(annotation.getName(), annotation);
  }

  getSize(): number {
    return this.annotations.size;
  }

  getAnnotationNames(): Array<string> {
    return Array.from(this.annotations.keys());
  }

  get(name: string): Annotation | null {
    if (this.annotations.has(name)) {
      return this.annotations.get(name)!;
    } else {
      return null;
    }
  }
}
