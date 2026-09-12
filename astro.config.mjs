import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

export default defineConfig({
  site: 'https://fullstack.hmilyld.com',
  integrations: [
    starlight({
      title: {
        'zh-CN': 'create-fullstack-app 文档',
        en: 'create-fullstack-app Docs',
      },
      description:
        '一条命令生成包含完整后台管理系统的全栈应用：React / Vue 前端，Python FastAPI / Java Spring Boot 后端。',
      defaultLocale: 'root',
      locales: {
        root: { label: '简体中文', lang: 'zh-CN' },
        en: { label: 'English', lang: 'en' },
      },
      customCss: ['./src/styles/custom.css'],
      social: [
        {
          icon: 'github',
          label: 'GitHub',
          href: 'https://github.com/hmilyld/fullstack-starter',
        },
      ],
      lastUpdated: true,
      sidebar: [
        {
          label: '开始使用',
          translations: { en: 'Getting Started' },
          items: [
            {
              slug: 'getting-started/introduction',
              label: '项目简介',
              translations: { en: 'Introduction' },
            },
            {
              slug: 'getting-started/installation',
              label: '安装与环境',
              translations: { en: 'Installation' },
            },
            {
              slug: 'getting-started/quickstart',
              label: '快速开始',
              translations: { en: 'Quick Start' },
            },
            {
              slug: 'getting-started/project-structure',
              label: '项目结构',
              translations: { en: 'Project Structure' },
            },
          ],
        },
        {
          label: '生成的项目',
          translations: { en: 'Generated Project' },
          items: [
            {
              slug: 'generated/overview',
              label: '技术栈与组合',
              translations: { en: 'Stacks & Combinations' },
            },
            {
              slug: 'generated/frontend',
              label: '前端结构',
              translations: { en: 'Frontend' },
            },
            {
              slug: 'generated/backend-python',
              label: 'Python 后端',
              translations: { en: 'Python Backend' },
            },
            {
              slug: 'generated/backend-java',
              label: 'Java 后端',
              translations: { en: 'Java Backend' },
            },
          ],
        },
        {
          label: '核心功能',
          translations: { en: 'Features' },
          items: [
            {
              slug: 'features/authentication',
              label: '认证与账号',
              translations: { en: 'Authentication' },
            },
            {
              slug: 'features/rbac',
              label: '权限系统',
              translations: { en: 'RBAC' },
            },
            {
              slug: 'features/system-settings',
              label: '系统设置',
              translations: { en: 'System Settings' },
            },
            {
              slug: 'features/ai-models',
              label: 'AI 模型与预设',
              translations: { en: 'AI Models & Presets' },
            },
            {
              slug: 'features/audit-logs',
              label: '审计日志',
              translations: { en: 'Audit Logs' },
            },
            {
              slug: 'features/dashboard',
              label: '仪表盘',
              translations: { en: 'Dashboard' },
            },
          ],
        },
        {
          label: '部署与运维',
          translations: { en: 'Deployment' },
          items: [
            {
              slug: 'deployment/docker',
              label: 'Docker 部署',
              translations: { en: 'Docker' },
            },
            {
              slug: 'deployment/scripts',
              label: '开发与构建脚本',
              translations: { en: 'Dev & Build Scripts' },
            },
            {
              slug: 'deployment/configuration',
              label: '配置与环境变量',
              translations: { en: 'Configuration' },
            },
          ],
        },
        {
          label: '参考',
          translations: { en: 'Reference' },
          items: [
            {
              slug: 'reference/api',
              label: 'API 接口',
              translations: { en: 'API Reference' },
            },
            {
              slug: 'reference/permissions',
              label: '权限码',
              translations: { en: 'Permission Codes' },
            },
            {
              slug: 'reference/default-accounts',
              label: '默认账号',
              translations: { en: 'Default Accounts' },
            },
          ],
        },
        {
          label: '维护脚手架',
          translations: { en: 'Scaffolder Development' },
          items: [
            {
              slug: 'development/templates',
              label: '模板约定',
              translations: { en: 'Template Conventions' },
            },
            {
              slug: 'development/adding-templates',
              label: '新增模板',
              translations: { en: 'Adding Templates' },
            },
            {
              slug: 'development/testing',
              label: '测试验证',
              translations: { en: 'Testing' },
            },
          ],
        },
        {
          label: '注意事项',
          translations: { en: 'Notes' },
          items: [
            {
              slug: 'notes',
              label: '注意事项与 FAQ',
              translations: { en: 'Notes & FAQ' },
            },
          ],
        },
      ],
    }),
  ],
});
