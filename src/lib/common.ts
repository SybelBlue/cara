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
  const lIds = new Set();
  const rightKeyed = right.map((o) => ({ data: o, id: key(o) }));
  for (const l of left) {
    const id = key(l);
    const r = rightKeyed.find((m) => m.id === id);
    lIds.add(id);
    out.push(
      r == null
        ? { id, type: 'left', left: l, right: null }
        : { id, type: 'both', left: l, right: r.data }
    );
  }
  for (const m of rightKeyed) {
    const { data: r, id } = m;
    if (!lIds.has(id)) {
      out.push({ id, type: 'right', left: null, right: r });
    }
  }
  return out;
};
