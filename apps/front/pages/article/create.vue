<template>
  <div class="pg article-create">
    <Banner height="300px" :bg-img="bannerImg">
      <template #content>
        <h1 class="pg-title">{{ writeType }}</h1>
      </template>
    </Banner>
    <ClientOnly>
      <div class="pg-content main-width">
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
                <ArticleCreateMdEditor
                  v-model:value="form.content"
                  @save="onSaveMd"></ArticleCreateMdEditor>
              </ClientOnly>
            </div>
          </el-form-item>
        </el-form>
        <div class="upload">
          timeStampName
          <el-switch
            v-model="uploadOpt.data.timeStampName"
            :inactive-value="0"
            :active-value="1"></el-switch>
          <el-upload class="upload-demo" v-bind="uploadOpt" :file-list="fileList" drag>
            <div class="el-upload__text _ h-p100 flex-c-c">
              Drop file here or <em>click to upload</em>
            </div>
            <template #tip>
              <div class="el-upload__tip">jpg/png files with a size less than 500kb</div>
            </template>
          </el-upload>
        </div>

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
</template>

<script lang="ts">
import { ElMessage, ElMessageBox } from 'element-plus';
import { updateObj } from '@tool-pack/basic';
import { Plus } from '@element-plus/icons-vue';
import { copy2Clipboard } from '@mxssfd/ts-utils';
import {
  createArticle,
  getCategoryList,
  getRawArticleDetail,
  updateArticle,
  getTags,
  uploadUrl,
} from '@blog/apis';
import type { ArticleEntity, CategoryEntity, TagEntity } from '@blog/entities';
import { useRoute, useRouter } from '#app';
import { useToggleState } from '~/feature/hooks';
import { Token } from '~/feature/request/primary/token';
import { definePageMeta } from '#imports';

definePageMeta({ authorized: true });
export default defineComponent({
  components: {
    Plus,
  },
  setup() {
    const router = useRouter();
    const route = useRoute();
    const localStorageKey = 'md-save';
    const [cateVisible, toggleCateVisible] = useToggleState(false);
    const [tagVisible, toggleTagVisible] = useToggleState(false);
    const formRef = ref();
    const Data = {
      categories: ref<CategoryEntity[]>([]),
      tags: ref<TagEntity[]>([]),
      showEditor: ref(false),
      form: reactive({
        title: '',
        description: '',
        cover: '',
        content: '',
        tags: [],
        bgm: '',
        categoryId: '',
        isPublic: true,
      }),
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
      uploadOpt: {
        action: import.meta.env.VITE_BASE_URL + uploadUrl,
        headers: {
          authorization: `Bearer ${Token.get()}`,
        },
        'on-error'(res: { message: string }) {
          const { msg }: { msg: string } = JSON.parse(res.message);
          ElMessage({ type: 'error', message: msg });
        },
        'on-success'(res: { data: string }, file: { name: string }) {
          const find = Data.fileList.value.find((i) => i.name === file.name);
          if (!find) {
            return;
          }
          find.url = res.data;
        },
        'on-change'(file: any, fileList: any) {
          file.status === 'ready' && (Data.fileList.value = fileList.slice());
        },
        'on-preview'({ url }: { url: string }) {
          if (!url) {
            ElMessage({ type: 'error', message: '链接为空' });
            return;
          }
          copy2Clipboard(url).then(() =>
            ElMessage({ type: 'success', message: '链接已复制到剪贴板' }),
          );
        },
        data: reactive({
          timeStampName: 0,
        }),
      },
      fileList: ref<{ name: string; url: string }[]>([
        /* {
          name: 'food.jpeg',
          url: 'https://....',
        }, */
      ]),
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
      loadMd() {
        Data.form.content = localStorage.getItem(localStorageKey) || '';
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
      onSaveMd() {
        localStorage.setItem(localStorageKey, Data.form.content);
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
      if (articleId) {
        _Methods.getArticle();
      }
      _Methods.loadMd();
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
<style lang="scss">
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
    margin-top: -20px;
    padding: 40px 20px;
    border-radius: var(--board-radius);
    box-shadow: var(--board-shadow);
    background: var(--board-bg-color);
  }
  .pg-title {
    font-size: 30px;
    text-align: center;
    font-weight: bold;
    color: var(--navbar-text-color);
  }
  .upload {
    margin-left: 60px;
    .el-upload {
      margin-top: 6px;
    }
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
</style>
