<script setup lang="ts">
import { type ArticleEntity, MemoryHelperEntityResolved } from '@blog/entities';
import { getMemoryList } from '@blog/apis';
import { howLongAgo } from '~/feature/utils';

const article = ref<ArticleEntity>({} as ArticleEntity);
const settingDialogVisible = ref(false);
const creatorState = reactive({ visible: false, id: 0 });
const activeItem = ref<MemoryHelperEntityResolved>();

const { data: _data } = await useAsyncData(() => getMemoryList());
const list = computed(() => _data.value?.data.list || []);

const handlerClickItem = (item: MemoryHelperEntityResolved) => {
  activeItem.value = item;
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
      <Widget class="pre-bg-long-top-right" title="添加">
        <div class="add-link" @click="showCreatorDialog">
          <div class="_ pos-trans-c-c"></div>
          <div class="_ pos-trans-c-c col"></div>
        </div>
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
.add-link {
  position: relative;
  border-radius: 10px;
  cursor: pointer;
  min-height: 60px;
  &:hover {
    > div {
      background-color: var(--theme-color);
    }
  }
  > div {
    width: 30px;
    height: 3px;
    background-color: #dcdcdc;
    transition: background-color 0.25ms;
  }
  .col {
    transform: translate(-50%, -50%) rotate(90deg);
  }
}
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
