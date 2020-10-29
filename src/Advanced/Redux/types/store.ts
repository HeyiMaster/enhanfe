import { Action, AnyAction } from './actions';
import { Reducer } from './reducers';

export interface Dispatch<A extends Action = AnyAction> {
  <T extends A>(action: T, ...extraArgs: any[]): T;
}

export interface Unsubscribe {
  (): void;
}

export interface Store<S = any, A extends Action = AnyAction> {
  dispatch: Dispatch<A>;

  getState(): S;

  subscribe(listener: () => void): Unsubscribe;
}

export type StoreEnhancer<Ext = {}, StateExt = never> = (
  next: StoreEnhancerStoreCreator<Ext, StateExt>,
) => StoreEnhancerStoreCreator<Ext, StateExt>;

export type StoreEnhancerStoreCreator<Ext = {}, StateExt = never> = <
  S = any,
  A extends Action = AnyAction
>(
  reducer: Reducer<S, A>,
) => Store & any;
