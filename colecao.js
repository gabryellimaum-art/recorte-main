// Carrossel de fotos da coleção
(function () {
  var car = document.querySelector(".colecao__carrossel");
  if (!car) return;

  var slides = Array.from(car.querySelectorAll(".colecao__slide"));
  var botao = car.querySelector(".colecao__seta");
  var i = 0;

  function mostrar() {
    slides.forEach(function (s, n) {
      var ativo = n === i;
      s.classList.toggle("is-ativo", ativo);
      s.setAttribute("aria-hidden", ativo ? "false" : "true");
    });
        var ultimo = slides.length > 1 && i === slides.length - 1;
    botao.setAttribute("aria-label", ultimo ? "Voltar à primeira foto" : "Próxima foto");
  }

  botao.addEventListener("click", function () {
    i = (i + 1) % slides.length;
    mostrar();
  });

  mostrar();
})();

// Modo noturno (coleção Arretado): troca o ícone "i" e a seta do carrossel pelas versões noturnas
(function () {
  var raiz = document.documentElement;
  var TROCAS = {
    "icone-info@4x.png": "icone-infonoturno@4x.png",
    "icone-infopressionada@4x.png": "icone-infonoturnopressionada@4x.png",
    "setalaranja@4x.png": "setalaranjanoturno@4x.png",
    "setalaranjapressionada@4x.png": "setalaranjanoturnopressionada@4x.png"
  };

  var imgs = Array.from(document.querySelectorAll(".colecao__info img, .colecao__seta img"))
    .filter(function (img) {
      var src = img.getAttribute("src") || "";
      return src.indexOf("/arretado/") !== -1 && TROCAS[src.split("/").pop()];
    });
  if (!imgs.length) return;

  imgs.forEach(function (img) {
    img.dataset.srcClaro = img.getAttribute("src");
    // se a imagem noturna não for encontrada, volta para a original
    img.addEventListener("error", function () {
      if (img.getAttribute("src") !== img.dataset.srcClaro) img.setAttribute("src", img.dataset.srcClaro);
    });
  });

  function aplicar() {
    var escuro = raiz.getAttribute("data-tema") === "escuro";
    imgs.forEach(function (img) {
      var claro = img.dataset.srcClaro;
      var partes = claro.split("/");
      var arquivo = partes.pop();
      partes.push(escuro ? TROCAS[arquivo] : arquivo);
      img.setAttribute("src", partes.join("/"));
    });
  }

  aplicar();
  new MutationObserver(aplicar).observe(raiz, { attributes: true, attributeFilter: ["data-tema"] });
})();
