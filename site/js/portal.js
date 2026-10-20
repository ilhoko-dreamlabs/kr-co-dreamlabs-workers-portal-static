const menuToggle = document.querySelector("[data-menu-toggle]");
const navigation = document.querySelector("[data-site-nav]");
const page = document.body.dataset.page;

function closeMenu() {
  if (!menuToggle || !navigation) return;
  navigation.classList.remove("is-open");
  menuToggle.setAttribute("aria-expanded", "false");
  document.body.classList.remove("menu-open");
}

if (menuToggle && navigation) {
  menuToggle.addEventListener("click", () => {
    const opening = !navigation.classList.contains("is-open");
    navigation.classList.toggle("is-open", opening);
    menuToggle.setAttribute("aria-expanded", String(opening));
    document.body.classList.toggle("menu-open", opening);
  });
  navigation.addEventListener("click", (event) => {
    if (event.target.closest("a")) closeMenu();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape" || !navigation.classList.contains("is-open")) return;
    closeMenu();
    menuToggle.focus();
  });
}

for (const link of document.querySelectorAll("[data-nav-key]")) {
  if (link.dataset.navKey === page) link.setAttribute("aria-current", "page");
}

const searchInput = document.querySelector("[data-directory-search]");
const cards = [...document.querySelectorAll("[data-directory-card]")];
const filters = [...document.querySelectorAll("[data-directory-filter]")];
const result = document.querySelector("[data-directory-result]");
const empty = document.querySelector("[data-directory-empty]");
let activeFilter = "all";

function normalize(value) {
  return String(value || "").trim().toLocaleLowerCase("ko-KR");
}

function renderDirectory() {
  if (!cards.length) return;
  const query = normalize(searchInput?.value);
  let visible = 0;
  for (const card of cards) {
    const matchesText = !query || normalize(card.dataset.search).includes(query);
    const tags = normalize(card.dataset.tags).split(" ");
    const matchesFilter = activeFilter === "all" || tags.includes(activeFilter);
    card.hidden = !(matchesText && matchesFilter);
    if (!card.hidden) visible += 1;
  }
  if (result) result.textContent = `${visible} / ${cards.length}개 Worker`;
  if (empty) empty.hidden = visible !== 0;
}

if (searchInput) searchInput.addEventListener("input", renderDirectory);
for (const button of filters) {
  button.setAttribute("aria-pressed", String(button.classList.contains("is-active")));
  button.addEventListener("click", () => {
    activeFilter = button.dataset.directoryFilter || "all";
    for (const candidate of filters) {
      const selected = candidate === button;
      candidate.classList.toggle("is-active", selected);
      candidate.setAttribute("aria-pressed", String(selected));
    }
    renderDirectory();
  });
}
renderDirectory();

function formatKst(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "검토 시각 미확인";
  return new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  }).format(date);
}

async function loadPublicationFacts() {
  const statusTargets = [...document.querySelectorAll("[data-catalog-reviewed]")];
  if (!statusTargets.length) return;
  try {
    const response = await fetch("/data/portal-status.json", { cache: "no-cache", credentials: "same-origin" });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const status = await response.json();
    for (const target of statusTargets) {
      target.textContent = formatKst(status.catalogReviewedAt);
      if (target instanceof HTMLTimeElement) target.dateTime = status.catalogReviewedAt;
    }
  } catch {
    for (const target of statusTargets) target.textContent = "검토 시각 확인 불가";
  }

  const revision = document.querySelector("[data-build-revision]");
  const artifact = document.querySelector("[data-build-files]");
  if (!revision && !artifact) return;
  try {
    const response = await fetch("/build-manifest.json", { cache: "no-cache", credentials: "same-origin" });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const manifest = await response.json();
    if (revision) revision.textContent = manifest.sourceRevision || "미확인";
    if (artifact) artifact.textContent = `${Array.isArray(manifest.files) ? manifest.files.length : 0}개 정적 파일`;
  } catch {
    if (revision) revision.textContent = "로컬 또는 미배포 소스";
    if (artifact) artifact.textContent = "빌드 후 manifest 생성";
  }
}

loadPublicationFacts();

async function loadDownloadConfig() {
  const link = document.querySelector("[data-download-link]");
  if (!link) return;
  const product = document.querySelector("[data-download-product]");
  const filename = document.querySelector("[data-download-filename]");
  const size = document.querySelector("[data-download-size]");
  const protection = document.querySelector("[data-download-protection]");
  const sha256 = document.querySelector("[data-download-sha256]");
  const status = document.querySelector("[data-download-status]");

  const unavailable = (message) => {
    link.removeAttribute("href");
    link.setAttribute("aria-disabled", "true");
    link.textContent = "아직 다운로드할 수 없습니다";
    if (status) status.textContent = message;
  };

  try {
    const response = await fetch("/data/download-config.json", { cache: "no-cache", credentials: "same-origin" });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const config = await response.json();
    if (product) {
      const detail = [config.artifact?.label, config.artifact?.version].filter(Boolean).join(" · ");
      product.textContent = detail || "Worker Portable";
    }
    if (filename) filename.textContent = config.artifact?.filename || "미확인";
    if (size) size.textContent = Number.isSafeInteger(config.artifact?.sizeBytes)
      ? `${(config.artifact.sizeBytes / 1024 / 1024).toFixed(1)} MiB`
      : "미확인";
    if (protection) protection.textContent = config.artifact?.protection === "zipcrypto"
      ? "Windows 호환 암호 ZIP"
      : "미확인";
    if (sha256) sha256.textContent = config.artifact?.sha256 || "미확인";
    if (!config.enabled || config.provider !== "portal-static") {
      unavailable("현재 제품용 Portable ZIP이 게시되지 않았습니다.");
      return;
    }
    const downloadUrl = new URL(config.url, window.location.origin);
    if (downloadUrl.origin !== window.location.origin || !downloadUrl.pathname.startsWith("/downloads/") || !downloadUrl.pathname.endsWith(".zip")) {
      throw new Error("unapproved Portal download URL");
    }
    link.href = downloadUrl.href;
    link.removeAttribute("aria-disabled");
    link.textContent = "암호 ZIP 다운로드";
    status.textContent = "다운로드 후 별도로 전달받은 암호로 압축을 해제하세요.";
  } catch {
    unavailable("다운로드 설정을 확인할 수 없습니다. 운영 담당자에게 문의하세요.");
  }
}

loadDownloadConfig();
