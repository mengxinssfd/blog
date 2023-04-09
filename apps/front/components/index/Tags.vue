<template>
  <div class="c-tags" :class="{ multiple }">
    <el-tag
      v-for="(item, index) in list"
      :key="item[valueKey]"
      :type="isActive(item) ? activeTagType : 'info'"
      @click="clickTag(item, index)">
      {{ item[labelKey] }}
    </el-tag>
  </div>
</template>

<script lang="ts">
import * as Vue from 'vue';
import { TagEntity } from '@blog/entities';

export default defineComponent({
  props: {
    value: {
      type: [String, Number, Array],
      default: '',
    },
    list: {
      type: Array as Vue.PropType<TagEntity[]>,
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
      isActive(item: TagEntity) {
        const curVal = item[props.valueKey];
        if (props.multiple) {
          return innerValue.value.includes(curVal);
        }
        return innerValue.value === curVal;
      },
      clickTag(item: any, index: number) {
        const curVal = item[props.valueKey];
        if (props.multiple) {
          const i = innerValue.value.indexOf(curVal);
          if (i > -1) {
            innerValue.value.splice(i, 1);
          } else {
            innerValue.value.push(curVal);
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
