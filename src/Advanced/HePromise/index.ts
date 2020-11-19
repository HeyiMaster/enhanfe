type FuncType = (...args: any[]) => any;

type ExecutorFunc = (resolveFunc: FuncType, rejectFunc?: FuncType) => any;

enum STATUS {
  PENDING = 'pending',
  FULFILLED = 'fulfilled',
  REJECTED = 'rejected',
}

export class HePromise {
  private status = STATUS.PENDING;
  private value = undefined;
  private resolves: FuncType[] = [];
  private rejects: FuncType[] = [];

  static resolve(val: any): HePromise {
    if (val instanceof HePromise) return val;
    return new HePromise(resolve => resolve(val));
  }

  static reject(val: any): HePromise {
    return new HePromise((resolve, reject) => reject && reject(val));
  }

  static all(promises: any[]): HePromise {
    let index = 0;
    const result: any[] = [];
    const pLen = promises.length;
    return new HePromise((resolve, reject) => {
      promises.forEach(p => {
        HePromise.resolve(p).then(
          val => {
            index++;
            result.push(val);
            if (index === pLen) {
              resolve(result);
            }
          },
          err => {
            if (reject) reject(err);
          },
        );
      });
    });
  }

  static race(promises: any[]): HePromise {
    return new HePromise((resolve, reject) => {
      promises.forEach(p => {
        HePromise.resolve(p).then(
          val => {
            resolve(val);
          },
          err => {
            if (reject) reject(err);
          },
        );
      });
    });
  }

  constructor(executor: ExecutorFunc) {
    const { resolve, reject } = this;
    executor(resolve, reject);
  }

  private resolve = (resolvedVal: any) => {
    const { resolves, status } = this;
    if (status !== STATUS.PENDING) return;
    this.status = STATUS.FULFILLED;
    this.value = resolvedVal;
    while (resolves.length) {
      const cb = resolves.shift();
      if (cb) cb(resolvedVal);
    }
  };

  private reject = (rejectedVal: any) => {
    const { rejects, status } = this;
    if (status !== STATUS.PENDING) return;
    this.status = STATUS.REJECTED;
    this.value = rejectedVal;
    while (rejects.length) {
      const cb = rejects.shift();
      if (cb) cb(rejectedVal);
    }
  };

  then(resolveFunc?: FuncType, rejectFunc?: FuncType): HePromise {
    typeof resolveFunc !== 'function' ? (resolveFunc = value => value) : null;
    typeof rejectFunc !== 'function'
      ? this.rejects.length < 1
        ? (rejectFunc = reason => {
            throw new Error(reason instanceof Error ? reason.message : reason);
          })
        : null
      : null;

    return new HePromise((resolve, reject) => {
      const resolvedFn = (val: any) => {
        try {
          const resolvedVal = resolveFunc && resolveFunc(val);
          resolvedVal instanceof HePromise
            ? resolvedVal.then(resolve, reject)
            : resolve(resolvedVal);
        } catch (error) {
          if (reject) reject(error);
        }
      };
      this.resolves.push(resolvedFn);

      const rejectedFn = (val: any) => {
        if (rejectFunc) {
          try {
            const rejectedVal = rejectFunc(val);
            rejectedVal instanceof HePromise
              ? rejectedVal.then(resolve, reject)
              : resolve(rejectedVal);
          } catch (error) {
            if (reject) reject(error);
          }
        }
      };

      switch (this.status) {
        case STATUS.PENDING:
          this.resolves.push(resolvedFn);
          this.rejects.push(rejectedFn);
          break;
        case STATUS.FULFILLED:
          resolvedFn(this.value);
          break;
        case STATUS.REJECTED:
          rejectedFn(this.value);
          break;
      }
    });
  }

  catch(rejectFnnc: FuncType) {
    return this.then(undefined, rejectFnnc);
  }

  finally(cb) {
    return this.then(
      value => HePromise.resolve(cb()).then(() => value),
      reason =>
        HePromise.resolve(cb()).then(() => {
          throw reason;
        }),
    );
  }
}
