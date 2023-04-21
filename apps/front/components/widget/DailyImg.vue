<script setup lang="ts">
import { getDailyImg } from '@blog/apis';
import { useRequest } from '@request-template/vue3-hooks';

const BingHost = 'https://s.cn.bing.net';
const { data, request, loading } = useRequest(getDailyImg, undefined, { images: [] });
onMounted(request);
</script>
<template>
  <Widget>
    <template #title>
      <h5 class="widget-title">每日Bing图</h5>
    </template>
    <div class="widget-content">
      <el-skeleton v-if="loading">
        <template #template>
          <el-skeleton-item
            variant="image"
            animated
            style="width: 100%; height: 141px; margin-bottom: 1rem" />
          <div class="_ flex-c">
            <el-skeleton-item variant="text" style="margin-right: 16px; width: 30%" />
            <el-skeleton-item variant="text" style="margin-right: 16px; width: 30%" />
            <el-skeleton-item variant="text" style="width: 30%" />
          </div>
        </template>
      </el-skeleton>

      <el-carousel
        v-else
        indicator-position="outside"
        :autoplay="false"
        height="141px"
        trigger="click">
        <el-carousel-item v-for="img in data.images" :key="img.url">
          <el-image :src="BingHost + img.url">
            <template #placeholder>
              <el-skeleton-item variant="image" animated style="width: 100%; height: 141px" />
            </template>
          </el-image>
        </el-carousel-item>
      </el-carousel>
    </div>
  </Widget>
</template>

<style lang="scss" scoped>
.widget-content {
  :deep(.el-carousel) {
    --el-carousel-indicator-width: 1rem;
  }
}
</style>
