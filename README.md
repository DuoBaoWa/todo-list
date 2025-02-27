# (｡♥‿♥｡) Todo List 应用 🌸

一个现代化的待办事项管理应用，集成了番茄钟工作法、数据统计和任务归档等功能，帮助您高效管理日常任务，提升工作效率。(◕‿◕✿)

## (づ｡◕‿‿◕｡)づ 功能特点

### ✧*｡٩(ˊᗜˋ*)و✧*｡ 核心功能
- ✨ 任务创建与管理
  - 🎯 支持任务标题
  - 🔄 灵活的任务编辑和删除功能

### (◍•ᴗ•◍) 任务组织
- 📅 任务分类与标签
  - 🏷️ 自定义任务分类（工作、学习、生活等）
  - 🎨 多标签管理，快速筛选任务
  - 🔍 支持按日期、优先级、状态等多维度排序

### (｡◕‿◕｡) 效率工具
- ⏰ 番茄钟工作法
  - 🍅 25分钟专注工作，5分钟休息的循环
  - ⚙️ 自定义工作和休息时长
  - 📝 任务完成后自动记录工作时长

### ٩(◕‿◕｡)۶ 数据统计
- 📊 任务完成度分析
  - 📈 每日/周/月任务完成统计
  - 📉 工作时长数据可视化
  - 📋 导出统计报表

### (◠‿◠✿) 用户体验
- 🔔 智能提醒系统
  - ⏱️ 任务截止提醒
  - 🎀 自定义提醒时间
  - 💫 桌面通知支持
- 🌓 个性化界面
  - 🎭 明暗主题切换
  - 📱 响应式设计，完美适配移动端
  - ⌨️ 支持快捷键操作
  - 🎵 音频自定义
    - 🔊 工作和休息时间提示音设置
    - 🎶 自定义上传提示音乐
    - 🔇 声音和通知开关控制

## (ﾉ◕ヮ◕)ﾉ*:･ﾟ✧ 技术栈

### 🛠️ 前端框架
- ⚛️ React 18.2.0
  - 🎣 React Hooks
  - 🔄 Context API 状态管理
- 🚀 Vite 4.4.0 构建工具

### 🎨 UI/样式
- 🌈 TailwindCSS 3.3.3
  - 🎯 @headlessui/react 组件库
  - 🎪 @heroicons/react 图标库
- 🎠 DaisyUI 组件库

### 📦 状态管理

- 🔮 Zustand 状态管理
- 💾 LocalStorage 数据持久化

### (◕ᴗ◕✿) 数据存储机制

应用使用浏览器的 LocalStorage 来存储数据，这是一种本地存储机制。每个用户在自己的浏览器中访问应用时，都会使用各自浏览器的独立存储空间，数据是完全隔离的。即使多个用户同时访问同一个 GitHub Pages 上的应用，他们的待办事项数据也是相互独立的，不会相互影响。(｡•̀ᴗ-)✧

### 🛠️ 工具库
- 📅 date-fns 日期处理
- 🎯 react-beautiful-dnd 拖拽功能
- 📊 chart.js 数据可视化

## (◍•ᴗ•◍)ゝ 环境要求

- 📦 Node.js >= 16.0.0
- 🎁 npm >= 7.0.0

## ٩(๑❛ᴗ❛๑)۶ 快速开始

### 1. 克隆项目 🚀

```bash
git clone https://github.com/your-username/todo-list.git
cd todo-list
```

### 2. 安装依赖 ⚡

```bash
# 使用 npm
npm install

# 或使用 yarn
yarn install

# 或使用 pnpm
pnpm install
```

### 3. 开发环境运行 🌟

```bash
# 启动开发服务器
npm run dev
```
访问 http://localhost:5173 查看应用 ✨

### 4. 生产环境构建 🎉

```bash
# 构建生产环境版本
npm run build
```

## (ﾉ>ω<)ﾉ 自动部署

项目使用GitHub Actions实现自动化部署到GitHub Pages。每当代码推送到main分支时，会自动触发部署流程。

### 🎡 部署工作流配置

项目的GitHub Actions工作流配置（`.github/workflows/deploy.yml`）包含以下主要步骤：

1. **🎯 触发条件**
   - 监听main分支的推送事件

2. **🛠️ 环境配置**
   - 使用ubuntu-latest作为运行环境
   - 配置仓库写入权限

3. **🏗️ 构建步骤**
   - 检出代码仓库
   - 配置Git用户信息
   - 设置Node.js 18环境
   - 安装项目依赖
   - 构建项目

4. **🚀 部署步骤**
   - 使用peaceiris/actions-gh-pages@v3部署到GitHub Pages
   - 自动将构建产物（dist目录）部署到gh-pages分支

```bash
# 构建生产版本
npm run build

# 预览生产构建
npm run preview
```

## (◕‿◕✿) 使用指南

### 1. 任务管理 ✨
- 创建任务
  - 🎯 点击「+」按钮创建
  - 📝 填写任务标题
  - 🏷️ 选择任务分类和标签

- 编辑任务
  - ✏️ 点击任务卡片进入编辑模式
  - 💾 修改任务信息后点击保存

### 2. 番茄钟使用 🍅
- 选择要专注的任务
- 点击开始按钮启动计时器
- 专注时段结束后自动进入休息时间
- 完成后记录工作时长

### 3. 数据统计 📊
- 在统计面板查看任务完成情况
- 选择时间范围查看详细报表
- 导出数据用于进一步分析

## (｡◕‿◕｡) 项目结构

```
todo-list/
├── src/
│   ├── components/        # 组件目录
│   │   ├── Analytics.jsx  # 数据分析组件
│   │   ├── Pomodoro.jsx   # 番茄钟组件
│   │   ├── ThemeSettings.jsx # 主题设置组件
│   │   ├── TodoForm.jsx   # 任务表单组件
│   │   └── TodoList.jsx   # 任务列表组件
│   ├── utils/            # 工具函数
│   │   └── audioManager.js # 音频管理工具
│   ├── App.jsx           # 主应用组件
│   └── main.jsx          # 应用入口
├── public/            # 静态资源
└── package.json       # 项目配置
```

## (ﾉ◕ヮ◕)ﾉ*:･ﾟ✧ 贡献指南

1. Fork 本仓库 🍴
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`) 🌟
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`) ✨
4. 推送到分支 (`git push origin feature/AmazingFeature`) 🚀
5. 提交 Pull Request 🎉

## (◠‿◠✿) 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情 📜

## (｡◕‿◕｡) 联系方式

如有任何问题或建议，欢迎提交 Issue 或 Pull Request。💌

---

感谢使用 Todo List 应用！(づ｡◕‿‿◕｡)づ ✨