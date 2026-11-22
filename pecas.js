/* pecas.js: lista de peças e progresso do jogo (salvo no navegador, sem login) */
window.Recorte = (function () {
  var CHAVE = "recorte-jogo";
  var DIR = "img/guarda-roupa/4x/";

  /* ordem das camadas no manequim: a de baixo fica por baixo, a última fica por cima */
    var ORDEM = ["sapato", "baixo", "cinto", "cima", "blusa", "pescoco", "rosto", "cabeca"];

  /* peca(id, nome, coleção, camada, x, y, masculino)
     id = início do nome dos arquivos (ex.: "calcaazul" usa calcaazulguardaroupabloqueada@4x.png etc.)
     x e y = posição da peça NO GUARDA-ROUPA (% do guarda-roupa; x = esquerda, y = topo)
     masculino = true quando o arquivo termina em "bloqueado/desbloqueado" (cinto, boné)
     mx e my (abaixo) = posição da peça NO MANEQUIM (% do manequim). 0 e 0 serve quando
     a imagem foi exportada com o tamanho de prancheta do manequim. */
   function peca(id, nome, colecao, camada, x, y, masculino, base) {
    var bloq = masculino ? "bloqueado" : "bloqueada";
    var desb = masculino ? "desbloqueado" : "desbloqueada";
    return {
      id: id, nome: nome, colecao: colecao, camada: camada,
      x: x, y: y, mx: 0, my: 0, base: !!base,
      preta:  DIR + id + "guardaroupa" + bloq + "@4x.png",
      lado:   DIR + id + "guardaroupa" + desb + "@4x.png",
      frente: DIR + id + "manequim@4x.png"
    };
  }

  var PECAS = [
    /* prateleira de cima */
    peca("bonerecap",         "Boné “Re-Cap”",          "faveleiras", "cabeca", 29.2, 29.8, true),
    peca("cintosaideira",     "Cinto “Saideira”",              "faveleiras", "cinto",  36.9, 30.4, true),
    peca("toucatucum",        "Touca “Tucum”",      "raizes",     "cabeca", 45.0, 29.9,),
    peca("colarvitral",       "Colar “Vitral”",              "arretado",   "pescoco", 52.0, 30.4, true),
    peca("oculosjuliet",       "Óculos “Juliet”",              "faveleiras",   "rosto", 52.0, 30.4, true),
    peca("oculosarretado",       "Óculos “Arretado”",              "arretado",   "rosto", 52.0, 30.4, true),

    /* cabide */
    peca("jaquetaraizesvivas",  "Jaqueta “Raízes Vivas”",   "raizes",   "blusa",   34.2, 39.9),
    peca("jaquetamandacaru",  "Jaqueta “Mandacaru”",   "arretado",   "blusa",   34.2, 39.9),
    peca("jaquetararosaba",   "Jaqueta “Rarõsaba”",   "raizes",     "blusa",   -5.8, 11.7),
    peca("camisetafrutas", "Camiseta “Frutas”", "raizes",     "cima",   40.0, 41.0),
    peca("camisetarelo",      "Camiseta “Relô”",      "faveleiras", "cima",   43.0, 40.8),
    peca("camisafaveleiras",      "Camisa “Faveleiras”",      "faveleiras", "cima",   43.0, 40.8),
    peca("camisetapindorama", "Camiseta “Pindorama”", "raizes",     "cima",   40.0, 41.0),
    peca("camisetaarretado",  "Camiseta Arretado",   "arretado",   "cima",   34.2, 39.9),
    peca("regataraizesvivas",  "Regata “Raízes Vivas”",   "raizes",   "cima",   34.2, 39.9),
    peca("camisetasertaofc",  "Camiseta “Sertão F.C.”",   "arretado",   "cima",   64.6, 40.5),
    peca("camisaraflechavermelha",  "Camisa “Flecha Vermelha”",   "raizes",   "cima",   64.6, 40.5),

    /* dobradas, prateleira de baixo (o 8º valor, true, apoia na prateleira) */
    peca("bermudakopixawa",   "Bermuda Kopixawa",      "raizes",     "baixo",  57.0, 74.8, false, true),
    peca("shortspoesia",      "Shorts Poesia",      "faveleiras", "baixo",  29.0, 74.8, false, true),
    peca("calcacabrabonita",  "Calça “Cabra Bonita”",       "arretado",   "baixo",  36.0, 74.8, false, true),
    peca("calcafvla",       "Calça “FVLA”",     "faveleiras",     "baixo",  64.0, 74.8, false, true),
    peca("calcakusiwa",       "Calça “Kusiwa”",     "raizes",     "baixo",  64.0, 74.8, false, true),
    peca("calcaarretado",       "Calça “Arretado”",     "arretado",     "baixo",  64.0, 74.8, false, true),
    peca("calcavaleime",       "Calça “Valei-me”",     "arretado",     "baixo",  64.0, 74.8, false, true),
    peca("calcaraizesvivas",       "Calça “Raízes Vivas”",     "raizes",     "baixo",  64.0, 74.8, false, true),
    peca("calcamarrom",  "Calça Marrom",       "raizes",   "baixo",  36.0, 74.8, false, true),

    /* sapatos */
    peca("sapatobranco",      "Sapato Branco",      "faveleiras", "sapato",  65.0, 74.8, false, true),
    peca("sapatopreto",       "Sapato Preto",       "faveleiras", "sapato",  66.0, 74.8, false, true),
    peca("sapatoraizesvivas", "Sapato Raizes Vivas","raizes",     "sapato",  67.0, 74.8, false, true),
    peca("sapatoarretado",    "Sapato Arretado",    "arretado",   "sapato",  68.0, 74.8, false, true)
  ];

    /* peças que já começam desbloqueadas (não têm versão bloqueada) */
  var INICIAIS = ["calcakusiwa", "sapatobranco", "sapatopreto", "sapatoraizesvivas", "calcafvla", "sapatoarretado", "calcaarretado", "camisetaarretado", "regataraizesvivas", "jaquetaraizesvivas", "calcavaleime", "oculosjuliet", "oculosarretado", "calcaraizesvivas", "calcamarrom", "camisetafrutas", "camisafaveleiras", "camisaraflechavermelha" ];
  PECAS.forEach(function (p) {
    p.inicial = INICIAIS.indexOf(p.id) > -1;
  });


  /* o boné não tem arquivo "desbloqueado": usa o mesmo do manequim */
  PECAS[0].lado = PECAS[0].frente;
    PECAS[0].w = 6.3;      /* largura do boné no guarda-roupa (% do guarda-roupa); menor = boné menor */
  /* posição das peças no manequim: id: [mx, my] em % do manequim.
     Gerado pelo modo ?ajustar da página (botão Copiar). */
     /* nomes das peças (aparecem no popup de desbloqueio e no guarda-roupa) */
     /* peças de Raízes Vivas: arquivo de frente sem o sufixo "manequim" */
PECAS.forEach(function (p) {
  if (["toucatucum", "camisaraflechavermelha", "calcakusiwa"].indexOf(p.id) > -1) {
    p.frente = "img/guarda-roupa/4x/" + p.id + "@4x.png";
    if ("manequim" in p) p.manequim = p.frente;
  }
});
/* imagens do guarda-roupa das peças de Raízes Vivas (nomes fora do padrão) */
var CAMINHOS = {
  toucatucum: {
    preta: DIR + "toucatucumbloqueado@4x.png",
    lado:  DIR + "toucatucum@4x.png"                          /* touca desbloqueada = a do manequim */
  },
  camisaraflechavermelha: {
    preta: DIR + "camisaraflechavermelharoupabloqueada@4x.png",
    lado:  DIR + "camisaraflechavermelharoupadesbloqueada@4x.png"
  },
  calcakusiwa: {
    preta: DIR + "calcakusiwabloqueada@4x.png",
    lado:  DIR + "calcakusiwadesbloqueada@4x.png"
  }
};
PECAS.forEach(function (p) {
  if (CAMINHOS[p.id]) { p.preta = CAMINHOS[p.id].preta; p.lado = CAMINHOS[p.id].lado; }
});

/* largura da touca no guarda-roupa (% do guarda-roupa); menor = touca menor */
PECAS.forEach(function (p) {
  if (p.id === "toucatucum") {
    p.w = 4;       /* largura (% do guarda-roupa) */
    p.x = 45.0;    /* esquerda */
    p.y = 29.0;    /* topo: maior desce, menor sobe */
  }
});

  /* posição (x, y) e largura (w) das peças no guarda-roupa. Gerado pelo modo ?posicionar */
  var POSICAO = {
    bonerecap: [30.1, 29.8, 6.3],
    cintosaideira: [47.4, 31.3, 6.1],
    toucatucum: [36.9, 30.1, 4.0],
    colarvitral: [42.4, 29.3, 3.5],
    oculosjuliet: [53.5, 31.5, 7.0],
    oculosarretado: [60.6, 30.9, 5.9],
    jaquetaraizesvivas: [30.1, 39.4, 7.2],
    jaquetamandacaru: [33.8, 39.9, 6.0],
    jaquetararosaba: [37.5, 39.8, 5.8],
    camisetafrutas: [41.5, 39.3, 4.9],
    camisetarelo: [44.9, 39.5, 5.2],
    camisafaveleiras: [48.5, 39.1, 6.0],
    camisetapindorama: [52.4, 39.1, 4.5],
    camisetaarretado: [55.8, 39.5, 4.9],
    regataraizesvivas: [59.5, 40.1, 4.0],
    camisetasertaofc: [62.8, 39.9, 3.9],
    camisaraflechavermelha: [66.5, 40.4, 3.7],
    bermudakopixawa: [35.6, 75.0, 6.2],
    shortspoesia: [36.1, 72.1, 5.8],
    calcacabrabonita: [30.2, 74.3, 5.7],
    calcafvla: [64.1, 74.6, 6.4],
    calcakusiwa: [64.1, 71.2, 6.1],
    calcaarretado: [30.5, 71.2, 5.0],
    calcavaleime: [42.3, 74.8, 6.0],
    calcaraizesvivas: [57.8, 75.0, 6.0],
    calcamarrom: [48.0, 74.8, 4.8],
    sapatobranco: [29.8, 87.1, 5.8],
    sapatopreto: [36.7, 87.1, 6.0],
    sapatoraizesvivas: [49.0, 88.3, 3.9],
    sapatoarretado: [42.4, 88.4, 6.7]
  };

  PECAS.forEach(function (p) {
    var v = POSICAO[p.id];
    if (!v) return;
    p.x = v[0]; p.y = v[1];
    if (v[2]) p.w = v[2];
  });

var NOMES = {
  shortspoesia:   "Shorts “Poesia”",
  bonerecap:        "Boné “Re-Cap”",
  colarvitral:       "Colar “Vitral”",
  calcacabrabonita:     "Calça “Cabra Bonita”",
  camisetasertaofc:    "Camiseta “Sertão F.C.”",
  cintosaideira:           "Cinto “Saideira”",
  bermudakopixawa:   "Bermuda Kopixawa",
  jaquetararosaba:    "Jaqueta “Rarõsaba”",
  toucatucum:             "Touca “Tucum”",
  camisetapindorama: "Camiseta “Pindorama”",
  jaquetamandacaru: "Jaqueta “Mandacaru”",
  camisetarelo:    "Camiseta “Relô”",
  calcakusiwa:     "Calça “Kusiwa”",
  sapatobranco:    "Sapato Branco",
  sapatopreto:     "Sapato Preto",
  sapatoraizesvivas:  "Sapato “Raízes Vivas”",
  sapatoarretado: "Sapato “Arretado”",
  calcaarretado: "Calça “Arretado”",
  camisetaarretado: "Camiseta “Arretado”",
  regataraizesvivas: "Regata “Raízes Vivas”",
  calcavaleime: "Calça “Valei-me”",
  calcafvla: "Calça  “FVLA”",
  oculosjuliet: "Óculos  Juliet",
  camisetafrutas: "Camiseta  “Frutas”",
  oculosarretado: "Óculos “Arretado”",
  calcaraizesvivas: "Calça “Raízes Vivas”",
  calcamarrom: "Calça Marrom",
  camisaraflechavermelha: "Camisa “Flecha Vermelha”"
};

/* imagem que aparece só no popup "Que achado!" (opcional) */
var POPUP = {
  calcacabrabonita: "img/guarda-roupa/4x/popup/calcacabrabonita@4x.png",
  camisetasertaofc: "img/guarda-roupa/4x/popup/camisetasertaofc@4x.png",
  jaquetamandacaru: "img/guarda-roupa/4x/popup/jaquetamandacaru@4x.png",
  colarvitral: "img/guarda-roupa/4x/popup/colarvitral@4x.png",
  bonerecap: "img/guarda-roupa/4x/popup/bonerecap@4x.png",
  camisetarelo: "img/guarda-roupa/4x/popup/camisetarelo@4x.png",
  shortspoesia: "img/guarda-roupa/4x/popup/shortspoesia@4x.png",
  cintosaideira: "img/guarda-roupa/4x/popup/cintosaideira@4x.png",
  toucatucum: "img/guarda-roupa/4x/popup/toucatucum@4x.png",
  camisetapindorama: "img/guarda-roupa/4x/popup/camisetapindorama@4x.png",
  bermudakopixawa: "img/guarda-roupa/4x/popup/bermudakopixawa@4x.png",
  jaquetararosaba: "img/guarda-roupa/4x/popup/jaquetararosaba@4x.png"
};
PECAS.forEach(function (p) {
  if (POPUP[p.id]) p.popup = POPUP[p.id];
});

PECAS.forEach(function (p) { if (NOMES[p.id]) p.nome = NOMES[p.id]; });
  var AJUSTE = {
    bonerecap: [20.6, -4.9, 52.4],
    cintosaideira: [24.7, 44.6, 51.7],
    toucatucum: [34.5, -4.7, 33.7],
    colarvitral: [20.2, 16.7, 58.7],
    oculosjuliet: [30.2, 5.3, 42.4],
    oculosarretado: [34.9, 5.8, 33.1],
    jaquetaraizesvivas: [-6.8, 15.4, 120.2],
    jaquetamandacaru: [-16.3, 13.6, 135.7],
    jaquetararosaba: [-5.8, 11.7, 115.6],
    camisetafrutas: [-2.7, 17.6, 109.8],
    camisetarelo: [1.4, 15.2, 98.7],
    camisafaveleiras: [-24.8, 11.4, 146.7],
    camisetapindorama: [-17.6, 11.3, 137.5],
    camisetaarretado: [-1.4, 16.6, 105.1],
    regataraizesvivas: [-6.2, 16.3, 106.3],
    camisetasertaofc: [-14.8, 12.1, 132.6],
    camisaraflechavermelha: [-8.5, 12.2, 118.6],
    bermudakopixawa: [-10.9, 41.6, 126.0],
    shortspoesia: [6.4, 39.3, 90.0],
    calcacabrabonita: [-30.3, 41.9, 167.8],
    calcafvla: [-23.3, 42.1, 153.0],
    calcakusiwa: [14.2, 44.3, 73.7],
    calcaarretado: [-3.6, 42.8, 108.4],
    calcavaleime: [16.1, 46.3, 71.5],
    calcaraizesvivas: [14.8, 40.6, 72.8],
    calcamarrom: [13.1, 43.7, 78.3],
    sapatobranco: [22.0, 85.0, 58.0],
    sapatopreto: [23.3, 84.2, 56.1],
    sapatoraizesvivas: [25.5, 71.8, 52.7],
    sapatoarretado: [4.8, 72.8, 91.3]
  };

  PECAS.forEach(function (p) {
    var v = AJUSTE[p.id];
    if (!v) return;
    p.mx = v[0]; p.my = v[1];
    if (v[2]) p.mw = v[2];
  });

  function lerEstado() {
    try {
      var s = JSON.parse(localStorage.getItem(CHAVE));
      if (s && s.ok && s.vestidas) return s;
    } catch (e) {}
    return { ok: [], vestidas: {} };
  }

  var estado = lerEstado();

  function salvar() {
    try { localStorage.setItem(CHAVE, JSON.stringify(estado)); } catch (e) {}
  }

/* zera o jogo quando a página é recarregada (F5, Ctrl+R ou botão de recarregar) */
  (function () {
    var recarregou = false;
    try {
      var nav = performance.getEntriesByType("navigation")[0];
      if (nav) recarregou = nav.type === "reload";
      else if (performance.navigation) recarregou = performance.navigation.type === 1;
    } catch (e) {}
    if (recarregou) {
      estado = { ok: [], vestidas: {} };
      salvar();
    }
  })();

  function achar(id) {
    for (var i = 0; i < PECAS.length; i++) if (PECAS[i].id === id) return PECAS[i];
    return null;
  }

  return {
    PECAS: PECAS,
    ORDEM: ORDEM,
    achar: achar,
        estaDesbloqueada: function (id) {
      var p = achar(id);
      return (!!p && p.inicial) || estado.ok.indexOf(id) !== -1;
    },
    estaVestida: function (id) {
      var p = achar(id);
      return !!p && estado.vestidas[p.camada] === id;
    },
    /* devolve true se a peça era nova (usar no esteregg) */
    desbloquear: function (id) {
      if (estado.ok.indexOf(id) !== -1) return false;
      estado.ok.push(id);
      salvar();
      return true;
    },
    /* vestir; se já estiver vestida, tira. Vestir outra da mesma camada troca. */
    vestirOuTirar: function (id) {
      var p = achar(id);
      if (!p || !(p.inicial || estado.ok.indexOf(id) !== -1)) return;
      if (estado.vestidas[p.camada] === id) delete estado.vestidas[p.camada];
      else estado.vestidas[p.camada] = id;
      salvar();
    },
    /* para testar: libera todas as peças */
    liberarTudo: function () {
      PECAS.forEach(function (p) {
        if (estado.ok.indexOf(p.id) === -1) estado.ok.push(p.id);
      });
      salvar();
    },
        /* tira todas as roupas do manequim (as peças continuam desbloqueadas) */
    despir: function () {
      estado.vestidas = {};
      salvar();
    },
    reiniciar: function () {
      estado = { ok: [], vestidas: {} };
      salvar();
    }
  };
})();