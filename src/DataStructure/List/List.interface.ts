export default interface List<E> {
  insert(index: number, e: E): void;
  insertBefore(e: E): void;
  insertLast(e: E): void;
  remove(e: E): E;
  removeFirst(): E | undefined;
  removeLast(): E | undefined;
  getSize(): number;
  get(index: number): any;
  update(index: number, e: E): void;
  toString(): string;
}
