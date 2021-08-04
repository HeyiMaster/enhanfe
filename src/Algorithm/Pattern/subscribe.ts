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
