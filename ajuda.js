/* ajuda.js: popup de ajuda que muda conforme a página */
(function () {
 var PASTA = "img/ajuda/4x/";

  var IMG = {
    moldura: PASTA + "molduraajuda@4x.png",
    roupa: PASTA + "roupaajuda@4x.png",
    seta: PASTA + "setaajuda@4x.png",
    botao: PASTA + "botaoajuda@4x.png"
  };

  /* peças pequenas desenhadas aqui mesmo */
  var CONTORNO = "M2,2 L5,2 L5,1 L4,1 L4,0 L8,0 L8,1 L7,1 L7,2 L10,2 L10,5 L11,5 L11,4 L12,4 " +
    "L12,8 L11,8 L11,7 L10,7 L10,10 L7,10 L7,9 L8,9 L8,8 L4,8 L4,9 L5,9 L5,10 L2,10 L2,7 " +
    "L3,7 L3,5 L2,5 Z";
   var PECA = '<svg class="aj-peca" viewBox="1 -1 12 12" shape-rendering="crispEdges" aria-hidden="true">' +
    '<path d="' + CONTORNO + '" fill="#000"/></svg>';
  var ICONE_I = '<svg viewBox="0 0 16 16" shape-rendering="crispEdges" aria-hidden="true">' +
    '<polygon points="5,1 11,1 11,2 13,2 13,3 14,3 14,5 15,5 15,11 14,11 14,13 13,13 13,14 11,14 11,15 5,15 5,14 3,14 3,13 2,13 2,11 1,11 1,5 2,5 2,3 3,3 3,2 5,2" fill="none" stroke="#111" stroke-width="1"/>' +
    '<rect x="7" y="4" width="2" height="2"/><rect x="6" y="7" width="3" height="1"/>' +
    '<rect x="7" y="8" width="2" height="4"/><rect x="6" y="12" width="4" height="1"/></svg>';
  var CADEADO = '<svg class="aj-cadeado" viewBox="0 0 12 13" shape-rendering="crispEdges" aria-hidden="true">' +
    '<rect x="4" y="0" width="4" height="1"/><rect x="3" y="1" width="2" height="4"/><rect x="7" y="1" width="2" height="4"/>' +
    '<rect x="1" y="5" width="10" height="8"/>' +
    '<rect x="5" y="7" width="2" height="3" fill="#f6f4f8"/></svg>';
  var X = '<span class="aj-x" aria-label="botão fechar">×</span>';
  var BOTAO = '<img class="aj-botao" src="' + IMG.botao + '" alt="Ajuda">';
    ICONE_I = '<img src="' + IMG.botao + '" alt="">';
  BOTAO = '<span class="aj-pill">? Ajuda</span>';
  var INFO = '<span class="aj-info">ⓘ</span>';

  var INTRO = "Veja os exemplos ao lado para entender o passo a passo. Depois de sanar suas dúvidas, " +
    '<b class="o">clique</b> no ' + X + " para voltar. Se quiser abrir este pop-up novamente, " +
    '<b class="o">clique em</b> ' + BOTAO + ".";

  /* ---------- o conteúdo de cada página ---------- */
  var PAGINAS = {
    garimpar: {
      titulo: "Como navegar na fase “Garimpar”?",
      ex: [
        { img: '<img src="' + IMG.roupa + '" alt="">',
          txt: '<b class="o">Clique</b> na roupa de interesse para <b class="r">conhecer</b> sobre a história que inspirou a criação do conjunto.' },
        { img: '<img src="' + IMG.seta + '" alt="">',
          txt: 'Para seguir para a próxima coleção, <b class="o">clique</b> na seta ao lado do manequim.' }
      ]
    },
    conhecer: {
      titulo: "Como navegar na fase “Coleções”?",
      ex: [
        { img: ICONE_I,
          txt: '<b class="o">Passe o mouse</b> em ' + INFO + ' para abrir as <b class="r">legendas</b> das imagens. Ao <b class="o">tirar o mouse</b>, elas se fecham.' },
        { img: PECA,
                  txt: '<b class="r aj-tit">Eita, o que é isso?</b>Durante a leitura, há algumas peças de roupas escondidas. <b class="o">Clique</b> nas <b class="o">peças de quebra-cabeça</b> para desbloqueá-las e enviá-las ao <b class="o">guarda-roupa.</b>' }
      ]
    },
    montar: {
      titulo: "Como usar o “Guarda-roupa”?",
      ex: [
        { img: '<img src="' + PASTA + 'pecaparada@4x.png" alt="Boné na prateleira do Guarda-Roupa">',
           txt: '<b class="o">Clique</b> numa peça colorida do armário para <b class="r">vesti-la</b> no manequim. Peças pretas com cadeado ainda estão <b class="r">bloqueadas</b>.' },
        { img: '<img src="' + PASTA + 'pecavestida@4x.png" alt="Manequim utilizando Boné">',
          txt: 'Quer trocar de visual? <b class="o">Clique</b> na peça no manequim para <b class="o">devolver</b> ao armário e escolher outra.' }
      ]
    },
    sobre: {
      titulo: "Como navegar na página “Sobre”?",
      ex: [
        { img: '<img src="' + PASTA + 'fotoequipe@4x.jpeg" alt="Ilustração em pixel art dos integrantes da equipe">',
          txt: '<b class="o">Role</b> a página para <b class="r">conhecer</b> o projeto e cada integrante: classe, habilidade e uma frase.' },
        { img: PECA,
          txt: 'O jogo continua nas <b class="o">coleções</b>: lá estão as <b class="r">peças escondidas</b> que liberam roupas no <b class="o">guarda-roupa</b>.' }
      ]
    }
  };

  /* ---------- qual conteúdo mostrar nesta página ---------- */
  function qualPagina() {
    var marca = document.body.getAttribute("data-ajuda");
    if (marca && PAGINAS[marca]) return marca;
    var url = location.pathname.toLowerCase();
    if (url.indexOf("guarda-roupa") > -1) return "montar";
    if (url.indexOf("sobre") > -1) return "sobre";
    if (/arretado|faveleiras|raizes/.test(url)) return "conhecer";
    return "garimpar";
  }

  /* ---------- monta e abre ---------- */
  var caixa = null, anterior = null;

  function montar(chave) {
    var p = PAGINAS[chave];
    var exemplos = p.ex.map(function (e) {
      return '<div class="ajuda__ex"><div class="ajuda__ex-img">' + e.img + "</div><p>" + e.txt + "</p></div>";
    }).join("");
        caixa.querySelector(".ajuda__conteudo").innerHTML =
      '<div class="ajuda__esq"><div class="ajuda__cab">' +
        '<h2 class="ajuda__titulo" id="ajuda-titulo">' + p.titulo + "</h2>" +
        '<p class="ajuda__sub">É simples!</p></div>' +
        '<p class="ajuda__intro">' + INTRO + "</p></div>" + exemplos;
  }

  function criar() {
    caixa = document.createElement("div");
    caixa.className = "ajuda";
    caixa.innerHTML =
      '<div class="ajuda__caixa" role="dialog" aria-modal="true" aria-labelledby="ajuda-titulo">' +
        '<img class="ajuda__moldura" src="' + IMG.moldura + '" alt="">' +
        '<button type="button" class="ajuda__fechar" aria-label="Fechar ajuda"></button>' +
        '<div class="ajuda__conteudo"></div>' +
      "</div>";
    document.body.appendChild(caixa);
    caixa.addEventListener("click", function (e) {
      if (e.target === caixa || e.target.closest(".ajuda__fechar")) fechar();
    });
  }

  function abrir() {
    if (!caixa) criar();
    montar(qualPagina());
    anterior = document.activeElement;
    caixa.classList.add("is-aberto");
    document.body.style.overflow = "hidden";
    caixa.querySelector(".ajuda__fechar").focus();
  }

  function fechar() {
    if (!caixa) return;
    caixa.classList.remove("is-aberto");
    document.body.style.overflow = "";
    if (anterior && anterior.focus) anterior.focus();
  }

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") fechar();
  });

  /* qualquer botão "Ajuda" do site abre o popup */
  document.addEventListener("click", function (e) {
    var gatilho = e.target.closest('[data-ajuda-abrir], a[href$="ajuda.html"]');
    if (!gatilho) return;
    e.preventDefault();
    abrir();
  });
})();