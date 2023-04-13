<script lang="tsx">
import MdEditor, { Themes } from 'md-editor-v3';
import 'md-editor-v3/lib/style.css';
import { uploadFile } from '@blog/apis';

export default defineComponent({
  name: 'MdEditor',
  props: {
    value: {
      type: String,
      default: '',
    },
  },
  emits: ['update:value', 'save'],
  setup(props, ctx) {
    const state = reactive({
      theme: 'light' as Themes,
    });
    const onUploadImg = async (images: File[], callback: Function) => {
      const res = await Promise.all(
        images.map(async (image) => {
          const { data: src } = await uploadFile(image);
          return src;
        }),
      );

      callback(res);
    };
    return () => (
      <MdEditor
        modelValue={props.value}
        theme={state.theme}
        onChange={(v: string) => ctx.emit('update:value', v)}
        onUploadImg={onUploadImg}
        onSave={() => ctx.emit('save')}
      />
    );
  },
});
</script>
<style lang="scss">
.md-preview {
  line-height: initial;
}
</style>
