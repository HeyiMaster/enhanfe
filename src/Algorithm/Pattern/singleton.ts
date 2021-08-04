class User {
  /**
   * name property
   */
  private name: string;
  /**
   * instance
   */
  private static instance: User;
  /**
   * get Object instance
   * @returns User
   */
  static getInstance() {
    if (!this.instance) {
      return (this.instance = new User('walker'));
    }
    return this.instance;
  }
  constructor(name: string) {
    this.name = name;
  }
  say() {
    console.log(this.name);
  }
}

const u1 = User.getInstance();
const u2 = User.getInstance();
console.log(u1 === u2);
