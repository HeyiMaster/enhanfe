import BinaryTreeInterface, {
  NodeInterface,
  DataType,
} from './BinaryTree.interface';

class Node implements NodeInterface {
  public value;
  public data;
  leftChild?: NodeInterface | null = null;
  rightChild?: NodeInterface | null = null;
  constructor(value: number, data?: DataType) {
    this.value = value;
    this.data = data;
  }
}

export default class BinaryTree implements BinaryTreeInterface {
  private root: NodeInterface | null | undefined = null;
  insert(value: number, data: DataType) {
    //  创建插入节点
    let newNode = new Node(value, data);
    //	定义当前节点
    let currentNode = this.root;
    //	父节点
    let parentNode;
    if (this.root === null) {
      this.root = newNode;
      return;
    } else {
      //	循环节点查找
      while (currentNode) {
        //	首先将父节点指向当前节点
        parentNode = currentNode;
        //	如果当前指向的节点比插入的值要大，则向左走，否则向右走
        if (currentNode.value >= value) {
          currentNode = currentNode.leftChild;
          if (currentNode === null) {
            parentNode.leftChild = newNode;
          }
        } else {
          currentNode = currentNode.rightChild;
          if (currentNode === null) {
            parentNode.rightChild = newNode;
          }
        }
      }
    }
  }
  find(value: number) {
    let currentNode = this.root;
    if (!currentNode) return null;
    while (currentNode?.value !== value) {
      if (currentNode.value > value) {
        currentNode = currentNode.leftChild;
      } else {
        currentNode = currentNode.rightChild;
      }
      if (!currentNode) {
        return null;
      }
    }
    return currentNode;
  }
  preOrder(
    localNode: NodeInterface | null | undefined,
    cb: (node: NodeInterface) => void,
  ) {
    if (localNode) {
      if (cb) cb(localNode);
      this.preOrder(localNode.leftChild, cb);
      this.preOrder(localNode.rightChild, cb);
    }
  }
  inOrder(
    localNode: NodeInterface | null | undefined,
    cb: (node: NodeInterface) => void,
  ) {
    if (localNode) {
      this.inOrder(localNode.leftChild, cb);
      if (cb) cb(localNode);
      this.inOrder(localNode.rightChild, cb);
    }
  }
  postOrder(
    localNode: NodeInterface | null | undefined,
    cb: (node: NodeInterface) => void,
  ) {
    if (localNode) {
      this.postOrder(localNode.leftChild, cb);
      this.postOrder(localNode.rightChild, cb);
      if (cb) cb(localNode);
    }
  }
  remove(value: number) {
    //	当前节点
    let currentNode = this.root;
    if (!currentNode) return false;
    let parentNode = currentNode;
    //	是否是左节点
    let isLeft = true;
    while (currentNode.value !== value) {
      parentNode = currentNode;
      if (currentNode.value > value) {
        currentNode = currentNode.leftChild;
        isLeft = true;
      } else {
        currentNode = currentNode.rightChild;
        isLeft = false;
      }
      if (!currentNode) {
        return false;
      }
    }
    if (isLeft) {
      parentNode['leftChild'] = null;
      return true;
    } else {
      parentNode['rightChild'] = null;
      return true;
    }
  }
}
