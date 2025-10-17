# TailAdmin Next.js - 免费 Next.js Tailwind 管理后台模板

TailAdmin 是一个基于 **Next.js 和 Tailwind CSS** 构建的免费开源管理后台模板，为开发者提供了创建功能丰富、数据驱动的后端、仪表板或管理面板解决方案所需的一切。

![TailAdmin - Next.js 仪表板预览](./banner.png)

通过 TailAdmin Next.js，您可以访问构建高质量完整仪表板或管理面板所需的所有必要仪表板 UI 组件、元素和页面。无论您是为复杂的 Web 应用程序还是简单的网站构建仪表板或管理面板。

TailAdmin 利用 **Next.js 15** 的强大功能和 Next.js 的常见功能，如服务器端渲染 (SSR)、静态站点生成 (SSG) 和无缝 API 路由集成。结合 **React 19** 的进步和 **TypeScript** 的健壮性，TailAdmin 是帮助您快速启动项目的完美解决方案。

## 项目概述

TailAdmin 为构建功能丰富、数据驱动的管理仪表板和控制面板提供了必要的 UI 组件和布局。它基于：

- Next.js 15.x
- React 19
- TypeScript
- Tailwind CSS V4

### 快速链接
- [✨ 访问网站](https://tailadmin.com)
- [📄 文档](https://tailadmin.com/docs)
- [⬇️ 下载](https://tailadmin.com/download)
- [🖌️ Figma 设计文件（社区版）](https://www.figma.com/community/file/1463141366275764364)
- [⚡ 获取专业版](https://tailadmin.com/pricing)

### 演示
- [免费版本](https://nextjs-free-demo.tailadmin.com)
- [专业版本](https://nextjs-demo.tailadmin.com)

### 其他版本
- [HTML 版本](https://github.com/TailAdmin/tailadmin-free-tailwind-dashboard-template)
- [React 版本](https://github.com/TailAdmin/free-react-tailwind-admin-dashboard)
- [Vue.js 版本](https://github.com/TailAdmin/vue-tailwind-admin-dashboard)

## 安装

### 前置要求
要开始使用 TailAdmin，请确保您已安装并设置以下前置要求：

- Node.js 18.x 或更高版本（建议使用 Node.js 20.x 或更高版本）

### 克隆仓库
使用以下命令克隆仓库：

```bash
git clone https://github.com/TailAdmin/free-nextjs-admin-dashboard.git
```

> Windows 用户：如果在克隆时遇到问题，请将仓库放置在驱动器根目录附近。

1. 安装依赖：
    ```bash
    npm install
    # 或
    yarn install
    ```
    > 如果在安装过程中遇到对等依赖错误，请使用 `--legacy-peer-deps` 标志。

2. 启动开发服务器：
    ```bash
    npm run dev
    # 或
    yarn dev
    ```

## 项目结构

```
nextjs-admin/
├── src/
│   ├── app/                    # Next.js 15 App Router 页面
│   │   ├── (admin)/           # 管理后台页面组
│   │   │   ├── (others-pages)/ # 其他页面（图表、表单、表格等）
│   │   │   ├── (ui-elements)/  # UI 元素页面
│   │   │   ├── layout.tsx      # 管理后台布局
│   │   │   └── page.tsx        # 仪表板首页
│   │   ├── (full-width-pages)/ # 全宽页面组
│   │   │   ├── (auth)/         # 认证页面
│   │   │   └── (error-pages)/  # 错误页面
│   │   ├── layout.tsx          # 根布局
│   │   └── globals.css         # 全局样式
│   ├── components/             # React 组件
│   │   ├── auth/              # 认证组件
│   │   ├── calendar/          # 日历组件
│   │   ├── charts/            # 图表组件
│   │   ├── common/            # 通用组件
│   │   ├── ecommerce/         # 电商组件
│   │   ├── form/              # 表单组件
│   │   ├── header/            # 头部组件
│   │   ├── layout/            # 布局组件
│   │   ├── tables/            # 表格组件
│   │   ├── ui/                # UI 组件
│   │   └── user-profile/      # 用户资料组件
│   ├── context/               # React Context
│   ├── hooks/                 # 自定义 Hooks
│   ├── icons/                 # SVG 图标
│   └── layout/                # 布局组件
├── public/                    # 静态资源
├── package.json              # 项目配置
├── next.config.ts           # Next.js 配置
├── tailwind.config.ts       # Tailwind CSS 配置
└── tsconfig.json           # TypeScript 配置
```

## 主要功能

### 仪表板功能
- **电商仪表板**：包含销售指标、月度目标、销售图表、统计图表、最近订单和人口统计卡片
- **响应式设计**：完全响应式，支持移动端和桌面端
- **暗色模式**：内置暗色/亮色主题切换
- **可折叠侧边栏**：支持展开/收起和悬停展开

### 页面和组件
- **认证页面**：登录和注册页面
- **用户资料**：用户信息管理页面
- **日历**：FullCalendar 集成的日历功能
- **图表**：基于 ApexCharts 的线图和柱状图
- **表格**：基础表格和分页功能
- **表单**：丰富的表单元素和验证
- **UI 元素**：按钮、徽章、头像、图片、视频、模态框等

### 技术特性
- **Next.js 15**：使用最新的 App Router 和 React Server Components
- **React 19**：最新的 React 特性
- **TypeScript**：完整的类型安全
- **Tailwind CSS V4**：最新的实用优先 CSS 框架
- **ApexCharts**：强大的图表库
- **FullCalendar**：功能完整的日历组件
- **React DnD**：拖拽功能支持

## 组件说明

TailAdmin 是一个使用 Next.js 和 Tailwind CSS 构建基于 Web 的仪表板的预设计起点。模板包括：

- 复杂且可访问的侧边栏
- 数据可视化组件
- 个人资料管理和自定义 404 页面
- 表格和图表（线图和柱状图）
- 认证表单和输入元素
- 警告、下拉菜单、模态框、按钮等
- 暗色模式支持 🕶️

所有组件都使用 React 构建，并使用 Tailwind CSS 进行样式设置，便于自定义。

## 功能对比

### 免费版本
- 1 个独特仪表板
- 30+ 仪表板组件
- 50+ UI 元素
- 基础 Figma 设计文件
- 社区支持

### 专业版本
- 5 个独特仪表板：分析、电商、营销、CRM、股票（更多即将推出）
- 400+ 仪表板组件和 UI 元素
- 完整 Figma 设计文件
- 邮件支持

要了解更多专业版本功能和定价，请访问我们的[定价页面](https://tailadmin.com/pricing)。

## 更新日志

### 版本 2.0.2 - [2025年3月25日]

- 升级到 Next v15.2.3 以解决 [CVE-2025-29927](https://nextjs.org/blog/cve-2025-29927) 问题
- 包含 vectormap 包的覆盖配置以防止安装过程中的对等依赖错误
- 为支持 React 19，从 react-flatpickr 迁移到 flatpickr 包

### 版本 2.0.1 - [2025年2月27日]

#### 更新概述

- 升级到 Tailwind CSS v4 以获得更好的性能和效率
- 更新类使用以匹配最新的语法和功能
- 替换已弃用的类并优化样式

#### 下一步

- 运行 npm install 或 yarn install 更新依赖
- 检查任何样式更改或兼容性问题
- 如需要，请参考 Tailwind CSS v4 [迁移指南](https://tailwindcss.com/docs/upgrade-guide)
- 此更新使项目与最新的 Tailwind 改进保持同步 🚀

### v2.0.0（2025年2月）
专注于 Next.js 15 实现和全面重新设计的主要更新。

#### 主要改进
- 使用 Next.js 15 App Router 和 React Server Components 完全重新设计
- 使用 Next.js 优化的组件增强用户界面
- 改进响应性和可访问性
- 新功能包括可折叠侧边栏、聊天屏幕和日历
- 使用 Next.js App Router 和服务器操作重新设计认证
- 使用 ApexCharts for React 更新数据可视化

#### 破坏性更改

- 从 Next.js 14 迁移到 Next.js 15
- 图表组件现在使用 ApexCharts for React
- 认证流程更新为使用服务器操作和中间件

[在此版本中阅读更多](https://tailadmin.com/docs/update-logs/nextjs)。

## 开发指南

### 可用脚本

```bash
# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 启动生产服务器
npm start

# 运行代码检查
npm run lint
```

### 主要依赖

- **Next.js 15.2.3**：React 框架
- **React 19**：用户界面库
- **TypeScript 5**：类型安全
- **Tailwind CSS 4.0.0**：CSS 框架
- **ApexCharts 4.3.0**：图表库
- **FullCalendar 6.1.15**：日历组件
- **React DnD 16.0.1**：拖拽功能

## 许可证

TailAdmin Next.js 免费版本在 MIT 许可证下发布。

## 支持

如果您发现这个项目有帮助，请考虑在 GitHub 上给它一个星标。您的支持帮助我们继续开发和维护这个模板。

## 贡献

欢迎贡献！请查看我们的贡献指南以了解如何参与项目开发。

## 联系方式

- 网站：https://tailadmin.com
- 文档：https://tailadmin.com/docs
- GitHub：https://github.com/TailAdmin/free-nextjs-admin-dashboard
