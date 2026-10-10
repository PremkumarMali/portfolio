const d = window.PORTFOLIO;
const $ = (s) => document.querySelector(s);
const esc = (s = "") =>
  String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
const each = (arr = [], fn) => arr.map(fn).join("");
const ext = (href) => `href="${esc(href)}" target="_blank" rel="noopener noreferrer"`;

const ICONS = {
  github:
    '<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true"><path d="M12 .3a12 12 0 0 0-3.8 23.4c.6.1.8-.3.8-.6v-2c-3.3.7-4-1.6-4-1.6-.6-1.4-1.4-1.8-1.4-1.8-1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1 1.8 2.8 1.3 3.5 1 0-.8.4-1.3.7-1.6-2.7-.3-5.5-1.3-5.5-5.9 0-1.3.5-2.4 1.2-3.2 0-.3-.5-1.5.2-3.2 0 0 1-.3 3.3 1.2a11.5 11.5 0 0 1 6 0C17.3 4.7 18.3 5 18.3 5c.7 1.7.2 2.9.1 3.2.8.8 1.2 1.9 1.2 3.2 0 4.6-2.8 5.6-5.5 5.9.4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6A12 12 0 0 0 12 .3"/></svg>',
  linkedin:
    '<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true"><path d="M20.4 20.5h-3.6v-5.6c0-1.3 0-3-1.8-3-1.9 0-2.1 1.4-2.1 2.9v5.7H9.4V9h3.4v1.6c.5-.9 1.6-1.9 3.4-1.9 3.6 0 4.3 2.4 4.3 5.5v6.3zM5.3 7.4a2.1 2.1 0 1 1 0-4.1 2.1 2.1 0 0 1 0 4.1zm1.8 13.1H3.6V9h3.5v11.5zM22.2 0H1.8C.8 0 0 .8 0 1.7v20.6c0 .9.8 1.7 1.8 1.7h20.4c1 0 1.8-.8 1.8-1.7V1.7C24 .8 23.2 0 22.2 0z"/></svg>',
  email:
    '<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true"><path d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L5.455 4.64 12 9.548l6.545-4.91 1.528-1.145C21.69 2.28 24 3.434 24 5.457z"/></svg>',
};
const LABELS = { github: "GitHub", linkedin: "LinkedIn", email: "Gmail" };

const socials = () =>
  each(
    Object.entries({ ...d.links, email: d.email && `mailto:${d.email}` }).filter(([, url]) => url),
    ([key, url]) =>
      `<li><a class="icon-btn" ${key === "email" ? `href="${esc(url)}"` : ext(url)} aria-label="${LABELS[key] || key}">${ICONS[key] || esc(key)}</a></li>`
  );

const chips = (items) => `<ul class="chips" aria-label="Tech used">${each(items, (t) => `<li>${esc(t)}</li>`)}</ul>`;

const links = (p) =>
  [
    p.repo && `<a class="btn small" ${ext(p.repo)}>${ICONS.github} Code<span class="sr-only">: ${esc(p.title)}</span></a>`,
    p.demo && `<a class="btn small primary" ${ext(p.demo)}>Live demo<span class="sr-only">: ${esc(p.title)}</span></a>`,
  ]
    .filter(Boolean)
    .join("");

// Put HTML into a section, or remove the section and its nav link if there is nothing to show.
function fill(id, html) {
  const section = document.getElementById(id);
  if (!html) {
    section.remove();
    $(`#nav-links a[href="#${id}"]`)?.parentElement.remove();
    return;
  }
  section.querySelector("[data-fill]").innerHTML = html;
}

// Hero
$("#brand").textContent = d.name;
// Each word sits in a mask so the intro can slide it up into view.
$("#hero-name").innerHTML = d.name
  .split(" ")
  .map((w, i) => `<span class="w"><span style="--i:${i}">${esc(w)}</span></span>`)
  .join(" ");
d.pitch ? ($("#hero-pitch").textContent = d.pitch) : $("#hero-pitch").remove();
const meta = [d.role, d.location].filter(Boolean).join(", ");
meta ? ($("#hero-meta").textContent = meta) : $("#hero-meta").remove();
d.resume ? ($("#resume-btn").href = d.resume) : $("#resume-btn").remove();

// Projects: large featured cards, then a compact "More projects" grid.
const featured = d.projects.filter((p) => p.featured);
const more = d.projects.filter((p) => !p.featured);

$("#featured-list").innerHTML = each(
  featured,
  (p, i) => `
  <article class="project" id="project-${i}">
    <div class="project-body">
      ${p.category ? `<p class="category">${esc(p.category)}</p>` : ""}
      <h3>${esc(p.title)}</h3>
      <p class="desc">${esc(p.description)}</p>
      ${p.features?.length ? `<ul class="features">${each(p.features, (f) => `<li>${esc(f)}</li>`)}</ul>` : ""}
      ${chips(p.tech)}
      <div class="project-links">${links(p)}</div>
    </div>
  </article>`
);

if (more.length) {
  $("#more-list").innerHTML = each(
      more,
      (p) => `
    <article class="mini">
      ${p.category ? `<p class="category">${esc(p.category)}</p>` : ""}
      <h4><a ${ext(p.demo || p.repo)}>${esc(p.title)}</a></h4>
      <p class="desc">${esc(p.description)}</p>
      ${chips(p.tech)}
    </article>`
    );
} else {
  $("#more-wrap").remove();
}

// Other sections
fill("about", each(d.bio, (p) => `<p>${esc(p).replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")}</p>`));
if (d.aboutHeading && $("#about-h")) $("#about-h").textContent = d.aboutHeading;

// Education card and number boxes inside About.
const edu = d.education?.[0];
if (edu && $("#edu-card")) {
  $("#edu-card").innerHTML = `
    <p class="edu-label">Education</p>
    <h3>${esc(edu.degree)}</h3>
    ${edu.specialization ? `<p class="edu-spec">Specialization: ${esc(edu.specialization)}</p>` : ""}
    <p class="meta">${esc(edu.school)}</p>
    ${edu.period ? `<p class="meta">${esc(edu.period)}</p>` : ""}`;
} else $("#edu-card")?.remove();
d.aboutStats?.length && $("#about-stats")
  ? ($("#about-stats").innerHTML = each(d.aboutStats, (st) => `<li><span class="stat-value">${esc(st.value)}</span><span class="stat-label">${esc(st.label)}</span></li>`))
  : $("#about-stats")?.remove();

fill(
  "skills",
  each(d.skills, (g) => `<div class="skill-row"><h3>${esc(g.group)}</h3>${chips(g.items)}</div>`)
);

fill(
  "experience",
  each(
    d.experience,
    (e) => `
    <li>
      <p class="date">${esc(e.period)}</p>
      <div>
        <h3>${esc(e.title)} <span class="muted">· ${esc(e.company)}</span></h3>
        <ul class="features">${each(e.points, (pt) => `<li>${esc(pt)}</li>`)}</ul>
      </div>
    </li>`
  )
);

fill(
  "certifications",
  each(
    d.certifications,
    (c) => `
    <li>
      <p class="date">${esc(c.year)}</p>
      <div><h3>${c.url ? `<a ${ext(c.url)}>${esc(c.name)}</a>` : esc(c.name)}</h3><p class="meta">${esc(c.issuer)}</p></div>
    </li>`
  )
);

// Contact: Formspree if configured, else mailto, else just the social links.
const form = $("#contact-form");
if (d.formspreeId) {
  form.action = `https://formspree.io/f/${encodeURIComponent(d.formspreeId)}`;
  form.hidden = false;
} else if (d.email) {
  form.hidden = false;
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const f = new FormData(form);
    const subject = `Portfolio contact from ${f.get("name")}`;
    const body = `${f.get("message")}\n\n${f.get("name")} (${f.get("email")})`;
    location.href = `mailto:${d.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  });
}
$("#contact-intro").textContent = form.hidden
  ? "The quickest way to reach me is LinkedIn. I'm happy to talk about roles, internships and projects."
  : "Have a role, internship or project in mind? Send me a message and I'll get back to you.";
$("#contact-socials").innerHTML = socials();

// Footer
$("#copyright").textContent = `© ${new Date().getFullYear()} ${d.name}`;
$("#footer-socials").innerHTML = socials();

// Theme toggle
const root = document.documentElement;
const toggle = $("#theme-toggle");
toggle.setAttribute("aria-pressed", root.dataset.theme === "dark");
toggle.addEventListener("click", () => {
  const theme = root.dataset.theme === "dark" ? "light" : "dark";
  root.dataset.theme = theme;
  toggle.setAttribute("aria-pressed", theme === "dark");
  try { localStorage.setItem("theme", theme); } catch (e) {}
});

// Mobile menu
const menuBtn = $(".menu-btn");
const setMenu = (open) => menuBtn.setAttribute("aria-expanded", open);
menuBtn.addEventListener("click", () => setMenu(menuBtn.getAttribute("aria-expanded") !== "true"));
$("#nav-links").addEventListener("click", (e) => e.target.closest("a") && setMenu(false));
document.addEventListener("keydown", (e) => e.key === "Escape" && setMenu(false));

// Hero 3D: Three.js loads after the page is usable; without WebGL the canvas keeps a static glow.
const cv = $("#hero-3d");
if (cv)
  import("./hero3d.js")
    .then((m) => {
      const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
      m.start(cv, still);
      if ($("#hero-field")) m.startField($("#hero-field"), still);
    })
    .catch(() => cv.classList.add("no-webgl"));
