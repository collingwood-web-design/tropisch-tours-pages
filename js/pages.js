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
    let activeIndex = 0;
    let timerId = null;

    if (slides.length < 2) {
      if (prevBtn) prevBtn.hidden = true;
      if (nextBtn) nextBtn.hidden = true;
      return;
    }

    function setSlide(index) {
      const nextIndex = (index + slides.length) % slides.length;
      if (nextIndex === activeIndex) return;

      slides[activeIndex].classList.remove("is-active");
      slides[activeIndex].setAttribute("aria-hidden", "true");
      activeIndex = nextIndex;
      slides[activeIndex].classList.add("is-active");
      slides[activeIndex].setAttribute("aria-hidden", "false");

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
      if (tourCarouselReducedMotion) return;
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
      if (tourCarouselReducedMotion) return;
      if (document.hidden) {
        stopTimer();
      } else {
        startTimer();
      }
    });
  });

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

  if (contactForm) {
    const recaptchaWidget = contactForm.querySelector(".g-recaptcha");

    contactForm.addEventListener("submit", function (e) {
      e.preventDefault();

      if (recaptchaWidget) {
        const recaptchaResponse =
          typeof window.grecaptcha !== "undefined"
            ? window.grecaptcha.getResponse()
            : "";

        if (!recaptchaResponse) {
          if (formMessage) {
            formMessage.textContent =
              "Please confirm you are not a robot before sending your enquiry.";
            formMessage.classList.add("visible", "form-message--error");
            formMessage.classList.remove("form-message--success");
          }
          return;
        }
      }

      if (formMessage) {
        formMessage.textContent =
          "Thank you for your enquiry. We will be in touch shortly to help plan your journey.";
        formMessage.classList.add("visible", "form-message--success");
        formMessage.classList.remove("form-message--error");
      }

      contactForm.reset();

      if (typeof window.grecaptcha !== "undefined") {
        window.grecaptcha.reset();
      }
    });
  }
})();
