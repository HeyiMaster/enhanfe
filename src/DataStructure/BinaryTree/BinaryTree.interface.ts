export type DataType = Record<string, any> | undefined;

export interface NodeInterface {
  leftChild?: NodeInterface | null;
  rightChild?: NodeInterface | null;
  value: number;
  data?: DataType;
}

export default interface BinaryTreeInterface {
  insert(value: number, data?: DataType): void;
  find(value: number): NodeInterface | null;
  preOrder(localNode: NodeInterface, cb: (node: NodeInterface) => void): void;
  inOrder(localNode: NodeInterface, cb: (node: NodeInterface) => void): void;
  postOrder(localNode: NodeInterface, cb: (node: NodeInterface) => void): void;
  remove(value: number): boolean;
}
