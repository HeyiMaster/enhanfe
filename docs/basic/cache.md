---
nav:
  title: 💊 基础
title: 缓存在性能优化方面的应用
order: 1
---

我们可以将缓存划分为**资源缓存**与**数据缓存**两大类。

**资源缓存**：用于将静态资源按照我们所期望的规则存储在本地，用户访问网页时如果相关资源未发生改变，则可以直接从本地拿取资源渲染网页。所以资源缓存的策略其实就是用于确定资源是否已经发生了更新。

**数据缓存**：用于将常使用数据存储在本地，例如用户登录态信息、不常变动且不涉及数据安全问题的数据等。数据缓存的方案有很多，例如：cookie、localstorage、indexedDB 等。

## 资源缓存

资源缓存用于缓存静态资源，上面已经提到。良好的缓存策略可以减少资源重复加载进而提高网页的整体加载速度。

通常浏览器缓存策略分为两种：强缓存和协商缓存，当然还包括 service worker。

- 浏览器在资源加载时，根据请求头中的 `expires` 和 `cache-control` 值来判断是否命中强缓存，命中则直接从本地缓存中读取资源，这一过程不需请求服务器；
- 如果未命中强缓存，浏览器则会发送请求到服务器，服务器通过 `last-modified` 和 `etag` 值来验证资源是否命中协商缓存，若命中，则服务器会将这个请求返回，但是不会返回这个资源的数据，浏览器接收到该请求响应后依然从本地缓存中读取资源；
- 若**强缓存**和**策略缓存**都未命中，那么浏览器将请求服务器获得资源并加载。

**强缓存**和**策略缓存**如果命中，都是直接从客户端缓存加载对应资源。但不同点是：**强缓存**自比较开始至缓存命中不会请求服务端，而**策略缓存**的是否使用本地缓存这一决定是需要服务端参与的，换言之策略缓存需要请求服务端来完成的。

### 强缓存

强缓存通过 `Expires` 和 `Cache-Control` 响应头实现。两者详细说明如下：

#### Expire

中文释义为：到期，表示缓存的过期时间。**expire** 是 HTTP 1.0 提出的，它描述的是一个绝对时间，该时间由服务端返回。因为 **expire** 值是一个固定时间，因此会受本地时间的影响，如果在缓存期间我们修改了本地时间，可能会导致缓存失效。

通常表示如下：

```
Expires: Wed, 11 May 2018 07:20:00 GMT
```

#### Cache-Control

中文释义为：缓存控制。**cache-control** 是 HTTP 1.1 提出的，它描述的是一个相对时间，该相对时间由服务端返回。

表示如下：

```
Cache-Control: max-age=315360000
```

该属性还包括访问性及缓存方式设置，列举如下：

- **no-cache** 存储在本地缓存取中，只是在与服务器进行新鲜度再验证之前，缓存无法使用。
- **no-store** 不缓存资源到本地
- **public** 可被所有用户缓存，多用户进行共享，包括终端或 CDN 等中间代理服务器
- **private** 仅能被浏览器客户端缓存，属于私有缓存，不允许中间代理服务器缓存相关资源

缓存与使用缓存流程说明如下：

![](https://user-images.githubusercontent.com/25027560/38223493-c7ec919e-371d-11e8-8d72-8c6b0e4935a8.png)

### 协商缓存

浏览器加载资源时，若强缓存未命中，将发送资源请求至服务器。若协商缓存命中，请求响应返回 304 状态码。

协商缓存主要使用到两对请求响应头字段，分别是：

- Last-Modified 和 If-Modified-Since
- Etag 和 If-None-Match

#### Last-Modified 与 If-Modified-Since

**Last-Modified** 由上一次请求的响应头返回，且该值会在本次请求中，通过请求头 **If-Modified-Since** 传递给服务端，服务端通过 If-Modified-Since 与资源的修改时间进行对比，若在此日期后资源有更新，则将新的资源发送给客户端。

不过，通过文件的修改时间来判断资源是否更新是不明智的，因为很多时候文件更新时间变了，但文件内容未发生更改。

这样一来，就出现了 **ETag** 与 **If-None-Match**。

#### ETag 与 If-None-Match

不同于 **Last-Modified**，Etag 通过计算文件指纹，与请求传递过来的 **If-None-Match** 进行对比，若值不等，则将新的资源发送给客户端。

值得一提的是，通常为了减轻服务器压力，并不会完整计算文件 hash 值作为 Etag，并且有些时候 Etag 的表现会退化为 Last-Modified （当指纹计算为文件更新时间时）。那为什么我们通常还是要选用 Etag 呢？原因有一下几点：

- 文件也许会发生周期性的更改，但内容并无变化，这时我们希望客户端认为这个文件是未变的；
- 文件修改频繁，比如在秒以内的时间进行修改，由于 If-Modified-Since 能读取到的时间精度为 s，因此这种场景下 If-Modified-Since 无法正常使用；
- 某些服务器不能精确获得文件的最后修改时间。

![](https://user-images.githubusercontent.com/25027560/38223505-d8ab53da-371d-11e8-9263-79814b6971a5.png)

> 💡 ETag 的优先级比 Last-Modified 更高！

#### 状态码

- 200：强缓存 Expires / Cache-Control 失效时，返回新资源文件
- 200（from disk cache）Expires / Cache-Control 两者都存在且有效，Cache-Control 优先 Expires 时，浏览器从本地获取资源成功。
- 200（from memory cache）
- 304（Not Modified）协商缓存 Last-modified / Etag 有效，则服务端返回该状态码。

### 如何缓存

缓存启用的顺序可列举如下：

1. Cache-Control —— 请求服务器之前
2. Expires —— 请求服务器之前
3. If-None-Match (Etag) —— 请求服务器
4. If-Modified-Since (Last-Modified) —— 请求服务器

需要注意的是协商缓存需要配合强缓存使用，如果不启用强缓存那么协商缓存就失去了意义。大部分 web 服务器都默认开启了协商缓存，而且是同时启用（Last-Modified、If-Modified-Since）和（ETag、If-None-Match）。但当我们的系统选用分布式部署时，则需要注意以下问题：

- 分布式系统里多台机器间文件的 Last-Modified 必须保持完全一致，否则在请求负载均衡到不同机器时，会导致比对失败的情况；
- 分布式系统尽量关闭掉 ETag，因为每台机器生成的 ETag 都不同。

### service worker

为了更灵活配置缓存策略，引入了 service worker 技术，关于该技术的应用可见文章 [workbox 应用](./workbox)

### 缓存技术方案实践

#### 静态资源优化方案与思考

- 配置超长时间的本地缓存 —— 节省带宽，提高性能
- 采用内容摘要作为缓存更新依据 —— 精确的缓存控制
- 静态资源 CDN 部署 —— 优化网络请求
- 更资源发布路径实现非覆盖式发布 —— 平滑升级

#### 充分利用浏览器缓存机制

- 对于某些不需要缓存的资源，可以使用 Cache-control: no-store ，表示该资源不需要缓存
- 对于频繁变动的资源（比如经常需要刷新的首页，资讯论坛新闻类），可以使用 Cache-Control: no-cache 并配合 ETag 使用，表示该资源已被缓存，但是每次都会发送请求询问资源是否更新。
- 对于代码文件来说，通常使用 Cache-Control: max-age=31536000 并配合策略缓存使用，然后对文件进行指纹处理，一旦文件名变动就会立刻下载新的文件。
- 静态资源文件通过 Service Worker 进行缓存控制和离线化加载

## 数据缓存

### 数据缓存技术

- **cookie 4K**，可手动设置失效实践
- **localStorage 5M**，需要手动清除，否则一直存在
- **sessionStorage 5M**，仅限同标签访问，页面关闭就会清理
- **indexedDB 无限容量**，浏览器端数据库，需手动清除，否则一直存在

### cookie

cookie 实际是一小段文本信息。客户端请求服务端，如果服务器需要记录该用户的登录状态，就需要使用在响应时向客户端返回一个 cookie。客户端浏览器会将 cookie 保存。客户端再次请求该网站时，会携带 cookie 一同提交到服务端。此时服务端检查该 cookie 来确定用户登录状态。服务器还可以根据需要修改 cookie 内容。

cookie 包含以下属性：

- Expires ：cookie 过期时间，绝对时间；
- Max-Age：cookie 失效时间，相对时间；
- Domain：指定 cookie 可以送达的主机名。
- Path：指定一个 URL 路径，这个路径必须出现在要请求的资源的路径中才可以发送 Cookie 首部
- Secure：一个带有安全属性的 cookie 只有在请求使用 SSL 和 HTTPS 协议的时候才会被发送到服务器。
- HttpOnly: 设置了 HttpOnly 属性的 cookie 不能使用 JavaScript 经由 Document.cookie 属性、XMLHttpRequest 和 Request APIs 进行访问，以防范跨站脚本攻击（XSS）。

### localStorage、sessionStorage

容量通常不超过 5M，存储内容格式为字符串，可以格式化为字符串的资源均可存储在其中。localstorage 中数据在同域下可共享，而 sessionstorage 只在会话生命周期中有效。

#### 基础 API

```js
// 保存数据
localStorage.setItem('key', 'value');
sessionStorage.setItem('key', 'value');
// 读取数据
localStorage.getItem('key');
sessionStorage.getItem('key');
// 删除单个数据
localStorage.removeItem('key');
sessionStorage.removeItem('key');
// 删除全部数据
localStorage.clear();
sessionStorage.clear();
// 获取索引的key
localStorage.key('index');
sessionStorage.key('index');
```

#### 事件监听

```js
window.addEventListener('storage', function(e) {
  console.log(e.key, e.oldValue, e.newValue);
});
```

### indexedDB

可用于存储非结构化数据，该数据库属于非关系型数据库，便于查询存储。

一个示例演示 indexedDB 的使用方式，如下：

```js
const DB_NAME = 'Netease';
const DB_VERSION = 1;
const OB_NAMES = {
  UseKeyPath: 'UseKeyPath',
  UseKeyGenerator: 'UseKeyGenerator',
};

function openIndexDB() {
  // The call to the open() function returns an IDBOpenDBRequest object with a result (success) or error value that you handle as an event.
  return new Promise((resolve, reject) => {
    /**
     * NOTE:
     * 1. 第一次打开可能会提示用户获取 indexDB 的权限
     * 2. 浏览器隐身模式不会存在本地，只会存储在内存中
     */
    const request = window.indexedDB.open(DB_NAME, DB_VERSION);
    request.onerror = function(event) {
      // Do something with request.errorCode!
      console.log('open request failed', event);
      console.error(event.target.error);
    };
    request.onsuccess = function(event) {
      // Do something with request.result!
      // console.log('open request success', event)
      var db = event.target.result;
      db.onerror = function(e) {
        console.error('Database error: ', e.target.error);
        reject(e.target.error);
      };
      db.onclose = e => {
        console.error('Database close:', e.target.error);
        reject(e.target.error);
      };
      resolve(db);
    };
    request.onupgradeneeded = function(event) {
      /**
       * NOTE:
       * 1. 创建新的 objectStore
       * 2. 删除旧的不需要的 objectStore
       * 3. 如果需要更新已有 objectStore 的结构，需要先删除原有的 objectStore ，然后重新创建
       */
      // The IDBDatabase interface
      console.log('onupgradeneeded', event);
      var db = event.target.result; // Create an objectStore for this database
      obUseKeypath(db);
      obUseKeyGenerator(db);
      /**
       * NOTE:
       * transaction
       * 三个事件：
       * 1. error
       * 2. abort
       * 3. complete
       * 两个方法：
       * 1. abort
       * Rolls back all the changes to objects in the database associated with this transaction. If this transaction has been aborted or completed, then this method throws an error event.
       * 2. objectStore
       * Returns an IDBObjectStore object representing an object store that is part of the scope of this transaction.
       */
      db.transaction.oncomplete = function(e) {
        console.log('obj create success', e);
      };
    };
  });
}

function obUseKeypath(db) {
  const objectStore = db.createObjectStore(OB_NAMES.UseKeyPath, {
    keyPath: 'time',
  });
  objectStore.createIndex('errorCode', 'errorCode', {
    unique: false,
  });
  objectStore.createIndex('level', 'level', {
    unique: false,
  });
}

function obUseKeyGenerator(db) {
  const objectStore = db.createObjectStore(OB_NAMES.UseKeyGenerator, {
    autoIncrement: true,
  });
  objectStore.createIndex('errorCode', 'errorCode', {
    unique: false,
  });
  objectStore.createIndex('time', 'time', {
    unique: true,
  });
  objectStore.createIndex('level', 'level', {
    unique: false,
  });
}

/**
 * 添加数据
 * @param {array} docs 要添加数据
 * @param {string} objName 仓库名称
 */
function addData(docs, objName) {
  if (!(docs && docs.length)) {
    throw new Error('docs must be a array!');
  }
  return openIndexDB().then(db => {
    const tx = db.transaction([objName], 'readwrite');
    tx.oncomplete = e => {
      console.log('tx:addData onsuccess', e);
      return Promise.resolve(docs);
    };
    tx.onerror = e => {
      e.stopPropagation();
      console.error('tx:addData onerror', e.target.error);
      return Promise.reject(e.target.error);
    };
    tx.onabort = e => {
      console.warn('tx:addData abort', e.target);
      return Promise.reject(e.target.error);
    };
    const obj = tx.objectStore(objName);
    docs.forEach(doc => {
      const req = obj.add(doc);
      req.onerror = e => {
        console.error('obj:addData onerror', e.target.error);
      };
    });
  });
}

const TestData = [
  {
    event: 'NE-TEST1',
    level: 'warning',
    errorCode: 200,
    url: 'http://www.example.com',
    time: '2017/11/8 下午4:53:039',
    isUploaded: false,
  },
];

addData(TestData, OB_NAMES.UseKeyGenerator).then(() =>
  addData(TestData, OB_NAMES.UseKeyPath),
);
```
