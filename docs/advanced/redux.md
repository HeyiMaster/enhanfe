---
nav:
  title: 进阶
order: 4
title: Redux 原理浅析
---

## Redux 设计思想

Redux 是一个非常流行的前端状态库，很多人知道 Redux 是缘自 React。通常我们认为使用 Redux 管理项目中的状态会使项目开发变得简单，不过也有时，项目引入 Redux 会使得项目愈发复杂。
其实，学习 Redux，我们更关注的是 Redux 对于状态管理的思想，其中包含了三个非常重要的概念，分别为：

1. 单一数据源
2. state 只读
3. 使用纯函数执行状态修改

**单一数据源**表示，项目中所有状态统一存储在了一个变量上，也可以描述为存储在了同一棵 tree 上，这使得不同组件之间，状态的同步与更新变得可靠；**state 只读**意味着，你无法手动修改 state 的值，state 存储在某个私有变量上，以至于你无法直接访问；**纯函数修改状态**是说，每个状态的修改必须通过定义的 reducer 函数完成。我们首先来看，一个最简单 Redux 使用示例，为了便于查看，我们放在一个文件中展示，示例如下：

```js
import { createStore } from 'redux';

const initialState = {
  count: 1,
};

function reducer(state = initialState, action) {
  switch (action.type) {
    case 'INCREASE':
      return { ...state, count: state.count + 1 };
    case 'DECREASE':
      return { ...state, count: state.count - 1 };
    default:
      return state;
  }
}

const store = createStore(reducer);

// 订阅 state 变化
store.subscribe(() => console.log(store.getState()));

store.dispatch({ type: 'ADD' });
```

从上例我们可以发现，状态的更改定义在 reducer 函数中，并且该函数每次被调用，都会根据传入 action 中的 type 值返回对应新对象，该新对象除了需要更改的 count 值以外，其他内容不变。通过这一个例子，就能厘清 Redux 设计思想。我们就从这个示例开始，手写一个 Redux，从而深入理解 Redux 设计思想。

## createStore

通过上例我们可以看出，Redux 最核心的一个 api 便是 createStore，该函数接受一个函数作为参数，返回一个 store 对象，目前我们认为该 store 对象包含了一下三个方法：subscribe、dispatch、getState。这样一来，我们实现 createStore 方法的思路就有了。代码片段如下：

```js
function createStore(reducer) {

  function subscribe() {}
  function getState() {}
  function dispatch() {}

  return {
    subscribe
    getState
    dispatch
  }
}
```

在此基础上，我们根据数据源单一这一特性，在创建的 store 中，状态存储在了一个私有的变量上，该变量无法被外界直接访问，只能通过 getState 方法访问。state 的值是通过调用 reducer 以后，将 reducer 函数返回的新 state 对象赋给了内部私有 state 变量。明白了这几点，我们就可以完善以上代码了，示例如下：

```ts
// createStore.ts

/**
 * This function is used to create a redux store
 * 该函数用于创建 redux store
 */
import { Store, StoreEnhancer, StoreEnhancerStoreCreator } from './types/store';
import { Action } from './types/actions';
import { Reducer } from './types/reducers';

export default function createStore<
  S,
  A extends Action,
  Ext = {},
  StateExt = never
>(reducer: Reducer, enhancer?: StoreEnhancer<Ext, StateExt>): Store {
  let state: S;
  const nextListeners: (() => void)[] = [];

  function subscribe(listener: () => void) {
    nextListeners.push(listener);

    /**
     * return unsubscribe function
     */
  }

  function getState() {
    return state;
  }

  function dispatch(action: A) {
    state = reducer(state, action);
    for (let i = 0, len = nextListeners.length; i < len; i++) {
      nextListeners[i]();
    }
  }

  return {
    subscribe,
    getState,
    dispatch,
  } as Store;
}
```

> 为了使读者对于 Redux 的认识更清晰严谨，我们使用 Typescript 实现简单版 Redux。同时，为了保证文章严谨性，我会在每个知识点后附上单元测试以及测试结果，本文测试使用 jest，如果有还不清楚的同学可以事先学习一下 jest 的使用方法。

到这里，你可能难以置信，就在此时，你已经实现了一个简单版的 Redux。不信？我们写单元测试，看运行结果是否符合预期。

```ts
// createStore.test.ts

import {
  createStore,
} from '../../src/Advanced/Redux';

describe('test redux', () => {
  it('basic usage', () => {
    const initialState = {
      count: 0,
    };
    function reducer(state = initialState, action) {
      switch (action.type) {
        case 'ADD':
          return { ...state, count: state.count + 1 };
        case 'REDUCE':
          return { ...state, count: state.count - 1 };
        default:
          break;
      }
    }
    const store = createStore(reducer);
    store.subscribe(() => console.log(store.getState()));

    store.dispatch({ type: 'ADD' });
    expect(store.getState()).toEqual({ count: 1 });
    store.dispatch({ type: 'REDUCE' });
    expect(store.getState()).toEqual({ count: 0 });
  });
}
```

启动测试后，该测试用例顺利通过，说明简单版 Redux 封装完成。

## combineReducer

通常我们的项目都要比上例所列举的麻烦，项目中往往有很多模块中的状态都需要存储在 Redux 中，那也就意味着，我们定义的 reducer 函数中内容会特别多，这样一来，项目会变得难以维护，有什么好的办法拆开 reducer，每个模都可以定义自己状态相关的 reducer，最终在 store 创建时，合并所有的 reducer。这有点分治的意思，开发时，我们人为按照模块拆分各自的 reducer，在 store 创建时，程序自动合并我们拆分的模块生成一棵 state tree。正是 combineReducer 完成了这个合并的操作。我们先看看，使用 Redux 时，是如何使用 combineReducer 的：

```js
const countInitialState = {
  count: 0,
};
function countReducer(state = countInitialState, action) {
  switch (action.type) {
    case 'ADD':
      return { ...state, count: state.count + 1 };
    default:
      return state;
  }
}
const numInitialState = {
  num: 0,
};
function numReducer(state = numInitialState, action) {
  switch (action.type) {
    case 'PLUS':
      return { ...state, num: state.num + 1 };
    default:
      return state;
  }
}

const reducer = combineReducer({
  countState: countReducer,
  numState: numReducer,
});
const store = createStore(reducer);

store.subscribe(() => console.log(store.getState()));

store.dispatch({ type: 'ADD' });

store.dispatch({ type: 'CUT' });
```

我们定义了两个 reducer 分别为：countReducer 和 numReducer，在 createStore 前，我们使用了 combineReducer 方法，将两个 reducer 合并为一个 reducer 并返回，最终将合并后的 reducer 传递给 createStore，生成 store。
这样一分析，问题好像也明朗了，我们着眼于 combineReducer 函数：

1. 该函数接收的参数为一个对象，并且该对象满足：以对应模块状态名作为 key，以对应模块 reducer 函数作为 value；
2. 该函数返回值为 reducer，就像我们第一个示例中提到的那个 reducer 函数，他们的内在表现是一致的。

有了这两点理论依据作为支撑，我们就可以尝试写出 combineReducer 函数的基本结构了，示例如下：

```ts
function combineReducer(reducerMaps) {
  // ...
  return function combination() {
    // ...
  };
}
```

思路很简单，在 combineReducer 函数中获取到 reducerMaps 的 key 数组，然后在 combination 函数中遍历这些 key，获取各自对应的 reducer 并执行，得到各模块 state，然后将这些 state 绑定到一个变量上 nextState，最终返回 nextState，完成 reducer 的合并。

我们接着完善上面的代码，示例如下：

```ts
import { AnyAction } from './types/actions';
import {
  ReducersMapObject,
  StateFromReducersMapObject,
} from './types/reducers';

export default function combineReducer(reducers: ReducersMapObject) {
  /**
   * Get all reducer keys
   * 获取到所有 reducer key
   * */
  const reducerKeys = Object.keys(reducers);

  /**
   * Return the new reducer function
   * 返回新的 reducer 函数
   * */
  return function combination(
    state: StateFromReducersMapObject<typeof reducers> = {},
    action: AnyAction,
  ) {
    /**
     * Define a new state, which is used to store the state of all modules after the merge
     * 定义新的 state，该 state 用来存储合并之后的所有模块 state
     * */
    const nextState: StateFromReducersMapObject<typeof reducers> = {};

    /**
     * Traverse all reducers
     * 遍历所有 reducer
     * */
    for (let i = 0; i < reducerKeys.length; i++) {
      const key = reducerKeys[i];
      const reducer = reducers[key];
      /**
       * First get the value of the previous state, this is the value stored in createStore,
       * this value is a state tree, including all module states
       * 先获取到之前 state 的值，这个是 createStore 中存储的值，该值是一个 state tree，包括了所有模块 state
       * */
      const previousStateForKey = state[key];
      /**
       * The reducer is executed, and the state parameter of the incoming and outgoing state is officially
       * the state stored last time, and the new state after the calculation will be obtained after the call
       * 执行 reducer，出入的 state 参数正式上次存储的 state，调用后会获得计算后新的 state
       * */
      const nextStateForKey = reducer(previousStateForKey, action);
      /**
       * Attach the corresponding module state to the nextState object, and use key as the key
       * 将对应模块 state 挂到 nextState 对象上，且以 key 为键
       * */
      nextState[key] = nextStateForKey;
    }

    /**
     * Return the merged state
     * 返回合并后的 state
     * */
    return nextState;
  };
}
```

是不是很简单，不过不要高兴得太早，接下来编写单元测试，测试我们的这部分功能。测试用例代码如下：

```ts
// createStore.test.ts

import {
  createStore,
  combineReducer,
} from '../../src/Advanced/Redux';

describe('test redux', () => {
  it('test combineReducer', () => {
    const countInitialState = {
      count: 0,
    };
    function countReducer(state = countInitialState, action) {
      switch (action.type) {
        case 'ADD':
          return { ...state, count: state.count + 1 };
        case 'REDUCE':
          return { ...state, count: state.count - 1 };
        default:
          return state;
      }
    }
    const numInitialState = {
      num: 0,
    };
    function numReducer(state = numInitialState, action) {
      switch (action.type) {
        case 'PLUS':
          return { ...state, num: state.num + 1 };
        case 'CUT':
          return { ...state, num: state.num - 1 };
        default:
          return state;
      }
    }

    const reducer = combineReducer({
      countState: countReducer,
      numState: numReducer,
    });
    const store = createStore(reducer);

    store.subscribe(() => console.log(store.getState()));
    store.dispatch({ type: 'ADD' });
    expect(store.getState()).toHaveProperty('countState');
    expect(store.getState()).toHaveProperty('numState');
    expect((store.getState() as any).countState).toEqual({ count: 1 });
    store.dispatch({ type: 'CUT' });
    expect((store.getState() as any).numState).toEqual({ num: -1 });
  });
}
```

赞！单元测试通过。

```bash
test redux
    ✓ test combineReducer (22ms)
```

后头来看 Redux 中的这两个核心 api，是否觉得小菜一碟？从中是否学到了很多知识呢？比如：

- 闭包
- 装饰者模式

这些编程思想在另一个 api 中展现得更彻底，接下来我们看 Redux 中另外一个极其重要的方法——applyMiddleware。

## applyMiddleware

这个函数很大程度提高了 Redux 的拓展性，中间件，顾名思义是在某些操作的前或后去进行一些额外操作，这其实就是人们常说的 AOP。Redux 允许你自定义一些中间件，从而拓展 Redux 的能力，比如我们希望在 Redux 中每次 state 变化前后，都能打印相关日志，那么我们就可以定义一个**日志中间件**，这个中间件的定义很简单，我们直接上代码：

```ts
function logger(store) {
  return function(next) {
    return function(action) {
      console.group(action.type);
      console.info('dispatching logger', action);
      let result = next(action);
      console.log('next state', store.getState());
      console.groupEnd();
      return result;
    };
  };
}
```

大家还记得函数柯里化吗？这里使用函数柯里化是为了在不同的函数执行时，得到对应返回值，然后提供给后续函数使用。从上面函数的定义方式我们可以猜测，函数一层层嵌套最终需要一层层调用从而获得最终值。其实，我们不妨猜想中间件的作用就是为了强化 dispatch 能力，就像上面代码片段，我们发现 `next(action)` 这段代码，返回值 result 便是生成后的 store，这里我们不免会疑惑，不是修改 state 状态只能通过 dispatch 吗？这里是怎么回事呢？我们大胆猜想，这里的 next 函数其实就是 dispatch 披了一件外衣，本质还是 dispatch。接下来我们再看如何使用中间件，Redux 中间件的使用方法如下：

```ts
import { createStore, applyMiddleware } from 'redux';

function reducer() {}

// 使用如上定义的 logger，这里不额外定义了
const store = createStore(reducer, applyMiddleware(logger));
```

我们还知道，第一次调用 logger 需要在 applyMiddleware 函数中为其传入初始化的 store。第二次调用 logger 调用后返回的函数且以 dispatch 作为参数。还剩下最内层，那便是修饰 dispatch 的函数。分析得出这些要点之后，我们从改造 createStore 函数开始，createStore 函数新增一个参数，这个参数的名字为“enhancer”，顾名思义增强器，对应的正是 applyMiddleware 函数，该函数连续调用了两次，第一次调用传入 createStore，第二次调用传入了 reducer，具体实现如下代码所示：

```ts
import { Store, StoreEnhancer, StoreEnhancerStoreCreator } from './types/store';
import { Action } from './types/actions';
import { Reducer } from './types/reducers';

export default function createStore<
  S,
  A extends Action,
  Ext = {},
  StateExt = never
>(reducer: Reducer, enhancer?: StoreEnhancer<Ext, StateExt>): Store {
  /**
   * Determines whether enhancer exists, if so, calls enhancer and returns
   * 判断是否存在 enhancer，若存在则调用 enhancer 并返回
   * */
  if (typeof enhancer !== 'undefined') {
    if (typeof enhancer !== 'function') {
      throw new Error('Expected the enhancer to be a function.');
    }

    return enhancer(createStore as StoreEnhancerStoreCreator)(reducer) as Store;
  }

  let state: S;
  const nextListeners: (() => void)[] = [];

  function subscribe(listener: () => void) {
    nextListeners.push(listener);
  }

  function getState() {
    return state;
  }

  function dispatch(action: A) {
    state = reducer(state, action);
    for (let i = 0, len = nextListeners.length; i < len; i++) {
      nextListeners[i]();
    }
  }

  return {
    subscribe,
    getState,
    dispatch,
  } as Store;
}
```

这里实现思路不复杂，接下来我们看看 applyMiddleware 实现，既然 enhancer 经历了两次调用，那么 applyMiddleware 函数也需要通过函数柯里化实现逐层调用从而完成参数传递。分析到这儿，我们先实现一部分 applyMiddleware 函数代码，示例如下：

```ts
// applyMiddleware.ts

export default function applyMiddleware(middleware) {
  return (createStore) => (reducer) => {

    let newStore = // ...

    return newStore
  }
}
```

既然要封装 dispatch，并最终返回新的 store，就需要将初始 store 和 dispatch 解构并组装。我们修改以上代码：

```ts
export default function applyMiddleware(middleware) {
  return createStore => reducer => {
    /**
     * Initialize the store, which is the original store
     * 初始化 store，也就是原始 store
     * */
    const store = createStore(reducer);

    /**
     * Execute middleware and pass the store obtained above as a parameter
     * 执行 middleware，将上面得到的 store 作为参数传入
     * */
    const fn = middleware(store);

    /**
     * Get dispatch in the initial store
     * 获取初始 store 中的 dispatch
     * */
    const { dispatch } = store;

    /**
     * Pass in the dispatch in the initial store and return a new enhanced version of dispatch
     * 将初始 store 中的 dispatch 传入，返回一个新的加强版 dispatch
     * */
    const enhancedDispatch = fn(dispatch);

    /**
     * Return to the new store, where dispatch has been replaced with an enhanced version of dispatch
     * 返回新的 store，其中 dispatch 已替换为加强版的 dispatch
     * */
    return { ...store, dispatch: enhancedDispatch };
  };
}
```

基础版本 applyMiddleware 已完成，我们编写测试代码进行测试：

```ts
it('test middleware basic usage', () => {
  const initialState = {
    count: 0,
  };
  function reducer(state = initialState, action) {
    switch (action.type) {
      case 'ADD':
        return { ...state, count: state.count + 1 };
      case 'REDUCE':
        return { ...state, count: state.count - 1 };
      default:
        break;
    }
  }

  function logger(store) {
    return function(next) {
      return function(action) {
        console.group(action.type);
        console.info('dispatching logger', action);
        let result = next(action);
        console.log('next state', store.getState());
        console.groupEnd();
        return result;
      };
    };
  }

  const store = createStore(reducer, applyMiddleware(logger));

  store.dispatch({ type: 'ADD' });
  expect(store.getState()).toEqual({ count: 1 });
});
```

执行测试，用例通过，说明我们编写的 applyMiddleware 无误，但我们注意到一点，Redux 官方的 applyMiddleware 方法是支持传入多个中间件函数的，并且各个函数的执行顺序为一次进出，呈现经典的**洋葱模型**。我们需要改造一下 applyMiddleware 函数，让其可以执行传入的多个中间件函数。
改造 applyMiddleware 函数之前，我们需要讲解一个非常重要的函数，该函数在开发中或者是面试中都经常被问及，那就是 **compose**。该函数的功能是什么呢？我们举一个简单例子：

```ts
function logger1() {}
function logger2() {}
```

既然我们最终期望 logger1 和 logger2 执行顺序呈现**洋葱模型**，那么应该这样执行，我们手动模拟一下：

```ts
logger1(logger2());
```

是不是明白了？好，我们在看到 applyMiddleware，我们知道多个中间件是作为参数传递进 applyMiddleware 函数的，既然这样，我们首先要将参数解构为数组才好进行操作：

```ts
function applyMiddleware(...middlewares) {}
```

这样就得到了中间件数组，接下来，这些数组需要逐层包裹并调用，这让我们联想到了数组的 reduce 方法，该方法刚好满足数组前后元素在遍历过程中构成联系。考虑到这里，问题似乎迎刃而解，我们先来定义 compose 函数：

```ts
export default function compose(...funcs: Function[]) {
  return funcs.reduce((a, b) => (...args: any) => a(b(...args)));
}
```

从这里就能清晰看到，传入的函数数组会进过 reduce 方法使每个函数包裹，同时返回的是一个函数，这个函数接收一些参数，这里其实是 加强后的 dispatch。

那么接下来，我们强化 applyMiddleware 函数，代码如下：

```ts
import { compose } from './compose';

function applyMiddleware(...middlewares) {
  const store = {}; // ...
  const middlewareChain = middlewares.reduce(middleware => middleware(store));
  /**
   * Traversing the middlewareChain, nesting all functions within it one layer at a time,
   * and finally returning the result of execution
   * 遍历 middlewareChain，将其中所有函数一层层嵌套调用，并最终返回执行结果
   * */
  const dispatch = compose(...middlewareChain)(store.dispatch);
  return { ...store, dispatch };
}
```

完整代码示例如下：

```ts
import { AnyAction } from './types/actions';
import { Reducer } from './types/reducers';
import { Middleware, MiddlewareAPI } from './types/middleware';
import { Dispatch, StoreEnhancerStoreCreator } from './types/store';
import compose from './compose';

export default function applyMiddleware(...middlewares: Middleware[]) {
  return (createStore: StoreEnhancerStoreCreator) => <S, A extends AnyAction>(
    reducer: Reducer<S, A>,
  ) => {
    const store = createStore(reducer);
    let dispatch: Dispatch;

    const middlewareAPI: MiddlewareAPI = {
      getState: store.getState,
      dispatch: (action, ...args) => dispatch(action, ...args),
    };
    const chain = middlewares.map(middleware => middleware(middlewareAPI));
    dispatch = compose(...chain)(store.dispatch);

    return {
      ...store,
      dispatch,
    };
  };
}
```

别忘了编写测试用例：

```ts
it('test middleware basic usage', () => {
  const initialState = {
    count: 0,
  };
  function reducer(state = initialState, action) {
    switch (action.type) {
      case 'ADD':
        return { ...state, count: state.count + 1 };
      case 'REDUCE':
        return { ...state, count: state.count - 1 };
      default:
        break;
    }
  }

  function logger1(store) {
    return function(next) {
      return function(action) {
        console.group(action.type);
        console.info('dispatching logger111', action);
        let result = next(action);
        console.log('next state 111', store.getState());
        console.groupEnd();
        return result;
      };
    };
  }

  function logger2(store) {
    return function(next) {
      return function(action) {
        console.group(action.type);
        console.info('dispatching logger222', action);
        let result = next(action);
        console.log('next state 222', store.getState());
        console.groupEnd();
        return result;
      };
    };
  }

  const store = createStore(reducer, applyMiddleware(logger1, logger2));

  store.dispatch({ type: 'ADD' });
  expect(store.getState()).toEqual({ count: 1 });
  store.dispatch({ type: 'REDUCE' });
  expect(store.getState()).toEqual({ count: 0 });
});
```

执行测试，测试通过，说明我们定义的 applyMiddleware 无误。

## 总结

- Redux 发布订阅模式实现
- combineReducer、applyMiddleware 方法的实现均使用到了函数柯里化，通过函数柯里化实现参数传递以及作用域隔离
- 应用中的状态变化，只能通过触发 action，从而执行对应 reducer 更新状态，通过源码我们可以看到，每次 dispatch 都执行了 reducer 并将返回值赋值给了 state 进行存储
- Redux 支持使用中间件的方式拓展 Redux 能力，中间件是一个装饰者模式实现，传入当前 dispatch，经过中间件会返回一个增强版 dispatch
