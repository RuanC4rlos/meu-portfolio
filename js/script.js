document.addEventListener("DOMContentLoaded", () => {
  // Constantes e Variáveis Globais
  const projectsContainer = document.getElementById("project-list");
  const paginationContainer = document.getElementById("pagination-container");
  const itemsPerPage = 10; // Definido para 10 projetos por página, conforme solicitado.
  let allProjectElements = []; // Armazenará os elementos DOM dos projetos (após renderização).
  let currentPage = 1;
  let totalPages = 0;

  // 1. Smooth Scroll (Lógica Original)
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      e.preventDefault();
      document.querySelector(this.getAttribute("href")).scrollIntoView({
        behavior: "smooth",
      });
    });
  });

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
  // -------------------------------------------------------------------
  // 2. LÓGICA DE GERAÇÃO DE HTML A PARTIR DO JSON
  // -------------------------------------------------------------------

  function createProjectCardHTML(project) {
    const descriptionHTML = project.description_items
      ? formatDescriptionHTML(project.description_items)
      : `<p>${project.description || "Descrição não disponível."}</p>`;

    const projectTypeHTML = project.type
      ? `<span class="project-type">${project.type}</span>`
      : "";

    // NOVO: Exibe os links apenas se existirem
    const codeLinkHTML = project.code_link
      ? `<a href="${project.code_link}" target="_blank" class="btn project-link">Código <i class="fab fa-github"></i></a>`
      : "";

    const liveLinkHTML = project.live_link
      ? `<a href="${project.live_link}" target="_blank" class="btn project-link secondary">Ver ao vivo <i class="fas fa-external-link-alt"></i></a>`
      : "";

    // AQUI INJETAMOS O CARROSSEL
    const carouselHTML = createCarouselHTML(project.images, project.id);
    return `
        <article class="project-card">
            <div class="project-image">
                ${carouselHTML} 
            </div>
            <div class="project-details">
                ${projectTypeHTML} <h3>${project.title}</h3>
                <p class="tech-stack"><strong>Tecnologias:</strong> ${project.tech}</p>
                
                <div class="project-description-content">
                    ${descriptionHTML}
                </div>
                
                <div class="project-links">
                    ${codeLinkHTML} ${liveLinkHTML}
                </div>
            </div>
        </article>
    `;
  }

  // -------------------------------------------------------------------
  // 3. LÓGICA DE PAGINAÇÃO
  // -------------------------------------------------------------------

  /**
   * Exibe os projetos da página atual e esconde os demais.
   * Usa a classe 'hidden' que deve estar configurada no CSS.
   * @param {number} page - O número da página a ser exibida (começa em 1).
   */
  function displayProjects(page) {
    currentPage = page;
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;

    allProjectElements.forEach((card, index) => {
      if (index >= startIndex && index < endIndex) {
        // Remove a classe 'hidden' para mostrar (Projetos da página atual)
        card.classList.remove("hidden");
      } else {
        // Adiciona a classe 'hidden' para esconder (Projetos fora da página)
        card.classList.add("hidden");
      }
    });

    // Atualiza a ativação dos botões
    updatePaginationButtons(currentPage);

    // Rolagem suave para o topo da seção
    document.getElementById("projects").scrollIntoView({ behavior: "smooth" });
  }

  /**
   * Cria e renderiza os botões de paginação.
   */
  function setupPagination() {
    paginationContainer.innerHTML = ""; // Limpa botões antigos

    if (totalPages <= 1) {
      return;
    }

    for (let i = 1; i <= totalPages; i++) {
      const button = document.createElement("button");
      button.innerText = i;
      button.classList.add("page-button");

      if (i === currentPage) {
        button.classList.add("active");
      }

      button.addEventListener("click", () => {
        displayProjects(i);
      });

      paginationContainer.appendChild(button);
    }
  }

  /**
   * Atualiza o estado "ativo" dos botões de paginação.
   */
  function updatePaginationButtons(activePage) {
    document.querySelectorAll(".page-button").forEach((button) => {
      button.classList.remove("active");
      if (parseInt(button.innerText) === activePage) {
        button.classList.add("active");
      }
    });
  }

  // -------------------------------------------------------------------
  // 4. INICIALIZAÇÃO
  // -------------------------------------------------------------------

  async function initPortfolio() {
    try {
      // 1. Carregar os dados JSON (Substitua por um caminho correto se necessário)
      const response = await fetch("projects.json");
      const projectsData = await response.json();

      projectsData.sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        return dateB - dateA;
      });

      // 2. Renderizar todos os cartões no DOM
      let allProjectsHTML = "";
      projectsData.forEach((project) => {
        allProjectsHTML += createProjectCardHTML(project);
      });
      projectsContainer.innerHTML = allProjectsHTML;

      // 3. Capturar os elementos DOM para manipulação
      allProjectElements = Array.from(
        projectsContainer.querySelectorAll(".project-card")
      );

      // 4. Calcular o total de páginas
      totalPages = Math.ceil(allProjectElements.length / itemsPerPage);

      // 5. Inicializar Paginação e Carrosséis (Chamadas Globais)
      displayProjects(currentPage);
      setupPagination();

      // CHAMA A FUNÇÃO GLOBAL APÓS O DOM ESTAR PRONTO
      window.initCarousels(allProjectElements);
    } catch (error) {
      console.error(
        "Erro ao carregar os dados de projetos ou ao renderizar:",
        error
      );
      projectsContainer.innerHTML =
        '<p style="color:red; text-align:center;">Erro ao carregar projetos. Verifique o arquivo projects.json e o console.</p>';
    }
  }

  initPortfolio();
});

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
