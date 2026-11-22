// legendas.js: barra de legenda com o alt da imagem sob o cursor
(function () {
  function iniciar() {
    // evita rodar duas vezes na mesma página
    if (document.querySelector(".legenda")) return;

  var estilo = document.createElement("style");
    estilo.textContent = [
      ".legenda{",
      "  position:fixed; left:0; bottom:0;",
      "  width:max-content; max-width:min(40vw, 32rem);",
      "  padding:.55rem 1rem .55rem .9rem;",
      "  background:#000; color:#fff;",
      "  border-top-right-radius:10px;",
      "  font-family:'Montserrat',sans-serif; font-weight:800;",
      "  font-size:clamp(.8rem,.9vw,.95rem); line-height:1.3;",
      "  text-align:left;",
      "  pointer-events:none; z-index:99999;",
      "  translate:0 100%;",
      "  transition:translate .25s cubic-bezier(.22,1,.36,1);",
      "}",
      ".legenda--visivel{translate:0 0}",
      "@media (hover:none){.legenda{display:none}}",
      "@media (prefers-reduced-motion:reduce){.legenda{transition:none}}"
    ].join("");
    document.head.appendChild(estilo);

    var barra = document.createElement("div");
    barra.className = "legenda";
    barra.setAttribute("aria-hidden", "true");
    document.body.appendChild(barra);

    function esconder() { barra.classList.remove("legenda--visivel"); }

    document.addEventListener("pointerover", function (e) {
      if (e.pointerType === "touch") return;
      var img = e.target.closest && e.target.closest("img");
      var texto = img && img.getAttribute("alt");

      if (texto && texto.trim() && img.getAttribute("aria-hidden") !== "true") {
        barra.textContent = texto;
        barra.classList.add("legenda--visivel");
      } else {
        esconder();
      }
    });

    document.documentElement.addEventListener("pointerleave", esconder);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", iniciar);
  } else {
    iniciar();
  }
})();