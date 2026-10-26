// 模块：历年真题。套卷管理 + 成绩登记 + 与模考记录联动。
// 版权说明：产品不内置剑桥雅思真题原文，提供登记与复盘框架；
// 用户可录入自己获得的真题成绩，材料入口跳转内置原创模拟训练。
import { store } from "../core/store.js";
import { mockPapers } from "../core/data.js";
import { dateKey, uid, overallBand, validBandInput } from "../core/utils.js";
import { el, toast } from "../ui.js";

export function mountPapers(root, { navigate }) {
  const s = store.state;
  s.papers = s.papers || [];
  const today = dateKey();

  /* 登记成绩：同时写入模考记录，source 标注来源 */
  const dateInput = el("input", { type: "date", required: true });
  dateInput.value = today;
  const nameInput = el("input", { type: "text", maxlength: 40, placeholder: "例如：剑 18 Test 2", "aria-label": "套卷名称" });
  const scoreInputs = ["L", "R", "W", "S"].map((k) => el("input", { type: "number", min: 0, max: 9, step: 0.5, required: true, inputmode: "decimal", "aria-label": `单项 ${k}` }));
  const noteInput = el("textarea", { maxlength: 240, placeholder: "这次最值得复盘的一点，例如：阅读第三篇时间不足。" });

  const regForm = el("form", { class: "mock-form", onsubmit: (e) => {
    e.preventDefault();
    const scores = scoreInputs.map((input) => input.value);
    if (scores.some((v) => !validBandInput(v))) { toast("单科分数需在 0 到 9 之间，并以 0.5 分为一档。"); return; }
    const nums = scores.map(Number);
    s.papers.push({ id: uid(), name: nameInput.value.trim() || "未命名套卷", date: dateInput.value, note: noteInput.value.trim(), createdAt: new Date().toISOString() });
    s.mocks.push({ id: uid(), date: dateInput.value, l: nums[0], r: nums[1], w: nums[2], s: nums[3], overall: overallBand(nums), note: noteInput.value.trim(), source: "真题" });
    store.save();
    e.target.reset(); dateInput.value = today;
    renderPaperList();
    toast("真题成绩已保存，并同步到模考记录。");
  } },
    el("h2", { text: "登记一次真题模考" }),
    el("label", { text: "考试日期" }, dateInput),
    el("label", { text: "套卷名称" }, nameInput),
    el("div", { class: "score-fields" },
      ...scoreInputs.map((input, i) => el("label", { text: ["听力", "阅读", "写作", "口语"][i] }, input))),
    el("label", { for: "", text: "复盘备注" }, noteInput),
    el("button", { class: "btn", type: "submit", text: "保存成绩" }));

  const paperList = el("div", { class: "paper-list" });
  function renderPaperList() {
    paperList.replaceChildren();
    if (!s.papers.length) {
      paperList.append(el("div", { class: "empty-state" }, el("p", { text: "还没有登记真题成绩。练完一套题后，把四项分数记下来。" })));
      return;
    }
    [...s.papers].sort((a, b) => b.date.localeCompare(a.date)).forEach((p) => {
      const linked = s.mocks.filter((m) => m.source === "真题" && m.date === p.date);
      const overall = linked.length ? linked[linked.length - 1].overall.toFixed(1) : "—";
      paperList.append(el("div", { class: "paper-row" },
        el("div", { class: "paper-main" },
          el("strong", { text: p.name }),
          el("span", { text: `${p.date} · 总分 ${overall}` }),
          p.note ? el("p", { text: p.note }) : null),
        el("button", { class: "btn btn--quiet", type: "button", text: "删除", onclick: () => {
          if (!window.confirm(`删除“${p.name}”的登记？关联的模考成绩记录会保留。`)) return;
          s.papers = s.papers.filter((item) => item.id !== p.id);
          store.save(); renderPaperList();
        } })));
    });
  }

  const mockList = el("div", { class: "paper-list" });
  function renderMockPapers() {
    mockList.replaceChildren(...mockPapers.map((p) => el("div", { class: "paper-row" },
      el("div", { class: "paper-main" },
        el("strong", { text: p.name }),
        el("span", { text: `${p.source} · 含听力、阅读、写作三项训练入口` })),
      el("div", { class: "paper-actions" },
        el("button", { class: "btn btn--quiet", type: "button", text: "听力", onclick: () => navigate("listening") }),
        el("button", { class: "btn btn--quiet", type: "button", text: "阅读", onclick: () => navigate("reading") }),
        el("button", { class: "btn btn--quiet", type: "button", text: "写作", onclick: () => navigate("writing") })))));
  }

  // 跨模块同步：其他入口写入成绩/删除记录后，自动刷新登记列表
  store.on((type) => { if (type === "change") renderPaperList(); });

  root.append(
    el("div", { class: "page-head compact" },
      el("div", {},
        el("h1", { text: "真题成绩，一笔一笔记下来。" }),
        el("p", { text: "剑桥雅思原文受版权保护，本工具提供套卷登记、成绩汇总与复盘框架，训练材料为内置原创模拟内容。" }))),
    el("div", { class: "papers-layout" },
      regForm,
      el("section", { class: "mock-history", "aria-labelledby": "paperHistoryTitle" },
        el("div", { class: "section-heading" },
          el("h2", { id: "paperHistoryTitle", text: "我的真题登记" }),
          el("p", { text: `${s.papers.length} 套` })),
        paperList,
        el("h2", { class: "mock-paper-title", text: "内置模拟套卷" }),
        mockList)));

  renderPaperList();
  renderMockPapers();
}
