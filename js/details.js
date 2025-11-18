document.addEventListener("DOMContentLoaded", () => {
  // FUNÇÃO PRINCIPAL: Carrega o ID da URL (?id=X)
  function getProjectIdFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    // Retorna o valor de 'id' como número inteiro
    return parseInt(urlParams.get("id"));
  }

  const projectId = getProjectIdFromUrl();
  const container = document.getElementById("project-details-container");

  if (!projectId || isNaN(projectId)) {
    container.innerHTML =
      '<h2>Projeto Não Encontrado</h2><p>Por favor, volte para a <a href="index.html">página inicial</a> e selecione um projeto válido.</p>';
    return;
  }

  async function loadProjectDetails() {
    try {
      const response = await fetch("projects.json");
      const projectsData = await response.json();

      const project = projectsData.find((p) => p.id === projectId);

      if (!project) {
        container.innerHTML = `<h2>Projeto #${projectId} não encontrado</h2><p>O ID não corresponde a nenhum projeto.</p>`;
        return;
      }

      // Atualiza o título da página
      document.title = `${project.title} | Estudo de Caso`;

      // Renderiza o conteúdo detalhado (função movida/renomeada do script.js)
      container.innerHTML = createDetailedProjectHTML(project);

      // Inicializa o carrossel na página de detalhes (função do global-modal.js)
      const projectElement = container.querySelector(".project-card");
      if (projectElement && window.initCarousels) {
        window.initCarousels([projectElement]);
      }
    } catch (error) {
      console.error("Erro ao carregar detalhes do projeto:", error);
      container.innerHTML =
        '<h2 style="color:red;">Erro de Carregamento</h2><p>Não foi possível carregar os dados. Verifique o console.</p>';
    }
  }

  // Chama a função de carregamento
  loadProjectDetails();
});

// === FUNÇÕES MOVIDAS DO SCRIPT.JS PARA CÁ ===

function createDetailedProjectHTML(project) {
  // ESTA É A VERSÃO DETALHADA QUE VOCÊ TINHA ANTES (AJUSTADA PARA O NOVO LAYOUT VERTICAL)
  const liveLinkHTML = project.live_link
    ? `<a href="${project.live_link}" target="_blank" class="btn project-link secondary">Ver ao vivo <i class="fas fa-external-link-alt"></i></a>`
    : "";

  const codeLinkHTML = project.code_link
    ? `<a href="${project.code_link}" target="_blank" class="btn project-link">Código <i class="fab fa-github"></i></a>`
    : "";

  const descriptionHTML = project.description_items
    ? formatDescriptionHTML(project.description_items)
    : `<p>${project.description || "Descrição não disponível."}</p>`;

  const carouselHTML = createCarouselHTML(project.images, project.id);
  const projectTypeHTML = project.type
    ? `<span class="project-type">${project.type}</span>`
    : "";

  return `
        <article class="project-card standalone-project">
            <div class="project-details">
                 ${projectTypeHTML}
                 <a href="index.html#projects" class="back-link"><i class="fas fa-arrow-left"></i> Voltar para Projetos</a>
                 <h1>${project.title}</h1>
                 <p class="tech-stack"><strong>Tecnologias:</strong> ${project.tech}</p>
            </div>
            
            <div class="project-image">
                ${carouselHTML} 
                <p class="click-to-zoom">Clique na imagem para expandir e navegar.</p>
            </div>
            
            <div class="project-details full-width-details">
                <div class="project-description-content">
                    ${descriptionHTML}
                </div>
                
                <div class="project-links centered-links">
                    ${codeLinkHTML}
                    ${liveLinkHTML}
                </div>
            </div>
        </article>
    `;
}

function createCarouselHTML(images, projectId) {
  if (!images || images.length === 0) {
    return `<div class="placeholder-project">Imagem Não Disponível</div>`;
  }

  const hasMultipleImages = images.length > 1;
  let slidesHTML = "";
  let indicatorsHTML = "";
  const imagesJsonString = JSON.stringify(images).replace(/"/g, "&quot;");

  images.forEach((src, index) => {
    const isActive = index === 0 ? " active" : "";
    slidesHTML += `
        <div class="carousel-slide fade${isActive}" data-slide-index="${index}">
            <img src="${src}" alt="..." 
                 onclick="openModal('${imagesJsonString}', '${src}')"> 
        </div>
    `;
    if (hasMultipleImages) {
      indicatorsHTML += `
                    <span class="carousel-indicator${isActive}" 
                           onclick="currentSlide(${projectId}, ${
        index + 1
      })"></span>
                 `;
    }
  });
  const controlsHTML = hasMultipleImages
    ? `<a class="prev" onclick="plusSlides(${projectId}, -1)">&#10094;</a><a class="next" onclick="plusSlides(${projectId}, 1)">&#10095;</a>`
    : "";

  return `<div class="carousel-container" data-project-id="${projectId}">${slidesHTML}${controlsHTML}<div class="carousel-indicators">${indicatorsHTML}</div></div>`;
}

function formatDescriptionHTML(items) {
  let html = "";

  // Inicia uma lista não ordenada (<U>L)
  let isListOpen = false;

  items.forEach((item) => {
    const content = convertTextToHTML(item.content);

    if (item.type === "paragraph") {
      if (isListOpen) {
        html += "</ul>"; // Fecha lista anterior
        isListOpen = false;
      }
      html += `<p>${content}</p>`;
    } else if (item.type === "heading") {
      if (isListOpen) {
        html += "</ul>"; // Fecha lista anterior
        isListOpen = false;
      }
      // Use <h4> para evitar conflito com <h2> (título da seção) e <h3> (título do projeto)
      html += `<h4>${content}</h4>`;
    } else if (item.type === "list_item") {
      if (!isListOpen) {
        html += "<ul>"; // Abre nova lista
        isListOpen = true;
      }
      html += `<li>${content}</li>`;
    }
  });

  // Garante que a última lista seja fechada
  if (isListOpen) {
    html += "</ul>";
  }
  return html;
}

function convertTextToHTML(text) {
  if (!text) return "";

  // 1. Converte **Negrito** para <strong>
  let formattedText = text.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");

  // 2. Converte *Itálico* (opcional) para <em>
  formattedText = formattedText.replace(/\*(.*?)\*/g, "<em>$1</em>");

  // 3. Converte novas linhas (\n) em quebras de linha <br> (se fosse um parágrafo longo)
  // formattedText = formattedText.replace(/\n/g, '<br>');

  return formattedText;
}

function createCarouselHTML(images, projectId) {
  if (!images || images.length === 0) {
    return `<div class="placeholder-project">Imagem Não Disponível</div>`;
  }

  const hasMultipleImages = images.length > 1;
  let slidesHTML = "";
  let indicatorsHTML = "";
  const imagesJsonString = JSON.stringify(images).replace(/"/g, "&quot;");

  images.forEach((src, index) => {
    const isActive = index === 0 ? " active" : "";
    slidesHTML += `
        <div class="carousel-slide fade${isActive}" data-slide-index="${index}">
            <img src="${src}" alt="..." 
                 onclick="openModal('${imagesJsonString}', '${src}')"> 
        </div>
    `;
    if (hasMultipleImages) {
      indicatorsHTML += `
                    <span class="carousel-indicator${isActive}" 
                           onclick="currentSlide(${projectId}, ${
        index + 1
      })"></span>
                 `;
    }
  });
  const controlsHTML = hasMultipleImages
    ? `<a class="prev" onclick="plusSlides(${projectId}, -1)">&#10094;</a><a class="next" onclick="plusSlides(${projectId}, 1)">&#10095;</a>`
    : "";

  return `<div class="carousel-container" data-project-id="${projectId}">${slidesHTML}${controlsHTML}<div class="carousel-indicators">${indicatorsHTML}</div></div>`;
}
