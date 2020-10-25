export default interface ListQueueInterface<E> {
  dequeue(): E | undefined;
  enqueue(e: E): void;
  getSize(): number;
  peekHead(): E;
  peekTail(): E;
  isEmpty(): boolean;
}
