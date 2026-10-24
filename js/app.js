/* ==========================================================================
   Omar Alshaer — site logic
   Posts, comments and likes live in Supabase when js/config.js has its keys.
   Without keys the site runs in demo mode on this browser's localStorage,
   so it can be previewed with zero setup.
   ========================================================================== */
(() => {
  "use strict";

  const C = window.SITE_CONFIG || {};
  const SUPABASE_SDK = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/dist/umd/supabase.js";
  const MAX_UPLOAD_MB = 15;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Helpers ---------- */
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const esc = (s) =>
    String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  const pad = (n) => String(n).padStart(2, "0");
  const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  const errMsg = (err) => (err && err.message) || "Something went wrong. Please try again.";

  const local = {
    get(key, fallback) {
      try {
        const v = localStorage.getItem(key);
        return v == null ? fallback : JSON.parse(v);
      } catch {
        return fallback;
      }
    },
    set(key, value) {
      try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
      } catch {
        return false;
      }
    },
    remove(key) {
      try { localStorage.removeItem(key); } catch {}
    },
  };

  const ICONS = {
    instagram: '<rect width="20" height="20" x="2" y="2" rx="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><path d="M17.5 6.5h.01"/>',
    linkedin: '<path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/>',
    x: '<path d="M4 4l11.733 16h4.267l-11.733-16z"/><path d="M4 20l6.768-6.768m2.46-2.46L20 4"/>',
    youtube: '<path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17"/><path d="m10 15 5-3-5-3z"/>',
    tiktok: '<path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>',
    snapchat: '<path d="M9 10h.01"/><path d="M15 10h.01"/><path d="M12 2a8 8 0 0 0-8 8v12l3-3 2.5 2.5L12 19l2.5 2.5L17 19l3 3V10a8 8 0 0 0-8-8z"/>',
    whatsapp: '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>',
    mail: '<rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>',
    link: '<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>',
    heart: '<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>',
    comment: '<path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/>',
    close: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
    left: '<path d="m15 18-6-6 6-6"/>',
    right: '<path d="m9 18 6-6-6-6"/>',
    upload: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m17 8-5-5-5 5"/><path d="M12 3v12"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/>',
    moon: '<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>',
    trash: '<path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>',
    arrowUpRight: '<path d="M7 7h10v10"/><path d="M7 17 17 7"/>',
    arrowDown: '<path d="M12 5v14"/><path d="m19 12-7 7-7-7"/>',
    send: '<path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/>',
    lock: '<rect width="18" height="11" x="3" y="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
    menu: '<path d="M4 6h16"/><path d="M4 12h16"/><path d="M4 18h16"/>',
    camera: '<path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/>',
  };

  const icon = (name, cls = "") =>
    `<svg class="i ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name] || ICONS.link}</svg>`;

  function injectIcons(root = document) {
    $$("[data-icon]", root).forEach((el) => {
      if (!el.querySelector("svg.i")) el.insertAdjacentHTML("afterbegin", icon(el.dataset.icon));
    });
  }

  const initials = (name) =>
    (String(name || "").trim().split(/\s+/).slice(0, 2).map((w) => [...w][0]).join("") || "?").toUpperCase();
  const hue = (name) => [...String(name)].reduce((h, ch) => (h * 31 + ch.codePointAt(0)) % 360, 7);
  const fmtDate = (iso) => new Date(iso).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });

  function timeAgo(iso) {
    const s = (Date.now() - new Date(iso).getTime()) / 1000;
    if (s < 60) return "just now";
    if (s < 3600) return `${Math.floor(s / 60)}m ago`;
    if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
    if (s < 604800) return `${Math.floor(s / 86400)}d ago`;
    return fmtDate(iso);
  }

  function toast(message, type = "") {
    const box = $("#toasts");
    // Modal dialogs render in the top layer, so toasts must live inside an open one to be seen.
    const host = $("dialog[open]") || document.body;
    if (box.parentElement !== host) host.appendChild(box);
    const t = document.createElement("div");
    t.className = `toast ${type}`;
    t.textContent = message;
    box.appendChild(t);
    setTimeout(() => {
      t.classList.add("out");
      setTimeout(() => t.remove(), 320);
    }, type === "error" ? 4200 : 2800);
  }

  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const s = document.createElement("script");
      s.src = src;
      s.onload = resolve;
      s.onerror = () => reject(new Error("Couldn't load the database library."));
      document.head.appendChild(s);
    });
  }

  /* ---------- Images ---------- */
  // Resize + re-encode before upload: phone photos are often 5–10 MB, this makes them ~300 KB.
  async function compressImage(file, maxSide, quality) {
    const img = await new Promise((resolve, reject) => {
      const url = URL.createObjectURL(file);
      const el = new Image();
      el.onload = () => { URL.revokeObjectURL(url); resolve(el); };
      el.onerror = () => { URL.revokeObjectURL(url); reject(new Error("That file couldn't be opened as an image.")); };
      el.src = url;
    });
    const scale = Math.min(1, maxSide / Math.max(img.naturalWidth, img.naturalHeight));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(img.naturalWidth * scale);
    canvas.height = Math.round(img.naturalHeight * scale);
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    return new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", quality));
  }

  const blobToDataURL = (blob) =>
    new Promise((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(r.result);
      r.onerror = () => reject(r.error);
      r.readAsDataURL(blob);
    });

  function markLoaded(root) {
    $$("img", root).forEach((img) => {
      if (img.complete && img.naturalWidth) img.classList.add("loaded");
    });
  }

  /* ---------- Data: demo store (localStorage) ---------- */
  function seedDemo() {
    const now = Date.now();
    const at = (days, hours = 0) => new Date(now - days * 864e5 - hours * 36e5).toISOString();
    const photo = (seed) => `https://picsum.photos/seed/${seed}/1080/1350`;
    const work = [
      ["oa-lines", "Lines, light and a little patience.", 2, 48],
      ["oa-horizon", "Where the road meets the horizon.", 6, 31],
      ["oa-structure", "Every structure tells a story.", 11, 57],
      ["oa-golden", "Golden hour never gets old.", 17, 22],
      ["oa-rain", "The city after the rain.", 24, 40],
      ["oa-detail", "Details make the design.", 33, 19],
    ].map(([seed, caption, d, likes]) => ({
      id: "w-" + seed, created_at: at(d), author_name: C.name, caption, image_url: photo(seed), featured: true, likes,
    }));
    const community = [
      ["oa-c-weekend", "Ahmed", "Your photos made me take my camera out this weekend 📷", 0, 5, 7],
      ["oa-c-morning", "Sara", "Morning walk view 🌿", 3, 0, 12],
      ["oa-c-symmetry", "Khalid", "Tried the symmetry trick — what do you think?", 8, 0, 9],
    ].map(([seed, author_name, caption, d, h, likes]) => ({
      id: "c-" + seed, created_at: at(d, h), author_name, caption, image_url: photo(seed), featured: false, likes,
    }));
    const comments = [
      ["w-oa-lines", "Yousef", "This composition is unreal 🔥", 1, 6, false],
      ["w-oa-lines", "Maryam", "Where was this taken?", 1, 2, false],
      ["w-oa-structure", "Hamed", "Love the symmetry in this one 😄", 9, 0, false],
    ].map(([post_id, author_name, body, d, h, by_owner], i) => ({
      id: "m" + i, created_at: at(d, h), post_id, author_name, body, by_owner,
    }));
    return { posts: [...work, ...community], comments };
  }

  function demoStore() {
    const KEY = "oa_demo_v1";
    let db = local.get(KEY, null);
    if (!db || !Array.isArray(db.posts) || !Array.isArray(db.comments)) {
      db = seedDemo();
      local.set(KEY, db);
    }
    const save = () => {
      if (!local.set(KEY, db)) throw new Error("This browser's storage is full — try a smaller photo, or connect the database (see README).");
    };
    const countFor = (id) => db.comments.filter((c) => c.post_id === id).length;
    let owner = false;
    try { owner = sessionStorage.getItem("oa_demo_owner") === "1"; } catch {}

    return {
      mode: "demo",
      get owner() { return owner; },
      async listPosts(featured) {
        return db.posts
          .filter((p) => p.featured === featured)
          .sort((a, b) => b.created_at.localeCompare(a.created_at))
          .map((p) => ({ ...p, comment_count: countFor(p.id) }));
      },
      async createPost({ author_name, caption, blob, featured }) {
        const post = {
          id: uid(), created_at: new Date().toISOString(), author_name, caption,
          image_url: await blobToDataURL(blob), featured, likes: 0,
        };
        db.posts.push(post);
        try { save(); } catch (err) { db.posts.pop(); throw err; }
        return post;
      },
      async deletePost(post) {
        db.posts = db.posts.filter((p) => p.id !== post.id);
        db.comments = db.comments.filter((c) => c.post_id !== post.id);
        save();
      },
      async likePost(id) {
        const p = db.posts.find((x) => x.id === id);
        p.likes += 1;
        save();
        return p.likes;
      },
      async listComments(postId) {
        return db.comments.filter((c) => c.post_id === postId).sort((a, b) => a.created_at.localeCompare(b.created_at));
      },
      async addComment(fields) {
        const c = { id: uid(), created_at: new Date().toISOString(), ...fields };
        db.comments.push(c);
        try { save(); } catch (err) { db.comments.pop(); throw err; }
        return c;
      },
      async deleteComment(id) {
        db.comments = db.comments.filter((c) => c.id !== id);
        save();
      },
      async signIn() {
        owner = true;
        try { sessionStorage.setItem("oa_demo_owner", "1"); } catch {}
      },
      async signOut() {
        owner = false;
        try { sessionStorage.removeItem("oa_demo_owner"); } catch {}
      },
      reset() {
        local.remove(KEY);
        local.remove("oa_liked");
      },
    };
  }

  /* ---------- Data: live store (Supabase) ---------- */
  function liveStore(sb) {
    const must = ({ data, error }) => {
      if (error) throw error;
      return data;
    };
    let owner = false;

    const s = {
      mode: "live",
      get owner() { return owner; },
      async refreshOwner() {
        const { data } = await sb.auth.getSession();
        owner = data.session ? (await sb.rpc("is_owner")).data === true : false;
      },
      async listPosts(featured) {
        const rows = must(
          await sb.from("posts").select("*, comments(count)").eq("featured", featured).order("created_at", { ascending: false })
        );
        return rows.map(({ comments, ...p }) => ({ ...p, comment_count: (comments && comments[0] && comments[0].count) || 0 }));
      },
      async createPost({ author_name, caption, blob, featured }) {
        const image_path = `${featured ? "work" : "community"}/${uid()}.jpg`;
        must(await sb.storage.from("photos").upload(image_path, blob, { contentType: "image/jpeg", cacheControl: "31536000" }));
        const image_url = sb.storage.from("photos").getPublicUrl(image_path).data.publicUrl;
        return must(await sb.from("posts").insert({ author_name, caption, image_url, image_path, featured }).select().single());
      },
      async deletePost(post) {
        must(await sb.from("posts").delete().eq("id", post.id));
        if (post.image_path) await sb.storage.from("photos").remove([post.image_path]);
      },
      async likePost(id) {
        return must(await sb.rpc("like_post", { pid: id }));
      },
      async listComments(postId) {
        return must(await sb.from("comments").select("*").eq("post_id", postId).order("created_at"));
      },
      async addComment(fields) {
        return must(await sb.from("comments").insert(fields).select().single());
      },
      async deleteComment(id) {
        must(await sb.from("comments").delete().eq("id", id));
      },
      async signIn(email, password) {
        must(await sb.auth.signInWithPassword({ email, password }));
        await s.refreshOwner();
        if (!owner) {
          await sb.auth.signOut();
          throw new Error("Signed in, but this account isn't listed as the site owner.");
        }
      },
      async signOut() {
        await sb.auth.signOut();
        owner = false;
      },
    };
    return s;
  }

  async function createStore() {
    const cfg = C.supabase || {};
    if (!cfg.url || !cfg.anonKey) return demoStore();
    if (!window.supabase) await loadScript(SUPABASE_SDK);
    const s = liveStore(window.supabase.createClient(cfg.url, cfg.anonKey));
    await s.refreshOwner();
    return s;
  }

  /* ---------- State ---------- */
  let store = null;
  const state = {
    work: [],
    community: [],
    liked: new Set(local.get("oa_liked", [])),
    name: local.get("oa_name", ""),
    rendered: {},
    dirty: false,
  };
  const LISTS = {
    work: { grid: "#work-grid", empty: "#work-empty" },
    community: { grid: "#community-grid", empty: "#community-empty" },
  };

  function rememberName(name) {
    state.name = name;
    local.set("oa_name", name);
    $$('input[name="name"]').forEach((input) => {
      if (!input.value.trim()) input.value = name;
    });
  }

  /* ---------- Profile ---------- */
  const SOCIALS = {
    instagram: { label: "Instagram", icon: "instagram", url: (v) => `https://instagram.com/${v}`, handle: (v) => `@${v}` },
    x: { label: "X", icon: "x", url: (v) => `https://x.com/${v}`, handle: (v) => `@${v}` },
    tiktok: { label: "TikTok", icon: "tiktok", url: (v) => `https://www.tiktok.com/@${v}`, handle: (v) => `@${v}` },
    snapchat: { label: "Snapchat", icon: "snapchat", url: (v) => `https://www.snapchat.com/add/${v}`, handle: (v) => v },
    linkedin: { label: "LinkedIn", icon: "linkedin", url: (v) => v, handle: (v) => v.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "") },
    youtube: { label: "YouTube", icon: "youtube", url: (v) => v, handle: (v) => v.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "") },
    whatsapp: { label: "WhatsApp", icon: "whatsapp", url: (v) => `https://wa.me/${v.replace(/\D/g, "")}`, handle: (v) => `+${v.replace(/\D/g, "")}` },
    email: { label: "Email", icon: "mail", url: (v) => `mailto:${v}`, handle: (v) => v },
  };

  function socialLinks() {
    const s = C.socials || {};
    return Object.entries(SOCIALS)
      .filter(([key]) => s[key] && String(s[key]).trim())
      .map(([key, def]) => {
        const v = String(s[key]).trim().replace(/^@/, "");
        return { key, label: def.label, icon: def.icon, url: def.url(v), handle: def.handle(v) };
      });
  }

  function bind(key, value) {
    $$(`[data-bind="${key}"]`).forEach((el) => {
      el.textContent = value || "";
      if (el.hasAttribute("data-hide-empty")) el.hidden = !value;
    });
  }

  function ownerAvatar() {
    return C.avatar
      ? `<span class="avatar-sm owner"><img src="${esc(C.avatar)}" alt=""></span>`
      : `<span class="avatar-sm owner">${esc(initials(C.name))}</span>`;
  }
  const personAvatar = (name, isOwner) =>
    isOwner ? ownerAvatar() : `<span class="avatar-sm" style="--h:${hue(name)}">${esc(initials(name))}</span>`;

  function renderProfile() {
    const [first, ...rest] = String(C.name || "").trim().split(/\s+/);
    document.title = `${C.name} — ${C.title} & Photographer`;
    bind("name", C.name);
    bind("first-name", first);
    bind("last-name", rest.join(" "));
    bind("title", C.title);
    bind("tagline", C.tagline);
    bind("name-ar", C.nameArabic);
    bind("initials", initials(C.name));

    const links = socialLinks();
    const ig = links.find((l) => l.key === "instagram");
    if (ig) {
      $("#hero-ig").href = ig.url;
      $("#hero-ig").hidden = false;
      $("#hero-ig-handle").textContent = ig.handle;
    }

    $("#links").innerHTML = links
      .map((l, i) => {
        const external = l.key !== "email" ? ' target="_blank" rel="noopener noreferrer"' : "";
        return `<li class="reveal" style="--d:${i * 70}ms"><a href="${esc(l.url)}"${external}>
          <span class="link-icon">${icon(l.icon)}</span>
          <span class="link-text"><span class="link-name">${esc(l.label)}</span><span class="link-handle mono">${esc(l.handle)}</span></span>
          <span class="link-num mono">${pad(i + 1)}</span>
          ${icon("arrowUpRight", "link-arrow")}
        </a></li>`;
      })
      .join("");

    // About
    const ringWords = `${C.title || "Engineer"} · Photographer · `.toUpperCase();
    $("#about-avatar").innerHTML = `
      <svg class="ring" viewBox="0 0 210 210" aria-hidden="true">
        <defs><path id="ring-path" d="M105,105 m-92,0 a92,92 0 1,1 184,0 a92,92 0 1,1 -184,0"/></defs>
        <circle cx="105" cy="105" r="104" fill="none" stroke="currentColor" stroke-width=".6" stroke-dasharray="1 4"/>
        <text><textPath href="#ring-path" textLength="576" lengthAdjust="spacing">${esc(ringWords + ringWords)}</textPath></text>
      </svg>
      <span class="face">${C.avatar ? `<img src="${esc(C.avatar)}" alt="${esc(C.name)}">` : esc(initials(C.name))}</span>`;

    $("#about-text").innerHTML = (C.about || []).map((p) => `<p>${esc(p)}</p>`).join("");
    const facts = (C.facts || []).filter((f) => f && f.value);
    if (ig) facts.push({ label: "Instagram", value: ig.handle, href: ig.url });
    $("#specs").innerHTML = facts
      .map((f) => {
        const value = f.href ? `<a href="${esc(f.href)}" target="_blank" rel="noopener noreferrer">${esc(f.value)}</a>` : esc(f.value);
        return `<div class="spec"><dt class="mono">${esc(f.label)}</dt><dd>${value}</dd></div>`;
      })
      .join("");
    $("#interests").innerHTML = (C.interests || []).map((t) => `<li>${esc(t)}</li>`).join("");
    $("#interests").hidden = !(C.interests || []).length;

    $("#year").textContent = new Date().getFullYear();
  }

  /* ---------- Posts grid ---------- */
  function cardHTML(p, i, list, animate) {
    const foot =
      list === "work"
        ? `<span class="fig mono">FIG. ${pad(i + 1)}</span><span class="cap">${esc(p.caption || "Untitled")}</span>`
        : `${personAvatar(p.author_name, p.featured)}<span class="who"><strong>${esc(p.author_name)}</strong><time class="mono" datetime="${esc(p.created_at)}">${timeAgo(p.created_at)}</time></span>`;
    const label = `Open photo${p.caption ? ": " + p.caption : ""}`;
    return `<article class="card reveal${animate ? "" : " in"}" style="--d:${(i % 4) * 80}ms">
      <button class="card-media" type="button" data-open="${list}" data-index="${i}" aria-label="${esc(label)}">
        <img src="${esc(p.image_url)}" alt="" loading="lazy" decoding="async">
        <span class="card-overlay">${icon("heart")}<b>${p.likes}</b>${icon("comment")}<b>${p.comment_count}</b></span>
      </button>
      <div class="card-foot">${foot}</div>
    </article>`;
  }

  function renderList(list) {
    const posts = state[list];
    const grid = $(LISTS[list].grid);
    const animate = !state.rendered[list];
    state.rendered[list] = true;
    grid.innerHTML = posts.map((p, i) => cardHTML(p, i, list, animate)).join("");
    $(LISTS[list].empty).hidden = posts.length > 0;
    markLoaded(grid);
    observeReveals(grid);
    if (list === "work") renderHeroPhoto();
    if (list === "community") $("#community-count").textContent = `${posts.length} ${posts.length === 1 ? "post" : "posts"}`;
    renderStats();
  }

  function renderSkeletons() {
    const sk = '<div class="skeleton"></div>'.repeat(4);
    $("#work-grid").innerHTML = sk;
    $("#community-grid").innerHTML = sk;
  }

  function renderHeroPhoto() {
    const p = state.work[0];
    const img = $("#hero-photo");
    $("#hero-frame").classList.toggle("is-empty", !p);
    if (!p) {
      img.removeAttribute("src");
      $("#hero-photo-date").textContent = "";
      return;
    }
    if (img.getAttribute("src") !== p.image_url) {
      img.classList.remove("loaded");
      img.src = p.image_url;
    }
    img.alt = p.caption || "Latest photo";
    $("#hero-photo-date").textContent = fmtDate(p.created_at);
    markLoaded($("#hero-frame"));
  }

  function renderStats() {
    const comments = [...state.work, ...state.community].reduce((n, p) => n + (p.comment_count || 0), 0);
    countTo($("#stat-photos"), state.work.length);
    countTo($("#stat-community"), state.community.length);
    countTo($("#stat-comments"), comments);
  }

  function countTo(el, value) {
    const from = Number(el.dataset.value || 0);
    el.dataset.value = value;
    if (reduceMotion || from === value) {
      el.textContent = value;
      return;
    }
    const start = performance.now();
    const step = (t) => {
      if (Number(el.dataset.value) !== value) return; // a newer count took over
      const k = Math.min(1, (t - start) / 900);
      el.textContent = Math.round(from + (value - from) * (1 - Math.pow(1 - k, 3)));
      if (k < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  async function loadPosts() {
    renderSkeletons();
    try {
      const [work, community] = await Promise.all([store.listPosts(true), store.listPosts(false)]);
      state.work = work;
      state.community = community;
      renderList("work");
      renderList("community");
    } catch (err) {
      console.error(err);
      $("#work-grid").innerHTML = "";
      $("#community-grid").innerHTML = "";
      $("#work-empty").textContent = $("#community-empty").textContent = "Couldn't load photos right now. Please refresh the page.";
      $("#work-empty").hidden = $("#community-empty").hidden = false;
    }
  }

  /* ---------- Viewer ---------- */
  const viewer = { list: "work", index: 0, token: 0 };
  const viewerPost = () => state[viewer.list][viewer.index];

  function openViewer(list, index) {
    if (!state[list][index]) return;
    viewer.list = list;
    viewer.index = index;
    renderViewer();
    const d = $("#viewer");
    if (!d.open) d.showModal();
  }

  function stepViewer(delta) {
    const next = viewer.index + delta;
    if (next < 0 || next >= state[viewer.list].length) return;
    viewer.index = next;
    renderViewer();
  }

  function renderViewer() {
    const p = viewerPost();
    if (!p) return $("#viewer").close();
    const posts = state[viewer.list];

    const img = $("#viewer-img");
    if (img.getAttribute("src") !== p.image_url) {
      img.classList.remove("loaded");
      img.src = p.image_url;
    }
    img.alt = p.caption || "Photo";
    markLoaded($("#viewer-media"));

    $("#viewer-fig").textContent =
      viewer.list === "work" ? `FIG. ${pad(viewer.index + 1)} / ${pad(posts.length)}` : `${viewer.index + 1} / ${posts.length}`;
    $("#viewer-who").innerHTML = `${personAvatar(p.author_name, p.featured)}
      <span class="who"><strong>${esc(p.author_name)}${p.featured ? '<span class="chip-owner">Owner</span>' : ""}</strong>
      <time class="mono" datetime="${esc(p.created_at)}">${fmtDate(p.created_at)}</time></span>`;
    const cap = $("#viewer-caption");
    cap.textContent = p.caption || "";
    cap.hidden = !p.caption;
    renderLike(p);
    $("#viewer-ccount").textContent = p.comment_count;
    $(".viewer-nav.prev").disabled = viewer.index === 0;
    $(".viewer-nav.next").disabled = viewer.index === posts.length - 1;
    loadComments(p);
  }

  function renderLike(p) {
    if (viewerPost() !== p) return;
    $("#like-btn").setAttribute("aria-pressed", String(state.liked.has(p.id)));
    $("#like-count").textContent = p.likes;
  }

  async function likePost(p, viaDoubleTap) {
    if (viaDoubleTap) burst();
    if (state.liked.has(p.id)) return;
    state.liked.add(p.id);
    local.set("oa_liked", [...state.liked]);
    p.likes += 1;
    state.dirty = true;
    renderLike(p);
    const btn = $("#like-btn");
    btn.classList.remove("pop");
    void btn.offsetWidth;
    btn.classList.add("pop");
    try {
      p.likes = await store.likePost(p.id);
      renderLike(p);
    } catch (err) {
      state.liked.delete(p.id);
      local.set("oa_liked", [...state.liked]);
      p.likes -= 1;
      renderLike(p);
      toast(errMsg(err), "error");
    }
  }

  function burst() {
    const b = $("#burst");
    b.classList.remove("go");
    void b.offsetWidth;
    b.classList.add("go");
  }

  function commentHTML(c, isNew) {
    return `<li class="comment${isNew ? " new" : ""}">
      ${personAvatar(c.author_name, c.by_owner)}
      <div>
        <p class="comment-meta"><strong>${esc(c.author_name)}</strong>${c.by_owner ? '<span class="chip-owner">Owner</span>' : ""}<time class="mono" datetime="${esc(c.created_at)}">${timeAgo(c.created_at)}</time></p>
        <p class="comment-body">${esc(c.body)}</p>
      </div>
      <button class="icon-btn icon-btn-sm danger owner-only" type="button" data-del-comment="${esc(c.id)}" aria-label="Delete comment">${icon("trash")}</button>
    </li>`;
  }

  async function loadComments(p) {
    const token = ++viewer.token;
    const list = $("#comment-list");
    list.innerHTML = '<li class="comment-loading mono">Loading comments…</li>';
    try {
      const comments = await store.listComments(p.id);
      if (token !== viewer.token) return;
      if (p.comment_count !== comments.length) {
        p.comment_count = comments.length;
        state.dirty = true;
      }
      $("#viewer-ccount").textContent = comments.length;
      list.innerHTML = comments.length
        ? comments.map((c) => commentHTML(c)).join("")
        : '<li class="comment-empty">No comments yet — start the conversation.</li>';
    } catch (err) {
      if (token === viewer.token) list.innerHTML = '<li class="comment-empty">Couldn\'t load comments.</li>';
    }
  }

  function setupViewer() {
    const d = $("#viewer");
    const form = $("#comment-form");
    form.elements.name.value = state.name;

    d.addEventListener("click", (e) => {
      if (e.target === d) d.close();
    });
    d.addEventListener("close", () => {
      if (state.dirty) {
        state.dirty = false;
        renderList("work");
        renderList("community");
      }
    });
    $(".viewer-nav.prev").addEventListener("click", () => stepViewer(-1));
    $(".viewer-nav.next").addEventListener("click", () => stepViewer(1));
    $("#like-btn").addEventListener("click", () => likePost(viewerPost(), false));
    $("#viewer-img").addEventListener("dblclick", () => likePost(viewerPost(), true));
    $("#viewer-img").addEventListener("load", (e) => e.target.classList.add("loaded"));

    // Swipe between photos on touch screens
    let startX = null;
    const media = $("#viewer-media");
    media.addEventListener("touchstart", (e) => { startX = e.touches[0].clientX; }, { passive: true });
    media.addEventListener("touchend", (e) => {
      if (startX == null) return;
      const dx = e.changedTouches[0].clientX - startX;
      startX = null;
      if (Math.abs(dx) > 50) stepViewer(dx < 0 ? 1 : -1);
    });

    document.addEventListener("keydown", (e) => {
      if (!d.open || e.target.matches("input, textarea")) return;
      if (e.key === "ArrowLeft") stepViewer(-1);
      if (e.key === "ArrowRight") stepViewer(1);
    });

    $("#delete-post").addEventListener("click", async () => {
      const p = viewerPost();
      if (!confirm("Delete this post and all its comments? This can't be undone.")) return;
      try {
        await store.deletePost(p);
        const list = viewer.list;
        state[list].splice(viewer.index, 1);
        state.dirty = false;
        d.close();
        renderList(list);
        toast("Post deleted");
      } catch (err) {
        toast(errMsg(err), "error");
      }
    });

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const p = viewerPost();
      const nameInput = form.elements.name;
      const bodyInput = form.elements.body;
      const author_name = store.owner ? C.name : nameInput.value.trim();
      const body = bodyInput.value.trim();
      if (!author_name) {
        toast("Add your name first", "error");
        return nameInput.focus();
      }
      if (!body) return bodyInput.focus();

      const submit = form.querySelector('button[type="submit"]');
      submit.disabled = true;
      try {
        const c = await store.addComment({ post_id: p.id, author_name, body, by_owner: !!store.owner });
        if (!store.owner) rememberName(author_name);
        bodyInput.value = "";
        p.comment_count += 1;
        state.dirty = true;
        if (viewerPost() === p) {
          const list = $("#comment-list");
          const empty = $(".comment-empty", list);
          if (empty) empty.remove();
          list.insertAdjacentHTML("beforeend", commentHTML(c, true));
          list.lastElementChild.scrollIntoView({ block: "nearest", behavior: reduceMotion ? "auto" : "smooth" });
          $("#viewer-ccount").textContent = p.comment_count;
        }
      } catch (err) {
        toast(errMsg(err), "error");
      } finally {
        submit.disabled = false;
      }
    });

    $("#comment-list").addEventListener("click", async (e) => {
      const btn = e.target.closest("[data-del-comment]");
      if (!btn || !confirm("Delete this comment?")) return;
      try {
        await store.deleteComment(btn.dataset.delComment);
        btn.closest(".comment").remove();
        const p = viewerPost();
        p.comment_count = Math.max(0, p.comment_count - 1);
        $("#viewer-ccount").textContent = p.comment_count;
        state.dirty = true;
      } catch (err) {
        toast(errMsg(err), "error");
      }
    });
  }

  /* ---------- Composer (new post) ---------- */
  function mountComposer(host, { featured }) {
    const form = $("#composer-tpl").content.firstElementChild.cloneNode(true);
    injectIcons(form);
    const drop = $(".drop", form);
    const input = $(".drop-input", form);
    const preview = $(".drop-preview", form);
    const clear = $(".drop-clear", form);
    const submit = $('button[type="submit"]', form);
    const submitLabel = $(".label", submit);

    if (featured) {
      $(".name-field", form).remove();
      $(".composer-title", form).textContent = "New photo for Work";
      $(".composer-sub", form).textContent = "It goes to the top of the gallery and the hero frame.";
      $(".composer-note", form).textContent = "Only you can see this panel.";
      submitLabel.textContent = "Publish";
    } else {
      form.elements.name.value = state.name;
      $(".composer-title", form).textContent = "Share a photo";
      $(".composer-sub", form).textContent = "Anyone can post here — no account needed.";
      $(".composer-note", form).textContent = "Posts are public · be kind ✦";
    }

    let file = null;
    let previewUrl = null;
    const setFile = (f) => {
      if (f && !/^image\//.test(f.type)) return toast("Please choose an image file (JPG, PNG or WEBP).", "error");
      if (f && f.size > MAX_UPLOAD_MB * 1024 * 1024) return toast(`That photo is over ${MAX_UPLOAD_MB} MB — try a smaller one.`, "error");
      file = f || null;
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      previewUrl = file ? URL.createObjectURL(file) : null;
      preview.hidden = clear.hidden = !file;
      $(".drop-empty", form).hidden = !!file;
      if (file) preview.src = previewUrl;
      else {
        preview.removeAttribute("src");
        input.value = "";
      }
    };

    drop.addEventListener("click", (e) => {
      if (!e.target.closest(".drop-clear")) input.click();
    });
    drop.addEventListener("keydown", (e) => {
      if (e.target === drop && (e.key === "Enter" || e.key === " ")) {
        e.preventDefault();
        input.click();
      }
    });
    input.addEventListener("change", () => setFile(input.files[0]));
    clear.addEventListener("click", () => setFile(null));
    ["dragenter", "dragover"].forEach((t) =>
      drop.addEventListener(t, (e) => {
        e.preventDefault();
        drop.classList.add("dragging");
      })
    );
    ["dragleave", "drop"].forEach((t) => drop.addEventListener(t, () => drop.classList.remove("dragging")));
    drop.addEventListener("drop", (e) => {
      e.preventDefault();
      setFile(e.dataTransfer.files[0]);
    });

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const author_name = featured ? C.name : form.elements.name.value.trim();
      const caption = form.elements.caption.value.trim();
      if (!file) {
        drop.classList.remove("shake");
        void drop.offsetWidth;
        drop.classList.add("shake");
        return toast("Choose a photo first", "error");
      }
      if (!author_name) {
        form.elements.name.focus();
        return toast("Add your name so people know who shared it", "error");
      }

      const original = submitLabel.textContent;
      submit.disabled = true;
      submitLabel.textContent = featured ? "Publishing…" : "Sharing…";
      try {
        const demo = store.mode === "demo";
        const blob = await compressImage(file, demo ? 1200 : 1800, demo ? 0.78 : 0.86);
        const post = await store.createPost({ author_name, caption, blob, featured });
        const list = featured ? "work" : "community";
        state[list].unshift({ ...post, comment_count: 0 });
        renderList(list);
        if (!featured) rememberName(author_name);
        form.elements.caption.value = "";
        setFile(null);
        toast(featured ? "Published to Work ✦" : "Thanks for sharing — your photo is live ✦");
      } catch (err) {
        toast(errMsg(err), "error");
      } finally {
        submit.disabled = false;
        submitLabel.textContent = original;
      }
    });

    host.appendChild(form);
  }

  /* ---------- Owner login ---------- */
  function applyOwner() {
    const owner = !!store.owner;
    document.body.classList.toggle("is-owner", owner);
    $("#owner-btn").textContent = owner ? "Owner tools ✓" : "Owner login";
    $("#comment-form").elements.name.hidden = owner;
  }

  function renderLogin() {
    const body = $("#login-body");
    if (store.owner) {
      body.innerHTML = `
        <p class="modal-kicker mono">Owner tools</p>
        <h3>You're signed in</h3>
        <p>You can publish photos to Work and delete any post or comment on the site.</p>
        <div class="modal-actions">
          <button class="btn btn-ghost" type="button" data-close>Close</button>
          <button class="btn btn-accent" type="button" id="signout-btn">Sign out</button>
        </div>`;
    } else if (store.mode === "demo") {
      body.innerHTML = `
        <p class="modal-kicker mono">Demo mode</p>
        <h3>Owner tools</h3>
        <p>On the live site, ${esc(C.name.split(" ")[0])} signs in here with his email and password to publish photos and moderate comments. In demo mode you can preview those tools right away.</p>
        <div class="modal-actions">
          <button class="btn btn-ghost" type="button" data-close>Cancel</button>
          <button class="btn btn-accent" type="button" id="demo-owner-btn">Preview owner tools</button>
        </div>`;
    } else {
      body.innerHTML = `
        <p class="modal-kicker mono">Owner only</p>
        <h3>Sign in</h3>
        <form id="login-form" novalidate>
          <label class="field"><span class="mono">Email</span><input name="email" type="email" autocomplete="username" required></label>
          <label class="field"><span class="mono">Password</span><input name="password" type="password" autocomplete="current-password" required></label>
          <p class="form-error" id="login-error" hidden></p>
          <div class="modal-actions"><button class="btn btn-accent" type="submit">Sign in</button></div>
        </form>`;
    }
  }

  function setupLogin() {
    const d = $("#login");
    $("#owner-btn").addEventListener("click", () => {
      renderLogin();
      d.showModal();
    });
    d.addEventListener("click", async (e) => {
      if (e.target === d) return d.close();
      if (e.target.closest("#demo-owner-btn")) {
        await store.signIn();
        applyOwner();
        d.close();
        toast("Owner tools on — look for the publish panel in Work");
      }
      if (e.target.closest("#signout-btn")) {
        await store.signOut();
        applyOwner();
        d.close();
        toast("Signed out");
      }
    });
    d.addEventListener("submit", async (e) => {
      if (e.target.id !== "login-form") return;
      e.preventDefault();
      const f = e.target;
      const err = $("#login-error");
      const btn = f.querySelector('button[type="submit"]');
      err.hidden = true;
      btn.disabled = true;
      try {
        await store.signIn(f.elements.email.value.trim(), f.elements.password.value);
        applyOwner();
        d.close();
        toast(`Welcome back, ${C.name.split(" ")[0]} ✦`);
      } catch (ex) {
        err.textContent = errMsg(ex);
        err.hidden = false;
      } finally {
        btn.disabled = false;
      }
    });
  }

  /* ---------- Chrome: theme, nav, hero, reveal ---------- */
  function setupTheme() {
    const btn = $("#theme-btn");
    const root = document.documentElement;
    const paint = () => {
      const dark = root.dataset.theme !== "light";
      btn.innerHTML = icon(dark ? "sun" : "moon");
      btn.setAttribute("aria-label", dark ? "Switch to light theme" : "Switch to dark theme");
      $('meta[name="theme-color"]').content = dark ? "#0a0c0f" : "#f3f1ec";
    };
    btn.addEventListener("click", () => {
      root.dataset.theme = root.dataset.theme === "light" ? "dark" : "light";
      local.set("oa_theme", root.dataset.theme);
      paint();
    });
    paint();
  }

  function setupNav() {
    const nav = $("#nav");
    const menu = $("#menu-btn");
    const onScroll = () => nav.classList.toggle("scrolled", window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    const closeMenu = () => {
      nav.classList.remove("open");
      menu.setAttribute("aria-expanded", "false");
    };
    menu.addEventListener("click", () => menu.setAttribute("aria-expanded", String(nav.classList.toggle("open"))));
    $$("#nav-links a").forEach((a) => a.addEventListener("click", closeMenu));
    document.addEventListener("click", (e) => {
      if (nav.classList.contains("open") && !nav.contains(e.target)) closeMenu();
    });

    // Highlight the section currently in view
    const links = new Map($$("#nav-links a").map((a) => [a.getAttribute("href").slice(1), a]));
    const spy = new IntersectionObserver(
      (entries) =>
        entries.forEach((en) => {
          if (en.isIntersecting) links.forEach((a, id) => a.setAttribute("aria-current", String(id === en.target.id)));
        }),
      { rootMargin: "-45% 0px -50% 0px" }
    );
    links.forEach((_, id) => {
      const section = document.getElementById(id);
      if (section) spy.observe(section);
    });
  }

  // CAD-style crosshair that follows the pointer over the hero
  function setupHeroCursor() {
    if (reduceMotion || !window.matchMedia("(pointer: fine)").matches) return;
    const hero = $("#top");
    const readout = $("#readout");
    hero.addEventListener("pointermove", (e) => {
      const r = hero.getBoundingClientRect();
      const x = Math.round(e.clientX - r.left);
      const y = Math.round(e.clientY - r.top);
      hero.style.setProperty("--cx", `${x}px`);
      hero.style.setProperty("--cy", `${y}px`);
      hero.classList.add("tracking");
      readout.textContent = `X ${String(x).padStart(4, "0")} · Y ${String(y).padStart(4, "0")}`;
    });
    hero.addEventListener("pointerleave", () => hero.classList.remove("tracking"));
  }

  let revealObserver = null;
  function setupReveal() {
    if (!("IntersectionObserver" in window)) return;
    revealObserver = new IntersectionObserver(
      (entries) =>
        entries.forEach((en) => {
          if (en.isIntersecting) {
            en.target.classList.add("in");
            revealObserver.unobserve(en.target);
          }
        }),
      { rootMargin: "0px 0px -8% 0px" }
    );
    observeReveals(document);
  }
  function observeReveals(root) {
    $$(".reveal:not(.in)", root).forEach((el) => (revealObserver ? revealObserver.observe(el) : el.classList.add("in")));
  }

  function showDemoPill() {
    const pill = $("#demo-pill");
    pill.hidden = false;
    $("#demo-close").addEventListener("click", () => (pill.hidden = true));
    $("#demo-reset").addEventListener("click", () => {
      if (!confirm("Reset the demo? This clears the demo posts, comments and likes saved in this browser.")) return;
      store.reset();
      location.reload();
    });
  }

  /* ---------- Boot ---------- */
  async function boot() {
    injectIcons();
    renderProfile();
    setupTheme();
    setupNav();
    setupHeroCursor();
    setupReveal();

    // Fade images in as they arrive
    document.addEventListener("load", (e) => { if (e.target.tagName === "IMG") e.target.classList.add("loaded"); }, true);
    document.addEventListener("error", (e) => { if (e.target.tagName === "IMG") e.target.classList.add("loaded"); }, true);

    document.addEventListener("click", (e) => {
      const opener = e.target.closest("[data-open]");
      if (opener) return openViewer(opener.dataset.open, Number(opener.dataset.index));
      const closer = e.target.closest("[data-close]");
      if (closer) closer.closest("dialog").close();
    });
    $("#hero-photo-btn").addEventListener("click", () => openViewer("work", 0));

    try {
      store = await createStore();
    } catch (err) {
      console.error(err);
      $("#work-empty").textContent = $("#community-empty").textContent =
        "Couldn't connect to the database. Please refresh the page in a moment.";
      $("#work-empty").hidden = $("#community-empty").hidden = false;
      return;
    }

    setupViewer();
    setupLogin();
    applyOwner();
    mountComposer($("#owner-composer"), { featured: true });
    mountComposer($("#community-composer"), { featured: false });
    if (store.mode === "demo") showDemoPill();
    await loadPosts();
  }

  boot();
})();
