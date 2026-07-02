export function tokenMatch(query: string, text: string): boolean {
  if (!query.trim()) return false;
  const q = query.toLowerCase().trim();
  const t = text.toLowerCase();

  if (t.includes(q)) return true;

  const tokens = q.split(/\s+/).filter(Boolean);
  if (tokens.length === 1) return t.includes(q);

  return tokens.every((token) => {
    let pos = 0;
    while (pos < t.length) {
      const found = t.indexOf(token, pos);
      if (found === -1) return false;
      if (found === 0 || !/[a-z0-9]/.test(t[found - 1])) return true;
      pos = found + 1;
    }
    return false;
  });
}

export function highlightText(text: string, query: string): { segments: { text: string; highlighted: boolean }[] } {
  if (!query.trim()) return { segments: [{ text, highlighted: false }] };
  const q = query.toLowerCase().trim();
  const t = text.toLowerCase();

  const ranges: [number, number][] = [];

  const idx = t.indexOf(q);
  if (idx !== -1) {
    ranges.push([idx, idx + q.length]);
  } else {
    const tokens = q.split(/\s+/).filter(Boolean);
    for (const token of tokens) {
      let pos = 0;
      while (pos < t.length) {
        const found = t.indexOf(token, pos);
        if (found === -1) break;
        if (found === 0 || !/[a-z0-9]/.test(t[found - 1])) {
          ranges.push([found, found + token.length]);
          break;
        }
        pos = found + 1;
      }
    }
  }

  if (ranges.length === 0) return { segments: [{ text, highlighted: false }] };

  ranges.sort((a, b) => a[0] - b[0]);
  const segments: { text: string; highlighted: boolean }[] = [];
  let last = 0;
  for (const [start, end] of ranges) {
    if (start > last) segments.push({ text: text.slice(last, start), highlighted: false });
    segments.push({ text: text.slice(start, end), highlighted: true });
    last = end;
  }
  if (last < text.length) segments.push({ text: text.slice(last), highlighted: false });

  return { segments };
}
