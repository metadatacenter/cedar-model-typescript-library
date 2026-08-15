import { TemplateChild } from '../../types/basic-types/TemplateChild';

/**
 * A static field that can be given a display size.
 *
 * An image and a video carry `width` and `height`; the other static fields carry neither, and neither
 * do the dynamic ones. Where the size is written depends on where the field is: a field written as a
 * child of a template or element carries it in that child's `configuration`, alongside the rest of what
 * the parent decides about it, and only a field written on its own puts it among its own keys.
 */
export interface SizedStaticField {
  get width(): number | null;

  set width(width: number | null);

  get height(): number | null;

  set height(height: number | null);
}

export function isSizedStaticField(child: TemplateChild | null): child is TemplateChild & SizedStaticField {
  return child !== null && 'width' in child && 'height' in child;
}
