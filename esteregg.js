/* esteregg.js: peças de quebra-cabeça escondidas nas páginas de coleção */
(function () {
  /* formato da peça em pixels (grade 12 x 12) */
  var CONTORNO = "M2,2 L5,2 L5,1 L4,1 L4,0 L8,0 L8,1 L7,1 L7,2 L10,2 L10,5 L11,5 L11,4 L12,4 " +
    "L12,8 L11,8 L11,7 L10,7 L10,10 L7,10 L7,9 L8,9 L8,8 L4,8 L4,9 L5,9 L5,10 L2,10 L2,7 " +
    "L3,7 L3,5 L2,5 Z";

  var FURO = '<svg class="esteregg__furo" viewBox="1 -1 12 12" shape-rendering="crispEdges" aria-hidden="true">' +
    '<path d="' + CONTORNO + '"/></svg>';

  var POSICIONAR = /[?&]posicionar/.test(location.search);

  /* a peça é um pedaço da foto recortado no formato do quebra-cabeça */
  function montarPeca(b, indice) {
    var idClip = "eg-clip-" + indice;
    b.innerHTML = FURO +
      '<svg class="esteregg__peca" viewBox="1 -1 12 12" aria-hidden="true">' +
        '<defs><clipPath id="' + idClip + '"><path d="' + CONTORNO + '"/></clipPath></defs>' +
                '<path d="' + CONTORNO + '" fill="#f6f4f8"/>' +
        '<image class="esteregg__foto" clip-path="url(#' + idClip + ')" preserveAspectRatio="none" width="0" height="0"/>' +
        '<path class="esteregg__contorno" shape-rendering="crispEdges" d="' + CONTORNO + '"/>' +
      "</svg>";
  }

  /* ---------- acha a foto e calcula onde ela aparece na tela ---------- */
  function maiorImagem(pai) {
    var melhor = null, area = 0;
    pai.querySelectorAll("img").forEach(function (im) {
      var a = (im.naturalWidth || 0) * (im.naturalHeight || 0);
      if (a > area) { area = a; melhor = im; }
    });
    return melhor;
  }

  function geometriaDaFoto(img) {
    var r = img.getBoundingClientRect();
    var cs = getComputedStyle(img);
    var nw = img.naturalWidth, nh = img.naturalHeight;
    var w = r.width, h = r.height;
    var fit = cs.objectFit;
    if (fit === "cover" || fit === "contain" || fit === "scale-down" || fit === "none") {
      var e = fit === "cover" ? Math.max(r.width / nw, r.height / nh)
            : fit === "none" ? 1
            : fit === "contain" ? Math.min(r.width / nw, r.height / nh)
            : Math.min(1, r.width / nw, r.height / nh);
      w = nw * e;
      h = nh * e;
    }
    var pos = (cs.objectPosition || "50% 50%").split(" ");
    function eixo(v, livre) { return v.indexOf("%") > -1 ? parseFloat(v) / 100 * livre : (parseFloat(v) || 0); }
    return {
      left: r.left + eixo(pos[0], r.width - w),
      top: r.top + eixo(pos[1] || "50%", r.height - h),
      width: w,
      height: h
    };
  }
  /* botões com data-na-foto: posição (data-x, data-y, em % da foto) vale para o centro da peça */
  function posicionarNaFoto(b) {
    if (!b.hasAttribute("data-na-foto")) return;
    var foto = b._foto;
    if (!foto || !foto.naturalWidth) return;
    var pai = b.offsetParent || b.parentElement;
    var r = pai.getBoundingClientRect();
    var g = geometriaDaFoto(foto);
    var x = parseFloat(b.getAttribute("data-x")) || 0;
    var y = parseFloat(b.getAttribute("data-y")) || 0;
    b.style.left = (g.left - r.left - pai.clientLeft + x / 100 * g.width - b.offsetWidth / 2) + "px";
    b.style.top = (g.top - r.top - pai.clientTop + y / 100 * g.height - b.offsetHeight / 2) + "px";
  }
  /* encaixa o desenho da foto dentro da peça, alinhado com a foto de verdade */
  function ajustarFoto(b) {
    if (!b._foto) b._foto = maiorImagem(b.parentElement);
    var foto = b._foto;
    b.classList.toggle("esteregg--sem-foto", !foto);   /* sem foto no bloco: a peça usa a cor da coleção */
        posicionarNaFoto(b);
    var im = b.querySelector(".esteregg__foto");
    if (!foto || !im || !foto.naturalWidth) return;
    var caixa = b.getBoundingClientRect();
    if (!caixa.width) return;
    var g = geometriaDaFoto(foto);
    if (!g.width) return;
    var k = 12 / caixa.width;                      /* unidades do desenho por pixel da tela */
    im.setAttribute("href", foto.currentSrc || foto.src);
    im.setAttribute("x", 1 + (g.left - caixa.left) * k);
    im.setAttribute("y", -1 + (g.top - caixa.top) * k);
    im.setAttribute("width", g.width * k);
    im.setAttribute("height", g.height * k);
    var f = getComputedStyle(foto).filter;         /* se a foto tem filtro, a peça copia */
    im.style.filter = f === "none" ? "" : f;
  }

  /* para testar: abra a página com ?reiniciar no fim do endereço para zerar o jogo */
  if (window.Recorte && /[?&]reiniciar/.test(location.search)) Recorte.reiniciar();

  /* ---------- popup ---------- */
  var popup = null;

  function criarPopup() {
    popup = document.createElement("div");
    popup.className = "eg-popup";
    popup.innerHTML =
      '<div class="eg-popup__caixa" role="dialog" aria-modal="true" aria-labelledby="eg-titulo">' +
        '<img class="eg-popup__moldura" src="img/guarda-roupa/4x/popupachado@4x.png" alt="">' +
        '<div class="eg-popup__conteudo">' +
          '<p class="eg-popup__aviso" id="eg-titulo">QUE ACHADO!</p>' +
          '<p class="eg-popup__achou">Você encontrou <strong class="eg-popup__nome" id="eg-nome"></strong></p>' +
          '<img class="eg-popup__img" alt="">' +
          '<p class="eg-popup__texto">A peça foi salva no seu guarda-roupa.</p>' +
        "</div>" +
        '<button type="button" class="eg-popup__x" data-fechar aria-label="Fechar"></button>' +
      "</div>";
    document.body.appendChild(popup);
    popup.addEventListener("click", function (e) {
      if (e.target === popup || e.target.hasAttribute("data-fechar")) fecharPopup();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") fecharPopup();
    });
  }

  function abrirPopup(id) {
    if (!popup) criarPopup();
    var p = Recorte.achar(id);
    popup.querySelector(".eg-popup__img").src = p ? (p.popup || p.frente) : "";
        popup.querySelector(".eg-popup__img").setAttribute("data-peca", id);
    popup.querySelector(".eg-popup__nome").textContent = p ? p.nome : "Nova peça";
    popup.classList.add("is-aberto");
  }

  function fecharPopup() {
    if (popup) popup.classList.remove("is-aberto");
  }

  /* ---------- modo ?posicionar: arraste as peças e copie os valores ---------- */
  function modoPosicionar(botoes) {
    var painel = document.createElement("pre");
    painel.style.cssText = "position:fixed;left:1vw;bottom:1vw;z-index:10000;margin:0;padding:.8vw 1vw;" +
      "background:#111;color:#c8f000;font:600 .85vw/1.5 monospace;max-width:40vw;white-space:pre-wrap";
    document.body.appendChild(painel);

    function atualizar() {
      painel.textContent = "ARRASTE AS PEÇAS\n" + botoes.map(function (b) {
        return b.getAttribute("data-peca") + "  →  --x: " + (b.style.getPropertyValue("--x") || "?") +
          "; --y: " + (b.style.getPropertyValue("--y") || "?") + ";";
      }).join("\n");
    }
    atualizar();

    botoes.forEach(function (b) {
      b.style.touchAction = "none";
      b.addEventListener("pointerdown", function (e) {
        e.preventDefault();
        b.setPointerCapture(e.pointerId);
        var pai = b.offsetParent || b.parentElement;
        function mover(ev) {
          var r = pai.getBoundingClientRect();
          var x = (ev.clientX - r.left - b.offsetWidth / 2) / r.width * 100;
                   var y = ev.clientY - r.top - b.offsetHeight / 2;
          b.style.setProperty("--x", x.toFixed(1) + "%");
          b.style.setProperty("--y", r.height < 20 ? (y / innerWidth * 100).toFixed(1) + "vw" : (y / r.height * 100).toFixed(1) + "%");
          atualizar();
        }
        function soltar() {
          b.removeEventListener("pointermove", mover);
          b.removeEventListener("pointerup", soltar);
        }
        b.addEventListener("pointermove", mover);
        b.addEventListener("pointerup", soltar);
      });
    });
  }

  /* ---------- peças escondidas ---------- */
  function iniciar() {
    if (!window.Recorte) return;
    var botoes = Array.prototype.slice.call(document.querySelectorAll(".esteregg"));

    botoes.forEach(function (b, indice) {
      var id = b.getAttribute("data-peca");
      montarPeca(b, indice);
      b.setAttribute("aria-label", "Peça de quebra-cabeça escondida. Clique para pegar.");

      if (!POSICIONAR && Recorte.estaDesbloqueada(id)) {   /* já pegou: a foto fica completa */
        b.classList.add("is-pego");
        b.disabled = true;
        return;
      }

      b.addEventListener("click", function () {
        if (POSICIONAR) return;
        if (b.classList.contains("is-encaixando")) return;
        ajustarFoto(b);
        b.classList.add("is-encaixando");          /* anima a peça indo para o buraco */
        setTimeout(function () {
          Recorte.desbloquear(id);
          b.classList.add("is-pego");
          b.disabled = true;
          abrirPopup(id);
        }, 650);
      });
    });

    if (POSICIONAR) modoPosicionar(botoes);

    /* mantém a foto da peça alinhada (troca de slide, tamanho da janela, imagem carregando) */
    function ajustarTodas() { botoes.forEach(ajustarFoto); }
    window.addEventListener("resize", ajustarTodas);
    window.addEventListener("load", ajustarTodas);
    setInterval(ajustarTodas, 500);
    ajustarTodas();
  }

  iniciar();
})();