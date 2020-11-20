---
nav:
  title: 数据结构与算法
group:
  title: 算法
  order: 2
  path: /algorithms/algorithm
title: 数组排序
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
var sortArray = function(nums) {
  const numsLen = nums.length;
  for (let i = 0; i < numsLen; i++) {
    for (let j = 0; j < numsLen; j++) {
      if (nums[i] < nums[j]) {
        const temp = nums[i];
        nums[i] = nums[j];
        nums[j] = temp;
      }
    }
  }
  return nums;
};
```

### 选择排序

```js
var sortArray = function(nums) {
  for (let i = 0; i < nums.length; i++) {
    let min = Infinity;
    let minIndex;
    for (j = i; j < nums.length; j++) {
      if (nums[j] < min) {
        min = nums[j];
        minIndex = j;
      }
    }
    const temp = nums[i];
    nums[i] = nums[minIndex];
    nums[minIndex] = temp;
  }
  return nums;
};
```

### 插入排序

```js
var sortArray = function(nums) {
  for (let i = 1; i < nums.length; i++) {
    let temp = nums[i];
    let j = i - 1;
    for (; j >= 0; j--) {
      if (temp >= nums[j]) break;
      nums[j + 1] = nums[j];
    }
    nums[j + 1] = temp;
  }
  return nums;
};
```

### 快速排序

```js
var sortArray = function(nums) {
  if (nums.length < 2) return nums;
  return quickSort(nums, 0, nums.length - 1);
};

function quickSort(nums, left, right) {
  if (left >= right) return;
  let pivotIndex = partition(nums, left, right);
  quickSort(nums, left, pivotIndex - 1);
  quickSort(nums, pivotIndex + 1, right);
  return nums;
}

function partition(nums, left, right) {
  let pivot = right;
  let leftIndex = left;
  for (let i = left; i < right; i++) {
    if (nums[i] < nums[pivot]) {
      [nums[leftIndex], nums[i]] = [nums[i], nums[leftIndex]];
      leftIndex++;
    }
  }
  [nums[leftIndex], nums[pivot]] = [nums[pivot], nums[leftIndex]];
  return leftIndex;
}
```

### 归并排序

```js
var sortArray = function(nums) {
  return mergeSort(nums, 0, nums.length - 1);
};

function mergeSort(nums, left, right) {
  if (left >= right) return nums;
  let mid = (left + right) >> 1;
  mergeSort(nums, left, mid);
  mergeSort(nums, mid + 1, right);
  return merge(nums, left, mid, right);
}

function merge(nums, left, mid, right) {
  let ans = [];
  let c = 0,
    i = left,
    j = mid + 1;
  while (i <= mid && j <= right) {
    if (nums[i] < nums[j]) {
      ans[c++] = nums[i++];
    } else {
      ans[c++] = nums[j++];
    }
  }
  while (i <= mid) {
    ans[c++] = nums[i++];
  }
  while (j <= right) {
    ans[c++] = nums[j++];
  }
  for (let i = 0; i < ans.length; i++) {
    nums[i + left] = ans[i];
  }
  return nums;
}
```
