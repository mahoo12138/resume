# Resume

这个项目使用 Nuxt 渲染静态简历页面，简历内容直接来自根目录的 `RESUME.md`。

## 内容来源

- 顶部 frontmatter 用来维护基础信息。
- 正文使用 `##` 作为一级 section，解析器会按 section 标题匹配对应规则。

## Markdown 规则

### Frontmatter

支持的常用字段：

```yaml
---
name: 黄昌河
nickname: Mahoo12138
job: 前端开发工程师
location: 上海 / 广州 / 深圳
phone: 15xxxxxxx14
email: example@example.com
blog: https://example.com
github: Mahoo12138
updated: 2025-04-12
---
```

- `updated` 为可选字段，建议使用 `YYYY-MM-DD` 或 ISO 日期格式。
- 如果未提供 `updated`，页面不会显示“最后更新时间”。

### 已内置的 section 规则

#### `## 个人技能`

按富文本解析，直接把整段 Markdown 渲染成 HTML。

```md
## 个人技能

- 熟练掌握 Vue / React / TypeScript
- 熟悉工程化、性能优化和组件设计
```

#### `## 工作经验`

按“分组 + 条目”解析：

- `###` 表示公司 / 团队 / 任职单位
- 紧跟在分组开头的 `+` 行会被解析为分组元信息
- `####` 表示该公司下的业务系统
- 紧跟在条目开头的 `+` 行会被解析为条目元信息
- `#####` 表示系统下的各端工程（如司机端、PC 管理端），其后的正文或列表描述该端职责

```md
## 工作经验

### 上海汉得技术股份有限公司

+ 2022.07 ~ 至今

#### 马达物流云

+ 协作开发

物流供应链业务系统，包含管理端及司机端。

##### PC 管理端

- 负责物流跟踪、页面配置和流程引擎模块开发。

##### 司机端

- 负责移动端业务页面开发。
```

#### `## 项目经历` / `## 开源作品`

按“条目列表”解析：

- `###` 表示单个项目 / 作品标题
- 紧跟在条目开头的 `+` 行会被解析为元信息
- 后续正文按 Markdown 渲染

```md
## 开源作品

### resume-parser

+ Nuxt / TypeScript
+ 独立开发

一个将结构化 Markdown 简历转换为页面数据的解析器。
```

### 自定义 section

- 未在解析器内置规则中的 `##` section，会默认按富文本处理。
- 如果你后面要新增一种结构化 section，只需要在解析器规则表里增加一条规则即可。

## 开发命令

安装依赖：

```bash
pnpm install
```

启动开发环境：

```bash
pnpm dev
```

构建生产版本：

```bash
pnpm build
```

预览生产构建：

```bash
pnpm preview
```
