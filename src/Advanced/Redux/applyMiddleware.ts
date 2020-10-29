import { AnyAction } from './types/actions';
import { Reducer } from './types/reducers';
import { Middleware, MiddlewareAPI } from './types/middleware';
import { Dispatch, StoreEnhancerStoreCreator } from './types/store';
import compose from './compose';

export default function applyMiddleware(...middlewares: Middleware[]) {
  return (createStore: StoreEnhancerStoreCreator) => <S, A extends AnyAction>(
    reducer: Reducer<S, A>,
  ) => {
    const store = createStore(reducer);
    let dispatch: Dispatch;

    const middlewareAPI: MiddlewareAPI = {
      getState: store.getState,
      dispatch: (action, ...args) => dispatch(action, ...args),
    };
    const chain = middlewares.map(middleware => middleware(middlewareAPI));
    dispatch = compose(...chain)(store.dispatch);

    return {
      ...store,
      dispatch,
    };
  };
}
