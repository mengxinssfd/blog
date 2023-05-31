import * as Vue from 'vue';
import { updateObj } from '@tool-pack/basic';
import type { BlogBaseEntity } from '@blog/entities/base.entity';
import { Ref } from 'vue';

export function useForm<Entity extends BlogBaseEntity, CFV extends () => any>({
  createFormValue,
  onSubmit,
}: {
  createFormValue: CFV;
  onSubmit: Function;
}): {
  elFormRef: Ref<any>;
  form: ReturnType<CFV>;
  visible: Ref<boolean>;
  submit: () => Promise<void>;
  props: any;
} {
  const visible = defineModel({ type: Boolean, default: false, local: true });
  const props = defineProps({
    data: {
      type: Object as Vue.PropType<Entity | null>,
      default: () => null,
    },
  });

  const loading = ref(false);
  const elFormRef = ref();

  const form = ref<any>(createFormValue());

  watch(visible, (n) => {
    if (!n) {
      if (props.data) form.value = createFormValue();
      return;
    }
    if (props.data) updateObj(form.value, createFormValue(), props.data);
    elFormRef.value?.clearValidate();
  });

  async function submit() {
    try {
      loading.value = true;
      await elFormRef.value.validate();
      await onSubmit();
    } finally {
      loading.value = false;
    }
  }

  return { elFormRef, form, visible, submit, props };
}
