/**
 * Tropisch Tours and Travel — Site framework
 * Navigation, header behaviour, active links
 */

(function () {
  "use strict";

  const header = document.querySelector(".site-header");
  const navToggle = document.querySelector(".nav-toggle");
  const mainNav = document.querySelector(".main-nav");

  function setNavOpen(isOpen) {
    if (!navToggle || !mainNav) return;

    mainNav.classList.toggle("open", isOpen);
    navToggle.classList.toggle("active", isOpen);
    navToggle.setAttribute("aria-expanded", String(isOpen));

    if (header) {
      header.classList.toggle("nav-open", isOpen);
    }

    document.body.style.overflow = isOpen ? "hidden" : "";
  }

  function closeNav() {
    setNavOpen(false);
  }

  if (navToggle && mainNav) {
    navToggle.addEventListener("click", function () {
      setNavOpen(!mainNav.classList.contains("open"));
    });

    mainNav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", closeNav);
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && mainNav.classList.contains("open")) {
        closeNav();
        navToggle.focus();
      }
    });
  }

  if (header) {
    window.addEventListener("scroll", function () {
      header.classList.toggle("scrolled", window.scrollY > 20);
    });
  }

  const currentPage = window.location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".main-nav a").forEach(function (link) {
    const href = link.getAttribute("href");
    if (href === currentPage || (currentPage === "" && href === "index.html")) {
      link.classList.add("active");
    }
  });

  const heroCarousel = document.querySelector(".hero__carousel");
  if (heroCarousel) {
    const slides = heroCarousel.querySelectorAll(".hero__slide");
    if (slides.length > 1) {
      let activeIndex = 0;
      let timerId = null;
      const intervalMs = 3500;
      const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      function showSlide(index) {
        slides[activeIndex].classList.remove("is-active");
        activeIndex = index;
        slides[activeIndex].classList.add("is-active");
      }

      function advanceSlide() {
        showSlide((activeIndex + 1) % slides.length);
      }

      if (!reducedMotion) {
        timerId = window.setInterval(advanceSlide, intervalMs);
      }

      document.addEventListener("visibilitychange", function () {
        if (reducedMotion || !timerId) return;
        if (document.hidden) {
          window.clearInterval(timerId);
          timerId = null;
        } else {
          timerId = window.setInterval(advanceSlide, intervalMs);
        }
      });
    }
  }
})();
