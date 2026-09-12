// ---- Placeholder server data (all identical layout, random names) ----
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

const versions = ["1.21.1", "1.20.4", "1.19.4"];
const keywordPool = ["Survival", "Economy", "SMP", "PvP", "Minigames", "Skyblock", "Creative"];

// Build servers with made-up player counts
const servers = serverNames.map((name, i) => ({
  name,
  version: versions[i % versions.length],
  ip: "mc.ExampleIp.net",
  players: Math.floor(Math.random() * 900) + 20,   // made-up player amount
  desc: "A short placeholder description for this server.",
  keywords: [
    keywordPool[i % keywordPool.length],
    keywordPool[(i + 3) % keywordPool.length]
  ]
}));

// ---- State ----
let activeVersion = null;
let activeKeyword = null;
let searchText = "";

// ---- Build filter tags ----
const allVersions = [...new Set(servers.map(s => s.version))].sort().reverse();
const allKeywords = [...new Set(servers.flatMap(s => s.keywords))].sort();

function buildTags() {
  const vBox = document.getElementById("versionTags");
  const kBox = document.getElementById("keywordTags");

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

  allKeywords.forEach(k => {
    const el = document.createElement("span");
    el.className = "tag";
    el.textContent = k;
    el.dataset.keyword = k;
    el.onclick = () => {
      activeKeyword = activeKeyword === k ? null : k;
      refreshTagStates();
      render();
    };
    kBox.appendChild(el);
  });
}

function refreshTagStates() {
  document.querySelectorAll("[data-version]").forEach(el =>
    el.classList.toggle("active", el.dataset.version === activeVersion));
  document.querySelectorAll("[data-keyword]").forEach(el =>
    el.classList.toggle("active", el.dataset.keyword === activeKeyword));
}

// ---- Render server cards ----
function render() {
  const list = document.getElementById("serverList");

  const filtered = servers
    .filter(s => {
      const okVersion = !activeVersion || s.version === activeVersion;
      const okKeyword = !activeKeyword || s.keywords.includes(activeKeyword);
      const okSearch = !searchText ||
        s.name.toLowerCase().includes(searchText) ||
        s.ip.toLowerCase().includes(searchText);
      return okVersion && okKeyword && okSearch;
    })
    // Default sort: most players online first
    .sort((a, b) => b.players - a.players);

  document.getElementById("resultCount").textContent =
    `${filtered.length} server${filtered.length !== 1 ? "s" : ""}`;

  if (filtered.length === 0) {
    list.innerHTML = `<div class="empty">No servers match your filters.</div>`;
    return;
  }

  list.innerHTML = filtered.map(s => `
    <article class="server-card">
      <!-- Top half: placeholder banner + IP upper-right -->
      <div class="banner">
        PlaceHolder Banner
        <div class="banner-ip">
          <span class="ip-text">${s.ip}</span>
          <button class="copy-btn" data-ip="${s.ip}">Copy</button>
        </div>
      </div>

      <!-- Bottom half -->
      <div class="card-body">
        <div class="pfp">Blank<br>pfp</div>
        <div class="info">
          <div class="card-title">${s.name}</div>
          <div class="info-row">
            <span class="players"><span class="dot"></span>${s.players} Players Online</span>
            <span class="card-desc">${s.desc}</span>
          </div>
        </div>
        <div class="version-pill">${s.version}</div>
      </div>
    </article>
  `).join("");

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
  activeKeyword = null;
  searchText = "";
  document.getElementById("searchInput").value = "";
  refreshTagStates();
  render();
});

// ---- Init ----
buildTags();
render();
