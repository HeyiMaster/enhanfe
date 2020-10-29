import {
  createStore,
  combineReducer,
  compose,
  applyMiddleware,
} from '../../src/Advanced/Redux';

describe('test redux', () => {
  it('basic usage', () => {
    const initialState = {
      count: 0,
    };
    function reducer(state = initialState, action) {
      switch (action.type) {
        case 'ADD':
          return { ...state, count: state.count + 1 };
        case 'REDUCE':
          return { ...state, count: state.count - 1 };
        default:
          break;
      }
    }
    const store = createStore(reducer);
    // store.subscribe(() => console.log(store.getState()));

    store.dispatch({ type: 'ADD' });
    expect(store.getState()).toEqual({ count: 1 });
    store.dispatch({ type: 'REDUCE' });
    expect(store.getState()).toEqual({ count: 0 });
  });

  it('test combineReducer', () => {
    const countInitialState = {
      count: 0,
    };
    function countReducer(state = countInitialState, action) {
      switch (action.type) {
        case 'ADD':
          return { ...state, count: state.count + 1 };
        case 'REDUCE':
          return { ...state, count: state.count - 1 };
        default:
          return state;
      }
    }
    const numInitialState = {
      num: 0,
    };
    function numReducer(state = numInitialState, action) {
      switch (action.type) {
        case 'PLUS':
          return { ...state, num: state.num + 1 };
        case 'CUT':
          return { ...state, num: state.num - 1 };
        default:
          return state;
      }
    }

    const reducer = combineReducer({
      countState: countReducer,
      numState: numReducer,
    });
    const store = createStore(reducer);

    // store.subscribe(() => console.log(store.getState()));
    store.dispatch({ type: 'ADD' });
    expect(store.getState()).toHaveProperty('countState');
    expect(store.getState()).toHaveProperty('numState');
    expect((store.getState() as any).countState).toEqual({ count: 1 });
    store.dispatch({ type: 'CUT' });
    expect((store.getState() as any).numState).toEqual({ num: -1 });
  });

  it('test compose', () => {
    const r1 = num => num + 1;
    const r2 = num => num + 2;
    expect(compose(r1, r2)(1)).toBe(4);
  });

  it('test middleware basic usage', () => {
    const initialState = {
      count: 0,
    };
    function reducer(state = initialState, action) {
      switch (action.type) {
        case 'ADD':
          return { ...state, count: state.count + 1 };
        case 'REDUCE':
          return { ...state, count: state.count - 1 };
        default:
          break;
      }
    }

    function logger1(store) {
      return function(next) {
        return function(action) {
          console.group(action.type);
          console.info('dispatching logger111', action);
          let result = next(action);
          console.log('next state 111', store.getState());
          console.groupEnd();
          return result;
        };
      };
    }

    function logger2(store) {
      return function(next) {
        return function(action) {
          console.group(action.type);
          console.info('dispatching logger222', action);
          let result = next(action);
          console.log('next state 222', store.getState());
          console.groupEnd();
          return result;
        };
      };
    }

    const store = createStore(reducer, applyMiddleware(logger1, logger2));

    store.dispatch({ type: 'ADD' });
    expect(store.getState()).toEqual({ count: 1 });
    store.dispatch({ type: 'REDUCE' });
    expect(store.getState()).toEqual({ count: 0 });
  });
});
