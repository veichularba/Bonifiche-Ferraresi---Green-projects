const pulsantebio = document.getElementById("btn-biodiversita");
const schedabio = document.getElementById("card-biodiversita");

const pulsantesos = document.getElementById("btn-sostenibilitàambientale");
const schedasos = document.getElementById("card-sostenibilitàambientale");

const pulsantetra = document.getElementById("btn-tracciabilità");
const schedatra = document.getElementById("card-tracciabilità");

const pulsantecap = document.getElementById("btn-capitaleumano");
const schedacap = document.getElementById("card-capitaleumano");

const pulsantecom = document.getElementById("btn-comunitàterritorio");
const schedacom = document.getElementById("card-comunitàterritorio");

pulsantebio.addEventListener("click", function () {
  schedabio.classList.toggle("visibile");
});

pulsantesos.addEventListener("click", function () {
  schedasos.classList.toggle("visibile");
});

pulsantetra.addEventListener("click", function () {
  schedatra.classList.toggle("visibile");
});

pulsantecap.addEventListener("click", function () {
  schedacap.classList.toggle("visibile");
});

pulsantecom.addEventListener("click", function () {
  schedacom.classList.toggle("visibile");
});

const pulsantiAttivita = document.querySelectorAll(" .btn-attivita");

pulsantiAttivita.forEach(function (pulsanteAttivita) {
  pulsanteAttivita.addEventListener("click", function () {
    const contenut0 = pulsanteAttivita
      .closest(".attività")
      .querySelector(".contenuto-attivita");

    contenut0.classList.toggle("visibile");
  });
});
