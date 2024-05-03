import { formatDate } from '@tool-pack/basic';
import { getArticleLikeCount, setArticleLike } from '@blog/apis';
import { type ArticleEntity } from '@blog/entities';
import { USER_ROLE } from '@blog/entities/constant';
import useUserStore from '~/store/user.store';

export function useArticle() {
  type ArticleId = string | number;
  const previewRef = ref();
  let articleId: any = '';
  const store = useUserStore();
  const Data = {
    ROLE: USER_ROLE,
    previewRef,
    audioVisible: ref(true),
    user: computed(() => store.user),
    article: ref<ArticleEntity>({} as any),
    like: ref({
      count: 0,
      checked: 0,
    }),
  };

  const Methods = {
    async getLikeCountData() {
      const res = await getArticleLikeCount(articleId);
      Data.like.value = res.data || Data.like.value;
    },
    formatDate(time: string): string {
      if (!time) return '--';
      return formatDate(new Date(time), 'yyyy-MM-dd hh:mm');
    },
    async setLike() {
      const res = await setArticleLike(articleId);
      Data.like.value = res.data || Data.like.value;
    },
    onCommentLockUpdate() {
      Data.article.value.commentLock = !Data.article.value.commentLock;
    },
  };
  return {
    Data,
    Methods,
    setArticleId(id: ArticleId) {
      articleId = id;
    },
  };
}
