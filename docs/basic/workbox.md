---
nav:
  title: 💊 基础
title: Workbox 应用
order: 3
---

性能始终在时间与空间上相互权衡取舍，计算机系统的优化需要借助各种缓存策略，从 CPU 到内存，从接口到外设。如果有一天，硬件成本和实现难度不再是阻碍，也许便没有了“优化”这个字眼。

当下，前端面临的优化与挑战更多，复杂的终端环境，各种不同的浏览器内核，尺寸不一的浏览设备，兼容要做。复杂不稳定的网络环境，越来越多的资源，优化要做。对于缓存，我们并不陌生，但是我们想有主观意识的缓存，我想缓存什么，缓存多久，缓存和请求资源的策略是什么都有自己来定， `service worker` 能帮我们做到。

使用 `service worker` 前，需要创建一份注册文件，不妨在项目下创建一个名为 `sw.js` 的文件

```js
console.log('Hello, I am sw.js file');
```

然后在应用中通过这个文件进行注册，通过以下代码就能完成应用中 `service worker` 的注册，后面关于 `service worker` 相关的处理，在 `sw.js` 文件中进行

```js
< script >
    // 检查当前浏览器是否支持service workers
    if ('serviceWorker' in navigator) {
        // 确保资源加载完成，再注册service worker
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/sw.js');
        });
    } <
    /script>
```

刷新页面，就能看到控制台打印了这句话，表示 `service worker` 注册成功

![https://user-gold-cdn.xitu.io/2019/12/27/16f476d1a94c30e9?imageView2/0/w/1280/h/960/format/webp/ignore-error/1](https://user-gold-cdn.xitu.io/2019/12/27/16f476d1a94c30e9?imageView2/0/w/1280/h/960/format/webp/ignore-error/1)

打开控制台 `Application` ，一切在掌控之中， `service worker` 注册成功

![https://user-gold-cdn.xitu.io/2019/12/27/16f476d6d63db510?imageView2/0/w/1280/h/960/format/webp/ignore-error/1](https://user-gold-cdn.xitu.io/2019/12/27/16f476d6d63db510?imageView2/0/w/1280/h/960/format/webp/ignore-error/1)

到这里完成了，完成了 `service worker` 的注册，关于其相关的配置和处理，我们一起去 `sw.js` 文件中定义吧！

Google 推出的、标准统一 api 操作的、基于 `service worker` 的策略缓存库，它有一下几点让人称赞的特点

1. Precaching
2. Runtime caching
3. Strategies
4. Request routing
5. Background sync
6. Helpful debuggin
7. Greater flexibility and feature set than sw-precache and sw-toolbox

我想起了一句话，简单的概念复杂化，通俗的概念神秘化，这是为了展示自己的不凡，😆，开个玩笑。相信大多人看到这些概念是蒙的，我们只需要围绕一个概念：**缓存** ，并且是策略性的，存什么是可以控制的，也给我们开发离线应用提供了思路。

## 使用 Workbox

还记得那个 `sw.js` 文件吗？现在我们把中心放在它身上，因为后续相关的操作要在这个文件中进行，ready？go！

###导入 Workbox

首先在 `sw.js` 第一行导入 `workbox.js` 语法如下

```js
importScripts(
  'https://storage.googleapis.com/workbox-cdn/releases/4.3.1/workbox-sw.js',
);
```

这样就导入成功了吗？写段代码测试一下吧！

```js
if (workbox) {
  console.log(`Yay! Workbox is loaded 🎉`);
} else {
  console.log(`Boo! Workbox didn't load 😬`);
}
```

更改完成后，回到浏览器，此时刷新浏览器没有任何变化，这里需要提醒一点，更改完 `service worker` 注册文件需要终止重启或者更新。

![https://user-gold-cdn.xitu.io/2019/12/27/16f476da413eb796?imageView2/0/w/1280/h/960/format/webp/ignore-error/1](https://user-gold-cdn.xitu.io/2019/12/27/16f476da413eb796?imageView2/0/w/1280/h/960/format/webp/ignore-error/1)

### 开始使用 Workbox

`Workbox` 定义了标准统一 API，我们来看如何借助它提供的 API 逐步优化项目

### 路由请求定义缓存

在 `Workbox` 中，最核心的概念要数基于路由的策略缓存了，这里抓住两个关键词，**基于路由**、**策略** 。接下来的重点便是放在如何基于路由，如何体现策略。

前端的大多资源都是通过 `HTTP` 请求得来的，包括 `js` 、 `css` 、 图片等等，既然这些内容都需要请求，那我能不能在请求发出后，做一些处理呢？就像房东租房，房东与租客之间的信息可能是不对称的，这时中介出现了，它能够在房东出租房子之前做一些处理，比如加收中介费。网页在发起资源请求时，我们也可以做一些决定，是从缓存拿，还是去请求。而针对不同的资源，正是通过资源请求地址来实现的，这便是**基于路由**，示例如下

```js
workbox.routing.registerRoute(
    /\.js$/, …
);
```

以上代码我们定义了一个路由缓存策略，即：所有后缀为 `.js` 的请求都会进入该策略进行处理，那，我们需要做什么处理呢？就会有针对匹配该路由的资源定义不同的关于缓存的策略，比如，我们要求指定资源 **网络请求优先**

```js
workbox.routing.registerRoute(/\.js$/, new workbox.strategies.NetworkFirst());
```

此时如果在项目中引入了 js 文件，这个缓存便会生效，假设项目引入 `hello.js`

```js
console.log('hello js file');
```

在 html 中引入

```js
<script src="./hello.js"> </script>
```

来到浏览器首先 update 一下 service worker，方法上面介绍过这里不赘述。紧接着刷新，我们可以看到打印的日志，说明配置成功

![https://user-gold-cdn.xitu.io/2019/12/27/16f476dd5ec7185c?imageView2/0/w/1280/h/960/format/webp/ignore-error/1](https://user-gold-cdn.xitu.io/2019/12/27/16f476dd5ec7185c?imageView2/0/w/1280/h/960/format/webp/ignore-error/1)

万事开头难，我们已经克服这第一道难题了，接下来先横向拓展，针对不同类型文件的配置，选用不同策略。我们先来看处理不同文件的配置，很简单

### 字符串方式

```js
workbox.routing.registerRoute(
  '/logo.png',
  handler, // handler 是做缓存策略的回调函数，通常指后面所会降到的 '缓存策略函数'
);
workbox.routing.registerRoute('https://some-host/some-path/logo.png', handler);
```

### 正则表达式

```js
workbox.routing.registerRoute(
  // 缓存图片.
  /\.(?:png|jpg|jpeg|svg|gif)$/,
  handler,
);
```

### 函数形式

```js
// 通过函数来匹配请求路由
const matchFunction = ({ url, event }) => {
  // 如果请求路由匹配了就返回 true，也可以返回一个参数对象以供 handler 接收处理
  return false;
};

workbox.routing.registerRoute(matchFunction, handler);
```

上面代码的 handler 是 workbox 提供的缓存策略 API，常用的有以下几种

| 策略名               | API                                                                                                                                                                                      |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| staleWhileRevalidate | 当请求的路由有对应的 Cache 缓存结果就直接返回，在返回 Cache 缓存结果的同时会在后台发起网络请求拿到请求结果并更新 Cache 缓存，如果本来就没有 Cache 缓存的话，直接就发起网络请求并返回结果 |
| networkFirst         | 网络优先的策略                                                                                                                                                                           |
| cacheFirst           | 直接从 Cache 缓存中取得结果，如果 Cache 缓存中没有结果，那就会发起网络请求，拿到网络请求结果并将结果更新至 Cache 缓存，并将结果返回给客户端                                              |
| networkOnly          | 强制使用正常的网络请求                                                                                                                                                                   |
| cacheOnly            | 直接使用 Cache 缓存的结果                                                                                                                                                                |

一般场景下，以上 5 种策略基本能满足要求，如果还有不满足的情况，可自定义策略

```js
workbox.routing.registerRoute(
  ({ url, event }) => {
    return {
      name: 'workbox',
    };
  },
  ({ url, event, params }) => {
    // 返回的结果是：A guide on workbox
    return new Response(`I am ${params.name}`);
  },
);
```

以下给出一个示例，介绍不同策略的使用方法

例如，图片类资源，因为不太常更改，所以可以选用优先缓存策略，并为该类资源分组，具体内容可以在 `Application` -> `Cache` 查看

```js
workbox.routing.registerRoute(
  /\.(?:png|jpg|jpeg|svg|gif)$/,
  new workbox.strategies.CacheFirst({
    cacheName: 'my-image-cache',
  }),
);
```

js 等相关文件可以适当选择网络优先

```js
workbox.routing.registerRoute(/\.html$/, new workbox.strategies.NetworkFirst());

workbox.routing.registerRoute(
  /\.js$/,
  new workbox.strategies.NetworkFirst({
    networkTimeoutSeconds: 3,
  }),
);
```

## webpack 中使用 workbox

首先安装 `workbox-webpack-plugin` ，选择使用 npm 安装

```js
npm install--save - dev workbox - webpack - plugin
```

在 webpack 配置文件中配置该插件

```js
const workboxPlugin = require('workbox-webpack-plugin');

// ...
webpack({
  plugins: [
    // ...
    new workboxPlugin({
      swSrc: './src/sw.js',
      swDest: './dist/sw.js',
      globDirectory: './dist/',
      globPatterns: ['**/*.{html,js,css}'],
    }),
  ],
  // ...
});
```

使用 workbox 提供的 Webpack 插件必须在 `app/sw.js` 中包含以下代码才能完成预缓存内容列表注入工作

```js
workbox.precaching.precacheAndRoute(self.__precacheManifest || []);
```

到这里，能想象通过我们对于项目中资源的配置，支持离线访问吗？通过这些配置能够极大提升应用性能，策略，你要的才是最美的。
