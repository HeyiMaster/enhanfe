function binarySearch<E>(arr: E[], item: E) {
  let low = 0;
  let hight = arr.length - 1;
  while (low <= hight) {
    const midIndex = Math.floor((low + hight) / 2);
    const ele = arr[midIndex];
    if (ele < item) {
      low = midIndex + 1;
    } else if (ele > item) {
      hight = midIndex - 1;
    } else {
      return midIndex;
    }
  }
  return -1;
}

console.log(binarySearch([1, 2, 3], 1));
