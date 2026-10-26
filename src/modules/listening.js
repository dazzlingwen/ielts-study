// 模块：听力训练。Web Speech API 朗读原创脚本 + 逐句听写核对。
// 商业版可将 speak() 替换为授权音频播放器，数据结构无需变更。
import { store } from "../core/store.js";
import { listeningMaterials } from "../core/data.js";
import { el, toast } from "../ui.js";

/** 朗读文本。返回 false 表示环境不支持 TTS。 */
function speak(text, rate = 1) {
  if (!("speechSynthesis" in window)) return false;
  window.speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = "en-GB";
  utter.rate = rate;
  window.speechSynthesis.speak(utter);
  return true;
}
function stopSpeak() {
  if ("speechSynthesis" in window) window.speechSynthesis.cancel();
}
/** 听写核对：忽略大小写、首尾空白与常见标点差异 */
function normalize(text) {
  return text.trim().toLowerCase().replace(/[.,!?;:'"“”‘’]/g, "").replace(/\s+/g, " ");
}

export function mountListening(root) {
  const s = store.state;
  s.listening = s.listening || {};
  let material = listeningMaterials[0];
  let sentenceIndex = 0;
  let rate = 1;

  const title = el("h2", { text: material.title });
  const meta = el("p", { class: "listen-meta", text: `${material.scene} · ${material.section} · ${material.note}` });
  const progress = el("p", { class: "listen-progress", "aria-live": "polite", text: "" });
  const sentenceTip = el("p", { class: "sentence-tip", text: "" });
  const dictationInput = el("input", { type: "text", placeholder: "听完后写下你听到的句子", "aria-label": "听写输入" });
  const result = el("p", { class: "dictation-result", "aria-live": "polite", text: "" });
  const checkBtn = el("button", { class: "btn", type: "button", text: "核对这句" });
  const revealBtn = el("button", { class: "btn btn--quiet", type: "button", text: "显示原文" });
  const answerBox = el("div", { class: "listen-answer", hidden: true });

  function record() {
    const rec = s.listening[material.id] || { done: false, correct: 0, total: material.script.length };
    s.listening[material.id] = rec;
    return rec;
  }
  function renderProgress() {
    const rec = record();
    const answered = Object.keys(rec.results || {}).length;
    progress.textContent = rec.done
      ? `已完成 · 听写正确 ${rec.correct} / ${rec.total}`
      : `第 ${Math.min(sentenceIndex + 1, material.script.length)} / ${material.script.length} 句 · 已核对 ${answered} 句`;
  }
  function renderSentence() {
    const line = material.script[sentenceIndex];
    sentenceTip.textContent = `听点提示：${line.tip}`;
    dictationInput.value = "";
    result.textContent = "";
    result.className = "dictation-result";
    answerBox.hidden = true;
    answerBox.replaceChildren(
      el("p", { class: "answer-en", text: line.en }),
      el("p", { class: "answer-zh", text: line.zh }));
    renderProgress();
  }
  function renderMaterialList() {
    list.replaceChildren(...listeningMaterials.map((m) => {
      const rec = s.listening[m.id];
      const active = m.id === material.id;
      return el("button", { class: `material-item${active ? " is-active" : ""}`, type: "button", onclick: () => {
        stopSpeak();
        material = m; sentenceIndex = 0;
        title.textContent = m.title;
        meta.textContent = `${m.scene} · ${m.section} · ${m.note}`;
        renderMaterialList(); renderSentence();
      } },
        el("strong", { text: m.title }),
        el("span", { text: `${m.scene} · ${m.section}` }),
        el("small", { text: rec?.done ? `已完成 · 正确 ${rec.correct}/${rec.total}` : `${m.script.length} 句` }));
    }));
  }

  const playAllBtn = el("button", { class: "btn", type: "button", text: "播放整段" });
  const playSentenceBtn = el("button", { class: "btn btn--quiet", type: "button", text: "重播本句" });
  const stopBtn = el("button", { class: "btn btn--quiet", type: "button", text: "停止", onclick: stopSpeak });
  const rateSelect = el("select", { "aria-label": "播放语速" },
    ...[["0.75", "0.75× 慢速"], ["1", "1× 常速"], ["1.25", "1.25× 快速"]].map(([v, t]) => el("option", { value: v, text: t })));
  rateSelect.value = "1";
  rateSelect.addEventListener("change", () => { rate = Number(rateSelect.value); });

  const trySpeak = (text) => {
    if (!speak(text, rate)) toast("当前浏览器不支持语音朗读。建议使用桌面版 Chrome 或 Edge。");
  };
  playAllBtn.addEventListener("click", () => trySpeak(material.script.map((l) => l.en).join(" ")));
  playSentenceBtn.addEventListener("click", () => trySpeak(material.script[sentenceIndex].en));

  const prevBtn = el("button", { class: "btn btn--quiet", type: "button", text: "上一句" });
  const nextBtn = el("button", { class: "btn btn--quiet", type: "button", text: "下一句" });
  prevBtn.addEventListener("click", () => { if (sentenceIndex > 0) { sentenceIndex -= 1; renderSentence(); } });
  nextBtn.addEventListener("click", () => { if (sentenceIndex < material.script.length - 1) { sentenceIndex += 1; renderSentence(); } else { toast("已是最后一句，核对后可重置再练一遍。"); } });

  checkBtn.addEventListener("click", () => {
    const line = material.script[sentenceIndex];
    const rec = record();
    rec.results = rec.results || {};
    const user = dictationInput.value;
    if (!user.trim()) { toast("先写下你听到的内容，再核对。"); return; }
    const isCorrect = normalize(user) === normalize(line.en);
    const firstTry = !(sentenceIndex in rec.results);
    rec.results[sentenceIndex] = { correct: isCorrect };
    if (firstTry && isCorrect) rec.correct = (rec.correct || 0) + 1;
    if (sentenceIndex === material.script.length - 1) rec.done = true;
    store.save();
    result.textContent = isCorrect ? "正确。注意连读和弱读是否与朗读一致。" : "有出入。对照原文，找出漏听或听错的词。";
    result.classList.toggle("is-correct", isCorrect);
    result.classList.toggle("is-wrong", !isCorrect);
    answerBox.hidden = false;
    renderProgress();
    renderMaterialList();
  });
  revealBtn.addEventListener("click", () => { answerBox.hidden = !answerBox.hidden; });
  dictationInput.addEventListener("keydown", (e) => { if (e.key === "Enter") { e.preventDefault(); checkBtn.click(); } });

  const resetBtn = el("button", { class: "text-button", type: "button", text: "重置本材料进度", onclick: () => {
    if (!window.confirm(`重置“${material.title}”的听写记录？`)) return;
    delete s.listening[material.id];
    store.save(); renderMaterialList(); renderSentence();
  } });

  const list = el("div", { class: "material-list" });

  root.append(
    el("div", { class: "page-head compact" },
      el("div", {},
        el("h1", { text: "耳朵要练，手也要练。" }),
        el("p", { text: "先听整段把握大意，再逐句听写。核对只反馈正误，评分以真实考试为准。" }))),
    el("div", { class: "listen-layout" },
      el("aside", { class: "material-side", "aria-label": "听力材料列表" },
        el("h2", { text: "材料库" }), list,
        el("p", { class: "license-note", text: "材料为原创模拟内容，非剑桥雅思真题。" })),
      el("section", { class: "listen-stage" },
        title, meta, progress,
        el("div", { class: "player-row" }, playAllBtn, playSentenceBtn, stopBtn, rateSelect),
        el("div", { class: "dictation-box" },
          sentenceTip,
          el("div", { class: "dictation-row" }, dictationInput, checkBtn),
          result,
          el("div", { class: "sentence-nav" }, prevBtn, nextBtn, revealBtn),
          answerBox,
          resetBtn))));

  renderMaterialList();
  renderSentence();
}
