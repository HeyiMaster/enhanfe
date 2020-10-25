export default interface StackInterface<E> {
  push(e: E): void;
  pop(): E | undefined;
  peek(): E;
  getSize(): number;
}
