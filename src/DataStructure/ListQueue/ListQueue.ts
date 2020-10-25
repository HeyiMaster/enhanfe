import ListQueueInterface from './ListQueue.interface';
import List from '../List/List';

export default class ListQueue<E> implements ListQueueInterface<E> {
  private el: List<E> = new List();
  dequeue() {
    return this.el.removeFirst();
  }
  enqueue(e: E) {
    this.el.insertLast(e);
  }
  getSize(): number {
    return this.el.getSize();
  }
  peekHead(): E {
    return this.el.get(0);
  }
  peekTail(): E {
    return this.el.get(this.getSize() - 1);
  }
  isEmpty(): boolean {
    return this.el.getSize() === 0;
  }
}
