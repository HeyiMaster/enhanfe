function bubbleSort<E>(datas: E[]) {
  for (let i = 0, len = datas.length; i < len - 1; i++) {
    for (let j = 0; j < len - 1 - i; j++) {
      if (datas[j] < datas[j + 1]) {
        const temp = datas[j];
        datas[j] = datas[j + 1];
        datas[j + 1] = temp;
      }
    }
  }
  return datas;
}

console.log(
  bubbleSort<number>([2, 9, 3, 4, 5, 1]),
);
