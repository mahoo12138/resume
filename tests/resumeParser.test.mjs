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

test('current resume preserves two employers, four projects and a redacted contact', () => {
  const content = readFileSync(new URL('../RESUME.md', import.meta.url), 'utf8')
  const result = parseResumeMarkdown(content)
  assert.match(result.information.phone, /x/)
  const work = result.sections.find(section => section.kind === 'grouped-entries')
  assert.equal(work.groups.length, 2)
  assert.match(work.groups[0].entries[0].content, /Hybrid H5/)
  assert.match(work.groups[0].entries[0].content, /多语言支持/)
  assert.match(work.groups[0].entries[0].content, /减少服务器崩溃/)
  const projects = result.sections.find(section => section.key === 'personal-projects')
  assert.equal(projects.entries.length, 4)
  assert.match(projects.entries[1].title, /Tynel/)
  const summary = result.sections.find(section => section.title === '职业概述')
  assert.match(summary.html, /个人项目/)
  assert.doesNotMatch(summary.html, /Madoc|Pontis|Cormi|Tynel/)
})
