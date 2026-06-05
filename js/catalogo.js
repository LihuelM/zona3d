const BASE = "./assets/img/img_products/";

const products = [
  { src: "brazo_robotico.png", category: "decoracion" },
  { src: "porta_abanico_c.png", category: "soportes" },
  { src: "juego.png", category: "decoracion" },
  { src: "dragon_verde.png", category: "decoracion" },
  { src: "calabazas.png", category: "decoracion" },
  { src: "calibre.png", category: "utilitarios" },
  { src: "decoracion_beta.png", category: "decoracion" },
  { src: "decoracion_mano.png", category: "decoracion" },
  { src: "llavero_vaca.png", category: "regalos" },
  { src: "dragon_azul.png", category: "decoracion" },
  { src: "maceta_gato.png", category: "decoracion" },
  { src: "maceta_groot.png", category: "decoracion" },
  { src: "mano_articulada.png", category: "decoracion" },
  { src: "porta_abanico_a.png", category: "soportes" },
  { src: "portabombones.png", category: "regalos" },
  { src: "psicodelico.png", category: "decoracion" },
  { src: "caballo.png", category: "decoracion" },
  { src: "pastillero_2.png", category: "utilitarios" },
  { src: "soporte_card_pendrive.png", category: "soportes" },
  { src: "soporte_cel.png", category: "soportes" },
  { src: "soporte_lentes3d.png", category: "soportes" },
  { src: "soporte_notebook_1.png", category: "soportes" },
  { src: "pastillero_1.png", category: "utilitarios" }
];

const masonryGrid = document.querySelector(".masonry-grid");
const track = document.getElementById("peekTrack");
const prev = document.getElementById("peekPrev");
const next = document.getElementById("peekNext");
const currentLabel = document.getElementById("peekCurrent");
const totalLabel = document.getElementById("peekTotal");
const tabs = document.querySelectorAll(".catalog-tab");

let filteredProducts = [...products];
let index = 0;
let auto = null;

function renderDesktop(productsToRender) {
  if (!masonryGrid) return;

  masonryGrid.innerHTML = productsToRender
    .map((product) => {
      return `
        <div class="grid-item">
          <img src="${BASE + product.src}" alt="Producto impreso en 3D" loading="lazy">
        </div>
      `;
    })
    .join("");
}

function renderMobile(productsToRender) {
  if (!track || !totalLabel || !currentLabel) return;

  track.innerHTML = "";

  productsToRender.forEach((product) => {
    const slide = document.createElement("div");
    slide.className = "peek-slide";
    slide.innerHTML = `<img src="${BASE + product.src}" alt="Producto impreso en 3D">`;
    track.appendChild(slide);
  });

  index = 0;
  totalLabel.textContent = productsToRender.length;
  currentLabel.textContent = productsToRender.length ? 1 : 0;

  requestAnimationFrame(() => {
    updateSlider();
  });
}

function updateSlider() {
  const slides = document.querySelectorAll(".peek-slide");
  const viewport = document.getElementById("peekViewport");

  if (!slides.length || !viewport || !track) return;

  const slideWidth = slides[0].offsetWidth;
  const gap = parseFloat(getComputedStyle(track).gap) || 0;
  const step = slideWidth + gap;

  let offset =
    index * step -
    viewport.offsetWidth / 2 +
    slideWidth / 2;

  offset = Math.max(0, offset);

  track.style.transform = `translateX(-${offset}px)`;

  slides.forEach((slide, i) => {
    slide.classList.toggle("active", i === index);
  });

  currentLabel.textContent = index + 1;
}

function goTo(i) {
  const slides = document.querySelectorAll(".peek-slide");
  if (!slides.length) return;

  index = (i + slides.length) % slides.length;
  updateSlider();
}

function filterProducts(category) {
  filteredProducts =
    category === "todos"
      ? [...products]
      : products.filter((product) => product.category === category);

  renderDesktop(filteredProducts);
  renderMobile(filteredProducts);
  restartAuto();
}

function startAuto() {
  stopAuto();
  auto = setInterval(() => goTo(index + 1), 3000);
}

function stopAuto() {
  if (auto) {
    clearInterval(auto);
    auto = null;
  }
}

function restartAuto() {
  stopAuto();
  startAuto();
}

tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    tabs.forEach((item) => item.classList.remove("active"));
    tab.classList.add("active");

    filterProducts(tab.dataset.category);
  });
});

if (prev) {
  prev.onclick = () => {
    stopAuto();
    goTo(index - 1);
    startAuto();
  };
}

if (next) {
  next.onclick = () => {
    stopAuto();
    goTo(index + 1);
    startAuto();
  };
}

let startX = 0;

if (track) {
  track.addEventListener("mousedown", (e) => {
    startX = e.clientX;
    stopAuto();
  });

  track.addEventListener("mouseup", (e) => {
    const dx = e.clientX - startX;

    if (dx > 50) goTo(index - 1);
    if (dx < -50) goTo(index + 1);

    startAuto();
  });

  track.addEventListener("touchstart", (e) => {
    startX = e.touches[0].clientX;
    stopAuto();
  });

  track.addEventListener("touchend", (e) => {
    const dx = e.changedTouches[0].clientX - startX;

    if (dx > 50) goTo(index - 1);
    if (dx < -50) goTo(index + 1);

    startAuto();
  });
}

window.addEventListener("resize", updateSlider);

renderDesktop(products);
renderMobile(products);
startAuto();