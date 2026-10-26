const STORAGE_KEY = "stage-ready-set-list-v1";
const ZONE_LABELS = {
  artistic: "Artistic Processes",
  knowledge: "Musical Knowledge",
  repertoire: "Repertoire & Culture",
  musicianship: "Musicianship"
};

const state = {
  resources: [],
  savedIds: new Set(readStoredIds()),
  filters: new Set(),
  query: "",
  view: "cards",
  zone: null,
  lastFocused: null
};

const els = {};

document.addEventListener("DOMContentLoaded", async () => {
  cacheElements();
  bindEvents();
  try {
    const response = await fetch("resources.json");
    if (!response.ok) throw new Error(`Resource request failed: ${response.status}`);
    state.resources = await response.json();
    state.savedIds = new Set([...state.savedIds].filter(id => state.resources.some(resource => resource.id === id)));
    persistSetList();
    renderAll();
  } catch (error) {
    console.error(error);
    els.resultSummary.textContent = "Resources unavailable";
    document.querySelectorAll("[data-resource-list]").forEach(list => {
      list.innerHTML = '<div class="empty-state"><strong>We could not load the guide.</strong>Try refreshing the page. If you opened the HTML file directly, start a small local web server first.</div>';
    });
  }
});

function cacheElements() {
  els.search = document.querySelector("#search");
  els.resultSummary = document.querySelector("#result-summary");
  els.cardTemplate = document.querySelector("#resource-card-template");
  els.detailDialog = document.querySelector("#detail-dialog");
  els.detailContent = document.querySelector("#detail-content");
  els.setListPanel = document.querySelector("#set-list-panel");
  els.setListItems = document.querySelector("#set-list-items");
  els.setListCount = document.querySelector("#set-list-count");
  els.setListSummary = document.querySelector("#set-list-summary");
  els.openSetList = document.querySelector("#open-set-list");
  els.panelScrim = document.querySelector("#panel-scrim");
  els.toast = document.querySelector("#toast");
}

function bindEvents() {
  document.querySelectorAll("[data-view]").forEach(button => button.addEventListener("click", () => setView(button.dataset.view)));
  document.querySelectorAll("[data-filter]").forEach(button => button.addEventListener("click", () => toggleFilter(button.dataset.filter)));
  document.querySelectorAll("[data-zone]").forEach(button => button.addEventListener("click", () => toggleZone(button.dataset.zone)));
  document.querySelectorAll("[data-exit-immersive]").forEach(button => button.addEventListener("click", () => setView("cards")));
  document.querySelectorAll("[data-immersive-scene]").forEach(scene => {
    scene.addEventListener("pointermove", event => moveSceneLight(scene, event));
    scene.addEventListener("pointerleave", () => resetSceneLight(scene));
  });
  els.search.addEventListener("input", event => { state.query = event.target.value.trim().toLocaleLowerCase(); renderResources(); });
  document.querySelector("#clear-filters").addEventListener("click", clearFilters);
  document.querySelector("#filter-toggle").addEventListener("click", toggleMobileFilters);
  els.openSetList.addEventListener("click", openSetList);
  document.querySelector("#close-set-list").addEventListener("click", closeSetList);
  els.panelScrim.addEventListener("click", closeSetList);
  document.querySelector("#clear-set-list").addEventListener("click", clearSetList);
  document.querySelector("#email-set-list").addEventListener("click", emailSetList);
  document.querySelector("#print-set-list").addEventListener("click", () => window.print());
  document.querySelector("#close-detail").addEventListener("click", () => els.detailDialog.close());
  els.detailDialog.addEventListener("click", event => { if (event.target === els.detailDialog) els.detailDialog.close(); });
  document.addEventListener("keydown", handleKeyboardShortcuts);
}

function readStoredIds() {
  try {
    const value = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    return Array.isArray(value) ? value.filter(id => typeof id === "string") : [];
  } catch {
    return [];
  }
}

function persistSetList() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...state.savedIds]));
}

function getFilteredResources() {
  return state.resources.filter(resource => {
    if (state.zone && resource.zone !== state.zone) return false;
    if (state.filters.size && ![...state.filters].every(filter => resource.tags.includes(filter))) return false;
    if (!state.query) return true;
    const haystack = [resource.title, resource.source, resource.grade, resource.description, resource.fullDescription, resource.materials, resource.standard, ...resource.tags].join(" ").toLocaleLowerCase();
    return haystack.includes(state.query);
  });
}

function renderAll() {
  renderResources();
  renderSetList();
}

function renderResources() {
  const filtered = getFilteredResources();
  const visibleList = document.querySelector(`[data-view-panel="${state.view}"] [data-resource-list]`);
  document.querySelectorAll("[data-resource-list]").forEach(list => { list.replaceChildren(); });

  document.querySelectorAll("[data-immersive-results]").forEach(panel => {
    const activePanel = panel.closest("[data-view-panel]")?.dataset.viewPanel === state.view;
    panel.classList.toggle("is-hidden", !activePanel || !state.zone);
  });

  if (state.view !== "cards" && !state.zone) {
    els.resultSummary.textContent = `${state.resources.length} resources · choose a space`;
    renderZoneStatus();
    return;
  }

  if (!filtered.length) {
    const empty = document.createElement("div");
    empty.className = "empty-state";
    empty.innerHTML = "<strong>No lessons match yet.</strong>Clear a filter or try a broader search.";
    visibleList.append(empty);
  } else {
    filtered.forEach(resource => visibleList.append(createResourceCard(resource)));
  }

  const total = state.resources.length;
  els.resultSummary.textContent = `${filtered.length} of ${total} resource${total === 1 ? "" : "s"}`;
  renderZoneStatus();
}

function createResourceCard(resource) {
  const card = els.cardTemplate.content.firstElementChild.cloneNode(true);
  card.querySelector(".grade-pill").textContent = resource.grade;
  card.querySelector(".source-name").textContent = resource.source;
  card.querySelector("h2").textContent = resource.title;
  card.querySelector(".card-description").textContent = resource.description;
  const tags = card.querySelector(".tag-list");
  resource.displayTags.forEach(tag => {
    const item = document.createElement("li");
    item.textContent = tag;
    tags.append(item);
  });
  card.querySelector(".details-button").addEventListener("click", () => openDetails(resource.id));
  const saveButton = card.querySelector(".save-button");
  setSaveButtonState(saveButton, resource.id);
  saveButton.addEventListener("click", () => toggleSaved(resource.id));
  return card;
}

function setSaveButtonState(button, id) {
  const saved = state.savedIds.has(id);
  button.textContent = saved ? "✓ In Set List" : "+ Set List";
  button.classList.toggle("is-saved", saved);
  button.setAttribute("aria-pressed", String(saved));
  button.setAttribute("aria-label", `${saved ? "Remove" : "Add"} ${getResource(id)?.title || "lesson"} ${saved ? "from" : "to"} Set List`);
}

function setView(view) {
  state.view = view;
  state.zone = null;
  document.querySelector(".intro").classList.toggle("is-hidden", view !== "cards");
  document.querySelectorAll("[data-view-panel]").forEach(panel => panel.classList.toggle("is-hidden", panel.dataset.viewPanel !== view));
  document.querySelectorAll("[data-view]").forEach(button => {
    const active = button.dataset.view === view;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-pressed", String(active));
  });
  document.querySelectorAll("[data-zone]").forEach(button => button.classList.remove("is-active"));
  document.querySelectorAll("[data-zone]").forEach(button => button.setAttribute("aria-pressed", "false"));
  renderResources();
}

function toggleFilter(filter) {
  state.filters.has(filter) ? state.filters.delete(filter) : state.filters.add(filter);
  document.querySelector(`[data-filter="${filter}"]`).setAttribute("aria-pressed", String(state.filters.has(filter)));
  renderResources();
}

function clearFilters() {
  state.filters.clear();
  state.zone = null;
  state.query = "";
  els.search.value = "";
  document.querySelectorAll("[data-filter]").forEach(button => button.setAttribute("aria-pressed", "false"));
  document.querySelectorAll("[data-zone]").forEach(button => button.classList.remove("is-active"));
  document.querySelectorAll("[data-zone]").forEach(button => button.setAttribute("aria-pressed", "false"));
  renderResources();
}

function toggleZone(zone) {
  state.zone = state.zone === zone ? null : zone;
  document.querySelectorAll("[data-zone]").forEach(button => {
    const active = button.dataset.zone === state.zone;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-pressed", String(active));
  });
  renderResources();
}

function renderZoneStatus() {
  document.querySelectorAll("[data-zone-status]").forEach(container => {
    container.replaceChildren();
    if (!state.zone) {
      return;
    }
    const label = document.createElement("span");
    label.textContent = `Showing ${ZONE_LABELS[state.zone]}`;
    const clear = document.createElement("button");
    clear.type = "button";
    clear.textContent = state.view === "hall" ? "Return to full stage ×" : "Return to full studio ×";
    clear.addEventListener("click", () => toggleZone(state.zone));
    container.append(label, clear);
  });
}

function toggleMobileFilters() {
  const filters = document.querySelector("#filters");
  const button = document.querySelector("#filter-toggle");
  const open = filters.classList.toggle("is-open");
  button.setAttribute("aria-expanded", String(open));
}

function openDetails(id) {
  const resource = getResource(id);
  if (!resource) return;
  state.lastFocused = document.activeElement;
  const saved = state.savedIds.has(id);
  els.detailContent.innerHTML = `
    <div class="detail-body">
      <p class="eyebrow">${escapeHtml(resource.source)} · ${escapeHtml(resource.grade)}</p>
      <h2 id="detail-title">${escapeHtml(resource.title)}</h2>
      <p class="detail-lede">${escapeHtml(resource.fullDescription)}</p>
      <div class="detail-meta">
        <div><small>Time</small><span>${escapeHtml(resource.time)}</span></div>
        <div><small>Grade</small><span>${escapeHtml(resource.grade)}</span></div>
        <div><small>Standard</small><span>${escapeHtml(resource.standard)}</span></div>
      </div>
      <div class="detail-section"><h3>Materials</h3><p>${escapeHtml(resource.materials)}</p></div>
      <div class="detail-section"><h3>Teacher note</h3><p>${escapeHtml(resource.teacherNote)}</p></div>
      <div class="detail-actions">
        <a class="primary-action" href="${escapeAttribute(resource.url)}" target="_blank" rel="noopener noreferrer">Open original source ↗</a>
        <button class="secondary-action" id="detail-save" type="button">${saved ? "Remove from Set List" : "Add to Set List"}</button>
      </div>
    </div>`;
  els.detailContent.querySelector("#detail-save").addEventListener("click", () => {
    toggleSaved(id);
    const nowSaved = state.savedIds.has(id);
    els.detailContent.querySelector("#detail-save").textContent = nowSaved ? "Remove from Set List" : "Add to Set List";
  });
  els.detailDialog.showModal();
  els.detailDialog.addEventListener("close", () => state.lastFocused?.focus(), { once: true });
}

function toggleSaved(id) {
  const resource = getResource(id);
  if (!resource) return;
  const adding = !state.savedIds.has(id);
  adding ? state.savedIds.add(id) : state.savedIds.delete(id);
  persistSetList();
  renderResources();
  renderSetList();
  showToast(`${resource.title} ${adding ? "added to" : "removed from"} your Set List.`);
}

function renderSetList() {
  const saved = [...state.savedIds].map(getResource).filter(Boolean);
  els.setListCount.textContent = saved.length;
  els.setListSummary.textContent = saved.length ? `${saved.length} lesson${saved.length === 1 ? "" : "s"} saved on this device.` : "No lessons saved yet.";
  els.setListItems.replaceChildren();
  if (!saved.length) {
    const empty = document.createElement("p");
    empty.className = "set-list-empty";
    empty.textContent = "Add resources while you browse. Your Set List will still be here next time.";
    els.setListItems.append(empty);
  } else {
    saved.forEach(resource => {
      const item = document.createElement("div");
      item.className = "set-list-item";
      const text = document.createElement("div");
      const title = document.createElement("strong");
      title.textContent = resource.title;
      const meta = document.createElement("small");
      meta.textContent = `${resource.source} · ${resource.grade} · ${resource.time}`;
      text.append(title, meta);
      const remove = document.createElement("button");
      remove.type = "button";
      remove.textContent = "Remove";
      remove.setAttribute("aria-label", `Remove ${resource.title}`);
      remove.addEventListener("click", () => toggleSaved(resource.id));
      item.append(text, remove);
      els.setListItems.append(item);
    });
  }
  ["#print-set-list", "#email-set-list", "#clear-set-list"].forEach(selector => { document.querySelector(selector).disabled = !saved.length; });
}

function openSetList() {
  state.lastFocused = document.activeElement;
  els.setListPanel.classList.add("is-open");
  els.panelScrim.classList.add("is-open");
  els.setListPanel.setAttribute("aria-hidden", "false");
  els.openSetList.setAttribute("aria-expanded", "true");
  document.querySelector("#close-set-list").focus();
}

function closeSetList() {
  els.setListPanel.classList.remove("is-open");
  els.panelScrim.classList.remove("is-open");
  els.setListPanel.setAttribute("aria-hidden", "true");
  els.openSetList.setAttribute("aria-expanded", "false");
  state.lastFocused?.focus();
}

function clearSetList() {
  state.savedIds.clear();
  persistSetList();
  renderAll();
  showToast("Set List cleared.");
}

function emailSetList() {
  const saved = [...state.savedIds].map(getResource).filter(Boolean);
  if (!saved.length) return;
  const body = saved.map((resource, index) => `${index + 1}. ${resource.title}\n${resource.source} · ${resource.grade} · ${resource.time}\n${resource.url}`).join("\n\n");
  window.location.href = `mailto:?subject=${encodeURIComponent("My Stage Ready Set List")}&body=${encodeURIComponent(`My Stage Ready Set List\n\n${body}`)}`;
}

function handleKeyboardShortcuts(event) {
  const target = event.target;
  const typing = target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || target.isContentEditable;
  if (event.key === "/" && !typing && !els.detailDialog.open) {
    event.preventDefault();
    els.search.focus();
  }
  if (event.key === "Escape" && els.setListPanel.classList.contains("is-open")) closeSetList();
}

function moveSceneLight(scene, event) {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const bounds = scene.getBoundingClientRect();
  const x = ((event.clientX - bounds.left) / bounds.width) * 100;
  const y = ((event.clientY - bounds.top) / bounds.height) * 100;
  scene.style.setProperty("--light-x", `${x}%`);
  scene.style.setProperty("--light-y", `${y}%`);
  scene.style.setProperty("--shift-x", `${(x - 50) * -0.015}px`);
  scene.style.setProperty("--shift-y", `${(y - 50) * -0.01}px`);
}

function resetSceneLight(scene) {
  scene.style.removeProperty("--light-x");
  scene.style.removeProperty("--light-y");
  scene.style.removeProperty("--shift-x");
  scene.style.removeProperty("--shift-y");
}

function getResource(id) {
  return state.resources.find(resource => resource.id === id);
}

let toastTimer;
function showToast(message) {
  clearTimeout(toastTimer);
  els.toast.textContent = message;
  els.toast.classList.add("is-visible");
  toastTimer = setTimeout(() => els.toast.classList.remove("is-visible"), 2600);
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"]/g, character => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[character]));
}

function escapeAttribute(value) {
  return escapeHtml(value).replace(/'/g, "&#39;");
}
