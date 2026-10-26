// 模块：阅读训练。文章阅读 + 客观题作答 + 自动判分 + 解析回顾 + 生词联动词库。
import { store } from "../core/store.js";
import { readingPassages } from "../core/data.js";
import { dateKey, uid } from "../core/utils.js";
import { el, toast } from "../ui.js";

const today = dateKey();

export function mountReading(root) {
  const s = store.state;
  s.reading = s.reading || {};
  let passage = readingPassages[0];
  let timerStart = null;

  const title = el("h2", { text: passage.title });
  const meta = el("p", { class: "listen-meta", text: `${passage.topic} · 建议 ${passage.minutes} 分钟 · 共 ${passage.questions.length} 题` });
  const status = el("p", { class: "listen-progress", "aria-live": "polite", text: "" });
  const article = el("div", { class: "passage-text" });
  const questionBox = el("div", { class: "question-box" });
  const reviewBox = el("div", { class: "review-box", hidden: true });

  const answerOf = (qid) => s.reading[passage.id]?.answers?.[qid];
  const isSubmitted = () => Boolean(s.reading[passage.id]?.submittedAt);

  function renderArticle() {
    article.replaceChildren(...passage.paragraphs.map((p, i) => el("p", { class: i === 0 ? "has-dropcap" : "" , text: p })));
  }
  function renderStatus() {
    const rec = s.reading[passage.id];
    if (rec?.submittedAt) {
      status.textContent = `已提交 · 得分 ${rec.score} / ${passage.questions.length} · 可重做一次`;
    } else {
      const answered = passage.questions.filter((q) => answerOf(q.id) != null && answerOf(q.id) !== "").length;
      status.textContent = timerStart
        ? `已作答 ${answered} / ${passage.questions.length} 题 · 计时中 ${passage.minutes} 分钟`
        : `共 ${passage.questions.length} 题 · 已作答 ${answered} 题`;
    }
  }
  function renderQuestions() {
    questionBox.replaceChildren();
    passage.questions.forEach((q, index) => {
      const saved = answerOf(q.id);
      let input;
      if (q.type === "判断题") {
        input = el("select", { "aria-label": `第 ${index + 1} 题选项` },
          el("option", { value: "", text: "请选择" }),
          ...q.options.map((opt) => el("option", { value: opt, text: opt })));
        input.value = saved || "";
      } else {
        input = el("input", { type: "text", placeholder: "每空一词", "aria-label": `第 ${index + 1} 题填空` });
        input.value = saved || "";
      }
      input.disabled = isSubmitted();
      input.addEventListener("change", () => {
        s.reading[passage.id] = s.reading[passage.id] || { answers: {} };
        s.reading[passage.id].answers[q.id] = input.value.trim();
        store.save(); renderStatus();
      });
      questionBox.append(el("div", { class: "question-row" },
        el("span", { class: "q-num", text: `${index + 1}` }),
        el("div", { class: "q-body" },
          el("span", { class: "q-type", text: q.type }),
          el("p", { text: q.prompt }),
          input)));
    });
  }
  function renderReview() {
    const rec = s.reading[passage.id];
    if (!rec?.submittedAt) { reviewBox.hidden = true; return; }
    reviewBox.hidden = false;
    reviewBox.replaceChildren(el("h3", { text: "答题回顾" }), ...passage.questions.map((q, i) => {
      const user = rec.answers[q.id] || "（未答）";
      const ok = q.type === "填空题"
        ? q.answer.some((a) => a.toLowerCase() === String(user).trim().toLowerCase())
        : user === q.answer;
      return el("div", { class: `review-row${ok ? " is-correct" : " is-wrong"}` },
        el("strong", { text: `第 ${i + 1} 题 ${ok ? "正确" : "错误"}` }),
        el("p", { text: `你的答案：${user} · 参考答案：${Array.isArray(q.answer) ? q.answer[0] : q.answer}` }),
        el("p", { class: "q-explain", text: q.explain }));
    }));
  }

  const submitBtn = el("button", { class: "btn", type: "button", text: "提交并判分" });
  submitBtn.addEventListener("click", () => {
    const rec = s.reading[passage.id] || { answers: {} };
    const unanswered = passage.questions.filter((q) => !rec.answers?.[q.id]).length;
    if (unanswered && !window.confirm(`还有 ${unanswered} 题未作答，确定提交？`)) return;
    let score = 0;
    passage.questions.forEach((q) => {
      const user = rec.answers?.[q.id];
      const ok = q.type === "填空题"
        ? q.answer.some((a) => a.toLowerCase() === String(user || "").trim().toLowerCase())
        : user === q.answer;
      if (ok) score += 1;
    });
    s.reading[passage.id] = { answers: rec.answers || {}, submittedAt: new Date().toISOString(), score };
    store.save();
    renderStatus(); renderQuestions(); renderReview();
    toast(`本次得分 ${score} / ${passage.questions.length}。看看解析，错题归因比分数更重要。`);
  });
  const redoBtn = el("button", { class: "btn btn--quiet", type: "button", text: "重做本篇", onclick: () => {
    if (!window.confirm("清除本篇作答与判分记录，重新作答？")) return;
    delete s.reading[passage.id];
    timerStart = null;
    store.save(); renderAll();
  } });

  function renderAll() {
    title.textContent = passage.title;
    meta.textContent = `${passage.topic} · 建议 ${passage.minutes} 分钟 · 共 ${passage.questions.length} 题`;
    submitBtn.disabled = isSubmitted();
    renderArticle(); renderStatus(); renderQuestions(); renderReview();
  }

  function renderList() {
    list.replaceChildren(...readingPassages.map((p) => {
      const rec = s.reading[p.id];
      return el("button", { class: `material-item${p.id === passage.id ? " is-active" : ""}`, type: "button", onclick: () => {
        passage = p; timerStart = null; renderList(); renderAll();
      } },
        el("strong", { text: p.title }),
        el("span", { text: `${p.topic} · ${p.questions.length} 题` }),
        el("small", { text: rec?.submittedAt ? `已提交 · ${rec.score}/${p.questions.length}` : "未开始" }));
    }));
  }

  const vocabWord = el("input", { type: "text", maxlength: 40, placeholder: "阅读中遇到的生词", "aria-label": "生词" });
  const vocabMeaning = el("input", { type: "text", maxlength: 80, placeholder: "中文释义", "aria-label": "释义" });
  const addVocabForm = el("form", { class: "inline-vocab", onsubmit: (e) => {
    e.preventDefault();
    const word = vocabWord.value.trim(), meaning = vocabMeaning.value.trim();
    if (!word || !meaning) return;
    if (s.words.some((w) => w.word.toLowerCase() === word.toLowerCase())) { toast("词库中已有这个单词。"); return; }
    s.words.push({ id: uid(), word, meaning, pos: "自定义词汇" });
    store.save(); e.target.reset(); toast(`已加入词库：${word}`);
  } }, vocabWord, vocabMeaning, el("button", { class: "btn btn--quiet", type: "submit", text: "加入词库" }));

  const list = el("div", { class: "material-list" });

  root.append(
    el("div", { class: "page-head compact" },
      el("div", {},
        el("h1", { text: "限时读完，立刻回忆。" }),
        el("p", { text: "按真实考试节奏作答，提交后看逐题解析。遇到生词可直接存入词库。" }))),
    el("div", { class: "listen-layout" },
      el("aside", { class: "material-side", "aria-label": "阅读文章列表" },
        el("h2", { text: "文章库" }), list,
        el("p", { class: "license-note", text: "文章为原创模拟内容，非剑桥雅思真题。" }),
        el("h2", { text: "边读边记" }), addVocabForm),
      el("section", { class: "read-stage" },
        title, meta, status,
        article,
        el("h3", { class: "q-heading", text: "题目" }),
        questionBox,
        el("div", { class: "sentence-nav" }, submitBtn, redoBtn),
        reviewBox)));

  renderList();
  renderAll();
}
