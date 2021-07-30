function quickSort<E>(datas: E[]) {
  const rec: (ars: E[]) => E[] = (ars: E[]) => {
    if (ars.length <= 1) return ars;
    const left = [];
    const right = [];
    const mid = ars[0];
    for (let i = 1; i < ars.length; i++) {
      const elem = ars[i];
      if (elem > mid) {
        left.push(elem);
      } else {
        right.push(elem);
      }
    }
    return [...rec(left), mid, ...rec(right)];
  };
  return rec(datas);
}

console.log(
  quickSort<number>([2, 9, 3, 4, 5, 1]),
);
