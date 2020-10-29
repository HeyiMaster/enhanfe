/**
 * This function is used to create a redux store
 * 该函数用于创建 redux store
 */
import { Store, StoreEnhancer, StoreEnhancerStoreCreator } from './types/store';
import { Action } from './types/actions';
import { Reducer } from './types/reducers';

export default function createStore<
  S,
  A extends Action,
  Ext = {},
  StateExt = never
>(reducer: Reducer, enhancer?: StoreEnhancer<Ext, StateExt>): Store {
  /**
   * If there is an enhancer, call and return to the new store
   * 如果存在增强器，调用并返回新 store
   */
  if (typeof enhancer !== 'undefined') {
    if (typeof enhancer !== 'function') {
      throw new Error('Expected the enhancer to be a function.');
    }

    return enhancer(createStore as StoreEnhancerStoreCreator)(reducer) as Store;
  }

  let state: S;
  const nextListeners: (() => void)[] = [];

  /**
   * Subscribe to store changes
   * 订阅 store 变化
   */
  function subscribe(listener: () => void) {
    nextListeners.push(listener);

    /**
     * return unsubscribe function
     */
  }

  /**
   * 获取当前 state
   * Get current state
   */
  function getState() {
    return state;
  }

  function dispatch(action: A) {
    state = reducer(state, action);
    for (let i = 0, len = nextListeners.length; i < len; i++) {
      nextListeners[i]();
    }
  }

  return {
    subscribe,
    getState,
    dispatch,
  } as Store;
}
