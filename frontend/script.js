console.log("SCRIPT CARICATO");

/* =========================================
   PARALLASSE DELLO SFONDO - VELOCITÀ 10%
   ========================================= */

const homepageParallasse = document.querySelector(".homepage");
const movimentoRidotto = window.matchMedia("(prefers-reduced-motion: reduce)");

if (homepageParallasse) {
  let aggiornamentoParallasse = false;

  function aggiornaParallasse() {
    const spostamento = movimentoRidotto.matches ? 0 : Math.min(window.scrollY * 0.6, 200);

    homepageParallasse.style.setProperty("--parallax-offset", `${spostamento}px`);

    aggiornamentoParallasse = false;
  }

  function richiediAggiornamentoParallasse() {
    if (aggiornamentoParallasse) return;

    aggiornamentoParallasse = true;
    requestAnimationFrame(aggiornaParallasse);
  }

  window.addEventListener("scroll", richiediAggiornamentoParallasse, {
    passive: true,
  });

  window.addEventListener("resize", richiediAggiornamentoParallasse);
  movimentoRidotto.addEventListener("change", richiediAggiornamentoParallasse);

  aggiornaParallasse();
}

/* =========================================
   FRECCIA INTELLIGENTE PER IL DOWNLOAD
   ========================================= */

const frecciaDownload = document.getElementById("freccia-download");
const pulsanteDownload = document.querySelector(".footer-link");

if (frecciaDownload && pulsanteDownload) {
  function aggiornaFrecciaDownload() {
    const rettangoloDownload = pulsanteDownload.getBoundingClientRect();

    const downloadVisibile = rettangoloDownload.top < window.innerHeight && rettangoloDownload.bottom > 0;

    const downloadPiuInBasso = rettangoloDownload.top >= window.innerHeight;

    const popupVisibile = document.querySelector(".overlay-popup.aperto") !== null;

    const menuMobileVisibile =
      window.matchMedia("(max-width: 600px)").matches &&
      document.querySelector("body > .menu-botanico.botanico-visibile") !== null;

    frecciaDownload.hidden = downloadVisibile || !downloadPiuInBasso || popupVisibile || menuMobileVisibile;
  }

  /* Aggiorna la freccia durante lo scorrimento */
  window.addEventListener("scroll", aggiornaFrecciaDownload, {
    passive: true,
  });

  /* Aggiorna la freccia quando cambia la dimensione della finestra */
  window.addEventListener("resize", aggiornaFrecciaDownload);

  /* Rileva apertura e chiusura di popup e menu botanici */
  const osservatoreFreccia = new MutationObserver(aggiornaFrecciaDownload);

  osservatoreFreccia.observe(document.body, {
    subtree: true,
    attributes: true,
    attributeFilter: ["class"],
  });

  /* Clic sulla freccia: raggiunge il pulsante PDF */
  frecciaDownload.addEventListener("click", function () {
    pulsanteDownload.scrollIntoView({
      behavior: movimentoRidotto.matches ? "instant" : "smooth",
      block: "center",
    });
  });

  /* Controllo iniziale */
  aggiornaFrecciaDownload();
}

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
    if (!documento || !documento.body || !documento.documentElement) return;

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

  // Non osservare l'iframe se il popup è chiuso o in chiusura.

  if (!popupAperto || chiusuraInCorso) return;

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

    /* Mantiene aperto il menu botanico dietro al popup */
    document.dispatchEvent(new Event("popup-aperto"));

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

    const animazioneApertura = animazionePopup;

    animazioneApertura.finished
      .then(function () {
        if (animazionePopup !== animazioneApertura) return;

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

const mediaMobile = window.matchMedia("(max-width: 600px)");

function isMobile() {
  return mediaMobile.matches;
}

// Ricarica la pagina soltanto quando cambia modalità desktop/mobile.
mediaMobile.addEventListener("change", function () {
  window.location.reload();
});

gruppiBotanici.forEach((gruppoBotanico) => {
  const menuBotanico = gruppoBotanico.querySelector(".menu-botanico");

  if (!menuBotanico) return;

  // Su smartphone apre il menu toccando il pulsante del pentagono.
  const pulsantePentagono = gruppoBotanico.querySelector("button");

  if (pulsantePentagono) {
    pulsantePentagono.addEventListener("click", () => {
      if (!isMobile()) return;
      apriMenuBotanico();
    });
  }

  function spostaMenuMobile() {
    if (!isMobile()) return;

    if (menuBotanico.parentElement !== document.body) {
      document.body.appendChild(menuBotanico);
    }
  }

  const pulsanteIndietro = document.createElement("button");
  pulsanteIndietro.type = "button";
  pulsanteIndietro.className = "indietro-botanico";
  pulsanteIndietro.textContent = "← Indietro";
  pulsanteIndietro.setAttribute("aria-label", "Torna al pentagono");

  menuBotanico.prepend(pulsanteIndietro);

  // Su smartphone chiude il menu e torna al pentagono.
  pulsanteIndietro.addEventListener("click", (evento) => {
    evento.preventDefault();
    evento.stopPropagation();

    if (!isMobile()) return;

    chiudiMenuBotanico();
  });
  let animazioniBotaniche = [];
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

    // Su smartphone porta il menu fuori dal pentagono.
    if (isMobile()) {
      spostaMenuMobile();
    }

    // Il primo menu acquisisce il controllo.
    menuBotanicoAttivo = gruppoBotanico;

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
    // La chiusura è più rapida dell'apertura.
    animazioniBotaniche.forEach((animazione) => {
      animazione.playbackRate = 1.5;
      animazione.reverse();
    });

    // Aspetta che il menu completo diventi invisibile.
    // Le animazioni decorative possono terminare successivamente.
    animazioniBotaniche[0].finished
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

        // Su smartphone il menu rimane sempre aperto.
        // Si chiude soltanto tramite il pulsante Indietro.
        if (isMobile()) return;

        // Sul desktop manteniamo il comportamento hover originale.
        if (gruppoBotanico.matches(":hover")) {
          // Mouse nella zona valida: il menu rimane aperto.
          return;
        }

        // Mouse fuori dalla zona valida: chiusura normale.
        chiudiMenuBotanico();
      });
    });
  });

  // Desktop: apre il menu quando il mouse entra nel vertice.
  gruppoBotanico.addEventListener("mouseenter", () => {
    if (isMobile()) return;
    apriMenuBotanico();
  });

  // Desktop: chiude il menu quando il mouse esce dal gruppo.
  gruppoBotanico.addEventListener("mouseleave", () => {
    if (isMobile()) return;
    chiudiMenuBotanico();
  });

  // Quando un altro menu libera il blocco, verifica se
  // il mouse si trova già nella zona hover di questo menu.
  // In modalità smartphone l'apertura avviene solo tramite clic.
  document.addEventListener("botanico-libero", function () {
    if (isMobile()) return;

    if (popupAperto || chiusuraInCorso) return;

    if (!menuBotanicoAttivo && gruppoBotanico.matches(":hover")) {
      apriMenuBotanico();
    }
  });

  gruppoBotanico.addEventListener("focusout", (event) => {
    if (isMobile()) return;
    if (popupAperto || chiusuraInCorso) return;

    // Se il mouse è ancora nella zona hover valida,
    // la perdita del focus non deve chiudere il menu.
    if (gruppoBotanico.matches(":hover")) return;

    // Chiude soltanto quando il focus esce dal gruppo
    // e il mouse non si trova nella zona hover.
    if (!gruppoBotanico.contains(event.relatedTarget)) {
      chiudiMenuBotanico();
    }
  });
});
