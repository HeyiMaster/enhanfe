import List from '../../src/DataStructure/List/List';
import ListInterface from '../../src/DataStructure/List/List.interface';

describe('List', () => {
  let list: ListInterface<number>;

  beforeEach(() => {
    list = new List();
  });

  it('list insert before', () => {
    list.insertBefore(1);
    expect(list.getSize()).toBe(1);
  });

  it('list insert last', () => {
    list.insertBefore(1);
    list.insertLast(2);
    expect(list.toString()).toBe('1,2');
  });

  it('list insert into given index', () => {
    list.insertBefore(1);
    list.insert(1, 3);
    expect(list.toString()).toBe('1,3');
  });

  it('update element', () => {
    list.insertLast(1);
    list.insertLast(2);
    list.update(1, 30);
    expect(list.toString()).toBe('1,30');
  });

  it('remove the given index element', () => {
    list.insertLast(1);
    list.remove(1);
    expect(list.getSize()).toBe(0);
  });

  it('remove first element', () => {
    list.insertLast(1);
    list.insertLast(2);
    list.removeFirst();
    expect(list.getSize()).toBe(1);
    expect(list.toString()).toBe('2');
  });

  it('remove last element', () => {
    list.insertLast(1);
    list.insertLast(2);
    list.removeLast();
    expect(list.getSize()).toBe(1);
    expect(list.toString()).toBe('1');
  });
});
