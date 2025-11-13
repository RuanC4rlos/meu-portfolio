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

  // -------------------------------------------------------------------
  // 2. LÓGICA DE GERAÇÃO DE HTML A PARTIR DO JSON
  // -------------------------------------------------------------------

  /**
   * Gera o HTML de um único cartão de projeto a partir de um objeto JSON.
   * @param {Object} project - Objeto contendo os dados do projeto.
   * @returns {string} - String contendo o HTML da tag <article>.
   */
  function createProjectCardHTML(project) {
    // Alterna o layout 'reverse' para projetos ímpares (melhora a estética)
    const isReverse = project.id % 2 === 0 ? " reverse" : "";

    // Renderiza o link de demo/produção se ele existir
    const liveLinkHTML = project.live_link
      ? `<a href="${project.live_link}" target="_blank" class="btn project-link secondary">Ver Detalhes <i class="fas fa-external-link-alt"></i></a>`
      : "";

    // Uso de Template Literals para manter a estrutura limpa
    return `
            <article class="project-card${isReverse}">
                <div class="project-image">
                    <div class="placeholder-project">${project.placeholder}</div>
                </div>
                <div class="project-details">
                    <h3>${project.title}</h3>
                    <p class="tech-stack"><strong>Tecnologias:</strong> ${project.tech}</p>
                    <p>${project.description}</p>
                    <div class="project-links">
                        <a href="${project.code_link}" target="_blank" class="btn project-link">Código <i class="fab fa-github"></i></a>
                        ${liveLinkHTML}
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

      // 2. Renderizar todos os cartões no DOM (Inicialmente invisíveis)
      let allProjectsHTML = "";
      projectsData.forEach((project) => {
        // Cria o HTML do cartão (todos ainda na mesma string)
        allProjectsHTML += createProjectCardHTML(project);
      });
      // Insere todo o HTML de uma vez
      projectsContainer.innerHTML = allProjectsHTML;

      // 3. Capturar os elementos DOM para manipular a visibilidade
      allProjectElements = Array.from(
        projectsContainer.querySelectorAll(".project-card")
      );

      // 4. Calcular o total de páginas (com base nos dados reais)
      totalPages = Math.ceil(allProjectElements.length / itemsPerPage);

      // 5. Inicializar o sistema de paginação
      displayProjects(currentPage); // Mostra a primeira página
      setupPagination(); // Cria os botões
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
