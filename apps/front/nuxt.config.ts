// https://nuxt.com/docs/api/configuration/nuxt-config
import * as Path from 'path';
import * as Fs from 'fs';
import { Env } from './env';

const pkgs = Fs.readdirSync(Path.resolve(__dirname, '../../packages'));

const env = (process as any).env as Env;

const lifecycle = process.env.npm_lifecycle_event;
const isBuild = Boolean(lifecycle && ['build', 'generate'].includes(lifecycle));

export default defineNuxtConfig({
  css: ['~/styles/index.scss'],
  modules: ['@pinia/nuxt'],
  alias: {
    '@blog/*': Path.resolve(__dirname, '../../packages/*/src'),
    ...pkgs.reduce((prev, cur) => {
      prev['@blog/' + cur] = Path.resolve(__dirname, `../../packages/${cur}/src`);
      return prev;
    }, {} as Record<string, string>),
  },
  experimental: {
    // Multiple conflicting contents for sourcemap source
    // https://github.com/nuxt/nuxt/issues/14981
    treeshakeClientOnly: false,
  },
  app: {
    cdnURL: env.VITE_SITE_CDN,
    // 页面切换动画
    // pageTransition: { name: 'page', mode: 'out-in' },
    // layoutTransition: { name: 'layout', mode: 'out-in' },
    head: {
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1.0, maximum-scale=1.0' },
        { name: 'baidu-site-verification', content: 'code-xSBd0ubpSQ' },
        { name: 'description', content: env.VITE_SITE_DESC },
        { name: 'author', content: 'DYH' },
        { name: 'keyword', content: env.VITE_SITE_KEYWORD },
      ],
      link: [
        {
          rel: 'shortcut icon',
          href: '/favicon.ico',
        },
        {
          rel: 'alternate',
          href: '/atom.xml',
          title: env.VITE_SITE_NAME,
          type: 'application/atom+xml',
        },
      ],
      script: [{ src: '/theme-helper.js' }],
      title: env.VITE_SITE_NAME,
      titleTemplate: (title) => `${env.VITE_SITE_NAME} - ${title}`,
    },
  },
  // build  from https://github.com/element-plus/element-plus-nuxt-starter
  build: {
    // Babel 转译
    transpile: isBuild ? ['element-plus'] : [],
  },
  sourcemap: !isBuild,
  vite: {
    esbuild: { drop: isBuild ? ['console', 'debugger'] : [] },
  },
});
