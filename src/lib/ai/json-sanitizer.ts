/**
 * Xử lý và trích xuất dữ liệu bài viết blog từ LLM
 * Hỗ trợ định dạng phân tách (delimited format) để không gặp lỗi thoát chuỗi JSON hay quá tải token.
 */
export function sanitizeLLMJsonString(str: string): string {
  let inString = false;
  let escaped = false;
  let out = '';

  for (let i = 0; i < str.length; i++) {
    const c = str[i];
    if (c === '\\' && inString) {
      escaped = !escaped;
      out += c;
    } else if (c === '"' && !escaped) {
      inString = !inString;
      out += c;
    } else if (inString) {
      escaped = false;
      if (c === '\n') out += '\\n';
      else if (c === '\r') out += '\\r';
      else if (c === '\t') out += '\\t';
      else if (c.charCodeAt(0) < 32) out += ' ';
      else out += c;
    } else {
      escaped = false;
      out += c;
    }
  }
  return out;
}

export function parseLLMJson<T = unknown>(raw: string): T {
  let clean = raw.trim();
  clean = clean
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();

  const firstBrace = clean.indexOf('{');
  const lastBrace = clean.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    clean = clean.substring(firstBrace, lastBrace + 1);
  }

  try {
    return JSON.parse(clean) as T;
  } catch {
    const sanitized = sanitizeLLMJsonString(clean);
    return JSON.parse(sanitized) as T;
  }
}

export function parseStructuredBlogOutput(raw: string): Record<string, unknown> {
  const firstBrace = raw.indexOf('{');
  if (firstBrace !== -1) {
    let depth = 0;
    let endIdx = -1;
    for (let i = firstBrace; i < raw.length; i++) {
      if (raw[i] === '{') depth++;
      else if (raw[i] === '}') {
        depth--;
        if (depth === 0) {
          endIdx = i;
          break;
        }
      }
    }

    if (endIdx !== -1) {
      const metaStr = raw.substring(firstBrace, endIdx + 1);
      let metadata: Record<string, unknown> = {};
      try {
        metadata = JSON.parse(metaStr);
      } catch {
        metadata = parseLLMJson<Record<string, unknown>>(metaStr);
      }

      const after = raw.substring(endIdx + 1);
      const content = after
        .replace(/^[\s\r\n\-\*]*(METADATA|CONTENT)?[\s\r\n\-\*]*/i, '')
        .replace(/---CONTENT---/i, '')
        .replace(/\*\*CONTENT---/i, '')
        .replace(/```$/g, '')
        .trim();

      if (content) {
        return { ...metadata, content };
      }

      if (metadata.content) {
        return metadata;
      }
    }
  }

  return parseLLMJson<Record<string, unknown>>(raw);
}
