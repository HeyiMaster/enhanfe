import LinkedListInterface, {
  LinkedNodeInterface,
} from './LinkedList.interface';

class LinkedNode<E> implements LinkedNodeInterface<E> {
  element: E | null;
  next: any;
  constructor(element: E | null, next?: LinkedNode<E>) {
    this.element = element;
    this.next = next;
  }
}

export default class LinkedList<E> implements LinkedListInterface<E> {
  private dummyHead: LinkedNodeInterface<E> = new LinkedNode<E>(null);
  private size: number = 0;

  find(e: E): LinkedNodeInterface<E> {
    let currentNode = this.dummyHead;
    while (currentNode && currentNode.element !== e) {
      currentNode = currentNode.next;
    }
    return currentNode || null;
  }

  add(index: number, newElement: E) {
    if (index < 0 || index > this.size) {
      throw new Error('Add failed, Illeagl index.');
    }
    let prev: LinkedNode<E> = this.dummyHead;
    for (let i = 0; i < index; i++) {
      prev = prev.next;
    }
    prev.next = new LinkedNode<E>(newElement, prev.next);
    this.size++;
  }

  addFirst(newElement: E) {
    this.add(0, newElement);
  }

  addLast(newElement: E) {
    this.add(this.size, newElement);
  }

  get(index: number) {
    let current: LinkedNode<E> = this.dummyHead.next;
    if (index < 0 || index > this.size || !current) {
      throw new Error('Get failed, Illegal index.');
    }
    for (let i = 0; i < index; i++) current = current.next;
    return current.element;
  }

  getFirst() {
    return this.get(0);
  }

  getLast() {
    return this.get(this.size - 1);
  }

  set(index: number, e: E): void {
    let current: LinkedNode<E> = this.dummyHead.next;
    if (index < 0 || index > this.size || !current) {
      throw new Error('Set failed, Illegal index.');
    }
    for (let i = 0; i < index; i++) {
      current = current.next;
    }
    current.element = e;
  }

  contains(e: E): boolean {
    let current: LinkedNode<E> = this.dummyHead.next;
    while (current) {
      if (current.element === e) return true;
      current = current.next;
    }
    return false;
  }

  display(): string {
    let currentNode = this.dummyHead.next;
    let res = '';
    while (currentNode) {
      res += `${currentNode.element} -> `;
      currentNode = currentNode.next;
    }
    return (res += 'null');
  }

  getSize(): number {
    return this.size;
  }

  remove(index: number) {
    if (index > this.size) {
      throw new Error('Remove failed, Illegal index.');
    }
    let current = this.dummyHead.next;
    if (index === 0) {
      this.dummyHead.next = current?.next || null;
      this.size = this.size === 0 ? 0 : this.size - 1;
      return;
    }
    for (let i = 0; i < index; i++) {
      if (i !== index - 1) {
        current = current.next;
        continue;
      }
      this.size--;
      current.next = current.next && current.next.next;
    }
  }
}
