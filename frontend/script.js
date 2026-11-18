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

const overlayPopup = document.getElementById("overlay-popup");
const popup = document.getElementById("popup-attivita");
const contenutoPopup = document.getElementById("contenuto-popup");
const chiudiPopup = document.getElementById("chiudi-popup");

const collegamentiAttivita = document.querySelectorAll(".menu-gruppo a");

const durataAnimazione = 500;

let elementoOrigine = null;
let popupAperto = false;
let chiusuraInCorso = false;
let animazionePopup = null;
let osservatoreContenuto = null;

/* Calcola la trasformazione dal collegamento alla finestra */
function trasformazioneOrigine(elemento) {
  const origine = elemento.getBoundingClientRect();
  const destinazione = popup.getBoundingClientRect();

  const scalaX = Math.max(origine.width / destinazione.width, 0.001);
  const scalaY = Math.max(origine.height / destinazione.height, 0.001);

  const spostamentoX = origine.left - destinazione.left;
  const spostamentoY = origine.top - destinazione.top;

  return `translate(${spostamentoX}px, ${spostamentoY}px) scale(${scalaX}, ${scalaY})`;
}

/* Adatta l'altezza dell'iframe al contenuto */
function aggiornaAltezzaPopup() {
  if (!popupAperto || chiusuraInCorso) return;

  try {
    const documento = contenutoPopup.contentDocument;
    if (!documento) return;

    const altezzaContenuto = Math.max(documento.body.scrollHeight, documento.documentElement.scrollHeight);

    const altezzaMassima = window.innerHeight * 0.9;

    contenutoPopup.style.height = `${Math.min(altezzaContenuto, altezzaMassima)}px`;

    documento.documentElement.style.overflow = "auto";
    documento.body.style.overflow = "auto";
  } catch (errore) {
    console.warn("Impossibile misurare il contenuto:", errore);
  }
}

/* Aggiorna la misura dopo il caricamento */
contenutoPopup.addEventListener("load", function () {
  if (osservatoreContenuto) {
    osservatoreContenuto.disconnect();
    osservatoreContenuto = null;
  }

  aggiornaAltezzaPopup();

  try {
    const documento = contenutoPopup.contentDocument;

    if (documento && documento.body) {
      osservatoreContenuto = new ResizeObserver(aggiornaAltezzaPopup);
      osservatoreContenuto.observe(documento.body);
    }
  } catch (errore) {
    console.warn("Osservazione contenuto non disponibile:", errore);
  }
});

/* Apertura */
collegamentiAttivita.forEach(function (collegamento) {
  collegamento.addEventListener("click", function (evento) {
    evento.preventDefault();

    if (popupAperto || chiusuraInCorso) return;

    elementoOrigine = collegamento;
    popupAperto = true;

    /* Memorizza la posizione prima di aprire il popup */
    const rettangoloOrigine = collegamento.getBoundingClientRect();

    /* Mantiene stabili i menu botanici */
    document.dispatchEvent(new Event("popup-aperto"));

    /* Nasconde i menu prima di modificare il focus */

    /* Il menu botanico rimane aperto dietro al popup */

    contenutoPopup.style.height = "300px";

    overlayPopup.style.removeProperty("pointer-events");
    overlayPopup.classList.add("aperto");
    overlayPopup.setAttribute("aria-hidden", "false");

    popup.classList.add("aperto");
    popup.setAttribute("aria-hidden", "false");

    contenutoPopup.src = collegamento.getAttribute("href");

    /* Calcola l'animazione usando la posizione memorizzata */
    const destinazionePopup = popup.getBoundingClientRect();

    const scalaX = Math.max(rettangoloOrigine.width / destinazionePopup.width, 0.001);
    const scalaY = Math.max(rettangoloOrigine.height / destinazionePopup.height, 0.001);

    const spostamentoX = rettangoloOrigine.left - destinazionePopup.left;
    const spostamentoY = rettangoloOrigine.top - destinazionePopup.top;

    const partenza = `translate(${spostamentoX}px, ${spostamentoY}px) scale(${scalaX}, ${scalaY})`;

    if (animazionePopup) animazionePopup.cancel();

    animazionePopup = popup.animate(
      [
        {
          transform: partenza,
          opacity: 0.5,
          borderRadius: "12px",
        },
        {
          transform: "translate(0, 0) scale(1)",
          opacity: 1,
          borderRadius: "16px",
        },
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

/* Chiusura */
function chiudiScheda() {
  if (!popupAperto || chiusuraInCorso) return;

  chiusuraInCorso = true;

  if (animazionePopup) {
    animazionePopup.cancel();
    animazionePopup = null;
  }

  if (osservatoreContenuto) {
    osservatoreContenuto.disconnect();
    osservatoreContenuto = null;
  }

  const destinazione = elementoOrigine ? trasformazioneOrigine(elementoOrigine) : "scale(0.01)";

  const animazioneChiusura = popup.animate(
    [
      {
        transform: "translate(0, 0) scale(1)",
        opacity: 1,
        borderRadius: "16px",
      },
      {
        transform: destinazione,
        opacity: 0,
        borderRadius: "12px",
      },
    ],
    {
      duration: 550,
      easing: "ease-in-out",
      fill: "both",
    },
  );

  overlayPopup.style.pointerEvents = "none";
  overlayPopup.classList.remove("aperto");

  animazioneChiusura.finished
    .then(function () {
      popup.classList.remove("aperto");
      popup.setAttribute("aria-hidden", "true");

      overlayPopup.setAttribute("aria-hidden", "true");

      contenutoPopup.removeAttribute("src");
      contenutoPopup.style.height = "300px";

      animazioneChiusura.cancel();

      // Ripristina il focus mentre il popup è ancora bloccato,
      // evitando che il focus riattivi un altro hover.
      if (elementoOrigine) {
        elementoOrigine.focus();
      }

      elementoOrigine = null;

      popupAperto = false;
      chiusuraInCorso = false;

      // Comunica ai menu che il popup è completamente chiuso.
      document.dispatchEvent(new Event("popup-pronto"));
    })
    .catch(function () {
      chiusuraInCorso = false;
    });
}

/* Chiusura tramite pulsante X */
chiudiPopup.addEventListener("click", chiudiScheda);

/* Chiusura tramite Escape */
document.addEventListener("keydown", function (evento) {
  if (evento.key === "Escape" && popupAperto) {
    chiudiScheda();
  }
});

/* Aggiornamento al ridimensionamento della finestra */
window.addEventListener("resize", aggiornaAltezzaPopup);

/* Apertura e chiusura dei cinque menu botanici */

const gruppiBotanici = document.querySelectorAll(".pentagono > div[class^='gruppo-']");

let menuBotanicoAttivo = null;

gruppiBotanici.forEach((gruppoBotanico) => {
  const menuBotanico = gruppoBotanico.querySelector(".menu-botanico");

  if (!menuBotanico) return;

  let animazioniBotaniche = [];
  let timerChiusuraBotanica;
  let menuAperto = false;
  let chiusuraMenuAvviata = false;

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
    if (popupAperto || chiusuraInCorso) return;

    // Un altro menu possiede già il controllo esclusivo.
    if (menuBotanicoAttivo && menuBotanicoAttivo !== gruppoBotanico) {
      return;
    }

    // Il primo menu acquisisce il controllo.
    menuBotanicoAttivo = gruppoBotanico;

    clearTimeout(timerChiusuraBotanica);

    /* Se il menu è già aperto, non riavvia le animazioni */

    if (menuAperto && !chiusuraMenuAvviata) {
      menuBotanico.style.pointerEvents = "auto";
      return;
    }

    chiusuraMenuAvviata = false;

    menuBotanico.style.removeProperty("visibility");
    menuBotanico.style.removeProperty("opacity");

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
    if (!menuAperto || popupAperto || chiusuraInCorso || chiusuraMenuAvviata) return;

    chiusuraMenuAvviata = true;
    menuBotanico.style.pointerEvents = "none";

    // Avvia la chiusura di tutte le animazioni.
    animazioniBotaniche.forEach((animazione) => {
      animazione.reverse();
    });

    // Aspetta la conclusione effettiva delle animazioni.
    Promise.all(animazioniBotaniche.map((animazione) => animazione.finished))
      .then(() => {
        // Se la chiusura è stata interrotta, non nasconde il menu.
        if (!chiusuraMenuAvviata || popupAperto || chiusuraInCorso) {
          return;
        }

        menuBotanico.style.visibility = "hidden";
        menuBotanico.classList.remove("botanico-visibile");

        menuAperto = false;
        chiusuraMenuAvviata = false;

        // Libera il controllo esclusivo.
        if (menuBotanicoAttivo === gruppoBotanico) {
          menuBotanicoAttivo = null;
        }

        // Controlla se il mouse è già sopra un altro vertice.
        document.dispatchEvent(new Event("botanico-libero"));
      })
      .catch(() => {
        // Un'animazione può essere interrotta o invertita.
        // In quel caso non completa una chiusura ormai annullata.
      });
  }

  /* Mantiene il menu aperto durante il popup */
  document.addEventListener("popup-aperto", function () {
    clearTimeout(timerChiusuraBotanica);

    if (!menuAperto) return;

    if (chiusuraMenuAvviata) {
      animazioniBotaniche.forEach((animazione) => {
        animazione.playbackRate = 1;
        animazione.play();
      });

      chiusuraMenuAvviata = false;
    }

    menuBotanico.style.visibility = "visible";
    menuBotanico.style.pointerEvents = "auto";
    menuBotanico.classList.add("botanico-visibile");
  });

  /* Controlla il menu botanico dopo la chiusura del popup */
  document.addEventListener("popup-pronto", function () {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        // Il popup deve essere completamente chiuso.
        if (popupAperto || chiusuraInCorso) return;

        // Solo il menu proprietario può decidere se rimanere aperto.
        if (menuBotanicoAttivo !== gruppoBotanico) return;

        // Il browser ha aggiornato lo stato hover.
        if (gruppoBotanico.matches(":hover")) {
          // Mouse nella zona valida: il menu rimane aperto.
          return;
        }

        // Mouse fuori dalla zona valida: chiusura normale.
        chiudiMenuBotanico();
      });
    });
  });

  gruppoBotanico.addEventListener("mouseenter", apriMenuBotanico);

  gruppoBotanico.addEventListener("mouseleave", chiudiMenuBotanico);

  gruppoBotanico.addEventListener("focusin", apriMenuBotanico);

  gruppoBotanico.addEventListener("focusout", (event) => {
    if (popupAperto || chiusuraInCorso) return;

    if (!gruppoBotanico.contains(event.relatedTarget)) {
      chiudiMenuBotanico();
    }
  });
});
