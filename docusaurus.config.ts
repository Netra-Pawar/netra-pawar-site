import { themes as prismThemes } from 'prism-react-renderer';
import type { Config } from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
  title: 'Netra Pawar',
  tagline: 'How knowledge holds',
  favicon: 'img/favicon.ico',

  // This is used when you build/deploy the site later.
  // We can update it once you decide where to publish: GitHub Pages, custom domain, etc.
  url: 'https://netrapawar.com',
  baseUrl: '/',

  organizationName: 'netrapawar',
  projectName: 'netra-pawar-site',

  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          routeBasePath: 'docs',
        },
        blog: {
          showReadingTime: true,
          routeBasePath: 'blog',
        },
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    image: 'img/docusaurus-social-card.jpg',

    navbar: {
      title: 'Netra Pawar',
      items: [
        {
          to: '/blog',
          label: 'Articles',
          position: 'right',
        },
        {
          to: '/docs/intro',
          label: 'Experiments',
          position: 'right',
        },
        {
          to: '/about',
          label: 'About',
          position: 'right',
        },
      ],
    },

    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;