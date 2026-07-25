/**
 * Tropisch Tours and Travel — Page-specific scripts
 */

(function () {
  "use strict";

  /* Tour package carousels (tours page) */
  const tourCarouselIntervalMs = 3500;
  const tourCarouselReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  document.querySelectorAll("[data-tour-carousel]").forEach(function (carousel) {
    const slides = carousel.querySelectorAll(".tour-carousel__slide");
    const prevBtn = carousel.querySelector(".tour-carousel__btn--prev");
    const nextBtn = carousel.querySelector(".tour-carousel__btn--next");
    const dotsContainer = carousel.querySelector(".tour-carousel__dots");
    const statusEl = carousel.querySelector(".tour-carousel__status");
    const autoplay = carousel.dataset.carouselAutoplay !== "false";
    let activeIndex = 0;
    let timerId = null;

    if (slides.length < 2) {
      if (prevBtn) prevBtn.hidden = true;
      if (nextBtn) nextBtn.hidden = true;
      return;
    }

    function updateStatus() {
      if (!statusEl) return;
      statusEl.textContent = activeIndex + 1 + " / " + slides.length;
    }

    function setSlide(index) {
      const nextIndex = (index + slides.length) % slides.length;
      if (nextIndex === activeIndex) return;

      slides[activeIndex].classList.remove("is-active");
      slides[activeIndex].setAttribute("aria-hidden", "true");
      activeIndex = nextIndex;
      slides[activeIndex].classList.add("is-active");
      slides[activeIndex].setAttribute("aria-hidden", "false");
      updateStatus();

      if (dotsContainer) {
        dotsContainer.querySelectorAll(".tour-carousel__dot").forEach(function (dot, i) {
          dot.classList.toggle("is-active", i === activeIndex);
          dot.setAttribute("aria-selected", String(i === activeIndex));
        });
      }
    }

    function stopTimer() {
      if (timerId) {
        window.clearInterval(timerId);
        timerId = null;
      }
    }

    function startTimer() {
      if (!autoplay || tourCarouselReducedMotion) return;
      stopTimer();
      timerId = window.setInterval(function () {
        setSlide(activeIndex + 1);
      }, tourCarouselIntervalMs);
    }

    function goToSlide(index) {
      setSlide(index);
      startTimer();
    }

    slides.forEach(function (slide, i) {
      slide.setAttribute("aria-hidden", String(i !== 0));
    });

    if (dotsContainer) {
      slides.forEach(function (_slide, i) {
        const dot = document.createElement("button");
        dot.type = "button";
        dot.className = "tour-carousel__dot" + (i === 0 ? " is-active" : "");
        dot.setAttribute("role", "tab");
        dot.setAttribute("aria-label", "Slide " + (i + 1));
        dot.setAttribute("aria-selected", String(i === 0));
        dot.addEventListener("click", function () {
          goToSlide(i);
        });
        dotsContainer.appendChild(dot);
      });
    }

    if (prevBtn) {
      prevBtn.addEventListener("click", function () {
        goToSlide(activeIndex - 1);
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener("click", function () {
        goToSlide(activeIndex + 1);
      });
    }

    startTimer();

    document.addEventListener("visibilitychange", function () {
      if (!autoplay || tourCarouselReducedMotion) return;
      if (document.hidden) {
        stopTimer();
      } else {
        startTimer();
      }
    });
  });

  /* Hotel gallery lightbox */
  (function initHotelLightbox() {
    const triggers = Array.prototype.slice.call(
      document.querySelectorAll("[data-lightbox-gallery]")
    );
    if (!triggers.length) return;

    const galleries = {};
    triggers.forEach(function (trigger) {
      const galleryId = trigger.getAttribute("data-lightbox-gallery");
      if (!galleries[galleryId]) galleries[galleryId] = [];
      const img = trigger.querySelector("img");
      galleries[galleryId].push({
        trigger: trigger,
        src: img ? img.currentSrc || img.src : trigger.getAttribute("data-lightbox-src"),
        alt: img ? img.alt : ""
      });
    });

    const lightbox = document.createElement("div");
    lightbox.className = "lightbox";
    lightbox.setAttribute("hidden", "");
    lightbox.setAttribute("role", "dialog");
    lightbox.setAttribute("aria-modal", "true");
    lightbox.setAttribute("aria-label", "Image gallery");
    lightbox.innerHTML =
      '<button type="button" class="lightbox__close" aria-label="Close gallery">&times;</button>' +
      '<button type="button" class="lightbox__nav lightbox__nav--prev" aria-label="Previous image"><span aria-hidden="true">&larr;</span></button>' +
      '<figure class="lightbox__figure">' +
      '<img class="lightbox__image" alt="">' +
      "</figure>" +
      '<button type="button" class="lightbox__nav lightbox__nav--next" aria-label="Next image"><span aria-hidden="true">&rarr;</span></button>' +
      '<p class="lightbox__counter" aria-live="polite"></p>';
    document.body.appendChild(lightbox);

    const imageEl = lightbox.querySelector(".lightbox__image");
    const counterEl = lightbox.querySelector(".lightbox__counter");
    const closeBtn = lightbox.querySelector(".lightbox__close");
    const prevBtn = lightbox.querySelector(".lightbox__nav--prev");
    const nextBtn = lightbox.querySelector(".lightbox__nav--next");

    let activeGallery = null;
    let activeIndex = 0;
    let lastFocus = null;

    function showItem(index) {
      const items = galleries[activeGallery];
      if (!items || !items.length) return;
      activeIndex = (index + items.length) % items.length;
      const item = items[activeIndex];
      imageEl.src = item.src;
      imageEl.alt = "";
      counterEl.textContent = activeIndex + 1 + " / " + items.length;
    }

    function openLightbox(galleryId, index) {
      if (!galleries[galleryId]) return;
      lastFocus = document.activeElement;
      activeGallery = galleryId;
      lightbox.removeAttribute("hidden");
      document.body.classList.add("lightbox-open");
      showItem(index);
      closeBtn.focus();
    }

    function closeLightbox() {
      lightbox.setAttribute("hidden", "");
      document.body.classList.remove("lightbox-open");
      imageEl.removeAttribute("src");
      activeGallery = null;
      if (lastFocus && typeof lastFocus.focus === "function") {
        lastFocus.focus();
      }
    }

    triggers.forEach(function (trigger) {
      trigger.addEventListener("click", function () {
        const galleryId = trigger.getAttribute("data-lightbox-gallery");
        const items = galleries[galleryId] || [];
        let index = items.findIndex(function (item) {
          return item.trigger === trigger;
        });
        if (index < 0) index = 0;
        openLightbox(galleryId, index);
      });
    });

    closeBtn.addEventListener("click", closeLightbox);
    prevBtn.addEventListener("click", function () {
      showItem(activeIndex - 1);
    });
    nextBtn.addEventListener("click", function () {
      showItem(activeIndex + 1);
    });

    lightbox.addEventListener("click", function (event) {
      if (event.target === lightbox) closeLightbox();
    });

    document.addEventListener("keydown", function (event) {
      if (lightbox.hasAttribute("hidden")) return;
      if (event.key === "Escape") {
        closeLightbox();
      } else if (event.key === "ArrowLeft") {
        showItem(activeIndex - 1);
      } else if (event.key === "ArrowRight") {
        showItem(activeIndex + 1);
      }
    });
  })();

  /* Tour picker — highlight active package on scroll */
  const pickerItems = document.querySelectorAll(".tour-picker__item[data-tour-target]");
  const tourSections = document.querySelectorAll(".tour-package[data-tour-id]");
  const tourPicker = document.querySelector(".tour-picker");
  const siteHeader = document.querySelector(".site-header");

  if (pickerItems.length && tourSections.length) {
    function getTourScrollOffset() {
      const headerHeight = siteHeader ? siteHeader.offsetHeight : 0;
      const pickerHeight = tourPicker ? tourPicker.offsetHeight : 0;
      return headerHeight + pickerHeight + 12;
    }

    function updateTourPickerScrollOffset() {
      const pickerHeight = tourPicker ? tourPicker.offsetHeight : 0;
      document.documentElement.style.setProperty(
        "--tour-picker-scroll-offset",
        pickerHeight + 12 + "px"
      );
      return getTourScrollOffset();
    }

    function scrollToTourSection(id, behavior) {
      const section = document.getElementById(id);
      if (!section) return;

      const offset = updateTourPickerScrollOffset();
      const top =
        section.getBoundingClientRect().top + window.scrollY - offset;

      window.scrollTo({
        top: Math.max(0, top),
        behavior: behavior || "smooth",
      });
    }

    function setActivePicker(id) {
      pickerItems.forEach(function (item) {
        item.classList.toggle("is-active", item.dataset.tourTarget === id);
      });
    }

    pickerItems.forEach(function (item) {
      item.addEventListener("click", function (e) {
        e.preventDefault();
        const id = item.dataset.tourTarget;
        setActivePicker(id);
        scrollToTourSection(id, "smooth");
        history.pushState(null, "", "#" + id);
      });
    });

    window.addEventListener("resize", updateTourPickerScrollOffset);

    if (window.location.hash) {
      const hashId = window.location.hash.slice(1);
      if (document.getElementById(hashId)) {
        requestAnimationFrame(function () {
          setActivePicker(hashId);
          scrollToTourSection(hashId, "auto");
        });
      }
    } else {
      updateTourPickerScrollOffset();
    }

    if ("IntersectionObserver" in window) {
      let tourObserver = null;

      function bindTourObserver() {
        if (tourObserver) {
          tourObserver.disconnect();
        }

        const offsetRem = (updateTourPickerScrollOffset() / 16).toFixed(2);

        tourObserver = new IntersectionObserver(
          function (entries) {
            entries.forEach(function (entry) {
              if (entry.isIntersecting) {
                setActivePicker(entry.target.dataset.tourId);
              }
            });
          },
          {
            root: null,
            rootMargin: "-" + offsetRem + "rem 0px -45% 0px",
            threshold: 0,
          }
        );

        tourSections.forEach(function (section) {
          tourObserver.observe(section);
        });
      }

      bindTourObserver();
      window.addEventListener("resize", bindTourObserver);
    }
  }

  /* Contact form handling */
  const contactForm = document.getElementById("contact-form");
  const formMessage = document.querySelector(".form-message");
  const formMessageText = document.querySelector(".form-message__text");

  function showFormMessage(text, type) {
    if (!formMessage || !formMessageText) return;
    formMessageText.textContent = text;
    formMessage.classList.add("visible");
    formMessage.classList.toggle("form-message--success", type === "success");
    formMessage.classList.toggle("form-message--error", type === "error");
  }

  if (contactForm) {
    const captchaCheckbox = contactForm.querySelector("#captcha-mock");

    contactForm.addEventListener("submit", function (e) {
      e.preventDefault();

      if (captchaCheckbox && !captchaCheckbox.checked) {
        showFormMessage(
          "Please confirm you are not a robot before sending your enquiry.",
          "error"
        );
        return;
      }

      showFormMessage(
        "Thank you for your enquiry. We will be in touch shortly to help plan your journey.",
        "success"
      );

      contactForm.reset();
    });
  }
})();
