/* =========================================================
   ZONA3D — home.js
   Mobile:
   - Tabs materiales
   - Slider trabajos con autoplay, dots y swipe
========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  initMaterialTabs();
  initHomeWorksSlider();
});

function initMaterialTabs() {
  const buttons = document.querySelectorAll(".mat-tab-btn");
  const panels = document.querySelectorAll(".mat-tab-panel");

  if (!buttons.length || !panels.length) return;

  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      const tab = button.dataset.tab;

      buttons.forEach((btn) => btn.classList.remove("active"));
      panels.forEach((panel) => panel.classList.remove("active"));

      button.classList.add("active");

      const activePanel = document.getElementById(`tab-${tab}`);
      if (activePanel) activePanel.classList.add("active");
    });
  });
}

function initHomeWorksSlider() {
  const viewport = document.getElementById("homeViewport");
  const track = document.getElementById("homeTrack");
  const dotsWrap = document.getElementById("homeDots");

  if (!viewport || !track || !dotsWrap) return;

  const cards = Array.from(track.querySelectorAll(".home-slider-card"));
  if (!cards.length) return;

  let current = 0;
  let autoplay = null;
  let startX = 0;

  cards.forEach((_, index) => {
    const dot = document.createElement("button");
    dot.className = "home-slider-dot";
    dot.type = "button";
    dot.setAttribute("aria-label", `Ir al slide ${index + 1}`);

    dot.addEventListener("click", () => {
      stopAutoplay();
      goTo(index);
      startAutoplay();
    });

    dotsWrap.appendChild(dot);
  });

  const dots = Array.from(dotsWrap.querySelectorAll(".home-slider-dot"));

  function getGap() {
    return parseFloat(getComputedStyle(track).gap) || 0;
  }

  function goTo(index) {
    current = (index + cards.length) % cards.length;

    const cardWidth = cards[0].offsetWidth;
    const gap = getGap();
    const offset = current * (cardWidth + gap);

    track.style.transform = `translateX(-${offset}px)`;

    dots.forEach((dot, dotIndex) => {
      dot.classList.toggle("active", dotIndex === current);
    });
  }

  function startAutoplay() {
    stopAutoplay();
    autoplay = setInterval(() => {
      goTo(current + 1);
    }, 3000);
  }

  function stopAutoplay() {
    if (autoplay) {
      clearInterval(autoplay);
      autoplay = null;
    }
  }

  viewport.addEventListener(
    "touchstart",
    (event) => {
      startX = event.touches[0].clientX;
      stopAutoplay();
    },
    { passive: true }
  );

  viewport.addEventListener(
    "touchend",
    (event) => {
      const endX = event.changedTouches[0].clientX;
      const diff = endX - startX;

      if (Math.abs(diff) > 40) {
        goTo(diff < 0 ? current + 1 : current - 1);
      }

      startAutoplay();
    },
    { passive: true }
  );

  let isDragging = false;

  viewport.addEventListener("mousedown", (event) => {
    isDragging = true;
    startX = event.clientX;
    stopAutoplay();
  });

  window.addEventListener("mouseup", (event) => {
    if (!isDragging) return;

    isDragging = false;
    const diff = event.clientX - startX;

    if (Math.abs(diff) > 40) {
      goTo(diff < 0 ? current + 1 : current - 1);
    }

    startAutoplay();
  });

  window.addEventListener("resize", () => {
    goTo(current);
  });

  goTo(0);
  startAutoplay();
  function initMobileFaqAccordion() {
  const faqItems = Array.from(document.querySelectorAll(".lp-faq-item"));

  if (!faqItems.length) return;

  faqItems.forEach((item) => {
    const question = item.querySelector(".lp-faq-q");

    if (!question) return;

    question.addEventListener("click", () => {
      if (window.innerWidth > 640) return;

      const isOpen = item.classList.contains("open");

      faqItems.forEach((faq) => faq.classList.remove("open"));

      if (!isOpen) {
        item.classList.add("open");
      }
    });
  });
}

initMobileFaqAccordion();
}