/* =========================================================
   ASAFE · Wallpaper "colmeia de circuitos"
   O Asafe é a infraestrutura que sustenta tudo; o símbolo dele é um hexágono.
   O fundo é uma colmeia hexagonal por onde a energia corre como num circuito:
   pulsos andam pelas arestas, células acendem quando um pulso chega, e a região
   em volta do cursor se revela mais nítida.
   Ele também reage à eletronanologia: normal (vivo, vermelho), bateria (menos
   pulsos), aviso (laranja), crítico (batimento lento) e desligado (quase apagado).
   API: window.AsafeFundo.nivel("normal" | "bateria" | "aviso" | "critico" | "desligado")
   ========================================================= */
(() => {
  "use strict";
  const canvas = document.getElementById("fundo");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const reduzir = matchMedia("(prefers-reduced-motion: reduce)").matches;

  const R = 30;                       // raio do hexágono (vértice ao centro)
  const W_HEX = R * 2, H_HEX = Math.sqrt(3) * R;
  const NIVEIS = {
    normal:    { pulsos: 28, cor: [255, 51, 72],  vel: 1,    grade: 1,    batida: 0 },
    bateria:   { pulsos: 14, cor: [255, 51, 72],  vel: 0.7,  grade: 0.85, batida: 0 },
    aviso:     { pulsos: 9,  cor: [249, 115, 22], vel: 0.55, grade: 0.75, batida: 0 },
    critico:   { pulsos: 4,  cor: [255, 40, 60],  vel: 0.4,  grade: 0.6,  batida: 1 },
    desligado: { pulsos: 0,  cor: [120, 120, 130], vel: 0.3, grade: 0.35, batida: 0 },
  };
  let nivel = NIVEIS.normal, alvoGrade = 1, grade = 1;

  let dpr = 1, largura = 0, altura = 0;
  let vertices = [], vizinhos = [], celulas = [];
  let camadaBase = null, camadaViva = null;      // grade apagada e grade nítida (revelada pelo cursor)
  const pulsos = [], flashes = [];
  const lente = document.createElement("canvas"), lg = lente.getContext("2d");
  const mouse = { x: -9999, y: -9999, ax: -9999, ay: -9999, ativo: false };

  /* ---------- geometria da colmeia ---------- */
  function montar() {
    dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    largura = innerWidth; altura = innerHeight;
    canvas.width = Math.round(largura * dpr); canvas.height = Math.round(altura * dpr);
    canvas.style.width = largura + "px"; canvas.style.height = altura + "px";

    const mapa = new Map();
    vertices = []; vizinhos = []; celulas = [];
    const idx = (x, y) => {
      const k = Math.round(x) + "," + Math.round(y);
      let i = mapa.get(k);
      if (i === undefined) { i = vertices.length; mapa.set(k, i); vertices.push([x, y]); vizinhos.push([]); }
      return i;
    };
    const liga = (a, b) => { if (!vizinhos[a].includes(b)) { vizinhos[a].push(b); vizinhos[b].push(a); } };

    const colunas = Math.ceil(largura / (W_HEX * 0.75)) + 2;
    const linhas = Math.ceil(altura / H_HEX) + 2;
    for (let c = -1; c < colunas; c++) {
      for (let l = -1; l < linhas; l++) {
        const cx = c * W_HEX * 0.75, cy = l * H_HEX + (c % 2 ? H_HEX / 2 : 0);
        const vs = [];
        for (let k = 0; k < 6; k++) {
          const a = (Math.PI / 3) * k;
          vs.push(idx(cx + R * Math.cos(a), cy + R * Math.sin(a)));
        }
        for (let k = 0; k < 6; k++) liga(vs[k], vs[(k + 1) % 6]);
        celulas.push({ cx, cy, vs, aceso: Math.random() < 0.05 });
      }
    }
    desenharCamadas();
    pulsos.length = 0;
    ajustarPulsos();
    if (reduzir) quadro(performance.now());
  }

  function caminhoHex(g, cel) {
    g.beginPath();
    cel.vs.forEach((v, k) => { const [x, y] = vertices[v]; k ? g.lineTo(x, y) : g.moveTo(x, y); });
    g.closePath();
  }

  function desenharCamadas() {
    const nova = () => { const c = document.createElement("canvas"); c.width = canvas.width; c.height = canvas.height; const g = c.getContext("2d"); g.scale(dpr, dpr); return [c, g]; };
    let g;
    [camadaBase, g] = nova();
    // células "ocupadas" (servidores), bem discretas
    for (const cel of celulas) if (cel.aceso) { caminhoHex(g, cel); g.fillStyle = "rgba(229, 22, 43, 0.035)"; g.fill(); }
    g.lineWidth = 1; g.strokeStyle = "rgba(255, 255, 255, 0.045)";
    for (const cel of celulas) { caminhoHex(g, cel); g.stroke(); }
    // nós do circuito
    g.fillStyle = "rgba(255, 70, 90, 0.22)";
    vertices.forEach(([x, y], i) => { if (i % 11 === 0) { g.beginPath(); g.arc(x, y, 1.3, 0, Math.PI * 2); g.fill(); } });

    [camadaViva, g] = nova();
    g.lineWidth = 1.2; g.strokeStyle = "rgba(255, 60, 80, 0.55)";
    for (const cel of celulas) { caminhoHex(g, cel); g.stroke(); }
    g.fillStyle = "rgba(255, 255, 255, 0.7)";
    vertices.forEach(([x, y], i) => { if (i % 5 === 0) { g.beginPath(); g.arc(x, y, 1.4, 0, Math.PI * 2); g.fill(); } });
  }

  /* ---------- pulsos de energia ---------- */
  function novoPulso() {
    const a = (Math.random() * vertices.length) | 0;
    const b = vizinhos[a][(Math.random() * vizinhos[a].length) | 0];
    return { a, b, ant: -1, t: Math.random(), vel: (70 + Math.random() * 80), rastro: [], branco: Math.random() < 0.14 };
  }
  function ajustarPulsos() {
    while (pulsos.length < nivel.pulsos) pulsos.push(novoPulso());
    while (pulsos.length > nivel.pulsos) pulsos.pop();
  }
  function avancarPulso(p, dt) {
    p.t += (p.vel * nivel.vel * dt) / R;
    while (p.t >= 1) {
      p.t -= 1;
      const viz = vizinhos[p.b].filter((v) => v !== p.a);
      const prox = viz.length ? viz[(Math.random() * viz.length) | 0] : p.a;
      // ao chegar num nó, às vezes acende a célula ao redor
      if (Math.random() < 0.06) {
        const cel = celulas.find((c) => c.vs.includes(p.b));
        if (cel) flashes.push({ cel, vida: 1 });
      }
      p.a = p.b; p.b = prox;
    }
    const [x1, y1] = vertices[p.a], [x2, y2] = vertices[p.b];
    const x = x1 + (x2 - x1) * p.t, y = y1 + (y2 - y1) * p.t;
    p.rastro.push([x, y]);
    if (p.rastro.length > 16) p.rastro.shift();
    return [x, y];
  }

  /* ---------- quadro ---------- */
  let ultimo = performance.now(), rodando = true;
  function quadro(agora) {
    const dt = Math.min(0.05, (agora - ultimo) / 1000);
    ultimo = agora;
    grade += (alvoGrade - grade) * Math.min(1, dt * 2);

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.globalAlpha = grade;
    ctx.drawImage(camadaBase, 0, 0);
    ctx.globalAlpha = 1;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const [r, g, b] = nivel.cor;

    // batimento do nível crítico: a colmeia inteira pulsa devagar
    if (nivel.batida) {
      const bat = Math.pow(Math.max(0, Math.sin(agora / 520)), 6);
      ctx.globalAlpha = 0.35 * bat;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.drawImage(camadaViva, 0, 0);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.globalAlpha = 1;
    }

    // células acesas por pulsos
    for (let i = flashes.length - 1; i >= 0; i--) {
      const f = flashes[i];
      f.vida -= dt * 1.4;
      if (f.vida <= 0) { flashes.splice(i, 1); continue; }
      caminhoHex(ctx, f.cel);
      ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${0.10 * f.vida})`;
      ctx.fill();
      ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${0.55 * f.vida})`;
      ctx.lineWidth = 1.2;
      ctx.stroke();
    }

    // pulsos com rastro
    ctx.lineCap = "round";
    for (const p of pulsos) {
      const [x, y] = reduzir ? (p.rastro.at(-1) || vertices[p.a]) : avancarPulso(p, dt);
      const cor = p.branco ? [255, 255, 255] : nivel.cor;
      for (let k = 1; k < p.rastro.length; k++) {
        const [ax, ay] = p.rastro[k - 1], [bx, by] = p.rastro[k];
        if (Math.abs(ax - bx) > R || Math.abs(ay - by) > R) continue;
        ctx.strokeStyle = `rgba(${cor[0]}, ${cor[1]}, ${cor[2]}, ${(k / p.rastro.length) * 0.75})`;
        ctx.lineWidth = 1.6;
        ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(bx, by); ctx.stroke();
      }
      ctx.fillStyle = `rgba(${cor[0]}, ${cor[1]}, ${cor[2]}, 0.16)`;
      ctx.beginPath(); ctx.arc(x, y, 5, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = `rgba(${cor[0]}, ${cor[1]}, ${cor[2]}, 1)`;
      ctx.beginPath(); ctx.arc(x, y, 1.7, 0, Math.PI * 2); ctx.fill();
    }

    // cursor: revela a colmeia nítida num círculo suave (com mola, não colado ao mouse)
    mouse.ax += (mouse.x - mouse.ax) * Math.min(1, dt * 9);
    mouse.ay += (mouse.y - mouse.ay) * Math.min(1, dt * 9);
    if (mouse.ativo && grade > 0.4) {
      // lente: recorta a colmeia nítida em volta do cursor e some suavemente nas bordas
      const raio = 190, lado = Math.ceil(raio * 2 * dpr);
      if (lente.width !== lado) { lente.width = lado; lente.height = lado; }
      const sx = Math.round((mouse.ax - raio) * dpr), sy = Math.round((mouse.ay - raio) * dpr);
      lg.globalCompositeOperation = "copy";
      lg.drawImage(camadaViva, sx, sy, lado, lado, 0, 0, lado, lado);
      lg.globalCompositeOperation = "destination-in";
      const grad = lg.createRadialGradient(lado / 2, lado / 2, 0, lado / 2, lado / 2, lado / 2);
      grad.addColorStop(0, "rgba(0,0,0,1)");
      grad.addColorStop(0.55, "rgba(0,0,0,0.45)");
      grad.addColorStop(1, "rgba(0,0,0,0)");
      lg.fillStyle = grad;
      lg.fillRect(0, 0, lado, lado);
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.globalAlpha = 0.6 * grade;
      ctx.drawImage(lente, sx, sy);
      ctx.globalAlpha = 1;
    }

    if (rodando && !reduzir) requestAnimationFrame(quadro);
  }

  /* ---------- eventos ---------- */
  addEventListener("pointermove", (e) => {
    if (e.pointerType !== "mouse") return;
    mouse.x = e.clientX; mouse.y = e.clientY;
    if (!mouse.ativo) { mouse.ax = mouse.x; mouse.ay = mouse.y; mouse.ativo = true; }
  }, { passive: true });
  document.addEventListener("pointerleave", () => { mouse.ativo = false; });
  let espera;
  addEventListener("resize", () => { clearTimeout(espera); espera = setTimeout(montar, 150); });
  document.addEventListener("visibilitychange", () => {
    rodando = !document.hidden;
    if (rodando && !reduzir) { ultimo = performance.now(); requestAnimationFrame(quadro); }
  });

  window.AsafeFundo = {
    nivel(n) {
      const novo = NIVEIS[n] || NIVEIS.normal;
      if (novo === nivel) return;
      nivel = novo; alvoGrade = novo.grade;
      ajustarPulsos();
      document.documentElement.dataset.energia = n;
      if (reduzir) quadro(performance.now());
    },
  };

  montar();
  if (!reduzir) requestAnimationFrame(quadro);
})();
