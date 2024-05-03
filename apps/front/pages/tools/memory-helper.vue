<script setup lang="ts">
import type { ArticleEntity, MemoryHelperEntity, MemoryHelperEntityResolved } from '@blog/entities';
import { getMemoryList } from '@blog/apis';
import { howLongAgo } from '~/feature/utils';
import useUserStore from '~/store/user.store';

const userStore = useUserStore();
const article = ref<ArticleEntity>({} as ArticleEntity);
const settingDialogVisible = ref(false);
const creatorState = reactive({ visible: false, id: 0 });
const activeItem = ref<MemoryHelperEntityResolved>();

const { data: _data } = await useAsyncData(() => getMemoryList());
const list = computed(() => _data.value?.data.list || []);

const handlerClickItem = (item: MemoryHelperEntity) => {
  activeItem.value = item as MemoryHelperEntityResolved;
  settingDialogVisible.value = true;
};

const onEdit = (id: number) => {
  creatorState.id = id;
  creatorState.visible = true;
};

const showCreatorDialog = () => {
  onEdit(0);
};
</script>

<template>
  <ArticleAsPage as="tools/memory-helper" @data="article = $event">
    <template #aside>
      <Widget
        v-if="userStore.isRoleOfGreaterThanOrEqualDev"
        class="pre-bg-long-top-right"
        title="添加">
        <div class="widget-create-btn" @click="showCreatorDialog"></div>
      </Widget>
      <WidgetSentence />
      <WidgetCountdown />
    </template>
    <section class="memory-helper-list-area board">
      <ul class="memory-helper-list">
        <li v-for="(item, index) in list" :key="item.id" @click="handlerClickItem(item)">
          <span class="num">{{ index + 1 }}</span>
          <div class="content">
            {{ item.title }}
          </div>
          <div class="time">
            <div v-if="item.createAt">创建时间:{{ howLongAgo(item.createAt) }}</div>
            <div v-if="item.updateAt">修改时间:{{ howLongAgo(item.updateAt) }}</div>
          </div>
        </li>
      </ul>
      <el-empty v-if="!list.length" description="暂无数据" />
    </section>
  </ArticleAsPage>
  <MemoryHelperSetting
    v-model:visible="settingDialogVisible"
    :memory-id="activeItem?.id"
    @edit="onEdit" />
  <MemoryHelperCreator v-model:visible="creatorState.visible" :memory-id="creatorState.id" />
</template>

<style lang="scss" scoped>
.memory-helper-list {
  li {
    display: flex;
    align-items: center;
    padding: 10px;
    border-bottom: 1px solid transparent;
    background: rgba(0, 0, 0, 0.05);
    cursor: pointer;
    transition: background 0.3s ease-in-out;
    + li {
      margin-top: 1rem;
    }

    &:hover {
      background: rgba(0, 0, 0, 0.1);
    }

    .num {
      color: gray;
    }

    .content {
      margin: 0 8px;
      flex: 1;
    }

    .time {
      font-size: 0.6em;
      color: gray;
    }
  }
}
</style>
