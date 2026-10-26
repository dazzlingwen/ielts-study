// 模块：写作练习。每道题目独立草稿与自查清单，防抖自动保存。
import { store } from "../core/store.js";
import { writingPrompts } from "../core/data.js";
import { dateKey, countWords, download } from "../core/utils.js";
import { el } from "../ui.js";

export function mountWriting(root) {
  const s = store.state;
  s.essay.drafts = s.essay.drafts || {};
  s.essay.checksByPrompt = s.essay.checksByPrompt || {};
  const today = dateKey();
  let saveTimer;

  const draft = () => s.essay.drafts[s.essay.promptIndex] || "";
  const checks = () => s.essay.checksByPrompt[s.essay.promptIndex] || {};
  const promptText = el("p", { class: "essay-prompt", text: writingPrompts[s.essay.promptIndex % writingPrompts.length] });
  const wordCount = el("strong", { id: "wordCount", text: "0" });
  const saveState = el("span", { id: "essaySaveState", "aria-live": "polite", text: "" });
  const editor = el("textarea", { id: "essayEditor", spellcheck: true, placeholder: "在这里写下你的观点、理由与例子……" });

  function flush() {
    clearTimeout(saveTimer);
    s.essay.drafts[s.essay.promptIndex] = editor.value;
    store.save();
  }
  function render() {
    editor.value = draft();
    promptText.textContent = writingPrompts[s.essay.promptIndex % writingPrompts.length];
    wordCount.textContent = String(countWords(draft()));
    checkBoxes.forEach((box) => { box.checked = Boolean(checks()[box.dataset.check]); });
  }
  function queueSave(text, promptIndex) {
    saveState.textContent = "正在保存";
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
      s.essay.drafts[promptIndex] = text;
      saveState.textContent = store.save() ? "已保存到本机" : "保存失败";
    }, 350);
  }

  editor.addEventListener("input", () => {
    const text = editor.value;
    const promptIndex = s.essay.promptIndex;
    wordCount.textContent = String(countWords(text));
    queueSave(text, promptIndex);
  });
  window.addEventListener("pagehide", flush);

  const checkDefs = [
    ["task", "正面回应题目所有部分，立场始终一致"],
    ["coherence", "每段一个中心，连接词服务于逻辑"],
    ["lexical", "替换重复表达，搭配自然且拼写准确"],
    ["grammar", "检查主谓一致、时态、冠词和句子边界"],
  ];
  const checkBoxes = checkDefs.map(([key, label]) => {
    const box = el("input", { type: "checkbox", dataset: { check: key } });
    box.addEventListener("change", () => {
      s.essay.checksByPrompt[s.essay.promptIndex] = checks();
      s.essay.checksByPrompt[s.essay.promptIndex][key] = box.checked;
      store.save();
    });
    return box;
  });

  root.append(
    el("div", { class: "page-head compact" },
      el("div", {}, el("h1", { text: "写完一篇，再改一遍。" }), el("p", { text: "Task 2 建议 40 分钟、至少 250 词。每道题的草稿独立保存。" })),
      el("button", { class: "btn btn--quiet", type: "button", text: "导出作文", onclick: () => {
        flush();
        const content = `${promptText.textContent}\n\n${editor.value}\n\nWord count: ${countWords(editor.value)}`;
        download(`ielts-task2-${today}.txt`, content);
      } })),
    el("div", { class: "writing-layout" },
      el("section", { class: "prompt-panel", "aria-labelledby": "promptTitle" },
        el("h2", { id: "promptTitle", text: "本期题目" }),
        promptText,
        el("button", { class: "text-button", type: "button", text: "换一道题", onclick: () => {
          flush();
          s.essay.promptIndex = (s.essay.promptIndex + 1) % writingPrompts.length;
          store.save(); render();
          saveState.textContent = "每道题独立保存";
        } }),
        el("div", { class: "writing-guide" },
          el("h3", { text: "动笔前 5 分钟" }),
          el("ol", {}, ...["圈出两个讨论对象与指令词", "写下明确立场和两条理由", "为每条理由补一个具体例子"].map((t) => el("li", { text: t }))))),
      el("section", { class: "editor-panel", "aria-labelledby": "editorTitle" },
        el("div", { class: "editor-meta" },
          el("h2", { id: "editorTitle", text: "我的草稿" }),
          el("p", {}, wordCount, " 词 ", saveState)),
        el("label", { class: "sr-only", for: "essayEditor", text: "雅思写作草稿" }),
        editor,
        el("details", { class: "self-check" },
          el("summary", { text: "完成后，按四项标准自查" }),
          el("div", {}, ...checkBoxes.map((box, i) => el("label", {}, box, el("span", { text: checkDefs[i][1] }))))))));

  render();
}
