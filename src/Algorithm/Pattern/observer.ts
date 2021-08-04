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
