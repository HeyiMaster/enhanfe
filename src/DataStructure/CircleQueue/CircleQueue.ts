import CircleQueueInterface from './CircleQueue.interface';

export default class CircleQueue<E> implements CircleQueueInterface<E> {
  front: number;
  tail: number;
  data: (E | null)[];
  size: number;

  constructor(capacity: number = 10) {
    this.data = new Array(capacity);
    this.front = 0;
    this.tail = 0;
    this.size = 0;
  }

  enqueue(e: E) {
    // dilatation
    if ((this.tail + 1) % this.data.length === this.front) {
      this.resize(this.getCapacity() * 2);
    }
    this.data[this.tail] = e;
    this.tail = (this.tail + 1) % this.data.length;
    this.size++;
  }

  dequeue() {
    if (this.isEmpty()) {
      throw new Error('error');
    }
    const ret = this.data[this.front];
    this.data[this.front] = null;
    this.front = (this.front + 1) % this.data.length;
    this.size--;
    // Shrinkage capacity
    const capacity = this.getCapacity();
    if (Math.floor(capacity / 4) === this.size && capacity > 10) {
      this.resize(Math.floor(capacity / 2));
    }
    return ret;
  }

  private resize(capacity: number) {
    const newData = new Array(capacity + 1);
    for (let i = 0; i < this.size; i++) {
      newData[i] = this.data[(i + this.front) % this.data.length];
    }
    this.data = newData;
    this.front = 0;
    this.tail = this.size;
  }

  getSize(): number {
    return this.size;
  }

  private getCapacity(): number {
    return this.data.length - 1;
  }

  isEmpty(): boolean {
    return this.front === this.tail;
  }
}
