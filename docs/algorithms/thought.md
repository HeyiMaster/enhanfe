---
# nav:

#   title: 数据结构与算法
title: 算法思想
order: 3
---

## 分而治之

先将问题分解为独立的子问题，然后递归将分解后的子问题进行求解，最后进行合操作。

### 翻转二叉树

```js
const tree = {
  value: 4,
  left: {
    value: 2,
    left: {
      value: 1,
    },
    right: {
      value: 3,
    },
  },
  right: {
    value: 7,
    left: {
      value: 6,
    },
    right: {
      value: 9,
    },
  },
};

function flip(root) {
  const rec = node => {
    if (!node) return;
    const left = rec(node.left);
    const right = rec(node.right);
    const res = {
      value: node.value,
    };
    if (right) res.left = right;
    if (left) res.right = left;
    return res;
  };
  return rec(root);
}

console.log(flip(tree));
```

### 判断二叉树是否相同

```js
function isSame(p, q) {
  if (!p && !q) return true;
  if (
    p &&
    q &&
    p.value === q.value &&
    isSame(p.left, q.left) &&
    isSame(p.right, q.right)
  ) {
    return true;
  }
  return false;
}

console.log(
  isSame(
    {
      value: 1,
      left: {
        value: 2,
      },
    },
    {
      value: 1,
      left: {
        value: 1,
      },
    },
  ),
);
// 输出 false
```

### 判断二叉树是否为镜像二叉树

```js
function isSymmetric(root) {
  if (!root) return true;
  const isMirror = (left, right) => {
    // 递归终点
    if (!left && !right) return true;
    if (
      left &&
      right &&
      left.value === right.value &&
      isMirror(left.left, right.right) &&
      isMirror(left.right, right.left)
    ) {
      return true;
    }
    return false;
  };
  return isMirror(root.left, root.right);
}

console.log(isSymmetric(tree));
```

## 动态规划

将问题分解为相互重叠的子问题，通过反复求解子问题，来解决原来的问题。
比较经典的题目比如：斐波那契数列。
定义子问题： `F(n) = F(n - 1) + F(n - 2)` ，然后反复执行这一操作，直至结束。

### 爬楼梯

一次只能爬 1 或 2 个台阶，给定 n 个台阶，求有多少种爬楼梯方法。

> - 爬到第 n 阶可以在第 n-1 阶爬 1 个台阶，或者在第 n-2 阶爬 2 个台阶。
> - F(n) = F(n-1) + F(n-2)

**递归版本**

```js
function climbStairs(n) {
  if (n < 2) return 1;
  return climbStairs(n - 1) + climbStairs(n - 2);
}

console.log(climbStairs(4)); // 5
```

**非递归版本**

```js
function climbStairs(n) {
  if (n < 2) return 1;
  const dp = [1, 1];
  for (let i = 2; i <= n; i++) {
    dp[i] = dp[i - 1] + dp[i - 2];
  }
  return dp.pop();
}

console.log(climbStairs(4));

// 优化
function climbStairs(n) {
  if (n < 2) return 1;
  let dp0 = 1;
  let dp1 = 1;
  for (let i = 2; i <= n; i++) {
    const temp = dp0;
    dp0 = dp1;
    dp1 = dp1 + temp;
  }
  return dp1;
}
```

### 打家劫舍

沿街偷窃，不能偷窃相邻两屋，给定一个房屋存放金额的非负整数数组，计算可以偷窃到的最高金额。
从小问题开始考虑，如果当前 K = 3，则表示，要么偷窃 1、3，要么偷窃 2 房间的金额，对比看这两种偷窃方式哪种得到的金额最大。公式可以表示如下：

- f(k) = 从前 k 个房间能偷到的最大金额数
- Ak = 第 k 个房间的金额
- f(k) = max(f(k-2) + Ak, f(k-1))

```js
function rob(nums) {
  if (nums.length === 0) return 0;
  const dp = [0, nums[0]];
  for (let i = 2; i <= nums.length; i++) {
    dp[i] = Math.max(dp[i - 2] + nums[i - 1], dp[i - 1]);
  }
  return dp.pop();
}

console.log(rob([2, 7, 9, 3, 1])); // 12
```

## 贪心算法

只考虑局部最优

### 买卖股票的最佳时机

给定一个数组，它的第 i 个元素是一支给定股票第 i 天的价格。设计一个算法计算可以获得的最大利润。你可以尽可能地完成更多的交易（多次买卖一支股票）。请注意：不能同时参与多笔交易（必须在再次购买前出售掉之前的股票）。

**解题思路**
局部最优：见好就收，见差不动，不做任何长远打算

```js
function maxProfit(prices) {
  let profit = 0;
  for (let i = 0; i < prices.length; i++) {
    if (prices[i] > prices[i - 1]) {
      profit += prices[i] - prices[i - 1];
    }
  }
  return profit;
}

console.log(maxProfit([7, 1, 5, 3, 6, 4])); // 7
```

## 回溯算法

回溯算法是一种渐进式寻找并构建问题解决方式的策略。先从一个可能的动作开始解决问题，如果不行，就回溯并选择另一个动作，知道将问题解决。

### 全排列

给定一个没有重复数字的序列，返回其所有可能的全排列

```js
function permute(nums) {
  const res = [];
  const backtrack = path => {
    if (path.length === nums.length) {
      res.push(path);
      return;
    }
    nums.forEach(n => {
      if (path.includes(n)) return;
      backtrack(path.concat(n));
    });
  };
  backtrack([]);
  return res;
}

console.log(permute([1, 2, 3]));
```

### 子集

给定一组不重复元素的整数数组 nums，返回该数组所有可能的子集，不可包含重复的子集。

```js
function subsets(nums) {
  const res = [];
  const backtrack = (subnums, count) => {
    if (subnums.length === count) {
      res.push(subnums);
      return;
    }
    nums.forEach(n => {
      if (subnums.includes(n) || n < subnums[subnums.length - 1]) return;
      backtrack(subnums.concat(n), count);
    });
  };
  for (let i = 0; i <= nums.length; i++) {
    backtrack([], i);
  }
  return res;
}

console.log(subsets([1, 2, 3]));
```
