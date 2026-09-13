// ---- Placeholder server data ----
const serverNames = [
  "Crimson Peak", "Azure Haven", "Nova Realms", "Shadowmere",
  "Ironhold", "Frostvale", "Emberfall", "Stormwatch"
];

// The 3 paid / featured servers (shown in the left column)
const featuredNames = ["Aurora Prime", "Celestial Core", "Obsidian Elite"];

// Small pool used only to give each placeholder server a version
const sampleVersions = ["1.21.1", "1.20.4", "1.19.4", "26.2", "26.1"];

function makeServer(name, i, featured) {
  const online = Math.random() > 0.2; // ~80% online
  return {
    name,
    version: sampleVersions[i % sampleVersions.length],
    ip: "mc.ExampleIp.net",
    players: online ? Math.floor(Math.random() * 900) + 20 : 0,
    status: online ? "Online" : "Offline",
    desc: "A short placeholder description for this server.",
    featured
  };
}

const featuredServers = featuredNames.map((n, i) => {
  const s = makeServer(n, i, true);
  s.status = "Online";
  s.players = Math.floor(Math.random() * 900) + 100;
  return s;
});
const normalServers = serverNames.map((n, i) => makeServer(n, i, false));

// ---- State ----
let activeVersion = null;
let activeStatus = null;
let searchText = "";

/* =========================================================
   Minecraft version list (from Modrinth, with fallback)
   ========================================================= */
// Fallback release list 1.0 -> 26.2 (newest first) if the API can't be reached.
let allVersions = [
  "26.2", "26.1",
  "1.21.11", "1.21.10", "1.21.9", "1.21.8", "1.21.7", "1.21.6", "1.21.5",
  "1.21.4", "1.21.3", "1.21.2", "1.21.1", "1.21",
  "1.20.6", "1.20.5", "1.20.4", "1.20.3", "1.20.2", "1.20.1", "1.20",
  "1.19.4", "1.19.3", "1.19.2", "1.19.1", "1.19",
  "1.18.2", "1.18.1", "1.18",
  "1.17.1", "1.17",
  "1.16.5", "1.16.4", "1.16.3", "1.16.2", "1.16.1", "1.16",
  "1.15.2", "1.15.1", "1.15",
  "1.14.4", "1.14.3", "1.14.2", "1.14.1", "1.14",
  "1.13.2", "1.13.1", "1.13",
  "1.12.2", "1.12.1", "1.12",
  "1.11.2", "1.11.1", "1.11",
  "1.10.2", "1.10.1", "1.10",
  "1.9.4", "1.9.3", "1.9.2", "1.9.1", "1.9",
  "1.8.9", "1.8.8", "1.8.7", "1.8.6", "1.8.5", "1.8.4", "1.8.3", "1.8.2", "1.8.1", "1.8",
  "1.7.10", "1.7.9", "1.7.8", "1.7.7", "1.7.6", "1.7.5", "1.7.4", "1.7.2",
  "1.6.4", "1.6.2", "1.6.1",
  "1.5.2", "1.5.1", "1.5",
  "1.4.7", "1.4.6", "1.4.5", "1.4.4", "1.4.2",
  "1.3.2", "1.3.1",
  "1.2.5", "1.2.4", "1.2.3", "1.2.2", "1.2.1",
  "1.1", "1.0"
];

// Set to true to also include snapshots / pre-releases / release candidates
const INCLUDE_SNAPSHOTS = false;

async function loadVersionsFromModrinth() {
  try {
    const res = await fetch("https://api.modrinth.com/v2/tag/game_version");
    if (!res.ok) throw new Error("Bad response");
    const data = await res.json();

    // data is oldest -> newest; each item: { version, version_type, date, major }
    const filtered = INCLUDE_SNAPSHOTS
      ? data
      : data.filter(v => v.version_type === "release");

    // Newest first
    allVersions = filtered.map(v => v.version).reverse();

    // Refresh the dropdown if it's currently open / populated
    renderVersionOptions(versionInput.value);
  } catch (e) {
    // Silently keep the fallback list (e.g. opened offline / from file://)
    console.warn("Using fallback version list:", e.message);
  }
}

/* =========================================================
   Typeable version combobox
   ========================================================= */
const combo = document.getElementById("versionCombo");
const versionInput = document.getElementById("versionInput");
const versionArrow = document.getElementById("versionArrow");
const versionList = document.getElementById("versionList");
let highlightIndex = -1;

function renderVersionOptions(filter = "") {
  const f = filter.trim().toLowerCase();
  const matched = allVersions.filter(v => v.toLowerCase().includes(f));
  versionList.innerHTML = "";
  highlightIndex = -1;

  if (matched.length === 0) {
    versionList.innerHTML = `<div class="combo-empty">No versions found</div>`;
    return;
  }

  matched.forEach(v => {
    const opt = document.createElement("div");
    opt.className = "combo-option" + (v === activeVersion ? " selected" : "");
    opt.textContent = v;
    opt.onclick = () => selectVersion(v);
    versionList.appendChild(opt);
  });
}

function openCombo() {
  combo.classList.add("open");
  renderVersionOptions(versionInput.value);
}
function closeCombo() { combo.classList.remove("open"); }
function selectVersion(v) {
  activeVersion = v;
  versionInput.value = v;
  closeCombo();
  render();
}

versionInput.addEventListener("focus", openCombo);
versionInput.addEventListener("input", () => {
  openCombo();
  renderVersionOptions(versionInput.value);
  if (versionInput.value.trim() === "") {
    activeVersion = null;
    render();
  }
});
versionArrow.addEventListener("click", (e) => {
  e.stopPropagation();
  combo.classList.contains("open") ? closeCombo() : (versionInput.focus(), openCombo());
});

// Keyboard navigation
versionInput.addEventListener("keydown", (e) => {
  const opts = [...versionList.querySelectorAll(".combo-option")];
  if (e.key === "ArrowDown") {
    e.preventDefault();
    if (!combo.classList.contains("open")) openCombo();
    highlightIndex = Math.min(highlightIndex + 1, opts.length - 1);
    updateHighlight(opts);
  } else if (e.key === "ArrowUp") {
    e.preventDefault();
    highlightIndex = Math.max(highlightIndex - 1, 0);
    updateHighlight(opts);
  } else if (e.key === "Enter") {
    e.preventDefault();
    if (highlightIndex >= 0 && opts[highlightIndex]) {
      selectVersion(opts[highlightIndex].textContent);
    }
  } else if (e.key === "Escape") {
    closeCombo();
  }
});
function updateHighlight(opts) {
  opts.forEach((o, i) => o.classList.toggle("highlight", i === highlightIndex));
  if (opts[highlightIndex]) opts[highlightIndex].scrollIntoView({ block: "nearest" });
}

document.addEventListener("click", (e) => {
  if (!combo.contains(e.target)) closeCombo();
});

/* =========================================================
   Status tags
   ========================================================= */
function buildStatusTags() {
  const sBox = document.getElementById("statusTags");
  ["Online", "Offline"].forEach(st => {
    const el = document.createElement("span");
    el.className = "tag";
    el.textContent = st;
    el.dataset.status = st;
    el.onclick = () => {
      activeStatus = activeStatus === st ? null : st;
      refreshStatusStates();
      render();
    };
    sBox.appendChild(el);
  });
}
function refreshStatusStates() {
  document.querySelectorAll("[data-status]").forEach(el =>
    el.classList.toggle("active", el.dataset.status === activeStatus));
}

/* =========================================================
   Filtering
   ========================================================= */
function matches(s) {
  const okVersion = !activeVersion || s.version === activeVersion;
  const okStatus = !activeStatus || s.status === activeStatus;
  const okSearch = !searchText ||
    s.name.toLowerCase().includes(searchText) ||
    s.ip.toLowerCase().includes(searchText);
  return okVersion && okStatus && okSearch;
}

/* =========================================================
   Rendering
   ========================================================= */
function cardHTML(s) {
  const statusClass = s.status === "Online" ? "online" : "offline";
  const playersLine = s.status === "Online"
    ? `<span class="players"><span class="dot"></span>${s.players} Players Online</span>`
    : `<span class="players" style="color:#f8a3a3;"><span class="dot" style="background:#f87171;box-shadow:none;"></span>Offline</span>`;

  return `
    <article class="server-card">
      <div class="banner">
        PlaceHolder Banner
        <div class="banner-ip">
          <span class="ip-text">${s.ip}</span>
          <button class="copy-btn" data-ip="${s.ip}">Copy</button>
        </div>
      </div>
      <div class="card-body">
        <div class="pfp">Blank<br>pfp</div>
        <div class="info">
          <div class="card-title-row">
            <span class="card-title">${s.name}</span>
            <span class="status ${statusClass}">
              <span class="status-dot"></span>${s.status}
            </span>
          </div>
          <div class="info-row">
            ${playersLine}
            <span class="card-desc">${s.desc}</span>
          </div>
        </div>
        <div class="version-pill">${s.version}</div>
      </div>
    </article>
  `;
}

function miniCardHTML(s) {
  return `
    <div class="mini-card">
      <div class="mini-banner">PlaceHolder Banner</div>
      <div class="mini-body">
        <div class="mini-title">${s.name}</div>
        <div class="mini-players"><span class="dot"></span>${s.players} Players Online</div>
        <div class="mini-ip">
          <span class="ip-text">${s.ip}</span>
          <button class="copy-btn" data-ip="${s.ip}">Copy</button>
        </div>
      </div>
    </div>
  `;
}

function renderFeatured() {
  const box = document.getElementById("featuredList");
  box.innerHTML = featuredServers
    .slice()
    .sort((a, b) => b.players - a.players)
    .map(miniCardHTML)
    .join("");
  wireCopyButtons(box);
}

function render() {
  const list = document.getElementById("serverList");
  const filtered = normalServers
    .filter(matches)
    .sort((a, b) => b.players - a.players);

  document.getElementById("resultCount").textContent =
    `${filtered.length} server${filtered.length !== 1 ? "s" : ""}`;

  if (filtered.length === 0) {
    list.innerHTML = `<div class="empty">No servers match your filters.</div>`;
    return;
  }

  list.innerHTML = filtered.map(cardHTML).join("");
  wireCopyButtons(list);
}

/* =========================================================
   Copy to clipboard
   ========================================================= */
function wireCopyButtons(scope) {
  scope.querySelectorAll(".copy-btn").forEach(btn => {
    btn.onclick = () => copyIP(btn);
  });
}
function copyIP(btn) {
  const ip = btn.dataset.ip;
  navigator.clipboard.writeText(ip).then(() => showCopied(btn)).catch(() => {
    const ta = document.createElement("textarea");
    ta.value = ip;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand("copy");
    document.body.removeChild(ta);
    showCopied(btn);
  });
}
function showCopied(btn) {
  const original = btn.textContent;
  btn.textContent = "Copied!";
  btn.classList.add("copied");
  setTimeout(() => {
    btn.textContent = original;
    btn.classList.remove("copied");
  }, 1500);
}

/* =========================================================
   Join modal
   ========================================================= */
const joinModal = document.getElementById("joinModal");
document.getElementById("joinBtn").onclick = () => { joinModal.hidden = false; };
document.getElementById("modalClose").onclick = () => { joinModal.hidden = true; };
joinModal.addEventListener("click", (e) => {
  if (e.target === joinModal) joinModal.hidden = true;
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") joinModal.hidden = true;
});

/* =========================================================
   Search + clear
   ========================================================= */
document.getElementById("searchInput").addEventListener("input", e => {
  searchText = e.target.value.trim().toLowerCase();
  render();
});
document.getElementById("clearFilters").addEventListener("click", () => {
  activeVersion = null;
  activeStatus = null;
  searchText = "";
  versionInput.value = "";
  document.getElementById("searchInput").value = "";
  refreshStatusStates();
  render();
});

/* =========================================================
   Init
   ========================================================= */
buildStatusTags();
renderVersionOptions();   // show fallback list immediately
loadVersionsFromModrinth(); // then replace with live Modrinth data
renderFeatured();
render();
