import BinaryTree from '../../src/DataStructure/BinaryTree/BinaryTree';
import BinaryTreeInterface from '../../src/DataStructure/BinaryTree/BinaryTree.interface';

describe('BinaryTree', () => {
  let bt: BinaryTreeInterface;
  beforeEach(() => {
    bt = new BinaryTree();
  });
  it('insert into binary tree', () => {
    bt.insert(1, { name: 'heyi' });
    expect(bt).toEqual({
      root: {
        data: { name: 'heyi' },
        leftChild: null,
        rightChild: null,
        value: 1,
      },
    });
  });

  it('find given value from binary tree', () => {
    bt.insert(2, { name: 'heyi', num: 2 });
    bt.insert(3, { name: 'jack', num: 3 });
    bt.insert(1, { name: 'rose', num: 1 });
    // find left child
    expect(bt.find(1)).toEqual({
      data: { name: 'rose', num: 1 },
      leftChild: null,
      rightChild: null,
      value: 1,
    });
    // find right child
    expect(bt.find(3)).toEqual({
      data: {
        name: 'jack',
        num: 3,
      },
      leftChild: null,
      rightChild: null,
      value: 3,
    });
    // find elements that do not exist
    expect(bt.find(4)).toEqual(null);
  });
  describe('traverse binary tree', () => {
    beforeEach(() => {
      bt.insert(5);
      bt.insert(2);
      bt.insert(1);
      bt.insert(9);
      bt.insert(3);
      bt.insert(6);
      bt.insert(10);
    });
    it('preOrder traverse', () => {
      const arr = [];
      bt.preOrder(bt.find(5), node => {
        arr.push(node.value);
      });
      expect(arr).toEqual([5, 2, 1, 3, 9, 6, 10]);
    });

    it('inOrder traverse', () => {
      const arr = [];
      bt.inOrder(bt.find(5), node => {
        arr.push(node.value);
      });
      expect(arr).toEqual([1, 2, 3, 5, 6, 9, 10]);
    });
    it('postOrder traverse', () => {
      const arr = [];
      bt.postOrder(bt.find(5), node => {
        arr.push(node.value);
      });
      expect(arr).toEqual([1, 3, 2, 6, 10, 9, 5]);
    });
  });

  it('remove nonexistent element', () => {
    bt.insert(5);
    bt.insert(2);
    bt.insert(1);
    bt.insert(9);
    bt.insert(3);
    bt.insert(6);
    bt.insert(10);
    bt.remove(1000);
    expect(bt.find(6)).not.toBeNull();
    expect(bt.find(1000)).toBeNull();
  });

  it('remove exist element', () => {
    bt.insert(5);
    bt.insert(2);
    bt.insert(1);
    bt.insert(9);
    bt.insert(3);
    bt.insert(6);
    bt.insert(10);
    expect(bt.remove(6)).toBeTruthy();
    expect(bt.find(6)).toBeNull();
    expect(bt.remove(10)).toBeTruthy();
    expect(bt.find(10)).toBeNull();
  });
});
