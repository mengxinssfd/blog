import type { Ref } from 'vue';

export function useToggleState(status = false): [Ref<boolean>, (value?: boolean) => void] {
  const state = ref<boolean>(status);
  const toggleState = (value?: boolean) => {
    if (value !== undefined) {
      state.value = value;
      return;
    }
    state.value = !state.value;
  };
  return [state, toggleState];
}
