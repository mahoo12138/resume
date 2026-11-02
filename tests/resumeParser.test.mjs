import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { parseResumeMarkdown } from '../utils/parseResumeMarkdown.ts'

const fixture = [
  '---',
  'name: 测试候选人',
  'job: 前端开发工程师',
  'experience: 约 4 年开发经验',
  'specialty: 企业级 SaaS / 物联网平台',
  'education: 本科',
  'Graduated: 2022',
  'phone: 15xxxxxxx14',
  'blog: https://example.com/resume',
  '---',
  '',
  '## 职业概述',
  '',
  '面向企业业务的前端与跨端开发。',
  '',
  '## 工作经验',
  '',
  '### 当前公司',
  '',
  '```',
  '任职时间: 2026.05 ~ 至今',
  '职位: 全栈工程师（偏前端）',
  '```',
  '',
  '#### 车辆管理平台',
  '',
  '项目职责。',
  '',
  '##### 移动业务（Hybrid H5）',
  '',
  '- 实现多语言支持。',
  '',
  '##### Java 后端',
  '',
  '- 优化消息处理。',
  '',
  '### 前公司',
  '',
  '+ 任职时间: 2022.07 ~ 2026.03',
  '+ 职位: 前端开发工程师',
  '',
  '#### 物流系统',
  '',
  '##### 司机端',
  '',
  '- 配置化页面。',
  '',
  '## 个人项目',
  '',
  '### 协同项目',
  '',
  '+ 仓库: [github.com/example/docs](https://github.com/example/docs)',
  '+ 角色: 个人项目开发与维护',
  '',
  '多人编辑。',
].join('\n')

for (const [name, content] of [['LF', fixture], ['CRLF', fixture.replaceAll('\n', '\r\n')]]) {
  test(`parse career metadata, nested experiences and project links (${name})`, () => {
    const result = parseResumeMarkdown(content)
    assert.equal(result.information.experience, '约 4 年开发经验')
    assert.equal(result.information.specialty, '企业级 SaaS / 物联网平台')
    assert.equal(result.information.blog, 'https://example.com/resume')
    assert.equal(result.information.phone, '15xxxxxxx14')
    assert.equal(result.information.education_desc, '2022届')
    assert.equal(result.sections[0].kind, 'rich-text')
    const work = result.sections.find(section => section.kind === 'grouped-entries')
    assert.equal(work.groups.length, 2)
    assert.equal(work.groups[0].meta.length, 2)
    assert.match(work.groups[0].meta[1].html, /全栈工程师/)
    assert.equal(work.groups[0].entries.length, 1)
    assert.match(work.groups[0].entries[0].content, /<h5>移动业务（Hybrid H5）<\/h5>/)
    assert.match(work.groups[0].entries[0].content, /<h5>Java 后端<\/h5>/)
    assert.match(work.groups[1].meta[0].html, /2022.07 ~ 2026.03/)
    const projects = result.sections.find(section => section.key === 'personal-projects')
    assert.equal(projects.entries.length, 1)
    assert.equal(projects.entries[0].meta.length, 2)
    assert.match(projects.entries[0].meta[0].html, /href="https:\/\/github.com\/example\/docs"/)
    assert.match(projects.entries[0].meta[0].html, />github.com\/example\/docs<\/a>/)
  })
}

test('older content without optional career fields stays compatible', () => {
  const result = parseResumeMarkdown('---\nname: 测试\n---\n\n## 职业概述\n\n正文。')
  assert.equal(result.information.experience, '')
  assert.equal(result.information.specialty, '')
  assert.equal(result.information.education_desc, '')
  assert.match(result.sections[0].html, /正文/)
})

test('raw HTML in rich text is escaped', () => {
  const result = parseResumeMarkdown('## 职业概述\n\n<script>alert(1)</script>')
  assert.doesNotMatch(result.sections[0].html, /<script>/)
  assert.match(result.sections[0].html, /&lt;script&gt;/)
})

test('renders ++text++ as an underline, nested with other inline marks', () => {
  const result = parseResumeMarkdown('## 职业概述\n\n交付 ++7,600 余行代码++，含 ++**嵌套**++ 与 `++原样++`。')
  const html = result.sections[0].html
  assert.match(html, /<u>7,600 余行代码<\/u>/)
  assert.match(html, /<u><strong>嵌套<\/strong><\/u>/)
  assert.match(html, /<code>\+\+原样\+\+<\/code>/)
})

test('unpaired, empty and raw underline tags stay text', () => {
  for (const source of ['未闭合 ++文字', '++ ++', '<u>标签</u>']) {
    const result = parseResumeMarkdown(`## 职业概述\n\n${source}`)
    assert.doesNotMatch(result.sections[0].html, /<u>/)
  }
})

test('comments hide whole entries, inline notes and CRLF sources', () => {
  const body = [
    '### 在线项目',
    '',
    '+ 仓库: https://example.com/a',
    '',
    '正文。',
    '',
    '<!-- ### 草稿项目',
    '',
    '+ 仓库: https://example.com/draft',
    '',
    '未上线。 -->',
    '',
    '### 下一个项目',
    '',
    '下一段。',
  ].join('\n')
  const source = `## 职业概述\n\n交付 7,600 行<!-- 内部备注 -->代码。\n\n## 个人项目\n\n${body}`

  for (const [name, content] of [['LF', source], ['CRLF', source.replaceAll('\n', '\r\n')]]) {
    const result = parseResumeMarkdown(content)
    assert.match(result.sections[0].html, /交付 7,600 行代码。/)
    const projects = result.sections[1]
    assert.deepEqual(projects.entries.map(entry => entry.title), ['在线项目', '下一个项目'], name)
    assert.doesNotMatch(JSON.stringify(result), /草稿|未上线|example\.com\/draft|!--/)
  }
})

test('comment markers stay literal inside fences and when left open', () => {
  const fenced = parseResumeMarkdown('## 职业概述\n\n```\n<!-- 示例 -->\n```')
  assert.match(fenced.sections[0].html, /&lt;!-- 示例 --&gt;/)

  const openComment = parseResumeMarkdown('## 职业概述\n\n正文 <!-- 忘了闭合')
  assert.match(openComment.sections[0].html, /正文/)
  assert.match(openComment.sections[0].html, /&lt;!--/)
})

test('a link before the colon keeps the whole meta line as prose', () => {
  const source = [
    '## 个人项目',
    '',
    '### 其他项目',
    '',
    '+ 仓库: [mahoo12138/tynel](https://github.com/mahoo12138/tynel)',
    '+ [Numen](https://github.com/mahoo12138/numen)：Cordis 原生运行时',
    '+ 角色: 独立开发',
  ].join('\n')
  const [entry] = parseResumeMarkdown(source).sections[0].entries
  assert.equal(entry.meta.length, 3)
  assert.equal(entry.meta[0].html, '<a href="https://github.com/mahoo12138/tynel">mahoo12138/tynel</a>')
  assert.match(entry.meta[1].html, /^<a href="https:\/\/github\.com\/mahoo12138\/numen">Numen<\/a>：Cordis 原生运行时$/)
  assert.equal(entry.meta[2].html, '独立开发')
})

test('current resume keeps two employers, three visible projects and a redacted contact', () => {
  const content = readFileSync(new URL('../RESUME.md', import.meta.url), 'utf8')
  const result = parseResumeMarkdown(content)
  assert.match(result.information.phone, /x/)
  const work = result.sections.find(section => section.kind === 'grouped-entries')
  assert.equal(work.groups.length, 2)
  assert.match(work.groups[0].entries[0].content, /移动端业务 App/)
  assert.match(work.groups[0].entries[1].content, /多语言支持/)
  assert.match(work.groups[0].entries[1].content, /减少服务器崩溃/)
  const projects = result.sections.find(section => section.key === 'personal-projects')
  assert.equal(projects.entries.length, 3)
  assert.equal(projects.entries[1].title, 'Tynel — TypeScript 原生编译器')
  assert.deepEqual(projects.entries.map(entry => entry.title).filter(title => /Madoc|Pontis/.test(title)), [])
  assert.doesNotMatch(JSON.stringify(result), /!--|&lt;!--|--&gt;/)
  const summary = result.sections.find(section => section.title === '职业概述')
  assert.match(summary.html, /个人项目/)
  assert.doesNotMatch(summary.html, /Madoc|Pontis|Cormi|Tynel/)
})
