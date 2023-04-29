// 参考文档：https://cn.vitejs.dev/guide/env-and-mode.html

export interface Env {
  readonly VITE_MODE_NAME: 'production' | 'development';
  // axios的base url
  readonly VITE_BASE_URL: string;
  // html lang
  readonly VITE_APP_LANG: string;
  // vite config的base
  readonly VITE_BASE_PATH: string;
  // 移除console.log
  readonly VITE_BUILD_DROP_CONSOLE: 'true' | void;
  // 移除debugger
  readonly VITE_BUILD_DROP_DEBUGGER: 'true' | void;
  // sourcemap；开发环境开启less sourcemap，生产环境开启js sourcemap
  readonly VITE_SOURCEMAP: 'true' | void;
  // 是否使用rem
  readonly VITE_USE_REM: 'true' | void;
  // 是否使用proxy
  readonly VITE_USE_PROXY: 'true' | void;
  readonly VITE_PROXY_TARGET: string;
  // 备案号
  readonly VITE_CASE_NUMBER: string;

  // cdn
  readonly VITE_SITE_CDN?: string;
  // # 网站名
  readonly VITE_SITE_NAME: string;
  // # 网站描述
  readonly VITE_SITE_DESC: string;
  // # 网站关键词
  readonly VITE_SITE_KEYWORD: string;
  // # 网站开始运行日期
  readonly VITE_SITE_START_AT: string;

  // oss
  readonly VITE_OSS_REGION: string;
  readonly VITE_OSS_ACCESSKEY_ID: string;
  readonly VITE_OSS_ACCESS_KEY_SECRET: string;
  readonly VITE_OSS_BUCKET: string;
}

// import.meta.env.VITE_APP_TITLE 使用时的ts类型提示
declare global {
  interface ImportMetaEnv extends Env {}
  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }
}
export {};
