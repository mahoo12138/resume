import MarkdownIt from "markdown-it";

const markdown = new MarkdownIt({
  html: false,
  breaks: true,
  linkify: true,
});

const UNDERLINE_MARKER = "++";

// `html: false` keeps raw HTML escaped, so underlines get their own marker
// instead of `<u>` tags in the source.
const registerUnderlineRule = (md: MarkdownIt) => {
  md.inline.ruler.after("emphasis", "underline", (state, silent) => {
    const contentStart = state.pos + UNDERLINE_MARKER.length;

    if (state.src.slice(state.pos, contentStart) !== UNDERLINE_MARKER) {
      return false;
    }

    const contentEnd = state.src.indexOf(UNDERLINE_MARKER, contentStart);

    if (contentEnd === -1) {
      return false;
    }

    const content = state.src.slice(contentStart, contentEnd);

    if (!content.trim() || content.includes("\n")) {
      return false;
    }

    if (!silent) {
      state.pushPending();
      state.push("underline_open", "u", 1);

      const children: MarkdownIt.Token[] = [];
      md.inline.parse(content, md, state.env, children);

      for (const token of children) {
        token.level += state.level;
        state.tokens.push(token);
      }

      state.push("underline_close", "u", -1);
    }

    state.pos = contentEnd + UNDERLINE_MARKER.length;
    return true;
  });
};

registerUnderlineRule(markdown);

type ParsedHeadingBlock = {
  title: string;
  body: string;
  startIndex: number;
};

type ResumeSectionRule = {
  key: string;
  kind: ResumeSection["kind"];
  title: string;
};

const SECTION_RULES: Record<string, ResumeSectionRule> = {
  "个人技能": {
    key: "skills",
    kind: "rich-text",
    title: "个人技能",
  },
  "工作经验": {
    key: "work-experience",
    kind: "grouped-entries",
    title: "工作经验",
  },
  "项目经历": {
    key: "project-experience",
    kind: "entries",
    title: "项目经历",
  },
  "个人项目": {
    key: "personal-projects",
    kind: "entries",
    title: "个人项目",
  },
  "开源作品": {
    key: "open-source",
    kind: "entries",
    title: "开源作品",
  },
};

const normalizeLineEndings = (source: string) => source.replace(/\r\n?/g, "\n");

const COMMENT_OPEN = "<!--";
const COMMENT_CLOSE = "-->";
const FENCE_LINE = /^(\s*)(`{3,}|~{3,})(.*)$/;

// Comments are stripped before any structural parsing so a commented-out
// `### 标题` never becomes an entry. Only fully paired comments are removed —
// an unterminated `<!--` keeps the rest of the file visible, because silently
// dropping resume content is the worse failure mode.
const stripHtmlComments = (source: string) => {
  const lines = source.split("\n");
  const result: string[] = [];
  let openFence = "";
  let openCommentLine = -1;
  let inComment = false;

  for (const [lineIndex, line] of lines.entries()) {
    if (openFence) {
      const closing = line.match(FENCE_LINE);
      const isClosingFence =
        !!closing &&
        closing[2][0] === openFence[0] &&
        closing[2].length >= openFence.length &&
        !closing[3].trim();

      if (isClosingFence) {
        openFence = "";
      }

      result.push(line);
      continue;
    }

    const openingFence = inComment ? null : line.match(FENCE_LINE);

    if (openingFence) {
      openFence = openingFence[2];
      result.push(line);
      continue;
    }

    let remaining = line;
    let stripped = "";

    while (remaining) {
      if (inComment) {
        const closeIndex = remaining.indexOf(COMMENT_CLOSE);

        if (closeIndex === -1) {
          break;
        }

        remaining = remaining.slice(closeIndex + COMMENT_CLOSE.length);
        inComment = false;
        openCommentLine = -1;
        continue;
      }

      const openIndex = remaining.indexOf(COMMENT_OPEN);

      if (openIndex === -1) {
        stripped += remaining;
        break;
      }

      stripped += remaining.slice(0, openIndex);
      remaining = remaining.slice(openIndex + COMMENT_OPEN.length);
      inComment = true;
      openCommentLine = lineIndex;
    }

    result.push(stripped);
  }

  if (inComment && openCommentLine !== -1) {
    for (let i = openCommentLine; i < lines.length; i += 1) {
      result[i] = lines[i];
    }
  }

  return result.join("\n");
};

const renderMarkdown = (source: string) => {
  const trimmed = source.trim();

  if (!trimmed) {
    return "";
  }

  return markdown.render(trimmed);
};

const renderInlineMarkdown = (source: string) => {
  const trimmed = source.trim();

  if (!trimmed) {
    return "";
  }

  return markdown.renderInline(trimmed);
};

const MARKDOWN_LINK = /\[[^\]]*\]\([^)]*\)/;

// `键: 值` 只在链接之外的冒号处切分 —— `[项目](https://…)` 里的冒号属于 URL scheme。
const findMetaSeparator = (line: string) => {
  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];

    if ((char === ":" || char === "：") && line.slice(index + 1, index + 3) !== "//") {
      return index;
    }
  }

  return -1;
};

const renderMetaLine = (source: string) => {
  const trimmed = source.trim();
  const separatorIndex = findMetaSeparator(trimmed);
  const key = separatorIndex === -1 ? "" : trimmed.slice(0, separatorIndex).trim();
  const value = separatorIndex === -1 ? "" : trimmed.slice(separatorIndex + 1).trim();

  // 键里带链接说明整行是叙述（`[项目](url)：说明`），按键值切分会连链接一起丢掉。
  if (!key || !value || MARKDOWN_LINK.test(key)) {
    return renderInlineMarkdown(trimmed);
  }

  return renderInlineMarkdown(value);
};

const getFrontmatterString = (value: unknown, fallback = "") => {
  if (typeof value === "string") {
    return value.trim();
  }

  if (typeof value === "number") {
    return String(value);
  }

  return fallback;
};

const parseFrontmatter = (source: string) => {
  const frontmatterMatch = source.match(/^---\n([\s\S]*?)\n---\n?/);

  if (!frontmatterMatch) {
    return {
      data: {} as Record<string, string>,
      content: source,
    };
  }

  const data = frontmatterMatch[1]
    .split("\n")
    .reduce<Record<string, string>>((result, line) => {
      const separatorIndex = line.indexOf(":");

      if (separatorIndex === -1) {
        return result;
      }

      const key = line.slice(0, separatorIndex).trim();
      const value = line.slice(separatorIndex + 1).trim();

      if (key) {
        result[key] = value;
      }

      return result;
    }, {});

  return {
    data,
    content: source.slice(frontmatterMatch[0].length),
  };
};

const createSectionKey = (title: string) => {
  return title.trim().replace(/\s+/g, "-").replace(/[\\/:*?"<>|]/g, "-");
};

const getSectionRule = (title: string): ResumeSectionRule => {
  return SECTION_RULES[title] || {
    key: createSectionKey(title),
    kind: "rich-text",
    title,
  };
};

const parseHeadingBlocks = (source: string, level: 2 | 3 | 4): ParsedHeadingBlock[] => {
  const heading = "#".repeat(level);
  const pattern = new RegExp(`^${heading}\\s+(.+)$`, "gm");
  const matches = Array.from(source.matchAll(pattern));

  return matches.map((match, index) => {
    const startIndex = match.index ?? 0;
    const contentStart = startIndex + match[0].length;
    const contentEnd = matches[index + 1]?.index ?? source.length;

    return {
      title: match[1].trim(),
      body: source.slice(contentStart, contentEnd).trim(),
      startIndex,
    };
  });
};

const splitParagraphs = (source: string) => {
  return source
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
};

const extractMetaAndBody = (source: string) => {
  const meta: ResumeMetaItem[] = [];
  let remaining = source.trimStart();

  while (remaining) {
    const codeBlockMatch = remaining.match(/^```[^\n]*\n([\s\S]*?)\n```\s*/);

    if (codeBlockMatch) {
      const metaLines = codeBlockMatch[1]
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean);

      if (!metaLines.length || !metaLines.every((line) => /[:：]/.test(line))) {
        break;
      }

      meta.push(
        ...metaLines.map((line) => ({
          html: renderMetaLine(line),
        })),
      );
      remaining = remaining.slice(codeBlockMatch[0].length).trimStart();
      continue;
    }

    const plusLineMatch = remaining.match(/^\+\s+(.+?)\s*(?:\n|$)/);

    if (!plusLineMatch) {
      break;
    }

    meta.push({
      html: renderMetaLine(plusLineMatch[1]),
    });
    remaining = remaining.slice(plusLineMatch[0].length).trimStart();
  }

  return {
    meta,
    body: remaining.trim(),
  };
};

const parseEntryBlock = (block: ParsedHeadingBlock): ResumeEntry => {
  const { meta, body } = extractMetaAndBody(block.body);

  return {
    title: block.title,
    meta,
    content: renderMarkdown(body),
  };
};

const parseRichTextSection = (rule: ResumeSectionRule, source: string): ResumeRichTextSection => {
  return {
    key: rule.key,
    title: rule.title,
    kind: "rich-text",
    html: renderMarkdown(source),
  };
};

const parseEntryListSection = (rule: ResumeSectionRule, source: string): ResumeEntryListSection | ResumeRichTextSection => {
  const entries = parseHeadingBlocks(source, 3);

  if (!entries.length) {
    return parseRichTextSection(rule, source);
  }

  return {
    key: rule.key,
    title: rule.title,
    kind: "entries",
    entries: entries.map(parseEntryBlock),
  };
};

const parseGroupedEntriesSection = (rule: ResumeSectionRule, source: string): ResumeGroupedEntriesSection | ResumeRichTextSection => {
  const groups = parseHeadingBlocks(source, 3);

  if (!groups.length) {
    return parseRichTextSection(rule, source);
  }

  return {
    key: rule.key,
    title: rule.title,
    kind: "grouped-entries",
    groups: groups.map((group) => {
      const entries = parseHeadingBlocks(group.body, 4);
      const groupPrelude = entries.length ? group.body.slice(0, entries[0].startIndex).trim() : group.body;
      const { meta } = extractMetaAndBody(groupPrelude);

      return {
        title: group.title,
        meta,
        entries: entries.map(parseEntryBlock),
      };
    }),
  };
};

const parseSections = (content: string): ResumeSection[] => {
  return parseHeadingBlocks(content, 2).map((sectionBlock) => {
    const rule = getSectionRule(sectionBlock.title);

    switch (rule.kind) {
      case "entries":
        return parseEntryListSection(rule, sectionBlock.body);
      case "grouped-entries":
        return parseGroupedEntriesSection(rule, sectionBlock.body);
      default:
        return parseRichTextSection(rule, sectionBlock.body);
    }
  });
};

export const parseResumeMarkdown = (source: string): ResumeData => {
  const normalizedSource = stripHtmlComments(normalizeLineEndings(source));
  const { data, content } = parseFrontmatter(normalizedSource);
  const dob = getFrontmatterString(data.dob);
  const graduated = getFrontmatterString(data.Graduated);
  const updatedAt = getFrontmatterString(data.updated || data.lastUpdated || data.last_updated);

  return {
    information: {
      name: getFrontmatterString(data.name),
      nickname: getFrontmatterString(data.nickname),
      job: getFrontmatterString(data.job),
      experience: getFrontmatterString(data.experience),
      specialty: getFrontmatterString(data.specialty),
      location: getFrontmatterString(data.location),
      gender: getFrontmatterString(data.gender),
      DOB: dob,
      education: getFrontmatterString(data.education),
      education_desc: graduated ? `${graduated}届` : "",
      college: getFrontmatterString(data.college),
      major: getFrontmatterString(data.major),
      phone: getFrontmatterString(data.phone),
      email: getFrontmatterString(data.email),
      blog: getFrontmatterString(data.blog),
      github: getFrontmatterString(data.github),
    },
    sections: parseSections(content),
    lastUpdated: updatedAt,
  };
};