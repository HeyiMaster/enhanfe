function mergeSort<E>(datas: E[]) {
  const rec = (arr: E[]) => {
    // if arr is empty, return empty array
    if (!arr.length) return [];
    if (arr.length === 1) return arr;
    // calculate middle index
    const mid = Math.floor(arr.length / 2);
    // left arr
    const leftArr = arr.slice(0, mid);
    // right arr
    const rightArr = arr.slice(mid);

    const recLeftArr: E[] = rec(leftArr);
    const recRightArr: E[] = rec(rightArr);

    const res: E[] = [];

    while (recLeftArr?.length || recRightArr?.length) {
      if (recLeftArr?.length && recRightArr?.length) {
        res.push(
          recLeftArr[0] < recRightArr[0]
            ? (recLeftArr.shift() as E)
            : (recRightArr.shift() as E),
        );
      } else if (recLeftArr?.length) {
        res.push(recLeftArr.shift() as E);
      } else if (recRightArr?.length) {
        res.push(recRightArr.shift() as E);
      }
    }

    return res;
  };
}

console.log(
  mergeSort<number>([2, 9, 3, 4, 5, 1]),
);
