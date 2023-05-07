<template>
  <div class="c-tags" :class="{ multiple }">
    <el-tag
      v-for="(item, index) in list"
      :key="item[valueKey]"
      :type="isActive(item) ? activeTagType : 'info'"
      disable-transitions
      @click="clickTag(item, index)">
      {{ item[labelKey] }}
    </el-tag>
  </div>
</template>

<script lang="ts">
import * as Vue from 'vue';

export default defineComponent({
  props: {
    value: {
      type: [String, Number, Array],
      default: '',
    },
    list: {
      type: Array as Vue.PropType<Record<string, any>[]>,
      default() {
        return [];
      },
    },
    labelKey: {
      type: String,
      default: 'label',
    },
    valueKey: {
      type: String,
      default: 'value',
    },
    activeTagType: {
      type: String,
      default: '',
    },
    multiple: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['update:value', 'change'],
  setup(props, ctx) {
    const propsRefs = toRefs(props);
    const innerValue = ref(props.value || (props.multiple ? [] : ''));
    // 监视reactive中的某些属性的变化  要以函数返回值的情况来得到
    // watch(()=>obj.prop 并且要开启deep
    watch(
      propsRefs.value,
      (n) => {
        innerValue.value = n;
      },
      { immediate: true },
    );

    return {
      innerValue,
      isActive(item: Record<string, any>) {
        const curVal = item[props.valueKey];
        if (props.multiple) {
          return (innerValue.value as unknown[]).includes(curVal);
        }
        return innerValue.value === curVal;
      },
      clickTag(item: any, index: number) {
        const curVal = item[props.valueKey];
        if (props.multiple) {
          const list = innerValue.value as unknown[];
          const i = list.indexOf(curVal);
          if (i > -1) {
            list.splice(i, 1);
          } else {
            list.push(curVal);
          }
        } else {
          innerValue.value = curVal;
        }
        ctx.emit('update:value', innerValue);
        ctx.emit('change', { item, index });
      },
    };
  },
});
</script>
<style lang="scss">
.c-tags {
  .el-tag {
    margin: 0;
    background: none;
    border: none;
    display: inline-block;
    &:not(.el-tag--info) {
      pointer-events: none;
    }
    &.el-tag--info {
      cursor: pointer;
      &:hover {
        color: #409eff;
        border-color: #409eff;
      }
    }
  }
  &.multiple {
    .el-tag {
      cursor: pointer;
      &:not(.el-tag--info) {
        pointer-events: initial;
      }
    }
  }
}
</style>
