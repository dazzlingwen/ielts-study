// UI 基础设施：DOM 构建助手、轻提示、标签页路由。无框架，保持工程可迁移性。

/** 声明式创建元素。props 支持 text/html?（仅用 text，防注入）、class、attrs、on 事件。 */
export function el(tag, props = {}, ...children) {
  const node = document.createElement(tag);
  for (const [key, value] of Object.entries(props)) {
    if (value == null || value === false) continue;
    if (key === "class") node.className = value;
    else if (key === "text") node.textContent = value;
    else if (key === "dataset") Object.assign(node.dataset, value);
    else if (key.startsWith("on") && typeof value === "function") {
      node.addEventListener(key.slice(2).toLowerCase(), value);
    } else if (value === true) node.setAttribute(key, "");
    else node.setAttribute(key, String(value));
  }
  node.append(...children.filter(Boolean));
  return node;
}

let toastTimer;
/** 轻提示：5 秒自动消失，用于错误与需要说明的操作结果。 */
export function toast(message) {
  let node = document.getElementById("toast");
  if (!node) {
    node = el("div", { id: "toast", class: "toast", role: "status", "aria-live": "polite", hidden: true });
    document.body.append(node);
  }
  clearTimeout(toastTimer);
  node.textContent = message;
  node.hidden = false;
  toastTimer = setTimeout(() => { node.hidden = true; }, 5000);
}

/** 标签页路由：state 写入 URL hash，刷新与分享后可还原。 */
export function setupTabs(tabs, panels, onChange) {
  function activate(id, updateHash = true) {
    tabs.forEach((tab) => {
      const active = tab.dataset.tab === id;
      tab.setAttribute("aria-selected", String(active));
      tab.tabIndex = active ? 0 : -1;
    });
    panels.forEach((panel) => {
      const active = panel.id === id;
      panel.hidden = !active;
      panel.classList.toggle("is-active", active);
    });
    if (updateHash) history.replaceState(null, "", `#${id}`);
    onChange?.(id);
  }
  tabs.forEach((tab, index, list) => {
    tab.addEventListener("click", () => activate(tab.dataset.tab));
    tab.addEventListener("keydown", (event) => {
      const keys = ["ArrowLeft", "ArrowRight", "Home", "End"];
      if (!keys.includes(event.key)) return;
      event.preventDefault();
      let next = index;
      if (event.key === "ArrowRight") next = (index + 1) % list.length;
      if (event.key === "ArrowLeft") next = (index - 1 + list.length) % list.length;
      if (event.key === "Home") next = 0;
      if (event.key === "End") next = list.length - 1;
      list[next].focus();
      activate(list[next].dataset.tab);
    });
  });
  const initial = location.hash.slice(1);
  const valid = tabs.some((tab) => tab.dataset.tab === initial);
  activate(valid ? initial : tabs[0].dataset.tab, valid);
  return { activate };
}
