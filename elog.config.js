module.exports = {
  write: {
    platform: 'notion',
    notion: {
      token: process.env.NOTION_TOKEN,
      databaseId: process.env.NOTION_DATABASE_ID,
      filter: { and: [{property: 'status', select: {equals: 'Published'}}, {property: 'type', select: {equals: 'Post'}}]},
      sorts:  [{property: 'sort', direction: 'descending'},{timestamp: 'created_time', direction: 'descending'}],
      catalog: true,
    }
  },
  deploy: {
    platform: 'local',
    local: {
      outputDir: './source/_posts',
      filename: 'title',
      format: 'markdown',
      catalog: true,
      formatExt: '',
    },
    confluence: {
      user: process.env.CONFLUENCE_USER,
      password: process.env.WORDPRESS_PASSWORD,
      endpoint: process.env.WORDPRESS_ENDPOINT,
      spaceKey: process.env.CONFLUENCE_SPACE_KEY,
      rootPageId: process.env.CONFLUENCE_ROOT_PAGE_ID, // 可选
      formatExt: '', // 可选
    }
  },
  image: {
    enable: true,
    platform: 'github',
    github: {
      user: process.env.GITHUB_USER,
      token: process.env.GITHUB_TOKEN,
      repo: process.env.GITHUB_REPO,
      branch: 'hexo',
      host: 'https://cdn.jsdelivr.net/gh/listener-He/images@hexo',
      prefixKey: '',
      secretExt: '', // 可选
    },
  },
}
