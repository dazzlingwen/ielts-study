// 状态管理：localStorage 持久化 + 极简发布订阅。
// 数据访问集中在此层，未来迁移云数据库（Supabase / 云开发）时只需替换本文件的读写实现。

const STORAGE_KEY = "qian-ielts-v1";
const listeners = new Set();

function defaults() {
  return {
    version: 2,
    settings: { examDate: "", targetBand: null },
    tasks: {},          // { 'YYYY-MM-DD': Task[] }
    activity: {},       // { 'YYYY-MM-DD': 专注分钟数 }
    words: [],          // 用户词库（种子词由 data.js 注入）
    knownWords: {},     // { 'YYYY-MM-DD': wordId[] }
    essay: { promptIndex: 0, drafts: {}, checksByPrompt: {} },
    mocks: [],          // 模考/真题成绩记录
    listening: {},      // 听写记录 { materialId: { done: bool, correct: n, total: n } }
    reading: {},        // 阅读作答 { passageId: { answers: {}, submittedAt, score } }
    papers: [],         // 用户登记的真题套卷
    updatedAt: null,
  };
}

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaults();
    const saved = JSON.parse(raw);
    const base = defaults();
    // 浅合并顶层键，深层结构在使用处自行兜底，避免旧数据缺字段导致崩溃
    return { ...base, ...saved, version: 2 };
  } catch {
    return defaults();
  }
}

export const store = {
  state: load(),

  save() {
    this.state.updatedAt = new Date().toISOString();
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
      this.emit("change");
      return true;
    } catch {
      this.emit("error", "浏览器存储失败，请先导出备份，并检查存储空间与权限。");
      return false;
    }
  },

  on(fn) {
    listeners.add(fn);
    return () => listeners.delete(fn);
  },
  emit(type, payload) {
    listeners.forEach((fn) => fn(type, payload));
  },

  /** 导出完整 JSON 备份 */
  exportJSON() {
    return JSON.stringify(this.state, null, 2);
  },

  /** 全量恢复（来自备份文件） */
  restore(json) {
    const parsed = JSON.parse(json);
    this.state = { ...defaults(), ...parsed, version: 2 };
    return this.save();
  },
};
