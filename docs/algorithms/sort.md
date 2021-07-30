---
# nav:
#   title: 数据结构与算法
title: 排序
order: 2
---

给你一个整数数组 `nums`，将该数组升序排列。

**示例 1**

```
输入：nums = [5,2,3,1]
输出：[1,2,3,5]
```

**示例 2**

```
输入：nums = [5,1,1,2,0,0]
输出：[0,0,1,1,2,5]
```

**提示**

- `1 <= nums.length <= 50000`
- `-50000 <= nums[i] <= 50000`

### 分析

经常会被问到的算法问题，关于数组的排序有很多方法，在合适的场景选择较好的解法即可，这里列举 5 种排序算法，分别是：**冒泡排序**、**选择排序**、**插入排序**、**快速排序**、**归并排序**

### 冒泡排序

```js
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

console.log(bubbleSort < number > [2, 9, 3, 4, 5, 1]);
```

### 选择排序

```js
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

console.log(selectionSort < number > [2, 9, 3, 4, 5, 1]);
```

### 插入排序

```js
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

console.log(insertionSort < number > [2, 9, 3, 4, 5, 1]);
```

### 归并排序

```js
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

```

### 快速排序

```js
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

console.log(quickSort < number > [2, 9, 3, 4, 5, 1]);
```

### 二分搜索

**循环版本**

```js
// 二分搜索的前提是数组从小到大已排序

function binarySearch<E>(arr: E[], item: E) {
  let low = 0;
  let high = arr.length - 1;
  while (low <= high) {
    const midIndex = Math.floor((low + high) / 2);
    const ele = arr[midIndex];
    if (ele < item) {
      low = midIndex + 1;
    } else if (ele > item) {
      high = midIndex - 1;
    } else {
      return midIndex;
    }
  }
  return -1;
}

console.log(binarySearch([1, 2, 3], 2));
```

**递归版本**

```js
function binarySearchRec(arr, item) {
  const rec = (low, high) => {
    if (low > high) return;
    const mid = Math.floor((low + high) / 2);
    const ele = arr[mid];
    if (item > ele) {
      return rec(mid + 1, high);
    } else if (item < ele) {
      return rec(low, mid - 1);
    } else {
      return mid;
    }
  };
  return rec(0, arr.length - 1);
}

console.log(binarySearchRec(quickSort(data), 3));
```
