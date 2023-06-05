import { createHiddenHtmlElement } from '@tool-pack/dom';
import * as Vue from 'vue';
import File from '~/pages/admin/file.vue';

export function useFileSelector(
  accept: string,
  multiple = false,
): readonly [Vue.Ref<File[]>, () => void] {
  const files = ref<File[]>([]);

  let input: HTMLInputElement | undefined = undefined;

  onMounted(() => {
    input = createHiddenHtmlElement({ type: 'file', accept, multiple }, 'input');

    input.addEventListener('change', (e) => {
      const target = e.target as HTMLInputElement;
      console.log(target.files);
      files.value = target.files ? [...target.files] : [];

      target.value = '';
    });

    onBeforeUnmount(() => input?.remove());
  });

  const trigger = () => input?.click();

  return [files, trigger] as const;
}
