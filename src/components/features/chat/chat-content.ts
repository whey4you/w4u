import remend from 'remend';

/** Extract UI markers before Markdown parsing; incomplete markers stay hidden while streaming. */
export function prepareChatContent(content: string, isStreaming = false) {
  const productIds: string[] = [];
  const suggestions: string[] = [];
  let text = content
    .replace(/\[GỢI_Ý:\s*([^\]]+)\]/g, (_, query: string) => {
      suggestions.push(query.trim());
      return '';
    })
    .replace(/(?:\*\*)?\[PRODUCT_CARD:([a-zA-Z0-9_-]+)\](?:\*\*)?/g, (_, id: string) => {
      productIds.push(id.trim());
      return '';
    });

  if (isStreaming) {
    text = hideIncompleteMarker(text);
    // Hold an unfinished table row until it can be rendered as cells.
    text = text.replace(/(?:^|\n)\s*\|[^\n]*$/, '');
    text = remend(text, { katex: false });
    text = text.replace(/(?:^|\n)\s*(?:#{1,6}|\*{1,3})\s*$/, '');
  }

  return { text: text.trim(), productIds: [...new Set(productIds)], suggestions };
}

function hideIncompleteMarker(text: string): string {
  const start = text.lastIndexOf('[');
  if (start < 0 || text.slice(start).includes(']')) return text;
  const tail = text.slice(start + 1);
  const markers = ['PRODUCT_CARD:', 'GỢI_Ý:'];
  const isMarker = markers.some((marker) => marker.startsWith(tail) || tail.startsWith(marker));
  return isMarker ? text.slice(0, start).replace(/\*{1,2}$/, '') : text;
}
