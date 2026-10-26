// 模块：今日训练。任务清单 + 倒计时 + 考试目标设置。
import { store } from "../core/store.js";
import { defaultTasks } from "../core/data.js";
import { dateKey, offsetDate, uid, formatCnDate } from "../core/utils.js";
import { el, toast } from "../ui.js";

const today = dateKey();

function getStreak() {
  let streak = 0;
  for (let i = 0; i < 3650; i += 1) {
    const key = offsetDate(-i);
    const anyDone = (store.state.tasks[key] || []).some((t) => t.done);
    const anyFocus = (store.state.activity[key] || 0) > 0;
    if (!anyDone && !anyFocus) { if (i === 0) continue; break; }
    streak += 1;
  }
  return streak;
}

export function mountToday(root) {
  const s = store.state;
  if (!s.tasks[today]) s.tasks[today] = defaultTasks();
  store.save();

  /* 计时器状态（不持久化进行中的计时，避免跨标签页状态错乱） */
  let seconds = 25 * 60, total = seconds, endAt = null, tick = null, selectedTask = null;

  const dateLine = el("p", { class: "date-line", text: formatCnDate() });
  const h1 = el("h1", { text: "今天，练完这四项。" });
  const intro = el("p", { text: "每项都有明确产出，完成后勾选，进度只按你的记录计算。" });

  const examInput = el("input", { type: "date", id: "examDate", value: s.settings.examDate || "" });
  const bandInput = el("input", { type: "number", id: "targetBand", min: 4, max: 9, step: 0.5, inputmode: "decimal", placeholder: "待设置" });
  if (s.settings.targetBand != null) bandInput.value = s.settings.targetBand;
  const daysLeft = el("strong", { text: "未设置" });
  function renderDays() {
    if (!s.settings.examDate) { daysLeft.textContent = "未设置"; return; }
    const diff = Math.ceil((new Date(`${s.settings.examDate}T00:00:00`) - new Date(`${today}T00:00:00`)) / 86400000);
    daysLeft.textContent = diff >= 0 ? `${diff} 天` : "已过期";
  }
  examInput.addEventListener("change", () => { s.settings.examDate = examInput.value; store.save(); renderDays(); });
  bandInput.addEventListener("change", () => {
    const v = Number(bandInput.value);
    if (!(v >= 4 && v <= 9 && (v * 2) % 1 === 0)) { bandInput.setAttribute("aria-invalid", "true"); toast("目标分数需在 4 到 9 之间，并以 0.5 分为一档。"); return; }
    bandInput.removeAttribute("aria-invalid");
    s.settings.targetBand = v; store.save();
  });
  const goalForm = el("form", { class: "goal-form", onsubmit: (e) => e.preventDefault() },
    el("label", { text: "考试日期" }, examInput),
    el("label", { text: "目标总分" }, bandInput),
    el("p", { class: "days-left" }, daysLeft, el("span", { text: "距离考试" })),
  );

  const progressText = el("p", { text: "" });
  const progressBar = el("div", { class: "progress-track", role: "progressbar", "aria-label": "今日任务完成度", "aria-valuemin": 0, "aria-valuemax": 100, "aria-valuenow": 0 });
  const progressFill = el("span");
  progressBar.append(progressFill);
  const taskList = el("div", { class: "task-list" });
  const doneMinutes = el("dd", { id: "doneMinutes", text: "0 分钟" });
  const focusMinutes = el("dd", { id: "focusMinutes", text: "0 分钟" });
  const streakDays = el("dd", { id: "streakDays", text: "0 天" });

  const timerDisplay = el("div", { class: "timer", role: "timer", text: "25:00" });
  const timerTask = el("p", { id: "timerTask", text: "选择左侧任务，开始一段不被打断的练习。" });
  const timerStatus = el("p", { class: "timer-status", "aria-live": "polite", text: "计时期间可切换工具，时间会继续。" });
  const timerLength = el("select", { id: "timerLength" },
    ...[25, 45, 60].map((m) => el("option", { value: m, text: `${m} 分钟` })));
  const timerToggle = el("button", { class: "btn", type: "button", text: "开始专注" });

  const fmt = (sec) => `${String(Math.floor(sec / 60)).padStart(2, "0")}:${String(sec % 60).padStart(2, "0")}`;
  const renderTimer = () => { timerDisplay.textContent = fmt(seconds); timerToggle.textContent = tick ? "暂停" : seconds < total ? "继续" : "开始专注"; };
  const stopTick = () => { clearInterval(tick); tick = null; };
  const completeTimer = () => {
    stopTick(); endAt = null;
    const mins = Math.round(total / 60);
    s.activity[today] = (s.activity[today] || 0) + mins;
    store.save(); renderStats();
    timerStatus.textContent = `本段 ${mins} 分钟已计入今天的专注记录。`;
    seconds = 0; renderTimer();
  };
  const onTick = () => { seconds = Math.max(0, Math.ceil((endAt - Date.now()) / 1000)); renderTimer(); if (seconds <= 0) completeTimer(); };
  timerToggle.addEventListener("click", () => {
    if (tick) { onTick(); stopTick(); endAt = null; timerStatus.textContent = "已暂停，当前进度保留在本页。"; renderTimer(); return; }
    if (seconds <= 0) { seconds = Number(timerLength.value) * 60; total = seconds; }
    endAt = Date.now() + seconds * 1000;
    tick = setInterval(onTick, 500);
    timerStatus.textContent = selectedTask ? `正在练习：${selectedTask.title}` : "计时进行中，切换工具不会暂停。";
    renderTimer();
  });
  timerLength.addEventListener("change", () => { stopTick(); endAt = null; seconds = Number(timerLength.value) * 60; total = seconds; renderTimer(); });

  const resetBtn = el("button", { class: "btn btn--quiet", type: "button", text: "重置", onclick: () => { stopTick(); endAt = null; seconds = Number(timerLength.value) * 60; total = seconds; timerStatus.textContent = "计时已重置。"; renderTimer(); } });

  function selectTask(task) {
    selectedTask = task;
    timerTask.textContent = task.title;
    if ([25, 45, 60].includes(Number(task.minutes))) timerLength.value = String(task.minutes);
    stopTick(); endAt = null;
    seconds = Number(timerLength.value) * 60; total = seconds;
    timerStatus.textContent = "已选中任务，准备好后开始。";
    renderTimer();
  }

  function renderStats() {
    const tasks = s.tasks[today];
    const done = tasks.filter((t) => t.done).length;
    const planned = tasks.filter((t) => t.done).reduce((sum, t) => sum + Number(t.minutes), 0);
    const pct = tasks.length ? Math.round((done / tasks.length) * 100) : 0;
    progressText.textContent = `${done} / ${tasks.length} 项完成`;
    progressBar.setAttribute("aria-valuenow", String(pct));
    progressFill.style.transform = `scaleX(${pct / 100})`;
    doneMinutes.textContent = `${planned} 分钟`;
    focusMinutes.textContent = `${s.activity[today] || 0} 分钟`;
    streakDays.textContent = `${getStreak()} 天`;
  }

  function renderTasks() {
    taskList.replaceChildren();
    s.tasks[today].forEach((task) => {
      const checkbox = el("input", { type: "checkbox", "aria-label": `${task.title}，${task.done ? "已完成" : "未完成"}` });
      checkbox.checked = task.done;
      checkbox.addEventListener("change", () => { task.done = checkbox.checked; store.save(); renderTasks(); });
      const focusBtn = el("button", { class: "task-focus", type: "button", text: "专注这项", onclick: () => selectTask(task) });
      const delBtn = el("button", { class: "task-delete", type: "button", "aria-label": `删除任务：${task.title}`, text: "×", onclick: () => {
        if (!window.confirm(`删除“${task.title}”？`)) return;
        s.tasks[today] = s.tasks[today].filter((item) => item.id !== task.id);
        store.save(); renderTasks();
      } });
      taskList.append(el("div", { class: `task-row${task.done ? " is-done" : ""}` },
        el("label", { class: "task-check", title: task.done ? "标记为未完成" : "标记为已完成" }, checkbox),
        el("div", { class: "task-copy" },
          el("strong", { text: task.title }),
          el("small", { text: `${task.skill} · 预计 ${task.minutes} 分钟` })),
        focusBtn, delBtn));
    });
    renderStats();
  }

  const newTaskInput = el("input", { id: "newTask", type: "text", maxlength: 60, placeholder: "例如：精听 Section 2 并整理连读", required: true });
  const newTaskMinutes = el("select", { "aria-label": "预计分钟数" }, ...[15, 25, 40, 60].map((m) => el("option", { value: m, text: `${m} 分钟` })));
  const addForm = el("form", { class: "add-task", onsubmit: (e) => {
    e.preventDefault();
    const title = newTaskInput.value.trim();
    if (!title) return;
    s.tasks[today].push({ id: uid(), skill: "自定义", title, minutes: Number(newTaskMinutes.value), done: false });
    store.save(); e.target.reset(); newTaskMinutes.value = "25"; renderTasks(); newTaskInput.focus();
  } },
    el("label", { for: "newTask", text: "添加一项具体训练" }),
    el("div", { class: "field-row" }, newTaskInput, newTaskMinutes, el("button", { class: "btn btn--quiet", type: "submit", text: "加入清单" })));

  root.append(
    el("div", { class: "page-head" },
      el("div", {}, dateLine, h1, intro),
      goalForm),
    el("div", { class: "workbench" },
      el("section", { class: "plan", "aria-labelledby": "planTitle" },
        el("div", { class: "section-heading" }, el("h2", { id: "planTitle", text: "今日清单" }), progressText),
        progressBar, taskList, addForm),
      el("aside", { class: "focus-panel", "aria-labelledby": "focusTitle" },
        el("div", { class: "focus-copy" }, el("h2", { id: "focusTitle", text: "专注计时" }), timerTask),
        timerDisplay,
        el("label", { class: "timer-length", text: "计时长度" }, timerLength),
        el("div", { class: "timer-actions" }, timerToggle, resetBtn),
        timerStatus,
        el("dl", { class: "today-stats" },
          el("div", {}, el("dt", { text: "计划完成" }), doneMinutes),
          el("div", {}, el("dt", { text: "专注投入" }), focusMinutes),
          el("div", {}, el("dt", { text: "连续记录" }), streakDays)))),
    el("section", { class: "method", "aria-labelledby": "methodTitle" },
      el("h2", { id: "methodTitle", text: "练完，要留下什么？" }),
      el("div", { class: "method-grid" },
        el("article", {}, el("h3", { text: "听力" }), el("p", { text: "听写完核对原文，标出连读、弱读和同义替换。" })),
        el("article", {}, el("h3", { text: "阅读" }), el("p", { text: "给错题归因：定位、词义、句法、判断标准或时间。" })),
        el("article", {}, el("h3", { text: "写作" }), el("p", { text: "保留原稿，按任务回应、连贯、词汇、语法四项自查。" })),
        el("article", {}, el("h3", { text: "口语" }), el("p", { text: "录音后回听，只改最影响表达的一处，再录一遍。" })))));

  renderDays();
  renderTasks();
  renderTimer();
}
