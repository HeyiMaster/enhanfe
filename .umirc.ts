import { defineConfig } from 'dumi';

export default defineConfig({
  title: 'Enhanfe',
  mode: 'site',
  // favicon: 'https://user-images.githubusercontent.com/9554297/83762004-a0761b00-a6a9-11ea-83b4-9c8ff721d4b8.png',
  // logo: 'https://user-images.githubusercontent.com/9554297/83762004-a0761b00-a6a9-11ea-83b4-9c8ff721d4b8.png',
  favicon:
    'https://walker-markdown.oss-cn-shenzhen.aliyuncs.com/uPic/enhanfe.png',
  logo: 'https://walker-markdown.oss-cn-shenzhen.aliyuncs.com/uPic/enhanfe.png',
  outputPath: 'docs-dist',
  alias: {
    '@': './src',
  },
  locales: [
    // ['zh-CN', '中文'],
    // ['en-US', 'English'],
  ],
  navs: [
    null,
    {
      title: '⭐️  GitHub',
      path: 'https://github.com/HeyiMaster/enhanfe',
    },
  ],
  // ssr: {},
  // exportStatic: {},
});
