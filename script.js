// ---- Placeholder server data ----
const serverNames = [
  "Crimson Peak",
  "Azure Haven",
  "Nova Realms",
  "Shadowmere",
  "Ironhold",
  "Frostvale",
  "Emberfall",
  "Stormwatch"
];

// The 3 paid / featured servers
const featuredNames = ["Aurora Prime", "Celestial Core", "Obsidian Elite"];

const versions = ["1.21.1", "1.20.4", "1.19.4"];

function makeServer(name, i, featured) {
  const online = Math.random() > 0.2; // ~80% online
  return {
    name,
    version: versions[i % versions.length],
    ip: "mc.ExampleIp.net",
    players: online ? Math.floor(Math.random() * 900) + 20 : 0,
    status: online ? "Online" : "Offline",
    desc: "A short placeholder description for this server.",
    featured
  };
}

// Featured servers are paid -> always online, healthy player counts
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

// ---- Build filter tags ----
const allVersions = [...new Set(
  [...featuredServers, ...normalServers].map(s => s.version)
)].sort().reverse();
const allStatuses = ["Online", "Offline"];

function buildTags() {
  const vBox = document.getElementById("versionTags");
  const sBox = document.getElementById("statusTags");

  allVersions.forEach(v => {
    const el = document.createElement("span");
    el.className = "tag";
    el.textContent = v;
    el.dataset.version = v;
    el.onclick = () => {
      activeVersion = activeVersion === v ? null : v;
      refreshTagStates();
      render();
    };
    vBox.appendChild(el);
  });

  allStatuses.forEach(st => {
    const el = document.createElement("span");
    el.className = "tag";
    el.textContent = st;
    el.dataset.status = st;
    el.onclick = () => {
      activeStatus = activeStatus === st ? null : st;
      refreshTagStates();
      render();
    };
    sBox.appendChild(el);
  });
}

function refreshTagStates() {
  document.querySelectorAll("[data-version]").forEach(el =>
    el.classList.toggle("active", el.dataset.version === activeVersion));
  document.querySelectorAll("[data-status]").forEach(el =>
    el.classList.toggle("active", el.dataset.status === activeStatus));
}

// ---- Filtering ----
function matches(s) {
  const okVersion = !activeVersion || s.version === activeVersion;
  const okStatus = !activeStatus || s.status === activeStatus;
  const okSearch = !searchText ||
    s.name.toLowerCase().includes(searchText) ||
    s.ip.toLowerCase().includes(searchText);
  return okVersion && okStatus && okSearch;
}

// ---- Card HTML ----
function cardHTML(s) {
  const statusClass = s.status === "Online" ? "online" : "offline";
  const playersLine = s.status === "Online"
    ? `<span class="players"><span class="dot"></span>${s.players} Players Online</span>`
    : `<span class="players" style="color:#f8a3a3;"><span class="dot" style="background:#f87171;box-shadow:none;"></span>Offline</span>`;

  return `
    <article class="server-card ${s.featured ? "featured" : ""}">
      <!-- Top half: banner -->
      <div class="banner">
        PlaceHolder Banner
        ${s.featured ? `<span class="featured-badge">★ Featured</span>` : ""}
        <div class="banner-ip">
          <span class="ip-text">${s.ip}</span>
          <button class="copy-btn" data-ip="${s.ip}">Copy</button>
        </div>
      </div>

      <!-- Bottom half -->
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

// ---- Render ----
function render() {
  const list = document.getElementById("serverList");

  const filteredFeatured = featuredServers
    .filter(matches)
    .sort((a, b) => b.players - a.players);

  const filteredNormal = normalServers
    .filter(matches)
    // Default sort: most players online first
    .sort((a, b) => b.players - a.players);

  const total = filteredFeatured.length + filteredNormal.length;
  document.getElementById("resultCount").textContent =
    `${total} server${total !== 1 ? "s" : ""}`;

  if (total === 0) {
    list.innerHTML = `<div class="empty">No servers match your filters.</div>`;
    return;
  }

  let html = "";

  // Featured group at the top
  if (filteredFeatured.length) {
    html += `<div class="section-label">Featured Servers</div>`;
    html += filteredFeatured.map(cardHTML).join("");
    // One-server-sized gap, only if there are normal servers below
    if (filteredNormal.length) {
      html += `<div class="list-gap">Server List</div>`;
    }
  }

  // Normal servers
  html += filteredNormal.map(cardHTML).join("");

  list.innerHTML = html;

  // Wire up copy buttons
  list.querySelectorAll(".copy-btn").forEach(btn => {
    btn.onclick = () => copyIP(btn);
  });
}

// ---- Copy to clipboard ----
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

// ---- Search + clear ----
document.getElementById("searchInput").addEventListener("input", e => {
  searchText = e.target.value.trim().toLowerCase();
  render();
});
document.getElementById("clearFilters").addEventListener("click", () => {
  activeVersion = null;
  activeStatus = null;
  searchText = "";
  document.getElementById("searchInput").value = "";
  refreshTagStates();
  render();
});

// ---- Init ----
buildTags();
render();
