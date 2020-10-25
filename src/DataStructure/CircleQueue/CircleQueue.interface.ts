export default interface CircleQueueInterface<E> {
  enqueue(e: E): void;
  dequeue(): E | null;
  getSize(): number;
}
