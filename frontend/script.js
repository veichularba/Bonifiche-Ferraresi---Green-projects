console.log("SCRIPT CARICATO");
/* Gestione dell'apertura dei dettagli delle attività */

const pulsantiAttivita = document.querySelectorAll(".btn-attivita");

pulsantiAttivita.forEach(function (pulsanteAttivita) {
  pulsanteAttivita.addEventListener("click", function () {
    const contenuto = pulsanteAttivita.closest(".attività").querySelector(".contenuto-attivita");

    contenuto.classList.toggle("visibile");
  });
});

/* =========================================
   POPUP CON ANIMAZIONE DI ESPANSIONE
   ========================================= */

const popup = document.getElementById("popup-attivita");
const contenutoPopup = document.getElementById("contenuto-popup");
const chiudiPopup = document.getElementById("chiudi-popup");

const collegamentiAttivita = document.querySelectorAll(".menu-gruppo a");

const durataAnimazione = 500;
let elementoOrigine = null;
let posizioneOrigine = null;
let animazionePopup = null;
let popupAperto = false;
let chiusuraInCorso = false;

/* Calcola la trasformazione dal collegamento al fullscreen */
function trasformazioneOrigine(elemento) {
  const rettangolo = elemento.getBoundingClientRect();

  const scalaX = Math.max(rettangolo.width / window.innerWidth, 0.001);
  const scalaY = Math.max(rettangolo.height / window.innerHeight, 0.001);

  return `translate(${rettangolo.left}px, ${rettangolo.top}px) scale(${scalaX}, ${scalaY})`;
}

/* Apertura */
collegamentiAttivita.forEach(function (collegamento) {
  collegamento.addEventListener("click", function (evento) {
    evento.preventDefault();

    if (popupAperto || chiusuraInCorso) return;

    elementoOrigine = collegamento;
    posizioneOrigine = trasformazioneOrigine(collegamento);
    popupAperto = true;

    contenutoPopup.src = collegamento.getAttribute("href");

    popup.style.visibility = "visible";
    popup.classList.add("aperto");
    popup.setAttribute("aria-hidden", "false");

    const partenza = posizioneOrigine;

    if (animazionePopup) animazionePopup.cancel();

    animazionePopup = popup.animate(
      [
        { transform: partenza, opacity: 0.5, borderRadius: "12px" },
        { transform: "translate(0, 0) scale(1)", opacity: 1, borderRadius: "0px" },
      ],
      {
        duration: durataAnimazione,
        easing: "cubic-bezier(0.22, 1, 0.36, 1)",
        fill: "both",
      },
    );

    animazionePopup.finished
      .then(function () {
        animazionePopup = null;
        chiudiPopup.focus();
      })
      .catch(function () {});
  });
});

/* Chiusura con animazione inversa */
function chiudiScheda() {
  if (!popupAperto || chiusuraInCorso) return;

  chiusuraInCorso = true;

  if (animazionePopup) {
    animazionePopup.cancel();
    animazionePopup = null;
  }

  const destinazione = posizioneOrigine || "translate(0, 0) scale(0.01)";

  const valoriOrigine = posizioneOrigine.match(
    /translate\(([-\d.]+)px,\s*([-\d.]+)px\)\s*scale\(([-\d.]+),\s*([-\d.]+)\)/,
  );

  const centroX = valoriOrigine
    ? Number(valoriOrigine[1]) + (window.innerWidth * Number(valoriOrigine[3])) / 2
    : window.innerWidth / 2;

  const centroY = valoriOrigine
    ? Number(valoriOrigine[2]) + (window.innerHeight * Number(valoriOrigine[4])) / 2
    : window.innerHeight / 2;

  const trasformazionePunto = `translate(${centroX}px, ${centroY}px) scale(0.0001)`;

  const animazioneChiusura = popup.animate(
    [
      {
        transform: "translate(0, 0) scale(1)",
        opacity: 1,
        borderRadius: "0px",
        offset: 0,
      },
      {
        transform: destinazione,
        opacity: 1,
        borderRadius: "12px",
        offset: 0.7,
      },
      {
        transform: trasformazionePunto,
        opacity: 0,
        borderRadius: "50%",
        offset: 1,
      },
    ],
    {
      duration: 550,
      easing: "ease-in-out",
      fill: "both",
    },
  );

  animazioneChiusura.finished
    .then(function () {
      popup.classList.remove("aperto");
      popup.style.visibility = "hidden";
      popup.setAttribute("aria-hidden", "true");

      contenutoPopup.removeAttribute("src");

      popupAperto = false;
      chiusuraInCorso = false;

      if (elementoOrigine) {
        elementoOrigine.focus();
      }

      elementoOrigine = null;
      posizioneOrigine = null;

      animazioneChiusura.cancel();
    })
    .catch(function () {
      chiusuraInCorso = false;
    });
}

/* Pulsante X */
chiudiPopup.addEventListener("click", chiudiScheda);

/* Tasto ESC */
document.addEventListener("keydown", function (evento) {
  if (evento.key === "Escape" && popupAperto) {
    chiudiScheda();
  }
});

/* Apertura e chiusura dei cinque menu botanici */

const gruppiBotanici = document.querySelectorAll(".pentagono > div[class^='gruppo-']");

gruppiBotanici.forEach((gruppoBotanico) => {
  const menuBotanico = gruppoBotanico.querySelector(".menu-botanico");

  if (!menuBotanico) return;

  let animazioniBotaniche = [];
  let timerChiusuraBotanica;
  let menuAperto = false;

  function creaAnimazioniBotaniche() {
    // Menu completo
    animazioniBotaniche.push(
      menuBotanico.animate(
        [
          { opacity: 0, scale: 0.94 },
          { opacity: 1, scale: 1 },
        ],
        {
          duration: 450,
          easing: "ease-out",
          fill: "both",
          paused: true,
        },
      ),
    );

    // Cornice e rami
    const elementiDisegnati = [
      [".bordo-legno", 1200, 750, 0],
      [".ramo-uno", 400, 850, 0],
      [".ramo-due", 400, 850, 180],
    ];

    elementiDisegnati.forEach(([selettore, distanza, durata, ritardo]) => {
      const elemento = menuBotanico.querySelector(selettore);
      if (!elemento) return;

      animazioniBotaniche.push(
        elemento.animate([{ strokeDashoffset: distanza }, { strokeDashoffset: 0 }], {
          duration: durata,
          delay: ritardo,
          easing: "ease-out",
          fill: "both",
          paused: true,
        }),
      );
    });

    // Foglie
    const ritardiFoglie = [300, 420, 540, 650, 760, 870];

    ritardiFoglie.forEach((ritardo, indice) => {
      const foglia = menuBotanico.querySelector(`.foglia-${indice + 1}`);

      if (!foglia) return;

      animazioniBotaniche.push(
        foglia.animate([{ opacity: 0 }, { opacity: 1 }], {
          duration: 450,
          delay: ritardo,
          easing: "ease-out",
          fill: "both",
          paused: true,
        }),
      );
    });
  }

  function apriMenuBotanico() {
    clearTimeout(timerChiusuraBotanica);

    menuBotanico.classList.add("botanico-visibile");
    menuBotanico.style.visibility = "visible";
    menuBotanico.style.pointerEvents = "auto";

    if (!animazioniBotaniche.length) {
      creaAnimazioniBotaniche();
    }

    animazioniBotaniche.forEach((animazione) => {
      animazione.playbackRate = 1;
      animazione.play();
    });

    menuAperto = true;
  }

  function chiudiMenuBotanico() {
    if (!menuAperto) return;

    menuBotanico.style.pointerEvents = "none";

    animazioniBotaniche.forEach((animazione) => {
      animazione.reverse();
    });

    timerChiusuraBotanica = setTimeout(() => {
      menuBotanico.style.visibility = "hidden";
      menuBotanico.classList.remove("botanico-visibile");
      menuAperto = false;
    }, 1400);
  }

  gruppoBotanico.addEventListener("mouseenter", apriMenuBotanico);

  gruppoBotanico.addEventListener("mouseleave", chiudiMenuBotanico);

  gruppoBotanico.addEventListener("focusin", apriMenuBotanico);

  gruppoBotanico.addEventListener("focusout", (event) => {
    if (!gruppoBotanico.contains(event.relatedTarget)) {
      chiudiMenuBotanico();
    }
  });
});
