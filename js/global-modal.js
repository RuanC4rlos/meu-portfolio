const modal = document.getElementById("imageModal");
const modalImg = document.getElementById("expandedImage");
const span = document.getElementsByClassName("close-btn")[0];
const modalIndicatorContainer = document.getElementById(
  "modal-indicator-container"
);
const modalPrevBtn = document.getElementById("modal-prev");
const modalNextBtn = document.getElementById("modal-next");

let currentSlideIndex = 0; // Índice do slide atual no modal (começa em 0)
let currentModalImages = []; // Array das URLs do carrossel atual

// Variável global para rastrear qual slide está ativo em cada projeto (MANTIDA)
let currentSlideIndexes = {};

// === FUNÇÕES DE CONTROLE DO MODAL ===
function openImageCarouselModal(imagesJsonString, initialSrc) {
  // 1. CORREÇÃO CRUCIAL: Converte a string JSON de volta para um array
  try {
    currentModalImages = JSON.parse(imagesJsonString);
  } catch (e) {
    console.error("Erro ao fazer parse da string JSON para o carrossel:", e);
    // Se falhar, tenta usar apenas a imagem inicial como fallback
    currentModalImages = [initialSrc];
  }

  // Define o índice inicial com base na URL clicada
  currentSlideIndex = currentModalImages.indexOf(initialSrc);
  if (currentSlideIndex === -1) currentSlideIndex = 0; // fallback

  const totalSlides = currentModalImages.length;

  // 2. Prepara e exibe o modal
  modal.style.display = "block";
  // O modalImg.src será definido dentro de showModalSlide

  // 3. Cria os indicadores
  modalIndicatorContainer.innerHTML = "";
  if (totalSlides > 1) {
    for (let i = 0; i < totalSlides; i++) {
      const indicator = document.createElement("span");
      indicator.classList.add("carousel-indicator-modal");
      // O clique do indicador chama showModalSlide passando o índice (0, 1, 2...)
      indicator.onclick = () => showModalSlide(i);
      modalIndicatorContainer.appendChild(indicator);
    }
  }

  // 4. Configura as setas (mostra/esconde)
  if (totalSlides > 1) {
    modalPrevBtn.style.display = "block";
    modalNextBtn.style.display = "block";
  } else {
    modalPrevBtn.style.display = "none";
    modalNextBtn.style.display = "none";
  }

  // 5. Exibe o slide atual (usando o índice inicial) e ativa o indicador
  showModalSlide(currentSlideIndex);
}

// Anexa a função ao escopo global para o HTML (onclick)
window.openModal = openImageCarouselModal;

// Navegação do Carrossel no Modal
function showModalSlide(index) {
  const totalSlides = currentModalImages.length;

  // Lógica de loop para o carrossel
  if (index >= totalSlides) {
    currentSlideIndex = 0;
  } else if (index < 0) {
    currentSlideIndex = totalSlides - 1;
  } else {
    currentSlideIndex = index;
  }

  // Atualiza a imagem principal do modal (usando o array que acabamos de parsear)
  // O .trim() é uma segurança extra contra espaços em branco no JSON
  modalImg.src = currentModalImages[currentSlideIndex].trim();

  // Atualiza os indicadores
  const indicators = modalIndicatorContainer.querySelectorAll(
    ".carousel-indicator-modal"
  );
  indicators.forEach((ind, i) => {
    ind.classList.remove("active");
    if (i === currentSlideIndex) {
      ind.classList.add("active");
    }
  });
}

// Eventos de clique nas setas
modalPrevBtn.onclick = () => showModalSlide(currentSlideIndex - 1);
modalNextBtn.onclick = () => showModalSlide(currentSlideIndex + 1);

// Fecha o modal ao clicar no botão 'x'
span.onclick = function () {
  modal.style.display = "none";
};

// Fecha o modal ao clicar fora do modal
window.onclick = function (event) {
  if (event.target == modal) {
    modal.style.display = "none";
  }
};
// === FUNÇÕES DE CONTROLE DO CARROSSEL ===
function plusSlides(projectId, n) {
  showSlides(projectId, (currentSlideIndexes[projectId] += n));
}
window.plusSlides = plusSlides;

function currentSlide(projectId, n) {
  showSlides(projectId, (currentSlideIndexes[projectId] = n));
}
window.currentSlide = currentSlide;

// Função principal de exibição dos slides e atualização dos indicadores
function showSlides(projectId, n) {
  const carousel = document.querySelector(
    `.carousel-container[data-project-id="${projectId}"]`
  );
  if (!carousel) return;

  const slides = carousel.querySelectorAll(".carousel-slide");
  const indicators = carousel.querySelectorAll(".carousel-indicator");
  const totalSlides = slides.length;

  if (totalSlides === 0) return;

  let slideIndex = n;

  if (slideIndex > totalSlides) {
    slideIndex = 1;
  }
  if (slideIndex < 1) {
    slideIndex = totalSlides;
  }

  slides.forEach((slide) => slide.classList.remove("active"));
  indicators.forEach((indicator) => indicator.classList.remove("active"));

  slides[slideIndex - 1].classList.add("active");
  // Verifica se os indicadores existem antes de tentar acessá-los
  if (indicators.length > 0) {
    indicators[slideIndex - 1].classList.add("active");
  }

  currentSlideIndexes[projectId] = slideIndex;
}
window.showSlides = showSlides;

// Função chamada após a renderização dos projetos no script.js
window.initCarousels = function (projectElements) {
  projectElements.forEach((element) => {
    const projectIdAttr = element.querySelector(".carousel-container")?.dataset
      .projectId;
    if (projectIdAttr) {
      const projectId = parseInt(projectIdAttr);
      // Inicializa o índice e chama showSlides para forçar a exibição do primeiro slide
      currentSlideIndexes[projectId] = 1;
      showSlides(projectId, 1);
    }
  });
};
