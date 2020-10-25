import CircleQueue from '../../src/DataStructure/CircleQueue/CircleQueue';
import CircleQueueInterface from '../../src/DataStructure/CircleQueue/CircleQueue.interface';

describe('CircleQueue', () => {
  let circleQueue: CircleQueueInterface<number>;
  beforeEach(() => {
    circleQueue = new CircleQueue();
  });

  it('enqueue', () => {
    circleQueue.enqueue(1);
    expect(circleQueue.getSize()).toBe(1);
  });

  it('dequeue', () => {
    circleQueue.enqueue(1);
    circleQueue.dequeue();
    expect(circleQueue.getSize()).toBe(0);
  });

  it('When there are no elements in the queue, the outgoing queue will report an error', () => {
    expect(() => circleQueue.dequeue()).toThrow();
  });

  it('test increase capacity', () => {
    circleQueue.enqueue(1);
    const capacity = 9;
    for (let i = 0; i < capacity; i++) {
      circleQueue.enqueue(i);
    }
  });

  it('test decrease capacity', () => {
    const size = 10;
    for (let i = 0; i < size; i++) {
      circleQueue.enqueue(i);
    }
    for (let i = 0; i < size; i++) {
      circleQueue.dequeue();
    }
  });
});
