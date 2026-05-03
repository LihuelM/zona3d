
const track = document.getElementById("peekTrack");
const prev = document.getElementById("peekPrev");
const next = document.getElementById("peekNext");
const currentLabel = document.getElementById("peekCurrent");
const totalLabel = document.getElementById("peekTotal");

const images = [
  "brazo_robotico.png",
  "porta_abanico_c.png",
  "juego.png",
  "dragon_verde.png",
  "calabazas.png",
  "calibre.png",
  "decoracion_beta.png",
  "decoracion_mano.png",
  "llavero_vaca.png",
  "dragon_azul.png",
  "maceta_gato.png",
  "maceta_groot.png",
  "mano_articulada.png",
  "porta_abanico_a.png",
  "portabombones.png",
  "psicodelico.png",
  "caballo.png",
  "pastillero_2.png",
  "soporte_card_pendrive.png",
  "soporte_cel.png",
  "soporte_lentes3d.png",
  "soporte_notebook_1.png",
  "pastillero_1.png"
];

const BASE = "./assets/img/img_products/";

let index = 0;
let auto;

totalLabel.textContent = images.length;

// crear slides
images.forEach((src, i) => {
  const div = document.createElement("div");
  div.className = "peek-slide";
  div.innerHTML = `<img src="${BASE + src}" />`;
  track.appendChild(div);
});

const slides = document.querySelectorAll(".peek-slide");

function update() {
  const viewport = document.getElementById("peekViewport");
  const slideWidth = slides[0].offsetWidth;
  const gap = parseFloat(getComputedStyle(track).gap) || 0;

  const offset =
    index * (slideWidth + gap) -
    (viewport.offsetWidth / 2) +
    (slideWidth / 2);

  track.style.transform = `translateX(-${offset}px)`;

  slides.forEach((slide, i) => {
    slide.classList.toggle("active", i === index);
  });

  currentLabel.textContent = index + 1;
}

function goTo(i) {
  index = (i + slides.length) % slides.length;
  update();
}

prev.onclick = () => goTo(index - 1);
next.onclick = () => goTo(index + 1);

// autoplay
function startAuto() {
  auto = setInterval(() => goTo(index + 1), 3000);
}

function stopAuto() {
  clearInterval(auto);
}

startAuto();

// swipe (touch + mouse)
let startX = 0;

track.addEventListener("mousedown", e => {
  startX = e.clientX;
  stopAuto();
});

track.addEventListener("mouseup", e => {
  const dx = e.clientX - startX;
  if (dx > 50) goTo(index - 1);
  if (dx < -50) goTo(index + 1);
  startAuto();
});

track.addEventListener("touchstart", e => {
  startX = e.touches[0].clientX;
  stopAuto();
});

track.addEventListener("touchend", e => {
  const dx = e.changedTouches[0].clientX - startX;
  if (dx > 50) goTo(index - 1);
  if (dx < -50) goTo(index + 1);
  startAuto();
});

window.addEventListener("resize", update);

update();
