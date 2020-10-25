import ListInterface from './List.interface';

export default class List<E> implements ListInterface<E> {
  // Store the data in array
  private el: E[] = new Array<E>();
  // Inserts at the specified index
  insert(index: number, e: E) {
    this.el.splice(index, 0, e);
  }
  // Insert in front of the list
  insertBefore(e: E) {
    this.el.unshift(e);
  }
  // Insert after the list
  insertLast(e: E) {
    this.el.push(e);
  }
  // Remove element
  remove(e: E): E {
    this.el = this.el.filter(item => item !== e);
    return e;
  }
  // Remove first element
  removeFirst() {
    return this.el.shift();
  }
  // Remove last element
  removeLast() {
    return this.el.pop();
  }
  // Gets the list size
  getSize(): number {
    return this.el.length;
  }
  // Gets the specified index element
  get(index: number): any {
    return this.el[index];
  }
  // Update element
  update(index: number, e: E) {
    this.el[index] = e;
  }
  // To string
  toString() {
    return this.el.toString();
  }
}
