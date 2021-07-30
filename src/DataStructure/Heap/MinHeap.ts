class MinHeap<E> {
  /**
   * Storage heap data
   */
  private heap: E[];

  constructor() {
    this.heap = [];
  }

  /**
   * get current superior element index
   * @param index
   * @returns
   */
  private getSuperiorIndex(index: number) {
    return (index - 1) >> 1;
  }

  /**
   * get current subordinate index
   * @param index
   * @returns
   */
  private getSubordinateIndexs(index: number) {
    return [index * 2 + 1, index * 2 + 2];
  }

  /**
   * swap
   * @param i1
   * @param i2
   */
  private swap(i1: number, i2: number) {
    const temp = this.heap[i1];
    this.heap[i1] = this.heap[i2];
    this.heap[i2] = temp;
  }

  /**
   * Move element up
   * @param index
   */
  private moveUp(index: number) {
    if (index === 0) return;
    const superiorIndex = this.getSuperiorIndex(index);
    if (this.heap[superiorIndex] > this.heap[index]) {
      this.swap(superiorIndex, index);
      this.moveUp(superiorIndex);
    }
  }

  /**
   * Move element down
   * @param index
   */
  private moveDown(index: number) {
    const subIndexs = this.getSubordinateIndexs(index);
    subIndexs.forEach(subIndex => {
      if (this.heap[subIndex] < this.heap[index]) {
        this.swap(subIndex, index);
        this.moveDown(subIndex);
      }
    });
  }

  /**
   * Insert data into heap
   * @param value
   */
  insert(value: E) {
    this.heap.push(value);
    // Adjust data location
    this.moveUp(this.heap.length - 1);
  }

  /**
   * Pop up top element
   */
  pop() {
    if (!this.size()) return;
    this.heap[0] = this.heap.pop() as E;
    this.moveDown(0);
  }

  /**
   * peek heap
   * @returns E
   */
  peek() {
    return this.heap[0];
  }

  /**
   * return heap size
   * @returns number
   */
  size() {
    return this.heap.length;
  }
}

const minHeap = new MinHeap<number>();
minHeap.insert(3);
minHeap.insert(2);
minHeap.insert(1);
minHeap.pop();
