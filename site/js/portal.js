let workstreams = [];
let snapshotMetadata = null;
const phaseKeys = ["planning", "design", "development", "validation", "release", "runtime"];
const phaseLabels = { planning: "기획", design: "설계", development: "개발", validation: "검증", release: "릴리스", runtime: "실행" };

const body = document.querySelector("#workstream-body");
const searchInput = document.querySelector("#search-input");
const filterButtons = [...document.querySelectorAll("[data-filter]")];
const resultCount = document.querySelector("#result-count");
const emptyState = document.querySelector("#empty-state");
const dialog = document.querySelector("#detail-dialog");
const detailContent = document.querySelector("#detail-content");
const closeButton = dialog.querySelector(".dialog-close");
const navToggle = document.querySelector("#nav-toggle");
const sidebarBackdrop = document.querySelector("[data-close-sidebar]");
const navLinks = [...document.querySelectorAll("[data-nav-link]")];
const emptyStateTitle = document.querySelector("#empty-state-title");
const emptyStateMessage = document.querySelector("#empty-state-message");

let activeFilter = "all";
let lastTrigger = null;

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function statusMarkup(stage) {
  return `<span class="status ${escapeHtml(stage.tone)}">${escapeHtml(stage.label)}</span><span class="cell-note">${escapeHtml(stage.note)}</span>`;
}

function searchableText(item) {
  return [item.title, item.code, item.summary, item.nextTitle, item.nextText, ...item.evidence, ...item.risks, ...phaseKeys.flatMap((key) => [item[key].label, item[key].note])]
    .join(" ")
    .toLocaleLowerCase("ko-KR");
}

function matchesFilter(item) {
  if (activeFilter === "all") return true;
  if (activeFilter === "action") return item.needsAction;
  return item.overall === activeFilter;
}

function filteredWorkstreams() {
  const query = searchInput.value.trim().toLocaleLowerCase("ko-KR");
  return workstreams.filter((item) => matchesFilter(item) && (query === "" || searchableText(item).includes(query)));
}

function rowMarkup(item) {
  return `<tr tabindex="0" data-workstream-id="${escapeHtml(item.id)}" aria-label="${escapeHtml(item.title)} 상세 보기">
    <td><div class="work-title"><span class="priority ${item.priority.toLowerCase()}">${escapeHtml(item.priority)}</span><button type="button" tabindex="-1"><strong>${escapeHtml(item.title)}</strong><small>${escapeHtml(item.code)}</small></button></div></td>
    ${phaseKeys.map((key) => `<td>${statusMarkup(item[key])}</td>`).join("")}
    <td class="next-cell"><strong>${escapeHtml(item.nextTitle)}</strong><span>${escapeHtml(item.nextText)}</span></td>
  </tr>`;
}

function render() {
  const visible = filteredWorkstreams();
  body.innerHTML = visible.map(rowMarkup).join("");
  resultCount.textContent = `${visible.length} / ${workstreams.length}개 작업`;
  emptyStateTitle.textContent = "조건에 맞는 작업이 없습니다.";
  emptyStateMessage.textContent = "검색어나 필터를 변경해 주세요.";
  emptyState.hidden = visible.length !== 0;
}

function renderMetrics() {
  document.querySelector("#metric-total").textContent = String(workstreams.length);
  document.querySelector("#metric-active").textContent = String(workstreams.filter((item) => item.overall === "active").length);
  document.querySelector("#metric-action").textContent = String(workstreams.filter((item) => item.needsAction).length);
  document.querySelector("#metric-blocked").textContent = String(workstreams.filter((item) => item.overall === "blocked").length);
}

function listMarkup(items) {
  return `<ul>${items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`;
}

function openDetail(item, trigger) {
  lastTrigger = trigger;
  detailContent.innerHTML = `
    <p class="detail-kicker">${escapeHtml(item.priority)} · ${escapeHtml(item.code)}</p>
    <h2 id="detail-title">${escapeHtml(item.title)}</h2>
    <p class="detail-summary">${escapeHtml(item.summary)}</p>
    <div class="detail-grid">${phaseKeys.map((key) => `<div class="detail-card"><span>${phaseLabels[key]}</span>${statusMarkup(item[key])}</div>`).join("")}</div>
    <section class="detail-section"><h3>다음 단계</h3><p><strong>${escapeHtml(item.nextTitle)}</strong><br />${escapeHtml(item.nextText)}</p></section>
    <section class="detail-section"><h3>근거</h3>${listMarkup(item.evidence)}</section>
    <section class="detail-section"><h3>남은 위험</h3>${listMarkup(item.risks)}</section>`;
  dialog.showModal();
}

function activateRow(row) {
  const item = workstreams.find((candidate) => candidate.id === row.dataset.workstreamId);
  if (item) openDetail(item, row);
}

function closeSidebar() {
  document.body.classList.remove("sidebar-open");
  sidebarBackdrop.hidden = true;
  navToggle.setAttribute("aria-expanded", "false");
}

function assertSnapshot(snapshot) {
  if (!snapshot || snapshot.schemaVersion !== "1.0.0" || !Array.isArray(snapshot.workstreams)) {
    throw new Error("지원하지 않는 스냅샷 형식입니다.");
  }
  if (!snapshot.source || typeof snapshot.source.snapshotId !== "string" || !snapshot.observedAt) {
    throw new Error("스냅샷 출처가 불완전합니다.");
  }
  return snapshot;
}

function formatKstDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "시각 미확인";
  return new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function renderSnapshotMetadata(snapshot) {
  const snapshotId = snapshot.source.snapshotId.replace(/^\d{4}-\d{2}-\d{2}-/u, "").toUpperCase();
  const observed = new Date(snapshot.observedAt);
  const staleAfterMs = Number(snapshot.staleAfterHours || 0) * 60 * 60 * 1000;
  const stale = !Number.isFinite(observed.getTime()) || staleAfterMs <= 0 || Date.now() > observed.getTime() + staleAfterMs;
  const state = document.querySelector("#snapshot-state");
  const dot = document.createElement("i");
  dot.setAttribute("aria-hidden", "true");
  state.replaceChildren(dot, document.createTextNode(stale ? "stale snapshot" : "reviewed snapshot"));
  state.classList.toggle("is-stale", stale);
  document.querySelector("#snapshot-revision").textContent = snapshotId;
  document.querySelector("#snapshot-context-revision").textContent = snapshotId;
  document.querySelector("#snapshot-context").textContent = snapshot.source.note;
  document.querySelector("#snapshot-date").textContent = formatKstDate(snapshot.observedAt);
  document.querySelector("#snapshot-date").dateTime = snapshot.observedAt;
  document.querySelector("#snapshot-badge").textContent = stale ? "STALE" : "REVIEWED";
  document.querySelector("#snapshot-evidence").textContent = `${formatKstDate(snapshot.observedAt)} 기준 운영자 검토 정적 projection입니다.`;
}

function showLoadFailure(error) {
  workstreams = [];
  body.replaceChildren();
  resultCount.textContent = "스냅샷을 불러오지 못했습니다.";
  emptyStateTitle.textContent = "상태 데이터 오류";
  emptyStateMessage.textContent = error instanceof Error ? error.message : "잠시 후 다시 시도해 주세요.";
  emptyState.hidden = false;
  document.querySelector("#snapshot-badge").textContent = "UNKNOWN";
}

async function loadSnapshot() {
  const response = await fetch("./data/status.json", { cache: "no-cache", credentials: "same-origin" });
  if (!response.ok) throw new Error(`상태 데이터 HTTP ${response.status}`);
  const snapshot = assertSnapshot(await response.json());
  snapshotMetadata = snapshot;
  workstreams = snapshot.workstreams;
  renderSnapshotMetadata(snapshotMetadata);
  renderMetrics();
  render();
}

filterButtons.forEach((button) => {
  button.setAttribute("aria-pressed", String(button.classList.contains("is-active")));
  button.addEventListener("click", () => {
    activeFilter = button.dataset.filter;
    filterButtons.forEach((candidate) => {
      const selected = candidate === button;
      candidate.classList.toggle("is-active", selected);
      candidate.setAttribute("aria-pressed", String(selected));
    });
    render();
  });
});

searchInput.addEventListener("input", render);
body.addEventListener("click", (event) => {
  const row = event.target.closest("[data-workstream-id]");
  if (row) activateRow(row);
});
body.addEventListener("keydown", (event) => {
  if (event.key !== "Enter" && event.key !== " ") return;
  const row = event.target.closest("[data-workstream-id]");
  if (!row) return;
  event.preventDefault();
  activateRow(row);
});

closeButton.addEventListener("click", () => dialog.close());
dialog.addEventListener("click", (event) => { if (event.target === dialog) dialog.close(); });
dialog.addEventListener("close", () => { if (lastTrigger) lastTrigger.focus(); });

navToggle.addEventListener("click", () => {
  const next = !document.body.classList.contains("sidebar-open");
  document.body.classList.toggle("sidebar-open", next);
  sidebarBackdrop.hidden = !next;
  navToggle.setAttribute("aria-expanded", String(next));
});
sidebarBackdrop.addEventListener("click", closeSidebar);
navLinks.forEach((link) => {
  link.addEventListener("click", () => {
    navLinks.forEach((candidate) => candidate.classList.toggle("is-active", candidate === link));
    closeSidebar();
  });
});

document.querySelectorAll("img[data-fallback]").forEach((image) => {
  image.addEventListener("error", () => {
    if (image.dataset.fallbackApplied === "true") return;
    image.dataset.fallbackApplied = "true";
    image.src = image.dataset.fallback;
  });
});

loadSnapshot().catch(showLoadFailure);
