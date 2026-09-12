// ---- Example server data ----
const servers = [
  {
    name: "MoonCraft Survival",
    version: "1.21.1",
    ip: "play.mooncraft.net",
    desc: "Classic survival with land claims, economy and a friendly community.",
    keywords: ["Survival", "Economy", "SMP"],
    banner: "linear-gradient(135deg, #1e3a8a, #3b82f6)"
  },
  {
    name: "SkyBlock Legends",
    version: "1.20.4",
    ip: "sky.moonlight.gg",
    desc: "Build your island empire with custom minions and challenges.",
    keywords: ["SkyBlock", "Economy", "PvE"],
    banner: "linear-gradient(135deg, #0f766e, #22d3ee)"
  },
  {
    name: "Prison Blocks",
    version: "1.21.1",
    ip: "prison.moonlight.gg",
    desc: "Mine, rank up and rule the yard. A → Free progression system.",
    keywords: ["Prison", "PvP", "Economy"],
    banner: "linear-gradient(135deg, #7c2d12, #f97316)"
  },
  {
    name: "Bedwars Arena",
    version: "1.19.4",
    ip: "bw.moonlight.gg",
    desc: "Fast-paced team bedwars with ranked queues and cosmetics.",
    keywords: ["Bedwars", "PvP", "Minigames"],
    banner: "linear-gradient(135deg, #581c87, #a855f7)"
  },
  {
    name: "Factions Wars",
    version: "1.20.1",
    ip: "factions.mooncraft.net",
    desc: "Raid, betray and dominate. Weekly top-faction payouts.",
    keywords: ["Factions", "PvP", "SMP"],
    banner: "linear-gradient(135deg, #831843, #ec4899)"
  },
  {
    name: "Creative Plots",
    version: "1.21.1",
    ip: "build.moonlight.gg",
    desc: "Unlimited plots, WorldEdit and a supportive building community.",
    keywords: ["Creative", "PvE"],
    banner: "linear-gradient(135deg, #1e40af, #6366f1)"
  },
  {
    name: "Vanilla Anarchy",
    version: "1.20.4",
    ip: "anarchy.moonlight.gg",
    desc: "No rules, no resets. Pure survival chaos since day one.",
    keywords: ["Anarchy", "Survival", "PvP"],
    banner: "linear-gradient(135deg, #374151, #6b7280)"
  },
  {
    name: "MiniGame Hub",
    version: "1.19.4",
    ip: "hub.moonlight.gg",
    desc: "Twenty rotating minigames, parties and daily rewards.",
    keywords: ["Minigames", "PvE", "PvP"],
    banner: "linear-gradient(135deg, #155e75, #38bdf8)"
  }
];

// ---- State ----
let activeVersion = null;
let activeKeyword = null;
let searchText = "";

// ---- Build filter tags ----
const versions = [...new Set(servers.map(s => s.version))].sort().reverse();
const keywords = [...new Set(servers.flatMap(s => s.keywords))].sort();

function buildTags() {
  const vBox = document.getElementById("versionTags");
  const kBox = document.getElementById("keywordTags");

  versions.forEach(v => {
    const el = document.createElement("span");
    el.className = "tag";
    el.textContent = v;
    el.onclick = () => {
      activeVersion = activeVersion === v ? null : v;
      refreshTagStates();
      render();
    };
    el.dataset.version = v;
    vBox.appendChild(el);
  });

  keywords.forEach(k => {
    const el = document.createElement("span");
    el.className = "tag";
    el.textContent = k;
    el.onclick = () => {
      activeKeyword = activeKeyword === k ? null : k;
      refreshTagStates();
      render();
    };
    el.dataset.keyword = k;
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
  const filtered = servers.filter(s => {
    const okVersion = !activeVersion || s.version === activeVersion;
    const okKeyword = !activeKeyword || s.keywords.includes(activeKeyword);
    const okSearch = !searchText ||
      s.name.toLowerCase().includes(searchText) ||
      s.ip.toLowerCase().includes(searchText);
    return okVersion && okKeyword && okSearch;
  });

  document.getElementById("resultCount").textContent =
    `${filtered.length} server${filtered.length !== 1 ? "s" : ""}`;

  if (filtered.length === 0) {
    list.innerHTML = `<div class="empty">No servers match your filters.</div>`;
    return;
  }

  list.innerHTML = filtered.map(s => `
    <article class="server-card">
      <div class="banner" style="background:${s.banner}">${s.name}</div>
      <div class="card-body">
        <div class="card-top">
          <div class="card-title">${s.name}</div>
          <div class="version-pill">${s.version}</div>
        </div>
        <div class="card-desc">${s.desc}</div>
        <div class="ip-row">
          <span class="ip-text">${s.ip}</span>
          <button class="copy-btn" data-ip="${s.ip}">Copy IP</button>
        </div>
        <div class="card-tags">
          ${s.keywords.map(k => `<span class="mini-tag">${k}</span>`).join("")}
        </div>
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
  navigator.clipboard.writeText(ip).then(() => {
    const original = btn.textContent;
    btn.textContent = "Copied!";
    btn.classList.add("copied");
    setTimeout(() => {
      btn.textContent = original;
      btn.classList.remove("copied");
    }, 1500);
  }).catch(() => {
    // Fallback for older browsers
    const ta = document.createElement("textarea");
    ta.value = ip;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand("copy");
    document.body.removeChild(ta);
    btn.textContent = "Copied!";
    setTimeout(() => (btn.textContent = "Copy IP"), 1500);
  });
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
