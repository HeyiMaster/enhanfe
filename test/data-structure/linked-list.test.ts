import LinkedList from '../../src/DataStructure/LinkedList/LinkedList';
import LinkedListInterface from '../../src/DataStructure/LinkedList/LinkedList.interface';

describe('LinkedList', () => {
  let ll: LinkedListInterface<number>;
  beforeEach(() => {
    ll = new LinkedList();
  });
  it('add first', () => {
    ll.addFirst(1);
    expect(ll.getFirst()).toBe(1);
    expect(ll.getSize()).toBe(1);
  });
  it('add last', () => {
    ll.addFirst(11);
    ll.addLast(22);
    expect(ll.get(0)).toBe(11);
    expect(ll.get(1)).toBe(22);
    expect(ll.getSize()).toBe(2);
  });
  it('add into given index', () => {
    ll.addFirst(1);
    ll.add(0, 11);
    expect(ll.getFirst()).toBe(11);
    expect(ll.getSize()).toBe(2);
  });
  it('set element', () => {
    ll.addLast(1);
    ll.addLast(2);
    expect(ll.getLast()).toBe(2);
    expect(ll.getSize()).toBe(2);
    ll.set(1, 11);
    expect(ll.getLast()).toBe(11);
    expect(ll.getSize()).toBe(2);
  });

  it('display all element', () => {
    ll.addLast(1);
    ll.addLast(2);
    expect(ll.display()).toMatch(/^(\d\s->\s){2}null$/g);
  });
  it('contains the given element', () => {
    ll.addFirst(10);
    expect(ll.contains(10)).toBeTruthy();
    expect(ll.contains(100)).toBeFalsy();
  });

  it('find given emement', () => {
    ll.addLast(1);
    ll.addLast(2);
    expect(ll.find(2).element).toBe(2);
    expect(ll.find(3)).toBe(null);
  });

  it('insert value index cannot be less than 0 or greater than current size', () => {
    expect(() => ll.add(-1, -1)).toThrow('Add failed, Illeagl index.');
    expect(() => ll.add(1, 1)).toThrow('Add failed, Illeagl index.');
  });

  it('get or set value index cannot be less than 0 or greater than current size', () => {
    expect(() => ll.set(0, 1)).toThrow('Set failed, Illegal index.');
    expect(() => ll.get(1)).toThrow('Get failed, Illegal index.');
  });

  it('remove element when the list is empty', () => {
    ll.remove(0);
    expect(ll.getSize()).toBe(0);
    expect(() => ll.getFirst()).toThrow('Get failed, Illegal index.');
    expect(() => ll.getLast()).toThrow('Get failed, Illegal index.');
  });

  it('remove the given value from list', () => {
    expect(() => ll.remove(1)).toThrow('Remove failed, Illegal index.');
    ll.addLast(1);
    ll.addLast(2);
    expect(ll.getSize()).toBe(2);
    ll.remove(0);
    expect(ll.getSize()).toBe(1);
    expect(ll.getFirst()).toBe(2);
    ll.addLast(3);
    ll.addLast(4);
    expect(ll.getSize()).toBe(3);
    ll.remove(2);
    expect(ll.getSize()).toBe(2);
    expect(ll.getFirst()).toBe(2);
    expect(ll.getLast()).toBe(3);
  });
});
