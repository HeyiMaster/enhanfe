function insertionSort<E>(datas: E[]) {
  for (let i = 0, len = datas.length; i < len; i++) {
    const temp = datas[i];
    let j = i;
    while (j > 0) {
      if (datas[j - 1] > temp) {
        datas[j] = datas[j - 1];
      } else {
        break;
      }
      j--;
    }
    datas[j] = temp;
  }
  return datas;
}

console.log(
  insertionSort<number>([2, 9, 3, 4, 5, 1]),
);
