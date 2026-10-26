// 模块：模考记录。通用成绩台账（含真题登记同步进来的记录），支持 CSV 导出。
import { store } from "../core/store.js";
import { dateKey, uid, overallBand, validBandInput, download } from "../core/utils.js";
import { el, toast } from "../ui.js";

export function mountMock(root) {
  const s = store.state;
  const today = dateKey();

  const dateInput = el("input", { type: "date", required: true });
  dateInput.value = today;
  const noteInput = el("textarea", { maxlength: 240, placeholder: "例如：阅读第三篇只剩 12 分钟，判断题定位过慢。" });
  const scoreInputs = ["L", "R", "W", "S"].map((k) => el("input", { type: "number", min: 0, max: 9, step: 0.5, required: true, inputmode: "decimal", "aria-label": `单项 ${k}` }));

  const summary = el("p", { text: "还没有记录" });
  const tableBody = el("tbody");
  const tableWrap = el("div", { class: "table-wrap" });
  tableWrap.append(el("table", {},
    el("thead", {}, el("tr", {},
      ...["日期", "来源", "听力", "阅读", "写作", "口语", "总分", ""].map((h) => el("th", { text: h })))),
    tableBody));
  const emptyState = el("div", { class: "empty-state" }, el("p", { text: "先录入一次完整模考，之后才能看见真实变化。" }));
  const latestNote = el("div", { class: "latest-note", hidden: true }, el("h3", { text: "最近复盘" }), el("p"));

  function render() {
    const mocks = [...s.mocks].sort((a, b) => b.date.localeCompare(a.date));
    tableBody.replaceChildren();
    mocks.forEach((m) => {
      const del = el("button", { class: "text-button", type: "button", text: "删除", onclick: () => {
        if (!window.confirm(`删除 ${m.date} 的${m.source === "真题" ? "真题" : "模考"}记录？`)) return;
        s.mocks = s.mocks.filter((item) => item.id !== m.id);
        store.save(); render();
      } });
      tableBody.append(el("tr", {},
        el("td", { text: m.date }),
        el("td", { text: m.source === "真题" ? "真题" : "模考" }),
        el("td", { text: m.l.toFixed(1) }), el("td", { text: m.r.toFixed(1) }),
        el("td", { text: m.w.toFixed(1) }), el("td", { text: m.s.toFixed(1) }),
        el("td", { text: m.overall.toFixed(1) }), el("td", {}, del)));
    });
    emptyState.hidden = mocks.length > 0;
    tableWrap.hidden = mocks.length === 0;
    summary.textContent = mocks.length ? `共 ${mocks.length} 次，最近总分 ${mocks[0].overall.toFixed(1)}` : "还没有记录";
    latestNote.hidden = !mocks.length || !mocks[0].note;
    latestNote.querySelector("p").textContent = mocks.length ? mocks[0].note || "" : "";
  }

  const form = el("form", { class: "mock-form", onsubmit: (e) => {
    e.preventDefault();
    const scores = scoreInputs.map((input) => input.value);
    if (scores.some((v) => !validBandInput(v))) { toast("单科分数需在 0 到 9 之间，并以 0.5 分为一档。"); return; }
    const nums = scores.map(Number);
    s.mocks.push({ id: uid(), date: dateInput.value, l: nums[0], r: nums[1], w: nums[2], s: nums[3], overall: overallBand(nums), note: noteInput.value.trim(), source: "模考" });
    store.save();
    e.target.reset(); dateInput.value = today;
    render();
  } },
    el("h2", { text: "添加一次模考" }),
    el("label", { text: "模考日期" }, dateInput),
    el("div", { class: "score-fields" },
      ...scoreInputs.map((input, i) => el("label", { text: ["听力", "阅读", "写作", "口语"][i] }, input))),
    el("label", { text: "这次最值得复盘的一点" }, noteInput),
    el("button", { class: "btn", type: "submit", text: "保存模考记录" }));

  // 跨模块同步：其他模块（如真题登记）写入成绩后，自动刷新台账
  store.on((type) => { if (type === "change") render(); });

  root.append(
    el("div", { class: "page-head compact" },
      el("div", {},
        el("h1", { text: "记录分数，也记录原因。" }),
        el("p", { text: "总分按四项算术平均后，以 0.5 分为单位四舍五入。真题模块登记的成绩也会出现在这里。" })),
      el("button", { class: "btn btn--quiet", type: "button", text: "导出 CSV", onclick: () => {
        if (!s.mocks.length) { toast("还没有可导出的模考记录。"); return; }
        const esc = (v) => `"${String(v).replaceAll('"', '""')}"`;
        const rows = [["日期", "来源", "听力", "阅读", "写作", "口语", "总分", "复盘"]];
        s.mocks.forEach((m) => rows.push([m.date, m.source || "模考", m.l, m.r, m.w, m.s, m.overall, m.note || ""]));
        download(`ielts-mocks-${today}.csv`, `﻿${rows.map((r) => r.map(esc).join(",")).join("\n")}`, "text/csv;charset=utf-8");
      } })),
    el("div", { class: "mock-layout" },
      form,
      el("section", { class: "mock-history", "aria-labelledby": "historyTitle" },
        el("div", { class: "section-heading" }, el("h2", { id: "historyTitle", text: "历史记录" }), summary),
        tableWrap, emptyState, latestNote)));

  render();
}
