import { HePromise } from '../../src/Advanced/HePromise';

describe('test HePromise', () => {
  it('basic usage', done => {
    const p = new HePromise(resolve => {
      setTimeout(() => {
        resolve(1);
      }, 1000);
    });
    try {
      p.then(data => {
        expect(data).toBe(1);
        done();
      });
    } catch (error) {
      done(error);
    }
  });

  it('chain invoke usage', done => {
    const p = new HePromise(resolve => {
      setTimeout(() => {
        resolve(11);
      }, 1000);
    });

    try {
      p.then(data => {
        expect(data).toBe(11);
        return 'hello';
      })
        .then(data => {
          expect(data).toBe('hello');
          return 'world';
        })
        .then(data => {
          expect(data).toBe('world');
          done();
        });
    } catch (error) {
      done(error);
    }
  });

  it('sync task', done => {
    const p = new HePromise(resolve => {
      resolve(123);
    });
    p.then(res => {
      expect(res).toBe(123);
      done();
    });
  });

  it('HePromise.resolve', done => {
    HePromise.resolve(1).then(res => {
      expect(res).toBe(1);
      done();
    });
  });

  it('HePromise.reject & catch', done => {
    // HePromise.reject(1).then(
    //   res => {
    //     expect(res).toBe(1);
    //     done();
    //   },
    //   error => {
    //     expect(error).toBe(1);
    //     done();
    //   },
    // );
    HePromise.reject(1)
      .then(res => {
        expect(res).toBe(1);
        done();
      })
      .catch(error => {
        expect(error.message).toEqual('1');
        done();
      });
  });

  it('HePromise.all', done => {
    HePromise.all([1, 2, 3]).then(res => {
      expect(res).toEqual([1, 2, 3]);
      done();
    });
  });

  it('HePromise.race', done => {
    HePromise.race([11, 22, 33]).then(res => {
      expect(res).toBe(11);
      done();
    });
  });
});
