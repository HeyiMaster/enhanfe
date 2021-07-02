---
nav:
  title: 💊 基础
title: 跨域资源请求
order: 2
---

CORS 是一个 W3C 标准，全称“跨域资源共享”（Cross-origin resource sharing）。

它允许浏览器向跨源服务器，发出 XMLHttpRequest 请求，从而克服了 AJAX 只能同源使用的限制。

## 介绍

CORS 需要浏览器和服务器同时支持，目前除 IE10 以下主流浏览器均支持该功能。

浏览器一旦发现 AJAX 请求跨源，就会自动添加一些附加的头信息，甚至有时还会多出一次附加的请求进行检查。

## 与 JSONP 的比较

1. CORS 支持所有类型的 HTTP 请求，JSONP 只支持 GET。
2. JSONP 支持老版本浏览器。

## 简单与非简单请求

浏览器把 cors 请求分成了两类：简单请求、非简单请求，对于这两种请求，处理方式有所区别。

满足以下条件的称为简单请求，否则被定义为非简单请求。

- 请求方法 + HEAD + GET + POST
- 请求头 + Accept + Accept-Language + Last-Event-ID + Content-Language + Content-Type + text/plain + application/x-www-form-urlencoded + multipart/form-data

## 对于简单请求的处理

### 简单请求基本处理流程

对于简单请求，浏览器会直接发送 cors 请求，但须在请求头中设置一个 Origin 字段

```
Origin: https://coding.xxx.com
```

该 origin 字段用于，服务端接收信息后判断请求来源，并决定是否允许该次访问。

1. 如果该 origin 不在后端配置的范围内，浏览器就无法接收到“Access-Control-Allow-Origin”响应头字段，这是浏览器就知道出错了，于是抛出错误。需要注意的是：**这个错误无法使用状态码进行判断，因为可能是 200**
2. 如果该 origin 在后端配置的范围内，浏览器会接收到如下服务器添加的响应头字段：

```
Access-Control-Allow-Origin: http://coding.xxx.com
Access-Control-Allow-Credentials: true
Access-Control-Expose-Headers: FooBar
```

这里先介绍一下这三个头含义： - Access-Control-Allow-Origin

该字段是必须的。它的值要么是请求时 Origin 字段的值，要么是一个\*，表示接受任意域名的请求。 - Access-Control-Allow-Credentials

该字段可选。它的值是一个布尔值，表示是否允许发送 Cookie。 - Access-Control-Expose-Headers

cors 请求时，XMLHttpRequest 对象的 getResponseHeader()方法只能拿到 6 个基本字段：`Cache-Control`、`Content-Language`、`Content-Type`、`Expires`、`Last-Modified`、`Pragma`，此时如果我们想获取到其他字段，则必须添加`Access-Control-Expose-Headers`字段

### 允许 cookie 跨域

withCredentials 属性允许浏览器发送请求时，携带 cookie，但这只是单方面，要支持 cookie，浏览器也必须设定`Access-Control-Allow-Credentials: true`。

## 非简单请求

非简单请求的定义我们在上面我们已经给出，最常见的非简单请求是：请求时方法为：`PUT`、`DELETE`，或者请求内容中`Content-Type`为`application/json`。

### 发出预请求

非简单请求会在通信前，增加一个请求查询，称之为“预检查”请求（preflight）

假设我们现在做如下请求，使用 PUT 请求方法，并设置了自定义请求头 X-Token。

```
const url = 'http://coding.xxx.com/api';const xhr = new XMLHttpRequest();xhr.open('DELETE', url, true);xhr.setRequestHeader('X-Token', 'qwesfsfawd');xhr.send();
```

此时浏览器发现，这是一个非简单请求，就自动发出一个“预检”请求，收到回复如下（这两个字段是在服务器配置的响应头字段）

```
Access-Control-Request-Method: DELETE
Access-Control-Request-Headers: X-Token
```

这里介绍一下这两个头信息的含义 - Access-Control-Request-Method

可被允许的 cors 请求方法 - Access-Control-Request-Headers

可被允许的 cors 请求头

### 对预请求的响应

当服务器收到“预检查”请求以后，通过检查`Origin`、`Access-Control-Allow-Method`和`Access-Control-Allow-Headers`字段，来确认是否允许跨源。

服务器端通过设置这些响应头，来控制预检查成功与否。

1. Access-Control-Allow-Methods：被允许请求方法，多个可用“,”逗号隔开；
2. Access-Control-Allow-Headers：被允许请求头字段，多个可用“,”逗号隔开；
3. Access-Control-Allow-Credentials：是否允许 cookie 的跨域；
4. Access-Control-Max-Age：指定本次预检请求的有效期，有效期内不需发送“预检查”请求。
