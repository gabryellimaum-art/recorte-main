/* guarda-roupa.js: comportamento da página Guarda-roupa */
(function () {
  var armario = document.getElementById("armario");
  var pecasEl = document.getElementById("pecas");
  var roupasEl = document.getElementById("roupas");
  var corpoImg = document.querySelector(".gr__corpo-img");
  var armarioImg = document.querySelector(".gr__armario-img");
  var abas = document.querySelectorAll(".gr__aba");

  /* TESTE: abra a página com ?teste no fim do endereço para liberar todas as peças.
     Com ?reiniciar volta tudo ao começo. (Apagar estas 2 linhas antes de entregar.) */
  if (/[?&]teste/.test(location.search)) Recorte.liberarTudo();
  if (/[?&]reiniciar/.test(location.search)) Recorte.reiniciar();
    /* MODO AJUSTAR: abra a página com ?ajustar para arrastar as peças no manequim. */
  var AJUSTAR = /[?&](ajustar|posicionar-manequim)/.test(location.search);
  if (AJUSTAR) Recorte.liberarTudo();
    /* MODO POSICIONAR: abra a página com ?posicionar para arrastar e redimensionar as peças no armário. */
  var POSICIONAR = /[?&]posicionar(?!-)/.test(location.search);
  if (POSICIONAR) Recorte.liberarTudo();
  /* MODO POSICIONAR COLEÇÃO: abra a página com ?posicionar-colecao, escolha uma coleção
     e arraste/redimensione as peças como elas aparecem no filtro. */
  var POSICIONAR_COL = /[?&]posicionar-colecao/.test(location.search);
  if (POSICIONAR_COL) Recorte.liberarTudo();
  Recorte.despir();       /* começa sempre com o manequim sem roupa */
  var colecaoAtual = null;          /* null = mostra todas as peças */

  /* ---------- som da porta ---------- */
  var ARQUIVO_ABRIR = "";           /* ex.: "audio/bau-abrir.mp3" (se vazio, usa o som gerado) */
  var ARQUIVO_FECHAR = "";          /* ex.: "audio/bau-fechar.mp3" */
  var audioCtx = null;

  function somPorta(abrindo) {
    try {
      var arq = abrindo ? ARQUIVO_ABRIR : ARQUIVO_FECHAR;
      if (arq) { new Audio(arq).play(); return; }

      var AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      audioCtx = audioCtx || new AC();
      var t = audioCtx.currentTime, dur = 0.5;

      /* rangido de madeira: onda serra com tremor, sobe ao abrir e desce ao fechar */
      var osc = audioCtx.createOscillator();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(abrindo ? 150 : 300, t);
      osc.frequency.exponentialRampToValueAtTime(abrindo ? 310 : 140, t + dur);
      var vib = audioCtx.createOscillator();
      var vibG = audioCtx.createGain();
      vib.frequency.value = 38;
      vibG.gain.value = 14;
      vib.connect(vibG);
      vibG.connect(osc.frequency);

      var filtro = audioCtx.createBiquadFilter();
      filtro.type = "bandpass";
      filtro.frequency.value = 700;
      filtro.Q.value = 3;
      var g = audioCtx.createGain();
      g.gain.setValueAtTime(0.0001, t);
      g.gain.linearRampToValueAtTime(0.35, t + 0.05);
      g.gain.linearRampToValueAtTime(0.25, t + dur - 0.1);
      g.gain.linearRampToValueAtTime(0.0001, t + dur);

      osc.connect(filtro); filtro.connect(g); g.connect(audioCtx.destination);
      osc.start(t); vib.start(t);
      osc.stop(t + dur); vib.stop(t + dur);

      /* "tum" da madeira no fim */
      var q = t + dur - 0.08;
      var o = audioCtx.createOscillator();
      var og = audioCtx.createGain();
      o.type = "sine";
      o.frequency.setValueAtTime(abrindo ? 120 : 90, q);
      o.frequency.exponentialRampToValueAtTime(40, q + 0.15);
      og.gain.setValueAtTime(abrindo ? 0.35 : 0.7, q);
      og.gain.exponentialRampToValueAtTime(0.001, q + 0.2);
      o.connect(og); og.connect(audioCtx.destination);
      o.start(q); o.stop(q + 0.22);
    } catch (e) {}
  }

  /* ---------- utilidades ---------- */
   function aoCarregar(img, fn) {
    img.addEventListener("load", fn);
    if (img.complete && img.naturalWidth) fn();
  }

  var DIR_IMG = "img/guarda-roupa/4x/";

  var resolvidas = {};   /* lista de nomes -> endereço que funcionou (evita refazer a busca) */
  var ruins = {};        /* endereços que deram erro 404: não tenta de novo (evita erros repetidos no Console) */
  var avisados = {};     /* listas sem nenhuma imagem: avisa só uma vez */

  /* tenta cada imagem da lista até uma carregar; se nenhuma existir, avisa no Console */
  function carregarComReserva(img, lista) {
    var chave = lista.join("|");
    img.decoding = "sync";                       /* já desenha pronta, sem piscar */

    if (resolvidas[chave]) {                     /* já sabemos qual funciona: usa direto */
      img.src = resolvidas[chave];
      return;
    }

    var i = 0;
    function proxima() {
      while (i < lista.length && ruins[lista[i]]) i++;     /* pula os que já falharam */
      if (i >= lista.length) {
        if (!avisados[chave]) {
          avisados[chave] = true;
          console.warn("SEM IMAGEM. O código procurou:", lista.join("  |  "));
        }
        return;
      }
      img.src = lista[i++];
    }
    img.addEventListener("load", function () {
      resolvidas[chave] = img.getAttribute("src");
    });
    img.addEventListener("error", function () {
      ruins[img.getAttribute("src")] = true;
      proxima();
    });
    proxima();
  }

  /* ---------- arrumação quando uma coleção está selecionada ---------- */
  var CENTRO = 50.3;      /* centro do interior do armário (% do guarda-roupa) */
  var LARGURA_UTIL = 42;  /* largura máxima de uma fileira (% do guarda-roupa) */
  var FOLGA = 2.5;        /* espaço desejado entre peças vizinhas */

  /* 0 cima, 1 cabide, 2 dobradas, 3 sapatos */
  function grupoDaPeca(q) {
    if (q.camada === "sapato") return 3;
    if (q.y < 38) return 0;
    return q.base ? 2 : 1;
  }

  /* posição das peças quando uma coleção está selecionada: id: [x, y, largura] (% do guarda-roupa).
     Gerado pelo modo ?posicionar-colecao. Peças que não estão aqui usam a arrumação automática. */
  var POSICAO_COLECAO = {

    calcaarretado: [36.8, 75.2, 5.0],
    calcacabrabonita: [30.6, 75.2, 5.7],
    calcavaleime: [42.3, 75.2, 6.0],
    camisetaarretado: [36.4, 39.5, 4.9],
    camisetasertaofc: [42.4, 39.7, 3.9],
    colarvitral: [31.2, 29.3, 3.5],
    jaquetamandacaru: [30.1, 39.7, 6.0],
    oculosarretado: [37.2, 30.5, 5.9],
    sapatoarretado: [30.4, 87.7, 6.7],
    bonerecap: [31.0, 29.7, 6.3],
    calcaarretado: [36.8, 75.2, 5.0],
    calcacabrabonita: [30.6, 75.2, 5.7],
    calcafvla: [37.4, 74.5, 6.4],
    calcavaleime: [42.3, 75.2, 6.0],
    camisafaveleiras: [34.9, 39.3, 6.0],
    camisetaarretado: [36.4, 39.5, 4.9],
    camisetarelo: [30.3, 39.1, 5.2],
    camisetasertaofc: [42.4, 39.7, 3.9],
    cintosaideira: [38.5, 30.9, 6.1],
    colarvitral: [31.2, 29.3, 3.5],
    jaquetamandacaru: [30.1, 39.7, 6.0],
    oculosarretado: [37.2, 30.5, 5.9],
    oculosjuliet: [45.5, 31.5, 7.0],
    sapatoarretado: [30.4, 87.7, 6.7],
    sapatobranco: [30.5, 87.1, 5.8],
    sapatopreto: [37.8, 87.0, 6.0],
    shortspoesia: [30.3, 74.8, 5.8],
    bermudakopixawa: [30.7, 74.6, 6.2],
    bonerecap: [31.0, 29.7, 6.3],
    calcaarretado: [36.8, 75.2, 5.0],
    calcacabrabonita: [30.6, 75.2, 5.7],
    calcafvla: [37.4, 74.5, 6.4],
    calcakusiwa: [37.2, 74.5, 6.1],
    calcamarrom: [51.1, 74.8, 4.8],
    calcaraizesvivas: [44.2, 75.0, 6.0],
    calcavaleime: [42.3, 75.2, 6.0],
    camisafaveleiras: [34.9, 39.3, 6.0],
    camisaraflechavermelha: [52.8, 39.8, 4.3],
    camisetaarretado: [36.4, 39.5, 4.9],
    camisetafrutas: [40.1, 40.2, 4.9],
    camisetapindorama: [44.3, 39.0, 4.5],
    camisetarelo: [30.3, 39.1, 5.2],
    camisetasertaofc: [42.4, 39.7, 3.9],
    cintosaideira: [38.5, 30.9, 6.1],
    colarvitral: [31.2, 29.3, 3.5],
    jaquetamandacaru: [30.1, 39.7, 6.0],
    jaquetaraizesvivas: [29.3, 39.4, 7.2],
    jaquetararosaba: [35.0, 39.8, 5.8],
    oculosarretado: [37.2, 30.5, 5.9],
    oculosjuliet: [45.5, 31.5, 7.0],
    regataraizesvivas: [48.6, 40.2, 4.0],
    sapatoarretado: [30.4, 87.7, 6.7],
    sapatobranco: [30.5, 87.1, 5.8],
    sapatopreto: [37.8, 87.0, 6.0],
    sapatoraizesvivas: [31.4, 87.8, 3.9],
    shortspoesia: [30.3, 74.8, 5.8],
    toucatucum: [31.5, 29.6, 4.0]
  };

  function posicaoNaColecao(p) {
    var c = POSICAO_COLECAO[p.id];
    if (c) return { x: c[0], y: c[1], w: c[2] || p.w };

    /* arrumação automática só entre as peças que não têm posição própria */
    var irmaos = Recorte.PECAS.filter(function (q) {
      return q.colecao === p.colecao && grupoDaPeca(q) === grupoDaPeca(p) && !POSICAO_COLECAO[q.id];
    });

    var somaLarg = 0;
    irmaos.forEach(function (q) { somaLarg += (q.w || 5); });

    var folga = FOLGA;
    if (irmaos.length > 1 && somaLarg + folga * (irmaos.length - 1) > LARGURA_UTIL) {
      folga = Math.max(0, (LARGURA_UTIL - somaLarg) / (irmaos.length - 1));
    }

    var total = somaLarg + folga * (irmaos.length - 1);
    var x = CENTRO - total / 2;
    for (var i = 0; i < irmaos.length; i++) {
      if (irmaos[i] === p) break;
      x += (irmaos[i].w || 5) + folga;
    }
    return { x: x, y: p.y, w: p.w };
  }

  /* ---------- peças no guarda-roupa ---------- */
  function desenharPecas() {
    pecasEl.innerHTML = "";
    Recorte.PECAS.forEach(function (p) {
      if (colecaoAtual && p.colecao !== colecaoAtual) return;
      if (Recorte.estaVestida(p.id)) return;           /* vestida: sai do armário */
      var livre = Recorte.estaDesbloqueada(p.id);

      var b = document.createElement("button");
      b.type = "button";
      b.className = "gr__peca" + (livre ? "" : " is-bloqueada") + (p.base ? " gr__peca--base" : "");
            var pos = (colecaoAtual && !POSICIONAR) ? posicaoNaColecao(p) : p;
            b.dataset.id = p.id;
      b.style.left = pos.x + "%";
      b.style.top = pos.y + "%";
      b.setAttribute("aria-label", livre ? p.nome : "Peça bloqueada");

      var img = document.createElement("img");
      img.alt = "";
            var lista = livre
        ? [p.lado, p.frente, DIR_IMG + p.id + "@4x.png"]
        : [p.preta, p.lado, p.frente, DIR_IMG + p.id + "@4x.png"];

      /* peça bloqueada sem versão preta: usa a colorida e pinta de preto (silhueta) */
       img.addEventListener("load", function () {
        b.classList.add("tem-img");
        if (!livre && img.getAttribute("src") !== p.preta) img.classList.add("gr__silhueta");
      });

      carregarComReserva(img, lista);
      aoCarregar(img, function () {
        /* tamanho proporcional ao guarda-roupa (mesma escala do arquivo @4x) */
        if (pos.w) b.style.width = pos.w + "%";
        else if (armarioImg.naturalWidth) {
          b.style.width = (img.naturalWidth / armarioImg.naturalWidth * 100) + "%";
        }
      });
      b.appendChild(img);

      b.addEventListener("click", function () {
         if (!livre || POSICIONAR || POSICIONAR_COL) return;
        Recorte.vestirOuTirar(p.id);
        desenharTudo();
      });
      pecasEl.appendChild(b);
    });
  }

  /* ---------- peças vestidas no manequim ---------- */
  function desenharManequim() {
    roupasEl.innerHTML = "";
    Recorte.PECAS.forEach(function (p) {
      if (!Recorte.estaVestida(p.id)) return;
      var img = document.createElement("img");
      img.className = "gr__roupa";
      img.alt = p.nome;
      img.dataset.id = p.id;
      img.style.left = (p.mx || 0) + "%";
      img.style.top = (p.my || 0) + "%";
      img.style.zIndex = Recorte.ORDEM.indexOf(p.camada) + 1;
            carregarComReserva(img, [p.frente, DIR_IMG + p.id + "@4x.png", p.lado]);
      aoCarregar(img, function () {
        /* tamanho: o valor ajustado (mw) ou proporcional ao manequim */
        if (p.mw) img.style.width = p.mw + "%";
        else if (corpoImg.naturalWidth) {
          img.style.width = (img.naturalWidth / corpoImg.naturalWidth * 100) + "%";
        }
      });

      roupasEl.appendChild(img);
    });
  }

  function desenharTudo() { desenharPecas(); desenharManequim(); }

  /* clique no manequim: acha a peça de cima que tem pixel (não transparente) no ponto */
  var canvasCache = {};
  function temPixel(img, e) {
    var r = img.getBoundingClientRect();
    var x = Math.floor((e.clientX - r.left) / r.width * img.naturalWidth);
    var y = Math.floor((e.clientY - r.top) / r.height * img.naturalHeight);
    if (x < 0 || y < 0 || x >= img.naturalWidth || y >= img.naturalHeight) return false;
    try {
      var c = canvasCache[img.src];
      if (!c) {
        c = document.createElement("canvas");
        c.width = img.naturalWidth;
        c.height = img.naturalHeight;
        c.getContext("2d").drawImage(img, 0, 0);
        canvasCache[img.src] = c;
      }
      return c.getContext("2d").getImageData(x, y, 1, 1).data[3] > 10;
    } catch (err) { return true; }
  }

  function pecaSobMouse(e) {
    var imgs = Array.prototype.slice.call(roupasEl.querySelectorAll(".gr__roupa"));
    imgs.sort(function (a, b) { return b.style.zIndex - a.style.zIndex; });
    for (var i = 0; i < imgs.length; i++) if (temPixel(imgs[i], e)) return imgs[i];
    return null;
  }

  roupasEl.addEventListener("click", function (e) {
     if (AJUSTAR) return;
    var img = pecaSobMouse(e);
    if (!img) return;
    Recorte.vestirOuTirar(img.dataset.id);              /* tira do manequim: volta ao guarda-roupa */
    desenharTudo();
  });

  roupasEl.addEventListener("mousemove", function (e) {
    roupasEl.style.cursor = pecaSobMouse(e) ? "pointer" : "default";
  });
  /* ---------- MODO AJUSTAR (?ajustar): posição e tamanho no manequim ---------- */
  if (AJUSTAR) {
    armario.classList.add("is-aberto");

    var caixa = document.createElement("div");
    caixa.style.cssText = "position:fixed;left:8px;bottom:8px;width:44vw;z-index:9999;" +
      "background:#111;color:#c8f000;font:12px/1.4 monospace;padding:8px 10px;border-radius:6px;";
    caixa.innerHTML =
      '<div style="margin-bottom:6px;color:#fff">Vista a peça no armário. ARRASTE no manequim para mover. ' +
      'RODA DO MOUSE sobre a peça (ou as teclas + e −) muda o tamanho. Duplo clique tira a peça. ' +
      'Quando terminar, clique em Copiar e cole no pecas.js no lugar do bloco AJUSTE.</div>' +
      '<button type="button" id="copiar-ajuste">Copiar</button>' +
      '<pre id="texto-ajuste" style="margin:6px 0 0;max-height:28vh;overflow:auto;white-space:pre-wrap"></pre>';
    document.body.appendChild(caixa);
    var textoEl = document.getElementById("texto-ajuste");

    function larguraNoManequim(img) { return img.offsetWidth / roupasEl.offsetWidth * 100; }

    var atualizarPainel = function () {
      var linhas = Recorte.PECAS.map(function (p) {
        var img = roupasEl.querySelector('[data-id="' + p.id + '"]');
        var w = img ? larguraNoManequim(img) : (p.mw || 0);
        return "    " + p.id + ": [" + (p.mx || 0).toFixed(1) + ", " + (p.my || 0).toFixed(1) +
          (w ? ", " + w.toFixed(1) : "") + "]";
      });
      textoEl.textContent = "  var AJUSTE = {\n" + linhas.join(",\n") + "\n  };";
    };
    atualizarPainel();

    document.getElementById("copiar-ajuste").addEventListener("click", function () {
      try { navigator.clipboard.writeText(textoEl.textContent); } catch (err) {}
    });

    var ultimaId = null;

    /* muda a largura mantendo o centro da peça no mesmo lugar */
    function redimensionar(img, p, fator) {
      var wAntes = larguraNoManequim(img);
      var hAntes = img.offsetHeight / roupasEl.offsetHeight * 100;
      var wNovo = Math.max(2, wAntes * fator);
      var hNovo = hAntes * wNovo / wAntes;
      p.mw = wNovo;
      p.mx = (p.mx || 0) - (wNovo - wAntes) / 2;
      p.my = (p.my || 0) - (hNovo - hAntes) / 2;
      img.style.width = wNovo + "%";
      img.style.left = p.mx + "%";
      img.style.top = p.my + "%";
      atualizarPainel();
    }

    var arrastando = null;
    roupasEl.addEventListener("pointerdown", function (e) {
      var img = pecaSobMouse(e);
      if (!img) return;
      var p = Recorte.achar(img.dataset.id);
      ultimaId = p.id;
      arrastando = {
        img: img, p: p, x0: e.clientX, y0: e.clientY,
        mx0: p.mx || 0, my0: p.my || 0, r: roupasEl.getBoundingClientRect()
      };
      roupasEl.setPointerCapture(e.pointerId);
      e.preventDefault();
    });
    roupasEl.addEventListener("pointermove", function (e) {
      if (!arrastando) return;
      var a = arrastando;
      a.p.mx = a.mx0 + (e.clientX - a.x0) / a.r.width * 100;
      a.p.my = a.my0 + (e.clientY - a.y0) / a.r.height * 100;
      a.img.style.left = a.p.mx + "%";
      a.img.style.top = a.p.my + "%";
      atualizarPainel();
    });
    roupasEl.addEventListener("pointerup", function () { arrastando = null; });

    roupasEl.addEventListener("wheel", function (e) {
      var img = pecaSobMouse(e);
      if (!img) return;
      e.preventDefault();
      ultimaId = img.dataset.id;
      redimensionar(img, Recorte.achar(ultimaId), e.deltaY < 0 ? 1.03 : 0.97);
    }, { passive: false });

    document.addEventListener("keydown", function (e) {
      if (!ultimaId) return;
      var img = roupasEl.querySelector('[data-id="' + ultimaId + '"]');
      if (!img) return;
      if (e.key === "+" || e.key === "=") redimensionar(img, Recorte.achar(ultimaId), 1.03);
      if (e.key === "-" || e.key === "_") redimensionar(img, Recorte.achar(ultimaId), 0.97);
    });

    roupasEl.addEventListener("dblclick", function (e) {
      var img = pecaSobMouse(e);
      if (!img) return;
      Recorte.vestirOuTirar(img.dataset.id);
      desenharTudo();
    });
  }

  /* ---------- MODO POSICIONAR (?posicionar): posição e tamanho no armário ---------- */
  if (POSICIONAR) {
    armario.classList.add("is-aberto");

    var painelPos = document.createElement("div");
    painelPos.style.cssText = "position:fixed;left:8px;bottom:8px;width:44vw;z-index:9999;" +
      "background:#111;color:#c8f000;font:12px/1.4 monospace;padding:8px 10px;border-radius:6px;";
    painelPos.innerHTML =
      '<div style="margin-bottom:6px;color:#fff">ARRASTE a peça para mover. RODA DO MOUSE sobre a peça ' +
      '(ou as teclas + e −) muda o tamanho. Depois clique em Copiar e cole no pecas.js no lugar do POSICAO.</div>' +
      '<button type="button" id="copiar-pos">Copiar</button>' +
      '<pre id="texto-pos" style="margin:6px 0 0;max-height:28vh;overflow:auto;white-space:pre-wrap"></pre>';
    document.body.appendChild(painelPos);
    var textoPos = document.getElementById("texto-pos");

    function larguraDe(p) {
      if (p.w) return p.w;
      var b = pecasEl.querySelector('[data-id="' + p.id + '"]');
      return b ? b.getBoundingClientRect().width / pecasEl.getBoundingClientRect().width * 100 : 0;
    }

    function atualizarPos() {
      var linhas = Recorte.PECAS.map(function (p) {
        return "    " + p.id + ": [" + p.x.toFixed(1) + ", " + p.y.toFixed(1) + ", " + larguraDe(p).toFixed(1) + "]";
      });
      textoPos.textContent = "  var POSICAO = {\n" + linhas.join(",\n") + "\n  };";
    }
    atualizarPos();

    document.getElementById("copiar-pos").addEventListener("click", function () {
      try { navigator.clipboard.writeText(textoPos.textContent); } catch (err) {}
    });

    var arrastando2 = null, ultima = null;

    function tamanho(b, p, fator) {
      p.w = Math.max(1, larguraDe(p) * fator);
      b.style.width = p.w + "%";
      atualizarPos();
    }

    pecasEl.addEventListener("pointerdown", function (e) {
      var b = e.target.closest(".gr__peca");
      if (!b) return;
      var p = Recorte.achar(b.dataset.id);
      if (!p) return;
      e.preventDefault();
      pecasEl.setPointerCapture(e.pointerId);
      arrastando2 = { b: b, p: p, x0: e.clientX, y0: e.clientY, px: p.x, py: p.y,
                      r: pecasEl.getBoundingClientRect() };
      ultima = arrastando2;
    });
    pecasEl.addEventListener("pointermove", function (e) {
      if (!arrastando2) return;
      var a = arrastando2;
      a.p.x = a.px + (e.clientX - a.x0) / a.r.width * 100;
      a.p.y = a.py + (e.clientY - a.y0) / a.r.height * 100;
      a.b.style.left = a.p.x + "%";
      a.b.style.top = a.p.y + "%";
      atualizarPos();
    });
    pecasEl.addEventListener("pointerup", function () { arrastando2 = null; });

    pecasEl.addEventListener("wheel", function (e) {
      var b = e.target.closest(".gr__peca");
      if (!b) return;
      e.preventDefault();
      ultima = { b: b, p: Recorte.achar(b.dataset.id) };
      tamanho(b, ultima.p, e.deltaY < 0 ? 1.05 : 0.95);
    }, { passive: false });

    document.addEventListener("keydown", function (e) {
      if (!ultima) return;
      if (e.key === "+" || e.key === "=") tamanho(ultima.b, ultima.p, 1.03);
      if (e.key === "-" || e.key === "_") tamanho(ultima.b, ultima.p, 0.97);
    });
  }

  /* ---------- MODO POSICIONAR COLEÇÃO (?posicionar-colecao) ---------- */
  if (POSICIONAR_COL) {
    armario.classList.add("is-aberto");

    var painelCol = document.createElement("div");
    painelCol.style.cssText = "position:fixed;left:8px;bottom:8px;width:44vw;z-index:9999;" +
      "background:#111;color:#c8f000;font:12px/1.4 monospace;padding:8px 10px;border-radius:6px;";
    painelCol.innerHTML =
      '<div style="margin-bottom:6px;color:#fff">Clique numa COLEÇÃO e depois ARRASTE as peças. ' +
      'RODA DO MOUSE sobre a peça (ou as teclas + e −) muda o tamanho. Ao mexer numa peça, todas as peças ' +
      'daquela coleção ficam livres. Clique em Copiar e cole no guarda-roupa.js no lugar do POSICAO_COLECAO.</div>' +
      '<button type="button" id="copiar-col">Copiar</button>' +
      '<pre id="texto-col" style="margin:6px 0 0;max-height:28vh;overflow:auto;white-space:pre-wrap"></pre>';
    document.body.appendChild(painelCol);
    var textoCol = document.getElementById("texto-col");

    function atualizarCol() {
      var ids = Object.keys(POSICAO_COLECAO).sort();
      var linhas = ids.map(function (id) {
        var c = POSICAO_COLECAO[id];
        return "    " + id + ": [" + c[0].toFixed(1) + ", " + c[1].toFixed(1) + ", " + c[2].toFixed(1) + "]";
      });
      textoCol.textContent = "  var POSICAO_COLECAO = {\n" + linhas.join(",\n") + "\n  };";
    }
    atualizarCol();

    document.getElementById("copiar-col").addEventListener("click", function () {
      try { navigator.clipboard.writeText(textoCol.textContent); } catch (err) {}
    });

    /* passa todas as peças visíveis da coleção para posição própria (nada pula de lugar) */
    function congelarColecao() {
      var rp = pecasEl.getBoundingClientRect();
      [].forEach.call(pecasEl.querySelectorAll(".gr__peca"), function (b) {
        if (POSICAO_COLECAO[b.dataset.id]) return;
        POSICAO_COLECAO[b.dataset.id] = [
          parseFloat(b.style.left),
          parseFloat(b.style.top),
          b.getBoundingClientRect().width / rp.width * 100
        ];
      });
    }

    var arrCol = null, ultimaCol = null;

    function tamanhoCol(u, fator) {
      u.c[2] = Math.max(1, u.c[2] * fator);
      u.b.style.width = u.c[2] + "%";
      atualizarCol();
    }

    pecasEl.addEventListener("pointerdown", function (e) {
      var b = e.target.closest(".gr__peca");
      if (!b || !colecaoAtual) return;          /* só funciona com uma coleção escolhida */
      e.preventDefault();
      congelarColecao();
      var c = POSICAO_COLECAO[b.dataset.id];
      pecasEl.setPointerCapture(e.pointerId);
      arrCol = { b: b, c: c, x0: e.clientX, y0: e.clientY, cx: c[0], cy: c[1],
                 r: pecasEl.getBoundingClientRect() };
      ultimaCol = arrCol;
      atualizarCol();
    });
    pecasEl.addEventListener("pointermove", function (e) {
      if (!arrCol) return;
      var a = arrCol;
      a.c[0] = a.cx + (e.clientX - a.x0) / a.r.width * 100;
      a.c[1] = a.cy + (e.clientY - a.y0) / a.r.height * 100;
      a.b.style.left = a.c[0] + "%";
      a.b.style.top = a.c[1] + "%";
      atualizarCol();
    });
    pecasEl.addEventListener("pointerup", function () { arrCol = null; });

    pecasEl.addEventListener("wheel", function (e) {
      var b = e.target.closest(".gr__peca");
      if (!b || !colecaoAtual) return;
      e.preventDefault();
      congelarColecao();
      ultimaCol = { b: b, c: POSICAO_COLECAO[b.dataset.id] };
      tamanhoCol(ultimaCol, e.deltaY < 0 ? 1.05 : 0.95);
    }, { passive: false });

    document.addEventListener("keydown", function (e) {
      if (!ultimaCol) return;
      if (e.key === "+" || e.key === "=") tamanhoCol(ultimaCol, 1.03);
      if (e.key === "-" || e.key === "_") tamanhoCol(ultimaCol, 0.97);
    });
  }

   /* ---------- abrir e fechar ---------- */
  function abrir() {
    if (armario.classList.contains("is-aberto")) return;
    mostrarTodas();
    armario.classList.add("is-aberto");
    somPorta(true);
  }

  function fechar() {
    if (!armario.classList.contains("is-aberto")) return;
    armario.classList.remove("is-aberto");
    mostrarTodas();
    somPorta(false);
  }

  document.getElementById("abrir").addEventListener("click", abrir);
  document.getElementById("fechar").addEventListener("click", fechar);

  /* reiniciar: tira todas as roupas do manequim e devolve ao guarda-roupa */
  document.getElementById("reiniciar").addEventListener("click", function () {
    Recorte.despir();
    desenharTudo();
  });

  /* reiniciar jogo completo: apaga todo o progresso para um novo jogador */
  document.getElementById("reiniciar-tudo").addEventListener("click", function () {
    if (!confirm("Reiniciar o jogo completo? Todas as peças voltam a ficar bloqueadas.")) return;
    Recorte.reiniciar();
    if (armario.classList.contains("is-aberto")) fechar();
    mostrarTodas();
    desenharTudo();
  });

  /* ---------- botões das coleções (clicar de novo volta a mostrar todas) ---------- */
  function marcarAtiva() {
    abas.forEach(function (x) {
      x.classList.toggle("is-ativa", x.getAttribute("data-colecao") === colecaoAtual);
    });
  }

  /* volta para a vista com todas as coleções */
  function mostrarTodas() {
    colecaoAtual = null;
    marcarAtiva();
    desenharPecas();
  }

  abas.forEach(function (a) {
    a.addEventListener("click", function () {
      var c = a.getAttribute("data-colecao");
      colecaoAtual = (colecaoAtual === c) ? null : c;
      marcarAtiva();
      desenharPecas();
    });
  });

    /* pré-carrega todas as imagens uma vez: depois, vestir e tirar peças é instantâneo */
  function precarregarTudo() {
    Recorte.PECAS.forEach(function (p) {
      carregarComReserva(new Image(), [p.lado, p.frente, DIR_IMG + p.id + "@4x.png"]);                 /* armário, liberada */
      if (!p.inicial)                                                                                    /* iniciais nunca aparecem bloqueadas */
        carregarComReserva(new Image(), [p.preta, p.lado, p.frente, DIR_IMG + p.id + "@4x.png"]);      /* armário, bloqueada */
      carregarComReserva(new Image(), [p.frente, DIR_IMG + p.id + "@4x.png", p.lado]);                 /* manequim */
    });
  }
  
  precarregarTudo();

  aoCarregar(armarioImg, desenharTudo);
  aoCarregar(corpoImg, desenharTudo);
  desenharTudo();
})();

/* nome da peça ao passar o mouse: aviso branco com borda preta */
(function () {
  var armario = document.getElementById("armario");
  if (!armario || !window.Recorte) return;

  var dica = document.createElement("div");
  dica.setAttribute("aria-hidden", "true");
  dica.style.cssText =
    "position:fixed;z-index:9998;pointer-events:none;display:none;padding:.45vw 1vw;" +
    "background:#fff;color:#000;border:.18vw solid #000;" +
    "font:700 .95vw/1.3 Montserrat,sans-serif;white-space:nowrap";
  document.body.appendChild(dica);

  /* esconde o aviso antigo "Peça bloqueada", para ficar só um */
  function esconderAntigo() {
    var alvos = [].slice.call(document.body.children).concat([].slice.call(armario.querySelectorAll("*")));
    alvos.forEach(function (el) {
      if (el === dica) return;
      if (el.textContent.trim() === "Peça bloqueada") {
        el.style.setProperty("display", "none", "important");
      }
    });
  }
  esconderAntigo();
  new MutationObserver(esconderAntigo).observe(document.body, { childList: true });
  new MutationObserver(esconderAntigo).observe(armario, { childList: true, subtree: true });

  function acharPeca(el) {
    var lista = Recorte.PECAS.slice().sort(function (a, b) { return b.id.length - a.id.length; });
    for (var n = 0; el && el !== armario && n < 6; n++, el = el.parentElement) {
      var txt = [
        el.getAttribute("src"), el.getAttribute("data-id"), el.getAttribute("data-peca"),
        el.getAttribute("alt"), el.getAttribute("aria-label"), getComputedStyle(el).backgroundImage
      ].join(" ");
      if (el.dataset) Object.keys(el.dataset).forEach(function (k) { txt += " " + el.dataset[k]; });
      for (var i = 0; i < lista.length; i++) {
        if (txt.indexOf(lista[i].id) > -1) return lista[i];
      }
    }
    return null;
  }

  armario.addEventListener("mousemove", function (e) {
    var dentro = e.target.closest && e.target.closest("#pecas");
    var p = dentro ? acharPeca(e.target) : null;
    if (!p) { dica.style.display = "none"; return; }
    var bloqueada = !Recorte.estaDesbloqueada(p.id);
    dica.innerHTML = p.nome + (bloqueada ? "<br>Peça bloqueada" : "");
    dica.style.left = e.clientX + 16 + "px";
    dica.style.top = e.clientY + 16 + "px";
    dica.style.display = "block";
  });
  armario.addEventListener("mouseleave", function () { dica.style.display = "none"; });
})();