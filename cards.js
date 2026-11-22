/* cards.js: popup de boas-vindas com os 3 cards que viram.
   - Na página com <body data-cards-auto> ele abre sozinho (uma vez por visita).
   - A tesoura da barra de cima abre de novo, em qualquer página que carregue este arquivo. */
(function () {
  var SCRIPT = document.currentScript ? document.currentScript.src : "";
  var PASTA = "img/instrucoes/";             /* imagens dos cards e do botão Garimpar */
  var MOLDURA = "img/1x/molduracards.png";   /* moldura do popup */
  var BOTAO = "img/1x/botaopopupcards.png";  /* botão Garimpar */
  var CAPA = "index.html";                   /* a tesoura volta para a capa com a animação */
  var ABRIR_UMA_VEZ_POR_VISITA = true;       /* false = abre toda vez que a home carregar */

  /* ---------- textos dos cards (edite aqui) ---------- */
  var CARDS = [
    {
      id: "garimpar",
      frente: { titulo: "1. Garimpar",
        texto: "Navegue pelas coleções, explore as peças e descubra um novo mundo escondido em cada conjunto." },
      verso: { titulo: "Garimpar",
        html: "<p>Na primeira fase, você navegará por três coleções: <b>ARRETADO, FAVELEIRAS</b> e <b>RAÍZES VIVAS</b>, " +
              "cada uma contando uma história. O que acha de encontrar aquela que conta um pouco sobre <b>suas origens</b>? " +
              "Clique nas coleções e comece a explorar!</p>" }
    },
    {
      id: "conhecer",
      frente: { titulo: "2. Conhecer",
        texto: "Leia as histórias e encontre as peças escondidas. Investigue o legado que também vive em você!" },
      verso: { titulo: "Conhecer",
        html: "<p>Nesta segunda etapa, você conhecerá mais de perto o que inspirou o projeto:<br><b>a periferia.</b></p>" +
              "<p>Entenda as histórias para desbloquear conteúdos e reflita sobre narrativas que, mesmo transformadas " +
              "pelo tempo, guardam sua essência.</p>" }
    },
    {
      id: "criar",
      frente: { titulo: "3. Criar",
        texto: "Vista o manequim com as peças que você garimpou e conheceu. Monte um look com seu estilo!" },
      verso: { titulo: "Criar",
        html: "<p>Por fim, você poderá customizar o seu próprio manequim com todas as peças que você adquiriu ao longo " +
              "da jornada. É o seu momento de criar, use e misture com liberdade todas as vestimentas.</p>" }
    }
  ];

  function htmlCard(c) {
    return '<article class="cp-card cp-card--' + c.id + '" tabindex="0"><div class="cp-giro">' +
      '<div class="cp-face cp-frente">' +
        '<img class="cp-moldura" src="' + PASTA + "card-" + c.id + '@4x.png" alt="">' +
        '<img class="cp-ilustracao" src="' + PASTA + "4x/ilustracao-" + c.id + '@4x.png" alt="">' +
        '<div class="cp-frente__texto"><h3>' + c.frente.titulo + '</h3>' +
          '<div class="cp-frente__p"><p>' + c.frente.texto + "</p></div></div>" +
      "</div>" +
      '<div class="cp-face cp-verso">' +
        '<img class="cp-moldura" src="' + PASTA + "verso-" + c.id + '@4x.png" alt="">' +
        '<div class="cp-verso__texto"><h3>' + c.verso.titulo + '</h3>' +
          '<div class="cp-verso__p">' + c.verso.html + "</div></div>" +
      "</div></div></article>";
  }

  var pop = null, anterior = null;

  function criar() {
    pop = document.createElement("div");
    pop.className = "cards-pop";
    pop.setAttribute("role", "dialog");
    pop.setAttribute("aria-modal", "true");
    pop.setAttribute("aria-labelledby", "cp-titulo");
    pop.innerHTML =
      '<div class="cards-pop__caixa">' +
        '<img class="cards-pop__moldura" src="' + MOLDURA + '" alt="">' +
        '<div class="cards-pop__conteudo">' +
          '<h2 class="cp-titulo" id="cp-titulo">Passe o mouse pelos cards<br>para conhecer cada RECORTE</h2>' +
          '<div class="cp-cards">' + CARDS.map(htmlCard).join("") + "</div>" +
          '<div class="cp-rodape">' +
            "<p>Surgiu alguma dúvida durante a página?<br>Clique em <span class=\"cp-pill\">? Ajuda</span> para ver dicas de como navegar.</p>" +
            '<button type="button" class="cp-botao" data-fechar><img src="' + BOTAO + '" alt=""><span class="cp-botao__txt">Garimpar</span></button>' +
          "</div>" +
        "</div>" +
      "</div>";
    document.body.appendChild(pop);

    /* o giro por hover só liga depois que o mouse se mexer de verdade */
    pop.addEventListener("mousemove", function () { pop.classList.add("pronto"); }, { once: true });

    pop.addEventListener("click", function (e) {
      if (e.target === pop || e.target.closest("[data-fechar]")) { fechar(); return; }
      /* toque no celular: um toque vira o card, outro desvira */
      var card = e.target.closest(".cp-card");
      if (card && window.matchMedia("(hover: none)").matches) card.classList.toggle("virado");
    });

    pop.querySelector(".cards-pop__moldura").addEventListener("load", ajustar);
    window.addEventListener("resize", ajustar);
  }

  /* se o popup ficar mais alto que a tela, encolhe um pouco para caber */
  function ajustar() {
    if (!pop) return;
    var caixa = pop.querySelector(".cards-pop__caixa");
    caixa.style.scale = "";
    var h = caixa.offsetHeight, disp = window.innerHeight * 0.94;
    if (h > disp) caixa.style.scale = String(disp / h);
  }

  function abrir() {
    if (!pop) criar();
    anterior = document.activeElement;
    pop.classList.add("is-aberto");
    document.body.style.overflow = "hidden";
    ajustar();
    try { sessionStorage.setItem("recorte-cards", "1"); } catch (e) {}
    var b = pop.querySelector("[data-fechar]");
    if (b) b.focus({ preventScroll: true });
  }

  function fechar() {
    if (!pop) return;
    pop.classList.remove("is-aberto");
    document.body.style.overflow = "";
    if (anterior && anterior.focus) anterior.focus({ preventScroll: true });
  }

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") fechar();
  });

  /* a tesoura volta para a capa; ao chegar na home de novo, o popup reabre */
  function irParaCapa() {
    try { sessionStorage.removeItem("recorte-cards"); } catch (e) {}
    var destino = CAPA;
    try { if (SCRIPT) destino = new URL(CAPA, SCRIPT).href; } catch (e) {}
    console.log("tesoura: indo para", destino);
    /* o site roda dentro de um iframe da capa: a janela de cima é que precisa recarregar */
    try { window.top.location.href = destino; return; } catch (e) {}
    window.location.href = destino;
  }

  /* a tesoura da barra de cima vira botão (vale mesmo se a barra for recriada) */
  function ligarTesoura() {
    var t = document.querySelector(".cabecalho__tesoura");
    if (!t || t.getAttribute("role") === "button") return;
    t.removeAttribute("aria-hidden");
    t.setAttribute("role", "button");
    t.setAttribute("tabindex", "0");
    t.setAttribute("aria-label", "Voltar para a capa");
  }
  document.addEventListener("click", function (e) {
    if (e.target.closest && e.target.closest(".cabecalho__tesoura")) { e.preventDefault(); irParaCapa(); }
  }, true);
  document.addEventListener("keydown", function (e) {
    if ((e.key === "Enter" || e.key === " ") && e.target.closest && e.target.closest(".cabecalho__tesoura")) {
      e.preventDefault(); irParaCapa();
    }
  });
  new MutationObserver(ligarTesoura).observe(document.documentElement, { childList: true, subtree: true });

  /* deixa o botão Voltar da barra reabrir o popup */
  window.abrirCards = abrir;
  
  function iniciar() {
    ligarTesoura();
    if (document.body.hasAttribute("data-cards-auto")) {
      /* abre só quando a pessoa chega da capa (index.html); voltar do guarda-roupa etc. não abre */
      var ref = document.referrer || "";
      var veioDaCapa = /(^|\/)(index\.html)?(\?.*)?(#.*)?$/.test(ref) && ref !== "";
      if (!ref) {   /* sem referência (ex.: arquivo aberto direto): usa o aviso da sessão */
        var visto = false;
        try { visto = sessionStorage.getItem("recorte-cards") === "1"; } catch (e) {}
        veioDaCapa = !visto;
      }
      if (veioDaCapa) abrir();
    }
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", iniciar);
  else iniciar();
  window.addEventListener("load", ligarTesoura);
})();