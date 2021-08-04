---
# nav:

#   title: 数据结构与算法
title: 设计模式
order: 4
---

## 单例模式

```ts
class User {
  /**
   * name property
   */
  private name: string;
  /**
   * instance
   */
  private static instance: User;
  /**
   * get Object instance
   * @returns User
   */
  static getInstance() {
    if (!this.instance) {
      return (this.instance = new User('walker'));
    }
    return this.instance;
  }
  constructor(name: string) {
    this.name = name;
  }
  say() {
    console.log(this.name);
  }
}

const u1 = User.getInstance();
const u2 = User.getInstance();

console.log(u1 === u2); // true
```

## 策略模式

```ts
type Level = 'A' | 'B' | 'S';

const strategies: Record<Level, Function> = {
  A: (val: number) => val * 2,
  B: (val: number) => val * 4 + 1,
  S: (val: number) => val * 8 + 3,
};

function calcBonus(level: Level, base: number) {
  return strategies[level] ? strategies[level](base) : base;
}

console.log(calcBonus('A', 100));
console.log(calcBonus('B', 100));
console.log(calcBonus('S', 100));
```

## 观察者模式

```ts
class DownloadTask {
  private id: number;
  private url?: string;

  constructor(id: number) {
    this.id = id;
  }

  finish(url: string) {
    this.url = url;
    console.log(`${this.id} is finished, url is ${this.url}`);
  }
}

class DownloadTaskList<T> {
  private tasks: T[] = [];

  size() {
    return this.tasks.length;
  }

  add(task: T) {
    this.tasks.push(task);
  }

  get(index: number): T {
    return this.tasks[index];
  }

  remove(task: T) {
    const index = this.tasks.indexOf(task);
    if (index !== -1) {
      this.tasks.splice(index, 1);
    }
  }
}

class DataHub {
  private downloadTasks = new DownloadTaskList<DownloadTask>();
  addTask(downloadTask: DownloadTask) {
    this.downloadTasks.add(downloadTask);
  }
  removeTask(downloadTask: DownloadTask) {
    this.downloadTasks.remove(downloadTask);
  }
  notify(url: string) {
    const size = this.downloadTasks.size();
    for (let i = 0; i < size; i++) {
      this.downloadTasks.get(i).finish(url);
    }
  }
}

const dataHub = new DataHub();
const task1 = new DownloadTask(1);
const task2 = new DownloadTask(2);

dataHub.addTask(task1);
dataHub.addTask(task2);

dataHub.notify('http://www.baidu.com');
```

## 发布-订阅模式

```ts
type EventType = Record<string, { taskId: string; handler: Function }[]>;

class DownloadManager {
  private events: EventType = {};
  private uId: number = -1;

  emit(eventType: string, url: string) {
    if (!this.events[eventType]) {
      return false;
    }
    const subscribers = this.events[eventType];
    for (let i = 0, len = subscribers?.length || 0; i < len; i++) {
      const subscriber = subscribers[i];
      subscriber.handler(eventType, subscriber.taskId, url);
    }
    return true;
  }

  on(eventType: string, handler: Function) {
    if (!this.events[eventType]) {
      this.events[eventType] = [];
    }
    const taskId = `${++this.uId}`;
    this.events[eventType].push({
      taskId,
      handler,
    });
    return taskId;
  }
}

const manager = new DownloadManager();
manager.on('dataReady', function(e: string, taskId: string, url: string) {
  console.log(e, taskId, url);
});
manager.on('dataReady', function(e: string, taskId: string, url: string) {
  console.log(e, taskId, url);
});
manager.on('dataEnd', function(e: string, taskId: string, url: string) {
  console.log(e, taskId, url);
});
manager.emit('dataReady', 'http://www.baidu.com');
manager.emit('dataEnd', 'http://www.taobao.com');
```
