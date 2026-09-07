/* ============================================================
   EVENT. — skrypty interfejsu
   - menu mobilne (hamburger + overlay)
   - slider hero (autoplay, strzałki, kropki, pauza na hover)
   - modal newslettera
   - obsługa formularzy demo (bez backendu)
   ============================================================ */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* --- wideo w tle: autoplay na mobile + łagodny fallback ---
     Na telefonach (iOS Safari, Chrome z oszczędzaniem danych) autoplay bywa
     blokowany do pierwszego gestu. Próbujemy odtworzyć od razu, potem po
     pierwszym dotknięciu / scrollu. Jeśli i to się nie uda (np. tryb
     oszczędzania energii) — usuwamy <video>, żeby nie wisiał trójkąt "play". */
  (function initBgVideo() {
    var v = document.querySelector(".page-bg__video");
    if (!v) return;

    if (reduceMotion) {
      v.removeAttribute("autoplay");
      try { v.pause(); } catch (e) {}
      return;
    }

    v.muted = true;
    v.defaultMuted = true;
    v.setAttribute("muted", "");
    v.playsInline = true;
    v.setAttribute("playsinline", "");
    v.setAttribute("webkit-playsinline", "");

    var gestureEvents = ["touchstart", "pointerdown", "click", "scroll", "keydown"];

    function tryPlay() {
      var p = v.play();
      if (p && typeof p.then === "function") {
        p.then(unbindGesture).catch(bindGesture);
      }
    }
    function onGesture() {
      unbindGesture();
      var p = v.play();
      if (p && typeof p.then === "function") {
        p.catch(function () {
          // po realnym geście nadal nie gra -> nie ma jak; usuń, by nie było trójkąta
          if (v.paused && v.currentTime === 0 && v.parentNode) {
            v.parentNode.removeChild(v);
          }
        });
      }
    }
    function bindGesture() {
      gestureEvents.forEach(function (ev) {
        window.addEventListener(ev, onGesture, { once: true, passive: true });
      });
    }
    function unbindGesture() {
      gestureEvents.forEach(function (ev) {
        window.removeEventListener(ev, onGesture);
      });
    }

    // Źródło jako data:URI (wersja jednoplikowa) -> zamień na Blob URL: iOS
    // znacznie stabilniej odtwarza wtedy wideo w pętli.
    var srcEl = v.querySelector("source");
    var rawSrc = (srcEl && srcEl.getAttribute("src")) || v.getAttribute("src") || "";
    if (rawSrc.slice(0, 5) === "data:") {
      try {
        var comma = rawSrc.indexOf(",");
        var meta = rawSrc.slice(5, comma);
        var mime = meta.split(";")[0] || "video/mp4";
        var bin = atob(rawSrc.slice(comma + 1));
        var bytes = new Uint8Array(bin.length);
        for (var i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
        var url = URL.createObjectURL(new Blob([bytes], { type: mime }));
        if (srcEl) v.removeChild(srcEl);
        v.src = url;
        v.load();
      } catch (e) {}
    }

    document.addEventListener("visibilitychange", function () {
      if (!document.hidden && v.parentNode) v.play().catch(function () {});
    });

    if (v.readyState >= 2) tryPlay();
    else v.addEventListener("loadeddata", tryPlay, { once: true });
    // dodatkowa próba po pełnym załadowaniu strony
    window.addEventListener("load", tryPlay, { once: true });
  })();

  /* --- rok w stopce --- */
  document.querySelectorAll("[data-year]").forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });

  /* --- menu mobilne --- */
  var navToggle = document.querySelector(".nav-toggle");
  var navOverlay = document.getElementById("nav-overlay");

  function openNav() {
    if (!navOverlay) return;
    navOverlay.hidden = false;
    document.body.classList.add("no-scroll");
    if (navToggle) navToggle.setAttribute("aria-expanded", "true");
    var focusable = navOverlay.querySelector("a, button");
    if (focusable) focusable.focus();
  }
  function closeNav() {
    if (!navOverlay) return;
    navOverlay.hidden = true;
    document.body.classList.remove("no-scroll");
    if (navToggle) {
      navToggle.setAttribute("aria-expanded", "false");
      navToggle.focus();
    }
  }
  if (navToggle) navToggle.addEventListener("click", openNav);
  if (navOverlay) {
    navOverlay.addEventListener("click", function (e) {
      if (e.target.matches("[data-close]") || e.target === navOverlay) closeNav();
    });
    navOverlay.querySelectorAll("nav a").forEach(function (a) {
      a.addEventListener("click", closeNav);
    });
  }

  /* --- modale --- */
  function openModal(id) {
    var m = document.getElementById(id);
    if (!m) return;
    m.hidden = false;
    document.body.classList.add("no-scroll");
    var focusable = m.querySelector("input, button");
    if (focusable) focusable.focus();
  }
  function closeModal(m) {
    m.hidden = true;
    document.body.classList.remove("no-scroll");
  }
  document.querySelectorAll("[data-open-modal]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      openModal(btn.getAttribute("data-open-modal"));
    });
  });
  document.querySelectorAll(".modal").forEach(function (m) {
    m.addEventListener("click", function (e) {
      if (e.target.matches("[data-close]") || e.target.matches(".modal__backdrop")) closeModal(m);
    });
  });
  document.addEventListener("keydown", function (e) {
    if (e.key !== "Escape") return;
    document.querySelectorAll(".modal:not([hidden])").forEach(closeModal);
    if (navOverlay && !navOverlay.hidden) closeNav();
  });

  /* --- formularze demo --- */
  document.querySelectorAll("[data-demo-form]").forEach(function (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }
      var success = form.parentNode.querySelector(".form-success");
      form.hidden = true;
      if (success) {
        success.hidden = false;
        success.setAttribute("tabindex", "-1");
        success.focus();
      }
    });
  });

  /* --- slider hero --- */
  document.querySelectorAll("[data-slider]").forEach(function (slider) {
    var track = slider.querySelector(".slider__track");
    var slides = Array.prototype.slice.call(slider.querySelectorAll(".slide"));
    if (!track || slides.length < 2) return;

    var dotsWrap = slider.querySelector(".slider__dots");
    var prevBtn = slider.querySelector("[data-prev]");
    var nextBtn = slider.querySelector("[data-next]");
    var interval = parseInt(slider.getAttribute("data-interval"), 10) || 5000;
    var index = 0;
    var timer = null;

    var dots = slides.map(function (_, i) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "dot";
      b.setAttribute("aria-label", "Slajd " + (i + 1));
      b.addEventListener("click", function () {
        go(i);
        restart();
      });
      if (dotsWrap) dotsWrap.appendChild(b);
      return b;
    });

    function go(i) {
      index = (i + slides.length) % slides.length;
      track.style.transform = "translateX(" + -index * 100 + "%)";
      dots.forEach(function (d, di) {
        d.classList.toggle("is-active", di === index);
      });
    }
    function start() {
      if (reduceMotion) return;
      stop();
      timer = window.setInterval(function () {
        go(index + 1);
      }, interval);
    }
    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }
    function restart() {
      stop();
      start();
    }

    if (prevBtn)
      prevBtn.addEventListener("click", function () {
        go(index - 1);
        restart();
      });
    if (nextBtn)
      nextBtn.addEventListener("click", function () {
        go(index + 1);
        restart();
      });
    slider.addEventListener("mouseenter", stop);
    slider.addEventListener("mouseleave", start);
    slider.addEventListener("focusin", stop);
    slider.addEventListener("focusout", start);

    go(0);
    start();
  });
})();
