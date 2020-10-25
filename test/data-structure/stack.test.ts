import Stack from '../../src/DataStructure/Stack/Stack';
import StackInterface from '../../src/DataStructure/Stack/Stack.interface';

const stack = new Stack<number>();

describe('Stack', () => {
  let stack: StackInterface<number>;
  beforeEach(() => {
    stack = new Stack();
  });
  it('get stack size', () => {
    stack.push(1);
    expect(stack.getSize()).toBe(1);
  });
  it('stack peak', () => {
    stack.push(1);
    expect(stack.peek()).toBe(1);
    expect(stack.getSize()).toBe(1);
  });
  it('stack pop', () => {
    stack.push(1);
    expect(stack.getSize()).toBe(1);
    stack.pop();
    expect(stack.getSize()).toBe(0);
  });
});
