/**
 * This function is used to merge reducers, used to createStore to create a store
 * 该函数用于合并 reducers，用于 createStore 创建 store
 */
import { AnyAction } from './types/actions';
import {
  ReducersMapObject,
  StateFromReducersMapObject,
} from './types/reducers';

export default function combineReducer(reducers: ReducersMapObject) {
  /**
   * Get all reducer keys
   * 获取到所有 reducer key
   * */
  const reducerKeys = Object.keys(reducers);

  /**
   * Return the new reducer function
   * 返回新的 reducer 函数
   * */
  return function combination(
    state: StateFromReducersMapObject<typeof reducers> = {},
    action: AnyAction,
  ) {
    /**
     * Define a new state, which is used to store the state of all modules after the merge
     * 定义新的 state，该 state 用来存储合并之后的所有模块 state
     * */
    const nextState: StateFromReducersMapObject<typeof reducers> = {};

    /**
     * Traverse all reducers
     * 遍历所有 reducer
     * */
    for (let i = 0; i < reducerKeys.length; i++) {
      const key = reducerKeys[i];
      const reducer = reducers[key];
      /**
       * First get the value of the previous state, this is the value stored in createStore, this value is a state tree, including all module states
       * 先获取到之前 state 的值，这个是 createStore 中存储的值，该值是一个 state tree，包括了所有模块 state
       * */
      const previousStateForKey = state[key];
      /**
       * The reducer is executed, and the state parameter of the incoming and outgoing state is officially the state stored last time,
       * and the new state after the calculation will be obtained after the call
       * 执行 reducer，出入的 state 参数正式上次存储的 state，调用后会获得计算后新的 state
       * */
      const nextStateForKey = reducer(previousStateForKey, action);
      /**
       * Attach the corresponding module state to the nextState object, and use key as the key
       * 将对应模块 state 挂到 nextState 对象上，且以 key 为键
       * */
      nextState[key] = nextStateForKey;
    }

    /**
     * Return the merged state
     * 返回合并后的 state
     * */
    return nextState;
  };
}
