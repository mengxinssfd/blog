import * as Vue from 'vue';

export function useReactive<T extends object>(
  state: T,
): readonly [Vue.UnwrapNestedRefs<T>, (state: Partial<T>) => void] {
  const _state = reactive(state);
  const setState: ReturnType<typeof useReactive<T>>[1] = (state) => {
    Object.assign(_state, state);
  };
  return [_state, setState] as const;
}
