---
nav:
  title: 进阶
order: 7
title: 异步处理浅析
---

## 概述

异步处理在程序开发世界里很常见，异步可以简单描述为：现在发起的请求需要在未来某个时间点得到答复。在早期的前端开发世界里，我们会看到代码中充斥着回调函数片段，请求响应处理、定时器等操作都需借助回调函数来完成异步操作。

假如我们希望某个函数具有等待的效果，在等待完后，打印传入的参数。代码片段示例如下：

```js
function wait(fn, time) {
  setTimeout(() => {
    fn('Yeah');
  }, time);
}

wait(function(message) {
  console.log(message);
}, 1000);
```

通常在一秒后会打印出 “Yeah”。从本例来看，回调函数能够很好解决异步处理问题，但在有些时候，回调函数会使得代码可读性急剧降低，比如以下代码：

```js
f1(function() {
  const t1 = 'f1';
  console.log(t1);
  f2(function() {
    const t2 = `${t1},f2`;
    console.log(t2);
    f3(function() {
      const t3 = `${t2},f3`;
      console.log(f3);
    });
  });
});
```

如此嵌套，代码可读性会急剧降低，正如术语：回调地狱。

有什么办法可以解决这个问题吗？有，那就是 Promise。我们使用 Promise 改写上面的代码，就像这样：

```js
f1()
  .then(() => {
    const t1 = 'f1';
    console.log(t1);
    return t1;
  })
  .then(t1 => {
    return f2().then(function() {
      const t2 = `${t1},f2`;
      console.log(t2);
      return t2;
    });
  })
  .then(t2 => {
    return f3().then(function() {
      const t3 = `${t2},f3`;
      console.log(f3);
      return t3;
    });
  });
```

这样我们就将一层一层嵌套调用的形式改写成了平级调用，提高了代码可读性。Promise 是如何实现的呢？我们要从一种设计模式说起。

## 观察者模式

> 阅读前可先回顾一下观察者模式与发布-订阅模式的区别

观察者模式即是先收集所有依赖，待到需要执行时，从依赖中取出函数并依次执行。这种思路在事件处理中得到充分运用，针对某个 DOM 元素，绑定事件的过程相当于声明依赖，待到事件触发时，则将这些依赖取出依次执行。

## 基础版 Promise 实现

在 Promise 中，我们知道任务的处理完成状态分为 resolve 和 reject，针对于这两种状态，我们事先需要将各自依赖存储，待到异步任务执行完再取出这些依赖函数依次执行。我们先写一部分片段：

```ts
type FuncType = (...args: any[]) => any;

export class HePromise {
  private resolves: FuncType[] = [];

  constructor(executor) {}

  then(resolveFunc: FuncType) {
    this.resolves.push(resolveFunc);
  }
}
```

可以看到 Promise 依赖的收集是在 then 函数中完成，当 Promise 示例每调用一次 then，便将 then 中传入的第一个函数放入依赖数组中。不过我们知道 Promise 的初始化是在实例化时完成，因此在构造器中需要执行 Promise 实例化传入的函数，代码改造后如下：

```ts
type FuncType = (...args: any[]) => any;
type ExecutorFunc = (resolveFunc: FuncType, rejectFunc?: FuncType) => any;

export class HePromise {
  private resolves: FuncType[] = [];

  constructor(executor: ExecutorFunc) {
    const { resolve } = this;
    executor(resolve);
  }

  private resolve = (resolvedVal: any) => {
    const { resolves } = this;
    while (resolves.length) {
      const cb = resolves.shift();
      if (cb) cb(resolvedVal);
    }
  };

  then(resolveFunc: FuncType) {
    this.resolves.push(resolveFunc);
  }
}
```

完整执行过程是：当执行 `new HePromise()` 时，`constructor` 函数会执行，不过这里需要注意的是，我们暂时只考虑异步操作，忽略了同步的情况。异步情况下 `executor` 函数会在未来某个时间点执行，而从初始化到这个时间点之间，正是 `then` 函数执行收集依赖的过程。

除此之外，我们还需要考虑 `reject` 的操作，这个操作与 `resolve` 表征类似，我们直接添加到上面代码中，添加后完整代码示例如下：

```ts
type FuncType = (...args: any[]) => any;

type ExecutorFunc = (resolveFunc: FuncType, rejectFunc?: FuncType) => any;

export class HePromise {
  private resolves: FuncType[] = [];
  private rejects: FuncType[] = [];

  constructor(executor: ExecutorFunc) {
    const { resolve, reject } = this;
    executor(resolve, reject);
  }

  private resolve = (resolvedVal: any) => {
    const { resolves } = this;
    while (resolves.length) {
      const cb = resolves.shift();
      if (cb) cb(resolvedVal);
    }
  };

  private reject = (rejectedVal: any) => {
    const { rejects } = this;
    while (rejects.length) {
      const cb = rejects.shift();
      if (cb) cb(rejectedVal);
    }
  };

  then(resolveFunc: FuncType, rejectFunc?: FuncType) {
    this.resolves.push(resolveFunc);
    if (rejectFunc) this.rejects.push(rejectFunc);
  }
}
```

接下来，我们编写测试代码，本项目中使用 jest 进行测试，测试代码编写如下：

```ts
describe('test HePromise', () => {
  it('basic usage', done => {
    const p = new HePromise(resolve => {
      setTimeout(() => {
        resolve(1);
      }, 1000);
    });
    try {
      p.then(data => {
        expect(data).toBe(1);
        done();
      });
    } catch (error) {
      done(error);
    }
  });
});
```

执行测试，测试通过，完成 Promise 初始版本封装。执行流程总结如下：

- Promise 构造方法需要传入一个函数，我们将这个函数命名为 `executor`；
- 在 `executor` 内部，将各任务放入宏/微任务队列中（宏/微任务请参看 [事件循环](/advanced/eventloop) ）；
- 在 `then` 和 `catch` 中可收集到 `resolve`、`reject` 依赖，并将该依赖存放到对应队列中；
- 异步任务执行完以后，调用 `executor` 中的 `resolve` 或 `reject`，取出对应队列中的依赖依次执行。

## Promise A+ 规范

> 英文原文：Promise/A+
>
> 转载自：https://www.ituring.com.cn/article/66566

### 译文术语

- 解决（fulfill）：指一个 promise 成功时进行的一系列操作，如状态的改变、回调的执行。虽然规范中用 fulfill 来表示解决，但在后世的 promise 实现多以 resolve 来指代之
- 拒绝（reject）：指一个 promise 失败时进行的一系列操作
- 终值（eventual value）：所谓终值，指的是 promise 被解决时传递给解决回调的值，由于 promise 有一次性的特征，因此当这个值被传递时，标志着 promise 等待态的结束，故称之终值，有时也直接简称为值（value）
- 据因（reason）：也就是拒绝原因，指在 promise 被拒绝时传递给拒绝回调的值

### 术语

- **Promise** promise 是一个拥有 then 方法的对象或函数，其行为符合本规范
- **thenable** 是一个定义了 then 方法的对象或函数，文中译作“拥有 then 方法”
- **值（value）** 指任何 JavaScript 的合法值（包括 undefined , thenable 和 promise）
- **异常（exception）** 是使用 throw 语句抛出的一个值
- **据因（reason）** 表示一个 promise 的拒绝原因

### 要求

**Promise 的状态**

一个 Promise 的当前状态必须为以下三种状态中的一种：**等待态（Pending）**、**执行态（Fulfilled）**和 **拒绝态（Rejected）**。

- **等待态（Pending）**
  处于等待态时，promise 需满足以下条件：

  可以迁移至执行态或拒绝态

- **执行态（Fulfilled）**
  处于执行态时，promise 需满足以下条件：

  不能迁移至其他任何状态

  必须拥有一个不可变的终值

- **拒绝态（Rejected）**
  处于拒绝态时，promise 需满足以下条件：

  不能迁移至其他任何状态

  必须拥有一个不可变的据因

  这里的不可变指的是恒等（即可用 === 判断相等），而不是意味着更深层次的不可变（译者注：盖指当 value 或 reason 不是基本值时，只要求其引用地址相等，但属性值可被更改）。

**then 方法**

一个 promise 必须提供一个 then 方法以访问其当前值、终值和据因。

promise 的 then 方法接受两个参数：

```js
promise.then(onFulfilled, onRejected);
```

其中，onFulfilled 和 onRejected 都是可选参数。

- 如果 onFulfilled 不是函数，其必须被忽略
- 如果 onRejected 不是函数，其必须被忽略

......

## 增加 Promise 状态

我们为 HePromise 添加状态，根据规范约定，在代码中添加状态枚举值，如下：

```ts
enum STATUS {
  PENDING = 'pending',
  FULFILLED = 'fulfilled',
  REJECTED = 'rejected',
}
```

在执行 `resolve` 前，需要检测当前状态是否为 `pending`，如果是则可以继续执行，否则无法执行 `resolve`，在执行 `resolve` 时，将状态置为 `fulfilled`。`reject` 方法中同理先检测状态是否为 `pending`，如果是则继续执行并将状态置为 `rejected`。

改进后，代码示例如下：

```ts
type FuncType = (...args: any[]) => any;

type ExecutorFunc = (resolveFunc: FuncType, rejectFunc?: FuncType) => any;

enum STATUS {
  PENDING = 'pending',
  FULFILLED = 'fulfilled',
  REJECTED = 'rejected',
}

export class HePromise {
  private status = STATUS.PENDING;
  private resolves: FuncType[] = [];
  private rejects: FuncType[] = [];

  constructor(executor: ExecutorFunc) {
    const { resolve, reject } = this;
    executor(resolve, reject);
  }

  private resolve = (resolvedVal: any) => {
    const { resolves, status } = this;
    if (status !== STATUS.PENDING) return;
    this.status = STATUS.FULFILLED;
    while (resolves.length) {
      const cb = resolves.shift();
      if (cb) cb(resolvedVal);
    }
  };

  private reject = (rejectedVal: any) => {
    const { rejects, status } = this;
    if (status !== STATUS.PENDING) return;
    this.status = STATUS.REJECTED;
    while (rejects.length) {
      const cb = rejects.shift();
      if (cb) cb(rejectedVal);
    }
  };

  then(resolveFunc: FuncType, rejectFunc?: FuncType) {
    this.resolves.push(resolveFunc);
    if (rejectFunc) this.rejects.push(rejectFunc);
  }
}
```

## 支持链式调用

根据 Promise A+ 规范，每次 then 返回的值也需要满足 thenable，也就是说我们需要将 resolve 返回值使用 promise 包裹，在本例中就是需要将返回值包装为新的 HePromise 对象。
开发之前我们不妨先来看看 Promise 链式调用的示例：

```js
const p = new Promise(resolve => resolve(1));

p.then(r1 => {
  console.log(r1);
  return 2;
})
  .then(r2 => {
    console.log(r2);
    return 3;
  })
  .then(r3 => {
    console.log(r3);
  });
```

可以发现，每次 then 函数调用完，都返回了一个新的数字，令人不解的是，这个数据居然也拥有了 then 函数，可以依次调用。这里需要做的处理时，需要将传入的 resolve 与 reject 函数封装然后放入待执行队列中。简言之，当返回值为一个 Promise 时，需要执行 promise.then 方法，否则直接执行 resolve。改进后的 then 方法如下：

```ts
then(resolveFunc: FuncType, rejectFunc?: FuncType) {
    return new HePromise((resolve, reject) => {
      const resolvedFn = (val: any) => {
        try {
          let resolvedVal = resolveFunc(val);
          resolvedVal instanceof HePromise
            ? resolvedVal.then(resolve, reject)
            : resolve(resolvedVal);
        } catch (error) {
          if (reject) reject(error);
        }
      };
      this.resolves.push(resolvedFn);
      if (rejectFunc) this.rejects.push(rejectFunc);
    })
  }
```

可以看到，then 方法调用时，会返回新的 HePromise 对象，该对象中主要做了这样几件事情：

1. 包装初始 then 方法传入的 resolve 函数；
2. 先将初始 then 方法传入的 resolve 函数执行，得到返回值，如果返回值是一个新的 HePromise 对象，则需要手动调用该实例的 then 方法，否则直接执行 resolve 函数；
3. 将包装过的 resolve 函数放入 resolves 队列中，等待执行

同理将 reject 处理补全，整体代码示例：

```ts
then(resolveFunc: FuncType, rejectFunc?: FuncType) {
    return new HePromise((resolve, reject) => {
      const resolvedFn = (val: any) => {
        try {
          const resolvedVal = resolveFunc(val);
          resolvedVal instanceof HePromise
            ? resolvedVal.then(resolve, reject)
            : resolve(resolvedVal);
        } catch (error) {
          if (reject) reject(error);
        }
      };
      this.resolves.push(resolvedFn);

      const rejectedFn = (val: any) => {
        if (rejectFunc) {
          try {
            const rejectedVal = rejectFunc(val);
            rejectedVal instanceof HePromise
              ? rejectedVal.then(resolve, reject)
              : resolve(rejectedVal);
          } catch (error) {
            if (reject) reject(error);
          }
        }
      };
      if (rejectFunc) this.rejects.push(rejectedFn);
    });
  }
```

完成编码后，编写测试代码：

```ts
it('chain invoke usage', done => {
  const p = new HePromise(resolve => {
    setTimeout(() => {
      resolve(11);
    }, 1000);
  });

  try {
    p.then(data => {
      expect(data).toBe(11);
      return 'hello';
    })
      .then(data => {
        expect(data).toBe('hello');
        return 'world';
      })
      .then(data => {
        expect(data).toBe('world');
        done();
      });
  } catch (error) {
    done(error);
  }
});
```

执行测试，可以看到测试用例通过。

不过需要注意的是，根据 Promise A+ 规范，需要对 then 参数进行处理，如果参数不是函数，则需要忽略并继续往下执行，示例如下：

```js
typeof resolveFunc !== 'function' ? (resolveFunc = value => value) : null;
typeof rejectFunc !== 'function'
  ? (rejectFunc = reason => {
      throw new Error(reason instanceof Error ? reason.message : reason);
    })
  : null;
```

## 值过滤与状态变更

与此同时，如果在执行过程中，Promise 状态值已发生变化，则需要根据不同状态直接进行相应，例如，如果是 `pending`，则将任务放入对应队列中，如果为 `fulfilled`，直接调用 resolve，如果为 `rejected` 则直接调用 reject。可以使用 switch 语句进行策略处理，如下：

```ts
switch (this.status) {
  case STATUS.PENDING:
    this.resolves.push(resolvedFn);
    this.rejects.push(rejectedFn);
    break;
  case STATUS.FULFILLED:
    resolvedFn(this.value);
    break;
  case STATUS.REJECTED:
    rejectedFn(this.value);
    break;
}
```

此处 `this.value` 是上次执行完后得到的值，起到暂存的目的。补充以上代码后，完整代码示例如下：

```ts
type FuncType = (...args: any[]) => any;

type ExecutorFunc = (resolveFunc: FuncType, rejectFunc?: FuncType) => any;

enum STATUS {
  PENDING = 'pending',
  FULFILLED = 'fulfilled',
  REJECTED = 'rejected',
}

export class HePromise {
  private status = STATUS.PENDING;
  private value = undefined;
  private resolves: FuncType[] = [];
  private rejects: FuncType[] = [];

  constructor(executor: ExecutorFunc) {
    const { resolve, reject } = this;
    executor(resolve, reject);
  }

  private resolve = (resolvedVal: any) => {
    const { resolves, status } = this;
    if (status !== STATUS.PENDING) return;
    this.status = STATUS.FULFILLED;
    this.value = resolvedVal;
    while (resolves.length) {
      const cb = resolves.shift();
      if (cb) cb(resolvedVal);
    }
  };

  private reject = (rejectedVal: any) => {
    const { rejects, status } = this;
    if (status !== STATUS.PENDING) return;
    this.status = STATUS.REJECTED;
    this.value = rejectedVal;
    while (rejects.length) {
      const cb = rejects.shift();
      if (cb) cb(rejectedVal);
    }
  };

  then(resolveFunc: FuncType, rejectFunc?: FuncType): HePromise {
    typeof resolveFunc !== 'function' ? (resolveFunc = value => value) : null;
    typeof rejectFunc !== 'function'
      ? (rejectFunc = reason => {
          throw new Error(reason instanceof Error ? reason.message : reason);
        })
      : null;

    return new HePromise((resolve, reject) => {
      const resolvedFn = (val: any) => {
        try {
          const resolvedVal = resolveFunc(val);
          resolvedVal instanceof HePromise
            ? resolvedVal.then(resolve, reject)
            : resolve(resolvedVal);
        } catch (error) {
          if (reject) reject(error);
        }
      };
      this.resolves.push(resolvedFn);

      const rejectedFn = (val: any) => {
        if (rejectFunc) {
          try {
            const rejectedVal = rejectFunc(val);
            rejectedVal instanceof HePromise
              ? rejectedVal.then(resolve, reject)
              : resolve(rejectedVal);
          } catch (error) {
            if (reject) reject(error);
          }
        }
      };

      switch (this.status) {
        case STATUS.PENDING:
          this.resolves.push(resolvedFn);
          this.rejects.push(rejectedFn);
          break;
        case STATUS.FULFILLED:
          resolvedFn(this.value);
          break;
        case STATUS.REJECTED:
          rejectedFn(this.value);
          break;
      }
    });
  }
}
```

## 同步任务处理

以上情况我们遗漏了一个点，就是同步任务，我们可以看到以上示例中，初始化 HePromise 中的 resolve 都是在未来进行的，如果同步执行 resolve，则以上代码会出现问题。我们的方案是，将初始处理默认放入宏任务队列中，也就是使用 `setTimeout` 包裹 resolve，这样一来，就能保证即使是同步任务，也可以保证在同步收集完任务以后在执行 executor 中的 resolve 和 reject。示例如下：

```ts
export class HePromise {
  private resolve = (resolvedVal: any) => {
    setTimeout(() => {
      const { resolves, status } = this;
      if (status !== STATUS.PENDING) return;
      this.status = STATUS.FULFILLED;
      this.value = resolvedVal;
      while (resolves.length) {
        const cb = resolves.shift();
        if (cb) cb(resolvedVal);
      }
    });
  };
}
```

同理可实现 reject 逻辑。编写测试代码，如下：

```ts
it('sync task', done => {
  const p = new HePromise(resolve => {
    resolve(123);
  });
  p.then(res => {
    expect(res).toBe(123);
    done();
  });
});
```

## 其他方法实现

Promise 中还包括 catch、finally、Promise.resolve、Promise.reject、Promise.all、Promise.race，接下来我们分别来实现。

### catch

其实我们可以理解是 then 方法的一个变体，就是 then 方法省略了 resolve 参数，实现如下：

```ts
catch(rejectFnnc) {
  return this.then(undefined, rejectFnnc)
}
```

### finally

该方法保证 Promise 不管是 fulfilled 还是 reject 都会执行，都会执行指定的回调函数。在 finally 之后，还可以继续 then。并且会将值原封不动的传递给后面的 then 函数。针对这个机制也有很多理解，糙版的处理如下：

```ts
finally(cb) {
  return this.then(
    value  => {
      cb();
      return value;
    },
    reason  => {
      cb();
      throw reason
    }
  )
}
```

不过，如果 Promise 在 finally 前返回了一个 reject 状态的 promise，想上面这样编写是无法满足要求的。

> finally 对自身返回的 promise 的决议影响有限，它可以将上一个 resolve 改为 reject，也可以将上一个 reject 改为另一个 reject，但不能把上一个 reject 改为 resolve。

这样一来，我们可以将 callback 使用 Promise.resolve 包裹一下，保证后续的 resolve 状态。如下：

```ts
finally(cb) {
  return this.then(
    value => HePromise.resolve(cb()).then(() => value),
    reason => HePromise.resolve(cb()).then(() => { throw reason })
  )
}
```

### resolve

调用该静态方法其实就是将值 promise 化，如果传入值本身就是 promise 示例，则直接返回，否则创建新的 promise 示例并返回，示例如下：

```ts
static resolve(val) {
  if(val instanceof HePromise) return val
  return new HePromise(resolve => resolve(val))
}
```

编写测试代码如下：

```ts
it('HePromise.resolve', done => {
  HePromise.resolve(1).then(res => {
    expect(res).toBe(1);
    done();
  });
});
```

### reject

该方法的原理同 `resolve`，直接贴出代码

```ts
static reject(val) {
  return new HePromise((resolve, reject) => reject(val))
}
```

编写测试代码如下：

```ts
it('HePromise.reject & catch', done => {
  HePromise.reject(1).then(
    res => {
      expect(res).toBe(1);
      done();
    },
    error => {
      expect(error).toBe(1);
      done();
    },
  );
});
```

或者通过 catch 的方式，如下：

```ts
it('HePromise.reject & catch', done => {
  HePromise.reject(1)
    .then(res => {
      expect(res).toBe(1);
      done();
    })
    .catch(error => {
      expect(error.message).toEqual('1');
      done();
    });
});
```

执行测试，测试通过。

### all

就是将传入数组中的值 promise 化，然后保证每个任务都处理后，最终 resolve。示例如下：

```ts
class HePromise {
  static all(promises: any[]) {
    let index = 0;
    const result: any[] = [];
    const pLen = promises.length;
    return new HePromise((resolve, reject) => {
      promises.forEach(p => {
        HePromise.resolve(p).then(
          val => {
            index++;
            result.push(val);
            if (index === pLen) {
              resolve(result);
            }
          },
          err => {
            if (reject) reject(err);
          },
        );
      });
    });
  }
}
```

编写测试用例如下：

```ts
it('HePromise.all', done => {
  HePromise.all([1, 2, 3]).then(res => {
    expect(res).toEqual([1, 2, 3]);
    done();
  });
});
```

执行测试，测试通过。

### race

就是将传入数组中的值 promise 化，只要其中一个任务完成，即可 resolve。示例如下：

```ts
class HePromise {
  static race(promises: any[]): HePromise {
    return new HePromise((resolve, reject) => {
      promises.forEach(p => {
        HePromise.resolve(p).then(
          val => {
            resolve(val);
          },
          err => {
            if (reject) reject(err);
          },
        );
      });
    });
  }
}
```

编写测试用例：

```ts
it('HePromise.race', done => {
  HePromise.race([11, 22, 33]).then(res => {
    expect(res).toBe(11);
    done();
  });
});
```

执行测试，测试通过。

整体测试代码情况如下：

![](./assets/async/1.png)

## 完整代码

```ts
type FuncType = (...args: any[]) => any;

type ExecutorFunc = (resolveFunc: FuncType, rejectFunc?: FuncType) => any;

enum STATUS {
  PENDING = 'pending',
  FULFILLED = 'fulfilled',
  REJECTED = 'rejected',
}

export class HePromise {
  private status = STATUS.PENDING;
  private value = undefined;
  private resolves: FuncType[] = [];
  private rejects: FuncType[] = [];

  static resolve(val: any): HePromise {
    if (val instanceof HePromise) return val;
    return new HePromise(resolve => resolve(val));
  }

  static reject(val: any): HePromise {
    return new HePromise((resolve, reject) => reject && reject(val));
  }

  static all(promises: any[]): HePromise {
    let index = 0;
    const result: any[] = [];
    const pLen = promises.length;
    return new HePromise((resolve, reject) => {
      promises.forEach(p => {
        HePromise.resolve(p).then(
          val => {
            index++;
            result.push(val);
            if (index === pLen) {
              resolve(result);
            }
          },
          err => {
            if (reject) reject(err);
          },
        );
      });
    });
  }

  static race(promises: any[]): HePromise {
    return new HePromise((resolve, reject) => {
      promises.forEach(p => {
        HePromise.resolve(p).then(
          val => {
            resolve(val);
          },
          err => {
            if (reject) reject(err);
          },
        );
      });
    });
  }

  constructor(executor: ExecutorFunc) {
    const { resolve, reject } = this;
    executor(resolve, reject);
  }

  private resolve = (resolvedVal: any) => {
    const { resolves, status } = this;
    if (status !== STATUS.PENDING) return;
    this.status = STATUS.FULFILLED;
    this.value = resolvedVal;
    while (resolves.length) {
      const cb = resolves.shift();
      if (cb) cb(resolvedVal);
    }
  };

  private reject = (rejectedVal: any) => {
    const { rejects, status } = this;
    if (status !== STATUS.PENDING) return;
    this.status = STATUS.REJECTED;
    this.value = rejectedVal;
    while (rejects.length) {
      const cb = rejects.shift();
      if (cb) cb(rejectedVal);
    }
  };

  then(resolveFunc?: FuncType, rejectFunc?: FuncType): HePromise {
    typeof resolveFunc !== 'function' ? (resolveFunc = value => value) : null;
    typeof rejectFunc !== 'function'
      ? this.rejects.length < 1
        ? (rejectFunc = reason => {
            throw new Error(reason instanceof Error ? reason.message : reason);
          })
        : null
      : null;

    return new HePromise((resolve, reject) => {
      const resolvedFn = (val: any) => {
        try {
          const resolvedVal = resolveFunc && resolveFunc(val);
          resolvedVal instanceof HePromise
            ? resolvedVal.then(resolve, reject)
            : resolve(resolvedVal);
        } catch (error) {
          if (reject) reject(error);
        }
      };
      this.resolves.push(resolvedFn);

      const rejectedFn = (val: any) => {
        if (rejectFunc) {
          try {
            const rejectedVal = rejectFunc(val);
            rejectedVal instanceof HePromise
              ? rejectedVal.then(resolve, reject)
              : resolve(rejectedVal);
          } catch (error) {
            if (reject) reject(error);
          }
        }
      };

      switch (this.status) {
        case STATUS.PENDING:
          this.resolves.push(resolvedFn);
          this.rejects.push(rejectedFn);
          break;
        case STATUS.FULFILLED:
          resolvedFn(this.value);
          break;
        case STATUS.REJECTED:
          rejectedFn(this.value);
          break;
      }
    });
  }

  catch(rejectFnnc: FuncType) {
    return this.then(undefined, rejectFnnc);
  }

  finally(cb) {
    return this.then(
      value => HePromise.resolve(cb()).then(() => value),
      reason =>
        HePromise.resolve(cb()).then(() => {
          throw reason;
        }),
    );
  }
}
```
