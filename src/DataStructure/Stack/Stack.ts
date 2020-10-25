import StackInterface from './Stack.interface';
import List from '../List/List';

export default class Stack<E> implements StackInterface<E> {
  private el: List<E> = new List<E>();

  push(e: E): void {
    this.el.insertLast(e);
  }

  pop() {
    return this.el.removeLast();
  }

  peek(): E {
    return this.el.get(this.getSize() - 1);
  }

  getSize(): number {
    return this.el.getSize();
  }
}
