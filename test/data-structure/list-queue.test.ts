import ListQueue from '../../src/DataStructure/ListQueue/ListQueue';
import ListQueueInterface from '../../src/DataStructure/ListQueue/ListQueue.interface';

describe('ListQueue', () => {
  let lq: ListQueueInterface<number>;
  beforeEach(() => {
    lq = new ListQueue();
  });
  it('enqueue', () => {
    lq.enqueue(1);
    expect(lq.getSize()).toBe(1);
  });

  it('dequeue', () => {
    lq.dequeue();
    expect(lq.getSize()).toBe(0);
    lq.enqueue(1);
    expect(lq.getSize()).toBe(1);
    lq.dequeue();
    expect(lq.getSize()).toBe(0);
  });

  it('check that the queue is empty', () => {
    lq.enqueue(1);
    expect(lq.isEmpty()).toBeFalsy();
    lq.dequeue();
    expect(lq.isEmpty()).toBeTruthy();
  });

  it('peek queue element', () => {
    lq.enqueue(1);
    lq.enqueue(2);
    expect(lq.getSize()).toBe(2);
    expect(lq.peekHead()).toBe(1);
    expect(lq.peekTail()).toBe(2);
  });
});
