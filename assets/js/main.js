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

  /* --- wideo hero: zatrzymaj przy preferencji ograniczonego ruchu --- */
  if (reduceMotion) {
    document.querySelectorAll("video[autoplay]").forEach(function (v) {
      v.removeAttribute("autoplay");
      v.pause();
    });
  }

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
