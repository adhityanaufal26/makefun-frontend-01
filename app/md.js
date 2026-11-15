// Minimal markdown-ish to safe HTML for API description strings.
// Escapes HTML first, then converts ## headings, "- " lists, **bold**,
// and blank-line-separated blocks. No external references.
export function md(src) {
  const esc = s => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const inline = s => esc(s).replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  const lines = String(src || "").replace(/\r\n?/g, "\n").split("\n");
  let out = "", list = false;
  const closeList = () => { if (list) { out += "</ul>"; list = false; } };
  for (const line of lines) {
    if (/^##\s+/.test(line)) { closeList(); out += "<h3>" + inline(line.replace(/^##\s+/, "")) + "</h3>"; }
    else if (/^-\s+/.test(line)) { if (!list) { out += "<ul>"; list = true; } out += "<li>" + inline(line.replace(/^-\s+/, "")) + "</li>"; }
    else if (!line.trim()) { closeList(); }
    else { closeList(); out += "<p>" + inline(line) + "</p>"; }
  }
  closeList();
  return out;
}
