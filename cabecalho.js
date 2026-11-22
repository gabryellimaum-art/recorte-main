// Barra de navegação fixa: 3 botões, tesoura no meio, 3 botões
(function () {
  var PASTA = "img/garimpar/nav/4x/";

  var ESQUERDA = [
    { rotulo: "Início", icone: "inicio", href: "garimpar.html" },
    { rotulo: "Coleções", icone: "colecoes", menu: true },
    { rotulo: "Guarda-roupa", icone: "guarda-roupa", href: "guarda-roupa.html" }
  ];
  var DIREITA = [
    { rotulo: "Sobre", icone: "sobre", href: "sobre.html" },
    { rotulo: "Ajuda", icone: "ajuda", href: "ajuda.html" },
    { rotulo: "Ajustes", icone: "ajustes", ajustes: true }
  ];
  var COLECOES = [
    { rotulo: "Arretado", id: "arretado", href: "arretado.html" },
    { rotulo: "Faveleiras", id: "faveleiras", href: "faveleiras.html" },
    { rotulo: "Raízes vivas", id: "raizes", href: "raizes-vivas.html" }
  ];

  var arquivo = location.pathname.split("/").pop() || "index.html";

  function el(tag, classe, attrs) {
    var e = document.createElement(tag);
    if (classe) e.className = classe;
    if (attrs) Object.keys(attrs).forEach(function (k) { e.setAttribute(k, attrs[k]); });
    return e;
  }

  function montarMenu(caixa, botao) {
    var lista = el("ul", "cabecalho__menu", { id: "menu-colecoes", hidden: "" });
    COLECOES.forEach(function (c) {
      var li = el("li");
      var a = el("a", "", { href: c.href, "data-colecao": c.id });
      a.textContent = c.rotulo;
      li.appendChild(a);
      lista.appendChild(li);
    });
    caixa.appendChild(lista);

    botao.setAttribute("aria-haspopup", "true");
    botao.setAttribute("aria-expanded", "false");
    botao.setAttribute("aria-controls", "menu-colecoes");

    function abrir() { lista.hidden = false; botao.setAttribute("aria-expanded", "true"); }
    function fechar() { lista.hidden = true; botao.setAttribute("aria-expanded", "false"); }

    botao.addEventListener("click", function () {
      if (lista.hidden) abrir(); else fechar();
    });
    document.addEventListener("click", function (e) {
      if (!caixa.contains(e.target)) fechar();
    }, true);
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && !lista.hidden) { fechar(); botao.focus(); }
    });

    if (COLECOES.some(function (c) { return c.href === arquivo; })) {
      botao.setAttribute("aria-current", "page");
    }
  }

  function criarItem(item) {
    var caixa = el("div", "cabecalho__item");
    var botao;
    if (item.href) {
      botao = el("a", "cab-botao", { href: item.href });
      if (item.href === arquivo) botao.setAttribute("aria-current", "page");
    } else {
      botao = el("button", "cab-botao", { type: "button" });
    }
    if (item.ajustes) botao.setAttribute("data-acess-abrir", "");

    var img = el("img", "cab-icone", {
      src: PASTA + "icone-" + item.icone + "@4x.png",
      alt: "",
      "aria-hidden": "true"
    });
    var texto = el("span");
    texto.textContent = item.rotulo;
    botao.appendChild(img);
    botao.appendChild(texto);
    caixa.appendChild(botao);

    if (item.menu) montarMenu(caixa, botao);
    return caixa;
  }

  var cabecalho = el("header", "cabecalho");
  var nav = el("nav", "cabecalho__nav", { "aria-label": "Principal" });

  var esq = el("div", "cabecalho__grupo");
  ESQUERDA.forEach(function (i) { esq.appendChild(criarItem(i)); });

  var tesoura = el("div", "cabecalho__tesoura", { "aria-hidden": "true" });
  tesoura.appendChild(el("img", "tesoura__fechada", { src: "img/garimpar/nav/4x/tesoura-laranja@4x.png", alt: "" }));
  tesoura.appendChild(el("img", "tesoura__aberta", { src: "img/garimpar/nav/4x/tesoura-aberta-laranja@4x.png", alt: "" }));

  var dir = el("div", "cabecalho__grupo");
  DIREITA.forEach(function (i) { dir.appendChild(criarItem(i)); });

  nav.appendChild(esq);
  nav.appendChild(tesoura);
  nav.appendChild(dir);
  cabecalho.appendChild(nav);
  document.body.insertBefore(cabecalho, document.body.firstChild);

    // Botão de voltar fixo (aparece em todas as páginas)
  var ehInicio = arquivo === "garimpar.html";
  var temHistorico =
    history.length > 1 ||
    (document.referrer && document.referrer.indexOf(location.origin) === 0);

  var caixaVoltar = el("div", "cab-voltar");
  var botaoVoltar = el("button", "cab-botao", {
    type: "button",
    "aria-label": ehInicio ? "Voltar para os cards de boas-vindas" : "Voltar para a página anterior"
  });
  var setaVoltar = el("img", "cab-icone", {
    src: PASTA + "setavoltar@4x.png",
    alt: "",
    "aria-hidden": "true"
  });
  var textoVoltar = el("span");
  textoVoltar.textContent = "Voltar";
  botaoVoltar.appendChild(setaVoltar);
  botaoVoltar.appendChild(textoVoltar);
  caixaVoltar.appendChild(botaoVoltar);
  document.body.appendChild(caixaVoltar);

  // o navegador restaura a rolagem e a etapa exatamente de onde a pessoa saiu
  if ("scrollRestoration" in history) history.scrollRestoration = "auto";

  botaoVoltar.addEventListener("click", function () {
    if (ehInicio && window.abrirCards) {
      window.abrirCards();                 // home: reabre o popup dos cards
    } else if (temHistorico) {
      history.back();                      // demais páginas: etapa anterior
    } else {
      location.href = "garimpar.html";     // plano B: entrou direto por link
    }
  });

  function medir() {
    document.documentElement.style.setProperty("--altura-cabecalho", cabecalho.offsetHeight + "px");
  }
  medir();
  window.addEventListener("load", medir);
  window.addEventListener("resize", medir);
  if (window.ResizeObserver) new ResizeObserver(medir).observe(cabecalho);
})();