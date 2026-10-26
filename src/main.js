// 应用入口：组装顶栏、标签路由与七个功能模块。
import { store } from "./core/store.js";
import { dateKey, download } from "./core/utils.js";
import { el, toast, setupTabs } from "./ui.js";
import { mountToday } from "./modules/today.js";
import { mountListening } from "./modules/listening.js";
import { mountReading } from "./modules/reading.js";
import { mountVocabulary } from "./modules/vocabulary.js";
import { mountWriting } from "./modules/writing.js";
import { mountPapers } from "./modules/papers.js";
import { mountMock } from "./modules/mock.js";

const MODULES = [
  ["today", "今日训练", mountToday],
  ["listening", "听力", mountListening],
  ["reading", "阅读", mountReading],
  ["vocabulary", "词汇", mountVocabulary],
  ["writing", "写作", mountWriting],
  ["papers", "真题", mountPapers],
  ["mock", "模考记录", mountMock],
];

function boot() {
  const app = document.getElementById("app");
  if (!app) return;

  const panels = [];
  const tabs = [];
  let tabApi;

  for (const [id, label, mount] of MODULES) {
    const tab = el("button", { type: "button", role: "tab", "aria-controls": id, "aria-selected": "false", dataset: { tab: id }, text: label });
    const panel = el("section", { class: "panel", id, role: "tabpanel", hidden: true });
    tabs.push(tab);
    panels.push(panel);
    // 真题模块需要跨模块跳转能力
    if (id === "papers") mount(panel, { navigate: (target) => tabApi?.activate(target) });
    else mount(panel);
  }

  const importInput = el("input", { type: "file", accept: "application/json,.json", class: "sr-only", "aria-label": "导入备份文件", onchange: (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        if (store.restore(String(reader.result))) { toast("备份已恢复，页面即将刷新。"); setTimeout(() => location.reload(), 800); }
      } catch { toast("备份文件格式不正确，恢复失败。"); }
    };
    reader.readAsText(file);
    e.target.value = "";
  } });

  const topbar = el("header", { class: "topbar" },
    el("a", { class: "wordmark", href: "#today", "aria-label": "栖岸雅思首页", text: "栖岸 IELTS" }),
    el("nav", { class: "tabs", role: "tablist", "aria-label": "备考工具" }, ...tabs),
    el("div", { class: "topbar-actions" },
      el("label", { class: "btn btn--quiet", text: "导入备份" }, importInput),
      el("button", { class: "btn btn--quiet", type: "button", text: "备份数据", onclick: () => {
        download(`ielts-backup-${dateKey()}.json`, store.exportJSON(), "application/json;charset=utf-8");
      } })));

  const main = el("main", { id: "main" });
  main.append(...panels);
  const footer = el("footer", {},
    el("p", { class: "footer-mark wordmark", text: "栖岸 IELTS" }),
    el("p", { text: "练习与记录保存在当前浏览器。清理浏览器数据前，请先备份。材料为原创模拟内容。" }),
    el("button", { class: "text-button", type: "button", text: "下载我的全部数据", onclick: () => {
      download(`ielts-backup-${dateKey()}.json`, store.exportJSON(), "application/json;charset=utf-8");
    } }));

  app.append(
    el("a", { class: "skip", href: "#main", text: "跳到主要内容" }),
    topbar, main, footer);

  tabApi = setupTabs(tabs, panels);
}

document.readyState === "loading" ? document.addEventListener("DOMContentLoaded", boot) : boot();
