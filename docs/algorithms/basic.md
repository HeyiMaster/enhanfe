---
nav:
  title: 数据结构与算法
title: 基础
order: 1
---

## 时间复杂度与空间复杂度

时间复杂度与空间复杂度用来衡量算法的性能，算法可能在一定时间内都需要不断优化，优化过程需要同时兼顾代码可读性与代码运行性能。

时间复杂度我们一般使用大 O 表示法，常见时间复杂度表示如下所示：

- $O(1)$
- $O(log_n)$
- $O(n)$
- $O(n^2)$

性能由上至下一次降低。

空间复杂度我们一般使用大 S 表示法，例如 $S(n)$、$S(1)$。

## 栈

栈是非常常见的一种数据结构，很多算法中都需要使用栈作为辅助。栈的特性可归纳为：

- 先进后出

常见栈的应用有：

- 括号匹配
- 作为工具，用于遍历数或图

### 经典题

**请使用栈完成二叉树的前序遍历**

```js
function traverse(root) {
  const res = [];
  const stack = [];
  if (root) stack.push(root);
  while (stack.length) {
    const n = stack.pop();
    res.push(n.val);
    const { left, right } = n;
    if (right) stack.push(right);
    if (left) stack.push(left);
  }
  return res;
}
```

## 队列

队列用于解决**先进先出**的问题，保证有序性。在 JavaScript 异步处理中，存在任务队列以调度异步任务。

常见队列的应用有：

- react 中的调度
- 任务队列

### 经典题

**请使用队列统计最近请求次数**

```js
function RecentCounter() {
  this.q = [];
}

RecentCounter.prototype.ping = function(t) {
  this.q.push(t);
  while (this.q[0] < t - 3000) {
    this.q.shift();
  }
  return this.q.length;
};
```

浏览器 JavaScript 中的事件队列

![eventloop](./assets/basic-eventloop.png)

## 链表

链表可用于存储不连续的数据，通常前后节点的关系使用指针来确立（next），在有些场景下链表中每个节点上可能既存在前指针，又存在后指针。普通链表示例如下：

![linked](./assets/basic-linked.png)

对于链表相关的算法，常用的技巧有一下几点：

- 双指针【反转链表】
- 快慢指针【判断链表是否有环】

### 经典题

**反转链表**

反转链表运用到了双指针的技巧，整体分析可能会觉得比较复杂，我们不妨两个节点一分析，链表的反转其实是将前后两个节点顺序交换，最终输出生成后的链表。

```js
function reverse(head) {
  // 首先建立两个指针
  let p1 = head;
  let p2 = null;

  while (p1) {
    const temp = p1.next;
    p1.next = p2;
    p2 = p1;
    p1 = temp;
  }
  return p2;
}
```

---

**判断链表是否有环**

判断链表是否有环是一个很经典的算法题，我们联想到解过的数学题，两个运动员同时从起点出发围绕跑到赛跑，跑得快可能会和跑得慢的运动员相遇，由此我们抽象出了两个指针——快慢指针，在遍历链表的过程中，快指针每次走两步，慢指针每次走一步，若快慢指针相遇，则当前遍历到的为同一个节点。

```js
function linkHasCycle(head) {
  // 两个指针，快慢指针
  let p1 = head;
  let p2 = head;

  while (p1 && p2 && p2.next) {
    p1 = p1.next;
    p2 = p2.next.next;
    // 如果此时 p1 === p2，证明为同一个节点，即链表成环
    if (p1 === p2) {
      return true;
    }
  }
  return false;
}
```

---

**JavaScript 中原型继承的应用**

请实现 instanceOf？

instanceOf 的原理是遍历原型链，通过对比原型链上的 **proto** 属性是否等于给定的 prototype，等于则返回 true，否则返回 false。

```js
function instanceOf(A, B) {
  let p = A;
  while (p) {
    if (p === B.prototype) {
      return true;
    }
    p = p.__proto__;
  }
  return false;
}

// 进行验证
instanceOf([], Array); // true
```

## 集合

JavaScript 也加入了集合的概念，即 Set，集合的特点为：

- 元素无重复
- 存储随机且不连续

我们通常使用 Set 来解决去重问题，辅助数组的一些操作。

```js
const arr = [1, 2, 2, 3];
const uniqArr = [...new Set(arr)]; // [1, 2, 3]
```

### 经典题

**求两个数组的交集**

给定两个数组：[1, 2, 2, 1]、[2, 2]，输出两者交集 [2]。

```js
function intersection(nums1, nums2) {
  return [...new Set(nums1)].filter(n => nums2.includes(n));
}
```

## 字典

JavaScript 也加入了字典，即 Map，字典的特点：

- 满足 key-value 形式
- 随机存储

其中还有 WeakMap，弱引用，将对象作为键，利于垃圾回收。

### 经典题

**求两个数组的交集**

给定两个数组：[1, 2, 2, 1]、[2, 2]，输出两者交集 [2]。这道题目我们可以使用字典来进行优化。即将 nums1 中的元素先添加到字典映射中，然后遍历 nums2，如果遍历到的元素在字典映射中有值则记录该值并将这个值从 nums2 中移除，以此求得两数组交集。

```js
function intersection(nums1, nums2) {
  // const map;
}
```

---

**无重复字符的最长子串**

给定一个字符串，求该字符串的无重复字符最长子串。使用双指针滑动窗口，当扫描到的左右指针对应的值相等时，则将左指针向右移动一位，最终右指针指向字符串最后一个值时，扫描结束，返回此时窗口所包含的子串。

```js
function lengthOfLongestSubstring(s) {
  let l = 0;
  let len = 0;
  const map = new Map();
  for (let r = 0; r < s.length; r++) {
    // 获取当前右指针指向元素
    const e = s[r];
    const mapVal = map.get(e);
    if (map.has(e) && mapVal >= l) {
      // 此时将作指针移动到不重复的元素上
      l = mapVal + 1;
    }
    len = Math.max(len, r - l + 1);
    // 记录对应元素的索引
    map.set(e, r);
  }
  return len;
}
```

---

**最小覆盖子串**

给定一个字符串 S，一个字符串 T，请在 S 中找到包含 T 所有字符的最小子串。

LeetCode 76
输入：s = "ADOBECODEBANC", t = "ABC"
输出："BANC

使用滑动窗口，定义左右指针，首先将右指针向右移动。

```js
/**
 * 给你一个字符串 s 、一个字符串 t 。返回 s 中涵盖 t 所有字符的最小子串。如果 s 中不存在涵盖 t 所有字符的子串，则返回空字符串 "" 。
 * 注意：如果 s 中存在这样的子串，我们保证它是唯一的答案。
 *
 * 输入：s = "ADOBECODEBANC", t = "ABC"
 * 输出："BANC"
 *
 * @param {string} s
 * @param {string} t
 */
function minWindow(s, t) {
  // 初始化两个指针
  let left = 0;
  let right = 0;

  // 首先将 t 中元素存入 map 中，记录每个元素所需要的个数
  const needsMap = new Map();
  for (let char of t) {
    needsMap.set(char, needsMap.has(char) ? needsMap.get(char) + 1 : 1);
  }

  // 记录一个当前所需匹配值数，默认为 t 的长度
  let currentNeedLen = t.length;

  // 存储返回结果
  let resStr = '';

  // 滑动右指针
  while (right <= s.length) {
    const c1 = s[right];
    // 消费 map 中的数据，将所需个数匹配至 0
    if (needsMap.has(c1)) {
      needsMap.set(c1, needsMap.get(c1) - 1);
      // 如果对应的元素还需个数为0，则表示已经的值包含了该元素所有个数
      if (needsMap.get(c1) === 0) currentNeedLen -= 1;
    }

    // 移动左指针以缩小字符串长度
    while (currentNeedLen === 0) {
      const newStr = s.slice(left, right + 1);
      resStr = !resStr || resStr.length > newStr.length ? newStr : resStr;
      const c2 = s[left];
      // 如果剔除的左边元素剔除后对于匹配元素无影响，则可以继续剔除
      if (needsMap.has(c2)) {
        needsMap.set(c2, needsMap.get(c2) + 1);
        if (needsMap.get(c2) === 1) {
          currentNeedLen += 1;
        }
      }
      left += 1;
    }
    // 向右移动右指针
    right++;
  }

  return resStr;
}

console.log(minWindow('ADOBECODEBANC', 'ABC'));
```
