// Rodapé: no hover da tesoura a tesoura abre e o RE.CORTE troca para a versão cortada
(function () {
  var rodape = document.getElementById("rodape");
  if (!rodape) return;

  rodape.querySelectorAll(".rodape__alvo--tesoura").forEach(function (alvo) {
    alvo.addEventListener("mouseenter", function () { rodape.classList.add("rodape--corte"); });
    alvo.addEventListener("mouseleave", function () { rodape.classList.remove("rodape--corte"); });
  });
})();