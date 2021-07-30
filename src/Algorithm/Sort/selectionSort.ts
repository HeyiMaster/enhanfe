function selectionSort<E>(datas: E[]) {
  for (let i = 0, len = datas.length; i < len; i++) {
    let minIndex = i;
    for (let j = i; j < len; j++) {
      if (datas[j] < datas[minIndex]) {
        minIndex = j;
      }
    }
    const temp = datas[i];
    datas[i] = datas[minIndex];
    datas[minIndex] = temp;
  }
  return datas;
}

console.log(
  selectionSort<number>([2, 9, 3, 4, 5, 1]),
);
