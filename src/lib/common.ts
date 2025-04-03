export const any = <T>(arr: T[], pred?: (elem: T, idx?: number, arr?: T[]) => boolean) => {
  for (let i = 0; i < arr.length; i++) if (pred ? pred(arr[i], i, arr) : arr[i]) return true;
  return false;
};

export const all = <T>(xs: T[], pred?: (t: T, idx?: number, arr?: T[]) => boolean) =>
  !(pred ? any(xs, (t, i, a) => !pred(t, i, a)) : any(xs, (t) => !t));

export type Zipped<L, R, K> =
  | { id: K; type: 'left'; left: L; right: null }
  | { id: K; type: 'right'; left: null; right: R }
  | { id: K; type: 'both'; left: L; right: R };

export const mergeKeyed = <L, R, K>(
  left: L[],
  right: R[],
  key: (_: L | R) => K
): Zipped<L, R, K>[] => {
  const out: Zipped<L, R, K>[] = [];

  // Create a map of right objects with a 'seen' flag
  const rightMap = new Map<K, { data: R; seen: boolean }>();
  for (const r of right) {
    rightMap.set(key(r), { data: r, seen: false });
  }

  // Process left items and mark matches as seen
  for (const l of left) {
    const id = key(l);
    const rightEntry = rightMap.get(id);

    if (rightEntry) {
      // Mark as seen
      rightEntry.seen = true;
      out.push({ id, type: 'both', left: l, right: rightEntry.data });
    } else {
      out.push({ id, type: 'left', left: l, right: null });
    }
  }

  // Add remaining right items (those not seen)
  for (const [id, { data: right, seen }] of rightMap.entries()) {
    if (!seen) {
      out.push({ id, type: 'right', left: null, right });
    }
  }

  return out;
};

export const clamp = (low: number, value: number, high: number) =>
  value < low ? low : value < high ? value : high;
