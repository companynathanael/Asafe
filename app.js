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
  const CORES = {
    red: { w: 190, hh: 164, h: 230, img: "assets/asafe-symbol-256.png", name: "ASAFE", sub: "NÚCLEO · SERVIDORES · DADOS" },
    cyan: { w: 140, hh: 108, h: 165, img: "assets/gather-symbol.png", name: "GATHER", sub: "ORQUESTRA APIs" },
  };
  const coreDim = (n) => CORES[n.theme || "red"];

  const state = {
    nodes: [
      { id: "asafe", type: "core", theme: "red", x: 220, y: 300 },
      { id: "gather", type: "core", theme: "cyan", name: "Gather", x: 760, y: 330, live: true },
    ],
    edges: [
      { id: "e1", from: "asafe", to: "gather", type: "gather", label: "conexão" },
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
      ["conectando ao Gather", 88],
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
    setTimeout(() => splash.remove(), 800);
  })();

  /* ---------------- relógio & topo ---------------- */
  const tick = () => ($("#clock").textContent = now());
  tick(); setInterval(tick, 1000);

  function updateStats() {
    const ais = state.nodes.filter((n) => n.id !== "asafe");
    $("#st-nodes").textContent = state.nodes.length;
    $("#st-lines").textContent = state.edges.length;
    $("#live-text").textContent = `núcleo · ${ais.filter((n) => n.live).length} ao vivo`;
  }

  /* ---------------- abas ---------------- */
  function showView(v) {
    $$(".tab").forEach((t) => t.classList.toggle("active", t.dataset.view === v));
    $$(".view").forEach((s) => s.classList.toggle("active", s.id === `view-${v}`));
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
      const d = coreDim(n), red = (n.theme || "red") === "red";
      const c1 = red ? "#e5162b" : "#00c8e0", c2 = red ? "#ff3348" : "#22eaff", bg = red ? "#2a0a0f" : "#04222a";
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
      if (e.type === "cx" || e.type === "data" || e.type === "gather") html += `<path class="edge halo ${e.type === "gather" ? "cyan" : ""}" d="${d}"/>`;
      html += `<path class="edge ${e.type} ${sel ? "sel" : ""}" d="${d}" id="p-${e.id}"/>`;
      html += `<path class="edge-hit" d="${d}"/>`;
      html += `</g>`;
    }
    // pacotes
    for (const e of state.edges) {
      const n = e.type === "cx" ? 3 : 2;
      for (let i = 0; i < n; i++) {
        html += `<circle class="packet ${e.type === "gather" ? "c" : e.type === "cx" || e.type === "data" ? "r" : ""}" r="${e.type === "cx" ? 4 : 3.5}" data-e="${e.id}" data-o="${i / n}"/>`;
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
          `<rect class="edge-label-bg ${e.type === "gather" ? "cyan" : ""}" x="${pt.x - w / 2}" y="${pt.y - 10}" width="${w}" height="20" rx="5"/>
           <text class="edge-label ${e.type === "gather" ? "cyan" : ""}" x="${pt.x}" y="${pt.y + 3.5}" text-anchor="middle">${e.label}</text>`);
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
      <div><i style="border-color:var(--red-2);border-top-style:dashed"></i>linha conexional (IA opera IA)</div>
    </div>`;
  }

  const LOGOS = { asafe: ["red", "assets/asafe-symbol-red.png"], gather: ["cyan", "assets/gather-symbol-cyan.png"] };
  function av(n, size = "") {
    const id = n?.id, logo = LOGOS[id];
    if (logo) return `<span class="avatar logo ${logo[0]} ${size}"><img src="${logo[1]}" alt="${n.name || nameOf(id)}" /></span>`;
    return `<span class="avatar ${size} ${avCls(n)}">${initial(n?.name || nameOf(id))}</span>`;
  }
  function avCls(n) { return n?.theme === "cyan" ? "cyan" : n?.kind === "main" || n?.id === "asafe" ? "red" : ""; }
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
    if (id === "gather") {
      inspector.innerHTML = `
        <div class="card-title">Gather <span class="tag cyan solid">Ativo</span></div>
        <div class="srv-head">${av({ id: "gather", name: "Gather" }, "lg")}<div class="t"><b>Gather</b><span>Gerencia e orquestra as próprias APIs</span></div></div>
        <div class="label-xs">Rota</div>
        <div class="route"><span class="chip red"><img class="chip-logo" src="assets/asafe-symbol-red.png" alt="" />Asafe</span>${icon("arrow", "xs muted")}<span class="chip cyan"><img class="chip-logo" src="assets/gather-symbol-cyan.png" alt="" />Gather</span></div>
        <dl class="kv">
          <dt>Servidor</dt><dd>gather.nathanael.ind ${icon("copy", "xs")}</dd>
          <dt>Status</dt><dd>conectado ao Asafe</dd>
        </dl>
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
          const label = { gather: "conectado", data: "envia dados", out: "recebe do Asafe", cx: e.from === id ? "opera dentro" : "é operada por" }[e.type];
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
    const desc = { gather: "Conexão entre o Asafe e o Gather.", data: "Dados fluindo para o núcleo do Asafe.", out: "O Asafe envia instruções e respostas para a IA." }[e.type];
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
    { id: "gather", name: "Gather", role: "Orquestra as próprias APIs", kind: "aux", theme: "cyan", cpu: 0, mem: 0, up: "agora", status: "Ao vivo" },
  ];
  const spark = (seed) => {
    let pts = "";
    for (let i = 0; i <= 24; i++) pts += `${i * 10},${seed === null ? 26 : 28 - Math.max(3, Math.min(25, 14 + Math.sin(i * 1.7 + seed) * 5))} `;
    return `<svg class="spark" viewBox="0 0 240 28" preserveAspectRatio="none"><polyline points="${pts}" fill="none" stroke="#ff3348" stroke-width="1.6"/><polyline points="0,28 ${pts} 240,28" fill="rgba(229,22,43,.10)" stroke="none"/></svg>`;
  };
  function renderServers() {
    $("#srv-kpis").innerHTML = [
      ["Servidores", servers.length, ""],
      ["Logins ativos", servers.filter((s) => s.status === "Ao vivo").length, ""],
      ["Requisições / min", "0", ""],
      ["Latência média", "—", ""],
    ].map(([l, v, d]) => `<div class="kpi glass"><div class="k-label">${l}</div><div class="k-val">${v}<small>${d}</small></div>${spark(null)}</div>`).join("");

    $("#srv-grid").innerHTML = servers.map((s) => `
      <div class="srv glass">
        <div class="srv-head">
          ${av(s, "lg")}
          <div class="t"><b>${s.name}</b><span>${s.role}</span></div>
          <span class="tag ${s.status !== "Ao vivo" ? "white" : s.theme === "cyan" ? "cyan" : ""}"><span class="dot ${s.status === "Ao vivo" ? "pulse" : "white"}" style="width:5px;height:5px"></span>${s.status}</span>
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
      <button class="srv glass" style="border-style:dashed;align-items:center;justify-content:center;min-height:250px;color:var(--muted)">
        <span class="avatar lg">${icon("plus")}</span><b style="color:var(--text)">Gerar novo servidor</b><span style="font-size:12px">Login para uma nova IA da Nathanael Industries</span>
      </button>`;
  }

  /* =========================================================
     DADOS
     ========================================================= */
  function renderUsage() {
    const rows = [{ name: "Asafe (núcleo)", id: "asafe" }, ...servers];
    $("#usage").innerHTML = rows.map((n) => `
      <div class="usage-row"><div class="u-top">${av(n, "sm")}<b>${n.name}</b><span>0 B</span></div>
      <div class="bar"><i style="width:0%"></i></div></div>`).join("") +
      `<div class="legend"><div><span class="dot"></span>0 B de 10 GB usados</div></div>`;
  }
  $("#collections").innerHTML = `
    <tr><th>Coleção</th><th>Dono</th><th>Registros</th><th>Tamanho</th><th>Atualizado</th></tr>
    <tr><td colspan="5"><div class="empty">Nenhuma coleção ainda.</div></td></tr>`;

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

  /* ---------------- inicialização ---------------- */
  renderNodes();
  renderEdges();
  renderInspector();
  renderServers();
  renderUsage();
  renderPerms();
  updateStats();
  requestAnimationFrame(fit);
  window.addEventListener("resize", () => $("#view-linhas").classList.contains("active") && fit());
})();
