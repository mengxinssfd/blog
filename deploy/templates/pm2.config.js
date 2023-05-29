// 名称任意，按照个人习惯来
module.exports = {
  apps: [
    {
      name: 'api', // 应用名称
      script: '/apps/api/main.js', // 启动文件地址
      cwd: '/apps/api/', // 当前工作路径
      //      watch: [
      //        // 监控变化的目录，一旦变化，自动重启
      //        '/apps/api',
      //      ],
      ignore_watch: [
        // 忽视这些目录的变化
        'node_modules',
        'logs',
        'public',
      ],
      node_args: '--harmony', // node的启动模式
      env: {
        PORT: 3000,
        NODE_ENV: 'production', // 设置运行环境，此时process.env.NODE_ENV的值就是development
        ORIGIN_ADDR: 'http://xiaojiju.com',
      },
      env_production: { NODE_ENV: 'production' },
      out_file: '/apps/api/logs/pm2/out.log', // 普通日志路径
      error_file: '/apps/api/logs/pm2/err.log', // 错误日志路径
      merge_logs: true,
      log_date_format: 'YYYY-MM-DD HH:mm Z',
    },
    {
      name: 'front',
      exec_mode: 'cluster',
      // instances: 'max',
      script: '/apps/front/server/index.mjs',
      out_file: '/apps/front/out.log', // 普通日志路径
      error_file: '/apps/front/err.log', // 错误日志路径
      merge_logs: true,
      log_date_format: 'YYYY-MM-DD HH:mm Z',
      env: {
        //        NITRO_PORT: 3001,
        // PORT: 3001,
      },
      //      watch: ['/apps/front/'],
    },
  ],
};
