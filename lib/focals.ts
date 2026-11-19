/** A competition's focal persons (one or two), as name and phone pairs. Safe for server and browser. */
export type Focal = { name: string; phone: string | null };

export function focalsOf(c: { focalName: string | null; focalPhone: string | null; focalName2?: string | null; focalPhone2?: string | null }): Focal[] {
  return [
    { name: c.focalName, phone: c.focalPhone },
    { name: c.focalName2 ?? null, phone: c.focalPhone2 ?? null },
  ].filter((f): f is Focal => !!f.name?.trim());
}
