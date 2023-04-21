<template>
  <div class="theme-switcher _ btn flex-c-c">
    <client-only>
      <el-popover
        placement="right"
        :width="100"
        trigger="hover"
        popper-class="theme-switcher-popper">
        <template #reference>
          <div class="_ wh-p100">
            <transition name="toggle" mode="out-in">
              <i :key="themeIcon" class="iconfont theme-switcher" :class="'icon-' + themeIcon"></i>
            </transition>
          </div>
        </template>
        <el-radio-group v-if="false" v-model="themeMode" size="small">
          <el-radio-button :label="ThemeMode.light"></el-radio-button>
          <el-radio-button :label="ThemeMode.dark"></el-radio-button>
          <el-radio-button :label="ThemeMode.system"></el-radio-button>
        </el-radio-group>
        <ul class="theme-switcher-list">
          <li
            v-for="item in list"
            :key="item.name"
            :class="{ active: item.name === themeMode }"
            @click="themeMode = item.name">
            <i class="iconfont" :class="item.icon"></i>
            {{ item.name }}
          </li>
        </ul>
      </el-popover>
    </client-only>
  </div>
</template>

<script setup lang="ts">
import { ThemeKeys, ThemeMode, Theme } from '~/setup/theme.setup';

const themeMode = useState<ThemeMode>(ThemeKeys.mode);
const theme = useState<Theme>(ThemeKeys.type);
const themeIcon = computed(() => {
  const obj: Record<Theme, string> = {
    [Theme.light]: 'sun',
    [Theme.dark]: 'moon',
    // [ThemeMode.system]: 'auto',
  };
  return obj[theme.value];
});
const list = [
  { name: ThemeMode.light, icon: 'icon-sun' },
  { name: ThemeMode.dark, icon: 'icon-moon' },
  { name: ThemeMode.system, icon: 'icon-auto' },
];
</script>
<style lang="scss" scoped>
.theme-switcher {
  .el-tooltip__trigger .iconfont {
    display: block;
    width: 2.2rem;
    line-height: 2.2rem;
    text-align: center;
  }
  .toggle-enter-active,
  .toggle-leave-active {
    transition: all 0.3s ease-in-out;
  }

  .toggle-enter-from,
  .toggle-leave-to {
    transform: translateY(50%);
    opacity: 0;
  }
}

.theme-switcher-list {
  margin: -10px;
  li {
    display: flex;
    align-items: center;
    padding: 0 1rem;
    line-height: 3rem;
    cursor: pointer;

    &:hover {
      background: var(--hover-transparent-bg);
      color: var(--theme-color);
    }
    &.active {
      color: var(--theme-color);
      pointer-events: none;
    }

    .iconfont {
      margin-right: 6px;
    }
  }
}

:deep(.theme-switcher-popper) {
  padding: 0 !important;
}
</style>
