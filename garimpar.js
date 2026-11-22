// Faixa em loop infinito: repete a lista até cobrir qualquer largura de tela
const VELOCIDADE = 50; // pixels por segundo (maior = mais rápido)

const trilho = document.querySelector(".faixa__trilho");
if (trilho) {
  const originais = Array.from(trilho.children);

  function copiar() {
    originais.forEach(function (item) {
      const c = item.cloneNode(true);
      c.setAttribute("aria-hidden", "true");
      trilho.appendChild(c);
    });
  }

  function montar() {
    const passo = trilho.scrollWidth;
    const m = Math.max(1, Math.ceil(window.innerWidth / passo) + 1);
    for (let i = 1; i < 2 * m; i++) copiar();
    trilho.style.setProperty("--duracao", (m * passo) / VELOCIDADE + "s");
  }

  window.addEventListener("load", function () {
    (document.fonts ? document.fonts.ready : Promise.resolve()).then(montar);
  });
}

// "Ir ao manequim": rolagem suave com duração própria
(function () {
  var botao = document.querySelector(".ir-manequim");
  var alvo = document.getElementById("manequim");
  if (!botao || !alvo) return;

  var DURACAO = 1200; // ms: aumente para mais lento

  // começa e termina devagar
  function suave(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  botao.addEventListener("click", function (e) {
    // com "reduzir movimento" ligado, deixa o pulo normal


    e.preventDefault();
    var html = document.documentElement;
    var cab = parseFloat(getComputedStyle(html).getPropertyValue("--altura-cabecalho")) || 0;
    var inicio = window.scrollY;
    var fim = alvo.getBoundingClientRect().top + inicio - cab;
    var t0 = performance.now();

    html.style.scrollBehavior = "auto"; // evita conflito com o smooth do CSS

    function passo(agora) {
      var p = Math.min((agora - t0) / DURACAO, 1);
      window.scrollTo(0, inicio + (fim - inicio) * suave(p));
      if (p < 1) {
        requestAnimationFrame(passo);
      } else {
        html.style.scrollBehavior = "";
      }
    }
    requestAnimationFrame(passo);
  });
})();