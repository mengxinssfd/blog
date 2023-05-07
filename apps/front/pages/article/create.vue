<template>
  <NuxtLayout name="page">
    <template #aside>
      <Widget title="本地缓存">
        <ClientOnly>
          <div class="widget-content">
            <ul>
              <li>
                <el-popconfirm title="清理手动存储的存档?" @confirm="clearSaved">
                  <template #reference>
                    <el-button link>
                      <el-icon>
                        <i class="iconfont icon-delete"></i>
                      </el-icon>
                      <span>清理缓存(浏览器)</span>
                    </el-button>
                  </template>
                </el-popconfirm>
              </li>
              <li>
                <el-button link @click="onSave">
                  <el-icon>
                    <Coin />
                  </el-icon>
                  <span>手动保存(浏览器)</span>
                </el-button>
              </li>
              <li>
                <el-popconfirm title="清理自动存储的存档?" @confirm="clearAutoSaved">
                  <template #reference>
                    <el-button link>
                      <el-icon>
                        <i class="iconfont icon-delete"></i>
                      </el-icon>
                      <span>清理自动缓存(浏览器标签页)</span>
                    </el-button>
                  </template>
                </el-popconfirm>
              </li>
              <li class="_ flex-c" title="(关闭浏览器标签后清除)">
                <label>自动保存(浏览器标签页)：<el-switch v-model="autoSave"></el-switch></label>
              </li>
            </ul>
          </div>
        </ClientOnly>
      </Widget>
      <WidgetDailyImg />
      <WidgetUpload />
    </template>
    <div class="pg article-create">
      <ClientOnly>
        <div class="pg-content board">
          <el-form ref="formRef" :model="form" :rules="rules" label-width="60px">
            <el-form-item label="标题:" prop="title">
              <el-input v-model="form.title"></el-input>
            </el-form-item>
            <el-form-item label="描述:" prop="description">
              <el-input v-model="form.description" type="textarea"></el-input>
            </el-form-item>
            <el-form-item label="封面:" prop="cover">
              <el-input v-model="form.cover"></el-input>
              <img v-if="form.cover" class="cover" :src="form.cover" alt="" />
            </el-form-item>
            <el-form-item label="BGM:" prop="bgm">
              <el-input v-model="form.bgm"></el-input>
              <audio v-if="form.bgm" :src="form.bgm" autoplay controls></audio>
            </el-form-item>
            <el-form-item label="分类:" prop="categoryId">
              <el-select v-model="form.categoryId" placeholder="请选择文章分类">
                <el-option
                  v-for="item in categories"
                  :key="item.id"
                  :label="item.name"
                  :value="item.id">
                </el-option>
              </el-select>
              <el-icon class="el-icon-plus" size="16">
                <Plus @click="toggleCateVisible()"></Plus>
              </el-icon>
            </el-form-item>

            <el-form-item label="标签:" prop="tags">
              <el-select
                v-model="form.tags"
                class="tag-select"
                multiple
                filterable
                allow-create
                default-first-option
                placeholder="请选择文章标签">
                <el-option v-for="item in tags" :key="item.id" :label="item.name" :value="item.id">
                </el-option>
              </el-select>
              <el-icon class="el-icon-plus" size="16">
                <Plus @click="toggleTagVisible()"></Plus>
              </el-icon>
            </el-form-item>
            <el-form-item label="公开:" prop="isPublic">
              <el-checkbox v-model="form.isPublic"></el-checkbox>
            </el-form-item>
            <el-form-item label="文章:" prop="content">
              <div class="editor-wrapper">
                <ClientOnly>
                  <!--                  <ArticleCreateMdEditor v-model:value="form.content" @save="onSave" />-->
                  <component :is="editor" v-model:value="form.content" />
                </ClientOnly>
              </div>
            </el-form-item>
          </el-form>

          <div class="btn-block">
            <el-button type="primary" @click="submit">提交</el-button>
          </div>
        </div>
        <ArticleCreateCategory
          :visible="cateVisible"
          @update:content="cateVisible = $event"
          @create-success="getCategoryListData"></ArticleCreateCategory>
        <ArticleCreateTag
          v-model:visible="tagVisible"
          @create-success="getTagList"></ArticleCreateTag>
      </ClientOnly>
    </div>
  </NuxtLayout>
</template>

<script lang="ts">
import { ElMessage, ElMessageBox } from 'element-plus';
import { debounce, updateObj } from '@tool-pack/basic';
import { Plus, Coin } from '@element-plus/icons-vue';
import {
  createArticle,
  getCategoryList,
  getRawArticleDetail,
  updateArticle,
  getTags,
} from '@blog/apis';
import type { ArticleEntity, CategoryEntity, TagEntity } from '@blog/entities';
import { useToggleState, useStorageItem } from '~/feature/hooks';

definePageMeta({ authorized: true });
export default defineComponent({
  components: {
    Plus,
    Coin,
  },
  setup() {
    const router = useRouter();
    const route = useRoute();
    const [cateVisible, toggleCateVisible] = useToggleState(false);
    const [tagVisible, toggleTagVisible] = useToggleState(false);
    const formRef = ref();
    const autoSaveSI = useStorageItem<boolean>('autoSaveArticle');
    const form = reactive({
      title: '',
      description: '',
      cover: '',
      content: '',
      tags: [],
      bgm: '',
      categoryId: '',
      isPublic: true,
    });
    const tempFormSI = useStorageItem<typeof form>(
      'tempArticleSave',
      process.client ? sessionStorage : null,
    );
    const formSI = useStorageItem<typeof form>('articleSave');

    const Data = {
      categories: ref<CategoryEntity[]>([]),
      tags: ref<TagEntity[]>([]),
      showEditor: ref(false),
      form,
      article: ref<ArticleEntity | null>(null),
      mdEditorRef: ref(),
      formRef,
      cateVisible,
      tagVisible,
      rules: {
        title: { required: true, message: '标题不能为空' },
        description: { required: true, message: '描述不能为空' },
        cover: { required: true, message: '封面不能为空' },
        content: { required: true, message: '内容不能为空' },
        tags: { required: true, message: '标签不能为空' },
        categoryId: { required: true, message: '分类不能为空' },
      },
      autoSave: ref(autoSaveSI.get(true)),
      editor: shallowRef(),
    };
    const Computed = {
      writeType: computed(() => {
        return Data.article.value ? '编辑' : '新增';
      }),
      bannerImg: computed(() => {
        const defaultImg = 'https://img.tukuppt.com/ad_preview/00/05/72/5c98deb572e51.jpg!/fw/980';
        return Data.form.cover || defaultImg;
      }),
    };
    const _Methods = {
      autoSaveData: debounce(() => {
        tempFormSI.set(Data.form);
      }, 1000),
      loadSaved() {
        let saved = tempFormSI.get();
        let scoped = '临时缓存，存于当前浏览器标签页';
        if (!saved) {
          saved = formSI.get();
          scoped = '存于当前浏览器';
        }
        if (!saved) return;
        ElMessageBox.confirm(`有草稿存档(${scoped})，是否加载存档？`).then(() => {
          updateObj(Data.form, saved);
        });
      },
      async getArticle() {
        const { data: article } = await getRawArticleDetail(articleId);
        Data.article.value = article;
        article.tags = (article.tags || []).map((item: any) => item.id);
        article.categoryId = article.category.id as any;
        updateObj(Data.form, article as any);
        Data.form.isPublic = article.status === 1;
      },
    };
    const Methods = {
      clearAutoSaved() {
        tempFormSI.remove();
        ElMessage.success('清除成功');
      },
      clearSaved() {
        formSI.remove();
        ElMessage.success('清除成功');
      },
      onSave() {
        formSI.set(Data.form);
        ElMessage.success('保存成功');
      },
      async getCategoryListData() {
        const { data } = await getCategoryList();
        Data.categories.value = data;
      },
      async getTagList() {
        const res = await getTags();
        Data.tags.value = res.data || [] /* .concat([{ name: '1111111', id: 10086 }]) */;
      },
      async validate() {
        try {
          return await formRef.value.validate();
        } catch (e) {
          ElMessage({ type: 'error', message: '检查表单再提交' });
          // eslint-disable-next-line prefer-promise-reject-errors
          return Promise.reject();
        }
      },
      async submit() {
        await Methods.validate();
        const form = Object.entries(Data.form)
          .filter(([, v]) => v !== '')
          .reduce((prev, [k, v]) => {
            prev[k] = v;
            return prev;
          }, {} as any);

        if (articleId) {
          await updateArticle(articleId, form);
        } else {
          const res = await createArticle(form);
          articleId = res.data.id;
        }

        tempFormSI.remove();
        await ElMessageBox.confirm('是否打开文章详情页?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'info',
        });
        await router.push('/article/detail/' + articleId);
      },
      toggleCateVisible,
      toggleTagVisible,
    };

    let articleId: number = route.query.id as any;

    onMounted(() => {
      import('~/components/MdEditor.vue').then((res) => (Data.editor.value = res.default));
      if (articleId) {
        _Methods.getArticle();
      } else {
        _Methods.loadSaved();
      }
      watch(Data.autoSave, (n) => {
        autoSaveSI.set(n);
      });
      watch(Data.form, () => {
        if (Data.autoSave.value) _Methods.autoSaveData();
      });

      Methods.getTagList();
      Methods.getCategoryListData();

      setTimeout(() => {
        Data.showEditor.value = true;
      }, 5000);
    });
    return {
      ...Data,
      ...Computed,
      ...Methods,
    };
  },
});
</script>
<style lang="scss" scoped>
.pg.article-create {
  .editor-wrapper {
    display: block;
    width: 100%;
    position: relative;
    .el-switch {
      position: absolute;
      bottom: 100%;
      right: 0;
    }
  }
  .pg-content {
    position: relative;
    padding: 40px 20px;
  }
  .pg-title {
    font-size: 30px;
    text-align: center;
    font-weight: bold;
    color: var(--navbar-text-color);
  }
  .cover {
    height: 100px;
  }
  audio {
    margin-top: 10px;
    height: 40px;
  }
  .tag-select {
    min-width: 60%;
    max-width: 100%;
  }
  .btn-block {
    margin-top: 60px;
    text-align: center;
    .el-button {
      width: 200px;
    }
  }
  .el-icon-plus {
    margin-left: 10px;
    cursor: pointer;
  }
  .el-form {
    .el-form-item {
      @media (max-width: 576px) {
        display: block;
      }
    }
  }
}
.widget-content {
  padding: 0 10px;
  font-size: 13px;
  .el-button {
    font-size: inherit;
  }
  li + li {
    margin-top: 10px;
  }
}
</style>
