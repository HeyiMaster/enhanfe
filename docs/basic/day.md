---
nav:
  title: 基础
title: 每日一问
---

## React / Vue 项目为什么要在列表组件中写 key，其作用是什么？

> key 是虚拟节点的唯一 id，通过可以能够更快更准确找到更新前对应的虚拟节点。

`Vue`和`React`都是通过 diff 算法对比新旧虚拟树节点差异，然后更新节点。当新旧节点对比不一致时，会根据节点的 key 去找寻旧节点，如果未找到则表明为新的节点，反之会进行复用。

针对这个问题我们应该辩证看待，并不是说书写 key 一定是好的，一定是提升性能的。

### Vue

如果是简单列表，且列表只是单纯数据展示，无相关状态的更改，则可不使用 key，这样在数据更新重新渲染时会更快，因为会跳过 key 的检索与复用逻辑

### React

不管何时，都要求列表必须带 key，大家阅读过`React`都会发现，在 commit 阶段，更新操作通过复用来提升性能，这样虽然会有额外性能开销，但是对比频繁的 DOM 更新，还是能接受的。

## [1, 2, 3].map(parseInt)是多少？说明理由

首先考虑 `map` 方法的回调函数参数含义

`arr.map(function callback(currentValue[, index[, array]]) { }`

- currentValue 当前遍历的值
- index 当前遍历索引
- array 遍历数组

然后我们分析 `parseInt` 参数的含义

`parseInt(string, radix)`

- string 被处理的值
- radix 基数即进制（2、8、10、16...进制）

当遍历到 1 时，map 回调函数的参数分别为：1、0，即 parseInt(1, 0)，1 的十进制数 为 1

当遍历到 2 时，map 回调函数的参数分别为：2、1，即 parseInt(2, 1)，1 进制数为 2 的数不存在，即为 `NaN`

当遍历到 3 时，map 回调函数的参数分别为：3、2，即 parseInt(3, 2)，2 进制数为 3 的数不存在，即为 `NaN`

## 什么是防抖和节流？他们有什么区别？如何实现呢？

在高频事件（例如浏览器页面滚动）触发时，为了优化提升性能，我们经常使用到防抖与节流。

防抖：触发高频事件后 n 秒内函数只会执行一次，如果 n 秒内高频事件再次被触发，则重新计算时间

节流：高频事件触发，但在 n 秒内只会执行一次，所以节流会稀释函数的执行频率

防抖和节流的区别在于，`防抖` 是如果在给定 n 秒内再次出发，则会重新计算触发事件，如果你一直触发，则一直重新计算，直至你停下；`节流` 与防抖的区别是，不管你是否重复触发，我都会在你给定的时间到来时，执行事件函数。

**防抖**

```js
function debounce(fn, wait) {
  let timeout = null; // 存放定时器返回值
  return function() {
    clearTimeout(timeout); // 每当用户输入时将前一个定时器清除掉
    timeout = setTimeout(() => {
      // 然后又创建一个新的 setTimeout, 这样就能保证输入字符后的 interval 间隔内如果还有字符输入的话，就不会执行 fn 函数
      fn.apply(this, arguments);
    }, wait);
  };
}
```

当然，考虑到其他一些优化后，我们最终优化的代码，支持立即执行、返回值

```js
function debounce(func, wait, immediate) {
  var timeout, result;

  return function() {
    var context = this;
    var args = arguments;

    if (timeout) clearTimeout(timeout);
    if (immediate) {
      // 如果已经执行过，不再执行
      var callNow = !timeout;
      timeout = setTimeout(function() {
        timeout = null;
      }, wait);
      if (callNow) result = func.apply(context, args);
    } else {
      timeout = setTimeout(function() {
        func.apply(context, args);
      }, wait);
    }
    return result;
  };
}
```

**节流**

时间戳形式实现

```js
function throttle(func, wait) {
  var context, args;
  var previous = 0;

  return function() {
    var now = +new Date();
    context = this;
    args = arguments;
    if (now - previous > wait) {
      func.apply(context, args);
      previous = now;
    }
  };
}
```

定时器实现

```js
function throttle(func, wait) {
  var timeout;
  var previous = 0;

  return function() {
    context = this;
    args = arguments;
    if (!timeout) {
      timeout = setTimeout(function() {
        timeout = null;
        func.apply(context, args);
      }, wait);
    }
  };
}
```

最终的优化

```js
function throttle(func, wait, options) {
  var timeout, context, args, result;
  var previous = 0;
  if (!options) options = {};

  var later = function() {
    previous = options.leading === false ? 0 : new Date().getTime();
    timeout = null;
    func.apply(context, args);
    if (!timeout) context = args = null;
  };

  var throttled = function() {
    var now = new Date().getTime();
    if (!previous && options.leading === false) previous = now;
    var remaining = wait - (now - previous);
    context = this;
    args = arguments;
    if (remaining <= 0 || remaining > wait) {
      if (timeout) {
        clearTimeout(timeout);
        timeout = null;
      }
      previous = now;
      func.apply(context, args);
      if (!timeout) context = args = null;
    } else if (!timeout && options.trailing !== false) {
      timeout = setTimeout(later, remaining);
    }
  };
  return throttled;
}
```

添加取消功能

```js
throttled.cancel = function() {
  clearTimeout(timeout);
  previous = 0;
  timeout = null;
};
```

## 介绍下 Set、Map、WeakSet 和 WeakMap ？

`Set` 和 `Map` 主要的应用场景在于 **数据重组** 和 **数据储存**

`Set` 是一种叫做**集合**的数据结构，Map 是一种叫做**字典**的数据结构

- Set
  - 成员唯一、无序且不重复
  - [value, value]，键值与键名是一致的（或者说只有键值，没有键名）
  - 可以遍历，方法有：add、delete、has
- WeakSet
  - 成员都是对象
  - 成员都是弱引用，可以被垃圾回收机制回收，可以用来保存 DOM 节点，不容易造成内存泄漏
  - 不能遍历，方法有 add、delete、has
- Map
  - 本质上是键值对的集合，类似集合
  - 可以遍历，方法很多可以跟各种数据格式转换
- WeakMap
  - 只接受对象作为键名（null 除外），不接受其他类型的值作为键名
  - 键名是弱引用，键值可以是任意的，键名所指向的对象可以被垃圾回收，此时键名是无效的
  - 不能遍历，方法有 get、set、has、delete

## 介绍下深度优先遍历和广度优先遍历，如何实现 ？

在进行图的遍历时，会遇到 `深度优先` 和 `广度优先` 。通过字面意思，我们能猜出大概，一个是垂直深入，一个是发散广度。

- `深度优先` 我们可以借助栈保存临时数据，直至在某个分支无下一个元素，则出栈，并进行判断该节点的兄弟节点时候有下个节点，有则遍历，以此类推。

- `广度优先` 借助队列从第一个节点开始，先遍历完所有下一个节点，再一次遍历节点的下一个节点。

**深度优先（DFS）**

```js
Graph.prototype.dfs = function() {
  var marked = [];
  for (var i = 0; i < this.vertices.length; i++) {
    if (!marked[this.vertices[i]]) {
      dfsVisit(this.vertices[i]);
    }
  }

  function dfsVisit(u) {
    let edges = this.edges;
    marked[u] = true;
    console.log(u);
    var neighbors = edges.get(u);
    for (var i = 0; i < neighbors.length; i++) {
      var w = neighbors[i];
      if (!marked[w]) {
        dfsVisit(w);
      }
    }
  }
};
```

**广度优先（BFS）**

```js
Graph.prototype.bfs = function(v) {
  var queue = [],
    marked = [];
  marked[v] = true;
  queue.push(v); // 添加到队尾
  while (queue.length > 0) {
    var s = queue.shift(); // 从队首移除
    if (this.edges.has(s)) {
      console.log('visited vertex: ', s);
    }
    let neighbors = this.edges.get(s);
    for (let i = 0; i < neighbors.length; i++) {
      var w = neighbors[i];
      if (!marked[w]) {
        marked[w] = true;
        queue.push(w);
      }
    }
  }
};
```

## ES5 和 ES6 的继承有什么区别？

- `class` 声明变量会提升，但不会初始化赋值。变量进入暂时性死区，类似于 `let`、`const` 声明

```js
const p = new People(); // it's ok
function People() {
  this.bar = 1;
}

const m = new Man(); // ReferenceError: Foo is not defined
class Man {
  constructor() {
    this.foo = 1;
  }
}
```

- `class` 声明内部会启用严格模式

```js
function People() {
  baz = 1; // it's ok
}
const p = new People();

class Man {
  constructor() {
    fol = 1; // ReferenceError: fol is not defined
  }
}
const m = new Man();
```

- `class` 的所有方法（包括静态方法和实例方法）是不可枚举

```js
// 引用一个未声明的变量
function People() {
  this.bar = 1;
}
People.say = function() {
  return 1;
};
People.prototype.eat = function() {
  // ...
};
const pKeys = Object.keys(Bar); // ['say']
const pProtoKeys = Object.keys(Bar.prototype); // ['eat']

class Man {
  constructor() {
    this.foo = 1;
  }
  static say() {
    return 1;
  }
  eat() {
    // ...
  }
}
const mKeys = Object.keys(Man); // []
const mProtoKeys = Object.keys(Man.prototype); // []
```

- `class` 的所有方法（包括静态方法和实例方法）都没有原型对象 prototype，所以也没有`[[construct]]`，不能使用 `new` 来调用。

```js
function People() {
  this.bar = 1;
}
People.prototype.print = function() {
  console.log(this.bar);
};

const p = new People();
const pPrint = new bar.print(); // it's ok

class Man {
  constructor() {
    this.foo = 42;
  }
  print() {
    console.log(this.foo);
  }
}
const m = new Man();
const mPrint = new m.print(); // TypeError: foo.print is not a constructor
```

- 必须使用 `new` 调用 `class`。

```javascript
function People() {
  this.bar = 1;
}
const p = People(); // it's ok

class Man {
  constructor() {
    this.foo = 1;
  }
}
const m = Man(); // TypeError: Class constructor Foo cannot be invoked without 'new'
```

- `class` 内部无法重写类名。

```js
function People() {
  People = 'Pap'; // it's ok
  this.bar = 1;
}
const p = new People();
// People: 'Pap'
// bar: People {bar: 1}

class Man {
  constructor() {
    this.foo = 42;
    Man = 'Woman'; // TypeError: Assignment to constant variable
  }
}
const m = new Man();
Man = 'Fol'; // it's ok
```

## 说说 setTimeout、Promise、Async/Await 的区别

考虑这个问题，我们首先回顾一个概念：事件循环中的宏任务队列和微任务队列。

- setTimeout 的回调函数放到宏任务队列里，等到执行栈清空以后执行
- promise.then 里的回调函数会放到相应宏任务的微任务队列里，等宏任务里面的同步代码执行完再执行
- async 函数表示函数里面可能会有异步方法，await 后面跟一个表达式，async 方法执行时，遇到 await 会立即执行表达式，然后把表达式后面的代码放到微任务队列里，让出执行栈让同步代码先执行

我们通过简单代码来理解一下

### setTimeout

```js
console.log('start');
setTimeout(function() {
  console.log('settimeout');
});
console.log('end');
// 输出顺序：start->end->settimeout
```

### Promise

Promise 本身是**同步的立即执行函数**， 当在 executor 中执行 resolve 或者 reject 的时候, 此时是异步操作， 会先执行 then/catch 等，当主栈完成后，才会去调用 resolve/reject 中存放的方法执行，打印 p 的时候，是打印的返回结果，一个 Promise 实例。

```js
console.log('script start');
let promise1 = new Promise(function(resolve) {
  console.log('promise1');
  resolve();
  console.log('promise1 end');
}).then(function() {
  console.log('promise2');
});
setTimeout(function() {
  console.log('settimeout');
});
console.log('script end');
// 输出顺序: script start->promise1->promise1 end->script end->promise2->settimeout
```

当 JS 主线程执行到 Promise 对象时，

- promise1.then() 的回调就是一个 task
- promise1 是 resolved 或 rejected: 那这个 task 就会放入当前事件循环回合的 microtask queue
- promise1 是 pending: 这个 task 就会放入 事件循环的未来的某个(可能下一个)回合的 microtask queue 中
- setTimeout 的回调也是个 task ，它会被放入 macrotask queue 即使是 0ms 的情况

### async/await

```js
async function async1() {
  console.log('async1 start');
  await async2();
  console.log('async1 end');
}
async function async2() {
  console.log('async2');
}

console.log('script start');
async1();
console.log('script end');

// 输出顺序：script start->async1 start->async2->script end->async1 end
```

async 函数返回一个 Promise 对象，当函数执行的时候，一旦遇到 await 就会先返回，等到触发的异步操作完成，再执行函数体内后面的语句。可以理解为，是让出了线程，跳出了 async 函数体。

### 最后看看 babel es8 编译 async/await 的结果

```js
async function asyncTest() {
  const ret = await asyncFunction();
}
```

转化为

```js
function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {
  try {
    var info = gen[key](arg);
    var value = info.value;
  } catch (error) {
    reject(error);
    return;
  }
  if (info.done) {
    resolve(value);
  } else {
    Promise.resolve(value).then(_next, _throw);
  }
}

function _asyncToGenerator(fn) {
  return function() {
    var self = this,
      args = arguments;
    return new Promise(function(resolve, reject) {
      var gen = fn.apply(self, args);
      function _next(value) {
        asyncGeneratorStep(gen, resolve, reject, _next, _throw, 'next', value);
      }
      function _throw(err) {
        asyncGeneratorStep(gen, resolve, reject, _next, _throw, 'throw', err);
      }
      _next(undefined);
    });
  };
}

function asyncTest() {
  return _asyncTest.apply(this, arguments);
}

function _asyncTest() {
  _asyncTest = _asyncToGenerator(function*() {
    const ret = yield asyncFunction();
  });
  return _asyncTest.apply(this, arguments);
}
```

## call 和 apply 的区别是什么，哪个性能更好一些

1. Function.prototype.apply 和 Function.prototype.call 的作用是一样的，区别在于传入参数的不同；
2. 第一个参数都是，指定函数体内 this 的指向；
3. 第二个参数不同，apply 是传入带下标的集合，数组或者类数组，apply 把它传给函数作为参数。call 从第二个开始传入的参数是不固定的，都会传给函数作为参数。
4. call 比 apply 的性能要好，平常可以多用 call, call 传入参数的格式正是内部所需要的格式

## 为什么通常在发送数据埋点请求的时候使用的是 1x1 像素的透明 gif 图片？

1. 跨域友好支持，执行过程无阻塞
2. 执行过程无阻塞
3. 利用空白 gif 或 1x1 px 的 img 是互联网广告或网站监测方面常用的手段，简单、安全、相比 PNG/JPG 体积小，1px 透明图，对网页内容的影响几乎没有影响，这种请求用在很多地方，比如浏览、点击、热点、心跳、ID 颁发等等
4. 触发 GET 请求之后不需要获取和处理数据、服务器也不需要发送数据
5. 图片请求不占用 Ajax 请求限额
6. GIF 的最低合法体积最小（最小的 BMP 文件需要 74 个字节，PNG 需要 67 个字节，而合法的 GIF，只需要 43 个字节）

## 要求设计 LazyMan 类，实现以下功能

```js
LazyMan('Tony');
// Hi I am Tony

LazyMan('Tony')
  .sleep(10)
  .eat('lunch');
// Hi I am Tony
// 等待了10秒...
// I am eating lunch

LazyMan('Tony')
  .eat('lunch')
  .sleep(10)
  .eat('dinner');
// Hi I am Tony
// I am eating lunch
// 等待了10秒...
// I am eating diner

LazyMan('Tony')
  .eat('lunch')
  .eat('dinner')
  .sleepFirst(5)
  .sleep(10)
  .eat('junk food');
// Hi I am Tony
// 等待了5秒...
// I am eating lunch
// I am eating dinner
// 等待了10秒...
// I am eating junk food
```

### 分析

这是一个很典型的职责链调用问题，我们使用过 `jQuery` 应该不会陌生链式调用，但是我们发现现在功能中添加了异步操作，我们可以将需要调用的内容存入队列，然后逐步调用。

### 代码

```js
class LazyManClass {
  constructor(name) {
    this.name = name;
    this.queue = [];
    console.log(`Hi I am ${name}`);
    setTimeout(() => {
      this.next();
    }, 0);
  }

  sleepFirst(time) {
    const fn = () => {
      setTimeout(() => {
        console.log(`等待了${time}秒...`);
        this.next();
      }, time);
    };
    this.queue.unshift(fn);
    return this;
  }

  sleep(time) {
    const fn = () => {
      setTimeout(() => {
        console.log(`等待了${time}秒...`);
        this.next();
      }, time);
    };
    this.queue.push(fn);
    return this;
  }

  eat(food) {
    const fn = () => {
      console.log(`I am eating ${food}`);
      this.next();
    };
    this.queue.push(fn);
    return this;
  }

  next() {
    const fn = this.queue.shift();
    fn && fn();
  }
}

function LazyMan(name) {
  return new LazyManClass(name);
}
```

## 请实现一个 add 函数，满足以下功能。

```js
add(1); 	// 1
add(1)(2);  	// 3
add(1)(2)(3)；  // 6
add(1)(2, 3);   // 6
add(1, 2)(3);   // 6
add(1, 2, 3);   // 6
```

### 分析

这是一个很典型的函数柯里化问题，使用场景很多，比如惰性求值、函数 bind 实现等，理解这个问题能够让我们更懂闭包问题，本题解法核心其实就是运用闭包暂存参数，待到执行时机，执行函数。

### 代码

```js
const currying = (
  fn, // 1
) =>
  (judge = (
    ...args // 2
  ) =>
    args.length >= fn.length // 3
      ? fn(...args) // 4
      : (...arg) => judge(...args, ...arg)); // 5
```

1. 定义柯里化函数，比如我们想将 `sum` 函数柯里化为如题 `add` 函数，第一步传入的 `fn` 参数即为 `add`
2. 定义一个判断函数，判断我们当前是否满足调用条件
3. 当收集到的参数等于传入参数，则执行第 4 步，否则执行第 5 步
4. 调用 `fn` ，并传入收集的参数
5. 继续收集参数

## 说说 HTTPS 原理及握手过程

**概念**

HTTP 是运行在 TCP 层之上的，而 HTTPS 则是在 HTTP 和 TCP 层直接多加了一个 SSL/TSL 层，SSL 层向上提供加密和解密的服务，对 HTTP 来说是透明的。

**对称加密与非对称加密**

加密和解密都使用同一种算法的加密方法，称之为**对称加密**。加密和解密使用不同的算法，称为**非对称加密**。

对称加密需要一把钥匙就够了，非对称加密算法需要两把钥匙——公钥和私钥。用公钥加密的密文只能用相应的私钥解开，用私钥加密的密文只能用相应的公钥解开。其中，公钥是公开的，私钥是不对外公开的。

两者的主要区别在于密钥的长度不同，长度越长，相应的加/解密花费的时间就会更长，对称加密使用的密钥长度会短一些。

SSL 结合了这两种加密算法的优点。利用**非对称加密**算法来协商生成对称加密的密钥，然后之后就用**对称加密**来进行通信。

### client --> server

**Client Hello**

握手开始时，总是优先客户端会发送 `Client Hello` 信息给服务端，主要包含

- Version Number

客户端支持的协议版本

- Randomly Generated Data

  32 字节长度的随机值，用于之后生成主密钥。

* Session Identification

  Session ID，第一次连接时为空。

- Cipher Suite

  客户端支持的加密算法列表，按优先级顺序排列。

### server --> client

**Server Hello**

接着，服务端收到客户端发来的消息之后，会返回 `Server Hello` 信息给客户端，告知客户端接下来使用的一些参数

- Version Number

  通信协议版本

* Randomly Generated Data

  32 字节长度的随机值，用于之后生成主密钥

- Session Identification

  Session ID

* Cipher Suite

  加密算法

**Server Certificate**

服务端还会带上证书返回给客户端。证书中含有服务端的公钥、网站地址、证书的颁发机构等信息。

客户端收到服务端返回的证书之后，会验证该证书的真实合法性。

**Server Key Exchange**

这个是可选的，取决于使用的加密算法。主要是携带密钥交换的额外数据。

**Server Hello Done**

表示服务端已经发送完毕，并等待客户端回应。

### client --> server

**Client Key Exchange**

客户端使用之前发送给服务端及服务端返回的随机数，生成预主密钥，然后用服务端返回的公钥进行加密。

**Change Cipher Spec**

告诉服务端，之后的所有信息都会使用协商好的密钥和算法加密

**Client Finished**

客户端的握手工作已经完成。这条信息是握手过程中所有消息的散列值。

### server --> client

**Change Cipher Spec Message**

告知客户端，会使用刚刚协商的密钥来加密信息

**Server Finished Message**

表示服务端的握手工作已经完成

![6rF9hx](http://walker-markdown.oss-cn-shenzhen.aliyuncs.com/uPic/6rF9hx.jpg)

## 【百度】实现 (5).add(3).minus(2) 功能。

**概念**

考察数字对象原型拓展

```js
Number.prototype.add = function(n) {
  return this.valueOf() + n;
};
Number.prototype.minus = function(n) {
  return this.valueOf() - n;
};
```

## 让一个 div 水平垂直居中

**`flex` 布局**

```css
div.parent {
  display: flex;
  justify-content: center;
  align-items: center;
}
```

**定位**

```css
div.parent {
  position: relative;
}
div.child {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
/* 或者 */
div.child {
  width: 50px;
  height: 10px;
  position: absolute;
  top: 50%;
  left: 50%;
  margin-left: -25px;
  margin-top: -5px;
}
/* 或 */
div.child {
  width: 50px;
  height: 10px;
  position: absolute;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  margin: auto;
}
```

**grid 布局**

```css
div.parent {
  display: grid;
}
div.child {
  justify-self: center;
  align-self: center;
}
```

**Inline-block**

```css
div.parent {
  font-size: 0;
  text-align: center;
  &::before {
    content: '';
    display: inline-block;
    width: 0;
    height: 100%;
    vertical-align: middle;
  }
}
div.child {
  display: inline-block;
  vertical-align: middle;
}
```

**table**

```css
div.parent {
  display: table;
}
div.child {
  display: table-cell
  vertical-align: middle;
  text-align: center;
}
```

## 箭头函数与普通函数（function）的区别

引入箭头函数有两个方面的作用：更简短的函数并且不绑定 this。箭头函数与普通函数不同之处有：

1. 箭头函数没有 this，它会从自己的作用域链的上一层继承 this（因此无法使用 apply / call / bind 进行绑定 this 值）；
2. 不绑定 arguments，当在箭头函数中调用 aruguments 时同样会向作用域链中查询结果；
3. 不绑定 super 和 new.target；
4. 没有 prototype 属性，即指向 undefined；
5. 无法使用 new 实例化对象，因为普通构造函数通过 new 实例化对象时 this 指向实例对象，而箭头函数没有 this 值，同时箭头函数也没有 prototype。

另外提一点，在使用 `React` 、`Vue`相关框架时，要注意，生命周期函数使用箭头函数会带来一些问题。

## Redux 的 reducer 为什么不能有副作用的操作

Redux 的设计参考了 Flux 的模式，作者希望以此来实现时间旅行，保存应用的历史状态，实现应用状态的可预测。所以整个 Redux 都是函数式编程的范式，要求`reducer` 是**纯函数**也是自然而然的事情，使用纯函数才能保证相同的输入得到相同的输入，保证状态的可预测。所以 Redux 有三大原则：

- 单一数据源 state
- state 只读，Redux 没有暴露出直接修改 state 的接口，必须通过 action 来触发修改
- 使用纯函数来修改 state，reducer 必须是纯函数

```
currentState = currentReducer(currentState, action)
```

`currentReducer` 就是我们在 `createStore` 中传入的 `reducer`，`reducer` 用来计算 state 的，所以它的返回值必须是 `state` ，也就是我们整个应用的状态，而不能是 `promise`之类的。

要在 reducer 中加入异步的操作，如果你只是单纯想执行异步操作，不会等待异步的返回，那么在 reducer 中执行的意义是什么。如果想把异步操作的结果反应在 state 中，首先整个应用的状态将变的不可预测，违背 Redux 的设计原则，其次，此时的 currentState 将会是 promise 之类而不是我们想要的应用状态，根本是行不通的。

## 介绍下 BFC 及其应用

BFC （block format context）就是块级格式上下文，是页面盒模型布局中的一种 CSS 渲染模式，相当于一个独立的容器，里面的元素和外部的元素相互不影响

**创建 BFC 的方式**

1. html 根元素
2. float 浮动
3. 绝对定位
4. overflow 不为 visiable
5. display 为表格布局或者弹性布局
6. 行内块元素、网格布局、contain 值为 layout、content 或 strict 的元素

**BFC 的特性**

1. 内部 box 会在垂直方向，一个接一个地放置。
2. Box 垂直方向的距离由 margin 决定，在一个 BFC 中，两个相邻的块级盒子的垂直外边距会产生折叠。
3. 在 BFC 中，每一个盒子的左外边缘（margin-left）会触碰到容器的左边缘(border-left)（对于从右到左的格式来说，则触碰到右边缘）
4. 形成了 BFC 的区域不会与 float box 重叠
5. 计算 BFC 高度时，浮动元素也参与计算

## 如下代码，如何修改能让图片宽度为 300px ？

```html
<img src="1.jpg" style="width:480px!important;”>
```

设最大宽度

```css
max-width: 300px;
```

运用转换

```css
transform: scale(0.625, 0.625);
```

box-sizing 设置

```css
box-sizing: border-box;
padding: 0 90px;
```

当然，更硬核的有，😆

```css
width: 300px !important;
```

## 改造下面的代码，使之输出 0 - 9

```js
for (var i = 0; i < 10; i++) {
  setTimeout(
    i => {
      console.log(i);
    },
    1000,
    i,
  );
}
```

**分析**

主要考察对于变量作用域的理解，解决变量作用域即可。

**方法一**

- 利用 `setTimeout` 函数的第三个参数，会作为回调函数的第一个参数传入
- 利用 `bind` 函数部分执行的特性

```js
for (var i = 0; i < 10; i++) {
  setTimeout(
    i => {
      console.log(i);
    },
    1000,
    i,
  );
}
```

或者

```js
for (var i = 0; i < 10; i++) {
  setTimeout(console.log, 1000, i);
}
```

或者

```js
for (var i = 0; i < 10; i++) {
  setTimeout(console.log.bind(null, i), 1000);
}
```

**方法二**

利用 `let` 变量的特性 — 在每一次 `for` 循环的过程中，`let` 声明的变量会在当前的块级作用域里面（`for` 循环的 body 体，也即两个花括号之间的内容区域）创建一个文法环境（Lexical Environment），该环境里面包括了当前 `for` 循环过程中的 `i`，

```js
for (let i = 0; i < 10; i++) {
  setTimeout(() => {
    console.log(i);
  }, 1000);
}
```

**方法三**

利用函数自执行的方式，把当前 for 循环过程中的 i 传递进去，构建出块级作用域。

```js
for (var i = 0; i < 10; i++) {
  (i => {
    setTimeout(() => {
      console.log(i);
    }, 1000);
  })(i);
}
```

**方法四**

纯属娱乐，利用 `new Function` 或者 `eval`

```js
for (var i = 0; i < 10; i++) {
  setTimeout(new Function('console.log(i)')(), 1000);
}
```

## 介绍下 npm 模块安装机制

### npm 模块安装机制：

- 敲击`npm install`命令
- 查询 node_modules 目录之中是否已经存在指定模块
  - 若存在，不再重新安装
  - 若不存在
    - npm 向 registry 查询模块压缩包的网址
    - 下载压缩包，存放在根目录下的`.npm`目录里
    - 解压压缩包到当前项目的`node_modules`目录

**执行 preinstall**

preinstall 钩子此时会执行。

**确定依赖模块**

确定工程中的首层依赖——dependencies 和 devDependencies 中指定的模块

以工程本身为依赖树根节点，此时会多进程深入遍历节点

**获取模块**

- 获取模块信息。确定版本，因为 package.json 中往往是 semantic version（semver，语义化版本）。此时如果版本描述文件（npm-shrinkwrap.json 或 package-lock.json）中有该模块信息，则已之为准，如果没有则从仓库获取。如 packaeg.json 中某个包的版本是 ^1.1.0，则会获取符合 1.x.x 形式的最新版
- 获取模块实体。上一步获取了压缩包地址（resolved 字段），npm 会以此地址检查本地缓存，若有就直接拷贝，没有则从仓库下载
- 查找模块依赖，若有依赖则返回第 1 步，若没有则停止。

**模块扁平（dedupe）**

上一步获取到的依赖树，需要清除重复模块。比如 A 模块依赖于 `moment`，B 模块也依赖 `moment`。在 `npm3` 以前会严格按照依赖树的结构进行安装，会造成模块冗余。

从 `npm3` 开始默认加入了一个 dedupe 的过程。它会遍历所有节点，逐个将模块放在根节点下面，也就是 node-modules 的第一层。当发现有**重复模块**时，则将其丢弃。

这里需要对**重复模块**进行一个定义，它指的是**模块名相同**且 **semver 兼容。**每个 semver 都对应一段版本允许范围，如果两个模块的版本允许范围存在交集，那么就可以得到一个**兼容**版本，而不必版本号完全一致，这可以使更多冗余模块在 dedupe 过程中被去掉。

举个例子，假设一个依赖树原本是这样：

```
node_modules
-- foo
---- lodash@version1
```

-- bar
---- lodash@version2

假设 version1 和 version2 是兼容版本，则经过 dedupe 会成为下面的形式：

```
node_modules
-- foo

-- bar

-- lodash（保留的版本为兼容版本）
```

假设 version1 和 version2 为非兼容版本，则后面的版本保留在依赖树中：

```
node_modules
-- foo
-- lodash@version1

-- bar
---- lodash@version2
```

**安装模块**

更新工程中的 `node_modules`，并执行模块中的生命周期函数（`preinstall`、`install`、`postinstall` ）。

**执行工程自身生命周期**

当前 npm 工程如果定义了钩子此时会被执行（按照 `install`、`postinstall`、`prepublish`、`prepare` 的顺序）。

生成或更新版本描述文件，`npm install` 过程完成。

## Web Worker 是什么，如何使用

### 是什么

JavaScript 语言采用的是单线程模型，也就是说，所有任务只能在一个线程上完成，一次只能做一件事。Web Worker 的作用，就是为 JavaScript 创造多线程环境，允许主线程创建 Worker 线程，将一些任务分配给后者运行。

#### 在主入口或组件文件

```js
var worker = new Worker('work.js');
```

向 Web Worker 发送计算请求

```javascript
worker.postMessage('calculate');
worker.postMessage({ method: 'echo', args: ['Work'] });
```

此时我们需要监听 Web Worker 发送回来的消息

```javascript
worker.onmessage = function(event) {
  console.log('Received' + event.data);
  // doSomething...
};
```

完成以后，关闭

```js
worker.terminate();
```

#### 在 work 线程（work.js）

```javascript
self.addEventListener(
  'message',
  function(e) {
    self.postMessage('You said: ' + e.data);
  },
  false,
);
// 或者
this.addEventListener(
  'message',
  function(e) {
    self.postMessage('You said: ' + e.data);
  },
  false,
);
// 或者
addEventListener(
  'message',
  function(e) {
    self.postMessage('You said: ' + e.data);
  },
  false,
);

self.close();
```

加载其他脚本

```javascript
importScripts('script1.js');
```

关于错误的处理

```javascript
worker.addEventListener('error', function(event) {
  // ...
});
```

## 请手写 `bind` 、`apply`

实现 bind，要注意几个点

1. 生成新函数的 prototype 应该是指向当前作用域的原型
2. 还要保证新创建的函数原型及函数对象的私有原型正确

```js
Function.prototype.bind2 = function(context) {
  if (typeof this !== 'function') {
    throw new Error(
      'Function.prototype.bind - what is trying to be bound is not callable',
    );
  }

  const self = this;
  const args = Array.prototype.slice.call(arguments, 1);
  const fNOP = function() {};

  const fbound = function() {
    self.apply(
      this instanceof self ? this : context,
      args.concat(Array.prototype.slice.call(arguments)),
    );
  };

  fNOP.prototype = this.prototype;
  fbound.prototype = new fNOP();

  return fbound;
};
```

实现 apply，不借助 bind 或 call 实现

```js
Function.prototype.apply2 = function(context, arr) {
  var context = Object(context) || window;
  context.fn = this;

  var result;
  if (!arr) {
    result = context.fn();
  } else {
    var args = [];
    for (var i = 0, len = arr.length; i < len; i++) {
      args.push('arr[' + i + ']');
    }
    result = eval('context.fn(' + args + ')');
  }

  delete context.fn;
  return result;
};
```

## 请手写一个 webpack 插件（plugin）

```js
// A JavaScript class.
class MyExampleWebpackPlugin {
  // Define `apply` as its prototype method which is supplied with compiler as its argument
  apply(compiler) {
    // Specify the event hook to attach to
    compiler.hooks.emit.tapAsync(
      'MyExampleWebpackPlugin',
      (compilation, callback) => {
        console.log('This is an example plugin!');
        console.log(
          'Here’s the `compilation` object which represents a single build of assets:',
          compilation,
        );

        // Manipulate the build using the plugin API provided by webpack
        compilation.addModule(/* ... */);

        callback();
      },
    );
  }
}
```

或者像这种基础使用

```js
class HelloWorldPlugin {
  apply(compiler) {
    compiler.hooks.done.tap('Hello World Plugin', (
      stats /* stats is passed as an argument when done hook is tapped.  */,
    ) => {
      console.log('Hello World!');
    });
  }
}

module.exports = HelloWorldPlugin;
```

使用插件

```js
// webpack.config.js
var HelloWorldPlugin = require('hello-world');

module.exports = {
  // ... configuration settings here ...
  plugins: [new HelloWorldPlugin({ options: true })],
};
```

一个示例

```js
class FileListPlugin {
  apply(compiler) {
    // emit is asynchronous hook, tapping into it using tapAsync, you can use tapPromise/tap(synchronous) as well
    compiler.hooks.emit.tapAsync('FileListPlugin', (compilation, callback) => {
      // Create a header string for the generated file:
      var filelist = 'In this build:\n\n';

      // Loop through all compiled assets,
      // adding a new line item for each filename.
      for (var filename in compilation.assets) {
        filelist += '- ' + filename + '\n';
      }

      // Insert this list into the webpack build as a new file asset:
      compilation.assets['filelist.md'] = {
        source: function() {
          return filelist;
        },
        size: function() {
          return filelist.length;
        },
      };

      callback();
    });
  }
}

module.exports = FileListPlugin;
```

## 请手写一个 webpack loader

Loader 是 webpack 用于在编译过程中解析各类文件格式并输出，本质是一个 node 模块。

我们自定义一个 Loader，做如下描述的事情：

1. 读取 txt 文件内容，并输出为一个对象，内容包括文件内容和文件名
2. 读取 loader 选项，将内容中的[name]替换为配置值

在 webpack 配置文件中的配置

```js
// webpack.config.js
module.exports = {
  //...
  module: {
    rules: [
      {
        test: /\.txt$/,
        use: {
          loader: path.resolve(__dirname, './txt-loader.js'),
          options: {
            name: 'YOLO',
          },
        },
      },
    ],
  },
};
```

在 txt-loader.js 中定义 loader 相关内容

```js
// txt-loader.js
var utils = require('loader-utils');

module.exports = function(source) {
  const options = utils.getOptions(this);

  source = source.replace(/\[name\]/g, options.name);
  return `export default ${JSON.stringify({
    content: source,
    filename: this.resourcePath,
  })}`;
};
```

打包完毕就能看到生成的 txt 文件中内容已经被更改。

## 判断数组的方法 Object.prototype.toString.call() 、 instanceof 以及 Array.isArray()，分别介绍下它们之间的区别和优劣

**Object.prototype.toString.call()**

每一个继承 Object 的对象都有 `toString` 方法，如果 `toString` 方法没有重写的话，会返回 `[Object type]`，其中 type 为对象的类型。但当除了 Object 类型的对象外，其他类型直接使用 `toString` 方法时，会直接返回都是内容的字符串，所以我们需要使用 call 或者 apply 方法来改变 toString 方法的执行上下文。

```js
const an = ['Hello', 'An'];
an.toString(); // "Hello,An"
Object.prototype.toString.call(an); // "[object Array]"
```

这种方法对于所有基本的数据类型都能进行判断，即使是 null 和 undefined 。

```js
Object.prototype.toString.call('An'); // "[object String]"
Object.prototype.toString.call(1); // "[object Number]"
Object.prototype.toString.call(Symbol(1)); // "[object Symbol]"
Object.prototype.toString.call(null); // "[object Null]"
Object.prototype.toString.call(undefined); // "[object Undefined]"
Object.prototype.toString.call(function() {}); // "[object Function]"
Object.prototype.toString.call({ name: 'An' }); // "[object Object]"
```

`Object.prototype.toString.call()` 常用于判断浏览器内置对象

**instanceof**

`instanceof` 的内部机制是通过判断对象的原型链中是不是能找到类型的 `prototype`。

使用 `instanceof`判断一个对象是否为数组，`instanceof` 会判断这个对象的原型链上是否会找到对应的 `Array` 的原型，找到返回 `true`，否则返回 `false`。

```js
[] instanceof Array; // true
```

但 `instanceof` 只能用来判断对象类型，原始类型不可以。并且所有对象类型 instanceof Object 都是 true。

```js
[] instanceof Object; // true
```

**Array.isArray()**

- 功能：用来判断对象是否为数组

- instanceof 与 isArray

  当检测 Array 实例时，`Array.isArray` 优于 `instanceof` ，因为 `Array.isArray` 可以检测出 `iframes`

  ```js
  var iframe = document.createElement('iframe');
  document.body.appendChild(iframe);
  xArray = window.frames[window.frames.length - 1].Array;
  var arr = new xArray(1, 2, 3); // [1,2,3]

  // Correctly checking for Array
  Array.isArray(arr); // true
  Object.prototype.toString.call(arr); // true
  // Considered harmful, because doesn't work though iframes
  arr instanceof Array; // false
  ```

- `Array.isArray()` 与 `Object.prototype.toString.call()`

  `Array.isArray()`是 ES5 新增的方法，当不存在 `Array.isArray()` ，可以用 `Object.prototype.toString.call()` 实现。

  ```js
  if (!Array.isArray) {
    Array.isArray = function(arg) {
      return Object.prototype.toString.call(arg) === '[object Array]';
    };
  }
  ```

## 使用 this 的典型例子

1. Implicit binding:

```js
var b = {
  a: function() {
    console.log(this);
  },
};
b.a();
// this is b
```

2. Explicit binding:

```js
b.a.call(this); // this is window
```

3. new binding

```js
function B() {
  (this.a = function() {
    console.log(this.b);
  }),
    (this.b = 1);
}
let b = new B();
b.a();
// this is b object;
```

4. window binding

```js
var a = 1;
this.a;
```

## 对`a == ('1'||'2'||'3') ? false : true`写法进行改进，写出你优化后的方法

```js
![1, 2, 3].includes(+a);
```

或者

```js
!['1', '2', '3'].includes(a + '');
```

或者

```js
!{ 1: true, 2: true, 3: true }[a];
```

## a.b.c.d 和 a['b']['c']['d']，哪个性能更高？

`a.b.c.d` 比 `a['b']['c']['d']` 性能高点，后者还要考虑 `[ ]` 中是变量的情况

再者，从两种形式的结构来看，显然编译器解析前者要比后者容易些，自然也就快一点。

总之，在项目中，尽量将对象中的属性结构使用， 示例

```js
const obj = { name: 'walker', age: 10 };
function test() {
  const { name, age } = obj;
  console.log(name);
  console.log(age);
}
```

## 如何实现无缝轮播图

无缝轮播的核心是制造一个连续的效果。最简单的方法就是复制一个轮播的元素，当复制元素将要滚到目标位置后，把原来的元素进行归位的操作，以达到无缝的轮播效果。

使用 `React` 结合 `Hooks` 实现核心代码片段如下：

```js
useEffect(() => {
  const requestAnimationFrame =
    window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame;
  const cancelAnimationFrame =
    window.cancelAnimationFrame ||
    window.webkitCancelAnimationFrame ||
    window.mozCancelAnimationFrame;

  const scrollNode = noticeContentEl.current;
  const distance = scrollNode.clientWidth / 2;

  scrollNode.style.left = scrollNode.style.left || 0;
  window.__offset = window.__offset || 0;

  let requestId = null;
  const scrollLeft = () => {
    const speed = 0.5;
    window.__offset = window.__offset + speed;
    scrollNode.style.left = -window.__offset + 'px';
    // 关键行：当距离小于偏移量时，重置偏移量
    if (distance <= window.__offset) window.__offset = 0;
    requestId = requestAnimationFrame(scrollLeft);
  };
  requestId = requestAnimationFrame(scrollLeft);

  if (pause) cancelAnimationFrame(requestId);
  return () => cancelAnimationFrame(requestId);
}, [notice, pause]);
```

## react-router 里的 Link 标签和 a 标签有什么区别

Link 点击事件 handleClick 部分源码

```js
if (_this.props.onClick) _this.props.onClick(event);

if (
  !event.defaultPrevented && // onClick prevented default
  event.button === 0 && // ignore everything but left clicks
  !_this.props.target && // let browser handle "target=_blank" etc.
  !isModifiedEvent(event) // ignore clicks with modifier keys
) {
  event.preventDefault();

  var history = _this.context.router.history;
  var _this$props = _this.props,
    replace = _this$props.replace,
    to = _this$props.to;

  if (replace) {
    history.replace(to);
  } else {
    history.push(to);
  }
}
```

Link 做了 3 件事情：

1. 有 onclick 那就执行 onclick
2. click 的时候阻止 a 标签默认事件（这样子点击`[123]()`就不会跳转和刷新页面）
3. 再取得跳转 href（即是 to），用 history（前端路由两种方式之一，history & hash）跳转，此时只是链接变了，并没有刷新页面

## 为什么要用 redux-saga？看过 dva 源码吗？

### redux

redux 是 JavaScript `状态容器`，提供可`预测化`的状态管理。

应用中所有的 state 都以一个对象树的形式储存在一个单一的 store 中。 惟一改变 state 的办法是触发 action，一个描述发生什么的对象。 为了描述 action 如何改变 state 树，你需要编写 reducers。

你应该把要做的修改变成一个普通对象，这个对象被叫做 action，而不是直接修改 state。然后编写专门的函数来决定每个 action 如何改变应用的 state，这个函数被叫做 reducer。

redux `有且仅有`一个 store 和一个根级的 reduce 函数（reducer）。随着应用不断变大，你应该把根级的 reducer 拆成多个小的 reducers，分别独立地操作 state 树的不同部分，而不是添加新的 stores。这就像一个 React 应用只有一个根级的组件，这个根组件又由很多小组件构成。

### redux-saga

redux-saga 是一个用于管理应用程序 Side Effect（`副作用`，例如异步获取数据，访问浏览器缓存等）的 library，它的`目标`是`让副作用管理更容易，执行更高效，测试更简单，在处理故障时更容易`。

可以想像为，一个 saga 就像是应用程序中一个单独的线程，它`独自负责处理副作用`。 redux-saga 是一个 `redux 中间件`，意味着这个线程可以通过正常的 redux action 从主应用程序启动，暂停和取消，它能访问完整的 redux state，也可以 dispatch redux action。

redux-saga 使用了 ES6 的 `Generator` 功能，让异步的流程更`易于读取，写入和测试`。（如果你还不熟悉的话，这里有一些介绍性的链接） 通过这样的方式，这些异步的流程看起来就像是标准同步的 Javascript 代码。（有点像 async/await，但 Generator 还有一些更棒而且我们也需要的功能）。

你可能已经用了 redux-thunk 来处理数据的读取。不同于 redux thunk，你不会再遇到回调地狱了，你可以很容易地测试异步流程并保持你的 action 是干净的。

### redux-saga 与其他 redux 中间件比较

- redux-thunk 的缺点在于 api 层与 store 耦合，优点是可以获取到各个异步操作时期状态的值，比较灵活，易于控制
- redux-promise 的优点是 api 层与 store 解耦，缺点是对请求失败，请求中的情形没有很好的处理

- redux-saga 的优点是 api 层与 store 解耦，对请求中，请求失败都有完善的处理，缺点是代码量较大

## 介绍下 webpack 热更新原理

hot-module-replacement-plugin 包给 webpack-dev-server 提供了热更新的能力，它们两者是结合使用的，单独写两个包也是出于功能的解耦来考虑的。

1. webpack-dev-server(WDS)的功能提供 bundle server 的能力，就是生成的 bundle.js 文件可以通过 localhost://xxx 的方式去访问，另外 WDS 也提供 livereload(浏览器的自动刷新)。
2. hot-module-replacement-plugin 的作用是提供 HMR 的 runtime，并且将 runtime 注入到 bundle.js 代码里面去。一旦磁盘里面的文件修改，那么 HMR server 会将有修改的 js module 信息发送给 HMR runtime，然后 HMR runtime 去局部更新页面的代码。因此这种方式可以不用刷新浏览器。
