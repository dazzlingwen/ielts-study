// 通用工具：日期、ID、文件下载。无框架依赖，可在任意环境复用。

/** 本地时区日期键，如 2026-10-26 */
export function dateKey(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** n 天后的日期键 */
export function offsetDate(days, from = new Date()) {
  const d = new Date(from);
  d.setDate(d.getDate() + days);
  return dateKey(d);
}

export function uid() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

/** 触发浏览器下载 */
export function download(filename, content, type = "text/plain;charset=utf-8") {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

/** 英文文本词数统计（与写作模块口径一致） */
export function countWords(text) {
  return (text.trim().match(/[A-Za-z0-9]+(?:[’'-][A-Za-z0-9]+)*/g) || []).length;
}

/** 雅思总分：四项算术平均后按 0.5 取整（.25 进为 .5，.75 进为下一整分） */
export function overallBand(scores) {
  const avg = scores.reduce((s, n) => s + Number(n), 0) / 4;
  return Math.round(avg * 2) / 2;
}

/** 校验雅思单项分数输入：0–9 之间且以 0.5 为档 */
export function validBandInput(value) {
  const n = Number(value);
  return Number.isFinite(n) && n >= 0 && n <= 9 && (n * 2) % 1 === 0;
}

/** 中文长日期显示 */
export function formatCnDate(date = new Date()) {
  return new Intl.DateTimeFormat("zh-CN", { month: "long", day: "numeric", weekday: "long" }).format(date);
}
