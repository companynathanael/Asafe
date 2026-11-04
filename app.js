/* =========================================================
   ASAFE · Núcleo de IA's — apenas aparência (dados simulados)
   ========================================================= */
(() => {
  "use strict";

  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const icon = (id, cls = "") => `<svg class="ic ${cls}"><use href="#i-${id}"/></svg>`;
  const pad = (n) => String(n).padStart(2, "0");
  const now = () => { const d = new Date(); return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`; };
  const initial = (name) => name.trim().charAt(0).toUpperCase();

  /* ---------------- estado ---------------- */
  const NODE_W = 236, NODE_H = 66;
  // Motores conectados ao Asafe. Cada um tem tema, logo e textos próprios (mesmo modelo do Gather).
  const MOTORES = {
    gather: {
      nome: "Gather", tema: "cyan", sub: "ORQUESTRA APIs", papel: "Gerencia e orquestra as próprias APIs",
      img: "assets/gather-symbol.png", logo: "assets/gather-symbol-cyan.png",
      hex: ["#00c8e0", "#22eaff", "#04222a"],
    },
    fornalha: {
      nome: "Fornalha", tema: "orange", sub: "FUNDE E PROVA", papel: "Funde habilidades, faz a prova de fogo e mede o desempenho",
      img: "assets/fornalha-symbol.png", logo: "assets/fornalha-symbol-laranja.png",
      hex: ["#ea580c", "#fb923c", "#2a1306"],
    },
    bezalel: {
      nome: "Bezalel", tema: "green", sub: "MOLDA AS IAs", papel: "Cria as IAs: definição, montagem, versões e aposentadoria",
      img: "assets/bezalel-symbol.png", logo: "assets/bezalel-symbol-verde.png",
      hex: ["#16a34a", "#4ade80", "#06220f"],
    },
  };
  const CORES = {
    red: { w: 190, hh: 164, h: 230, img: "assets/asafe-symbol-256.png", name: "ASAFE", sub: "NÚCLEO · SERVIDORES · DADOS", hex: ["#e5162b", "#ff3348", "#2a0a0f"] },
  };
  for (const m of Object.values(MOTORES)) {
    CORES[m.tema] = { w: 140, hh: 108, h: 165, img: m.img, name: m.nome.toUpperCase(), sub: m.sub, hex: m.hex };
  }
  const coreDim = (n) => CORES[n.theme || "red"];

  const state = {
    nodes: [
      { id: "asafe", type: "core", theme: "red", x: 180, y: 300 },
      { id: "gather", type: "core", theme: "cyan", name: "Gather", x: 760, y: 20, live: true },
      { id: "fornalha", type: "core", theme: "orange", name: "Fornalha", x: 820, y: 330, live: true },
      { id: "bezalel", type: "core", theme: "green", name: "Bezalel", x: 760, y: 640, live: true },
    ],
    edges: [
      { id: "e1", from: "asafe", to: "gather", type: "motor", theme: "cyan", label: "conexão" },
      { id: "e2", from: "asafe", to: "fornalha", type: "motor", theme: "orange", label: "conexão" },
      { id: "e3", from: "asafe", to: "bezalel", type: "motor", theme: "green", label: "conexão" },
      // linha de produção: Gather (APIs) → Fornalha (funde e prova) → Bezalel (molda a IA)
      { id: "p1", from: "gather", to: "fornalha", type: "prod" },
      { id: "p2", from: "fornalha", to: "bezalel", type: "prod" },
    ],
    view: { x: 0, y: 0, z: 1 },
    selected: null,
    pendingPerm: false,
    activePerms: [],
  };
  const byId = (id) => state.nodes.find((n) => n.id === id);
  const nameOf = (id) => (id === "asafe" ? "Asafe" : byId(id)?.name ?? id);

  /* ---------------- tela de carregamento ---------------- */
  (async () => {
    const splash = $("#splash"), status = $("#splash-status"), bar = $("#splash-bar");
    const steps = [
      ["inicializando núcleo de servidores", 18],
      ["carregando armazenamento de dados", 36],
      ["gerando logins das IA's", 55],
      ["abrindo linhas conexionais", 72],
      ["conectando aos motores", 88],
      ["ativando observador", 100],
    ];
    const wait = (ms) => new Promise((r) => setTimeout(r, ms));
    for (const [txt, pct] of steps) {
      status.style.opacity = 0; await wait(120);
      status.textContent = txt; status.style.opacity = 1;
      bar.style.width = pct + "%";
      await wait(420 + Math.random() * 260);
    }
    splash.classList.add("ready");
    status.textContent = "asafe online";
    await wait(1000);
    splash.classList.add("done");
    document.body.classList.remove("carregando");  // o painel surge enquanto a splash some
    setTimeout(() => splash.remove(), 800);
  })();

  /* ---------------- relógio & topo ---------------- */
  const tick = () => ($("#clock").textContent = now());
  tick(); setInterval(tick, 1000);

  function updateStats() {
    const ais = state.nodes.filter((n) => n.id !== "asafe");
    $("#st-nodes").textContent = state.nodes.length;
    $("#st-lines").textContent = state.edges.length;
  }

  /* ---------------- abas ---------------- */
  // indicador que desliza até a aba ativa (uma peça só, em vez de cada aba trocar de fundo)
  const tabInd = document.createElement("span");
  tabInd.className = "tab-ind";
  $(".tabs").prepend(tabInd);
  function moverIndicador(instantaneo = false) {
    const ativa = $(".tab.active");
    if (!ativa) return;
    if (instantaneo) tabInd.style.transition = "none";
    tabInd.style.width = ativa.offsetWidth + "px";
    tabInd.style.transform = `translateX(${ativa.offsetLeft}px)`;
    if (instantaneo) { void tabInd.offsetWidth; tabInd.style.transition = ""; }
  }
  addEventListener("resize", () => moverIndicador(true));
  if (document.fonts) document.fonts.ready.then(() => moverIndicador(true));
  requestAnimationFrame(() => moverIndicador(true));

  function showView(v) {
    $$(".tab").forEach((t) => t.classList.toggle("active", t.dataset.view === v));
    $$(".view").forEach((s) => s.classList.toggle("active", s.id === `view-${v}`));
    moverIndicador();
    const aba = $(`.tab[data-view="${v}"]`);
    if (aba && matchMedia("(max-width: 1000px)").matches) aba.scrollIntoView({ inline: "center", block: "nearest", behavior: "smooth" });
    if (v === "linhas") requestAnimationFrame(renderEdges);
  }
  $$(".tab").forEach((t) => t.addEventListener("click", () => showView(t.dataset.view)));

  /* ---------------- toasts ---------------- */
  function toast(msg) {
    const el = document.createElement("div");
    el.className = "toast";
    el.innerHTML = `<span class="dot"></span>${msg}`;
    $("#toasts").appendChild(el);
    setTimeout(() => { el.classList.add("out"); setTimeout(() => el.remove(), 300); }, 3800);
  }

  /* =========================================================
     QUADRO — nós, linhas, pan/zoom
     ========================================================= */
  const board = $("#board"), world = $("#world"), edgesSvg = $("#edges"), nodesEl = $("#nodes");

  function center(n) {
    if (n.type === "core") { const d = coreDim(n); return { x: n.x + d.w / 2, y: n.y + d.hh / 2 }; }
    return { x: n.x + NODE_W / 2, y: n.y + NODE_H / 2 };
  }
  function pathFor(e) {
    const a = center(byId(e.from)), b = center(byId(e.to));
    const dx = b.x - a.x, dy = b.y - a.y;
    if (Math.abs(dy) > Math.abs(dx) * 0.6) {
      const k = dy * 0.5;
      return `M${a.x},${a.y} C${a.x},${a.y + k} ${b.x},${b.y - k} ${b.x},${b.y}`;
    }
    const k = dx * 0.5;
    return `M${a.x},${a.y} C${a.x + k},${a.y} ${b.x - k},${b.y} ${b.x},${b.y}`;
  }

  function nodeHTML(n) {
    if (n.type === "core") {
      const d = coreDim(n);
      const [c1, c2, bg] = d.hex;
      return `
        <div class="core-ring r2"></div><div class="core-ring"></div>
        <div class="core-hex">
          <svg class="hex" viewBox="0 0 104 116">
            <defs>
              <linearGradient id="hexg-${n.id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${bg}"/><stop offset="1" stop-color="#0b0b0d"/></linearGradient>
              <filter id="hexglow-${n.id}" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="6"/></filter>
            </defs>
            <polygon points="52,2 102,30 102,86 52,114 2,86 2,30" fill="none" stroke="${c1}" stroke-width="3" filter="url(#hexglow-${n.id})" opacity=".8"/>
            <polygon class="hex-stroke" points="52,2 102,30 102,86 52,114 2,86 2,30" fill="url(#hexg-${n.id})" stroke="${c2}" stroke-width="1.6"/>
          </svg>
          <img src="${d.img}" alt="${d.name}" />
          <span class="port"></span>
        </div>
        <div class="core-name">${d.name}</div>
        <div class="core-sub">${d.sub}</div>`;
    }
    const operated = state.edges.some((e) => e.type === "cx" && e.to === n.id);
    const operating = state.edges.find((e) => e.type === "cx" && e.from === n.id);
    return `
      ${n.kind === "main" ? `<span class="tag solid n-top">Principal</span>` : ""}
      <span class="avatar ${n.kind === "main" ? "red" : ""}">${initial(n.name)}</span>
      <div class="n-text"><span class="n-name">${n.name}</span><span class="n-role">${n.role}</span></div>
      <span class="dot n-dot ${n.live ? "" : "off"}"></span><span class="port"></span>
      ${operated ? `<span class="tag n-op">operada</span>` : operating ? `<span class="tag n-op">operando</span>` : ""}
      <span class="tag n-bottom ${n.live ? "" : "dim"}">${n.live ? "Ao vivo" : "Offline"}</span>`;
  }

  function renderNodes() {
    nodesEl.innerHTML = "";
    for (const n of state.nodes) {
      const el = document.createElement("div");
      el.className = n.type === "core" ? `core ${n.theme || "red"}` : `node ${n.kind}`;
      el.dataset.id = n.id;
      el.style.left = n.x + "px";
      el.style.top = n.y + "px";
      if (state.edges.some((e) => e.type === "cx" && e.to === n.id)) el.classList.add("operated");
      el.innerHTML = nodeHTML(n);
      nodesEl.appendChild(el);
    }
    markSelection();
  }

  let packets = [];
  function renderEdges() {
    let html = "";
    packets = [];
    for (const e of state.edges) {
      const d = pathFor(e);
      const sel = state.selected?.kind === "edge" && state.selected.id === e.id;
      html += `<g class="edge-g" data-id="${e.id}">`;
      if (e.type === "cx" || e.type === "data" || e.type === "motor") html += `<path class="edge halo ${e.theme || ""}" d="${d}"/>`;
      html += `<path class="edge ${e.type} ${e.theme || ""} ${sel ? "sel" : ""}" d="${d}" id="p-${e.id}"/>`;
      html += `<path class="edge-hit" d="${d}"/>`;
      html += `</g>`;
    }
    // pacotes
    for (const e of state.edges) {
      const n = e.type === "cx" ? 3 : 2;
      for (let i = 0; i < n; i++) {
        html += `<circle class="packet ${e.type === "motor" ? e.theme : e.type === "prod" ? "prod" : e.type === "cx" || e.type === "data" ? "r" : ""}" r="${e.type === "cx" ? 4 : 3.5}" data-e="${e.id}" data-o="${i / n}"/>`;
      }
    }
    // rótulos
    html += `<g id="labels"></g>`;
    edgesSvg.innerHTML = html;

    const labels = $("#labels", edgesSvg);
    for (const e of state.edges) {
      const p = $(`#p-${e.id}`, edgesSvg);
      const len = p.getTotalLength();
      packets.push(...$$(`circle[data-e="${e.id}"]`, edgesSvg).map((c) => ({ c, p, len, o: +c.dataset.o, speed: e.type === "cx" ? 0.16 : 0.09 })));
      if (e.label) {
        const pt = p.getPointAtLength(len * 0.5);
        const w = e.label.length * 6.6 + 16;
        labels.insertAdjacentHTML("beforeend",
          `<rect class="edge-label-bg ${e.theme || ""}" x="${pt.x - w / 2}" y="${pt.y - 10}" width="${w}" height="20" rx="5"/>
           <text class="edge-label ${e.theme || ""}" x="${pt.x}" y="${pt.y + 3.5}" text-anchor="middle">${e.label}</text>`);
      }
    }
    $$(".edge-g", edgesSvg).forEach((g) =>
      $(".edge-hit", g).addEventListener("pointerdown", (ev) => { ev.stopPropagation(); select({ kind: "edge", id: g.dataset.id }); })
    );
  }

  let t0 = performance.now();
  (function animate(t) {
    const s = (t - t0) / 1000;
    for (const k of packets) {
      const f = (s * k.speed + k.o) % 1;
      const pt = k.p.getPointAtLength(f * k.len);
      k.c.setAttribute("cx", pt.x);
      k.c.setAttribute("cy", pt.y);
    }
    requestAnimationFrame(animate);
  })(t0);

  function applyView() {
    const { x, y, z } = state.view;
    world.style.transform = `translate(${x}px, ${y}px) scale(${z})`;
    $(".board-grid").style.backgroundPosition = `${x}px ${y}px`;
    $(".board-grid").style.backgroundSize = `${22 * z}px ${22 * z}px`;
    $("#zoom-val").textContent = Math.round(z * 100) + "%";
  }
  function zoomAt(factor, cx, cy) {
    const v = state.view;
    const z = Math.min(2.2, Math.max(0.35, v.z * factor));
    v.x = cx - ((cx - v.x) * z) / v.z;
    v.y = cy - ((cy - v.y) * z) / v.z;
    v.z = z;
    applyView();
  }
  function fit() {
    const r = board.getBoundingClientRect();
    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    for (const n of state.nodes) {
      const w = n.type === "core" ? coreDim(n).w : NODE_W, h = n.type === "core" ? coreDim(n).h : NODE_H;
      x0 = Math.min(x0, n.x); y0 = Math.min(y0, n.y); x1 = Math.max(x1, n.x + w); y1 = Math.max(y1, n.y + h);
    }
    const padX = 110, padY = 90;
    const z = Math.min(1.1, Math.max(0.4, Math.min((r.width - padX * 2) / (x1 - x0), (r.height - padY * 2) / (y1 - y0))));
    state.view = { z, x: (r.width - (x1 - x0) * z) / 2 - x0 * z, y: (r.height - (y1 - y0) * z) / 2 - y0 * z - 30 };
    applyView();
  }
  function centerCore() {
    const r = board.getBoundingClientRect(), c = center(byId("asafe")), z = state.view.z;
    state.view.x = r.width / 2 - c.x * z;
    state.view.y = r.height / 2 - c.y * z;
    applyView();
  }

  $$("[data-zoom]").forEach((b) =>
    b.addEventListener("click", () => {
      const r = board.getBoundingClientRect(), m = b.dataset.zoom;
      if (m === "in") zoomAt(1.15, r.width / 2, r.height / 2);
      if (m === "out") zoomAt(1 / 1.15, r.width / 2, r.height / 2);
      if (m === "fit") fit();
      if (m === "center") centerCore();
    })
  );
  board.addEventListener("wheel", (e) => {
    e.preventDefault();
    const r = board.getBoundingClientRect();
    zoomAt(e.deltaY < 0 ? 1.08 : 1 / 1.08, e.clientX - r.left, e.clientY - r.top);
  }, { passive: false });

  // arrastar: fundo = pan, nó = mover
  let drag = null;
  board.addEventListener("pointerdown", (e) => {
    if (e.target.closest(".board-tools, .board-mode, .perm-pop")) return;
    const nodeEl = e.target.closest(".node, .core");
    drag = { sx: e.clientX, sy: e.clientY, moved: false, nodeEl };
    if (nodeEl) { const n = byId(nodeEl.dataset.id); drag.n = n; drag.ox = n.x; drag.oy = n.y; }
    else { drag.vx = state.view.x; drag.vy = state.view.y; board.classList.add("panning"); }
    board.setPointerCapture(e.pointerId);
  });
  board.addEventListener("pointermove", (e) => {
    if (!drag) return;
    const dx = e.clientX - drag.sx, dy = e.clientY - drag.sy;
    if (Math.hypot(dx, dy) > 4) drag.moved = true;
    if (drag.n) {
      drag.n.x = drag.ox + dx / state.view.z;
      drag.n.y = drag.oy + dy / state.view.z;
      drag.nodeEl.style.left = drag.n.x + "px";
      drag.nodeEl.style.top = drag.n.y + "px";
      renderEdges();
    } else {
      state.view.x = drag.vx + dx; state.view.y = drag.vy + dy; applyView();
    }
  });
  board.addEventListener("pointerup", () => {
    if (!drag) return;
    board.classList.remove("panning");
    if (!drag.moved) {
      if (drag.nodeEl) select({ kind: "node", id: drag.nodeEl.dataset.id });
      else select(null);
    }
    drag = null;
  });
  board.addEventListener("dblclick", (e) => {
    const n = e.target.closest(".node");
    if (n) { showView("dados"); toast(`Abrindo dados de ${nameOf(n.dataset.id)}`); }
  });

  $$(".board-mode .seg").forEach((b) => b.addEventListener("click", () => {
    $$(".board-mode .seg").forEach((x) => x.classList.toggle("active", x === b));
    if (b.textContent === "Conectar") toast("Modo conectar: arraste de uma porta até outra IA para abrir uma Linha Conexional");
  }));

  /* ---------------- seleção & inspetor ---------------- */
  function markSelection() {
    $$(".node, .core", nodesEl).forEach((el) =>
      el.classList.toggle("selected", state.selected?.kind === "node" && state.selected.id === el.dataset.id));
  }
  function select(sel) {
    state.selected = sel;
    markSelection();
    renderEdges();
    renderInspector();
  }

  const inspector = $("#inspector");
  let mirrorRun = 0;

  function renderInspector() {
    mirrorRun++;
    const sel = state.selected;
    if (sel?.kind === "edge") {
      const e = state.edges.find((x) => x.id === sel.id);
      if (e.type === "cx") return renderLineInspector(e);
      return renderSimpleEdge(e);
    }
    if (sel?.kind === "node") return renderNodeInspector(sel.id);
    renderNetwork();
  }

  function legend() {
    return `<div class="legend">
      <div><i style="border-color:var(--red)"></i>dados → Asafe</div>
      <div><i style="border-color:rgba(255,255,255,.6)"></i>Asafe → IA</div>
      <div><i style="border-color:var(--cyan);border-top-style:dashed"></i>Asafe ↔ Gather</div>
      <div><i style="border-color:var(--orange);border-top-style:dashed"></i>Asafe ↔ Fornalha</div>
      <div><i style="border-color:var(--green);border-top-style:dashed"></i>Asafe ↔ Bezalel</div>
      <div><i style="border-color:rgba(255,255,255,.35);border-top-style:dotted"></i>linha de produção</div>
      <div><i style="border-color:var(--red-2);border-top-style:dashed"></i>linha conexional (IA opera IA)</div>
    </div>`;
  }

  const LOGOS = { asafe: ["red", "assets/asafe-symbol-red.png"] };
  for (const [id, m] of Object.entries(MOTORES)) LOGOS[id] = [m.tema, m.logo];
  function av(n, size = "") {
    const id = n?.id, logo = LOGOS[id];
    if (logo) return `<span class="avatar logo ${logo[0]} ${size}"><img src="${logo[1]}" alt="${n.name || nameOf(id)}" /></span>`;
    return `<span class="avatar ${size} ${avCls(n)}">${initial(n?.name || nameOf(id))}</span>`;
  }
  function avCls(n) { return n?.theme && n.theme !== "red" ? n.theme : n?.kind === "main" || n?.id === "asafe" ? "red" : ""; }
  function hops(id) {
    if (id === "asafe") return 0;
    if (state.edges.some((e) => (e.from === id && e.to === "asafe") || (e.to === id && e.from === "asafe"))) return 1;
    return 2;
  }

  function renderNetwork() {
    const ais = state.nodes.filter((n) => n.id !== "asafe");
    inspector.innerHTML = `
      <div class="card-title">Rede <span class="tag dim">${ais.filter((n) => n.live).length}/${ais.length} online</span></div>
      <p class="hint">Selecione um nó ou linha. Clique duas vezes em uma IA para abrir os dados dela.</p>
      <div class="net-list">
        ${ais.map((n) => `
          <div class="net-item" data-id="${n.id}">
            ${av(n, "sm")}
            <span class="ni-name">${n.name}</span>
            <span class="ni-meta"><span class="dot ${n.live ? "" : "off"}"></span>${hops(n.id)} ${hops(n.id) === 1 ? "salto" : "saltos"}</span>
          </div>`).join("")}
      </div>
      ${legend()}`;
    $$(".net-item", inspector).forEach((el) => el.addEventListener("click", () => select({ kind: "node", id: el.dataset.id })));
  }

  function renderNodeInspector(id) {
    if (id === "asafe") {
      inspector.innerHTML = `
        <div class="card-title">Núcleo <span class="tag solid">Ativo</span></div>
        <div class="srv-head">${av({ id: "asafe", name: "Asafe" }, "lg")}<div class="t"><b>Asafe</b><span>Servidores · Dados · Conexões · Permissões</span></div></div>
        <dl class="kv">
          <dt>Servidores</dt><dd>${servers.length} gerado${servers.length === 1 ? "" : "s"}</dd>
          <dt>Linhas</dt><dd>${state.edges.length} ativa${state.edges.length === 1 ? "" : "s"}</dd>
          <dt>Armazenado</dt><dd>0 B</dd>
        </dl>
        <div class="label-xs">Responsabilidades</div>
        <div class="route">
          <span class="chip">${icon("code", "xs")}Desenvolve</span><span class="chip">${icon("db", "xs")}Armazena</span>
          <span class="chip">${icon("server", "xs")}Gera servidores</span><span class="chip">${icon("shield", "xs")}Permissões</span>
          <span class="chip red">${icon("link", "xs")}Cria linhas</span><span class="chip red">${icon("eye", "xs")}Observa</span>
        </div>
        ${legend()}`;
      return;
    }
    if (MOTORES[id]) {
      const m = MOTORES[id];
      const etapa = { gather: "1. APIs", fornalha: "2. funde e prova", bezalel: "3. molda a IA" }[id];
      inspector.innerHTML = `
        <div class="card-title">${m.nome} <span class="tag ${m.tema} solid">Ativo</span></div>
        <div class="srv-head">${av({ id, name: m.nome }, "lg")}<div class="t"><b>${m.nome}</b><span>${m.papel}</span></div></div>
        <div class="label-xs">Rota</div>
        <div class="route"><span class="chip red"><img class="chip-logo" src="assets/asafe-symbol-red.png" alt="" />Asafe</span>${icon("arrow", "xs muted")}<span class="chip ${m.tema}"><img class="chip-logo" src="${m.logo}" alt="" />${m.nome}</span></div>
        <dl class="kv">
          <dt>Servidor</dt><dd>${id}.nathanael.ind ${icon("copy", "xs")}</dd>
          <dt>Status</dt><dd>conectado ao Asafe</dd>
          <dt>Produção</dt><dd>${etapa}</dd>
        </dl>
        <div class="label-xs">Linha de produção</div>
        <div class="route">${["gather", "fornalha", "bezalel"].map((k) => `<span class="chip ${k === id ? MOTORES[k].tema : ""}">${MOTORES[k].nome}</span>`).join(icon("arrow", "xs muted"))}</div>
        ${legend()}`;
      return;
    }
    const n = byId(id);
    const conns = state.edges.filter((e) => e.from === id || e.to === id);
    inspector.innerHTML = `
      <div class="card-title">IA <span class="tag dim">${n.live ? "online" : "offline"}</span></div>
      <div class="srv-head"><span class="avatar lg ${n.kind === "main" ? "red" : ""}">${initial(n.name)}</span><div class="t"><b>${n.name}</b><span>${n.role}</span></div></div>
      <div class="label-xs">Rota até o Asafe</div>
      <div class="route">
        <span class="chip">${n.name}</span>${icon("arrow", "xs muted")}<span class="chip red">Asafe</span>
      </div>
      <dl class="kv">
        <dt>Servidor</dt><dd>${id}.nathanael.ind ${icon("copy", "xs")}</dd>
        <dt>Token</dt><dd>nth_••••••••${id.slice(0, 3)}7 ${icon("copy", "xs")}</dd>
        <dt>Latência</dt><dd>${12 + id.length * 3} ms</dd>
      </dl>
      <div class="label-xs">Conexões</div>
      <div class="net-list">
        ${conns.map((e) => {
          const other = e.from === id ? e.to : e.from;
          const label = { motor: "conectado", prod: "linha de produção", data: "envia dados", out: "recebe do Asafe", cx: e.from === id ? "opera dentro" : "é operada por" }[e.type];
          return `<div class="net-item" data-edge="${e.id}">
            ${av(byId(other) || { id: other }, "sm")}
            <span class="ni-name">${nameOf(other)}</span><span class="ni-meta">${label}</span></div>`;
        }).join("")}
      </div>
      <div class="row-actions">
        <button class="btn ghost sm" id="open-data">${icon("db", "xs")}Dados</button>
        <button class="btn primary sm" id="new-line">${icon("link", "xs")}Nova linha</button>
      </div>`;
    $$("[data-edge]", inspector).forEach((el) => el.addEventListener("click", () => select({ kind: "edge", id: el.dataset.edge })));
    $("#open-data").addEventListener("click", () => showView("dados"));
    $("#new-line").addEventListener("click", () => toast(`Escolha a IA em que ${n.name} vai operar`));
  }

  function renderSimpleEdge(e) {
    const desc = { motor: `Conexão entre o Asafe e ${nameOf(e.to)}.`, prod: `Linha de produção: ${nameOf(e.from)} entrega para ${nameOf(e.to)}.`, data: "Dados fluindo para o núcleo do Asafe.", out: "O Asafe envia instruções e respostas para a IA." }[e.type];
    inspector.innerHTML = `
      <div class="card-title">Linha <span class="tag dim">${e.type}</span></div>
      <div class="route"><span class="chip ${e.from === "asafe" ? "red" : ""}">${nameOf(e.from)}</span>${icon("arrow", "xs muted")}<span class="chip ${e.to === "asafe" ? "red" : ""}">${nameOf(e.to)}</span></div>
      <p class="hint">${desc}</p>
      <dl class="kv"><dt>Tráfego</dt><dd>${(e.id.charCodeAt(1) * 3.1).toFixed(1)} KB/s</dd><dt>Desde</dt><dd>hoje, 08:12</dd></dl>
      ${legend()}`;
  }

  function renderLineInspector(e) {
    const from = nameOf(e.from), to = nameOf(e.to);
    inspector.innerHTML = `
      <div class="card-title">Linha Conexional <span class="tag solid">${icon("play", "xs")}Ao vivo</span></div>
      <div class="route">
        <span class="chip red"><span class="avatar sm red">${initial(from)}</span>${from}</span>
        ${icon("arrow", "xs muted")}<span class="mono label-xs">opera dentro de</span>${icon("arrow", "xs muted")}
        <span class="chip"><span class="avatar sm">${initial(to)}</span>${to}</span>
      </div>
      <div class="mirror">
        <div class="mirror-bar"><i></i><i></i><i></i><span>${to.toLowerCase()} · interface</span><span class="tag">controlada</span></div>
        <div class="mirror-body" id="mirror"></div>
      </div>
      <div class="caps" id="caps">
        <div class="cap on" data-cap="click">${icon("cursor")}Clicar</div>
        <div class="cap on" data-cap="type">${icon("keyboard")}Digitar</div>
        <div class="cap on" data-cap="read">${icon("eye")}Ler tela</div>
        <div class="cap on" data-cap="think">${icon("brain")}Pensar</div>
        <div class="cap on" data-cap="exec">${icon("code")}Executar</div>
        <div class="cap" data-cap="data">${icon("db")}Dados</div>
      </div>
      <div class="label-xs">Observando</div>
      <div class="mini-log" id="mini-log"></div>
      <div class="row-actions">
        <button class="btn ghost sm" id="pause-line">${icon("pause", "xs")}Pausar</button>
        <button class="btn ghost-red sm" id="cut-line">${icon("x", "xs")}Cortar linha</button>
      </div>`;
    $$(".cap", inspector).forEach((c) => c.addEventListener("click", () => c.classList.toggle("on")));
    $("#pause-line").addEventListener("click", () => { mirrorRun++; toast(`Linha ${from} → ${to} pausada`); });
    $("#cut-line").addEventListener("click", () => toast(`Cortar a linha exige confirmação do senhor`));
    runMirror(from, to);
  }

  /* simulação: uma IA operando dentro da outra */
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  async function runMirror(from, to) {
    const run = ++mirrorRun;
    const alive = () => run === mirrorRun && $("#mirror");
    const mirror = $("#mirror"), log = $("#mini-log");
    const caps = (c) => $$(".cap", inspector).forEach((x) => x.classList.toggle("live", x.dataset.cap === c));
    const addLog = (act, det) => {
      log.insertAdjacentHTML("afterbegin", `<div><time>${now()}</time><b>${act}</b><span>${det}</span></div>`);
      while (log.children.length > 4) log.lastElementChild.remove();
    };

    while (alive()) {
      mirror.innerHTML = `
        <div class="bubble in">Olá, sou o ${to}. Em que posso ajudar?</div>
        <div class="mirror-input" id="mi"><span id="mi-text"></span><span class="caret"></span><span class="send">${icon("send", "sm")}</span></div>
        <div class="ghost-cursor" id="gc" style="left:70%;top:20px">${icon("cursor")}<span class="who">${from}</span></div>`;
      const gc = $("#gc"), mi = $("#mi"), txt = $("#mi-text");
      const moveTo = (el, ox = 0.5, oy = 0.5) => {
        const r = el.getBoundingClientRect(), mr = mirror.getBoundingClientRect();
        gc.style.left = r.left - mr.left + r.width * ox + "px";
        gc.style.top = r.top - mr.top + r.height * oy + "px";
      };
      const click = () => { gc.classList.remove("click"); void gc.offsetWidth; gc.classList.add("click"); };

      caps("read"); addLog("ler", `interface de ${to}`);
      await sleep(1100); if (!alive()) return;
      caps("click"); moveTo(mi, 0.3); await sleep(950); if (!alive()) return;
      click(); addLog("clicar", "campo de mensagem");
      await sleep(400); if (!alive()) return;
      caps("type");
      const msg = "diga olá";
      for (const ch of msg) { txt.textContent += ch; await sleep(90); if (!alive()) return; }
      addLog("digitar", `“${msg}”`);
      await sleep(300); if (!alive()) return;
      caps("click"); moveTo($(".send", mi)); await sleep(950); if (!alive()) return;
      click(); addLog("clicar", "enviar");
      mi.insertAdjacentHTML("beforebegin", `<div class="bubble out">${msg}</div>`);
      txt.textContent = "";
      await sleep(400); if (!alive()) return;
      caps("think");
      mi.insertAdjacentHTML("beforebegin", `<div class="thinking" id="th"><b></b><b></b><b></b>&nbsp;${to} pensando…</div>`);
      addLog("pensar", `${from} aguarda resposta`);
      await sleep(1500); if (!alive()) return;
      $("#th").remove();
      mi.insertAdjacentHTML("beforebegin", `<div class="bubble in">Olá! 👋</div>`);
      caps("read"); addLog("ler", "resposta: “Olá! 👋”");
      await sleep(900); if (!alive()) return;
      caps("exec"); addLog("devolver", `texto → ${from}`);
      await sleep(2600);
      caps(null);
    }
  }

  /* ---------------- pedido de permissão ---------------- */
  function resolvePerm(ok) {
    state.pendingPerm = false;
    $("#perm-badge").classList.add("hidden");
    toast(ok ? "Permissão concedida" : "Pedido recusado");
    renderPerms();
  }

  /* ---------------- adicionar IA ---------------- */
  let kind = "aux";
  $$("#f-kind .seg").forEach((b) => b.addEventListener("click", () => {
    kind = b.dataset.kind;
    $$("#f-kind .seg").forEach((x) => x.classList.toggle("active", x === b));
  }));
  $("#f-add").addEventListener("click", () => {
    const name = $("#f-name").value.trim();
    if (!name) { $("#f-name").focus(); toast("Dê um nome para a nova IA"); return; }
    const role = $("#f-role").value.trim() || (kind === "main" ? "Agente principal" : "IA auxiliar");
    const id = name.toLowerCase().normalize("NFD").replace(/[^a-z0-9]/g, "") + "-" + Date.now().toString(36).slice(-3);
    const core = byId("asafe");
    const ang = Math.random() * Math.PI * 2;
    state.nodes.push({ id, name, role, kind, live: true, x: core.x + Math.cos(ang) * 320 - 50, y: core.y + Math.sin(ang) * 260 });
    if ($("#f-direct").checked) state.edges.push({ id: "e" + Date.now(), from: id, to: "asafe", type: "data" });
    if ($("#f-server").checked) servers.push({ id, name, role, kind, cpu: 6, mem: 12, up: "agora", status: "Iniciando" });
    $("#f-name").value = ""; $("#f-role").value = "";
    renderNodes(); renderEdges(); updateStats(); renderServers(); renderUsage();
    select({ kind: "node", id });
    toast(`${name} adicionada à rede${$("#f-server").checked ? " · servidor gerado" : ""}`);
  });

  /* =========================================================
     SERVIDORES
     ========================================================= */
  const servers = [
    ...Object.entries(MOTORES).map(([id, m]) => ({ id, name: m.nome, role: m.papel, kind: "aux", theme: m.tema, cpu: 0, mem: 0, up: "agora", status: "Ao vivo" })),
  ];
  const spark = (seed) => {
    let pts = "";
    for (let i = 0; i <= 24; i++) pts += `${i * 10},${seed === null ? 26 : 28 - Math.max(3, Math.min(25, 14 + Math.sin(i * 1.7 + seed) * 5))} `;
    return `<svg class="spark" viewBox="0 0 240 28" preserveAspectRatio="none"><polyline points="${pts}" fill="none" stroke="#ff3348" stroke-width="1.6"/><polyline points="0,28 ${pts} 240,28" fill="rgba(229,22,43,.10)" stroke="none"/></svg>`;
  };
  function renderServers() {
    if (conn.ok) return renderServidoresReais();
    $("#srv-alertas").innerHTML = "";
    $("#srv-kpis").innerHTML = [
      ["Servidores", servers.length, ""],
      ["Logins ativos", servers.filter((s) => s.status === "Ao vivo").length, ""],
      ["Requisições / min", "0", ""],
      ["Latência média", "—", ""],
    ].map(([l, v, d]) => `<div class="kpi glass"><div class="k-label">${l}</div><div class="k-val">${v}<small>${d}</small></div></div>`).join("");

    $("#srv-grid").innerHTML = servers.map((s) => `
      <div class="srv glass">
        <div class="srv-head">
          ${av(s, "lg")}
          <div class="t"><b>${s.name}</b><span>${s.role}</span></div>
          <span class="tag ${s.status !== "Ao vivo" ? "white" : s.theme && s.theme !== "red" ? s.theme : ""}"><span class="dot ${s.status === "Ao vivo" ? "pulse" : "white"}" style="width:5px;height:5px"></span>${s.status}</span>
        </div>
        <dl class="kv">
          <dt>Host</dt><dd>${s.id}.nathanael.ind ${icon("copy", "xs")}</dd>
          <dt>Login</dt><dd>ia://${s.id}@asafe ${icon("copy", "xs")}</dd>
          <dt>Chave</dt><dd>nth_••••••••••••${s.id.slice(0, 3)} ${icon("key", "xs")}</dd>
        </dl>
        <div class="usage-row"><div class="u-top"><b>CPU</b><span>${s.cpu}%</span></div><div class="bar"><i style="width:${s.cpu}%"></i></div></div>
        <div class="usage-row"><div class="u-top"><b>Memória</b><span>${s.mem}%</span></div><div class="bar white"><i style="width:${s.mem}%"></i></div></div>
        <div class="srv-foot"><span>uptime ${s.up}</span><span>gerado pelo Asafe</span></div>
      </div>`).join("") + `
      <button class="srv glass srv-novo" id="srv-novo-demo">
        <span class="avatar lg">${icon("plus")}</span><b style="color:var(--text)">Gerar novo servidor</b><span style="font-size:12px">Conecte o painel ao Asafe para gerar servidores de verdade</span>
      </button>`;
    $("#srv-novo-demo").addEventListener("click", () => modalGerarServidor());
  }

  /* =========================================================
     DADOS
     ========================================================= */
  function renderUsage() {
    if (conn.ok) return renderDadosReais();
    $("#dados-dir-titulo").textContent = "Backups";
    $("#collections").innerHTML = `
      <tr><th>Backup</th><th>Tamanho</th><th>Criado em</th><th></th></tr>
      <tr><td colspan="4"><div class="empty">Conecte o painel ao Asafe para ver e criar backups.</div></td></tr>`;
    const rows = [{ name: "Asafe (núcleo)", id: "asafe" }, ...servers];
    $("#usage").innerHTML = rows.map((n) => `
      <div class="usage-row"><div class="u-top">${av(n, "sm")}<b>${n.name}</b><span>0 B</span></div>
      <div class="bar"><i style="width:0%"></i></div></div>`).join("") +
      `<div class="legend"><div><span class="dot"></span>0 B de 10 GB usados</div></div>`;
  }

  /* =========================================================
     OBSERVADOR
     ========================================================= */
  const ACTS = {
    click: ["cursor", "clicar"], type: ["keyboard", "digitar"], think: ["brain", "pensar"], api: ["code", "api"], read: ["eye", "ler tela"],
  };
  const SAMPLES = [];
  let obsFilter = "all";
  function feedRow([a, b, act, det], time) {
    const [ic, label] = ACTS[act];
    return `<div class="feed-row" data-act="${act}" ${obsFilter !== "all" && obsFilter !== act ? 'style="display:none"' : ""}>
      <time>${time}</time>
      <span class="lane">${a} ${icon("arrow", "xs")} ${b}</span>
      <span class="act">${icon(ic, "sm")}${label}</span>
      <span class="det">${det}</span>
      <span><span class="tag ${act === "think" ? "dim" : ""}">${act === "think" ? "observado" : "ok"}</span></span>
    </div>`;
  }
  $("#feed").innerHTML = `<div class="empty">Nenhuma ação entre IA's ainda. Crie uma Linha Conexional para começar a observar.</div>`;
  $$("#obs-filter .seg").forEach((b) => b.addEventListener("click", () => {
    obsFilter = b.dataset.f;
    $$("#obs-filter .seg").forEach((x) => x.classList.toggle("active", x === b));
    $$(".feed-row").forEach((r) => (r.style.display = obsFilter === "all" || r.dataset.act === obsFilter ? "" : "none"));
  }));

  /* =========================================================
     PERMISSÕES
     ========================================================= */
  function renderPerms() {
    $("#perm-pending").innerHTML = state.pendingPerm ? `
      <div class="perm-item">
        <span class="avatar red">H</span>
        <div class="p-main"><b>Horácio → Miquéias</b><div><span class="red-t mono">linha.operar</span> · clicar, digitar, ler tela, pensar</div></div>
        <button class="btn ghost-red sm" data-pp="deny">Recusar</button><button class="btn primary sm" data-pp="ok">Aceitar</button>
      </div>` : `<div class="empty">Nenhum pedido pendente.</div>`;
    $$("[data-pp]").forEach((b) => b.addEventListener("click", () => resolvePerm(b.dataset.pp === "ok")));
    $("#perm-active").innerHTML = state.activePerms.map((p, i) => `
      <div class="perm-item">
        ${av(state.nodes.find((x) => (x.name || nameOf(x.id)) === p.who) || { name: p.who })}
        <div class="p-main"><b>${p.who} → ${p.target}</b><div><span class="red-t mono">${p.scope}</span> · ${p.until}</div></div>
        <button class="btn ghost sm" data-rm="${i}">Retirar</button>
      </div>`).join("") || `<div class="empty">Nenhuma permissão ativa.</div>`;
    $$("[data-rm]").forEach((b) => b.addEventListener("click", () => {
      const p = state.activePerms.splice(+b.dataset.rm, 1)[0];
      toast(`Permissão ${p.scope} de ${p.who} retirada`);
      renderPerms();
    }));
  }

  /* =========================================================
     CONEXÃO COM A API DO ASAFE
     Sem conexão: o painel mostra a demonstração.
     Conectado: Servidores, Dados e Observador mostram dados reais.
     ========================================================= */
  const conn = { url: "", token: "", ok: false, eu: null };
  const CHAVE_CONEXAO = "asafe.conexao";
  const esc = (v) => String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const NOME_OK = /^[a-z0-9_-]{2,40}$/;
  const admin = () => conn.eu?.permissoes?.includes("*");

  function lerConexao() {
    try { return JSON.parse(localStorage.getItem(CHAVE_CONEXAO) || "null"); } catch { return null; }
  }
  function salvarConexao(dados) {
    try { dados ? localStorage.setItem(CHAVE_CONEXAO, JSON.stringify(dados)) : localStorage.removeItem(CHAVE_CONEXAO); } catch { /* sem armazenamento */ }
  }
  function urlPadrao() {
    if (location.protocol.startsWith("http") && location.pathname.startsWith("/painel")) return location.origin;
    return "http://127.0.0.1:8000";
  }

  async function api(metodo, caminho, corpo, { blob = false } = {}) {
    let r;
    try {
      r = await fetch(conn.url + caminho, {
        method: metodo,
        headers: { Authorization: `Bearer ${conn.token}`, ...(corpo !== undefined ? { "Content-Type": "application/json" } : {}) },
        body: corpo !== undefined ? JSON.stringify(corpo) : undefined,
      });
    } catch {
      throw new Error("Asafe fora do ar ou endereço errado");
    }
    if (blob && r.ok) return r.blob();
    let dados = null;
    try { dados = await r.json(); } catch { /* sem corpo */ }
    if (!r.ok) {
      const d = dados?.detail;
      throw new Error(typeof d === "string" ? d : d ? d.map?.((x) => x.msg).join("; ") || JSON.stringify(d) : `Erro ${r.status}`);
    }
    return dados;
  }

  async function conectar(url, token, { silencioso = false } = {}) {
    conn.url = url.trim().replace(/\/+$/, "");
    conn.token = token.trim();
    try {
      conn.eu = await api("GET", "/eu");
      conn.ok = true;
      salvarConexao({ url: conn.url, token: conn.token });
      atualizarPill();
      if (!silencioso) toast(`Conectado ao Asafe como ${conn.eu.nome}`);
      atualizarAtual();
      return true;
    } catch (e) {
      conn.ok = false;
      atualizarPill();
      if (!silencioso) throw e;
      toast(`Não foi possível reconectar ao Asafe: ${e.message}`);
      return false;
    }
  }
  function desconectar() {
    Object.assign(conn, { ok: false, eu: null, token: "" });
    salvarConexao(null);
    atualizarPill();
    renderServers(); renderUsage(); renderFeedDemo(); renderEnergiaAtual();
    toast("Painel desconectado · modo demonstração");
  }

  function atualizarPill() {
    const host = conn.url.replace(/^https?:\/\//, "");
    $("#live-text").textContent = conn.ok ? `conectado · ${host}` : "demonstração · conectar";
    $("#conn-pill").classList.toggle("off", !conn.ok);
    $("#srv-sub").textContent = conn.ok
      ? "Cadastrados e vigiados pelo Asafe: métricas, alertas e comandos."
      : "Modo demonstração. Conecte o painel ao Asafe para ver e gerar servidores de verdade.";
    $("#obs-filter").style.display = conn.ok ? "none" : "";
    $("#obs-leituras-box").hidden = !conn.ok;
  }

  /* ---------------- janela (modal) ---------------- */
  function abrirModal(html, aoMontar) {
    $("#modal-box").innerHTML = html;
    $("#modal").classList.add("open");
    $("#modal").setAttribute("aria-hidden", "false");
    $$("[data-fechar]", $("#modal-box")).forEach((b) => b.addEventListener("click", fecharModal));
    aoMontar?.($("#modal-box"));
    $("#modal-box input:not([type=hidden])")?.focus();
  }
  function fecharModal() {
    $("#modal").classList.remove("open");
    $("#modal").setAttribute("aria-hidden", "true");
  }
  $("#modal").addEventListener("click", (e) => e.target.id === "modal" && fecharModal());
  document.addEventListener("keydown", (e) => e.key === "Escape" && fecharModal());

  const cabecalho = (titulo, sub = "") => `
    <div class="modal-head"><div><b>${titulo}</b>${sub ? `<span>${sub}</span>` : ""}</div>
      <button class="icon-btn" data-fechar title="Fechar">${icon("x")}</button></div>`;
  const erroBox = `<div class="modal-erro" id="m-erro" hidden></div>`;
  const mostrarErro = (box, msg) => { const e = $("#m-erro", box); e.textContent = msg; e.hidden = !msg; };
  function ocupado(botao, sim) { botao.disabled = sim; botao.classList.toggle("carregando", sim); }
  function copiavel(rotulo, texto) {
    return `<div class="copia"><span class="label-xs">${rotulo}</span>
      <div class="copia-linha"><code>${esc(texto)}</code><button class="btn ghost sm" data-copiar="${esc(texto)}">${icon("copy", "xs")}Copiar</button></div></div>`;
  }
  function ligarCopiar(box) {
    $$("[data-copiar]", box).forEach((b) => b.addEventListener("click", async () => {
      try { await navigator.clipboard.writeText(b.dataset.copiar); toast("Copiado"); }
      catch { toast("Não deu para copiar automaticamente; selecione o texto"); }
    }));
  }

  function modalConexao(motivo = "") {
    const salvo = lerConexao();
    abrirModal(`
      ${cabecalho("Conectar ao Asafe", motivo || "O painel passa a mostrar os dados reais da API.")}
      <label class="field"><span>Endereço da API</span><input id="m-url" value="${esc(conn.url || salvo?.url || urlPadrao())}" placeholder="http://127.0.0.1:8000" /></label>
      <label class="field"><span>Token</span><input id="m-token" type="password" value="${esc(conn.token || salvo?.token || "")}" placeholder="token do Sr. Nathanael (ASAFE_ADMIN_TOKEN)" autocomplete="off" /></label>
      <p class="hint">O token fica salvo só neste navegador. Para gerar e remover máquinas use o token do Sr. Nathanael.</p>
      ${erroBox}
      <div class="modal-acoes">
        ${conn.ok ? `<button class="btn ghost-red" id="m-sair">Desconectar</button>` : `<button class="btn ghost" data-fechar>Cancelar</button>`}
        <button class="btn primary" id="m-ok">${icon("link", "sm")}Conectar</button>
      </div>`, (box) => {
      const ok = $("#m-ok", box);
      const ir = async () => {
        ocupado(ok, true); mostrarErro(box, "");
        try { await conectar($("#m-url", box).value, $("#m-token", box).value); fecharModal(); }
        catch (e) { mostrarErro(box, e.message); }
        finally { ocupado(ok, false); }
      };
      ok.addEventListener("click", ir);
      $("#m-token", box).addEventListener("keydown", (e) => e.key === "Enter" && ir());
      $("#m-sair", box)?.addEventListener("click", () => { desconectar(); fecharModal(); });
    });
  }
  $("#conn-pill").addEventListener("click", () => modalConexao());

  /* ---------------- formatação ---------------- */
  function bytes(n) {
    if (n == null) return "—";
    const u = ["B", "KB", "MB", "GB", "TB"]; let i = 0;
    while (n >= 1024 && i < u.length - 1) { n /= 1024; i++; }
    return `${n.toLocaleString("pt-BR", { maximumFractionDigits: i ? 1 : 0 })} ${u[i]}`;
  }
  function dataSqlite(s) { return s ? new Date(s.replace(" ", "T") + (s.endsWith("Z") ? "" : "Z")) : null; }
  function haQuanto(seg) {
    if (seg == null) return "nunca";
    if (seg < 60) return `há ${Math.round(seg)} s`;
    if (seg < 3600) return `há ${Math.round(seg / 60)} min`;
    if (seg < 86400) return `há ${Math.round(seg / 3600)} h`;
    return `há ${Math.round(seg / 86400)} d`;
  }
  const hora = (d) => d ? `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}` : "--:--:--";
  const STATUS = {
    online: ["Ao vivo", ""], offline: ["Offline", "white"], manutencao: ["Manutenção", "dim"], criando: ["Criando", "cyan"],
  };
  const NOMES_PROVEDOR = { local: "local (teste)", oracle: "Oracle Cloud" };

  /* =========================================================
     SERVIDORES (reais)
     ========================================================= */
  async function renderServidoresReais() {
    let lista, alertas;
    try {
      [lista, alertas] = await Promise.all([api("GET", "/servidores"), api("GET", "/alertas")]);
    } catch (e) {
      $("#srv-kpis").innerHTML = "";
      $("#srv-alertas").innerHTML = "";
      $("#srv-grid").innerHTML = `<div class="empty card glass">Não foi possível carregar os servidores: ${esc(e.message)}</div>`;
      return;
    }
    const conta = (st) => lista.filter((s) => s.status === st).length;
    $("#srv-kpis").innerHTML = [
      ["Servidores", lista.length, ""],
      ["Online", conta("online"), ""],
      ["Offline", conta("offline"), conta("offline") ? "atenção" : ""],
      ["Alertas abertos", alertas.length, ""],
    ].map(([l, v, d]) => `<div class="kpi glass"><div class="k-label">${l}</div><div class="k-val">${v}<small>${d}</small></div></div>`).join("");

    $("#srv-alertas").innerHTML = alertas.length ? `
      <div class="card glass alertas">
        <div class="card-title">Alertas abertos <span class="tag solid">${alertas.length}</span></div>
        ${alertas.map((a) => `
          <div class="alerta">
            <span class="tag">${esc(a.tipo)}</span>
            <span class="a-msg">${esc(a.mensagem)}</span>
            <time class="mono muted">${hora(dataSqlite(a.criado_em))}</time>
            <button class="btn ghost sm" data-resolver="${a.id}">Resolver</button>
          </div>`).join("")}
      </div>` : "";
    $$("[data-resolver]").forEach((b) => b.addEventListener("click", async () => {
      try { await api("POST", `/alertas/${b.dataset.resolver}/resolver`); renderServidoresReais(); }
      catch (e) { toast(e.message); }
    }));

    const barra = (rot, v, branca) => `
      <div class="usage-row"><div class="u-top"><b>${rot}</b><span>${v == null ? "—" : Math.round(v) + "%"}</span></div>
      <div class="bar ${branca ? "white" : ""}"><i style="width:${v ?? 0}%"></i></div></div>`;

    $("#srv-grid").innerHTML = lista.map((s) => {
      const [rot, cls] = STATUS[s.status] || [s.status, "dim"];
      return `
      <div class="srv glass srv-${s.status}">
        <div class="srv-head">
          <span class="avatar lg ${s.status === "online" ? "red" : ""}">${icon("server")}</span>
          <div class="t"><b>${esc(s.nome)}</b><span>${esc(s.endereco)}</span></div>
          <span class="tag ${cls}"><span class="dot ${s.status === "online" ? "pulse" : "white"}" style="width:5px;height:5px"></span>${rot}</span>
        </div>
        <dl class="kv">
          <dt>Último sinal</dt><dd>${haQuanto(s.segundos_sem_sinal)}</dd>
          <dt>Intervalo</dt><dd>${s.intervalo} s</dd>
          <dt>Origem</dt><dd>${s.provedor ? esc(NOMES_PROVEDOR[s.provedor] || s.provedor) : "cadastrado à mão"}</dd>
        </dl>
        ${barra("CPU", s.metricas.cpu)}${barra("Memória", s.metricas.memoria, true)}${barra("Disco", s.metricas.disco, true)}
        <div class="srv-acoes">
          <button class="btn ghost sm" data-manut="${esc(s.nome)}" data-v="${s.manutencao ? 0 : 1}">${icon("pause", "xs")}${s.manutencao ? "Sair da manutenção" : "Manutenção"}</button>
          <button class="btn ghost sm" data-cmd="${esc(s.nome)}">${icon("play", "xs")}Comando</button>
          <button class="btn ghost-red sm" data-rem="${esc(s.nome)}" data-prov="${esc(s.provedor || "")}">${icon("x", "xs")}Remover</button>
        </div>
      </div>`;
    }).join("") + `
      <button class="srv glass srv-novo" id="srv-novo">
        <span class="avatar lg">${icon("plus")}</span><b>Gerar novo servidor</b>
        <span>Cadastrar uma máquina ou criar uma nova</span>
      </button>`;

    $("#srv-novo").addEventListener("click", () => modalGerarServidor());
    $$("[data-manut]").forEach((b) => b.addEventListener("click", async () => {
      try {
        await api("PATCH", `/servidores/${b.dataset.manut}`, { manutencao: b.dataset.v === "1" });
        toast(b.dataset.v === "1" ? `${b.dataset.manut} em manutenção (alertas silenciados)` : `${b.dataset.manut} saiu da manutenção`);
        renderServidoresReais();
      } catch (e) { toast(e.message); }
    }));
    $$("[data-cmd]").forEach((b) => b.addEventListener("click", () => modalComando(b.dataset.cmd)));
    $$("[data-rem]").forEach((b) => b.addEventListener("click", () => modalRemover(b.dataset.rem, b.dataset.prov)));
  }

  function modalGerarServidor() {
    if (!conn.ok) return modalConexao("Para gerar servidores de verdade, conecte o painel à API do Asafe.");
    abrirModal(`
      ${cabecalho("Gerar servidor", "O servidor passa a ser vigiado pelo Asafe: métricas, alertas e comandos.")}
      <div class="seg-group" id="m-modo">
        <button class="seg active" data-modo="cadastrar">Já tenho a máquina</button>
        <button class="seg" data-modo="criar">Criar máquina nova</button>
      </div>
      <div class="form-row">
        <label class="field"><span>Nome</span><input id="m-nome" placeholder="ex.: srv-01" maxlength="40" /></label>
        <label class="field"><span>Intervalo do sinal (s)</span><input id="m-int" type="number" min="5" max="3600" value="30" /></label>
      </div>
      <label class="field" id="m-end-box"><span>Endereço da máquina</span><input id="m-end" placeholder="ex.: 10.0.0.5" /></label>
      <label class="field" id="m-prov-box" hidden><span>Onde criar</span>
        <div class="select"><select id="m-prov"><option>carregando…</option></select>${icon("chev", "xs")}</div></label>
      <p class="hint" id="m-dica">Você recebe um comando pronto. Cole-o na máquina e ela começa a mandar sinal para o Asafe.</p>
      ${erroBox}
      <div class="modal-acoes"><button class="btn ghost" data-fechar>Cancelar</button>
        <button class="btn primary" id="m-ok">${icon("plus", "sm")}Gerar servidor</button></div>`, async (box) => {
      let modo = "cadastrar";
      $$("#m-modo .seg", box).forEach((b) => b.addEventListener("click", () => {
        modo = b.dataset.modo;
        $$("#m-modo .seg", box).forEach((x) => x.classList.toggle("active", x === b));
        $("#m-end-box", box).hidden = modo !== "cadastrar";
        $("#m-prov-box", box).hidden = modo !== "criar";
        $("#m-dica", box).textContent = modo === "cadastrar"
          ? "Você recebe um comando pronto. Cole-o na máquina e ela começa a mandar sinal para o Asafe."
          : "O Asafe cria a máquina, que liga o sentinela sozinha e aparece aqui. Só o token do Sr. Nathanael pode criar máquinas.";
      }));
      try {
        const provs = await api("GET", "/provedores");
        $("#m-prov", box).innerHTML = provs.map((p) =>
          `<option value="${esc(p.nome)}" ${p.configurado ? "" : "disabled"}>${esc(p.descricao)}${p.configurado ? "" : ` · ${esc(p.motivo)}`}</option>`).join("");
        const primeiro = provs.find((p) => p.configurado);
        if (primeiro) $("#m-prov", box).value = primeiro.nome;
      } catch (e) { $("#m-prov", box).innerHTML = `<option disabled>${esc(e.message)}</option>`; }

      const ok = $("#m-ok", box);
      ok.addEventListener("click", async () => {
        const nome = $("#m-nome", box).value.trim().toLowerCase();
        const intervalo = Number($("#m-int", box).value) || 30;
        if (!NOME_OK.test(nome)) return mostrarErro(box, "Nome: 2 a 40 caracteres, só letras minúsculas, números, - e _.");
        mostrarErro(box, ""); ocupado(ok, true);
        try {
          if (modo === "cadastrar") {
            const endereco = $("#m-end", box).value.trim() || "a definir";
            const r = await api("POST", "/servidores?gerar_token_sinal=true", { nome, endereco, intervalo });
            mostrarResultadoCadastro(r);
          } else {
            const provedor = $("#m-prov", box).value;
            const r = await api("POST", "/servidores/criar", { nome, provedor, intervalo });
            mostrarResultadoCriacao(r);
          }
          renderServidoresReais();
        } catch (e) { mostrarErro(box, e.message); }
        finally { ocupado(ok, false); }
      });
    });
  }

  function mostrarResultadoCadastro(r) {
    abrirModal(`
      ${cabecalho(`Servidor ${esc(r.nome)} gerado`, "Agora rode o sentinela nessa máquina.")}
      <div class="passo"><span class="num">1</span><p>Na máquina <b>${esc(r.nome)}</b>, abra o terminal e cole este comando (precisa de Python 3):</p></div>
      ${copiavel("Comando do sentinela", r.comando_sentinela)}
      <div class="passo"><span class="num">2</span><p>Em até ${r.intervalo} segundos o servidor aparece como <b>Ao vivo</b> no painel.</p></div>
      ${copiavel("Token do servidor (só manda sinal)", r.token)}
      <p class="hint aviso">Guarde o token: ele não será mostrado de novo. Se perder, remova e gere o servidor outra vez.</p>
      <div class="modal-acoes"><button class="btn primary" data-fechar>Pronto</button></div>`, ligarCopiar);
  }

  function mostrarResultadoCriacao(r) {
    abrirModal(`
      ${cabecalho(`Máquina ${esc(r.nome)} criada`, esc(NOMES_PROVEDOR[r.provedor] || r.provedor))}
      <dl class="kv"><dt>Id</dt><dd>${esc(r.maquina?.id || r.maquina_id)}</dd><dt>Estado</dt><dd>${esc(r.maquina?.estado || "criando")}</dd></dl>
      <p class="hint">A máquina está ligando. Quando o sentinela mandar o primeiro sinal, ela passa de <b>Criando</b> para <b>Ao vivo</b>.
      ${r.provedor === "oracle" ? "Na Oracle isso costuma levar de 2 a 5 minutos." : ""}</p>
      <div class="modal-acoes"><button class="btn primary" data-fechar>Pronto</button></div>`);
  }

  function modalComando(nome) {
    const cmds = [["reiniciar", "Reiniciar"], ["parar", "Parar"], ["atualizar", "Atualizar"], ["limpar_cache", "Limpar cache"], ["coletar_logs", "Coletar logs"]];
    abrirModal(`
      ${cabecalho(`Comando para ${esc(nome)}`, "Entregue no próximo sinal. O sentinela só executa o que o dono da máquina configurou.")}
      <div class="cmd-grid">${cmds.map(([c, r]) => `<button class="btn ghost" data-c="${c}">${r}</button>`).join("")}</div>
      <div class="label-xs">Últimos comandos</div><div id="m-hist" class="mini-log"><div class="muted">carregando…</div></div>
      ${erroBox}
      <div class="modal-acoes"><button class="btn ghost" data-fechar>Fechar</button></div>`, async (box) => {
      const hist = async () => {
        try {
          const h = await api("GET", `/servidores/${nome}/comandos`);
          $("#m-hist", box).innerHTML = h.slice(0, 6).map((c) =>
            `<div><time>${hora(dataSqlite(c.criado_em))}</time><b>${esc(c.comando)}</b><span>${esc(c.estado)}${c.resultado ? " · " + esc(c.resultado.slice(0, 60)) : ""}</span></div>`).join("")
            || `<div class="muted">Nenhum comando ainda.</div>`;
        } catch (e) { $("#m-hist", box).innerHTML = `<div class="muted">${esc(e.message)}</div>`; }
      };
      hist();
      $$("[data-c]", box).forEach((b) => b.addEventListener("click", async () => {
        ocupado(b, true);
        try { await api("POST", `/servidores/${nome}/comandos`, { comando: b.dataset.c }); toast(`Comando ${b.dataset.c} enviado para ${nome}`); hist(); }
        catch (e) { mostrarErro(box, e.message); }
        finally { ocupado(b, false); }
      }));
    });
  }

  function modalRemover(nome, provedor) {
    abrirModal(`
      ${cabecalho(`Remover ${esc(nome)}?`, "O Asafe para de vigiar este servidor e o token dele deixa de funcionar.")}
      ${provedor ? `<label class="check"><input type="checkbox" id="m-destruir" checked /><span class="box"></span>Destruir também a máquina (${esc(NOMES_PROVEDOR[provedor] || provedor)})</label>` : ""}
      ${erroBox}
      <div class="modal-acoes"><button class="btn ghost" data-fechar>Cancelar</button>
        <button class="btn primary" id="m-ok">${icon("x", "sm")}Remover</button></div>`, (box) => {
      const ok = $("#m-ok", box);
      ok.addEventListener("click", async () => {
        ocupado(ok, true);
        const destruir = $("#m-destruir", box)?.checked ? "?destruir_maquina=true" : "";
        try {
          const r = await api("DELETE", `/servidores/${nome}${destruir}`);
          toast(`${nome} removido${r.maquina_destruida ? " · máquina destruída" : ""}`);
          fecharModal(); renderServidoresReais();
        } catch (e) { mostrarErro(box, e.message); }
        finally { ocupado(ok, false); }
      });
    });
  }

  $("#btn-gerar-srv").addEventListener("click", () => modalGerarServidor());

  /* =========================================================
     DADOS (reais)
     ========================================================= */
  async function renderDadosReais() {
    try {
      const usos = admin() ? await api("GET", "/armazenamento/uso/todos") : [await api("GET", "/armazenamento/uso")];
      $("#usage").innerHTML = usos.map((u) => {
        const pct = u.cota_bytes ? Math.min(100, (100 * u.total_bytes) / u.cota_bytes) : 0;
        return `<div class="usage-row"><div class="u-top">${av(byId(u.agente) || { id: u.agente, name: u.agente }, "sm")}<b>${esc(u.agente)}</b>
          <span>${bytes(u.total_bytes)} de ${bytes(u.cota_bytes)}</span></div>
          <div class="bar"><i style="width:${pct}%"></i></div>
          <div class="u-sub mono">${u.arquivos.quantidade} arquivo(s) · ${u.dados.quantidade} dado(s)</div></div>`;
      }).join("") || `<div class="empty">Nenhuma IA registrada ainda.</div>`;
    } catch (e) { $("#usage").innerHTML = `<div class="empty">${esc(e.message)}</div>`; }

    if (!admin()) {
      $("#collections").innerHTML = `<tr><td><div class="empty">Backups: só com o token do Sr. Nathanael.</div></td></tr>`;
      return;
    }
    try {
      const b = await api("GET", "/backups");
      $("#dados-dir-titulo").innerHTML = `Backups <span class="tag dim">${b.automatico_a_cada_horas ? `automático a cada ${b.automatico_a_cada_horas} h · guarda ${b.manter}` : "automático desligado"}</span>`;
      $("#collections").innerHTML = `<tr><th>Backup</th><th>Tamanho</th><th>Criado em</th><th></th></tr>` +
        (b.backups.map((x) => `<tr><td class="mono"><b>${esc(x.nome)}</b></td><td class="mono">${bytes(x.tamanho)}</td>
          <td class="muted">${esc(x.criado_em.replace("T", " "))}</td>
          <td class="acoes-td"><button class="btn ghost sm" data-baixar="${esc(x.nome)}">${icon("download", "xs")}Baixar</button>
          <button class="btn ghost-red sm" data-apagar-bkp="${esc(x.nome)}">${icon("x", "xs")}</button></td></tr>`).join("")
          || `<tr><td colspan="4"><div class="empty">Nenhum backup ainda. Clique em “Criar backup”.</div></td></tr>`);
      $$("[data-baixar]").forEach((bt) => bt.addEventListener("click", async () => {
        try {
          const blob = await api("GET", `/backups/${bt.dataset.baixar}`, undefined, { blob: true });
          const a = Object.assign(document.createElement("a"), { href: URL.createObjectURL(blob), download: bt.dataset.baixar });
          a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 2000);
        } catch (e) { toast(e.message); }
      }));
      $$("[data-apagar-bkp]").forEach((bt) => bt.addEventListener("click", async () => {
        if (!confirm(`Apagar o backup ${bt.dataset.apagarBkp}?`)) return;
        try { await api("DELETE", `/backups/${bt.dataset.apagarBkp}`); renderDadosReais(); } catch (e) { toast(e.message); }
      }));
    } catch (e) { $("#collections").innerHTML = `<tr><td><div class="empty">${esc(e.message)}</div></td></tr>`; }
  }
  $("#btn-backup").addEventListener("click", async (ev) => {
    if (!conn.ok) return modalConexao("Para criar backups, conecte o painel à API do Asafe.");
    const b = ev.currentTarget; ocupado(b, true);
    try { const r = await api("POST", "/backups"); toast(`Backup criado: ${r.nome}`); renderDadosReais(); }
    catch (e) { toast(e.message); }
    finally { ocupado(b, false); }
  });

  /* =========================================================
     OBSERVADOR (auditoria real)
     ========================================================= */
  async function renderObservadorReal() {
    try {
      const leituras = $("#obs-leituras").checked;
      // as leituras do próprio painel (GET a cada 5 s) escondem o que importa; ficam ocultas por padrão
      const log = (await api("GET", "/auditoria?limite=400"))
        .filter((l) => leituras || l.acao !== "GET" || l.status >= 400).slice(0, 80);
      $("#feed").innerHTML = log.map((l) => {
        const negado = l.status === 401 || l.status === 403;
        const st = negado ? ["negado", "white"] : l.status >= 400 ? [`erro ${l.status}`, "dim"] : ["ok", ""];
        return `<div class="feed-row">
          <time>${hora(dataSqlite(l.criado_em))}</time>
          <span class="lane">${esc(l.agente)}</span>
          <span class="act">${icon(l.acao === "GET" ? "eye" : "send", "sm")}${esc(l.acao)}</span>
          <span class="det mono">${esc(l.alvo)}</span>
          <span><span class="tag ${st[1]}">${st[0]}</span></span></div>`;
      }).join("") || `<div class="empty">Nenhuma ação registrada ainda.</div>`;
    } catch (e) { $("#feed").innerHTML = `<div class="empty">${esc(e.message)}</div>`; }
  }
  $("#obs-leituras").addEventListener("change", () => conn.ok && renderObservadorReal());
  function renderFeedDemo() {
    $("#feed").innerHTML = `<div class="empty">Nenhuma ação entre IA's ainda. Conecte o painel ao Asafe para ver a auditoria real.</div>`;
  }

  /* =========================================================
     ENERGIA (eletronanologia)
     Sem conexão: simulador local com as mesmas regras do Asafe.
     Conectado: estado real de /energia (caixas guardadas no banco, fontes físicas, eventos).
     ========================================================= */
  const NIVEL_INFO = {
    normal: ["Normal", "", "Na rede elétrica. Caixas cheias ou recarregando."],
    bateria: ["Bateria", "solid", "A luz caiu. O Asafe está funcionando pelas caixas de energia."],
    aviso: ["Aviso", "orange", "Energia abaixo de 25%. Prepare-se para o desligamento."],
    critico: ["Crítico", "solid", "Energia crítica: dados salvos, IAs em modo protegido (sem gravações)."],
    desligado: ["Desligado", "white", "Caixas esgotadas. Sistemas desligados até a luz voltar."],
  };
  const demoEnergia = (() => {
    const meta = 48, consumo = 60, n = 4, porCaixa = (consumo * meta) / n;
    const st = {
      caixas: Array.from({ length: n }, (_, i) => ({ nome: `caixa-${i + 1}`, cap: porCaixa, carga: porCaixa })),
      naRede: true, semLuz: 0, nivelAnt: "normal", eventos: [],
    };
    const total = () => st.caixas.reduce((a, c) => a + c.carga, 0);
    const pct = () => Math.round((1000 * total()) / (porCaixa * n)) / 10;
    const nivel = () => (st.naRede ? "normal" : total() <= 0 ? "desligado" : pct() <= 10 ? "critico" : pct() <= 25 ? "aviso" : "bateria");
    const MSG = {
      bateria: "⚡ A luz caiu. Asafe e IAs funcionando pelas caixas de energia.",
      aviso: "🟠 Energia de reserva abaixo de 25%.",
      critico: "🔴 Energia crítica. Salvando dados e desligando com segurança.",
      desligado: "⛔ Caixas de energia esgotadas.",
      normal: "✅ A luz voltou. Caixas recarregando.",
    };
    const ev = (tipo, nv, mensagem) => st.eventos.unshift({
      tipo, nivel: nv, mensagem, origem: "simulacao", criado_em: new Date().toISOString().slice(0, 19).replace("T", " "),
    });
    function passo(h) {
      if (st.naRede) {
        let e = 300 * h;
        for (const c of st.caixas) { const v = Math.min(e, c.cap - c.carga); c.carga += v; e -= v; }
      } else {
        st.semLuz += h;
        let f = consumo * h;
        for (const c of st.caixas) { const v = Math.min(f, c.carga); c.carga -= v; f -= v; }
      }
      const nv = nivel();
      if (nv !== st.nivelAnt) {
        st.nivelAnt = nv;
        ev("nivel", nv, MSG[nv]);
        if (nv === "critico") {
          ev("backup", "critico", "💾 Backup de emergência criado (demonstração).");
          ev("desligamento", "critico", "🛑 Desligamento seguro: IAs em modo protegido.");
        }
      }
    }
    const avancar = (h) => { while (h > 1e-9) { const p = Math.min(h, 0.5); passo(p); h -= p; } };
    return {
      estado: () => ({
        na_rede_eletrica: st.naRede, nivel: nivel(), carga_pct: pct(),
        autonomia_horas: Math.round((10 * total()) / consumo) / 10, meta_horas: meta,
        horas_sem_luz: st.semLuz, consumo_w: consumo, modo_protegido: ["critico", "desligado"].includes(nivel()),
        caixas: st.caixas.map((c) => ({ nome: c.nome, capacidade_wh: c.cap, carga_pct: Math.round((1000 * c.carga) / c.cap) / 10 })),
        fontes: [], ultimos_eventos: st.eventos.slice(0, 10),
      }),
      queda: () => { if (st.naRede) { st.naRede = false; st.semLuz = 0; ev("queda", null, "Queda de luz detectada (simulacao)."); } avancar(0.0001); },
      retorno: () => { if (!st.naRede) { st.naRede = true; ev("retorno", null, "A luz voltou (simulacao)."); } avancar(0.0001); },
      avancar,
    };
  })();

  function renderEnergia(e) {
    if (window.AsafeFundo) window.AsafeFundo.nivel(e.nivel);  // o wallpaper acompanha a energia
    const [rot, cls, txt] = NIVEL_INFO[e.nivel] || [e.nivel, "dim", ""];
    $("#en-sub").textContent = conn.ok
      ? "Estado real das caixas de energia do Asafe, guardado no banco e descarregando em tempo real quando a luz cai."
      : "Modo demonstração: simule uma queda de luz. Conecte o painel ao Asafe para ver a energia real.";
    const ban = $("#en-banner");
    ban.hidden = e.nivel === "normal";
    ban.className = `en-banner nivel-${e.nivel}`;
    ban.innerHTML = `${icon(e.nivel === "desligado" ? "x" : "bolt")}<div><b>${rot}</b><span>${txt}</span></div>${e.modo_protegido ? `<span class="tag solid">modo protegido</span>` : ""}`;

    const horas = (h) => (h >= 1 ? `${h.toLocaleString("pt-BR", { maximumFractionDigits: 1 })} h` : `${Math.round(h * 60)} min`);
    $("#en-kpis").innerHTML = [
      ["Nível", `<span class="tag ${cls}">${rot}</span>`, ""],
      ["Carga total", `${e.carga_pct.toLocaleString("pt-BR")}%`, ""],
      ["Autonomia", horas(e.autonomia_horas), `meta ${e.meta_horas} h`],
      [e.na_rede_eletrica ? "Rede elétrica" : "Sem luz há", e.na_rede_eletrica ? "ligada" : horas(e.horas_sem_luz), `${e.consumo_w} W`],
    ].map(([l, v, d]) => `<div class="kpi glass"><div class="k-label">${l}</div><div class="k-val">${v}<small>${d}</small></div></div>`).join("");

    const ativa = e.na_rede_eletrica ? -1 : e.caixas.findIndex((c) => c.carga_pct > 0);
    $("#en-caixas").innerHTML = e.caixas.map((c, i) => {
      const estado = i === ativa ? "em uso" : c.carga_pct <= 0 ? "vazia" : e.na_rede_eletrica && c.carga_pct < 100 ? "recarregando" : "pronta";
      return `<div class="caixa glass ${i === ativa ? "ativa" : ""} ${c.carga_pct <= 0 ? "vazia" : ""}">
        <div class="caixa-top"><b>${esc(c.nome)}</b><span class="tag ${i === ativa ? "solid" : "dim"}">${estado}</span></div>
        <div class="bateria"><i style="height:${c.carga_pct}%"></i><span>${Math.round(c.carga_pct)}%</span></div>
        <div class="caixa-rodape mono">${Math.round(c.capacidade_wh)} Wh · ${horas((c.capacidade_wh * c.carga_pct) / 100 / e.consumo_w)}</div>
      </div>`;
    }).join("");

    $("#en-fontes-n").textContent = e.fontes.length;
    $("#en-fontes").innerHTML = e.fontes.length
      ? e.fontes.map((f) => {
        const [r, c] = NIVEL_INFO[f.nivel] || [f.nivel, "dim"];
        const det = (f.na_rede ? "na rede elétrica" : "na bateria")
          + (f.bateria_pct != null ? ` · ${Math.round(f.bateria_pct)}%` : "")
          + (f.autonomia_min != null ? ` · ${Math.round(f.autonomia_min)} min` : "");
        return `<div class="perm-item"><span class="avatar">${icon("battery")}</span>
          <div class="p-main"><b>${esc(f.servidor)}</b><div>${det}</div></div><span class="tag ${c}">${r}</span></div>`;
      }).join("")
      : `<div class="empty">Nenhuma fonte física ainda. Um nobreak informa a energia real pelo sinal do servidor (campo <span class="mono">info</span>: na_rede_eletrica, bateria_pct, autonomia_min).</div>`;

    $("#en-log").innerHTML = e.ultimos_eventos.map((ev) =>
      `<div><time>${hora(dataSqlite(ev.criado_em))}</time><b>${esc(ev.tipo)}</b><span>${esc(ev.mensagem)}</span></div>`).join("")
      || `<div class="muted">Nenhum evento ainda.</div>`;

    $("#en-retorno").disabled = e.na_rede_eletrica;
    $("#en-queda").disabled = !e.na_rede_eletrica;
  }

  async function renderEnergiaAtual() {
    if (!conn.ok) return renderEnergia(demoEnergia.estado());
    try { renderEnergia(await api("GET", "/energia")); }
    catch (err) { $("#en-caixas").innerHTML = `<div class="empty card glass">Não foi possível carregar a energia: ${esc(err.message)}</div>`; }
  }
  async function acaoEnergia(botao, demo, caminho) {
    if (!conn.ok) { demo(); return renderEnergia(demoEnergia.estado()); }
    ocupado(botao, true);
    try { renderEnergia(await api("POST", caminho)); } catch (err) { toast(err.message); }
    finally { ocupado(botao, false); }
  }
  $("#en-queda").addEventListener("click", (ev) => acaoEnergia(ev.currentTarget, demoEnergia.queda, "/energia/queda"));
  $("#en-retorno").addEventListener("click", (ev) => acaoEnergia(ev.currentTarget, demoEnergia.retorno, "/energia/retorno"));
  $("#en-avancar").addEventListener("click", (ev) => acaoEnergia(ev.currentTarget, () => demoEnergia.avancar(6), "/energia/avancar?horas=6"));
  renderEnergia(demoEnergia.estado());

  /* ---------------- atualização ---------------- */
  function viewAtual() { return $(".tab.active")?.dataset.view; }
  function atualizarAtual() {
    if (!conn.ok) return;
    const v = viewAtual();
    if (v === "energia") return renderEnergiaAtual();
    if (v === "servidores") renderServidoresReais();
    else if (v === "dados") renderDadosReais();
    else if (v === "observador") renderObservadorReal();
  }
  $$(".tab").forEach((t) => t.addEventListener("click", () => setTimeout(() => (t.dataset.view === "energia" && !conn.ok ? renderEnergiaAtual() : atualizarAtual()))));
  setInterval(() => { if (document.visibilityState === "visible" && !$("#modal").classList.contains("open")) atualizarAtual(); }, 5000);

  // reconecta sozinho se havia uma conexão salva
  (() => {
    const salvo = lerConexao();
    if (salvo?.url && salvo?.token) conectar(salvo.url, salvo.token, { silencioso: true });
    else if (location.pathname.startsWith("/painel")) conn.url = location.origin;
  })();

  /* ---------------- inicialização ---------------- */
  renderNodes();
  renderEdges();
  renderInspector();
  renderServers();
  renderUsage();
  renderPerms();
  updateStats();
  atualizarPill();
  requestAnimationFrame(fit);
  window.addEventListener("resize", () => $("#view-linhas").classList.contains("active") && fit());
})();
