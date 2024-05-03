<script lang="tsx">
import { MdEditor, type Themes } from 'md-editor-v3';
import 'md-editor-v3/lib/style.css';
import { uploadFile } from '@blog/apis';

export default defineComponent({
  name: 'MyMdEditor',
  components: { MdEditor },
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
<style lang="scss" scoped>
.md-preview {
  line-height: initial;
}
.md-editor {
  border: 0;
  height: 600px;
  &,
  & :deep(.md-editor-preview) {
    --md-bk-color: var(--input-bg-color);
    --md-color: var(--text-color);
    --md-theme-color: var(--text-color);
  }
  .md-editor-toolbar-wrapper {
    //border: 0;
  }
  :deep(.md-editor-footer) {
    line-height: 20px;
  }
}
</style>
