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

// The first 3 names will be used for the paid / featured servers
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

// Featured servers always online (they're paid)
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
      <div class="banner">
        PlaceHolder Banner
        ${s.featured ? `<span class="featured-badge">★ Featured</span>` : ""}
