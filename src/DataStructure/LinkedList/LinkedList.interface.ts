export interface LinkedNodeInterface<E> {
  element: E | null;
  next: any;
}

export default interface LinkedListInterface<E> {
  find(e: E): LinkedNodeInterface<E>;
  add(index: number, e: E): void;
  addFirst(newElement: E): void;
  addLast(newElement: E): void;
  get(index: number): E | null;
  getFirst(): E | null;
  getLast(): E | null;
  set(index: number, e: E): void;
  contains(e: E): boolean;
  display(): string;
  getSize(): number;
  remove(index: number): void;
}
