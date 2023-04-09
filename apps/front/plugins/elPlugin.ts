import ElementPlus, { ID_INJECTION_KEY } from 'element-plus';
export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp
    .use(ElementPlus)
    // 修复 Looks like you are using server rendering, you must provide a id...
    // 参考 https://github.com/element-plus/element-plus/issues/7963
    .provide(ID_INJECTION_KEY, {
      prefix: 1024,
      current: 0,
    });
});
