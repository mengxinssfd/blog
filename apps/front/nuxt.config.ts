// https://nuxt.com/docs/api/configuration/nuxt-config
import * as Path from 'path';
import * as Fs from 'fs';

const pkgs = Fs.readdirSync(Path.resolve(__dirname, '../../packages'));

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
});
