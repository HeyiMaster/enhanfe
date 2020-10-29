import { Dispatch } from './store';

export interface MiddlewareAPI<D extends Dispatch = Dispatch, S = any> {
  dispatch: D;
  getState(): S;
}

export interface Middleware<S = any, D extends Dispatch = Dispatch> {
  (api: MiddlewareAPI<D, S>): (
    next: D,
  ) => (action: D extends Dispatch<infer A> ? A : never) => any;
}
