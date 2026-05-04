const articlesPath = "data/articles.json";

async function getArticles() {
  const response = await fetch(articlesPath);
  return response.json();
}

async function getArticleContent(article) {
  if (!article.contentFile) {
    return "";
  }

  const response = await fetch(article.contentFile);

  if (!response.ok) {
    return "";
  }

  return response.text();
}

function getSearchQuery() {
  const params = new URLSearchParams(window.location.search);
  return (params.get("q") || "").trim();
}

function getUrlValues(name) {
  const params = new URLSearchParams(window.location.search);
  return params.getAll(name);
}

function getActiveFilters() {
  return {
    scopes: getUrlValues("scope"),
    sports: getUrlValues("sport"),
    sort: new URLSearchParams(window.location.search).get("sort") || ""
  };
}

function normalizeText(text) {
  return String(text || "").toLowerCase();
}

function parseArticleDate(dateText) {
  const parts = String(dateText || "").match(/\d+/g);

  if (!parts || parts.length < 3) {
    return 0;
  }

  const [day, month, year] = parts.map(Number);
  return new Date(year, month - 1, day).getTime();
}

async function articleMatchesQuery(article, query) {
  if (!query) {
    return true;
  }

  const normalizedQuery = normalizeText(query);
  const content = await getArticleContent(article);
  const searchableText = [
    article.title,
    article.articleTitle,
    article.description,
    article.date,
    content
  ].map(normalizeText).join(" ");

  return searchableText.includes(normalizedQuery);
}

function articleMatchesFilters(article, filters) {
  const scopeMatches = !filters.scopes.length || filters.scopes.includes(article.scope);
  const sportMatches = !filters.sports.length || filters.sports.includes(article.sport);

  return scopeMatches && sportMatches;
}

function sortArticles(articles, sortType) {
  const sortedArticles = [...articles];

  if (sortType === "newest") {
    return sortedArticles.sort((a, b) => parseArticleDate(b.date) - parseArticleDate(a.date));
  }

  if (sortType === "oldest") {
    return sortedArticles.sort((a, b) => parseArticleDate(a.date) - parseArticleDate(b.date));
  }

  if (sortType === "popular") {
    return sortedArticles.sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
  }

  return sortedArticles;
}

function createArticleCard(article) {
  return `
    <a href="article.html?id=${article.id}" class="article-link">
      <div class="featuredContainer">
        <div class="featuredImageContainer">
          <img src="${article.image}" alt="${article.title}">
        </div>
        <div class="featuredData">
          <h2 class="featuredTitle">${article.title}</h2>
        </div>
      </div>
    </a>
  `;
}

async function renderFeaturedArticles(selector = ".featuredGrid") {
  const container = document.querySelector(selector);

  if (!container) {
    return;
  }

  const articles = await getArticles();
  container.innerHTML = articles.map(createArticleCard).join("");
}

async function renderSearchResults(selector = ".featuredGrid") {
  const container = document.querySelector(selector);

  if (!container) {
    return;
  }

  const query = getSearchQuery();
  const filters = getActiveFilters();
  const articles = await getArticles();
  const results = [];

  for (const article of articles) {
    if (articleMatchesFilters(article, filters) && await articleMatchesQuery(article, query)) {
      results.push(article);
    }
  }

  const sortedResults = sortArticles(results, filters.sort);

  container.innerHTML = results.length
    ? sortedResults.map(createArticleCard).join("")
    : `<p class="searchMessage">No articles found${query ? ` for "${query}"` : ""}.</p>`;
}

async function renderHeroArticle(selector = ".heroArticleLink") {
  const heroLink = document.querySelector(selector);

  if (!heroLink) {
    return;
  }

  const articles = await getArticles();
  const article = articles[0];

  heroLink.href = `article.html?id=${article.id}`;
  heroLink.querySelector(".heroArticleImage").src = article.image;
  heroLink.querySelector(".heroArticleImage").alt = article.title;
  heroLink.querySelector(".heroArticleHeader").textContent = article.title;
}

async function renderArticlePage() {
  const articleTitle = document.querySelector(".articleTitle");

  if (!articleTitle) {
    return;
  }

  const params = new URLSearchParams(window.location.search);
  const articleId = params.get("id") || "littler-rotterdam-boos";
  const articles = await getArticles();
  const article = articles.find((item) => item.id === articleId);

  if (!article) {
    articleTitle.textContent = "Article not found";
    document.querySelector(".articleDescription").textContent = "";
    document.querySelector(".articleDate").textContent = "";
    document.querySelector(".articleImage").style.display = "none";
    document.querySelector(".articleContent").textContent = "";
    return;
  }

  articleTitle.textContent = article.articleTitle || article.title;
  document.querySelector(".articleDescription").textContent = article.description || "Add this article description in data/articles.json.";
  document.querySelector(".articleDate").textContent = article.date || "Add article date";
  document.querySelector(".articleImage").src = article.image;
  document.querySelector(".articleImage").alt = article.title;
  const content = await getArticleContent(article);
  document.querySelector(".articleContent").textContent = content.trim() || "Paste this article content in its .txt file.";

  const recommendations = articles
    .filter((item) => item.id !== article.id)
    .slice(0, 4);

  const recommendationsContainer = document.querySelector(".featuredFlex");

  if (recommendationsContainer) {
    recommendationsContainer.innerHTML = recommendations.map(createArticleCard).join("");
  }
}

function initArticleSearch() {
  const searchInputs = document.querySelectorAll(".navBarSearch");
  const query = getSearchQuery();

  searchInputs.forEach((searchInput) => {
    searchInput.value = query;

    searchInput.addEventListener("keydown", (event) => {
      if (event.key !== "Enter") {
        return;
      }

      const searchTerm = searchInput.value.trim();

      if (searchTerm) {
        window.location.href = `searchresult.html?q=${encodeURIComponent(searchTerm)}`;
      } else {
        window.location.href = "searchresult.html";
      }
    });
  });
}

function setUrlList(params, name, values) {
  params.delete(name);
  values.forEach((value) => params.append(name, value));
}

function updateSearchResultsUrl() {
  const params = new URLSearchParams(window.location.search);
  const selectedScopes = [...document.querySelectorAll('input[name="scope"]:checked')].map((input) => input.value);
  const selectedSports = [...document.querySelectorAll('input[name="sport"]:checked')].map((input) => input.value);
  const selectedSort = document.querySelector('input[name="sort"]:checked');

  setUrlList(params, "scope", selectedScopes);
  setUrlList(params, "sport", selectedSports);

  if (selectedSort) {
    params.set("sort", selectedSort.value);
  } else {
    params.delete("sort");
  }

  const nextUrl = `${window.location.pathname}${params.toString() ? `?${params.toString()}` : ""}`;
  window.history.replaceState(null, "", nextUrl);
}

function syncFilterControlsFromUrl() {
  const filters = getActiveFilters();

  document.querySelectorAll('input[name="scope"]').forEach((input) => {
    input.checked = filters.scopes.includes(input.value);
  });

  document.querySelectorAll('input[name="sport"]').forEach((input) => {
    input.checked = filters.sports.includes(input.value);
  });

  document.querySelectorAll('input[name="sort"]').forEach((input) => {
    input.checked = filters.sort === input.value;
  });
}

function initArticleFilters() {
  const filtersPanel = document.querySelector(".filters");

  if (!filtersPanel) {
    return;
  }

  syncFilterControlsFromUrl();

  filtersPanel.addEventListener("change", () => {
    updateSearchResultsUrl();
    renderSearchResults();
  });

  const filterToggle = document.querySelector(".filterToggle");

  if (filterToggle) {
    filterToggle.addEventListener("click", () => {
      filtersPanel.classList.toggle("open");
    });
  }
}
