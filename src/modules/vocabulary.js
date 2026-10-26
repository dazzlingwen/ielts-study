// 模块：词汇复习。翻卡队列 + 自定义词库，与今日日期联动。
import { store } from "../core/store.js";
import { baseWords } from "../core/data.js";
import { dateKey, uid } from "../core/utils.js";
import { el } from "../ui.js";

const today = dateKey();

export function mountVocabulary(root) {
  const s = store.state;
  if (!s.words?.length) s.words = [...baseWords];
  if (!s.knownWords[today]) s.knownWords[today] = [];
  store.save();

  let queue = [];
  let current = null;

  const wordText = el("h2", { text: "" });
  const wordPos = el("p", { class: "word-pos", text: "" });
  const wordPhonetic = el("p", { class: "word-phonetic", text: "" });
  const wordMeaning = el("p", { id: "wordMeaning", text: "" });
  const wordExample = el("p", { class: "word-example", text: "" });
  const wordCollocation = el("p", { class: "word-collocation", text: "" });
  const answerBox = el("div", { id: "wordAnswer", hidden: true }, wordMeaning, wordExample, wordCollocation);
  const flipHint = el("p", { class: "flip-hint", text: "点击卡片或按空格查看释义" });
  const vocabCount = el("span", { "aria-live": "polite", text: "" });
  const knownBtn = el("button", { class: "btn", type: "button", text: "认识，下一张" });
  const againBtn = el("button", { class: "btn btn--quiet", type: "button", text: "再看一次" });

  function showNext() {
    current = queue.shift() || null;
    answerBox.hidden = true;
    knownBtn.disabled = againBtn.disabled = !current;
    if (!current) {
      wordText.textContent = "今日复习完成";
      wordPos.textContent = wordPhonetic.textContent = "";
      wordMeaning.textContent = wordExample.textContent = wordCollocation.textContent = "";
      flipHint.textContent = "可重置队列，或添加自己的生词。";
      vocabCount.textContent = "0 张待复习";
      return;
    }
    wordText.textContent = current.word;
    wordPos.textContent = current.pos || "自定义词汇";
    wordPhonetic.textContent = current.phonetic || "";
    wordMeaning.textContent = current.meaning;
    wordExample.textContent = current.example || "试着用这个单词写一个与雅思话题有关的句子。";
    wordCollocation.textContent = current.collocation || "补充一个你见过的真实搭配。";
    flipHint.textContent = "点击卡片或按空格查看释义";
    vocabCount.textContent = `${queue.length + 1} 张待复习`;
  }
  function rebuild() {
    const known = new Set(s.knownWords[today]);
    queue = s.words.filter((w) => !known.has(w.id));
    showNext();
  }
  function flip() {
    if (!current) return;
    answerBox.hidden = !answerBox.hidden;
    flipHint.textContent = answerBox.hidden ? "点击卡片或按空格查看释义" : "再次点击可隐藏释义";
  }

  const card = el("div", { class: "flashcard", tabindex: 0, role: "button", "aria-label": "显示单词释义", onclick: flip, onkeydown: (e) => {
    if (e.key === " " || e.key === "Enter") { e.preventDefault(); flip(); }
  } }, wordPos, wordText, wordPhonetic, answerBox, flipHint);

  knownBtn.addEventListener("click", () => {
    if (!current) return;
    s.knownWords[today].push(current.id); store.save(); showNext();
  });
  againBtn.addEventListener("click", () => { if (current) queue.push(current); showNext(); });

  const customWord = el("input", { id: "customWord", maxlength: 40, required: true, placeholder: "例如：mitigate" });
  const customMeaning = el("input", { id: "customMeaning", maxlength: 80, required: true, placeholder: "例如：减轻，缓和" });
  const wordList = el("div", { class: "word-list" });

  function renderList() {
    wordList.replaceChildren();
    [...s.words].reverse().forEach((w) => {
      wordList.append(el("div", { class: "word-item" },
        el("strong", { text: w.word }),
        el("span", { text: w.meaning })));
    });
  }
  const addForm = el("form", { onsubmit: (e) => {
    e.preventDefault();
    const word = customWord.value.trim(), meaning = customMeaning.value.trim();
    if (!word || !meaning) return;
    const item = { id: uid(), word, meaning, pos: "自定义词汇" };
    s.words.push(item); store.save();
    if (!s.knownWords[today].includes(item.id)) queue.push(item);
    e.target.reset(); renderList();
    vocabCount.textContent = `${queue.length + (current ? 1 : 0)} 张待复习`;
  } },
    el("label", { for: "customWord", text: "添加单词" }, customWord),
    el("label", { for: "customMeaning", text: "中文释义" }, customMeaning),
    el("button", { class: "btn btn--quiet", type: "submit", text: "存入词库" }));

  // 跨模块同步：阅读模块「边读边记」加词后，词库列表自动刷新
  store.on((type) => { if (type === "change") renderList(); });

  root.append(
    el("div", { class: "page-head compact" },
      el("div", {}, el("h1", { text: "把生词，变成能用的词。" }), el("p", { text: "先回忆，再翻卡。标记“认识”的词会从今天队列移除。" })),
      el("button", { class: "btn btn--quiet", type: "button", text: "重置今日队列", onclick: () => { s.knownWords[today] = []; store.save(); rebuild(); } })),
    el("div", { class: "vocab-layout" },
      el("section", { class: "flashcard-area", "aria-label": "词汇卡片" },
        card,
        el("div", { class: "card-actions" }, againBtn, vocabCount, knownBtn)),
      el("aside", { class: "word-bank" },
        el("h2", { text: "我的词库" }), addForm, wordList)));

  rebuild();
  renderList();
}
