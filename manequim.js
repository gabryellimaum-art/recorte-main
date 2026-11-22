// Frase do manequim: cada letra em uma cor das estrelas
(function () {
  var CORES = ["#1557FF"];

  document.querySelectorAll("[data-cores]").forEach(function (el) {
    var texto = el.textContent.trim();
    el.textContent = "";

    // texto normal só para leitores de tela
    var leitor = document.createElement("span");
    leitor.className = "so-leitor";
    leitor.textContent = texto;
    el.appendChild(leitor);

    var i = 0;
    texto.split("").forEach(function (ch) {
      if (ch === " ") {
        el.appendChild(document.createTextNode(" "));
        return;
      }
      var s = document.createElement("span");
      s.textContent = ch;
      s.setAttribute("aria-hidden", "true");
      s.style.color = CORES[i % CORES.length];
      i++;
      el.appendChild(s);
    });
  });
})();
// Navegação dos looks
(function () {
  var secao = document.getElementById("manequim");
  if (!secao) return;

  var base = "img/garimpar/manequim/4x/";
  var looks = [
    { img: "manequim-liso", cor: "#1557ff", alt: "Manequim de madeira" },
    { img: "manequim-arretado", cor: "#ff5a1f", nome: "ARRETADO", pagina: "arretado.html",
            texto: "Uma coleção sobre a <strong>Migração Nordestina</strong> na grande São Paulo" },
    { img: "manequim-faveleiras", cor: "#ff2e8a", nome: "FAVELEIRAS", pagina: "faveleiras.html",
            texto: "Uma coleção sobre <strong>as favelas dos anos 1960</strong> na grande São Paulo" },
    { img: "manequim-raizes-vivas", cor: "#7628ff", nome: "RAÍZES VIVAS", pagina: "raizes-vivas.html",
            texto: "Uma coleção sobre a <strong>ancestralidade indígena</strong> na grande São Paulo" }
  ];
  var i = 0;

  var dica = secao.querySelector(".manequim__dica");
  var colecao = secao.querySelector(".manequim__colecao");
  var nome = secao.querySelector(".manequim__nome");
  var texto = secao.querySelector(".manequim__texto");
  var link = document.getElementById("manequim-link");
  var boneco = link.querySelector("img");
  var esq = secao.querySelector(".manequim__vizinho--esq");
  var dir = secao.querySelector(".manequim__vizinho--dir");
  var setaEsq = secao.querySelector(".manequim__seta--esq");
  var setaDir = secao.querySelector(".manequim__seta--dir");

  function src(l) { return base + l.img + "@4x.png"; }

  function vizinho(el, l) {
    if (l) { el.src = src(l); el.hidden = false; } else { el.hidden = true; }
  }

  function mostrar() {
    var l = looks[i];
    boneco.src = src(l);
    boneco.alt = l.nome ? "Manequim vestido com a coleção " + l.nome : l.alt;
    secao.style.setProperty("--cor", l.cor);

    if (l.nome) {
      nome.textContent = l.nome;
            texto.innerHTML = l.texto;
      colecao.hidden = false;
      if (dica) dica.hidden = true;
      link.href = l.pagina;
      link.setAttribute("aria-label", "Conhecer a coleção " + l.nome);
    } else {
      colecao.hidden = true;
      if (dica) dica.hidden = false;
      link.removeAttribute("href");
      link.removeAttribute("aria-label");
    }

    vizinho(esq, looks[i - 1]);
    vizinho(dir, looks[i + 1]);
    setaEsq.hidden = i === 0;
    setaDir.hidden = i === looks.length - 1;
  }

  setaDir.addEventListener("click", function () { if (i < looks.length - 1) { i++; mostrar(); } });
  setaEsq.addEventListener("click", function () { if (i > 0) { i--; mostrar(); } });

  mostrar();
})();

// Pop-up "CLIQUE AQUI": flutua atrás do cursor, só sobre a silhueta do manequim vestido
(function () {
  var link = document.getElementById("manequim-link");
  if (!link) return;
  var boneco = link.querySelector("img");

  var LIMIAR = 40;      // 0–255: quanto maior, mais justo na silhueta
  var SEGUE = 0.12;     // 0–1: quanto menor, mais lento/flutuante
  var DESLOCA_Y = 26;   // distância abaixo do cursor (px)
  var reduzir = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var seg = reduzir ? 1 : SEGUE;

  var popup = document.createElement("img");
  // imagem muda com o modo (claro/escuro); acompanha a troca feita no menu Ajustes
  var POPUP_CLARO = "img/garimpar/manequim/4x/paraocursor@4x.png";
  var POPUP_ESCURO = "img/garimpar/manequim/4x/paraocursormodonoturno@4x.png";
  function imagemPopup() {
    popup.src = document.documentElement.getAttribute("data-tema") === "escuro" ? POPUP_ESCURO : POPUP_CLARO;
  }
  imagemPopup();
  new MutationObserver(imagemPopup).observe(document.documentElement, { attributes: true, attributeFilter: ["data-tema"] });
  popup.alt = "";
  popup.setAttribute("aria-hidden", "true");
  popup.className = "manequim__cursor";
  document.body.appendChild(popup);

  // ---- máscara de transparência (uma por imagem, em baixa resolução) ----
  var mascaras = {};
  function mascara() {
    if (!boneco.complete || !boneco.naturalWidth) return null; // ainda carregando
    var chave = boneco.src;
    if (mascaras[chave] !== undefined) return mascaras[chave];

    var m;
    try {
      var nw = boneco.naturalWidth, nh = boneco.naturalHeight;
      var k = 256 / Math.max(nw, nh);
      var w = Math.max(1, Math.round(nw * k));
      var h = Math.max(1, Math.round(nh * k));
      var c = document.createElement("canvas");
      c.width = w; c.height = h;
      var ctx = c.getContext("2d", { willReadFrequently: true });
      ctx.drawImage(boneco, 0, 0, w, h);
      m = { w: w, h: h, d: ctx.getImageData(0, 0, w, h).data };
    } catch (err) {
      m = false; // canvas bloqueado (ex.: abrindo o site via file://)
    }
    mascaras[chave] = m;
    return m;
  }

  function sobreRoupa(e) {
    var m = mascara();
    if (m === null) return false;  // imagem carregando
    if (m === false) return true;  // sem máscara: usa a caixa inteira
    var r = boneco.getBoundingClientRect();
    var x = Math.floor((e.clientX - r.left) / r.width * m.w);
    var y = Math.floor((e.clientY - r.top) / r.height * m.h);
    if (x < 0 || y < 0 || x >= m.w || y >= m.h) return false;
    return m.d[(y * m.w + x) * 4 + 3] > LIMIAR;
  }

  // ---- movimento flutuante ----
  var alvoX = 0, alvoY = 0, x = 0, y = 0, visivel = false, raf = 0;

  function posicionar(t) {
    var inclina = Math.max(-10, Math.min(10, (alvoX - x) * 0.25));
    var flutua = reduzir ? 0 : Math.sin(t / 350) * 3;
    popup.style.translate = "calc(" + x + "px - 50%) " + (y + DESLOCA_Y + flutua) + "px";
    popup.style.rotate = inclina + "deg";
  }

  function quadro(t) {
    x += (alvoX - x) * seg;
    y += (alvoY - y) * seg;
    posicionar(t);
    raf = requestAnimationFrame(quadro);
  }

  function mostrar(e) {
    alvoX = e.clientX;
    alvoY = e.clientY;
    if (visivel) return;
    visivel = true;
    x = alvoX; y = alvoY;              // nasce já no cursor
    posicionar(performance.now());
    popup.classList.add("manequim__cursor--visivel");
    raf = requestAnimationFrame(quadro);
  }

  function esconder() {
    if (!visivel) return;
    visivel = false;
    cancelAnimationFrame(raf);
    popup.classList.remove("manequim__cursor--visivel");
  }

  function mover(e) {
    if (e.pointerType === "touch") return;
    if (!link.hasAttribute("href") || !sobreRoupa(e)) { esconder(); return; }
    mostrar(e);
  }

  link.addEventListener("pointermove", mover);
  link.addEventListener("pointerleave", esconder);
  link.addEventListener("click", esconder);
})();