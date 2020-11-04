---
nav:
  title: 进阶
order: 5
title: React 原理浅析
---

## React 带来了什么

React 现已成为前端主流开发框架之一，在此之前，我们常选用原生 JS 或者 JQuery 进行开发，在之后的发展中，为什么会诞生诸如 React、Vue、Angular 的框架呢？原因有下：

1. 前端应用日趋复杂
2. 模块、依赖管理需要
3. 性能优化
4. 团队效能、规范等

最初我们完成前端开发中节点添加的功能，需要直接操作 DOM，原生 JavaScript 代码如下：

```js
const divDom = document.createElement('div');
divDom.textContent = 'Hello World!';

document.body.appendChild(divDom);
```

JQuery 版本代码如下：

```js
const $div = $('<div></div>');
$div.text('Hello World');

$(document.body).append($div);
```

以上是操作 DOM 的一个简单例子，如果场景更复杂，我们通过这种方式开发应用成本是很高的，此时，诸如 React 的框架应运而生，以上代码我们使用开发如下：

```js
const App = <div>Hello World!</div>;
ReactDOM.render(<App />, document.getElementById('app'));
```

render 方法被调用时，组件将会被挂载到 DOM 节点上，在 React 中，App 组件和 DOM 之间是有能在联系的。

## 初探 React 原理

上例中我们还发现有更有趣的地方，JavaScript 代码中可以直接书写 HTML 代码片段，这一特性我们称之为 JSX。但，如果你了解过 React 早期的项目，你也许还记得：

```js
React.createClass();
```

之类的函数，为什么新版本的 React 中已不见其踪影？那是因为新版 React 应用大多需要编译，我们通常使用 babel 来编译前端代码，这也就是说我们所书写的 JSX，其实是面向于开发者的，最终 JSX 会被 babel 进行转换，我们以下为例：

```html
<div title="header">hello</div>
```

这里抛出一个问题，如果你需要用 JavaScript 设计一种结构去存储这个节点，你会怎么做？带着这个问题，结合我们说到的 babel 转化 JSX 代码，createElement 登场。

> Tip：jsx 代码使用 babel-preset-react 进行处理

上例经过转换后，生成如下代码：

```js
React.createElement(
  'div',
  {
    title: 'header',
  },
  'hello',
);
```

到这里才真正触及 React 框架内容，我们按图索骥，从这个 api 着手，一瞥 React 设计思想。

`React.createElement` 方法调用返回的参数正是我们前面抛出问题的答案，这一段简短 JSX 需要用数据来进行描述，怎样描述呢？我们发现，每个 JSX 都能够抽象为一个对象，JSX 的嵌套可以使用 Tree 描述。我们先来看最简单结构调用 `React.createElement` 方法后的返回：

```js
const element = {
  type: 'div',
  props: {
    title: 'header',
    children: 'hello',
  },
};
```

既然有了这些描述信息，我们想渲染到 DOM 中就很容易了，怎么做呢？我们通过节点描述信息，将该节点挂载到 DOM 上：

```js
const element = {
  type: 'div',
  props: {
    title: 'header',
    children: 'hello',
  },
};

const { type, props } = element;
const dom = document.createElement(type);
dom.setAttribute(props.title);

const text = document.createTextNode(props.children);

dom.appendChild(text);

document.getElementById('app').appendChild(dom);
```

以上模拟了 React 框架最核心的内容，概括起来包括：

1. React.createElement 构建节点信息
2. 根据构建节点信息，在某时刻将结点挂载到 DOM 上

## React.createElement

前面我们看到，JSX 经过 babel 转换后，还生成包含 `React.createElement` 片段的代码，这小节我们深入研究该 api 的实现。
首先我们来看一个例子，在开发中通常节点信息略微复杂，假设现在有这样一段 JSX：

```html
<div title="header">
  <p title="name">name</p>
</div>
```

首先经过 babel 转化后，会生成如下代码：

```js
React.createElement(
  'div',
  {
    title: 'header',
  },
  React.createElement(
    'p',
    {
      title: 'name',
    },
    'name',
  ),
);
```

发现规律了吗？`createElement` 接收三个参数，第一个参数表示当前 JSX 节点的类型，第二个参数表示当前 JSX 节点属性，第三个参数为嵌套内容，不过有时，不止三个参数，前两个参数是固定的，以后的参数为动态参数，个数未定，这点我们稍后介绍。
最终 `React.createElement` 函数调用后，如上结构会用以下结构描述：

```js
const element = {
  type: 'div',
  props: {
    title: 'header',
    children: [
      {
        type: 'div',
        props: {
          title: 'name',
          children: 'hello',
        },
      },
    ],
  },
};
```

根据这个分析，我们再来个复杂些的 JSX 结构：

```html
<div title="header">
  <p title="n1">n1 text</p>
  <p title="n2">n2 text</p>
</div>
```

经过 JSX 转化后，会生成如下代码：

```js
React.createElement(
  'div',
  {
    title: 'header',
  },
  React.createElement(
    'p',
    {
      title: 'n1',
    },
    'n1 text',
  ),
  React.createElement(
    'p',
    {
      title: 'n2',
    },
    'n2 text',
  ),
);
```

规律似乎已找到，根据总结的这些内容，我们进行初步尝试，封装 `createElement` 函数。封装该函数有几个要点，分别为：

1. 传入参数为动态参数，第一个参数表示节点类型，第二个参数表示节点属性，第三个以后参数表示嵌套子元素
2. 方法返回值为对象

好了，来试试吧！

```js
function createElement(type, props, ...children) {
  return {
    type,
    props: {
      ...props,
      children,
    },
  };
}
```

这里 children 中的元素可能有不同类型的值，我们划分为 object 和 string 类型，在处理时，需要根据不同类型区别处理。进行优化后如下：

```js
function createElement(type, props, ...children) {
  return {
    type,
    props: {
      ...props,
      children: children.map(child =>
        typeof child === 'object' ? child : createTextElement(child),
      ),
    },
  };
}

function createTextElement(text) {
  return {
    type: 'TEXT_ELEMENT',
    props: {
      children: text,
      text,
    },
  };
}
```

不过，我们这里处理还是有漏洞的，例如布尔类型值 null 依然会创建节点并挂载，这与 React 设计是不一致的，我们这里先忽略。

处理完整步骤如下：

```js
const App = (
  <div title="header">
    <p title="n1">n1 text</p>
  </div>
);
```

babel 转换为如下代码：

```js
const App = React.createElement(
  'div',
  {
    title: 'header',
  },
  React.createElement(
    'p',
    {
      title: 'n1',
    },
    'n1 text',
  ),
);
```

该函数调用之后，返回如下对象：

```js
const element = {
  type: 'div',
  props: {
    title: 'header',
    children: {
      type: 'p',
      props: {
        title: 'n1',
        children: 'n1 text',
      },
    },
  },
};
```

> Tip：当一个元素中嵌套一个以上节点时，children 为数组；当只有单个元素使，children 为对象；只有文字内容时，children 为字符串。本例以单个子元素进行分析。

通过该方法，我们就可以将节点挂载到 DOM 上了，该操作在 ReactDOM.render 函数中进行。

## ReactDOM.render

render 函数负责根据转化后的节点信息，创建对应节点，然后挂载 DOM，节点类型来自于节点信息的 type 字段。这样我们可以分析出最简单的函数体结构，如下：

```js
function render(element, rootDom) {
  const dom = document.createElement(element.type);

  rootDom.appendChild(dom);
}
```

在此基础上，我们还需要支持节点的嵌套，我们再审视一下节点信息，发现节点中的 children 属性构成自顶向下的树结构，我们可以使用当前节点可视为内层嵌套节点的父节点，所以这里可以使用递归实现 DOM 绑定，修改后的 render 如下：

```js
function render(element, rootDom) {
  const dom = document.createElement(element.type);

  const { children } = element.props;
  children.forEach(child => render(child, dom));

  rootDom.appendChild(dom);
}
```

此时，程序已初具雏形，但任无法运行，因为 children 类型存在对象和字符串，所以需要判断 type 以使用不同方式创建 DOM 节点，并在合适时机递归调用 render，修改后代码如下：

```js
function render(element, rootDom) {
  const dom =
    element.type === 'TEXT_ELEMENT'
      ? document.createTextNode(element.props.text)
      : document.createElement(element.type);

  const { props: elProps } = element;
  /**
   * Assign all the values in props to the DOM as properties
   * 将 props 中的所有值，作为属性赋值给 DOM
   * */
  Object.keys(elProps).forEach(name => {
    if (name !== 'children' && element.type !== 'TEXT_ELEMENT') {
      dom.setAttribute(name, elProps[name]);
    }
  });

  const { children } = elProps;

  if (Array.isArray(children)) {
    children.forEach(child => render(child, dom));
  }

  rootDom.appendChild(dom);
}
```

> 我们这里忽略了 children 为数组的情况。

完整代码展示如下：

```js
function createElement(type, props, ...children) {
  return {
    type,
    props: {
      ...props,
      children: children.map(child =>
        typeof child === 'object' ? child : createTextElement(child),
      ),
    },
  };
}

function createTextElement(text) {
  return {
    type: 'TEXT_ELEMENT',
    props: {
      children: text,
      text,
    },
  };
}

function render(element, rootDom) {
  const dom =
    element.type === 'TEXT_ELEMENT'
      ? document.createTextNode(element.props.text)
      : document.createElement(element.type);

  const { props: elProps } = element;
  /**
   * Assign all the values in props to the DOM as properties
   * 将 props 中的所有值，作为属性赋值给 DOM
   * */
  Object.keys(elProps).forEach(name => {
    if (name !== 'children' && element.type !== 'TEXT_ELEMENT') {
      dom.setAttribute(name, elProps[name]);
    }
  });

  const { children } = elProps;

  if (Array.isArray(children)) {
    children.forEach(child => render(child, dom));
  }

  rootDom.appendChild(dom);
}

const HeReact = {
  createElement,
  render,
};

/** @jsx HeReact.createElement */
const element = (
  <div title="header">
    <p title="n1">n1 text</p>
  </div>
);

HeReact.render(element, document.getElementById('app'));
```

以上 @jsx 注释代码，使用 @babel/plugin-transform-react-jsx 即可完成转化。简单提示如下：

1. 使用 CLI 方式安装 babel：`npm install --save-dev @babel/core @babel/cli`
2. 安装并配置 transform-react-jsx 插件：`npm install --save-dev @babel/plugin-transform-react-jsx`，.babelrc 中配置 `{ "plugins": ["@babel/plugin-transform-react-jsx"] }`
3. 转换代码：`npx babel index.js --out-file index.prod.js`

## Scheduler

我们对计算机系统中的 CPU 调度可能并不陌生，我们期望 CPU 能够最大能力执行任务，这就需要协调资源从而充分利用。在 React 中，我们也期望实现这样一个调度系统，在合适时机去更新视图。

通常，需要触发视图更新的操作有以下几种：

1. 用户输入
2. 动画
3. 数据更新

以上三种为视图更新过程中的优先级顺序，我们期望按照这个顺序执行视图更新，因此需要定义更新优先级规则。这个过程我们称为调度（schedule），这是在 React 16 中额外加入的。

在 React 15 中，React 架构可归纳为：

1. Reconciler（协调器）—— 标记变化组件
2. Renderer（渲染器）—— 将变化组件处理并渲染到页面上

而在 React 16 中，为了优化性能，更大程度使用资源，调整架构如下：

1. Scheduler（调度器）—— 调度任务的优先级，高优任务优先进入 Reconciler
2. Reconciler（协调器）—— 标记变化的组件
3. Renderer（渲染器）—— 将变化的组件渲染到页面上

在 React 15 中使用 `Stack Reconcilation（栈调和器）` 最大的缺陷是调和过程不可中断，从而导致线程阻塞，造成动画卡顿、用户输入反馈迟钝等问题。在浏览器中的 js 没有进程的概念，我们只有从侧面完成抢占资源这一操作。

React 16 中，调度相关内容单独发布为 Scheduler 包，在早期，调度时间分片使用计算 **expirationTime** 实现，但这种方式的缺陷日益明显，因此重构使用了 **lane** 模型替换了 expirationTime 的方式。

由于调度实现略微复杂，并且早期 React 团队考虑了使用较为简单的做法（requestIdleCallback）实现，我们将以这种较为简单的方式实现。

> 考虑方案普适性与健壮性，我们将以上提到的调度方案进行排序：lane > expirationTime > requestIdleCallback

requestIdleCallback 方法和我们常见的 setTimeout 或者 requestAnimationFrame 类似，不同的是，requestIdleCallback 方法可以在浏览器主线程空闲时调用，以此实现资源抢占。

```js
function workLoop() {
  // ...
  requestIdleCallback(workLoop)
}
​
requestIdleCallback(workLoop)
```

当浏览器主线程空闲时间，则会尝试调用 workLoop 方法，该方法中完成 React 组件更新优先级的评判，并且在需要的时，暂停当前更新以执行更紧急的任务，紧急任务执行完后，会回到中断点继续执行之前暂停任务。

我们需要定义一个链表，用于存储需要执行的任务，我们将该链表定义为 nextUnitOfWork，初始值为空。当浏览器空闲，则会检查链表是否有，有则需要执行处理并更新视图，改进后代码如下：

```js
let nextUnitOfWork = null;

function workLoop() {
  while(nextUnitOfWork) {
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork)
  }
  requestIdleCallback(workLoop)
}
​
requestIdleCallback(workLoop)

function performUnitOfWork(nextUnitOfWork) {
  //...
}
```

但我们发现，这里 performUnitOfWork 是无法中断的，怎么改进呢？其实很简单，加一个需要中断的标识，定义一个判断是否需要中断的方法，执行该方法来做检测：

```js
// shouldYield
function shouldYield() {
  // ...
  return false;
}

while (nextUnitOfWork) {
  if (shouldYield()) {
    break;
  }
  nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
}
```

这样就能实现中断功能了，在 React 中使用 expirationTime 机制实现优先级，并且，很多面试中会考察，React 中 setState 是异步的吗？为什么？

其实就是因为 React 中 expirationTime 的计算机制，在一定范围类触发的更新任务会合并处理。

为了实现任务切片，React 引入了 Fiber。

## Fiber 架构

Fiber 是一个数据结构用来描述任务与节点之间的关系，Fiber 还是一种架构方案用于实现 React 16 的 Reconciler。

我们先以**数据结构**角度分析 Fiber。Fiber 像一棵树，每个节点均存储了与相邻节点之间的关系。通常一个 Fiber 节点需要存储这些关系：

- parent
- child
- sibling

有了这样的数据结构，下一个执行单元的搜寻会变得更为简单
比如我们现在有这样的页面结构：

```html
<div>
  <p>
    <span></span>
    <a></a>
  </p>
</div>
```

当我们从 div 开始时，会尝试访问 div 的子节点，以此来到了 p，在 p 节点尝试访问子节点，来到了 span， 此时 span 已然没有了子元素，只得访问兄弟节点，于是来到了 a。此时 a 没有子元素，也没有兄弟元素，则只能往上到达父节点 p，p 已遍历完所有后代且没有兄弟元素，则继续通过 parent 找到 div，我们这里的 div 是 root 节点，不再网上搜寻，至此完成 所有 performUnitOfWork 工作。

这里我们需要清楚一点，经过以上步骤后，才会进到 render，进行页面渲染，就像我们前面提到的 React 16 架构：Scheduler -> Reconciler -> Renderer。首先调整 render 中的代码，还记得之前的 nextUnitOfWork 吗？在初始化的时候，也就是在我们调用 render 函数的时候，首次将 nextUnitOfWork 设置为如下结构：

```js
function render(element, dom) {
  nextUnitOfWork = {
    dom: container,
    props: {
      children: [element],
    },
  };
}
```

这里可以看到的对象，就是简化后的 Fiber，其中包含了当前 unitOfWork 对应的 dom，以及 props 等信息，当然 React 中的 Fiber 结构比这更复杂，我们逐步完善。

## Render Commit & Reconciliation

有了 Fiber 结构，我们来改写 performUnitOfWork 方法。通常，我们需要将组件进行分类，比如属于浏览器的**宿主组件**（div、p）更新，再比如我们自定义的函数组件，我们需要通过 Fiber 的 type 属性区分，本例以这两种组件的更新为例：

```js
function performUnitOfWork(fiber) {
  /**
   * Determines whether it is a functional component or a browser native tag component
   * 判断是函数组件，还是浏览器原生标签组件
   * */
  const isFunctionComponent = fiber.type instanceof Function;
  /**
   * Depending on the type, different update methods are called
   * 根据不同类型，调用不同更新方法
   * */
  if (isFunctionComponent) {
    updateFunctionComponent(fiber);
  } else {
    updateHostComponent(fiber);
  }
  /**
   * Return to the next unitOfWork
   * 返回下一个 unitOfWork
   * */
  if (fiber.child) {
    return fiber.child;
  }
  /**
   * If there is no point of its own, you need to follow the lookup we analyzed earlier up to the root level
   * 如果没有自己点，则需要按照我们前面分析的查找逐级往上直到 root
   * */
  let nextFiber = fiber;
  while (nextFiber) {
    if (nextFiber.sibling) {
      return nextFiber.sibling;
    }
    nextFiber = nextFiber.parent;
  }
}

function updateFunctionComponent(fiber) {
  /*TODO*/
}

function updateHostComponent(fiber) {
  /*TODO*/
}
```

现在回到 render 函数定义，我们需要介绍另一个 React 核心思想：**双缓存**。通常，我们为了提升计算性能，会将计算的过程再内存中进行，计算得到结果后，一次性将结果渲染到页面，这样的机制我们称为双缓存。前面我们提到，React 应用在调度过程，借助 nextUnitOfWork 进行 workLoop 遍历，与此同时还有另外一个变量，用于备份 nextUnitOfWork ，我们且将这个变量定义为 wipRoot，与之形成双缓存机制的变量我们定义为 currentRoot，那么在应用初次渲染时，为该变量赋值。我们看改进后的 render 函数：

```js
function render(element, dom) {
  wipRoot = {
    dom,
    props: {
      children: [element],
    },
  }
  nextUnitOfWork = wipRoot
}
​
let nextUnitOfWork = null
let wipRoot = null
let currentRoot = null;
```

我们已经清楚，当 nextUnitOfWork 为空时，表示已将触发更新后需要更新的节点遍历完成，这是就需要将 reconcile 的结果渲染到页面。渲染的过程，我们单独定义在 `commitRoot` 函数中。commitRoot 函数其实很简单，调用 commitWork 用于将每个节点单元渲染至页面这个函数在 workLoop 中调用，前提条件正是 nextUnitOfWork 为空并且 wipRoot 存在。代码示例如下：

```js
function commitRoot() {
  // TODO
}

function workLoop(deadline) {
  // ...
  if (!nextUnitOfWork && wipRoot) {
    commitRoot();
  }
  // ...
}
```

接下来，处理 commitRoot，该函数是提交更新的入口，各节点更新我们定义 commitWork 实现，示例如下：

```js
function commitRoot() {
  commitWork(wipRoot.child)
  wipRoot = null
}
​
function commitWork(fiber) {
  if (!fiber) {
    return
  }
  const domParent = fiber.parent.dom
  domParent.appendChild(fiber.dom)

  /**
   * Recursively traverse the nodes that need to be updated
   * 递归遍历需要更新的节点
   * */
  commitWork(fiber.child)
  commitWork(fiber.sibling)
}
```

介绍了整体内容，我们回到调和过程。调和其实就是为每个节点 Fiber 打标签，哪个更改了？哪个删除了？哪个替换了？这些情况均会在遍历到每个节点时，标记到 Fiber 的 effectTag 上，最后在 commitWork 中会根据这些 effectTag 进行渲染处理。我们先来看普通宿主组件的更新 reconcile 处理。普通宿主组件的 reconcile 处理入口为 updateHostComponent：

```js
function updateHostComponent(fiber) {
  if (!fiber.dom) {
    fiber.dom = createDom(fiber);
  }
  reconcileChildren(fiber, fiber.props.children);
}

function reconcileChildren(wipFiber, elements) {}
```

对于子节点的遍历，我们通过 Fiber 上的缓存信息获取，也就是 alternate，获取到以后，遍历所有子节点，完成比对。reconcileChildren 函数中定义类型对比规则，以及生成新的 Fiber。

```js
function reconcileChildren(wipFiber, elements) {
  let index = 0;
  let oldFiber = wipFiber.alternate && wipFiber.alternate.child;
  let prevSibling = null;

  while (index < elements.length || oldFiber != null) {
    const element = elements[index];
    let newFiber = null;

    const sameType = oldFiber && element && element.type == oldFiber.type;

    if (sameType) {
      newFiber = {
        type: oldFiber.type,
        props: element.props,
        dom: oldFiber.dom,
        parent: wipFiber,
        alternate: oldFiber,
        effectTag: 'UPDATE',
      };
    }
    if (element && !sameType) {
      newFiber = {
        type: element.type,
        props: element.props,
        dom: null,
        parent: wipFiber,
        alternate: null,
        effectTag: 'PLACEMENT',
      };
    }
    if (oldFiber && !sameType) {
      oldFiber.effectTag = 'DELETION';
      deletions.push(oldFiber);
    }

    if (oldFiber) {
      oldFiber = oldFiber.sibling;
    }

    if (index === 0) {
      wipFiber.child = newFiber;
    } else if (element) {
      prevSibling.sibling = newFiber;
    }

    prevSibling = newFiber;
    index++;
  }
}
```

映入眼帘的是 index 这个变量，我们知道 React 在遍历生成子组件时，都需要指定 key 以提高比对性能，这里我们使用 index 来模拟这个过程。
这里可以清晰看到，在对比了 child 后，会根据对比结果，生成对应新的 Fiber，每个 Fiber 中都给定了需要对节点做出什么处理：

- UPDATE：说明节点可复用，Fiber 中的 alternate 可以指向上一次节点所对应 Fiber
- PLACEMENT：说明节点不可复用，需将节点添加到 DOM 中
- DELETION：表示节点删除，则将该节点 Fiber 放入本次更新 deletions 数组中

这些流程都完成以后，表示 reconcile 完成，这是 nextUnitOfWork 为空，则进入 commit 阶段，从 commitRoot 方法进入，递归调用 commitWork 方法以更新 reconcile 对比出所有需要更新的节点。

```js
function commitWork(fiber) {
  if (!fiber) {
    return;
  }

  let domParentFiber = fiber.parent;
  while (!domParentFiber.dom) {
    domParentFiber = domParentFiber.parent;
  }
  const domParent = domParentFiber.dom;

  if (fiber.effectTag === 'PLACEMENT' && fiber.dom != null) {
    domParent.appendChild(fiber.dom);
  } else if (fiber.effectTag === 'UPDATE' && fiber.dom != null) {
    updateDom(fiber.dom, fiber.alternate.props, fiber.props);
  } else if (fiber.effectTag === 'DELETION') {
    commitDeletion(fiber, domParent);
  }

  commitWork(fiber.child);
  commitWork(fiber.sibling);
}

function commitDeletion(fiber, domParent) {
  if (fiber.dom) {
    domParent.removeChild(fiber.dom);
  } else {
    commitDeletion(fiber.child, domParent);
  }
}

function updateDom(dom, prevProps, nextProps) {
  // TODO
}
```

可以看到，commitWork 原理其实也比较简单，就是将 fiber 遍历，根据 reconcile 阶段对比出的差异，根据不同 effectTag 值执行对应操作：

- PLACEMENT：appendChild
- UPDATE：我们定义更新规则，其中需要更新的包括，props、事件等
- DELETION：将 deletions 数组中 Fiber 对应 dom 删除

updateDom 中定义更新规则，这里需要定义一些变量用于更新，示例如下：

```js
const isEvent = key => key.startsWith('on');
const isProperty = key => key !== 'children' && !isEvent(key);
const isNew = (prev, next) => key => prev[key] !== next[key];
const isGone = (prev, next) => key => !(key in next);

function updateDom(dom, prevProps, nextProps) {
  /**
   * 删除旧的事件处理
   * */
  Object.keys(prevProps)
    .filter(isEvent)
    .filter(key => !(key in nextProps) || isNew(prevProps, nextProps)(key))
    .forEach(name => {
      const eventType = name.toLowerCase().substring(2);
      dom.removeEventListener(eventType, prevProps[name]);
    });

  /**
   * Delete old props
   * 删除旧 props
   * */
  Object.keys(prevProps)
    .filter(isProperty)
    .filter(isGone(prevProps, nextProps))
    .forEach(name => {
      dom[name] = '';
    });

  /**
   * Set up a new props
   * 设置新的 props
   * */
  Object.keys(nextProps)
    .filter(isProperty)
    .filter(isNew(prevProps, nextProps))
    .forEach(name => {
      dom[name] = nextProps[name];
    });

  /**
   * Add a new event handler
   * 添加新的事件处理函数
   * */
  Object.keys(nextProps)
    .filter(isEvent)
    .filter(isNew(prevProps, nextProps))
    .forEach(name => {
      const eventType = name.toLowerCase().substring(2);
      dom.addEventListener(eventType, nextProps[name]);
    });
}
```

到这里，我们的项目已具备了基础的 React 功能，接下来为了简单串联组件以及状态的更新处理，进一步封装函数组件处理以及 useState Hook。

## 函数组件

定义函数组件的更新处理函数 updateFunctionComponent：

```js
let hookIndex = null;

function updateFunctionComponent(fiber) {
  wipFiber = fiber;
  hookIndex = 0;
  wipFiber.hooks = [];
  const children = [fiber.type(fiber.props)];
  reconcileChildren(fiber, children);
}
```

函数组件的状态使用 hooks 进行存储，我们将这些状态放在 fiber 的 hooks 数组上。hook 存储状态的思想和 redux 很相近，当 setState 调用后，会将本次任务放到 nextUnitOfWork 上，通过 workLoop，在空闲时机执行。首先我们会通过 Fiber 的 alternate 获取到上次内容，如果存在则获取对应 Hook。每次调用 Hook 会将处理函数存放至对应 Fiber 中 hooks 对应 queue 中，每调用一次会更新 hookIndex。代码片段示例如下：

```js
function useState(initial) {
  const oldHook =
    wipFiber.alternate &&
    wipFiber.alternate.hooks &&
    wipFiber.alternate.hooks[hookIndex];
  const hook = {
    state: oldHook ? oldHook.state : initial,
    queue: [],
  };

  const actions = oldHook ? oldHook.queue : [];
  actions.forEach(action => {
    hook.state = action(hook.state);
  });

  const setState = action => {
    hook.queue.push(action);
    wipRoot = {
      dom: currentRoot.dom,
      props: currentRoot.props,
      alternate: currentRoot,
    };
    nextUnitOfWork = wipRoot;
    deletions = [];
  };

  wipFiber.hooks.push(hook);
  hookIndex++;
  return [hook.state, setState];
}
```

## 使用

到这里，React 超级体验版就能跑起来了，先贴出完整代码：

```js
function createElement(type, props, ...children) {
  return {
    type,
    props: {
      ...props,
      children: children.map(child =>
        typeof child === 'object' ? child : createTextElement(child),
      ),
    },
  };
}

function createTextElement(text) {
  return {
    type: 'TEXT_ELEMENT',
    props: {
      nodeValue: text,
      children: [],
    },
  };
}

function createDom(fiber) {
  const dom =
    fiber.type == 'TEXT_ELEMENT'
      ? document.createTextNode('')
      : document.createElement(fiber.type);

  updateDom(dom, {}, fiber.props);

  return dom;
}

const isEvent = key => key.startsWith('on');
const isProperty = key => key !== 'children' && !isEvent(key);
const isNew = (prev, next) => key => prev[key] !== next[key];
const isGone = (prev, next) => key => !(key in next);
function updateDom(dom, prevProps, nextProps) {
  //Remove old or changed event listeners
  Object.keys(prevProps)
    .filter(isEvent)
    .filter(key => !(key in nextProps) || isNew(prevProps, nextProps)(key))
    .forEach(name => {
      const eventType = name.toLowerCase().substring(2);
      dom.removeEventListener(eventType, prevProps[name]);
    });

  // Remove old properties
  Object.keys(prevProps)
    .filter(isProperty)
    .filter(isGone(prevProps, nextProps))
    .forEach(name => {
      dom[name] = '';
    });

  // Set new or changed properties
  Object.keys(nextProps)
    .filter(isProperty)
    .filter(isNew(prevProps, nextProps))
    .forEach(name => {
      dom[name] = nextProps[name];
    });

  // Add event listeners
  Object.keys(nextProps)
    .filter(isEvent)
    .filter(isNew(prevProps, nextProps))
    .forEach(name => {
      const eventType = name.toLowerCase().substring(2);
      dom.addEventListener(eventType, nextProps[name]);
    });
}

function commitRoot() {
  deletions.forEach(commitWork);
  commitWork(wipRoot.child);
  currentRoot = wipRoot;
  wipRoot = null;
}

function commitWork(fiber) {
  if (!fiber) {
    return;
  }

  let domParentFiber = fiber.parent;
  while (!domParentFiber.dom) {
    domParentFiber = domParentFiber.parent;
  }
  const domParent = domParentFiber.dom;

  if (fiber.effectTag === 'PLACEMENT' && fiber.dom != null) {
    domParent.appendChild(fiber.dom);
  } else if (fiber.effectTag === 'UPDATE' && fiber.dom != null) {
    updateDom(fiber.dom, fiber.alternate.props, fiber.props);
  } else if (fiber.effectTag === 'DELETION') {
    commitDeletion(fiber, domParent);
  }

  commitWork(fiber.child);
  commitWork(fiber.sibling);
}

function commitDeletion(fiber, domParent) {
  if (fiber.dom) {
    domParent.removeChild(fiber.dom);
  } else {
    commitDeletion(fiber.child, domParent);
  }
}

function render(element, container) {
  wipRoot = {
    dom: container,
    props: {
      children: [element],
    },
    alternate: currentRoot,
  };
  deletions = [];
  nextUnitOfWork = wipRoot;
}

let nextUnitOfWork = null;
let currentRoot = null;
let wipRoot = null;
let deletions = null;

function workLoop(deadline) {
  let shouldYield = false;
  while (nextUnitOfWork && !shouldYield) {
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
    shouldYield = deadline.timeRemaining() < 1;
  }

  if (!nextUnitOfWork && wipRoot) {
    commitRoot();
  }

  requestIdleCallback(workLoop);
}

requestIdleCallback(workLoop);

function performUnitOfWork(fiber) {
  const isFunctionComponent = fiber.type instanceof Function;
  if (isFunctionComponent) {
    updateFunctionComponent(fiber);
  } else {
    updateHostComponent(fiber);
  }
  if (fiber.child) {
    return fiber.child;
  }
  let nextFiber = fiber;
  while (nextFiber) {
    if (nextFiber.sibling) {
      return nextFiber.sibling;
    }
    nextFiber = nextFiber.parent;
  }
}

let wipFiber = null;
let hookIndex = null;

function updateFunctionComponent(fiber) {
  wipFiber = fiber;
  hookIndex = 0;
  wipFiber.hooks = [];
  const children = [fiber.type(fiber.props)];
  reconcileChildren(fiber, children);
}

function useState(initial) {
  const oldHook =
    wipFiber.alternate &&
    wipFiber.alternate.hooks &&
    wipFiber.alternate.hooks[hookIndex];
  const hook = {
    state: oldHook ? oldHook.state : initial,
    queue: [],
  };

  const actions = oldHook ? oldHook.queue : [];
  actions.forEach(action => {
    hook.state = action(hook.state);
  });

  const setState = action => {
    hook.queue.push(action);
    wipRoot = {
      dom: currentRoot.dom,
      props: currentRoot.props,
      alternate: currentRoot,
    };
    nextUnitOfWork = wipRoot;
    deletions = [];
  };

  wipFiber.hooks.push(hook);
  hookIndex++;
  return [hook.state, setState];
}

function updateHostComponent(fiber) {
  if (!fiber.dom) {
    fiber.dom = createDom(fiber);
  }
  reconcileChildren(fiber, fiber.props.children);
}

function reconcileChildren(wipFiber, elements) {
  let index = 0;
  let oldFiber = wipFiber.alternate && wipFiber.alternate.child;
  let prevSibling = null;

  while (index < elements.length || oldFiber != null) {
    const element = elements[index];
    let newFiber = null;

    const sameType = oldFiber && element && element.type == oldFiber.type;

    if (sameType) {
      newFiber = {
        type: oldFiber.type,
        props: element.props,
        dom: oldFiber.dom,
        parent: wipFiber,
        alternate: oldFiber,
        effectTag: 'UPDATE',
      };
    }
    if (element && !sameType) {
      newFiber = {
        type: element.type,
        props: element.props,
        dom: null,
        parent: wipFiber,
        alternate: null,
        effectTag: 'PLACEMENT',
      };
    }
    if (oldFiber && !sameType) {
      oldFiber.effectTag = 'DELETION';
      deletions.push(oldFiber);
    }

    if (oldFiber) {
      oldFiber = oldFiber.sibling;
    }

    if (index === 0) {
      wipFiber.child = newFiber;
    } else if (element) {
      prevSibling.sibling = newFiber;
    }

    prevSibling = newFiber;
    index++;
  }
}

const Didact = {
  createElement,
  render,
  useState,
};
```

使用方式如下：

```js
/** @jsx Didact.createElement */
function Counter() {
  const [state, setState] = Didact.useState(1);
  return (
    <h1 onClick={() => setState(c => c + 1)} style="user-select: none">
      Count: {state}
    </h1>
  );
}
const element = <Counter />;
const container = document.getElementById('root');
Didact.render(element, container);
```

这样在每次点击，页面都会更新渲染。

本文代码及主要思路来自于：[build your own react](https://pomb.us/build-your-own-react/)
