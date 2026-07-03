let appData = loadAppData();
let editMode = false;
let activeTouchItem = null;
let longPressTimer = null;
let longPressTouchPoint = null;
let editingItemId = null;
let editingNewItemId = null;
let editingBackupItem = null;
let personalityDisplayMode = localStorage.getItem("personalityDisplayMode") || "rate";
const livlyDisplayModeVersion = "stats-first-2026-06-29";
// Set true to restore browser-native dragging on the probability page.
const useNativeProbabilityDrag = false;
// Set false to restore the previous fixed order behavior for unwanted personalities.
const useUnwantedPersonalityReorder = true;
let livlyDisplayMode = localStorage.getItem("livlyDisplayMode") || "stats";
if (localStorage.getItem("livlyDisplayModeVersion") !== livlyDisplayModeVersion) {
  livlyDisplayMode = "stats";
  localStorage.setItem("livlyDisplayMode", livlyDisplayMode);
  localStorage.setItem("livlyDisplayModeVersion", livlyDisplayModeVersion);
}
const cardColumnMin = 1;
const cardColumnNarrowMax = 10;
const cardColumnWideMax = 20;
const cropPresetStorageKey = "livlivCropPresets";
const cropPresetMaxCount = 3;
const materialTagOptions = ["エッセンス", "アニマ", "エレメント", "虫", "タマシイ", "ハウス", "その他"];
const materialSeriesEnabledTags = ["タマシイ", "ハウス"];
let livlyColumnCount = readCardColumnCount("livlyColumnCount");
let materialColumnCount = readCardColumnCount("materialColumnCount");
let materialVisibleTags = readMaterialVisibleTags().slice(0, 1);
let materialVisibleSeriesTags = readMaterialVisibleSeriesTags().slice(0, 1);
let materialSortField = localStorage.getItem("materialSortField") || "";
let materialSortDirection = localStorage.getItem("materialSortDirection") || "desc";
let materialCardDisplayModes = readMaterialCardDisplayModes();
let livlyCardDisplayModes = readLivlyCardDisplayModes();
let livlySortField = localStorage.getItem("livlySortField") || "";
let livlySortDirection = localStorage.getItem("livlySortDirection") || "desc";
let personalityDragState = null;
let personalityRateFormatTimer = null;
let personalityEditBackup = null;
let livlyEditBackup = null;
let livlyEditPanel = null;
let livlyPanelDragState = null;
let openLivlyId = null;
let livlyCropState = null;
let livlyCropDragState = null;
let livlyCropPinnedLoupeHandle = null;
let livlyCropPinPressTimer = null;
let livlyCropLoupePosition = null;
let livlyCropLoupeDragState = null;
let livlyDeletePressTimer = null;
let livlyDeletePressTarget = null;
let suppressNextLivlyClick = false;
let materialEditBackup = null;
let openMaterialId = null;
let materialFilterDragState = null;
let suppressNextMaterialFilterClick = false;
let materialHeaderFitFrame = 0;
let livlyHeaderFitFrame = 0;
let materialNameEditPanel = null;
let materialSeriesEditPanel = null;
let editCopyClipboard = null;
let editCopyPressTimer = null;
let editCopyPressTarget = null;
let suppressNextEditCopyClick = false;
let globalDisplayTogglePressTimer = null;
let globalDisplayTogglePressTarget = null;
let suppressGlobalDisplayToggleClickUntil = 0;
const editCopySelectMode = {
  livlies: false,
  materials: false
};
const editCopySelectedIds = {
  livlies: new Set(),
  materials: new Set()
};
let probabilitySettingsBackup = null;
let probabilitySuccessGroups = [[]];
let probabilityActiveGroupIndex = 0;
let probabilityUnwantedPersonalityIds = [];
let probabilityDragState = null;
let probabilityNativeDropInsideUnwanted = false;
let probabilityNativeDragSource = "";
let probabilityNativeDragId = "";
let probabilityLastDragPoint = null;
let probabilityInfoPanelScheduleToken = 0;
let probabilityInfoPanelScheduledPoint = null;
let suppressNextProbabilityClick = false;
let experienceEditBackup = null;
let expSelectedLivlyId = "";
let expCurrentLevel = "1";
let expTargetLevel = "2";
let expGrowthType = "normal";
let expCurrentRebirth = "0";
let expTargetRebirth = "0";
let firebaseServices = window.livlivFirebase || null;
let firebaseAuthReady = false;
let firebaseAuthSubscribed = false;
let firebaseUser = null;
let firebaseAuthError = "";
let expDeletePressTimer = null;
let expDeletePressTarget = null;
let suppressNextExpClick = false;
let ddEditBackup = null;
let suppressNextTouchClick = false;
let activeInfoHost = null;

if (!["rate", "content", "all"].includes(personalityDisplayMode)) {
  personalityDisplayMode = "rate";
}

if (livlyDisplayMode === "summary") {
  livlyDisplayMode = "stats";
}

if (livlyDisplayMode === "detail") {
  livlyDisplayMode = "stats";
}

if (!["profile", "stats"].includes(livlyDisplayMode)) {
  livlyDisplayMode = "stats";
}

const livlySortFieldOptions = [
  ["", "並べ替えなし"],
  ["hpLevels", "HP"],
  ["attackLevels", "攻撃力"],
  ["fullness", "満腹量"],
  ["handLevels", "手札枚数"],
  ["ddEmissions", "dd排出量"],
  ["facilitySuitability", "施設適性"],
  ["movementPowers", "移動力"]
];

const materialSortFieldOptions = [
  ["", "並べ替えなし"],
  ["purchasePrice", "購入価格"],
  ["tradePrice", "取引価格"],
  ["merchantTradePrice", "商人価格"],
  ["buybackPrice", "買取価格"]
];

const materialEditCopyLabels = {
  name: "名前",
  imageUrl: "画像",
  tags: "タグ",
  seriesTags: "シリーズ",
  content: "説明",
  effect: "効果",
  acquisitionMethod: "入手方法",
  purchasePrice: "購入価格",
  tradePrice: "取引価格",
  merchantTradePrice: "商人価格",
  buybackPrice: "買取価格"
};

if (!livlySortFieldOptions.some(option => option[0] === livlySortField)) {
  livlySortField = "";
}

if (!["asc", "desc"].includes(livlySortDirection)) {
  livlySortDirection = "desc";
}

if (!materialSortFieldOptions.some(option => option[0] === materialSortField)) {
  materialSortField = "";
}

if (!["asc", "desc"].includes(materialSortDirection)) {
  materialSortDirection = "desc";
}

const listRoutes = ["livlies", "personalities", "materials"];
const routeConfig = {
  livlies: {
    title: "リブリー一覧",
    label: "リブリー",
    addLabel: "新しいリブリーを追加",
    emptyText: "まだリブリーが登録されていません。"
  },
  personalities: {
    title: "個性一覧",
    label: "個性",
    addLabel: "新しい個性を追加",
    emptyText: "まだ個性が登録されていません。"
  },
  personalityProbability: {
    title: "個性確率計算",
    emptyText: "まだ個性が登録されていません。"
  },
  materials: {
    title: "素材一覧",
    label: "素材",
    addLabel: "新しい素材を追加",
    emptyText: "まだ素材が登録されていません。"
  },
  dd: {
    title: "dd排出量計算",
    emptyText: "ここにdd排出量計算を表示します。"
  },
  exp: {
    title: "経験値計算",
    emptyText: "ここに経験値計算を表示します。"
  }
};

let activeRoute = getInitialRoute();

const pageTitle = document.getElementById("pageTitle");
const contentArea = document.getElementById("contentArea");
const editToolbar = document.getElementById("editToolbar");
const editModeButton = document.getElementById("editModeButton");
const menuAuthPanel = document.getElementById("menuAuthPanel");
const authStatusText = document.getElementById("authStatusText");
const authLoginForm = document.getElementById("authLoginForm");
const authEmailInput = document.getElementById("authEmailInput");
const authPasswordInput = document.getElementById("authPasswordInput");
const authLoginButton = document.getElementById("authLoginButton");
const authLogoutButton = document.getElementById("authLogoutButton");
const addNewButton = document.getElementById("addNewButton");
const itemModal = document.getElementById("itemModal");
const modalTitle = document.getElementById("modalTitle");
const modalBody = document.getElementById("modalBody");
const modalSaveButton = document.getElementById("modalSaveButton");
const modalDeleteButton = document.getElementById("modalDeleteButton");
const modalCancelButton = document.getElementById("modalCancelButton");
const modalCloseButton = document.getElementById("modalCloseButton");
const menuButton = document.getElementById("menuButton");
const floatingMenu = document.getElementById("floatingMenu");
const routeButtons = document.querySelectorAll("[data-route]");

function getInitialRoute() {
  const route = window.location.hash.replace("#", "");
  return routeConfig[route] ? route : "livlies";
}

function createId(prefix) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function isListRoute(route = activeRoute) {
  return listRoutes.includes(route);
}

function itemTitle(item, index) {
  if (activeRoute === "livlies") {
    return livlyTitle(item, index);
  }

  return item.name || `名前未設定 ${index + 1}`;
}

function livlyTitle(item, index = 0) {
  return blankText(item.species, `種類未設定 ${index + 1}`);
}

function cloneData(value) {
  return JSON.parse(JSON.stringify(value));
}

function normalizeNumericInputText(value) {
  return String(value ?? "")
    .replace(/[０-９]/g, character => String.fromCharCode(character.charCodeAt(0) - 0xfee0))
    .replace(/[。．]/g, ".");
}

function cleanPercentageNumber(value) {
  const numericText = normalizeNumericInputText(value)
    .replace(/％/g, "%")
    .replace(/%/g, "")
    .replace(/[^\d.]/g, "");
  const parts = numericText.split(".");
  const hasDecimalPoint = parts.length > 1;
  let integerPart = parts[0].replace(/^0+(?=\d)/, "");

  if (!integerPart && hasDecimalPoint) {
    integerPart = "0";
  }

  if (!integerPart && parts[0]) {
    integerPart = "0";
  }

  if (!hasDecimalPoint) {
    return integerPart || "";
  }

  return `${integerPart}.${parts.slice(1).join("").slice(0, 2)}`;
}

function formatPercentageNumber(value) {
  const cleanValue = cleanPercentageNumber(value).replace(/\.+$/g, "");

  if (!/\d/.test(cleanValue)) {
    return "";
  }

  return Number(cleanValue).toFixed(2);
}

function percentageInputValue(value) {
  return formatPercentageNumber(value);
}

function percentageStorageValue(value) {
  const formattedValue = formatPercentageNumber(value);

  if (!formattedValue) {
    return "";
  }

  return `${formattedValue}%`;
}

function blankText(value, fallback = "未設定") {
  return String(value ?? "").trim() || fallback;
}

function numberText(value, fallback = "未設定") {
  const text = normalizeNumericInputText(value).replace(/[^\d.]/g, "");
  return text || fallback;
}

function ddMarkText(row) {
  const blackCount = Math.max(0, Number(row.blackCount) || 0);
  const whiteCount = Math.max(0, Number(row.whiteCount) || 0);
  const marks = `${"⚫︎".repeat(blackCount)}${"⚪︎".repeat(whiteCount)}`;
  return marks || "未設定";
}

const livlyFieldLabels = {
  species: "種類",
  feature: "特徴",
  hpLevels: "HP",
  fullness: "満腹量",
  ddEmissions: "dd排出量",
  facilitySuitability: "施設適性",
  movementTypes: "移動タイプ",
  movementPowers: "移動力",
  handLevels: "手札枚数",
  attackLevels: "攻撃力",
  waza: "/waza",
  favorite: "得意なこと"
};

function livlyFormalFieldLabel(field, fallback = "") {
  return livlyFieldLabels[field] || fallback || "情報";
}

const livlySummaryFields = [
  "feature",
  "hpLevels",
  "ddEmissions",
  "facilitySuitability",
  "fullness",
  "attackLevels",
  "waza",
  "handLevels",
  "movementTypes",
  "movementPowers",
  "favorite"
];

const livlyInlineInputFields = new Set(["species", "feature", "fullness", "waza", "favorite"]);
const livlyNoInfoPanelFields = new Set(["species", "feature", "favorite"]);
const livlyLevelRowFields = new Set(["hpLevels", "ddEmissions", "handLevels", "attackLevels"]);

function renderView() {
  const config = routeConfig[activeRoute];
  pageTitle.textContent = config.title;
  document.title = config.title;
  document.body.dataset.activeRoute = activeRoute;

  routeButtons.forEach(button => {
    button.classList.toggle("is-active", button.dataset.route === activeRoute);
  });

  if (!isListRoute()) {
    editToolbar.hidden = true;

    if (activeRoute === "personalityProbability") {
      beginProbabilitySettingsEditSession();
      contentArea.innerHTML = renderPersonalityProbabilityView();
      return;
    }

    if (activeRoute === "exp") {
      beginExperienceEditSession();
      contentArea.innerHTML = renderExperienceCalculatorView();
      return;
    }

    if (activeRoute === "dd") {
      beginDdEditSession();
      contentArea.innerHTML = renderDdCalculatorView();
      return;
    }

    contentArea.innerHTML = `
      <section class="card list-empty">
        <p>${escapeHtml(config.emptyText)}</p>
      </section>
    `;
    return;
  }

  const items = appData[activeRoute];
  editToolbar.hidden = !editMode || activeRoute === "personalities" || activeRoute === "livlies" || activeRoute === "materials";
  addNewButton.textContent = config.addLabel;

  if (activeRoute === "livlies") {
    beginLivlyEditSession();
    contentArea.innerHTML = renderLivlyListView(items);
    scheduleFloatingLivlyEditPanel();
    scheduleLivlyHeaderFit();
    return;
  }

  if (activeRoute === "personalities") {
    beginPersonalityEditSession();
    contentArea.innerHTML = renderPersonalityView(items);
    return;
  }

  if (activeRoute === "materials") {
    beginMaterialEditSession();
    contentArea.innerHTML = renderMaterialView(items);
    scheduleMaterialHeaderFit();
    scheduleMaterialNameEditPanel();
    scheduleMaterialSeriesEditPanel();
    return;
  }

  if (!items.length) {
    contentArea.innerHTML = `
      <section class="card list-empty">
        <p>${escapeHtml(config.emptyText)}</p>
      </section>
    `;
    return;
  }

  contentArea.innerHTML = `
    <section class="list-grid">
      ${items.map((item, index) => renderListItem(item, index)).join("")}
    </section>
  `;
}

function renderPersonalityView(items) {
  const saveButton = editMode
    ? `
      <button type="button" class="personality-save-button ${hasUnsavedPersonalityEdits() ? "is-dirty" : ""}" data-action="save-personalities">
        編集内容を保存
      </button>
    `
    : "";
  const addButton = editMode
    ? `
      <button type="button" class="personality-add-bottom" data-action="add-personality">
        新しい個性を追加
      </button>
    `
    : "";
  const listContent = items.length
    ? `
      <section class="personality-list">
        ${items.map((item, index) => renderPersonalityRow(item, index)).join("")}
      </section>
    `
    : `
      <section class="card list-empty">
        <p>${escapeHtml(routeConfig.personalities.emptyText)}</p>
      </section>
    `;

  return `
    ${saveButton}
    ${renderPersonalityFilter()}
    ${listContent}
    ${addButton}
  `;
}

function renderPersonalityFilter() {
  const filterOptions = [
    { value: "rate", label: "確率" },
    { value: "content", label: "内容" },
    { value: "all", label: "全部" }
  ];

  return `
    <section class="personality-filter" aria-label="個性の表示フィルター">
      <div>
        ${filterOptions.map(option => `
          <button
            type="button"
            class="${personalityDisplayMode === option.value ? "is-active" : ""}"
            data-personality-display="${option.value}"
          >
            ${option.label}
          </button>
        `).join("")}
      </div>
    </section>
  `;
}

function renderMaterialView(items) {
  const visibleItems = sortMaterialItems(filterMaterialItems(items));
  const saveButton = editMode
    ? `
      <button type="button" class="personality-save-button ${hasUnsavedMaterialEdits() ? "is-dirty" : ""}" data-action="save-materials">
        編集内容を保存
      </button>
    `
    : "";
  const addButton = editMode
    ? renderAddActionRow("materials")
    : "";

  if (!items.length) {
    return `
      ${saveButton}
      ${editMode ? renderMaterialDisplayFilter() : ""}
      <section class="card list-empty">
        <p>${escapeHtml(routeConfig.materials.emptyText)}</p>
      </section>
      ${addButton}
    `;
  }

  return `
    ${saveButton}
    ${renderEditCopyToolbar("materials", visibleItems)}
    ${renderMaterialDisplayFilter()}
    ${visibleItems.length
      ? `
        <section class="material-card-list" ${cardColumnStyle(materialColumnCount)}>
          ${visibleItems.map((item, index) => renderMaterialCard(item, index)).join("")}
        </section>
      `
      : `
        <section class="card list-empty">
          <p>表示する素材がありません。</p>
        </section>
      `
    }
    ${addButton}
  `;
}

function renderMaterialDisplayFilter() {
  return `
    <section class="material-display-filter card-layout-filter" aria-label="素材の表示設定">
      <div class="material-display-top-row">
        <div class="material-filter-card material-sort-card">
          ${renderMaterialSortControls()}
        </div>
        ${renderCardColumnSlider("materials", materialColumnCount)}
      </div>
      <div class="material-display-bottom-row">
        <div class="material-filter-card">
          ${renderMaterialTagFilter()}
        </div>
        <div class="material-filter-card">
          ${renderMaterialSeriesFilter()}
        </div>
      </div>
      ${editMode ? `<div class="material-filter-card material-series-editor-card">${renderMaterialSeriesEditor()}</div>` : ""}
    </section>
  `;
}

function renderMaterialSortControls() {
  return `
    <div class="material-sort-controls" aria-label="素材の並べ替え">
      <select data-material-sort-field aria-label="並べ替え項目">
        ${materialSortFieldOptions.map(option => `
          <option value="${escapeHtml(option[0])}" ${materialSortField === option[0] ? "selected" : ""}>${escapeHtml(option[1])}</option>
        `).join("")}
      </select>
      <button type="button" class="livly-sort-direction is-${materialSortDirection}" data-material-sort-direction aria-label="${materialSortDirection === "desc" ? "大きい順" : "小さい順"}">
        <span aria-hidden="true"></span>
      </button>
    </div>
  `;
}

function renderAddActionRow(route) {
  const isMaterial = route === "materials";
  const label = isMaterial ? "素材" : "リブリー";
  const addAction = isMaterial ? "add-material-inline" : "add-livly-inline";
  const addClass = isMaterial ? "personality-add-bottom material-add-bottom" : "personality-add-bottom";

  return `
    <div class="add-action-row" data-bulk-upload-zone="${escapeHtml(route)}">
      <button type="button" class="${addClass}" data-action="${addAction}">
        新しい${escapeHtml(label)}を追加
      </button>
      ${renderBulkImageUpload(route)}
    </div>
  `;
}

function renderBulkImageUpload(route) {
  const label = route === "materials" ? "素材" : "リブリー";

  return `
    <label class="livly-file-picker bulk-file-picker" aria-label="${escapeHtml(label)}の画像をまとめて追加">
      <span class="bulk-upload-dotted" aria-hidden="true"></span>
      <input type="file" accept="image/*" multiple data-bulk-image-upload="${escapeHtml(route)}" aria-label="${escapeHtml(label)}の画像をまとめてアップロード">
      <span class="info-popover bulk-upload-info-popover" role="dialog" aria-label="複数画像追加の説明">
        <strong>複数画像を選択</strong>
        <span>同じ縦横比率の画像だけ、まとめて追加できます。</span>
        <span>一つをトリミングすると、同じ座標で一括トリミングできます。</span>
      </span>
    </label>
  `;
}

function renderMaterialTagFilter() {
  const selectedTag = materialVisibleTags[0] || "";

  return `
    <div class="material-filter-row" aria-label="素材タグフィルター">
      <span class="material-filter-label">タグ</span>
      <select class="material-filter-select" data-material-filter-select aria-label="素材タグフィルター">
        <option value="" ${selectedTag ? "" : "selected"}>全部</option>
        ${materialTagOptions.map(tag => `
          <option value="${escapeHtml(tag)}" ${selectedTag === tag ? "selected" : ""}>${escapeHtml(tag)}</option>
        `).join("")}
      </select>
    </div>
  `;
}

function renderMaterialSeriesFilter() {
  const disabled = !isMaterialSeriesFilterAvailable();
  const selectedSeries = disabled ? "" : materialVisibleSeriesTags[0] || "";

  return `
    <div class="material-filter-row ${disabled ? "is-disabled" : ""}" aria-label="素材シリーズフィルター">
      <span class="material-filter-label">シリーズ</span>
      <select class="material-filter-select" data-material-series-filter-select aria-label="素材シリーズフィルター" ${disabled ? "disabled" : ""}>
        <option value="" ${selectedSeries ? "" : "selected"}>${disabled ? "" : "全部"}</option>
        ${appData.materialSeriesTags.map(tag => `
          <option value="${escapeHtml(tag)}" ${selectedSeries === tag ? "selected" : ""}>${escapeHtml(tag)}</option>
        `).join("")}
      </select>
    </div>
  `;
}

function renderMaterialSeriesEditor() {
  return `
    <div class="material-series-editor">
      <button type="button" class="material-series-add-button" data-action="open-material-series-panel" data-material-series-mode="add" aria-label="シリーズを追加">＋</button>
      <div class="material-series-manage-list" aria-label="シリーズ編集">
        ${appData.materialSeriesTags.length ? appData.materialSeriesTags.map(tag => `
          <span class="material-series-manage-chip" title="${escapeHtml(tag)}">
            <button type="button" class="material-series-name-button" data-action="open-material-series-panel" data-material-series-mode="edit" data-material-series-name="${escapeHtml(tag)}" aria-label="${escapeHtml(tag)}を編集">
              ${escapeHtml(tag)}
            </button>
          </span>
        `).join("") : `<p class="material-series-empty">シリーズ未登録</p>`}
      </div>
      ${renderMaterialSeriesEditPanel()}
    </div>
  `;
}

function renderMaterialSeriesEditPanel() {
  if (!editMode || !materialSeriesEditPanel) {
    return "";
  }

  const isEdit = materialSeriesEditPanel.mode === "edit";
  const panelStyle = Number.isFinite(materialSeriesEditPanel.x) && Number.isFinite(materialSeriesEditPanel.y)
    ? ` style="--material-series-panel-left:${Math.round(materialSeriesEditPanel.x)}px; --material-series-panel-top:${Math.round(materialSeriesEditPanel.y)}px;"`
    : "";
  const value = isEdit ? materialSeriesEditPanel.name : "";

  return `
    <section class="material-series-edit-panel"${panelStyle} data-material-series-panel>
      <div class="material-series-panel-heading">
        <span>${isEdit ? "シリーズを編集" : "シリーズを追加"}</span>
        <button type="button" data-action="close-material-series-panel" aria-label="閉じる">×</button>
      </div>
      <label class="material-series-panel-field">
        <span>シリーズ</span>
        <input type="text" data-material-series-panel-input value="${escapeHtml(value)}" placeholder="シリーズ名" aria-label="シリーズ名">
      </label>
      <div class="material-series-panel-actions">
        ${isEdit ? `<button type="button" class="plain-button danger-button" data-action="delete-material-series-panel">削除</button>` : ""}
        <button type="button" class="plain-button" data-action="save-material-series-panel">保存</button>
      </div>
    </section>
  `;
}

function readMaterialVisibleTags() {
  try {
    const savedTags = JSON.parse(localStorage.getItem("materialVisibleTags") || "[]");

    if (!Array.isArray(savedTags)) {
      return [];
    }

    return cleanMaterialTags(savedTags);
  } catch (error) {
    return [];
  }
}

function readMaterialVisibleSeriesTags() {
  try {
    const savedTags = JSON.parse(localStorage.getItem("materialVisibleSeriesTags") || "[]");

    if (!Array.isArray(savedTags)) {
      return [];
    }

    return cleanMaterialSeriesTags(savedTags, true);
  } catch (error) {
    return [];
  }
}

function saveMaterialVisibleTags() {
  localStorage.setItem("materialVisibleTags", JSON.stringify(materialVisibleTags));
}

function saveMaterialVisibleSeriesTags() {
  localStorage.setItem("materialVisibleSeriesTags", JSON.stringify(materialVisibleSeriesTags));
}

function cleanMaterialTags(tags) {
  if (!Array.isArray(tags)) {
    return [];
  }

  return [...new Set(tags.map(tag => String(tag || "")).filter(tag => materialTagOptions.includes(tag)))];
}

function itemMaterialTags(item) {
  const tags = cleanMaterialTags(item.tags);

  return tags.length ? tags : ["その他"];
}

function cleanMaterialSeriesTags(tags, onlyExisting = false) {
  if (!Array.isArray(tags)) {
    return [];
  }

  const allowedTags = new Set(appData.materialSeriesTags || []);

  return [...new Set(tags
    .map(tag => String(tag || "").trim())
    .filter(tag => tag && (!onlyExisting || allowedTags.has(tag))))];
}

function itemMaterialSeriesTags(item) {
  return cleanMaterialSeriesTags(item.seriesTags);
}

function materialAllowsSeries(tags) {
  return cleanMaterialTags(tags).some(tag => materialSeriesEnabledTags.includes(tag));
}

function isMaterialSeriesFilterAvailable() {
  if (!materialVisibleTags.length) {
    return true;
  }

  return materialVisibleTags.some(tag => materialSeriesEnabledTags.includes(tag));
}

function filterMaterialItems(items) {
  const useSeriesFilter = isMaterialSeriesFilterAvailable() && materialVisibleSeriesTags.length;

  return items.filter(item => {
    const matchesTag = !materialVisibleTags.length ||
      itemMaterialTags(item).some(tag => materialVisibleTags.includes(tag));
    const matchesSeries = !useSeriesFilter ||
      itemMaterialSeriesTags(item).some(tag => materialVisibleSeriesTags.includes(tag));

    return matchesTag && matchesSeries;
  });
}

function sortMaterialItems(items) {
  if (!materialSortField) {
    return items;
  }

  return items
    .map((item, index) => ({ item, index, value: materialSortValue(item, materialSortField) }))
    .sort((left, right) => {
      const leftMissing = !Number.isFinite(left.value);
      const rightMissing = !Number.isFinite(right.value);

      if (leftMissing && rightMissing) {
        return left.index - right.index;
      }

      if (leftMissing) {
        return 1;
      }

      if (rightMissing) {
        return -1;
      }

      const diff = materialSortDirection === "asc"
        ? left.value - right.value
        : right.value - left.value;

      return diff || left.index - right.index;
    })
    .map(entry => entry.item);
}

function materialSortValue(item, field) {
  if (!materialSortFieldOptions.some(option => option[0] === field)) {
    return Number.NaN;
  }

  return numericSortValue(item[field]);
}

function readMaterialCardDisplayModes() {
  try {
    const savedModes = JSON.parse(localStorage.getItem("materialCardDisplayModes") || "{}");

    if (!savedModes || typeof savedModes !== "object" || Array.isArray(savedModes)) {
      return {};
    }

    return Object.fromEntries(Object.entries(savedModes).filter(([, mode]) => ["info", "price"].includes(mode)));
  } catch (error) {
    return {};
  }
}

function saveMaterialCardDisplayModes() {
  localStorage.setItem("materialCardDisplayModes", JSON.stringify(materialCardDisplayModes));
}

function materialDisplayModeFor(item) {
  return materialCardDisplayModes[item.id] === "price" ? "price" : "info";
}

function readLivlyCardDisplayModes() {
  try {
    const savedModes = JSON.parse(localStorage.getItem("livlyCardDisplayModes") || "{}");

    if (!savedModes || typeof savedModes !== "object" || Array.isArray(savedModes)) {
      return {};
    }

    return Object.fromEntries(Object.entries(savedModes).filter(([, mode]) => ["profile", "stats"].includes(mode)));
  } catch (error) {
    return {};
  }
}

function saveLivlyCardDisplayModes() {
  localStorage.setItem("livlyCardDisplayModes", JSON.stringify(livlyCardDisplayModes));
}

function livlyCardDisplayModeFor(item) {
  return livlyCardDisplayModes[item.id] === "profile" ? "profile" : "stats";
}

function displayToggleActionFromTarget(target) {
  const livlyButton = target.closest?.("[data-livly-card-display-toggle]");

  if (livlyButton && activeRoute === "livlies") {
    const card = livlyButton.closest("[data-id]");
    const item = card ? appData.livlies.find(livly => livly.id === card.dataset.id) : null;

    if (!item) {
      return null;
    }

    const currentMode = livlyCardDisplayModeFor(item);

    return {
      route: "livlies",
      mode: currentMode === "profile" ? "stats" : "profile"
    };
  }

  const materialButton = target.closest?.("[data-material-display-toggle]");

  if (materialButton && activeRoute === "materials") {
    const card = materialButton.closest("[data-id]");
    const item = card ? appData.materials.find(material => material.id === card.dataset.id) : null;

    if (!item) {
      return null;
    }

    const currentMode = materialDisplayModeFor(item);

    return {
      route: "materials",
      mode: currentMode === "price" ? "info" : "price"
    };
  }

  return null;
}

function applyGlobalDisplayToggle(actionInfo) {
  if (!actionInfo) {
    return false;
  }

  if (actionInfo.route === "livlies") {
    appData.livlies.forEach(item => {
      livlyCardDisplayModes[item.id] = actionInfo.mode;
    });
    saveLivlyCardDisplayModes();
    closeTouchInfo();
    renderView();
    return true;
  }

  if (actionInfo.route === "materials") {
    appData.materials.forEach(item => {
      materialCardDisplayModes[item.id] = actionInfo.mode;
    });
    saveMaterialCardDisplayModes();
    closeTouchInfo();
    renderView();
    return true;
  }

  return false;
}

function clearGlobalDisplayTogglePressTimer() {
  clearTimeout(globalDisplayTogglePressTimer);
  globalDisplayTogglePressTimer = null;
  globalDisplayTogglePressTarget = null;
}

function readCardColumnCount(storageKey) {
  return clampCardColumnCount(localStorage.getItem(storageKey));
}

function currentCardColumnMax() {
  return document.documentElement.clientWidth >= 1000 ? cardColumnWideMax : cardColumnNarrowMax;
}

function clampCardColumnCount(value) {
  const count = Number.parseInt(value, 10);

  if (!Number.isFinite(count)) {
    return 4;
  }

  return Math.min(Math.max(count, cardColumnMin), currentCardColumnMax());
}

function cardColumnStyle(value) {
  return `style="--card-columns:${clampCardColumnCount(value)}"`;
}

function compactTextClass(value, thresholds = { medium: 12, long: 18, dense: 26 }) {
  const length = Array.from(String(value || "").replace(/\s+/g, "")).length;

  if (length >= thresholds.dense) {
    return "is-text-dense";
  }

  if (length >= thresholds.long) {
    return "is-text-long";
  }

  if (length >= thresholds.medium) {
    return "is-text-medium";
  }

  return "";
}

function compactTagClass(tags) {
  const safeTags = Array.isArray(tags) ? tags : [];
  const totalLength = safeTags.reduce((sum, tag) => sum + Array.from(String(tag || "").replace(/\s+/g, "")).length, 0);
  const weightedLength = totalLength + Math.max(0, safeTags.length - 1) * 3;

  return compactTextClass("x".repeat(weightedLength), { medium: 10, long: 16, dense: 22 });
}

function renderCardColumnSlider(route, value) {
  const count = clampCardColumnCount(value);
  const max = currentCardColumnMax();
  const label = route === "materials" ? "素材" : "リブリー";

  return `
    <label class="card-column-slider">
      <span><strong data-card-column-value>${count}</strong></span>
      <input
        type="range"
        min="${cardColumnMin}"
        max="${max}"
        step="1"
        value="${count}"
        data-card-column-slider="${escapeHtml(route)}"
        aria-label="${escapeHtml(label)}を横に並べる列数"
      >
    </label>
  `;
}

function editCopyLabel(route, field) {
  if (route === "materials") {
    return materialEditCopyLabels[field] || "編集";
  }

  if (route === "livlies") {
    return field === "imageUrl" ? "画像" : livlyFieldLabels[field] || "編集";
  }

  return "編集";
}

function isEditCopySelected(route, itemId) {
  return editCopySelectedIds[route]?.has(itemId) || false;
}

function renderEditCopyCardSelector(route, item, title) {
  if (!editMode || !editCopySelectMode[route]) {
    return "";
  }

  const selected = isEditCopySelected(route, item.id);

  return `
    <button
      type="button"
      class="edit-copy-card-selector ${selected ? "is-selected" : ""}"
      data-action="toggle-edit-copy-card"
      data-copy-route="${escapeHtml(route)}"
      aria-pressed="${selected ? "true" : "false"}"
      aria-label="${escapeHtml(title)}を${selected ? "選択解除" : "選択"}"
    >
      <span aria-hidden="true">${selected ? "✓" : ""}</span>
    </button>
  `;
}

function renderEditCopyToolbar(route, visibleItems = []) {
  if (!editMode || !["livlies", "materials"].includes(route)) {
    return "";
  }

  const selectedCount = editCopySelectedIds[route]?.size || 0;
  const canPaste = Boolean(editCopyClipboard && editCopyClipboard.route === route && selectedCount > 0);
  const copiedText = editCopyClipboard?.route === route
    ? `${editCopyClipboard.label}をコピー中`
    : "コピーなし";

  return `
    <section class="edit-copy-toolbar" aria-label="編集コピー">
      <button type="button" class="${editCopySelectMode[route] ? "is-active" : ""}" data-action="toggle-edit-copy-select-mode">
        複数選択
      </button>
      <span class="edit-copy-status">${escapeHtml(copiedText)}</span>
      <span class="edit-copy-count">選択 ${selectedCount}</span>
      <button type="button" data-action="select-all-edit-copy" ${visibleItems.length ? "" : "disabled"}>全選択</button>
      <button type="button" data-action="clear-edit-copy-selection" ${selectedCount ? "" : "disabled"}>解除</button>
      <button type="button" class="edit-copy-paste-button" data-action="paste-edit-copy" ${canPaste ? "" : "disabled"}>ペースト</button>
    </section>
  `;
}

function scheduleMaterialHeaderFit() {
  if (materialHeaderFitFrame) {
    cancelAnimationFrame(materialHeaderFitFrame);
  }

  materialHeaderFitFrame = requestAnimationFrame(() => {
    materialHeaderFitFrame = 0;
    fitMaterialHeaderLines();
  });
}

function scheduleLivlyHeaderFit() {
  if (livlyHeaderFitFrame) {
    cancelAnimationFrame(livlyHeaderFitFrame);
  }

  livlyHeaderFitFrame = requestAnimationFrame(() => {
    livlyHeaderFitFrame = 0;
    fitLivlyHeaderLines(contentArea);
  });
}

function fittedScale(availableWidth, contentWidth, minimum = 0.12) {
  if (!availableWidth || !contentWidth || contentWidth <= availableWidth) {
    return 1;
  }

  return Math.max(minimum, availableWidth / contentWidth);
}

function fitScaledLine(element, container, minimum = 0.12) {
  if (!element || !container) {
    return;
  }

  element.style.setProperty("--fit-scale", "1");
  const availableWidth = Math.max(1, container.clientWidth - 2);
  const contentWidth = element.scrollWidth;
  const scale = fittedScale(availableWidth, contentWidth, minimum);
  element.style.setProperty("--fit-scale", scale.toFixed(4));
  element.classList.toggle("is-fit-scaled", scale < 0.995);
}

function fitFontSizeLine(element, container, minimum = 0.42) {
  if (!element || !container) {
    return;
  }

  element.style.removeProperty("font-size");
  element.style.setProperty("--fit-scale", "1");
  const availableWidth = Math.max(1, container.clientWidth - 2);
  const contentWidth = element.scrollWidth;
  const baseSize = Number.parseFloat(getComputedStyle(element).fontSize) || 20;
  const scale = fittedScale(availableWidth, contentWidth, minimum);
  const fittedSize = Math.max(baseSize * minimum, baseSize * scale);

  element.style.fontSize = `${fittedSize.toFixed(2)}px`;
  element.classList.toggle("is-fit-scaled", scale < 0.995);
}

function fitFontSizeBox(element, container = element.parentElement, minimum = 0.35) {
  if (!element || !container) {
    return;
  }

  element.style.removeProperty("font-size");
  element.style.setProperty("--fit-scale", "1");

  const baseSize = Number.parseFloat(getComputedStyle(element).fontSize) || 16;
  const elementRect = element.getBoundingClientRect();
  const containerRect = container.getBoundingClientRect();
  const availableWidth = Math.max(1, Math.min(
    element.clientWidth || elementRect.width || containerRect.width,
    container.clientWidth || containerRect.width
  ) - 2);
  const availableHeight = Math.max(1, Math.min(
    element.clientHeight || elementRect.height || containerRect.height,
    container.clientHeight || containerRect.height
  ) - 1);
  const widthScale = element.scrollWidth > availableWidth
    ? availableWidth / element.scrollWidth
    : 1;
  const heightScale = element.scrollHeight > availableHeight
    ? availableHeight / element.scrollHeight
    : 1;
  const scale = Math.max(minimum, Math.min(widthScale, heightScale, 1));

  element.style.fontSize = `${(baseSize * scale).toFixed(2)}px`;
  element.classList.toggle("is-fit-scaled", scale < 0.995);
}

function fitLivlyHeaderLines(root = contentArea) {
  root.querySelectorAll("[data-livly-title-fit]").forEach(titleText => {
    fitFontSizeLine(titleText, titleText.closest(".livly-display-field.is-title"), 0.42);
  });
}

function fitMaterialHeaderLines(root = contentArea) {
  if (root === contentArea && activeRoute !== "materials") {
    return;
  }

  root.querySelectorAll(".material-card-header").forEach(header => {
    const titleText = header.querySelector("[data-material-fit-text]");
    fitScaledLine(titleText, titleText?.closest(".material-card-title"), 0.04);

    header.querySelectorAll(".material-tag-display").forEach(line => {
      fitScaledLine(line, line.parentElement, 0.04);
    });
  });
}

function renderMaterialCard(item, index) {
  const title = item.name || `素材未設定 ${index + 1}`;
  const isOpen = materialColumnCount === 1 || openMaterialId === item.id;
  const displayMode = materialDisplayModeFor(item);
  const isPriceMode = displayMode === "price";

  return `
    <article class="material-detail-card ${editMode ? "is-editable" : ""} ${isOpen ? "is-open-card" : ""} ${isEditCopySelected("materials", item.id) ? "is-copy-selected" : ""} is-material-${escapeHtml(displayMode)}" data-id="${escapeHtml(item.id)}" data-material-expanded="${isOpen ? "true" : "false"}" tabindex="0">
      ${renderEditCopyCardSelector("materials", item, title)}
      <div class="material-card-layout">
        <div class="material-card-header">
          <div class="material-card-actions">
            <button type="button" class="material-display-toggle-button ${isPriceMode ? "is-price-mode" : ""}" data-material-display-toggle aria-label="${escapeHtml(title)}の表示を${isPriceMode ? "説明" : "価格"}に切り替え">
              <span class="material-toggle-icon" aria-hidden="true"></span>
            </button>
            ${editMode ? `<button type="button" class="personality-delete-button" data-action="delete-material" aria-label="${escapeHtml(title)}を削除">🗑</button>` : ""}
          </div>
          <div class="material-card-name-block">
            ${renderMaterialNameField(item, title)}
          </div>
          <div class="material-card-tag-row">
            ${renderMaterialTagArea(item)}
          </div>
          <div class="material-card-series-row">
            ${renderMaterialSeriesArea(item)}
          </div>
        </div>
        <div class="material-card-main-row">
          <div class="material-visual-column">
            ${renderMaterialImageArea(item, title)}
            ${editMode ? renderMaterialImageEditor(item, title) : ""}
          </div>
          <div class="material-card-body">
            <div class="material-card-grid material-card-mode-fields">
              ${renderMaterialModeFields(item, displayMode)}
            </div>
          </div>
        </div>
      </div>
      ${renderMaterialNameEditPanel(item)}
    </article>
  `;
}

function renderMaterialNameField(item, title) {
  if (editMode) {
    return `
      <button type="button" class="material-name-edit-button material-card-title ${compactTextClass(title, { medium: 8, long: 12, dense: 18 })}" data-action="open-material-name-panel" data-edit-copy-field="name" aria-label="${escapeHtml(title)}の名前を編集">
        <span class="material-card-title-text" data-material-fit-text>${escapeHtml(title)}</span>
      </button>
    `;
  }

  return `
    <div class="material-name-info-host" tabindex="0">
      <h2 class="material-card-title ${compactTextClass(title, { medium: 8, long: 12, dense: 18 })}">
        <span class="material-card-title-text" data-material-fit-text>${escapeHtml(title)}</span>
      </h2>
      <div class="info-popover material-name-info-popover" role="dialog" aria-label="${escapeHtml(title)}の名前">
        <div class="compact-personality-panel">
          <h2>名前</h2>
          <p>${escapeHtml(title)}</p>
        </div>
      </div>
    </div>
  `;
}

function renderMaterialNameEditPanel(item) {
  if (!editMode || !materialNameEditPanel || materialNameEditPanel.materialId !== item.id) {
    return "";
  }

  const panelStyle = Number.isFinite(materialNameEditPanel.x) && Number.isFinite(materialNameEditPanel.y)
    ? ` style="--material-panel-left:${Math.round(materialNameEditPanel.x)}px; --material-panel-top:${Math.round(materialNameEditPanel.y)}px;"`
    : "";

  return `
    <section class="material-name-edit-panel"${panelStyle} data-material-name-panel>
      <div class="material-name-panel-heading">
        <span>名前を編集</span>
        <button type="button" data-action="close-material-name-panel" aria-label="閉じる">×</button>
      </div>
      <label class="material-name-panel-field">
        <span>名前</span>
        <input type="text" data-material-field="name" value="${escapeHtml(item.name || "")}" placeholder="素材名" aria-label="素材名">
      </label>
    </section>
  `;
}

function renderMaterialModeFields(item, displayMode) {
  const fields = displayMode === "price"
    ? [
        ["purchasePrice", "購入価格", item.purchasePrice || "未設定"],
        ["tradePrice", "取引価格", item.tradePrice || "未設定"],
        ["merchantTradePrice", "商人価格", item.merchantTradePrice || "未設定"],
        ["buybackPrice", "買取価格", item.buybackPrice || "未設定"]
      ]
    : [
        ["content", "説明", item.content || "説明未設定"],
        ["effect", "効果", item.effect || "未設定"],
        ["acquisitionMethod", "入手方法", item.acquisitionMethod || "未設定"]
      ];

  return fields.map(([field, label, value]) => renderMaterialField(item, field, label, value)).join("");
}

function renderMaterialTagArea(item) {
  const tags = itemMaterialTags(item);

  if (editMode) {
    const selectedTag = tags[0] || "その他";

    return `
      <fieldset class="material-tag-editor" data-edit-copy-field="tags">
        <legend>タグ</legend>
        <select class="material-tag-select" data-material-tag aria-label="素材タグ">
          ${materialTagOptions.map(tag => `
            <option value="${escapeHtml(tag)}" ${selectedTag === tag ? "selected" : ""}>${escapeHtml(tag)}</option>
          `).join("")}
        </select>
      </fieldset>
    `;
  }

  return `
    <div class="material-tag-display ${compactTagClass(tags)}" aria-label="素材タグ">
      ${tags.map(tag => `<span class="${compactTextClass(tag, { medium: 5, long: 8, dense: 12 })}">${escapeHtml(tag)}</span>`).join("")}
    </div>
  `;
}

function renderMaterialSeriesArea(item) {
  const seriesTags = itemMaterialSeriesTags(item);

  if (editMode) {
    const selectedSeries = seriesTags[0] || "";
    const canUseSeries = materialAllowsSeries(item.tags);
    const disabled = !canUseSeries || !appData.materialSeriesTags.length;

    return `
      <fieldset class="material-tag-editor material-series-card-editor ${canUseSeries ? "" : "is-disabled"}" data-edit-copy-field="seriesTags">
        <legend>シリーズ</legend>
        <select class="material-tag-select" data-material-series-tag aria-label="素材シリーズ" ${disabled ? "disabled" : ""}>
          <option value="">${disabled ? "" : "未設定"}</option>
          ${appData.materialSeriesTags.map(tag => `
            <option value="${escapeHtml(tag)}" ${selectedSeries === tag ? "selected" : ""}>${escapeHtml(tag)}</option>
          `).join("")}
        </select>
      </fieldset>
    `;
  }

  if (!seriesTags.length) {
    return "";
  }

  return `
    <div class="material-tag-display material-series-display ${compactTagClass(seriesTags)}" aria-label="素材シリーズ">
      ${seriesTags.map(tag => `<span class="${compactTextClass(tag, { medium: 5, long: 8, dense: 12 })}">${escapeHtml(tag)}</span>`).join("")}
    </div>
  `;
}

function renderMaterialImageArea(item, title) {
  const content = `<div class="material-card-image">${renderItemImage(item, title, "素")}</div>`;
  const isOpen = materialColumnCount === 1 || openMaterialId === item.id;

  return `
    <button type="button" class="material-card-image-button" data-action="toggle-material-card" data-edit-copy-field="imageUrl" aria-label="${escapeHtml(title)}を${isOpen ? "閉じる" : "開く"}" aria-expanded="${isOpen ? "true" : "false"}">
      ${content}
    </button>
  `;
}

function renderMaterialImageEditor(item, title) {
  return `
    <div class="material-image-editor">
      <label class="livly-file-picker material-file-picker">
        <span>ファイルを選択</span>
        <input type="file" accept="image/*" data-material-image-upload aria-label="${escapeHtml(title)}の画像をアップロード">
      </label>
      <button type="button" class="plain-button" data-action="clear-material-image">画像を消す</button>
    </div>
    ${renderLivlyCropTool(item, "material")}
  `;
}

function renderMaterialField(item, field, label, value, isTitle = false, isWide = false) {
  const isMultiline = ["content", "effect", "acquisitionMethod"].includes(field);

  if (editMode) {
    return `
      <label class="material-display-field ${isTitle ? "is-title" : ""} ${isWide ? "is-wide" : ""} ${isMultiline ? "is-multiline" : ""}" data-edit-copy-field="${escapeHtml(field)}">
        <span>${escapeHtml(label)}</span>
        ${isMultiline
          ? `<textarea rows="3" data-material-field="${escapeHtml(field)}" placeholder="未設定">${escapeHtml(item[field] || "")}</textarea>`
          : `<input type="text" data-material-field="${escapeHtml(field)}" value="${escapeHtml(item[field] || "")}" placeholder="未設定">`
        }
      </label>
    `;
  }

  return `
    <div class="material-display-field ${isTitle ? "is-title" : ""} ${isWide ? "is-wide" : ""} ${isMultiline ? "is-multiline" : ""}">
      <span>${escapeHtml(label)}</span>
      <strong>${escapeHtml(value)}</strong>
    </div>
  `;
}

function renderPersonalityRow(item, index) {
  const title = itemTitle(item, index);

  return `
    <article class="personality-row list-item is-display-${escapeHtml(personalityDisplayMode)}" data-id="${escapeHtml(item.id)}" tabindex="0">
      <div class="personality-edit-controls" aria-label="${escapeHtml(title)}の編集">
        <button type="button" class="personality-delete-button" data-action="delete-personality" aria-label="${escapeHtml(title)}を削除">
          <span aria-hidden="true">&#128465;</span>
        </button>
        <button type="button" class="personality-drag-handle" data-action="drag-personality" aria-label="${escapeHtml(title)}の順番を変える">
          &#8801;
        </button>
      </div>
      ${renderPersonalityName(item, index)}
      ${renderPersonalitySide(item)}
      <div class="info-popover personality-info-popover" role="dialog" aria-label="${escapeHtml(title)}の情報">
        <button type="button" class="info-close-button" data-action="close-info" aria-label="閉じる">×</button>
        ${renderInfo(item)}
      </div>
    </article>
  `;
}

function renderPersonalityName(item, index) {
  if (!editMode) {
    return `<strong class="personality-name">${escapeHtml(itemTitle(item, index))}</strong>`;
  }

  return `
    <input
      type="text"
      class="personality-inline-input personality-name-input personality-name"
      data-personality-field="name"
      value="${escapeHtml(item.name)}"
      placeholder="名前"
      aria-label="個性の名前"
    >
  `;
}

function renderPersonalitySide(item) {
  if (editMode) {
    return renderEditablePersonalitySide(item);
  }

  if (personalityDisplayMode === "content") {
    return `<span class="personality-content">${escapeHtml(item.content || "内容未設定")}</span>`;
  }

  if (personalityDisplayMode === "all") {
    return `
      <span class="personality-content">${escapeHtml(item.content || "内容未設定")}</span>
      <span class="personality-rate">${escapeHtml(item.modificationRate || "未設定")}</span>
    `;
  }

  return `<span class="personality-rate">${escapeHtml(item.modificationRate || "未設定")}</span>`;
}

function renderEditablePersonalitySide(item) {
  if (personalityDisplayMode === "content") {
    return `
      <input
        type="text"
        class="personality-inline-input personality-content-input personality-content"
        data-personality-field="content"
        value="${escapeHtml(item.content)}"
        placeholder="内容"
        aria-label="個性の内容"
      >
    `;
  }

  if (personalityDisplayMode === "all") {
    return `
      <input
        type="text"
        class="personality-inline-input personality-content-input personality-content"
        data-personality-field="content"
        value="${escapeHtml(item.content)}"
        placeholder="内容"
        aria-label="個性の内容"
      >
      <span class="personality-percent-field personality-rate">
        <input
          type="text"
          inputmode="decimal"
          pattern="[0-9]*[.]?[0-9]*"
          autocomplete="off"
          class="personality-inline-input personality-rate-input"
          data-personality-field="modificationRate"
          value="${escapeHtml(percentageInputValue(item.modificationRate))}"
          placeholder="確率"
          aria-label="個性の確率"
        >
        <span class="personality-rate-suffix" aria-hidden="true">%</span>
      </span>
    `;
  }

  return `
    <span class="personality-percent-field personality-rate">
      <input
        type="text"
        inputmode="decimal"
        pattern="[0-9]*[.]?[0-9]*"
        autocomplete="off"
        class="personality-inline-input personality-rate-input"
        data-personality-field="modificationRate"
        value="${escapeHtml(percentageInputValue(item.modificationRate))}"
        placeholder="確率"
        aria-label="個性の確率"
      >
      <span class="personality-rate-suffix" aria-hidden="true">%</span>
    </span>
  `;
}

function renderLivlyListView(items) {
  const visibleItems = sortLivlyItems(items);
  const saveButton = editMode
    ? `
      <button type="button" class="personality-save-button ${hasUnsavedLivlyEdits() ? "is-dirty" : ""}" data-action="save-livlies">
        編集内容を保存
      </button>
    `
    : "";
  const addButton = editMode
    ? renderAddActionRow("livlies")
    : "";

  if (!items.length) {
    return `
      ${saveButton}
      <section class="card list-empty">
        <p>${escapeHtml(routeConfig.livlies.emptyText)}</p>
      </section>
      ${addButton}
    `;
  }

  return `
    ${saveButton}
    ${renderEditCopyToolbar("livlies", visibleItems)}
    ${renderLivlyDisplayFilter()}
    <section class="livly-card-list" ${cardColumnStyle(editMode ? 1 : livlyColumnCount)}>
      ${visibleItems.map((item, index) => renderLivlyCard(item, index)).join("")}
    </section>
    ${addButton}
  `;
}

function renderLivlyDisplayFilter() {
  return `
    <section class="livly-display-filter card-layout-filter" aria-label="リブリー表示設定">
      <div class="livly-display-top-row ${editMode ? "is-single-control" : ""}">
        <div class="livly-filter-card livly-sort-card">
          ${renderLivlySortControls()}
        </div>
        ${editMode ? "" : renderCardColumnSlider("livlies", livlyColumnCount)}
      </div>
    </section>
  `;
}

function renderLivlySortControls() {
  return `
    <div class="livly-sort-controls" aria-label="リブリーの並べ替え">
      <select data-livly-sort-field aria-label="並べ替え項目">
        ${livlySortFieldOptions.map(option => `
          <option value="${escapeHtml(option[0])}" ${livlySortField === option[0] ? "selected" : ""}>${escapeHtml(option[1])}</option>
        `).join("")}
      </select>
      <button type="button" class="livly-sort-direction is-${livlySortDirection}" data-livly-sort-direction aria-label="${livlySortDirection === "desc" ? "大きい順" : "小さい順"}">
        <span aria-hidden="true"></span>
      </button>
    </div>
  `;
}

function sortLivlyItems(items) {
  if (!livlySortField) {
    return items;
  }

  return items
    .map((item, index) => ({ item, index, value: livlySortValue(item, livlySortField) }))
    .sort((left, right) => {
      const leftMissing = !Number.isFinite(left.value);
      const rightMissing = !Number.isFinite(right.value);

      if (leftMissing && rightMissing) {
        return left.index - right.index;
      }

      if (leftMissing) {
        return 1;
      }

      if (rightMissing) {
        return -1;
      }

      const diff = livlySortDirection === "asc"
        ? left.value - right.value
        : right.value - left.value;

      return diff || left.index - right.index;
    })
    .map(entry => entry.item);
}

function livlySortValue(item, field) {
  if (field === "hpLevels") {
    return livlyLevelSortValue(item.hpLevels);
  }

  if (field === "attackLevels") {
    return livlyLevelSortValue(item.attackLevels);
  }

  if (field === "handLevels") {
    return livlyLevelSortValue(item.handLevels);
  }

  if (field === "fullness") {
    return numericSortValue(item.fullness);
  }

  if (field === "ddEmissions") {
    const row = findLevelOneRow(item.ddEmissions);

    if (!row) {
      return Number.NaN;
    }

    return (Number(row.blackCount) || 0) + (Number(row.whiteCount) || 0);
  }

  if (field === "facilitySuitability") {
    return {
      none: 0,
      available: 1,
      great: 2
    }[item.facilitySuitability] ?? Number.NaN;
  }

  if (field === "movementPowers") {
    const powers = Array.isArray(item.movementPowers)
      ? item.movementPowers.map(numericSortValue).filter(Number.isFinite)
      : [];

    return powers.length ? Math.max(...powers) : Number.NaN;
  }

  return Number.NaN;
}

function livlyLevelSortValue(rows) {
  const row = findLevelOneRow(rows);
  return row ? numericSortValue(row.value) : Number.NaN;
}

function numericSortValue(value) {
  const normalized = String(value ?? "")
    .replace(/[０-９．]/g, char => {
      if (char === "．") {
        return ".";
      }

      return String.fromCharCode(char.charCodeAt(0) - 0xfee0);
    })
    .replace(/。/g, ".")
    .replace(/,/g, "");
  const match = normalized.match(/-?\d+(?:\.\d+)?/);

  return match ? Number(match[0]) : Number.NaN;
}

function livlyLevelOrderValue(row) {
  const value = numericSortValue(row?.level);

  return Number.isFinite(value) ? value : Number.POSITIVE_INFINITY;
}

function sortedLivlyLevelRows(rows) {
  if (!Array.isArray(rows)) {
    return [];
  }

  return rows
    .map((row, index) => ({ row, index }))
    .sort((left, right) => {
      const levelDiff = livlyLevelOrderValue(left.row) - livlyLevelOrderValue(right.row);

      return levelDiff || left.index - right.index;
    })
    .map(item => item.row);
}

function sortLivlyLevelRowsInPlace(rows) {
  if (!Array.isArray(rows)) {
    return;
  }

  rows.splice(0, rows.length, ...sortedLivlyLevelRows(rows));
}

function sortLivlyItemLevelRows(item) {
  if (!item) {
    return;
  }

  livlyLevelRowFields.forEach(field => {
    sortLivlyLevelRowsInPlace(item[field]);
  });
}

function nextLivlyLevelValue(rows) {
  const maxLevel = sortedLivlyLevelRows(rows).reduce((max, row) => {
    const level = livlyLevelOrderValue(row);

    return Number.isFinite(level) ? Math.max(max, Math.floor(level)) : max;
  }, 0);

  return String(maxLevel + 1);
}

function renderLivlyCard(item, index) {
  const title = livlyTitle(item, index);
  const isOpen = editMode || livlyColumnCount === 1 || openLivlyId === item.id;
  const cardDisplayMode = livlyCardDisplayModeFor(item);
  const isProfileMode = cardDisplayMode === "profile";

  return `
    <article class="livly-detail-card ${editMode ? "is-editable" : ""} ${isOpen ? "is-open-card" : ""} ${isEditCopySelected("livlies", item.id) ? "is-copy-selected" : ""} is-${escapeHtml(cardDisplayMode)}" data-id="${escapeHtml(item.id)}" data-livly-expanded="${isOpen ? "true" : "false"}" tabindex="0">
      ${renderEditCopyCardSelector("livlies", item, title)}
      ${renderLivlyEditPanel(item, "before")}
      <div class="livly-card-layout">
        <div class="livly-card-main-row">
          <div class="livly-visual-column">
            <div class="livly-card-header">
              <button type="button" class="material-display-toggle-button livly-card-display-toggle ${isProfileMode ? "is-price-mode" : ""}" data-livly-card-display-toggle aria-label="${isProfileMode ? "能力値表示に切り替え" : "特徴表示に切り替え"}">
                <span class="material-toggle-icon" aria-hidden="true"></span>
              </button>
              ${renderLivlyDisplayField(item, "species", "", title, true)}
            </div>
            ${renderLivlyImageArea(item, title)}
          </div>
          <div class="livly-card-body">
            ${editMode ? `<button type="button" class="personality-delete-button livly-card-delete-button" data-action="delete-livly" aria-label="${escapeHtml(title)}を削除">🗑</button>` : ""}
            ${cardDisplayMode === "stats" ? renderLivlyStatsFields(item) : renderLivlyProfileFields(item)}
          </div>
        </div>
      </div>
      ${renderLivlyEditPanel(item, "after")}
    </article>
  `;
}

function renderLivlyProfileFields(item) {
  return `
    <div class="livly-profile-fields">
      ${renderLivlyDisplayField(item, "feature", "特徴", blankText(item.feature))}
      ${renderLivlyDisplayField(item, "favorite", "得意なこと", blankText(item.favorite), false, false, true)}
    </div>
  `;
}

function renderLivlyStatsFields(item) {
  return `
    <div class="livly-compact-line livly-detail-line">
      ${renderLivlyDisplayField(item, "hpLevels", "HP", levelOneText(item.hpLevels))}
      ${renderLivlyDisplayField(item, "attackLevels", "攻撃力", levelOneText(item.attackLevels))}
      ${renderLivlyDisplayField(item, "fullness", "満腹量", numberText(item.fullness))}
      ${renderLivlyDisplayField(item, "facilitySuitability", "施設適性", facilitySuitabilityText(item.facilitySuitability))}
      ${renderLivlyDisplayField(item, "waza", "/waza", blankText(item.waza))}
      ${renderLivlyDisplayField(item, "handLevels", "手札枚数", levelOneText(item.handLevels))}
      ${renderLivlyDisplayField(item, "ddEmissions", "dd排出量", ddLevelOneText(item.ddEmissions))}
      ${renderLivlyDisplayField(item, "movementTypes", "移動タイプ", selectedListText(item.movementTypes), false, true)}
      ${renderLivlyDisplayField(item, "movementPowers", "移動力", selectedListText(item.movementPowers), false, true)}
    </div>
    <div class="livly-compact-line livly-summary-line">
      ${renderLivlyDisplayField(item, "hpLevels", "HP", levelOneText(item.hpLevels))}
      ${renderLivlyDisplayField(item, "attackLevels", "攻撃", levelOneText(item.attackLevels))}
      ${renderLivlyDisplayField(item, "fullness", "満腹", numberText(item.fullness))}
      ${renderLivlyDisplayField(item, "facilitySuitability", "施設", facilitySuitabilityText(item.facilitySuitability))}
      ${renderLivlyDisplayField(item, "waza", "技", blankText(item.waza))}
      ${renderLivlyDisplayField(item, "handLevels", "手札", levelOneText(item.handLevels))}
      ${renderLivlyDisplayField(item, "ddEmissions", "dd", ddLevelOneText(item.ddEmissions))}
      ${renderLivlyDisplayField(item, "movementTypes", "タイプ", selectedListText(item.movementTypes), false, true)}
      ${renderLivlyDisplayField(item, "movementPowers", "移動", selectedListText(item.movementPowers), false, true)}
    </div>
  `;
}

function renderLivlyImageArea(item, title) {
  const content = `<div class="livly-card-image">${renderLivlyImage(item, title)}</div>`;

  if (!editMode) {
    const isOpen = openLivlyId === item.id;

    return `
      <button type="button" class="livly-card-image-button" data-action="toggle-livly-card" aria-label="${escapeHtml(title)}を${isOpen ? "閉じる" : "開く"}" aria-expanded="${isOpen ? "true" : "false"}">
        ${content}
      </button>
    `;
  }

    return `
      <button type="button" class="livly-card-image-button" data-action="open-livly-panel" data-livly-panel="image" data-edit-copy-field="imageUrl" aria-label="画像を編集">
        ${content}
      </button>
    `;
}

function renderLivlyDisplayField(item, panel, label, value, isTitle = false, isBadgeList = false, isFavorite = false) {
  const labelHtml = label ? `<span>${escapeHtml(label)}</span>` : "";
  const densityClass = livlyValueDensityClass(panel, value, isBadgeList, isTitle);
  const fieldClass = `livly-display-field is-field-${escapeHtml(panel)} ${densityClass} ${isTitle ? "is-title" : ""} ${isFavorite ? "is-favorite" : ""}`;

  if (editMode && livlyInlineInputFields.has(panel)) {
    const inputMode = panel === "fullness" ? ` inputmode="decimal"` : "";
    const fieldInput = ["feature", "favorite"].includes(panel)
      ? `<textarea rows="3" data-livly-field="${escapeHtml(panel)}" placeholder="未設定">${escapeHtml(item[panel] || "")}</textarea>`
      : `<input type="text"${inputMode} data-livly-field="${escapeHtml(panel)}" value="${escapeHtml(item[panel] || "")}" placeholder="未設定">`;

    return `
      <label class="${fieldClass} is-inline-input" data-edit-copy-field="${escapeHtml(panel)}">
        ${labelHtml}
        ${fieldInput}
      </label>
    `;
  }

  const content = `
    ${labelHtml}
    <strong ${isTitle ? "data-livly-title-fit" : ""}>${livlyDisplayValueHtml(panel, value, isBadgeList)}</strong>
  `;

  if (!editMode) {
    if (livlyNoInfoPanelFields.has(panel)) {
      return `
        <div class="${fieldClass}">
          ${content}
        </div>
      `;
    }

    const infoLabel = livlyFormalFieldLabel(panel, label);

    return `
      <div class="${fieldClass}" tabindex="0">
        ${content}
        <div class="info-popover livly-info-popover" role="dialog" aria-label="${escapeHtml(infoLabel)}の情報">
          ${renderLivlyFieldInfoPanel(item, panel, infoLabel, value)}
        </div>
      </div>
    `;
  }

  return `
    <button type="button" class="${fieldClass}" data-action="open-livly-panel" data-livly-panel="${escapeHtml(panel)}" data-edit-copy-field="${escapeHtml(panel)}">
      ${content}
    </button>
  `;
}

function livlyValueDensityClass(panel, value, isBadgeList, isTitle) {
  if (isTitle) {
    return "";
  }

  const text = String(value ?? "").trim();

  if (!text || text === "未設定") {
    return "";
  }

  const levelCount = ["hpLevels", "ddEmissions", "handLevels", "attackLevels"].includes(panel)
    ? (text.match(/Lv\./g) || []).length
    : 0;
  const badgeCount = isBadgeList
    ? text.split("/").map(part => part.trim()).filter(Boolean).length
    : 0;
  const itemCount = Math.max(levelCount, badgeCount);
  const compactLength = text.replace(/\s/g, "").length;

  if (itemCount >= 4 || compactLength >= 30) {
    return "is-density-very-tight";
  }

  if (itemCount >= 3 || compactLength >= 22) {
    return "is-density-tight";
  }

  return "";
}

function livlyDisplayValueHtml(panel, value, isBadgeList) {
  if (isBadgeList) {
    return movementBadgesHtml(value);
  }

  const escapedValue = escapeHtml(value);

  if (["hpLevels", "ddEmissions", "handLevels", "attackLevels"].includes(panel)) {
    return escapedValue.replace(/Lv\.([^\s]+)/g, '<span class="livly-level-label">Lv.$1</span>');
  }

  return escapedValue;
}

function movementBadgesHtml(value) {
  return String(value)
    .split("/")
    .map(text => text.trim())
    .filter(Boolean)
    .map(text => `<em>${escapeHtml(text)}</em>`)
    .join("");
}

function renderLivlyFieldInfoPanel(item, field, label, value) {
  const description = appData.livlyFieldDescriptions[field] || "";

  return `
    <div class="compact-personality-panel livly-card-info">
      <h2>${escapeHtml(label)}</h2>
      <p>${escapeHtml(description || "説明は未設定です。")}</p>
      ${renderLivlyFieldInfoDetails(item, field)}
    </div>
  `;
}

function renderLivlyFieldInfoDetails(item, field) {
  const rows = {
    hpLevels: renderLivlyLevelInfo("HP", item.hpLevels, { hideLabel: true }),
    ddEmissions: renderLivlyDdInfo(item.ddEmissions, { hideLabel: true }),
    handLevels: renderLivlyLevelInfo("手札枚数", item.handLevels, { hideLabel: true }),
    attackLevels: renderLivlyLevelInfo("攻撃力", item.attackLevels, { hideLabel: true })
  }[field];

  return rows ? `<dl>${rows}</dl>` : "";
}

function selectedListText(values) {
  return Array.isArray(values) && values.length ? values.join(" / ") : "未設定";
}

function levelOneText(rows) {
  const row = findLevelOneRow(rows);
  return row ? numberText(row.value) : "未設定";
}

function ddLevelOneText(rows) {
  const row = findLevelOneRow(rows);
  return row ? ddMarkText(row) : "未設定";
}

function findLevelOneRow(rows) {
  if (!Array.isArray(rows)) {
    return null;
  }

  return rows.find(row => String(row.level || "").trim() === "1") || null;
}

function facilitySuitabilityText(value) {
  return {
    none: "なし",
    available: "あり",
    great: "超あり"
  }[value] || "未設定";
}

function renderLivlyEditPanel(item, placement) {
  if (!editMode || !livlyEditPanel || livlyEditPanel.livlyId !== item.id || livlyEditPanel.placement !== placement) {
    return "";
  }

  const panel = livlyEditPanel.panel;
  const panelStyle = Number.isFinite(livlyEditPanel.x) && Number.isFinite(livlyEditPanel.y)
    ? ` style="--livly-panel-left:${Math.round(livlyEditPanel.x)}px; --livly-panel-top:${Math.round(livlyEditPanel.y)}px;"`
    : "";
  const label = {
    image: "画像",
    species: "種類",
    feature: "特徴",
    hpLevels: "HP",
    fullness: "満腹量",
    ddEmissions: "dd排出量",
    facilitySuitability: "施設適性",
    movementTypes: "移動タイプ",
    movementPowers: "移動力",
    handLevels: "手札枚数",
    attackLevels: "攻撃力",
    waza: "/waza",
    favorite: "得意なこと",
    descriptions: "項目説明"
  }[panel] || "編集";

  return `
    <section class="livly-inline-panel"${panelStyle} data-floating-livly-panel>
      <div class="livly-panel-heading" data-livly-panel-drag-handle>
        <span>${escapeHtml(label)}を編集</span>
        <button type="button" data-action="close-livly-panel" aria-label="閉じる">×</button>
      </div>
      ${renderLivlyPanelBody(item, panel)}
    </section>
  `;
}

function renderLivlyPanelBody(item, panel) {
  if (panel === "image") {
    return `
      <div class="livly-edit-field">
        <span>画像アップロード</span>
        <label class="livly-file-picker">
          <span>ファイルを選択</span>
          <input type="file" accept="image/*" data-livly-image-upload aria-label="画像をアップロード">
        </label>
        <button type="button" class="plain-button" data-action="clear-livly-image">画像を消す</button>
      </div>
      ${renderLivlyCropTool(item)}
    `;
  }

  if (panel === "descriptions") {
    return `
      <div class="livly-description-editor">
        ${Object.keys(livlyFieldLabels).map(field => `
          <label class="livly-edit-field">
            <span>${escapeHtml(livlyFieldLabels[field])}</span>
            <textarea data-livly-description-field="${escapeHtml(field)}" rows="3">${escapeHtml(appData.livlyFieldDescriptions[field] || "")}</textarea>
          </label>
        `).join("")}
      </div>
    `;
  }

  if (panel === "species") {
    return renderLivlyTextField("species", "種類", item.species);
  }

  if (panel === "feature") {
    return renderLivlyTextareaField("feature", "特徴", item.feature);
  }

  if (panel === "hpLevels") {
    return renderLivlyLevelEditor("hpLevels", "HP", item.hpLevels, "hp");
  }

  if (panel === "fullness") {
    return renderLivlyNumberField("fullness", "満腹量", item.fullness);
  }

  if (panel === "ddEmissions") {
    return renderLivlyDdEditor(item.ddEmissions);
  }

  if (panel === "facilitySuitability") {
    return renderLivlySelectField("facilitySuitability", "施設適性", item.facilitySuitability, [
      ["", "未設定"],
      ["none", "なし"],
      ["available", "あり"],
      ["great", "超あり"]
    ]);
  }

  if (panel === "movementTypes") {
    return renderLivlyMultiSelect("movementTypes", "移動タイプ", item.movementTypes, appData.livlyOptionSets.movementTypes, "movementTypes");
  }

  if (panel === "movementPowers") {
    return renderLivlyMultiSelect("movementPowers", "移動力", item.movementPowers, appData.livlyOptionSets.movementPowers, "movementPowers");
  }

  if (panel === "handLevels") {
    return renderLivlyLevelEditor("handLevels", "手札枚数", item.handLevels, "hand");
  }

  if (panel === "attackLevels") {
    return renderLivlyLevelEditor("attackLevels", "攻撃力", item.attackLevels, "attack");
  }

  if (panel === "waza") {
    return renderLivlyTextField("waza", "/waza", item.waza);
  }

  if (panel === "favorite") {
    return renderLivlyTextareaField("favorite", "得意なこと", item.favorite);
  }

  return "";
}

function renderItemImage(item, title, fallback = "リ") {
  if (item.imageUrl) {
    return `<img src="${escapeHtml(item.imageUrl)}" alt="${escapeHtml(title)}" draggable="false">`;
  }

  return `<span>${escapeHtml((title || fallback).charAt(0))}</span>`;
}

function renderLivlyImage(item, title) {
  return renderItemImage(item, title, "リ");
}

function renderLivlyTextField(field, label, value) {
  return `
    <label class="livly-edit-field">
      <span>${label}</span>
      <input type="text" data-livly-field="${field}" value="${escapeHtml(value)}" placeholder="未設定">
    </label>
  `;
}

function renderLivlyTextareaField(field, label, value) {
  return `
    <label class="livly-edit-field">
      <span>${label}</span>
      <textarea rows="4" data-livly-field="${field}" placeholder="未設定">${escapeHtml(value)}</textarea>
    </label>
  `;
}

function renderLivlyNumberField(field, label, value) {
  return `
    <label class="livly-edit-field">
      <span>${label}</span>
      <input type="text" inputmode="decimal" data-livly-field="${field}" value="${escapeHtml(value)}" placeholder="未設定">
    </label>
  `;
}

function renderLivlySelectField(field, label, value, options) {
  return `
    <label class="livly-edit-field">
      <span>${label}</span>
      <select data-livly-field="${field}">
        ${options.map(option => `
          <option value="${escapeHtml(option[0])}" ${value === option[0] ? "selected" : ""}>${escapeHtml(option[1])}</option>
        `).join("")}
      </select>
    </label>
  `;
}

function renderLivlyLevelEditor(field, label, rows, prefix) {
  return `
    <section class="livly-edit-field livly-level-editor" data-level-list="${field}">
      <div class="livly-field-heading">
        <span>${label}</span>
        <button type="button" data-action="add-livly-level" data-level-field="${field}" data-level-prefix="${prefix}">＋</button>
      </div>
      <div class="livly-level-list">
        ${sortedLivlyLevelRows(rows).map(row => `
          <div class="livly-level-row" data-row-id="${escapeHtml(row.id)}">
            <label>
              <span>Lv.</span>
              <input type="text" inputmode="numeric" data-livly-level-field="${field}" data-level-property="level" value="${escapeHtml(row.level)}">
            </label>
            <label>
              <span>値</span>
              <input type="text" inputmode="decimal" data-livly-level-field="${field}" data-level-property="value" value="${escapeHtml(row.value)}" placeholder="未設定">
            </label>
            <button type="button" class="livly-row-delete" data-action="delete-livly-level" data-level-field="${field}" aria-label="削除">−</button>
          </div>
        `).join("")}
      </div>
    </section>
  `;
}

function renderLivlyDdEditor(rows) {
  return `
    <section class="livly-edit-field livly-dd-editor" data-dd-list>
      <div class="livly-field-heading">
        <span>dd排出量</span>
        <button type="button" data-action="add-livly-dd-row">＋</button>
      </div>
      <div class="livly-level-list">
        ${sortedLivlyLevelRows(rows).map(row => renderLivlyDdRow(row)).join("")}
      </div>
    </section>
  `;
}

function renderLivlyDdRow(row) {
  const blackCount = Math.max(0, Number(row.blackCount) || 0);
  const whiteCount = Math.max(0, Number(row.whiteCount) || 0);
  const symbols = [
    ...Array.from({ length: blackCount }, () => "black"),
    ...Array.from({ length: whiteCount }, () => "white")
  ];

  return `
    <div class="livly-level-row livly-dd-row" data-row-id="${escapeHtml(row.id)}">
      <label>
        <span>Lv.</span>
        <input type="text" inputmode="numeric" data-livly-dd-property="level" value="${escapeHtml(row.level)}">
      </label>
      <div class="livly-dd-symbols">
        ${symbols.map((symbol, index) => `
          <span class="livly-dd-symbol-wrap">
            <button type="button" class="livly-dd-symbol" data-action="open-dd-symbol-menu" data-symbol-index="${index}" data-symbol-type="${symbol}" aria-label="${symbol === "black" ? "黒丸" : "白丸"}を編集">${symbol === "black" ? "⚫︎" : "⚪︎"}</button>
            ${renderDdSymbolMenu("update-dd-symbol", index)}
          </span>
        `).join("")}
        <span class="livly-dd-symbol-wrap">
          <button type="button" class="livly-dd-add" data-action="open-dd-add-menu">＋</button>
          ${renderDdSymbolMenu("add-dd-symbol")}
        </span>
      </div>
      <button type="button" class="livly-row-delete" data-action="delete-livly-dd-row" aria-label="削除">−</button>
    </div>
  `;
}

function renderDdSymbolMenu(action, index = "") {
  return `
    <span class="dd-symbol-menu" hidden>
      <button type="button" data-action="${action}" data-dd-symbol="black" data-symbol-index="${index}">⚫︎</button>
      <button type="button" data-action="${action}" data-dd-symbol="white" data-symbol-index="${index}">⚪︎</button>
    </span>
  `;
}

function renderLivlyMultiSelect(field, label, selectedValues, options, optionSetName) {
  const selectedSet = new Set(selectedValues);

  return `
    <section class="livly-edit-field livly-choice-editor" data-livly-choice="${field}">
      <div class="livly-field-heading">
        <span>${label}</span>
        <span>
          <button type="button" data-action="add-livly-option" data-option-set="${optionSetName}">＋</button>
        </span>
      </div>
      <div class="livly-choice-list">
        <button type="button" class="livly-choice ${selectedValues.length ? "" : "is-selected"}" data-action="set-livly-unset" data-livly-field="${field}">未設定</button>
        ${options.map(option => `
          <span class="livly-choice-wrap">
            <button type="button" class="livly-choice livly-removable-option ${selectedSet.has(option) ? "is-selected" : ""}" data-action="toggle-livly-choice" data-livly-field="${field}" data-option-set="${optionSetName}" data-choice-value="${escapeHtml(option)}">${escapeHtml(option)}</button>
          </span>
        `).join("")}
      </div>
    </section>
  `;
}

function percentageFraction(value) {
  const formattedValue = formatPercentageNumber(value);
  return formattedValue ? Number(formattedValue) / 100 : 0;
}

function probabilityPercentText(probability) {
  return `${(Math.max(0, probability) * 100).toFixed(2)}%`;
}

function slotRateValue(field) {
  return percentageInputValue(appData.personalitySlotRates[field]);
}

function renderSlotRateControl(field, label) {
  const displayValue = percentageStorageValue(slotRateValue(field)) || "0.00%";

  if (!editMode) {
    return `
      <div class="probability-rate-control probability-rate-display">
        <span>${label}・・・</span>
        <strong>${escapeHtml(displayValue)}</strong>
      </div>
    `;
  }

  return `
    <label class="probability-rate-control">
      <span>${label}・・・</span>
      <span class="probability-percent-input">
        <input
          type="text"
          inputmode="decimal"
          pattern="[0-9]*[.]?[0-9]*"
          autocomplete="off"
          data-slot-rate="${field}"
          value="${escapeHtml(slotRateValue(field))}"
          aria-label="${label}の確率"
        >
        <span aria-hidden="true">%</span>
      </span>
    </label>
  `;
}

function renderProbabilitySettings() {
  return `
    <section class="probability-settings">
      ${renderSlotRateControl("zeroRate", "0個")}
      ${renderSlotRateControl("oneRate", "1個")}
      ${renderSlotRateControl("twoRate", "2個")}
      ${editMode ? `<button type="button" class="probability-save-button" data-action="save-probability-settings">保存</button>` : ""}
    </section>
  `;
}

function probabilityResultRollText(probability) {
  if (probability <= 0) {
    return "理論上は0%なので出ません";
  }

  return `理論上は${Math.ceil(1 / probability).toLocaleString("ja-JP")}回振ったら1回でる`;
}

function renderProbabilityResult(probability) {
  return `
    <section class="probability-result probability-result-card" aria-live="polite" tabindex="0">
      <span>計算結果</span>
      <strong data-probability-result>${escapeHtml(probabilityPercentText(probability))}</strong>
      <div class="info-popover probability-result-popover" role="dialog" aria-label="計算結果の情報">
        <p data-probability-result-info>${escapeHtml(probabilityResultRollText(probability))}</p>
      </div>
    </section>
  `;
}

function renderPersonalityProbabilityView() {
  const personalities = appData.personalities;
  const personalityIds = new Set(personalities.map(item => item.id));
  normalizeProbabilitySelections(personalityIds);

  if (!personalities.length) {
    return `
      <section class="card list-empty">
        <p>${escapeHtml(routeConfig.personalityProbability.emptyText)}</p>
      </section>
    `;
  }

  const activeGroup = probabilitySuccessGroups[probabilityActiveGroupIndex] || [];
  const selectedIds = new Set(activeGroup);
  const unwantedIds = new Set(probabilityUnwantedPersonalityIds);
  const probability = calculatePersonalityProbability();

  return `
    <section class="personality-probability-page">
      ${renderProbabilityResult(probability)}

      ${renderProbabilityGroupSummary(personalities)}

      <section class="probability-choice-list" aria-label="個性選択">
        ${personalities.map(item => {
          const selected = selectedIds.has(item.id);
          const disabled = activeGroup.length >= 2 && !selected;
          const unwanted = unwantedIds.has(item.id);

          if (unwanted) {
            return `
              <article class="probability-choice-card is-unwanted-placeholder" data-id="${escapeHtml(item.id)}" aria-hidden="true">
                <div class="probability-choice-placeholder"></div>
              </article>
            `;
          }

          return `
            <article class="probability-choice-card" data-id="${escapeHtml(item.id)}">
              <button
                type="button"
                class="probability-choice ${selected ? "is-selected" : ""} ${unwanted ? "is-unwanted" : ""} ${disabled ? "is-limited" : ""}"
                data-probability-personality="${escapeHtml(item.id)}"
                draggable="${useNativeProbabilityDrag ? "true" : "false"}"
                aria-disabled="${disabled ? "true" : "false"}"
              >
                <span>${escapeHtml(item.name || "名前未設定")}</span>
                ${unwanted ? `<em>不要</em>` : ""}
              </button>
              <div class="info-popover personality-info-popover" role="dialog" aria-label="${escapeHtml(item.name || "個性")}の情報">
                ${renderPersonalityCompactInfo(item)}
              </div>
            </article>
          `;
        }).join("")}
      </section>

      ${renderProbabilityUnwantedZone(personalities)}
      ${renderProbabilitySettings()}
    </section>
  `;
}

function normalizeProbabilitySelections(personalityIds = new Set(appData.personalities.map(item => item.id))) {
  probabilitySuccessGroups = probabilitySuccessGroups
    .map(group => Array.from(new Set((Array.isArray(group) ? group : []).filter(id => personalityIds.has(id)))).slice(0, 2))
    .filter(group => Array.isArray(group));

  if (!probabilitySuccessGroups.length) {
    probabilitySuccessGroups = [[]];
  }

  probabilityActiveGroupIndex = Math.min(
    Math.max(0, probabilityActiveGroupIndex),
    probabilitySuccessGroups.length - 1
  );

  probabilityUnwantedPersonalityIds = Array.from(
    new Set(probabilityUnwantedPersonalityIds.filter(id => personalityIds.has(id)))
  );
}

function personalityByIdMap() {
  return new Map(appData.personalities.map(item => [item.id, item]));
}

function personalityNameById(id, personalityMap = personalityByIdMap()) {
  const item = personalityMap.get(id);
  return item ? item.name || "名前未設定" : "名前未設定";
}

function probabilityGroupKey(group) {
  return group.length ? group.slice().sort().join("|") : "zero";
}

function renderProbabilityGroupName(group, personalityMap) {
  if (!group.length) {
    return "";
  }

  return group.map(id => personalityNameById(id, personalityMap)).join(" + ");
}

function renderProbabilityGroupSummary(personalities) {
  const personalityMap = new Map(personalities.map(item => [item.id, item]));
  const visibleGroups = probabilitySuccessGroups
    .map((group, index) => ({ group, index }))
    .filter(entry => entry.group.length);

  return `
    <section class="probability-group-panel" aria-label="成功する組み合わせ">
      <div class="probability-group-heading">
        <span>成功する組み合わせ</span>
        <button type="button" data-action="add-probability-group">＋</button>
      </div>
      <div class="probability-group-list">
        ${visibleGroups.length ? visibleGroups.map(({ group, index }) => `
          <button
            type="button"
            class="probability-group-chip ${index === probabilityActiveGroupIndex ? "is-active" : ""}"
            data-action="select-probability-group"
            data-group-index="${index}"
          >
            <span>${escapeHtml(renderProbabilityGroupName(group, personalityMap))}</span>
            ${probabilitySuccessGroups.length > 1 ? `<i data-action="remove-probability-group" data-group-index="${index}" aria-label="組み合わせを削除">×</i>` : ""}
          </button>
        `).join("") : ""}
      </div>
    </section>
  `;
}

function renderProbabilityUnwantedZone(personalities) {
  const personalityMap = new Map(personalities.map(item => [item.id, item]));

  return `
    <section class="probability-unwanted-zone" data-probability-unwanted-zone>
      <div>
        <span>不要な個性</span>
        <small>ここへドラッグすると結果から引きます</small>
      </div>
      <div class="probability-unwanted-list">
        ${probabilityUnwantedPersonalityIds.length
          ? probabilityUnwantedPersonalityIds.map(id => {
            const item = personalityMap.get(id);
            const title = item ? item.name || "名前未設定" : "名前未設定";

            return `
              <article class="probability-choice-card probability-unwanted-card" data-id="${escapeHtml(id)}">
                <button
                  type="button"
                  class="probability-choice"
                  data-action="remove-probability-unwanted"
                  data-personality-id="${escapeHtml(id)}"
                  data-probability-unwanted-personality="${escapeHtml(id)}"
                  draggable="${useNativeProbabilityDrag ? "true" : "false"}"
                  aria-label="${escapeHtml(title)}を不要な個性から戻す"
                >
                  <span>${escapeHtml(title)}</span>
                </button>
                ${item ? `
                  <div class="info-popover personality-info-popover" role="dialog" aria-label="${escapeHtml(title)}の情報">
                    ${renderPersonalityCompactInfo(item)}
                  </div>
                ` : ""}
              </article>
            `;
          }).join("")
          : `<span class="probability-unwanted-empty">未設定</span>`
        }
        <div class="probability-unwanted-drop-slot" aria-hidden="true"></div>
      </div>
    </section>
  `;
}

function probabilityRateForPersonality(id, personalityMap = personalityByIdMap()) {
  const item = personalityMap.get(id);
  return item ? percentageFraction(item.modificationRate) : 0;
}

function probabilityForGroup(group, personalityMap = personalityByIdMap()) {
  const zeroRate = percentageFraction(appData.personalitySlotRates.zeroRate);
  const oneRate = percentageFraction(appData.personalitySlotRates.oneRate);
  const twoRate = percentageFraction(appData.personalitySlotRates.twoRate);

  if (!group.length) {
    return zeroRate;
  }

  if (group.length === 1) {
    return probabilityRateForPersonality(group[0], personalityMap) * oneRate;
  }

  return probabilityRateForPersonality(group[0], personalityMap) *
    probabilityRateForPersonality(group[1], personalityMap) *
    twoRate;
}

function shouldSkipOverlappedSuccessGroup(group, onePersonSuccessIds) {
  return group.length === 2 && group.some(id => onePersonSuccessIds.has(id));
}

function calculateUnwantedPenaltyForGroups(successGroups, personalityMap) {
  const penaltyKeys = new Set();
  let penalty = 0;

  successGroups.forEach(group => {
    if (!group.length) {
      return;
    }

    if (group.length === 1) {
      const successId = group[0];

      if (probabilityUnwantedPersonalityIds.includes(successId)) {
        const key = probabilityGroupKey(group);

        if (!penaltyKeys.has(key)) {
          penaltyKeys.add(key);
          penalty += probabilityForGroup(group, personalityMap);
        }
        return;
      }

      probabilityUnwantedPersonalityIds.forEach(unwantedId => {
        if (unwantedId === successId) {
          return;
        }

        const pair = [successId, unwantedId].sort();
        const key = probabilityGroupKey(pair);

        if (!penaltyKeys.has(key)) {
          penaltyKeys.add(key);
          penalty += probabilityForGroup(pair, personalityMap);
        }
      });
      return;
    }

    if (group.some(id => probabilityUnwantedPersonalityIds.includes(id))) {
      const key = probabilityGroupKey(group);

      if (!penaltyKeys.has(key)) {
        penaltyKeys.add(key);
        penalty += probabilityForGroup(group, personalityMap);
      }
    }
  });

  return penalty;
}

function calculatePersonalityProbability() {
  normalizeProbabilitySelections();

  const personalityMap = personalityByIdMap();
  const uniqueGroups = [];
  const seenKeys = new Set();

  probabilitySuccessGroups.forEach(group => {
    const normalizedGroup = Array.from(new Set(group)).slice(0, 2);
    const key = probabilityGroupKey(normalizedGroup);

    if (!seenKeys.has(key)) {
      seenKeys.add(key);
      uniqueGroups.push(normalizedGroup);
    }
  });

  const groupsForCalculation = uniqueGroups.some(group => group.length)
    ? uniqueGroups.filter(group => group.length)
    : uniqueGroups;
  const onePersonSuccessIds = new Set(
    groupsForCalculation
      .filter(group => group.length === 1)
      .map(group => group[0])
  );
  const countedGroups = groupsForCalculation.filter(group => !shouldSkipOverlappedSuccessGroup(group, onePersonSuccessIds));
  const successProbability = countedGroups.reduce(
    (total, group) => total + probabilityForGroup(group, personalityMap),
    0
  );
  const unwantedPenalty = calculateUnwantedPenaltyForGroups(countedGroups, personalityMap);

  return Math.max(0, successProbability - unwantedPenalty);
}

function toggleProbabilityPersonality(itemId, event = null) {
  normalizeProbabilitySelections();

  const activeGroup = probabilitySuccessGroups[probabilityActiveGroupIndex] || [];

  if (activeGroup.includes(itemId)) {
    probabilitySuccessGroups[probabilityActiveGroupIndex] = activeGroup.filter(id => id !== itemId);
  } else if (activeGroup.length < 2) {
    probabilitySuccessGroups[probabilityActiveGroupIndex] = [...activeGroup, itemId];
  }

  renderView();
  restoreCursorInfoPanelAfterRender(event);
}

function addProbabilityGroup() {
  normalizeProbabilitySelections();
  probabilitySuccessGroups.push([]);
  probabilityActiveGroupIndex = probabilitySuccessGroups.length - 1;
  renderView();
}

function selectProbabilityGroup(index) {
  normalizeProbabilitySelections();
  probabilityActiveGroupIndex = Math.min(Math.max(0, Number(index) || 0), probabilitySuccessGroups.length - 1);
  renderView();
}

function removeProbabilityGroup(index) {
  normalizeProbabilitySelections();

  if (probabilitySuccessGroups.length <= 1) {
    probabilitySuccessGroups = [[]];
    probabilityActiveGroupIndex = 0;
    renderView();
    return;
  }

  const groupIndex = Number(index) || 0;
  probabilitySuccessGroups.splice(groupIndex, 1);
  probabilityActiveGroupIndex = Math.min(probabilityActiveGroupIndex, probabilitySuccessGroups.length - 1);
  renderView();
}

function addProbabilityUnwantedPersonality(itemId, options = {}) {
  const finishUnwantedAnimation = options.animate
    ? prepareProbabilityUnwantedAnimation(itemId, options.sourceElement, options.releasePoint)
    : null;
  const previousUnwantedLayout = captureProbabilityUnwantedLayout();
  const personalityIds = new Set(appData.personalities.map(item => item.id));

  if (!personalityIds.has(itemId) || probabilityUnwantedPersonalityIds.includes(itemId)) {
    finishUnwantedAnimation?.();
    return;
  }

  probabilityUnwantedPersonalityIds.push(itemId);
  probabilitySuccessGroups = probabilitySuccessGroups.map(group => group.filter(id => id !== itemId));
  renderView();
  animateProbabilityUnwantedLayout(previousUnwantedLayout);
  finishUnwantedAnimation?.();
}

function findProbabilityChoiceButton(itemId) {
  return Array.from(contentArea.querySelectorAll("[data-probability-personality]"))
    .find(button => button.dataset.probabilityPersonality === itemId) || null;
}

function findProbabilityUnwantedButton(itemId) {
  return Array.from(contentArea.querySelectorAll("[data-probability-unwanted-personality]"))
    .find(button => button.dataset.probabilityUnwantedPersonality === itemId) || null;
}

function createProbabilityDragGhost(button, event) {
  if (!button) {
    return null;
  }

  const rect = button.getBoundingClientRect();

  if (!rect.width || !rect.height) {
    return null;
  }

  const ghost = button.cloneNode(true);
  ghost.querySelector(".info-popover")?.remove();
  ghost.classList.remove("is-dragging");
  ghost.classList.add("probability-drag-ghost");
  ghost.setAttribute("aria-hidden", "true");
  ghost.removeAttribute("data-action");
  ghost.removeAttribute("data-probability-personality");
  ghost.removeAttribute("data-probability-unwanted-personality");
  ghost.removeAttribute("data-personality-id");
  ghost.style.width = `${rect.width}px`;
  ghost.style.height = `${rect.height}px`;
  document.body.appendChild(ghost);

  const offsetX = event.clientX - rect.left;
  const offsetY = event.clientY - rect.top;

  updateProbabilityDragGhost({
    ghost,
    offsetX,
    offsetY
  }, event);

  return {
    ghost,
    offsetX,
    offsetY
  };
}

function updateProbabilityDragGhost(dragState, event) {
  if (!dragState?.ghost) {
    return;
  }

  dragState.ghost.style.left = `${event.clientX - dragState.offsetX}px`;
  dragState.ghost.style.top = `${event.clientY - dragState.offsetY}px`;
}

function removeProbabilityDragGhost(dragState = probabilityDragState) {
  dragState?.ghost?.remove();
}

function usableProbabilityRect(rect) {
  return Boolean(
    rect &&
    Number.isFinite(rect.left) &&
    Number.isFinite(rect.top) &&
    rect.width > 0 &&
    rect.height > 0
  );
}

function returnProbabilityDragGhostToSource(dragState, targetElement, fallbackRect = null) {
  const ghost = dragState?.ghost;

  if (!ghost || !targetElement) {
    targetElement?.classList.remove("is-dragging");
    removeProbabilityDragGhost(dragState);
    return;
  }

  const ghostRect = ghost.getBoundingClientRect();
  const visibleTargetRect = targetElement.getBoundingClientRect();
  const targetRect = usableProbabilityRect(visibleTargetRect) ? visibleTargetRect : fallbackRect;

  if (!usableProbabilityRect(targetRect)) {
    targetElement.classList.remove("is-dragging");
    ghost.remove();
    return;
  }

  const deltaX = targetRect.left - ghostRect.left;
  const deltaY = targetRect.top - ghostRect.top;
  const scaleX = targetRect.width / ghostRect.width;
  const scaleY = targetRect.height / ghostRect.height;

  if (typeof ghost.animate !== "function") {
    targetElement.classList.remove("is-dragging");
    ghost.remove();
    return;
  }

  const animation = ghost.animate([
    {
      opacity: 0.98,
      transform: "translate(0, 0) scale(1.02)"
    },
    {
      opacity: 1,
      transform: `translate(${deltaX}px, ${deltaY}px) scale(${scaleX}, ${scaleY})`
    }
  ], {
    duration: 260,
    easing: "cubic-bezier(0.2, 0.85, 0.18, 1)",
    fill: "forwards"
  });

  animation.finished
    .catch(() => {})
    .finally(() => {
      ghost.remove();
      targetElement.classList.remove("is-dragging");
      targetElement.classList.add("is-return-target");
      setTimeout(() => targetElement.classList.remove("is-return-target"), 160);
    });
}

function prepareProbabilityTransferAnimation(itemId, sourceElement, findTarget, releasePoint = null) {
  if (!sourceElement) {
    return null;
  }

  const elementRect = sourceElement.getBoundingClientRect();

  if (!elementRect.width || !elementRect.height) {
    return null;
  }

  const ghost = sourceElement.cloneNode(true);
  ghost.querySelector('[aria-hidden="true"]')?.remove();
  ghost.querySelector(".info-popover")?.remove();
  ghost.classList.remove("is-dragging", "probability-drag-ghost");
  ghost.classList.add("probability-return-ghost");
  ghost.setAttribute("aria-hidden", "true");
  ghost.removeAttribute("data-action");
  ghost.removeAttribute("data-probability-unwanted-personality");
  ghost.removeAttribute("data-personality-id");

  const hasReleasePoint = releasePoint &&
    Number.isFinite(releasePoint.x) &&
    Number.isFinite(releasePoint.y) &&
    (releasePoint.x > 0 || releasePoint.y > 0);
  const releaseX = hasReleasePoint ? releasePoint.x : elementRect.left + elementRect.width / 2;
  const releaseY = hasReleasePoint ? releasePoint.y : elementRect.top + elementRect.height / 2;
  const sourceRect = {
    left: releaseX - elementRect.width / 2,
    top: releaseY - elementRect.height / 2,
    width: elementRect.width,
    height: elementRect.height
  };

  ghost.style.left = `${sourceRect.left}px`;
  ghost.style.top = `${sourceRect.top}px`;
  ghost.style.width = `${sourceRect.width}px`;
  ghost.style.height = `${sourceRect.height}px`;
  document.body.appendChild(ghost);

  return () => {
    const target = findTarget(itemId);

    if (target) {
      target.classList.add("is-probability-transfer-target");
    }

    requestAnimationFrame(() => {
      const targetRect = target?.getBoundingClientRect();

      if (!target || !targetRect || typeof ghost.animate !== "function") {
        target?.classList.remove("is-probability-transfer-target");
        ghost.remove();
        return;
      }

      const deltaX = targetRect.left - sourceRect.left;
      const deltaY = targetRect.top - sourceRect.top;
      const scaleX = targetRect.width / sourceRect.width;
      const scaleY = targetRect.height / sourceRect.height;
      const animation = ghost.animate([
        {
          opacity: 0.96,
          transform: "translate(0, 0) scale(1)"
        },
        {
          opacity: 1,
          transform: `translate(${deltaX}px, ${deltaY}px) scale(${scaleX}, ${scaleY})`
        }
      ], {
        duration: 190,
        easing: "cubic-bezier(0.18, 0.9, 0.2, 1)",
        fill: "forwards"
      });

      animation.finished
        .catch(() => {})
        .finally(() => {
          target.classList.remove("is-probability-transfer-target");
          target.classList.add("is-return-target");

          const fadeAnimation = ghost.animate([
            {
              opacity: 0.92
            },
            {
              opacity: 0
            }
          ], {
            duration: 70,
            easing: "ease-out",
            fill: "forwards"
          });

          fadeAnimation.finished
            .catch(() => {})
            .finally(() => {
              ghost.remove();
              setTimeout(() => target.classList.remove("is-return-target"), 130);
            });
        });
    });
  };
}

function prepareProbabilityReturnAnimation(itemId, sourceElement, releasePoint = null) {
  return prepareProbabilityTransferAnimation(itemId, sourceElement, findProbabilityChoiceButton, releasePoint);
}

function prepareProbabilityUnwantedAnimation(itemId, sourceElement, releasePoint = null) {
  return prepareProbabilityTransferAnimation(itemId, sourceElement, findProbabilityUnwantedButton, releasePoint);
}

function captureProbabilityUnwantedLayout() {
  const layout = new Map();

  contentArea.querySelectorAll(".probability-unwanted-card[data-id]").forEach(card => {
    const rect = card.getBoundingClientRect();

    if (!rect.width || !rect.height) {
      return;
    }

    layout.set(card.dataset.id, {
      left: rect.left,
      top: rect.top
    });
  });

  return layout;
}

function animateProbabilityUnwantedLayout(previousLayout) {
  if (!previousLayout?.size || typeof Element.prototype.animate !== "function") {
    return;
  }

  requestAnimationFrame(() => {
    contentArea.querySelectorAll(".probability-unwanted-card[data-id]").forEach(card => {
      const previousRect = previousLayout.get(card.dataset.id);

      if (!previousRect) {
        return;
      }

      const nextRect = card.getBoundingClientRect();
      const deltaX = previousRect.left - nextRect.left;
      const deltaY = previousRect.top - nextRect.top;

      if (Math.abs(deltaX) < 1 && Math.abs(deltaY) < 1) {
        return;
      }

      card.animate([
        {
          transform: `translate(${deltaX}px, ${deltaY}px)`,
          opacity: 0.98
        },
        {
          transform: "translate(0, 0)",
          opacity: 1
        }
      ], {
        duration: 300,
        easing: "cubic-bezier(0.18, 0.9, 0.2, 1)",
        fill: "both"
      });
    });
  });
}

function probabilityDragLayoutKey(element) {
  if (element.classList.contains("probability-unwanted-drop-slot")) {
    return "drop-slot";
  }

  return element.dataset.id ? `card:${element.dataset.id}` : "";
}

function probabilityDragLayoutElements() {
  return Array.from(contentArea.querySelectorAll(".probability-unwanted-card[data-id], .probability-unwanted-drop-slot"));
}

function captureProbabilityDragLayout() {
  const layout = new Map();

  probabilityDragLayoutElements().forEach(element => {
    const key = probabilityDragLayoutKey(element);
    const style = window.getComputedStyle(element);
    const rect = element.getBoundingClientRect();

    if (!key || style.display === "none" || !rect.width || !rect.height) {
      return;
    }

    layout.set(key, {
      left: rect.left,
      top: rect.top
    });
  });

  return layout;
}

function animateProbabilityDragLayout(previousLayout) {
  if (!previousLayout?.size || typeof Element.prototype.animate !== "function") {
    return;
  }

  requestAnimationFrame(() => {
    probabilityDragLayoutElements().forEach(element => {
      const previousRect = previousLayout.get(probabilityDragLayoutKey(element));

      if (!previousRect) {
        return;
      }

      const nextRect = element.getBoundingClientRect();
      const deltaX = previousRect.left - nextRect.left;
      const deltaY = previousRect.top - nextRect.top;

      if (Math.abs(deltaX) < 1 && Math.abs(deltaY) < 1) {
        return;
      }

      element.getAnimations().forEach(animation => animation.cancel());
      element.animate([
        {
          transform: `translate(${deltaX}px, ${deltaY}px)`
        },
        {
          transform: "translate(0, 0)"
        }
      ], {
        duration: 180,
        easing: "cubic-bezier(0.18, 0.9, 0.2, 1)",
        fill: "both"
      });
    });
  });
}

function removeProbabilityUnwantedPersonality(itemId, options = {}) {
  const finishReturnAnimation = options.animate
    ? prepareProbabilityReturnAnimation(itemId, options.sourceElement, options.releasePoint)
    : null;
  const previousUnwantedLayout = captureProbabilityUnwantedLayout();

  probabilityUnwantedPersonalityIds = probabilityUnwantedPersonalityIds.filter(id => id !== itemId);
  renderView();
  animateProbabilityUnwantedLayout(previousUnwantedLayout);
  finishReturnAnimation?.();
}

function reorderProbabilityUnwantedPersonality(itemId, insertIndex, options = {}) {
  if (!useUnwantedPersonalityReorder) {
    return;
  }

  const currentIndex = probabilityUnwantedPersonalityIds.indexOf(itemId);

  if (currentIndex < 0) {
    return;
  }

  const finishUnwantedAnimation = options.animate
    ? prepareProbabilityUnwantedAnimation(itemId, options.sourceElement, options.releasePoint)
    : null;
  const previousUnwantedLayout = captureProbabilityUnwantedLayout();
  const nextUnwantedIds = probabilityUnwantedPersonalityIds.filter(id => id !== itemId);
  const safeInsertIndex = Math.min(
    Math.max(0, Number.isFinite(insertIndex) ? insertIndex : nextUnwantedIds.length),
    nextUnwantedIds.length
  );

  nextUnwantedIds.splice(safeInsertIndex, 0, itemId);
  probabilityUnwantedPersonalityIds = nextUnwantedIds;
  renderView();
  animateProbabilityUnwantedLayout(previousUnwantedLayout);
  finishUnwantedAnimation?.();
}

function clearProbabilityDragOver() {
  document.querySelectorAll("[data-probability-unwanted-zone].is-drag-over").forEach(zone => {
    zone.classList.remove("is-drag-over");
  });
}

function resetProbabilityUnwantedDropSlots() {
  document.querySelectorAll(".probability-unwanted-list").forEach(list => {
    const slot = list.querySelector(".probability-unwanted-drop-slot");

    list.classList.remove("is-reordering");
    slot?.classList.remove("is-reorder-slot");

    if (slot && slot.parentElement === list) {
      list.appendChild(slot);
    }
  });
}

function clearProbabilitySourceCollapse() {
  document.querySelectorAll(".probability-unwanted-card.is-source-collapsed").forEach(card => {
    card.classList.remove("is-source-collapsed");
  });
}

function setProbabilitySourceCollapsed(active) {
  clearProbabilitySourceCollapse();

  if (!active || probabilityDragState?.source !== "unwanted") {
    return;
  }

  probabilityDragState.button
    ?.closest(".probability-unwanted-card")
    ?.classList.add("is-source-collapsed");
}

function clearProbabilityDropIndicators() {
  clearProbabilityDragOver();
  resetProbabilityUnwantedDropSlots();
  document.querySelectorAll(".is-return-placeholder").forEach(element => {
    element.classList.remove("is-return-placeholder");
  });
  document.querySelectorAll(".is-return-target-placeholder").forEach(element => {
    element.classList.remove("is-return-target-placeholder");
  });
}

function findProbabilityPlaceholderCard(itemId) {
  return Array.from(contentArea.querySelectorAll(".probability-choice-card.is-unwanted-placeholder"))
    .find(card => card.dataset.id === itemId) || null;
}

function findProbabilityChoiceListFromElement(element) {
  return element?.closest(".probability-choice-list") || null;
}

function findProbabilityUnwantedListFromElement(element) {
  return element?.closest(".probability-unwanted-list") || null;
}

function findProbabilityDropTargetsAtPoint(clientX, clientY) {
  const elements = typeof document.elementsFromPoint === "function"
    ? document.elementsFromPoint(clientX, clientY)
    : [document.elementFromPoint(clientX, clientY)].filter(Boolean);
  let zone = null;
  let choiceList = null;
  let unwantedList = null;

  for (const element of elements) {
    if (!element || element.closest(".probability-drag-ghost, .probability-return-ghost")) {
      continue;
    }

    zone ||= element.closest("[data-probability-unwanted-zone]");
    choiceList ||= findProbabilityChoiceListFromElement(element);
    unwantedList ||= findProbabilityUnwantedListFromElement(element);

    if (zone && !unwantedList) {
      unwantedList = zone.querySelector(".probability-unwanted-list");
    }

    if (zone && choiceList && unwantedList) {
      break;
    }
  }

  return {
    zone,
    choiceList,
    unwantedList
  };
}

function probabilityUnwantedCardsForReorder(list, draggedId) {
  if (!list) {
    return [];
  }

  return Array.from(list.querySelectorAll(".probability-unwanted-card[data-id]"))
    .filter(card => card.dataset.id !== draggedId);
}

function captureProbabilityUnwantedReorderSnapshot(list, draggedId) {
  if (!list) {
    return null;
  }

  const allCards = Array.from(list.querySelectorAll(".probability-unwanted-card[data-id]"));
  const sourceCard = allCards.find(card => card.dataset.id === draggedId) || null;
  const sourceOriginalIndex = probabilityUnwantedPersonalityIds.indexOf(draggedId);
  let compactIndex = 0;
  const cards = allCards
    .map((card, originalIndex) => {
      const rect = card.getBoundingClientRect();
      const item = {
        card,
        id: card.dataset.id,
        index: card.dataset.id === draggedId ? -1 : compactIndex,
        originalIndex,
        rect
      };

      if (card.dataset.id !== draggedId) {
        compactIndex += 1;
      }

      return item;
    })
    .filter(item => item.id !== draggedId && item.rect.width && item.rect.height);

  return {
    cards,
    list,
    sourceOriginalIndex,
    sourceRect: sourceCard?.getBoundingClientRect() || null
  };
}

function captureProbabilityStableReorderCards(list, draggedId) {
  if (!list) {
    return [];
  }

  const slot = list.querySelector(".probability-unwanted-drop-slot");
  const sourceCard = Array.from(list.querySelectorAll(".probability-unwanted-card[data-id]"))
    .find(card => card.dataset.id === draggedId) || null;
  const previousSlotDisplay = slot?.style.display || "";
  const sourceWasCollapsed = sourceCard?.classList.contains("is-source-collapsed") || false;

  if (slot) {
    slot.style.display = "none";
  }

  sourceCard?.classList.add("is-source-collapsed");

  const cards = probabilityUnwantedCardsForReorder(list, draggedId)
    .map((card, index) => ({
      card,
      index,
      originalIndex: probabilityUnwantedPersonalityIds.indexOf(card.dataset.id),
      rect: card.getBoundingClientRect()
    }))
    .filter(item => item.rect.width && item.rect.height);

  if (!sourceWasCollapsed) {
    sourceCard?.classList.remove("is-source-collapsed");
  }

  if (slot) {
    slot.style.display = previousSlotDisplay;
  }

  return cards;
}

function probabilityUnwantedRowsForCards(cards) {
  const rows = [];

  cards.forEach((card, index) => {
    const rect = card.rect || card.getBoundingClientRect();

    if (!rect.width || !rect.height) {
      return;
    }

    const centerY = rect.top + rect.height / 2;
    let row = rows.find(item => centerY >= item.top && centerY <= item.bottom);

    if (!row) {
      row = {
        top: rect.top,
        bottom: rect.bottom,
        items: []
      };
      rows.push(row);
    }

    row.top = Math.min(row.top, rect.top);
    row.bottom = Math.max(row.bottom, rect.bottom);
    row.items.push({
      card: card.card || card,
      index: Number.isFinite(card.index) ? card.index : index,
      originalIndex: Number.isFinite(card.originalIndex) ? card.originalIndex : index,
      rect
    });
  });

  return rows
    .sort((a, b) => a.top - b.top)
    .map(row => ({
      ...row,
      items: row.items.sort((a, b) => a.rect.left - b.rect.left)
    }));
}

function pointIsInsideRect(clientX, clientY, rect) {
  return Boolean(
    rect &&
    clientX >= rect.left &&
    clientX <= rect.right &&
    clientY >= rect.top &&
    clientY <= rect.bottom
  );
}

function getProbabilityUnwantedInsertTarget(clientX, clientY, draggedId, preferredList = null, reorderSnapshot = null) {
  const unwantedList = preferredList || findProbabilityDropTargetsAtPoint(clientX, clientY).unwantedList;

  if (!unwantedList) {
    return null;
  }

  const snapshot = reorderSnapshot?.list === unwantedList ? reorderSnapshot : null;
  const cards = snapshot?.cards || captureProbabilityStableReorderCards(unwantedList, draggedId);
  const draggedIndex = probabilityUnwantedPersonalityIds.indexOf(draggedId);

  if (snapshot?.sourceRect && pointIsInsideRect(clientX, clientY, snapshot.sourceRect)) {
    return {
      list: unwantedList,
      insertIndex: Math.min(
        Math.max(0, snapshot.sourceOriginalIndex >= 0 ? snapshot.sourceOriginalIndex : draggedIndex),
        cards.length
      )
    };
  }

  if (!cards.length) {
    return {
      list: unwantedList,
      insertIndex: 0
    };
  }

  const hoveredCard = cards.find(item => (
    pointIsInsideRect(clientX, clientY, item.rect)
  ));

  if (hoveredCard) {
    const insertIndex = draggedIndex >= 0 && draggedIndex < hoveredCard.originalIndex
      ? hoveredCard.index + 1
      : hoveredCard.index;

    return {
      list: unwantedList,
      insertIndex
    };
  }

  const rows = probabilityUnwantedRowsForCards(cards);

  for (const row of rows) {
    if (clientY < row.top) {
      return {
        list: unwantedList,
        insertIndex: row.items[0].index
      };
    }

    if (clientY <= row.bottom) {
      for (const item of row.items) {
        if (clientX < item.rect.left + item.rect.width / 2) {
          return {
            list: unwantedList,
            insertIndex: item.index
          };
        }
      }

      return {
        list: unwantedList,
        insertIndex: row.items[row.items.length - 1].index + 1
      };
    }
  }

  return {
    list: unwantedList,
    insertIndex: cards.length
  };
}

function showProbabilityUnwantedReorderSlot(itemId, clientX, clientY, preferredList = null, preparedTarget = null) {
  if (!useUnwantedPersonalityReorder) {
    return null;
  }

  const insertTarget = preparedTarget || getProbabilityUnwantedInsertTarget(clientX, clientY, itemId, preferredList);
  const slot = insertTarget?.list.querySelector(".probability-unwanted-drop-slot");

  if (!insertTarget || !slot) {
    return null;
  }

  const cards = probabilityUnwantedCardsForReorder(insertTarget.list, itemId);
  const referenceCard = cards[insertTarget.insertIndex] || null;

  insertTarget.list.insertBefore(slot, referenceCard);
  insertTarget.list.classList.add("is-reordering");
  slot.classList.add("is-reorder-slot");

  return insertTarget;
}

function probabilityDropVisualSignature(dragState, zone, choiceList, reorderTarget) {
  if (!dragState) {
    return "none";
  }

  if (dragState.source === "choice") {
    return zone ? "choice-zone" : "choice-none";
  }

  if (dragState.source === "unwanted") {
    if (reorderTarget) {
      return `unwanted-reorder:${reorderTarget.insertIndex}`;
    }

    if (choiceList) {
      return "unwanted-return";
    }

    return "unwanted-none";
  }

  return "none";
}

function setInfoPanelDragSuppressed(active) {
  document.body.classList.toggle("is-info-drag-suppressed", Boolean(active));

  if (active) {
    closeTouchInfo();
  }
}

function isDraggingForInfoPanel() {
  return Boolean(
    probabilityDragState ||
    personalityDragState ||
    livlyPanelDragState ||
    livlyCropDragState ||
    livlyCropLoupeDragState ||
    probabilityNativeDragId ||
    document.body.classList.contains("is-probability-pressing") ||
    document.body.classList.contains("is-probability-dragging") ||
    document.body.classList.contains("is-experience-column-dragging")
  );
}

function clearProbabilityDragVisualState() {
  document.body.classList.remove("is-probability-dragging-choice", "is-probability-dragging-unwanted", "is-probability-pressing");
  clearProbabilitySourceCollapse();
  clearProbabilityDropIndicators();
}

function setProbabilityDragSourceState(source) {
  document.body.classList.toggle("is-probability-dragging-choice", source === "choice");
  document.body.classList.toggle("is-probability-dragging-unwanted", source === "unwanted");
}

function rememberProbabilityDragPoint(event) {
  if (
    event &&
    Number.isFinite(event.clientX) &&
    Number.isFinite(event.clientY) &&
    (event.clientX > 0 || event.clientY > 0)
  ) {
    probabilityLastDragPoint = {
      clientX: event.clientX,
      clientY: event.clientY,
      pointerType: event.pointerType || "mouse"
    };
  }
}

function cancelScheduledProbabilityInfoPanel() {
  probabilityInfoPanelScheduleToken += 1;
  probabilityInfoPanelScheduledPoint = null;
}

function cancelScheduledProbabilityInfoPanelOnMove(event) {
  if (activeRoute !== "personalityProbability" || !canUseCursorPanel(event)) {
    return;
  }

  if (!probabilityInfoPanelScheduledPoint) {
    return;
  }

  const distance = Math.hypot(
    event.clientX - probabilityInfoPanelScheduledPoint.clientX,
    event.clientY - probabilityInfoPanelScheduledPoint.clientY
  );

  if (distance > 4) {
    cancelScheduledProbabilityInfoPanel();
  }
}

function infoPanelPointFromEvent(event, fallbackHost) {
  if (
    event &&
    Number.isFinite(event.clientX) &&
    Number.isFinite(event.clientY) &&
    (event.clientX > 0 || event.clientY > 0)
  ) {
    return {
      clientX: event.clientX,
      clientY: event.clientY,
      pointerType: event.pointerType || "mouse"
    };
  }

  if (probabilityLastDragPoint) {
    return probabilityLastDragPoint;
  }

  const rect = fallbackHost?.getBoundingClientRect();

  if (rect) {
    return {
      clientX: rect.left + rect.width / 2,
      clientY: rect.top + rect.height / 2,
      pointerType: "mouse"
    };
  }

  return null;
}

function temporarilyIgnoreElementForHitTest(element, callback) {
  if (!element || !element.isConnected) {
    return callback();
  }

  const previousPointerEvents = element.style.pointerEvents;
  element.style.pointerEvents = "none";

  try {
    return callback();
  } finally {
    element.style.pointerEvents = previousPointerEvents;
  }
}

function findInfoPanelHostAtPoint(point, ignoredHost = null) {
  if (!point) {
    return null;
  }

  const elements = typeof document.elementsFromPoint === "function"
    ? document.elementsFromPoint(point.clientX, point.clientY)
    : [document.elementFromPoint(point.clientX, point.clientY)].filter(Boolean);

  for (const element of elements) {
    if (
      !element ||
      element === ignoredHost ||
      ignoredHost?.contains(element) ||
      element.closest(".probability-return-ghost, .info-popover")
    ) {
      continue;
    }

    const host = findInfoPanelHost(element);

    if (host && host !== ignoredHost) {
      return host;
    }
  }

  return temporarilyIgnoreElementForHitTest(ignoredHost, () => {
    const target = document.elementFromPoint(point.clientX, point.clientY);
    const host = target ? findInfoPanelHost(target) : null;

    return host && host !== ignoredHost ? host : null;
  });
}

function clearProbabilityDragStateAfterRelease(options = {}) {
  if (!options.keepNativeDropInside) {
    probabilityNativeDropInsideUnwanted = false;
  }

  stopProbabilityAutoScroll(probabilityDragState);
  probabilityNativeDragSource = "";
  probabilityNativeDragId = "";
  probabilityLastDragPoint = null;
  removeProbabilityDragGhost(probabilityDragState);
  probabilityDragState?.button?.classList.remove("is-dragging");
  probabilityDragState = null;
  setInfoPanelDragSuppressed(false);
  document.body.classList.remove("is-probability-dragging", "is-probability-pressing");
  clearProbabilityDragVisualState();
}

function releaseInfoPanelSuppressionAfterDrag(event = null) {
  setInfoPanelDragSuppressed(false);
  document.body.classList.remove("is-probability-dragging", "is-probability-pressing", "is-experience-column-dragging");

  if (!probabilityDragState) {
    probabilityNativeDragSource = "";
    probabilityNativeDragId = "";
    clearProbabilityDragVisualState();
  }

}

function scheduleInfoPanelForHostAfterRelease(event, fallbackHost) {
  const point = infoPanelPointFromEvent(event, fallbackHost);

  if (!point) {
    return;
  }

  const panelEvent = {
    clientX: point.clientX,
    clientY: point.clientY,
    pointerType: point.pointerType || "mouse"
  };
  const delays = [0, 16, 60, 140];
  const scheduleToken = probabilityInfoPanelScheduleToken + 1;

  probabilityInfoPanelScheduleToken = scheduleToken;
  probabilityInfoPanelScheduledPoint = panelEvent;

  delays.forEach(delay => {
    setTimeout(() => {
      if (editMode || scheduleToken !== probabilityInfoPanelScheduleToken) {
        return;
      }

      releaseInfoPanelSuppressionAfterDrag();
      showInfoPanelForHostAfterRelease(panelEvent, fallbackHost);
    }, delay);
  });

  setTimeout(() => {
    if (scheduleToken === probabilityInfoPanelScheduleToken) {
      probabilityInfoPanelScheduledPoint = null;
    }
  }, Math.max(...delays) + 20);
}

function scheduleInfoPanelAtProbabilityDragPoint(event) {
  if (activeRoute !== "personalityProbability" || editMode) {
    return;
  }

  const point = infoPanelPointFromEvent(event, null);

  if (!point) {
    return;
  }

  scheduleInfoPanelForHostAfterRelease(point, null);
}

function scheduleInfoPanelAtProbabilityReleasePoint(event) {
  if (activeRoute !== "personalityProbability" || editMode || !canUseCursorPanel(event)) {
    return;
  }

  const point = infoPanelPointFromEvent(event, null);
  const host = findInfoPanelHostAtPoint(point, null);

  if (!host || event.target.closest(".info-popover")) {
    return;
  }

  scheduleInfoPanelForHostAfterRelease(point, null);
}

function showInfoPanelForHostAfterRelease(event, fallbackHost) {
  const point = infoPanelPointFromEvent(event, fallbackHost);

  if (editMode || !point || !canUseCursorPanel(event || point)) {
    return;
  }

  if (isDraggingForInfoPanel()) {
    return;
  }

  const finalHost = findInfoPanelHostAtPoint(point, fallbackHost) || (fallbackHost?.isConnected ? fallbackHost : null);
  const target = document.elementFromPoint(point.clientX, point.clientY);
  const panel = finalHost ? finalHost.querySelector(".info-popover") : null;

  if (!panel) {
    return;
  }

  const panelEvent = {
    clientX: point.clientX,
    clientY: point.clientY,
    pointerType: point.pointerType || "mouse",
    target: target || finalHost
  };

  document.body.classList.add("is-mouse-input");
  positionInfoPanel(panelEvent, panel);
  requestAnimationFrame(() => {
    if (!isDraggingForInfoPanel() && finalHost.isConnected) {
      positionInfoPanel(panelEvent, panel);
    }
  });
}

function showInfoPanelForNativeReturnBeforeCleanup(event) {
  if (activeRoute !== "personalityProbability" || !probabilityNativeDragId || probabilityNativeDropInsideUnwanted) {
    return;
  }

  rememberProbabilityDragPoint(event);

  const target = document.elementFromPoint(
    probabilityLastDragPoint?.clientX ?? event.clientX,
    probabilityLastDragPoint?.clientY ?? event.clientY
  );
  const unwantedZone = target ? target.closest("[data-probability-unwanted-zone]") : null;
  const choiceList = findProbabilityChoiceListFromElement(target);

  if (
    (probabilityNativeDragSource === "choice" && unwantedZone) ||
    (probabilityNativeDragSource === "unwanted" && choiceList && !unwantedZone)
  ) {
    return;
  }

  const selector = probabilityNativeDragSource === "unwanted"
    ? `[data-probability-unwanted-personality="${CSS.escape(probabilityNativeDragId)}"]`
    : `[data-probability-personality="${CSS.escape(probabilityNativeDragId)}"]`;
  const button = document.querySelector(selector);
  const sourceHost = button?.closest(".probability-choice-card");

  if (!sourceHost) {
    return;
  }

  button.classList.remove("is-dragging");
  probabilityNativeDragSource = "";
  probabilityNativeDragId = "";
  setInfoPanelDragSuppressed(false);
  document.body.classList.remove("is-probability-dragging", "is-probability-pressing");
  clearProbabilityDragVisualState();
  scheduleInfoPanelForHostAfterRelease(event, sourceHost);
}

function showProbabilityReturnTarget(itemId) {
  const placeholderCard = findProbabilityPlaceholderCard(itemId);

  placeholderCard?.classList.add("is-return-target-placeholder");
  placeholderCard?.querySelector(".probability-choice-placeholder")?.classList.add("is-return-placeholder");
}

function stopProbabilityAutoScroll(dragState = probabilityDragState) {
  if (!dragState) {
    return;
  }

  dragState.autoScrollSpeed = 0;

  if (dragState.autoScrollFrame) {
    cancelAnimationFrame(dragState.autoScrollFrame);
    dragState.autoScrollFrame = null;
  }
}

function runProbabilityAutoScroll() {
  const dragState = probabilityDragState;

  if (!dragState) {
    return;
  }

  const speed = dragState.autoScrollSpeed;
  const maxScrollTop = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
  const currentScrollTop = window.scrollY || document.documentElement.scrollTop || 0;

  if (!speed || (speed < 0 && currentScrollTop <= 0) || (speed > 0 && currentScrollTop >= maxScrollTop)) {
    dragState.autoScrollSpeed = 0;
    dragState.autoScrollFrame = null;
    return;
  }

  window.scrollBy(0, speed);

  if (dragState.isDragging) {
    updateProbabilityDragGhost(dragState, {
      clientX: dragState.lastClientX,
      clientY: dragState.lastClientY
    });
    updateProbabilityDragVisualAtPoint(dragState.lastClientX, dragState.lastClientY);
  }

  dragState.autoScrollFrame = requestAnimationFrame(runProbabilityAutoScroll);
}

function updateProbabilityAutoScroll(clientY) {
  if (!probabilityDragState?.isDragging) {
    return;
  }

  const edgeSize = 84;
  const maxSpeed = 18;
  let speed = 0;

  if (clientY < edgeSize) {
    speed = -Math.ceil(((edgeSize - clientY) / edgeSize) * maxSpeed);
  } else if (clientY > window.innerHeight - edgeSize) {
    speed = Math.ceil(((clientY - (window.innerHeight - edgeSize)) / edgeSize) * maxSpeed);
  }

  probabilityDragState.autoScrollSpeed = speed;

  if (speed && !probabilityDragState.autoScrollFrame) {
    runProbabilityAutoScroll();
  }
}

function updateProbabilityDragVisualAtPoint(clientX, clientY) {
  if (!probabilityDragState?.isDragging) {
    return;
  }

  const { zone, choiceList, unwantedList } = findProbabilityDropTargetsAtPoint(clientX, clientY);
  const reorderTarget = probabilityDragState.source === "unwanted" && useUnwantedPersonalityReorder && zone
    ? getProbabilityUnwantedInsertTarget(
      clientX,
      clientY,
      probabilityDragState.id,
      unwantedList,
      probabilityDragState.reorderSnapshot
    )
    : null;
  const dropSignature = probabilityDropVisualSignature(probabilityDragState, zone, choiceList, reorderTarget);

  if (probabilityDragState.dropSignature === dropSignature) {
    return;
  }

  const previousLayout = probabilityDragState.source === "unwanted"
    ? captureProbabilityDragLayout()
    : null;

  clearProbabilityDropIndicators();
  setProbabilitySourceCollapsed(false);

  if (probabilityDragState.source === "choice" && zone) {
    zone.classList.add("is-drag-over");
  }

  if (probabilityDragState.source === "unwanted") {
    if (reorderTarget) {
      setProbabilitySourceCollapsed(true);
      zone.classList.add("is-drag-over");
      showProbabilityUnwantedReorderSlot(probabilityDragState.id, clientX, clientY, unwantedList, reorderTarget);
    } else if (choiceList) {
      setProbabilitySourceCollapsed(true);
      showProbabilityReturnTarget(probabilityDragState.id);
    }
  }

  animateProbabilityDragLayout(previousLayout);
  probabilityDragState.dropSignature = dropSignature;
}

function startProbabilityDrag(event) {
  const unwantedButton = event.target.closest("[data-probability-unwanted-personality]");
  const button = unwantedButton || event.target.closest("[data-probability-personality]");

  if (!button || activeRoute !== "personalityProbability") {
    return;
  }

  rememberProbabilityDragPoint(event);
  probabilityDragState = {
    button,
    ghost: null,
    id: button.dataset.probabilityPersonality || button.dataset.probabilityUnwantedPersonality,
    isDragging: false,
    offsetX: 0,
    offsetY: 0,
    pointerId: event.pointerId,
    source: unwantedButton ? "unwanted" : "choice",
    autoScrollFrame: null,
    autoScrollSpeed: 0,
    dropSignature: "",
    lastClientX: event.clientX,
    lastClientY: event.clientY,
    reorderSnapshot: null,
    startX: event.clientX,
    startY: event.clientY
  };
  document.body.classList.add("is-probability-pressing");
  setInfoPanelDragSuppressed(true);
  button.setPointerCapture?.(event.pointerId);
  closeTouchInfo();
}

function moveProbabilityDrag(event) {
  if (!probabilityDragState || probabilityDragState.pointerId !== event.pointerId) {
    return;
  }

  if (event.probabilityDragHandled) {
    return;
  }

  event.probabilityDragHandled = true;
  rememberProbabilityDragPoint(event);
  probabilityDragState.lastClientX = event.clientX;
  probabilityDragState.lastClientY = event.clientY;
  const distance = Math.hypot(event.clientX - probabilityDragState.startX, event.clientY - probabilityDragState.startY);

  if (distance > 8 && !probabilityDragState.isDragging) {
    probabilityDragState.isDragging = true;
    const ghostState = createProbabilityDragGhost(probabilityDragState.button, event);

    if (ghostState) {
      probabilityDragState.ghost = ghostState.ghost;
      probabilityDragState.offsetX = ghostState.offsetX;
      probabilityDragState.offsetY = ghostState.offsetY;
    }

    if (probabilityDragState.source === "unwanted") {
      probabilityDragState.reorderSnapshot = captureProbabilityUnwantedReorderSnapshot(
        probabilityDragState.button.closest(".probability-unwanted-list"),
        probabilityDragState.id
      );
    }

    probabilityDragState.button.classList.add("is-dragging");
    document.body.classList.add("is-probability-dragging");
    setProbabilityDragSourceState(probabilityDragState.source);
    closeTouchInfo();
  }

  if (!probabilityDragState.isDragging) {
    return;
  }

  updateProbabilityDragGhost(probabilityDragState, event);
  updateProbabilityAutoScroll(event.clientY);
  updateProbabilityDragVisualAtPoint(event.clientX, event.clientY);

  event.preventDefault();
}

function finishProbabilityDrag(event) {
  if (!probabilityDragState || probabilityDragState.pointerId !== event.pointerId) {
    return;
  }

  rememberProbabilityDragPoint(event);
  const { button, id, isDragging, source } = probabilityDragState;
  const sourceHost = button.closest(".probability-choice-card");
  const { zone, choiceList, unwantedList } = findProbabilityDropTargetsAtPoint(event.clientX, event.clientY);
  const reorderTarget = source === "unwanted" && useUnwantedPersonalityReorder && zone
    ? getProbabilityUnwantedInsertTarget(
      event.clientX,
      event.clientY,
      id,
      unwantedList,
      probabilityDragState.reorderSnapshot
    )
    : null;
  const isSameUnwantedPosition = source === "unwanted" &&
    reorderTarget &&
    reorderTarget.insertIndex === probabilityUnwantedPersonalityIds.indexOf(id);
  const isUnwantedReorderMove = source === "unwanted" && reorderTarget && !isSameUnwantedPosition;
  const movedToOtherArea = Boolean(
    (source === "choice" && zone) ||
    (source === "unwanted" && choiceList && !zone) ||
    isUnwantedReorderMove
  );
  const shouldReturnToSource = isDragging && !movedToOtherArea;
  const finishingDragState = probabilityDragState;

  stopProbabilityAutoScroll(finishingDragState);
  button.releasePointerCapture?.(event.pointerId);

  if (isDragging && isUnwantedReorderMove) {
    const finishReorderAnimation = prepareProbabilityTransferAnimation(
      id,
      finishingDragState.ghost || button,
      findProbabilityUnwantedButton
    );

    removeProbabilityDragGhost(finishingDragState);
    probabilityDragState = null;
    document.body.classList.remove("is-probability-dragging", "is-probability-pressing");
    setInfoPanelDragSuppressed(false);
    suppressNextProbabilityClick = true;

    reorderProbabilityUnwantedPersonality(id, reorderTarget.insertIndex, {
      animate: false
    });
    clearProbabilityDragVisualState();
    finishReorderAnimation?.();
    event.preventDefault();
    return;
  }

  if (shouldReturnToSource) {
    returnProbabilityDragGhostToSource(
      finishingDragState,
      button,
      source === "unwanted" ? finishingDragState.reorderSnapshot?.sourceRect : null
    );
  } else {
    button.classList.remove("is-dragging");
    removeProbabilityDragGhost(finishingDragState);
  }

  clearProbabilityDragOver();
  clearProbabilityDragVisualState();
  probabilityDragState = null;
  document.body.classList.remove("is-probability-dragging", "is-probability-pressing");
  setInfoPanelDragSuppressed(false);

  if (isDragging) {
    suppressNextProbabilityClick = true;

    if (source === "choice" && zone) {
      addProbabilityUnwantedPersonality(id, {
        animate: true,
        sourceElement: button,
        releasePoint: {
          x: event.clientX,
          y: event.clientY
        }
      });
    }

    if (source === "unwanted" && choiceList && !zone) {
      removeProbabilityUnwantedPersonality(id, {
        animate: true,
        sourceElement: button,
        releasePoint: {
          x: event.clientX,
          y: event.clientY
        }
      });
    }

    event.preventDefault();
  }

  if (shouldReturnToSource) {
    scheduleInfoPanelForHostAfterRelease(event, sourceHost);
  }
}

function updateProbabilityResult() {
  const probability = calculatePersonalityProbability();
  const result = contentArea.querySelector("[data-probability-result]");
  const resultInfo = contentArea.querySelector("[data-probability-result-info]");

  if (result) {
    result.textContent = probabilityPercentText(probability);
  }

  if (resultInfo) {
    resultInfo.textContent = probabilityResultRollText(probability);
  }
}

function updateProbabilitySlotRate(input) {
  const field = input.dataset.slotRate;

  if (!field || !(field in appData.personalitySlotRates)) {
    return;
  }

  const cleanValue = cleanPercentageNumber(input.value);

  if (input.value !== cleanValue) {
    input.value = cleanValue;
  }

  appData.personalitySlotRates[field] = percentageStorageValue(cleanValue);
  updateProbabilityResult();
}

function formatProbabilitySlotRateInput(input) {
  const field = input.dataset.slotRate;

  if (!field || !(field in appData.personalitySlotRates)) {
    return;
  }

  const formattedValue = formatPercentageNumber(input.value);
  input.value = formattedValue;
  appData.personalitySlotRates[field] = percentageStorageValue(formattedValue);
  updateProbabilityResult();
}

function saveProbabilitySettings() {
  if (!editMode) {
    return;
  }

  Object.keys(appData.personalitySlotRates).forEach(field => {
    appData.personalitySlotRates[field] = percentageStorageValue(appData.personalitySlotRates[field]);
  });

  appData = saveAppData(appData);
  commitProbabilitySettingsEditSession();
  renderView();

  const button = document.querySelector('[data-action="save-probability-settings"]');

  if (!button) {
    return;
  }

  button.textContent = "保存しました";
  button.classList.add("is-saved");

  setTimeout(() => {
    const currentButton = document.querySelector('[data-action="save-probability-settings"]');

    if (currentButton) {
      currentButton.textContent = "保存";
      currentButton.classList.remove("is-saved");
    }
  }, 1200);
}

function beginExperienceEditSession() {
  if (activeRoute === "exp" && editMode && !experienceEditBackup) {
    experienceEditBackup = cloneData(currentExperienceEditData());
  }
}

function discardUnsavedExperienceEdits() {
  if (activeRoute !== "exp" || !experienceEditBackup) {
    return;
  }

  appData.experienceColumns = cloneData(experienceEditBackup.experienceColumns);
  appData.experienceTable = cloneData(experienceEditBackup.experienceTable);
  appData.experienceMaxRebirths = experienceEditBackup.experienceMaxRebirths;
  experienceEditBackup = null;
}

function commitExperienceEditSession() {
  if (activeRoute === "exp" && editMode) {
    experienceEditBackup = cloneData(currentExperienceEditData());
  }
}

function hasUnsavedExperienceEdits() {
  return Boolean(
    activeRoute === "exp" &&
    editMode &&
    experienceEditBackup &&
    !sameData(currentExperienceEditData(), experienceEditBackup)
  );
}

function currentExperienceEditData() {
  return {
    experienceColumns: appData.experienceColumns,
    experienceTable: appData.experienceTable,
    experienceMaxRebirths: appData.experienceMaxRebirths
  };
}

function personalityById(id) {
  return appData.personalities.find(personality => personality.id === id);
}

function experienceColumnLabel(column) {
  if (column.type === "normal") {
    return column.label || "通常";
  }

  const personality = personalityById(column.personalityId);
  return personality ? personality.name || "名前未設定" : column.label || "個性未設定";
}

function experienceColumnInfo(column) {
  if (column.type === "normal") {
    return "通常の必要経験値です。";
  }

  const personality = personalityById(column.personalityId);
  return personality ? personality.content || "内容未設定" : "個性未設定";
}

function ensureExperienceSelection() {
  if (!appData.experienceColumns.some(column => column.id === expGrowthType)) {
    expGrowthType = appData.experienceColumns[0]?.id || "normal";
  }
}

function sortedExperienceRows() {
  return [...appData.experienceTable].sort((left, right) => (Number(left.level) || 0) - (Number(right.level) || 0));
}

function experienceValue(row, columnId) {
  return Number(cleanNumberLikeInput(row.values?.[columnId])) || 0;
}

function maxExperienceLevel() {
  const maxRowLevel = sortedExperienceRows().reduce((max, row) => Math.max(max, Number(row.level) || 0), 0);
  return Math.max(1, maxRowLevel + 1);
}

function experienceTotalForRange(columnId, fromLevel, toLevel) {
  if (toLevel <= fromLevel) {
    return 0;
  }

  return sortedExperienceRows()
    .filter(row => {
      const level = Number(row.level) || 0;
      return level >= fromLevel && level < toLevel;
    })
    .reduce((total, row) => total + experienceValue(row, columnId), 0);
}

function rebirthOptions() {
  const max = Math.max(0, Number(cleanNumberLikeInput(appData.experienceMaxRebirths)) || 0);
  return Array.from({ length: max + 1 }, (_, index) => String(index));
}

function clampExperienceRebirthSelections() {
  const max = Math.max(0, Number(cleanNumberLikeInput(appData.experienceMaxRebirths)) || 0);
  expCurrentRebirth = String(Math.min(max, Number(cleanNumberLikeInput(expCurrentRebirth)) || 0));
  expTargetRebirth = String(Math.min(max, Number(cleanNumberLikeInput(expTargetRebirth)) || 0));
}

function calculateExperienceRequired() {
  ensureExperienceSelection();
  clampExperienceRebirthSelections();
  const currentLevel = Number(cleanNumberLikeInput(expCurrentLevel)) || 1;
  const targetLevel = Number(cleanNumberLikeInput(expTargetLevel)) || currentLevel;
  const currentRebirth = Number(cleanNumberLikeInput(expCurrentRebirth)) || 0;
  const targetRebirth = Number(cleanNumberLikeInput(expTargetRebirth)) || currentRebirth;
  const maxLevel = maxExperienceLevel();

  if (targetRebirth < currentRebirth || (targetRebirth === currentRebirth && targetLevel <= currentLevel)) {
    return 0;
  }

  if (targetRebirth === currentRebirth) {
    return experienceTotalForRange(expGrowthType, currentLevel, targetLevel);
  }

  const firstRun = experienceTotalForRange(expGrowthType, currentLevel, maxLevel);
  const middleRuns = Math.max(0, targetRebirth - currentRebirth - 1) * experienceTotalForRange(expGrowthType, 1, maxLevel);
  const lastRun = experienceTotalForRange(expGrowthType, 1, targetLevel);

  return firstRun + middleRuns + lastRun;
}

function renderExperienceCalculatorView() {
  ensureExperienceSelection();
  clampExperienceRebirthSelections();
  const result = calculateExperienceRequired();
  const saveButton = editMode
    ? `
      <button type="button" class="personality-save-button ${hasUnsavedExperienceEdits() ? "is-dirty" : ""}" data-action="save-experience">
        編集内容を保存
      </button>
    `
    : "";

  if (!expSelectedLivlyId && appData.livlies[0]) {
    expSelectedLivlyId = appData.livlies[0].id;
  }

  return `
    ${saveButton}
    <section class="experience-page">
      <section class="probability-result experience-result">
        <span>必要経験値</span>
        <strong data-exp-result>${result.toLocaleString("ja-JP")}</strong>
      </section>

      <section class="experience-controls">
        ${renderExperienceLivlyPicker()}
        ${renderExperienceLevelPath()}
        ${renderExperiencePersonalityChoices()}
        ${editMode ? `
          <label class="experience-max-rebirth">
            <span>最大転生回数</span>
            <input type="text" inputmode="numeric" data-exp-input="maxRebirths" value="${escapeHtml(appData.experienceMaxRebirths)}">
          </label>
        ` : ""}
      </section>

      ${renderExperienceTable()}
    </section>
  `;
}

function selectedExperienceLivly() {
  return appData.livlies.find(item => item.id === expSelectedLivlyId) || null;
}

function renderExperienceLivlyPicker() {
  const selectedLivly = selectedExperienceLivly();
  const title = selectedLivly ? livlyTitle(selectedLivly) : "未選択";

  return `
    <label class="experience-livly-picker">
      <span>リブリー</span>
      <div class="experience-livly-select">
        <div class="experience-livly-preview">${selectedLivly ? renderLivlyImage(selectedLivly, title) : "?"}</div>
        <select data-exp-input="livlyId">
          <option value="">未選択</option>
          ${appData.livlies.map(item => `
            <option value="${escapeHtml(item.id)}" ${expSelectedLivlyId === item.id ? "selected" : ""}>${escapeHtml(livlyTitle(item))}</option>
          `).join("")}
        </select>
      </div>
    </label>
  `;
}

function renderExperienceLevelPath() {
  return `
    <div class="experience-level-path">
      <div class="experience-point-block">
        <span class="experience-control-title">現在</span>
        ${renderExperiencePoint("現在", "currentRebirth", expCurrentRebirth, "currentLevel", expCurrentLevel)}
      </div>
      <span class="experience-arrow" aria-hidden="true">→</span>
      <div class="experience-point-block">
        <span class="experience-control-title">目標</span>
        ${renderExperiencePoint("目標", "targetRebirth", expTargetRebirth, "targetLevel", expTargetLevel)}
      </div>
    </div>
  `;
}

function renderExperiencePoint(label, rebirthField, rebirthValue, levelField, levelValue) {
  return `
    <div class="experience-point" aria-label="${escapeHtml(label)}">
      <label>
        <span>転生</span>
        <select data-exp-input="${escapeHtml(rebirthField)}">
          ${rebirthOptions().map(value => `
            <option value="${value}" ${rebirthValue === value ? "selected" : ""}>${value}回</option>
          `).join("")}
        </select>
      </label>
      <label>
        <span>Lv.</span>
        <input type="text" inputmode="numeric" data-exp-input="${escapeHtml(levelField)}" value="${escapeHtml(levelValue)}">
      </label>
    </div>
  `;
}

function renderExperiencePersonalityChoices() {
  return `
    <div class="experience-personality-block">
      <span class="experience-control-title">個性</span>
      <fieldset class="experience-personality-choices" aria-label="個性">
        ${appData.experienceColumns.map(column => `
          <label>
            <span>${escapeHtml(experienceColumnLabel(column))}</span>
            <input type="radio" name="experience-growth-type" data-exp-input="growthType" value="${escapeHtml(column.id)}" ${expGrowthType === column.id ? "checked" : ""}>
            <i aria-hidden="true"></i>
          </label>
        `).join("")}
      </fieldset>
    </div>
  `;
}

function renderExperienceTable() {
  const columns = appData.experienceColumns;
  const gridStyle = `grid-template-columns: 110px repeat(${columns.length}, minmax(120px, 1fr))${editMode ? " 48px" : ""};`;
  const maxLevel = maxExperienceLevel();

  return `
    <section class="experience-table-wrap">
      <div class="experience-table">
        <div class="experience-row experience-row-head" style="${gridStyle}">
          <span>レベル</span>
          ${columns.map(column => renderExperienceColumnHead(column)).join("")}
          ${editMode ? `<button type="button" class="experience-add-column-button" data-action="add-exp-column" aria-label="個性を追加">＋</button>` : ""}
        </div>
        ${sortedExperienceRows().map(row => `
          <div class="experience-row" data-exp-row-id="${escapeHtml(row.id)}" style="${gridStyle}">
            <strong>レベル${escapeHtml(row.level || "")}</strong>
            ${columns.map(column => renderExperienceCell(row, column.id)).join("")}
            ${editMode ? `<span class="experience-row-spacer"></span>` : ""}
          </div>
        `).join("")}
        <div class="experience-row experience-total-row" style="${gridStyle}">
          <strong>Lv.${escapeHtml(maxLevel)}まで</strong>
          ${columns.map(column => `<em data-exp-total="${escapeHtml(column.id)}">${experienceTotalForRange(column.id, 1, maxLevel).toLocaleString("ja-JP")}</em>`).join("")}
          ${editMode ? `<span class="experience-row-spacer"></span>` : ""}
        </div>
        ${editMode ? `
          <div class="experience-row experience-add-level-row" style="${gridStyle}">
            <button type="button" data-action="add-exp-row" aria-label="レベルを追加">＋</button>
            ${columns.map(() => `<span></span>`).join("")}
            <span></span>
          </div>
        ` : ""}
      </div>
    </section>
  `;
}

function renderExperienceColumnHead(column) {
  const label = experienceColumnLabel(column);
  const info = experienceColumnInfo(column);

  if (editMode && column.type === "personality") {
    return `
      <div class="experience-column-head" data-exp-column-id="${escapeHtml(column.id)}">
        <button type="button" class="experience-column-drag" data-exp-column-drag="${escapeHtml(column.id)}" draggable="true" aria-label="${escapeHtml(label)}を並び替え">≡</button>
        <select data-exp-column-personality="${escapeHtml(column.id)}" aria-label="個性を選択">
          <option value="">個性未設定</option>
          ${appData.personalities.map(personality => `
            <option value="${escapeHtml(personality.id)}" ${column.personalityId === personality.id ? "selected" : ""}>${escapeHtml(personality.name || "名前未設定")}</option>
          `).join("")}
        </select>
        <div class="info-popover personality-info-popover" role="dialog" aria-label="${escapeHtml(label)}の情報">
          <div class="compact-personality-panel">
            <h2>${escapeHtml(label)}</h2>
            <p>${escapeHtml(info)}</p>
          </div>
        </div>
      </div>
    `;
  }

  return `
    <div class="experience-column-head" data-exp-column-id="${escapeHtml(column.id)}" tabindex="0">
      ${editMode ? `<button type="button" class="experience-column-drag" data-exp-column-drag="${escapeHtml(column.id)}" draggable="true" aria-label="${escapeHtml(label)}を並び替え">≡</button>` : ""}
      <strong>${escapeHtml(label)}</strong>
      ${column.type === "personality" ? `
        <div class="info-popover personality-info-popover" role="dialog" aria-label="${escapeHtml(label)}の情報">
          <div class="compact-personality-panel">
            <h2>${escapeHtml(label)}</h2>
            <p>${escapeHtml(info)}</p>
          </div>
        </div>
      ` : ""}
    </div>
  `;
}

function renderExperienceCell(row, columnId) {
  if (!editMode) {
    return `<span>${escapeHtml(row.values?.[columnId] || "＿")}</span>`;
  }

  return `
    <input
      type="text"
      inputmode="numeric"
      data-exp-table-field="${escapeHtml(columnId)}"
      value="${escapeHtml(row.values?.[columnId] || "")}"
      placeholder="＿"
    >
  `;
}

function renderExperienceTotals() {
  const maxLevel = maxExperienceLevel();

  return `
    <section class="experience-total-panel">
      <span>レベル${escapeHtml(maxLevel)}までの合計</span>
      <div>
        ${appData.experienceColumns.map(column => `
          <div>
            <strong>${escapeHtml(experienceColumnLabel(column))}</strong>
            <em data-exp-total="${escapeHtml(column.id)}">${experienceTotalForRange(column.id, 1, maxLevel).toLocaleString("ja-JP")}</em>
          </div>
        `).join("")}
      </div>
    </section>
  `;
}

function updateExperienceInput(input) {
  const field = input.dataset.expInput;

  if (field === "livlyId") {
    expSelectedLivlyId = input.value;
    renderView();
    return;
  }

  if (field === "growthType") {
    expGrowthType = input.value;
  }

  if (field === "currentRebirth") {
    expCurrentRebirth = input.value;
  }

  if (field === "targetRebirth") {
    expTargetRebirth = input.value;
  }

  if (field === "maxRebirths") {
    appData.experienceMaxRebirths = cleanNumberLikeInput(input.value) || "0";
    input.value = appData.experienceMaxRebirths;
    updateExperienceSaveButtonState();
    renderView();
    return;
  }

  if (field === "currentLevel") {
    expCurrentLevel = cleanNumberLikeInput(input.value) || "";
    input.value = expCurrentLevel;
  }

  if (field === "targetLevel") {
    expTargetLevel = cleanNumberLikeInput(input.value) || "";
    input.value = expTargetLevel;
  }

  updateExperienceResult();
}

function updateExperienceResult() {
  const result = contentArea.querySelector("[data-exp-result]");

  if (result) {
    result.textContent = calculateExperienceRequired().toLocaleString("ja-JP");
  }

  contentArea.querySelectorAll("[data-exp-total]").forEach(total => {
    total.textContent = experienceTotalForRange(total.dataset.expTotal, 1, maxExperienceLevel()).toLocaleString("ja-JP");
  });
}

function updateExperienceTableField(input) {
  const rowElement = input.closest("[data-exp-row-id]");
  const row = rowElement ? appData.experienceTable.find(item => item.id === rowElement.dataset.expRowId) : null;

  if (!row || !input.dataset.expTableField) {
    return;
  }

  const value = cleanNumberLikeInput(input.value);
  input.value = value;
  row.values[input.dataset.expTableField] = value;
  updateExperienceResult();
  updateExperienceSaveButtonState();
}

function updateExperienceSaveButtonState() {
  const button = document.querySelector('[data-action="save-experience"]');

  if (button) {
    button.classList.toggle("is-dirty", hasUnsavedExperienceEdits());
  }
}

function addExperienceRow() {
  const maxLevel = sortedExperienceRows().reduce((max, row) => Math.max(max, Number(row.level) || 0), 0);

  appData.experienceTable.push({
    id: createId("experience"),
    level: String(maxLevel + 1),
    values: appData.experienceColumns.reduce((values, column) => {
      values[column.id] = "";
      return values;
    }, {})
  });
  renderView();
}

function deleteExperienceRow() {
  const rows = sortedExperienceRows();
  const row = rows[rows.length - 1];

  if (!row) {
    return false;
  }

  if (!confirm(`一番下のレベル${row.level || ""}を削除していいですか？`)) {
    return false;
  }

  appData.experienceTable = appData.experienceTable.filter(item => item.id !== row.id);
  renderView();
  return true;
}

function addExperienceColumn() {
  const usedPersonalityIds = new Set(appData.experienceColumns.map(column => column.personalityId).filter(Boolean));
  const personality = appData.personalities.find(item => !usedPersonalityIds.has(item.id));
  const column = {
    id: createId("experience-column"),
    type: "personality",
    label: personality ? personality.name : "個性",
    personalityId: personality ? personality.id : ""
  };

  appData.experienceColumns.push(column);
  appData.experienceTable.forEach(row => {
    row.values[column.id] = "";
  });
  expGrowthType = column.id;
  renderView();
}

function updateExperienceColumnPersonality(select) {
  const column = appData.experienceColumns.find(item => item.id === select.dataset.expColumnPersonality);

  if (!column) {
    return;
  }

  const personality = personalityById(select.value);
  column.personalityId = select.value;
  column.label = personality ? personality.name : "個性";
  updateExperienceSaveButtonState();
  renderView();
}

function moveExperienceColumn(sourceId, targetId) {
  if (!sourceId || !targetId || sourceId === targetId) {
    return;
  }

  const sourceIndex = appData.experienceColumns.findIndex(column => column.id === sourceId);
  const targetIndex = appData.experienceColumns.findIndex(column => column.id === targetId);

  if (sourceIndex < 0 || targetIndex < 0) {
    return;
  }

  const [column] = appData.experienceColumns.splice(sourceIndex, 1);
  appData.experienceColumns.splice(targetIndex, 0, column);
  renderView();
}

function clearExperienceDeletePressTimer() {
  clearTimeout(expDeletePressTimer);
  expDeletePressTimer = null;
  expDeletePressTarget = null;
}

function saveExperienceEdits() {
  appData = saveAppData(appData);
  commitExperienceEditSession();
  renderView();

  const button = document.querySelector('[data-action="save-experience"]');

  if (!button) {
    return;
  }

  button.textContent = "保存しました";
  button.classList.add("is-saved");

  setTimeout(() => {
    const currentButton = document.querySelector('[data-action="save-experience"]');

    if (currentButton) {
      currentButton.textContent = "編集内容を保存";
      currentButton.classList.remove("is-saved");
    }
  }, 1200);
}

function currentDdEditData() {
  return {
    ddCalculationTables: appData.ddCalculationTables,
    ddHouseRows: appData.ddHouseRows
  };
}

function beginDdEditSession() {
  if (activeRoute === "dd" && editMode && !ddEditBackup) {
    ddEditBackup = cloneData(currentDdEditData());
  }
}

function discardUnsavedDdEdits() {
  if (activeRoute !== "dd" || !ddEditBackup) {
    return;
  }

  appData.ddCalculationTables = cloneData(ddEditBackup.ddCalculationTables);
  appData.ddHouseRows = cloneData(ddEditBackup.ddHouseRows);
  ddEditBackup = null;
}

function commitDdEditSession() {
  if (activeRoute === "dd" && editMode) {
    ddEditBackup = cloneData(currentDdEditData());
  }
}

function hasUnsavedDdEdits() {
  return Boolean(
    activeRoute === "dd" &&
    editMode &&
    ddEditBackup &&
    !sameData(currentDdEditData(), ddEditBackup)
  );
}

const ddVariantOptions = [
  { value: "normal", label: "通常", hasPersonality: false, hasRebirthAbility: false },
  { value: "kaiben", label: "快便", hasPersonality: true, hasRebirthAbility: false },
  { value: "benpi", label: "便秘", hasPersonality: true, hasRebirthAbility: false }
];

function ddVariantByValue(value) {
  return ddVariantOptions.find(option => option.value === value) || ddVariantOptions[0];
}

function ddVariantFromBooleans(hasPersonality, hasRebirthAbility) {
  return hasPersonality ? "kaiben" : "normal";
}

function ddRowVariant(row) {
  return row.variant === "rebirthKaiben" ? "kaiben" : row.variant || ddVariantFromBooleans(row.hasPersonality, row.hasRebirthAbility);
}

function ddRowRebirth(row) {
  return cleanNumberLikeInput(row.rebirth) || (row.hasRebirthAbility || row.variant === "rebirthKaiben" ? "1" : "0");
}

function sortedDdKeys(table) {
  const keys = Array.from(new Set((table?.rows || []).map(row => {
    const level = cleanNumberLikeInput(row.level);

    if (!level) {
      return "";
    }

    return `${level}|${ddRowRebirth(row)}`;
  }).filter(Boolean)));

  return keys.sort((left, right) => {
    const [leftLevel, leftRebirth] = left.split("|").map(value => Number(value) || 0);
    const [rightLevel, rightRebirth] = right.split("|").map(value => Number(value) || 0);
    return leftLevel - rightLevel || leftRebirth - rightRebirth;
  });
}

function nextDdLevel(table) {
  const maxLevel = sortedDdKeys(table).reduce((max, key) => Math.max(max, Number(key.split("|")[0]) || 0), 0);
  return String(maxLevel + 1 || 1);
}

function ddRateRowForVariant(table, level, rebirth, variantValue, shouldCreate = false) {
  const normalizedLevel = cleanNumberLikeInput(level) || "1";
  const normalizedRebirth = cleanNumberLikeInput(rebirth) || "0";
  let row = table.rows.find(item =>
    String(Number(item.level) || 0) === String(Number(normalizedLevel) || 0) &&
    String(Number(ddRowRebirth(item)) || 0) === String(Number(normalizedRebirth) || 0) &&
    ddRowVariant(item) === variantValue
  );

  if (!row && shouldCreate) {
    const variant = ddVariantByValue(variantValue);
    row = {
      id: createId("dd-rate"),
      level: normalizedLevel,
      rebirth: normalizedRebirth,
      variant: variant.value,
      hasPersonality: variant.hasPersonality,
      hasRebirthAbility: Number(normalizedRebirth) > 0,
      amount: ""
    };
    table.rows.push(row);
  }

  return row;
}

function ddTableForLivly(livlyId, shouldCreate = false) {
  let table = appData.ddCalculationTables.find(item => item.livlyId === livlyId);

  if (!table && shouldCreate) {
    table = { id: createId("dd-table"), livlyId, rows: [] };
    appData.ddCalculationTables.push(table);
  }

  return table;
}

function ddRateForHouseRow(row) {
  const table = ddTableForLivly(row.livlyId);

  if (!table) {
    return 0;
  }

  const variant = ddRowVariant(row);
  const rebirth = ddRowRebirth(row);
  const matchedRow = table.rows.find(rateRow =>
    String(Number(rateRow.level) || 0) === String(Number(row.level) || 0) &&
    String(Number(ddRowRebirth(rateRow)) || 0) === String(Number(rebirth) || 0) &&
    ddRowVariant(rateRow) === variant
  );

  return matchedRow ? Number(cleanNumberLikeInput(matchedRow.amount)) || 0 : 0;
}

function calculateDdHourly() {
  return appData.ddHouseRows.reduce((total, row) => total + ddRateForHouseRow(row), 0);
}

function renderDdCalculatorView() {
  const hourly = calculateDdHourly();
  const saveButton = editMode
    ? `
      <button type="button" class="personality-save-button ${hasUnsavedDdEdits() ? "is-dirty" : ""}" data-action="save-dd">
        編集内容を保存
      </button>
    `
    : "";

  return `
    ${saveButton}
    <section class="dd-page">
      <section class="probability-result probability-result-card" aria-live="polite" tabindex="0">
        <span>dd排出量/h</span>
        <strong data-dd-result>${hourly.toLocaleString("ja-JP")}</strong>
        <div class="info-popover probability-result-popover" role="dialog" aria-label="dd排出量/day">
          <p data-dd-day-result>${(hourly * 24).toLocaleString("ja-JP")} dd/day</p>
        </div>
      </section>

      <section class="dd-house-panel">
        <div class="dd-panel-heading">
          <span>ハウスのリブリー</span>
          <button type="button" data-action="add-dd-house-row">＋</button>
        </div>
        <div class="dd-house-list">
          ${appData.ddHouseRows.map(row => renderDdHouseRow(row)).join("")}
        </div>
      </section>

      ${editMode ? renderDdTableEditor() : ""}
    </section>
  `;
}

function renderDdHouseRow(row) {
  const selectedLivly = appData.livlies.find(livly => livly.id === row.livlyId);
  const title = selectedLivly ? livlyTitle(selectedLivly) : "未選択";
  const variant = ddRowVariant(row);
  const rebirth = ddRowRebirth(row);

  return `
    <div class="dd-house-row" data-dd-house-id="${escapeHtml(row.id)}">
      <label class="dd-house-livly-picker">
        <span>リブリー</span>
        <div class="experience-livly-select">
          <div class="experience-livly-preview">${selectedLivly ? renderLivlyImage(selectedLivly, title) : "?"}</div>
          <select data-dd-house-field="livlyId">
            <option value="">未選択</option>
            ${appData.livlies.map((livly, index) => `
              <option value="${escapeHtml(livly.id)}" ${row.livlyId === livly.id ? "selected" : ""}>${escapeHtml(livlyTitle(livly, index))}</option>
            `).join("")}
          </select>
        </div>
      </label>
      <label>
        <span>レベル</span>
        <input type="text" inputmode="numeric" data-dd-house-field="level" value="${escapeHtml(row.level)}">
      </label>
      <label>
        <span>個性</span>
        <select data-dd-house-field="variant">
          ${ddVariantOptions.map(option => `
            <option value="${escapeHtml(option.value)}" ${variant === option.value ? "selected" : ""}>${escapeHtml(option.label)}</option>
          `).join("")}
        </select>
      </label>
      <label>
        <span>転生</span>
        <select data-dd-house-field="rebirth">
          ${rebirthOptions().map(value => `
            <option value="${value}" ${rebirth === value ? "selected" : ""}>${value}回</option>
          `).join("")}
        </select>
      </label>
      <strong>${ddRateForHouseRow(row).toLocaleString("ja-JP")} dd/h</strong>
      <button type="button" class="personality-delete-button" data-action="delete-dd-house-row" aria-label="削除">🗑</button>
    </div>
  `;
}

function renderDdTableEditor() {
  return `
    <section class="dd-table-editor">
      <div class="dd-panel-heading">
        <span>リブリー毎のdd表</span>
      </div>
      ${appData.livlies.length
        ? appData.livlies.map((livly, index) => renderDdTableCard(livly, index)).join("")
        : `<section class="card list-empty"><p>リブリーを追加すると表を編集できます。</p></section>`
      }
    </section>
  `;
}

function renderDdTableCard(livly, index) {
  const table = ddTableForLivly(livly.id, true);
  const keys = sortedDdKeys(table);

  return `
    <article class="dd-table-card" data-dd-table-livly-id="${escapeHtml(livly.id)}">
      <div class="dd-panel-heading">
        <span>${escapeHtml(livlyTitle(livly, index))}</span>
        <div class="dd-table-actions">
          <select data-dd-copy-source>
            <option value="">他のdd表を参照</option>
            ${appData.livlies
              .filter(sourceLivly => sourceLivly.id !== livly.id)
              .map((sourceLivly, sourceIndex) => `<option value="${escapeHtml(sourceLivly.id)}">${escapeHtml(livlyTitle(sourceLivly, sourceIndex))}</option>`)
              .join("")}
          </select>
          <button type="button" data-action="copy-dd-table">コピー</button>
        </div>
      </div>
      <div class="dd-rate-table">
        <div class="dd-rate-row dd-rate-head">
          <span>レベル</span>
          <span>転生</span>
          ${ddVariantOptions.map(option => `<span>${escapeHtml(option.label)}</span>`).join("")}
        </div>
        ${keys.length ? keys.map(key => renderDdRateRow(table, key)).join("") : `<p class="dd-empty-row">まだ表がありません。</p>`}
        <div class="dd-rate-row dd-rate-add-row">
          <button type="button" data-action="add-dd-rate-row" aria-label="レベルを追加">＋</button>
          <span></span>
          ${ddVariantOptions.map(() => `<span></span>`).join("")}
        </div>
      </div>
    </article>
  `;
}

function renderDdRateRow(table, key) {
  const [level, rebirth] = key.split("|");

  return `
    <div class="dd-rate-row" data-dd-rate-level="${escapeHtml(level)}" data-dd-rate-rebirth="${escapeHtml(rebirth)}">
      <strong>レベル${escapeHtml(level)}</strong>
      <select data-dd-rate-field="rebirth" data-dd-rate-level="${escapeHtml(level)}" data-dd-rate-rebirth="${escapeHtml(rebirth)}">
        ${rebirthOptions().map(value => `
          <option value="${value}" ${rebirth === value ? "selected" : ""}>${value}回</option>
        `).join("")}
      </select>
      ${ddVariantOptions.map(option => {
        const row = ddRateRowForVariant(table, level, rebirth, option.value);
        return `
          <label class="dd-rate-cell">
            <span class="dd-rate-label">${escapeHtml(option.label)}</span>
            <input
              type="text"
              inputmode="numeric"
              data-dd-rate-field="amount"
              data-dd-rate-level="${escapeHtml(level)}"
              data-dd-rate-rebirth="${escapeHtml(rebirth)}"
              data-dd-rate-variant="${escapeHtml(option.value)}"
              value="${escapeHtml(row?.amount || "")}"
              placeholder="＿"
            >
            <span class="dd-rate-unit">dd/h</span>
          </label>
        `;
      }).join("")}
    </div>
  `;
}

function updateDdResult() {
  const hourly = calculateDdHourly();
  const result = contentArea.querySelector("[data-dd-result]");
  const dayResult = contentArea.querySelector("[data-dd-day-result]");

  if (result) {
    result.textContent = hourly.toLocaleString("ja-JP");
  }

  if (dayResult) {
    dayResult.textContent = `${(hourly * 24).toLocaleString("ja-JP")} dd/day`;
  }

  contentArea.querySelectorAll(".dd-house-row").forEach(rowElement => {
    const row = appData.ddHouseRows.find(item => item.id === rowElement.dataset.ddHouseId);
    const resultText = rowElement.querySelector("strong");

    if (row && resultText) {
      resultText.textContent = `${ddRateForHouseRow(row).toLocaleString("ja-JP")} dd/h`;
    }
  });
}

function updateDdSaveButtonState() {
  const button = document.querySelector('[data-action="save-dd"]');

  if (button) {
    button.classList.toggle("is-dirty", hasUnsavedDdEdits());
  }
}

function addDdHouseRow() {
  appData.ddHouseRows.push({
    id: createId("dd-house"),
    livlyId: "",
    level: "1",
    rebirth: "0",
    variant: "normal",
    hasPersonality: false,
    hasRebirthAbility: false
  });
  renderView();
}

function deleteDdHouseRow(button) {
  const rowElement = button.closest("[data-dd-house-id]");

  if (!rowElement) {
    return;
  }

  appData.ddHouseRows = appData.ddHouseRows.filter(row => row.id !== rowElement.dataset.ddHouseId);

  if (!appData.ddHouseRows.length) {
    addDdHouseRow();
    return;
  }

  renderView();
}

function updateDdHouseField(input) {
  const rowElement = input.closest("[data-dd-house-id]");
  const row = rowElement ? appData.ddHouseRows.find(item => item.id === rowElement.dataset.ddHouseId) : null;

  if (!row || !input.dataset.ddHouseField) {
    return;
  }

  const field = input.dataset.ddHouseField;

  if (input.type === "checkbox") {
    row[field] = input.checked;
  } else if (field === "level") {
    row[field] = cleanNumberLikeInput(input.value) || "";
    input.value = row[field];
  } else if (field === "rebirth") {
    row.rebirth = cleanNumberLikeInput(input.value) || "0";
    row.hasRebirthAbility = Number(row.rebirth) > 0;
  } else if (field === "variant") {
    const variant = ddVariantByValue(input.value);
    row.variant = variant.value;
    row.hasPersonality = variant.hasPersonality;
  } else {
    row[field] = input.value;
  }

  updateDdResult();
  updateDdSaveButtonState();

  if (field === "livlyId") {
    renderView();
  }
}

function addDdRateRow(button) {
  const card = button.closest("[data-dd-table-livly-id]");
  const table = card ? ddTableForLivly(card.dataset.ddTableLivlyId, true) : null;

  if (!table) {
    return;
  }

  const level = nextDdLevel(table);
  ddVariantOptions.forEach(option => {
    ddRateRowForVariant(table, level, "0", option.value, true);
  });
  renderView();
}

function deleteDdRateRow(button) {
  const card = button.closest("[data-dd-table-livly-id]");
  const rowElement = button.closest("[data-dd-rate-id]");
  const table = card ? ddTableForLivly(card.dataset.ddTableLivlyId) : null;

  if (!table || !rowElement) {
    return;
  }

  if (!confirm("このdd表の行を削除していいですか？")) {
    return;
  }

  table.rows = table.rows.filter(row => row.id !== rowElement.dataset.ddRateId);
  renderView();
}

function updateDdRateField(input) {
  const card = input.closest("[data-dd-table-livly-id]");
  const table = card ? ddTableForLivly(card.dataset.ddTableLivlyId) : null;
  const field = input.dataset.ddRateField;

  if (table && field === "rebirth") {
    const level = input.dataset.ddRateLevel;
    const oldRebirth = input.dataset.ddRateRebirth;
    const nextRebirth = cleanNumberLikeInput(input.value) || "0";

    table.rows.forEach(row => {
      if (
        String(Number(row.level) || 0) === String(Number(level) || 0) &&
        String(Number(ddRowRebirth(row)) || 0) === String(Number(oldRebirth) || 0)
      ) {
        row.rebirth = nextRebirth;
        row.hasRebirthAbility = Number(nextRebirth) > 0;
      }
    });
    updateDdResult();
    updateDdSaveButtonState();
    renderView();
    return;
  }

  const row = table && input.dataset.ddRateLevel && input.dataset.ddRateVariant
    ? ddRateRowForVariant(table, input.dataset.ddRateLevel, input.dataset.ddRateRebirth || "0", input.dataset.ddRateVariant, true)
    : null;

  if (!row || !field) {
    return;
  }

  row[field] = cleanNumberLikeInput(input.value) || "";
  input.value = row[field];

  updateDdResult();
  updateDdSaveButtonState();
}

function copyDdTable(button) {
  const card = button.closest("[data-dd-table-livly-id]");
  const sourceSelect = card ? card.querySelector("[data-dd-copy-source]") : null;
  const sourceTable = sourceSelect?.value ? ddTableForLivly(sourceSelect.value) : null;
  const targetTable = card ? ddTableForLivly(card.dataset.ddTableLivlyId, true) : null;

  if (!sourceTable || !targetTable) {
    return;
  }

  targetTable.rows = cloneData(sourceTable.rows).map(row => ({
    ...row,
    id: createId("dd-rate")
  }));
  updateDdSaveButtonState();
  renderView();
}

function saveDdEdits() {
  appData = saveAppData(appData);
  commitDdEditSession();
  renderView();

  const button = document.querySelector('[data-action="save-dd"]');

  if (!button) {
    return;
  }

  button.textContent = "保存しました";
  button.classList.add("is-saved");

  setTimeout(() => {
    const currentButton = document.querySelector('[data-action="save-dd"]');

    if (currentButton) {
      currentButton.textContent = "編集内容を保存";
      currentButton.classList.remove("is-saved");
    }
  }, 1200);
}

function canUseCursorPanel(event) {
  const pointerType = event && "pointerType" in event ? event.pointerType : "";
  return !pointerType || pointerType === "mouse";
}

function isFinePointerDevice() {
  return true;
}

function positionInfoPanel(event, panel) {
  const gap = 14;
  const margin = 12;
  const host = findInfoPanelHost(panel);

  closeOtherInfoPanels(host);
  panel.classList.add("is-cursor-panel");
  panel.style.left = "0px";
  panel.style.top = "0px";
  panel.style.right = "auto";
  panel.style.bottom = "auto";
  panel.style.transform = "none";

  const panelRect = panel.getBoundingClientRect();
  let left = event.clientX - panelRect.width - gap;
  let top = event.clientY - panelRect.height - gap;

  if (left < margin) {
    left = event.clientX + gap;
  }

  if (top < margin) {
    top = event.clientY + gap;
  }

  if (left + panelRect.width > window.innerWidth - margin) {
    left = window.innerWidth - panelRect.width - margin;
  }

  if (top + panelRect.height > window.innerHeight - margin) {
    top = window.innerHeight - panelRect.height - margin;
  }

  const desiredLeft = Math.max(margin, left);
  const desiredTop = Math.max(margin, top);

  panel.style.left = `${desiredLeft}px`;
  panel.style.top = `${desiredTop}px`;

  const placedRect = panel.getBoundingClientRect();
  const correctionX = desiredLeft - placedRect.left;
  const correctionY = desiredTop - placedRect.top;

  if (Math.abs(correctionX) > 0.5 || Math.abs(correctionY) > 0.5) {
    panel.style.left = `${desiredLeft + correctionX}px`;
    panel.style.top = `${desiredTop + correctionY}px`;
  }
}

function livlyPanelAnchorFromEvent(event, fallbackElement = null) {
  if (event && Number.isFinite(event.clientX) && Number.isFinite(event.clientY)) {
    return {
      x: event.clientX,
      y: event.clientY + 12
    };
  }

  if (fallbackElement) {
    const rect = fallbackElement.getBoundingClientRect();
    return {
      x: rect.left + rect.width / 2,
      y: rect.bottom + 12
    };
  }

  return {
    x: Math.min(window.innerWidth - 16, Math.max(16, window.innerWidth / 2)),
    y: 96
  };
}

function clampFloatingLivlyPanelPosition(panel, left, top) {
  const margin = 10;
  const rect = panel.getBoundingClientRect();
  const maxLeft = Math.max(margin, window.innerWidth - rect.width - margin);
  const maxTop = Math.max(margin, window.innerHeight - rect.height - margin);

  return {
    left: Math.min(Math.max(margin, left), maxLeft),
    top: Math.min(Math.max(margin, top), maxTop)
  };
}

function setFloatingLivlyPanelPosition(panel, left, top) {
  const position = clampFloatingLivlyPanelPosition(panel, left, top);

  panel.style.left = `${Math.round(position.left)}px`;
  panel.style.top = `${Math.round(position.top)}px`;

  if (livlyEditPanel) {
    livlyEditPanel.x = position.left;
    livlyEditPanel.y = position.top;
  }
}

function placeFloatingLivlyEditPanel() {
  const panel = contentArea.querySelector("[data-floating-livly-panel]");

  if (!panel || !livlyEditPanel) {
    return;
  }

  const gap = 10;
  const margin = 10;
  const anchorX = Number.isFinite(livlyEditPanel.x) ? livlyEditPanel.x : window.innerWidth / 2;
  const anchorY = Number.isFinite(livlyEditPanel.y) ? livlyEditPanel.y : 96;
  const rect = panel.getBoundingClientRect();
  let left = anchorX;
  let top = anchorY;

  if (left + rect.width > window.innerWidth - margin) {
    left = window.innerWidth - rect.width - margin;
  }

  if (top + rect.height > window.innerHeight - margin) {
    top = anchorY - rect.height - gap;
  }

  if (top < margin) {
    top = margin;
  }

  if (left < margin) {
    left = margin;
  }

  setFloatingLivlyPanelPosition(panel, left, top);
}

function scheduleFloatingLivlyEditPanel() {
  if (!livlyEditPanel) {
    return;
  }

  requestAnimationFrame(placeFloatingLivlyEditPanel);
}

function startFloatingLivlyPanelDrag(event) {
  const handle = event.target.closest("[data-livly-panel-drag-handle]");

  if (
    !handle ||
    !editMode ||
    activeRoute !== "livlies" ||
    event.button !== 0 ||
    event.target.closest("button, input, select, textarea")
  ) {
    return;
  }

  const panel = handle.closest("[data-floating-livly-panel]");

  if (!panel) {
    return;
  }

  const rect = panel.getBoundingClientRect();
  livlyPanelDragState = {
    pointerId: event.pointerId,
    offsetX: event.clientX - rect.left,
    offsetY: event.clientY - rect.top,
    handle
  };

  panel.classList.add("is-dragging");
  handle.setPointerCapture?.(event.pointerId);
  event.preventDefault();
  event.stopImmediatePropagation();
}

function moveFloatingLivlyPanelDrag(event) {
  if (!livlyPanelDragState || event.pointerId !== livlyPanelDragState.pointerId) {
    return;
  }

  const panel = contentArea.querySelector("[data-floating-livly-panel]");

  if (!panel) {
    finishFloatingLivlyPanelDrag(event);
    return;
  }

  setFloatingLivlyPanelPosition(
    panel,
    event.clientX - livlyPanelDragState.offsetX,
    event.clientY - livlyPanelDragState.offsetY
  );
  event.preventDefault();
  event.stopImmediatePropagation();
}

function finishFloatingLivlyPanelDrag(event) {
  if (!livlyPanelDragState || event.pointerId !== livlyPanelDragState.pointerId) {
    return;
  }

  const panel = contentArea.querySelector("[data-floating-livly-panel]");

  panel?.classList.remove("is-dragging");
  livlyPanelDragState.handle?.releasePointerCapture?.(event.pointerId);
  livlyPanelDragState = null;
  event.preventDefault();
  event.stopImmediatePropagation();
}

function resetInfoPanelPosition(panel) {
  panel.classList.remove("is-cursor-panel");
  panel.style.left = "";
  panel.style.top = "";
  panel.style.right = "";
  panel.style.bottom = "";
  panel.style.transform = "";
}

function resetAllInfoPanelPositions() {
  document.querySelectorAll(".info-popover.is-cursor-panel").forEach(resetInfoPanelPosition);
}

function findInfoPanelHost(target) {
  const host = target.closest(".livly-display-field, .list-item, .material-name-info-host, .probability-choice-card, .probability-result-card, .experience-column-head, .bulk-file-picker");
  return host && host.querySelector(".info-popover") ? host : null;
}

function clearActiveInfoHost() {
  document.body.classList.remove("has-active-info");
  document.querySelectorAll(".is-info-active").forEach(item => {
    item.classList.remove("is-info-active");
  });
  activeInfoHost = null;
}

function setActiveInfoHost(host) {
  if (!host) {
    clearActiveInfoHost();
    return;
  }

  document.querySelectorAll(".is-info-active").forEach(item => {
    if (item !== host) {
      item.classList.remove("is-info-active", "is-open");
    }
  });
  document.body.classList.add("has-active-info");
  host.classList.add("is-info-active");
  activeInfoHost = host;
}

function closeOtherInfoPanels(host) {
  document.querySelectorAll(".list-item.is-open, .livly-display-field.is-open, .material-name-info-host.is-open, .probability-choice-card.is-open, .probability-result-card.is-open, .experience-column-head.is-open, .bulk-file-picker.is-open").forEach(item => {
    if (item !== host) {
      item.classList.remove("is-open");
    }
  });

  document.querySelectorAll(".info-popover.is-cursor-panel").forEach(panel => {
    if (!host || !host.contains(panel)) {
      resetInfoPanelPosition(panel);
    }
  });

  setActiveInfoHost(host);
}

function restoreCursorInfoPanelAfterRender(event) {
  if (!event || editMode || !canUseCursorPanel(event) || !Number.isFinite(event.clientX) || !Number.isFinite(event.clientY)) {
    return;
  }

  const cursorEvent = {
    clientX: event.clientX,
    clientY: event.clientY,
    pointerType: event.pointerType || "mouse",
    target: null
  };

  requestAnimationFrame(() => {
    const target = document.elementFromPoint(cursorEvent.clientX, cursorEvent.clientY);
    const host = target ? findInfoPanelHost(target) : null;
    const panel = host ? host.querySelector(".info-popover") : null;

    if (!panel) {
      closeTouchInfo();
      return;
    }

    cursorEvent.target = target;
    positionInfoPanel(cursorEvent, panel);
  });
}

function showCursorInfoPanel(event) {
  const canShowBulkUploadInfo = editMode && Boolean(event.target.closest(".bulk-file-picker"));

  if ((editMode && !canShowBulkUploadInfo) || !canUseCursorPanel(event)) {
    if (editMode && activeInfoHost?.classList.contains("bulk-file-picker")) {
      closeTouchInfo();
    }
    return;
  }

  const unwantedHost = activeRoute === "personalityProbability" && event.buttons === 0
    ? event.target.closest(".probability-unwanted-card")
    : null;

  if (unwantedHost && !event.target.closest(".info-popover")) {
    const panel = unwantedHost.querySelector(".info-popover");

    if (!panel) {
      return;
    }

    stopProbabilityAutoScroll(probabilityDragState);
    removeProbabilityDragGhost(probabilityDragState);
    probabilityDragState?.button?.classList.remove("is-dragging");
    probabilityDragState?.button?.releasePointerCapture?.(probabilityDragState.pointerId);
    probabilityDragState = null;
    probabilityNativeDragId = "";
    probabilityNativeDragSource = "";
    probabilityNativeDropInsideUnwanted = false;
    setInfoPanelDragSuppressed(false);
    document.body.classList.remove("is-probability-pressing", "is-probability-dragging");
    clearProbabilityDragVisualState();
    document.body.classList.add("is-mouse-input");
    positionInfoPanel(event, panel);
    return;
  }

  if (activeRoute === "personalityProbability" && !probabilityDragState && !probabilityNativeDragId) {
    document.body.classList.remove("is-probability-pressing", "is-probability-dragging");
    clearProbabilityDragVisualState();
  }

  if (document.body.classList.contains("is-info-drag-suppressed") && !isDraggingForInfoPanel()) {
    document.body.classList.remove("is-info-drag-suppressed");
  }

  if (isDraggingForInfoPanel()) {
    closeTouchInfo();
    return;
  }

  document.body.classList.add("is-mouse-input");

  const item = findInfoPanelHost(event.target);
  const panel = item ? item.querySelector(".info-popover") : null;

  if (!panel || event.target.closest(".info-popover") || event.target.closest(".personality-edit-controls")) {
    return;
  }

  positionInfoPanel(event, panel);
}

function renderListItem(item, index) {
  const title = itemTitle(item, index);
  const image = activeRoute === "livlies" && item.imageUrl
    ? `<img src="${escapeHtml(item.imageUrl)}" alt="${escapeHtml(title)}" draggable="false">`
    : `<span>${escapeHtml(title.charAt(0) || "?")}</span>`;

  return `
    <article class="list-item" data-id="${escapeHtml(item.id)}" tabindex="0">
      <div class="list-item-image">${image}</div>
      <strong>${escapeHtml(title)}</strong>
      <div class="info-popover" role="dialog" aria-label="${escapeHtml(title)}の情報">
        ${renderInfo(item)}
        <button type="button" class="info-edit-button" data-action="edit" aria-label="編集する">＋</button>
      </div>
    </article>
  `;
}

function renderInfo(item) {
  if (activeRoute === "livlies") {
    return renderLivlyInfo(item);
  }

  if (activeRoute === "personalities") {
    return renderPersonalityCompactInfo(item);
  }

  return `
    <div class="record-panel">
      <div class="record-tab">Bio Record</div>
      <h2>${escapeHtml(item.name || "名前未設定")}</h2>
      <section class="record-section">
        <h3>内容</h3>
        <p>${escapeHtml(item.content || "内容未設定")}</p>
      </section>
      <section class="record-section">
        <h3>入手方法</h3>
        <div class="record-value">${escapeHtml(item.acquisitionMethod || "未設定")}</div>
      </section>
      <dl class="record-grid">
        <div>
          <dt>購入価格</dt>
          <dd>${escapeHtml(item.purchasePrice || "未設定")}</dd>
        </div>
        <div>
          <dt>取引価格</dt>
          <dd>${escapeHtml(item.tradePrice || "未設定")}</dd>
        </div>
        <div>
          <dt>商人取引価格</dt>
          <dd>${escapeHtml(item.merchantTradePrice || "未設定")}</dd>
        </div>
      </dl>
    </div>
  `;
}

function renderPersonalityCompactInfo(item) {
  return `
    <div class="compact-personality-panel">
      <h2>${escapeHtml(item.name || "名前未設定")}</h2>
      <p>${escapeHtml(item.content || "内容未設定")}</p>
      <strong>確率 ${escapeHtml(item.modificationRate || "未設定")}</strong>
    </div>
  `;
}

function renderLivlyInfo(item) {
  const image = item.imageUrl
    ? `<img class="info-image" src="${escapeHtml(item.imageUrl)}" alt="${escapeHtml(item.name || "リブリー")}" draggable="false">`
    : `<span>${escapeHtml((item.name || "リ").charAt(0))}</span>`;
  const hpLevel = sortedLivlyLevelRows(item.hpLevels)[0] || { level: "1", value: "" };
  const hpValue = numberText(hpLevel.value, "-");
  const facilityLabels = {
    none: "なし",
    available: "あり",
    great: "超あり"
  };
  const summaryItems = [
    ["種類", blankText(item.species)],
    ["HP", `Lv.${blankText(hpLevel.level, "1")} ${hpValue}`],
    ["満腹量", numberText(item.fullness)],
    ["施設適性", facilityLabels[item.facilitySuitability] || "未設定"],
    ["移動タイプ", item.movementTypes.length ? item.movementTypes.join(" / ") : "未設定"],
    ["移動力", item.movementPowers.length ? item.movementPowers.join(" / ") : "未設定"],
    ["/waza", blankText(item.waza)],
    ["得意なこと", blankText(item.favorite)]
  ];

  return `
    <div class="bio-panel">
      <div class="bio-hero">
        <div class="bio-image">${image}</div>
        <div class="bio-title">
          <h2>${escapeHtml(item.name || "名前未設定")}</h2>
          <p>Bio Record</p>
          <div class="bio-meter-grid">
            <div>
              <span>Lv.</span>
              <strong>${escapeHtml(hpLevel.level || "1")}</strong>
              <i></i>
            </div>
            <div>
              <span>HP</span>
              <strong>${escapeHtml(hpValue)}</strong>
              <i></i>
            </div>
          </div>
        </div>
      </div>

      <div class="bio-tab-row">
        <span>Bio Record</span>
        <span>履歴</span>
      </div>

      <section class="record-section">
        <h3>基本情報</h3>
        <dl class="record-grid">
          ${summaryItems.map(([label, value]) => `
            <div>
              <dt>${escapeHtml(label)}</dt>
              <dd>${escapeHtml(value)}</dd>
            </div>
          `).join("")}
        </dl>
      </section>

      <section class="record-section">
        <h3>レベル変化</h3>
        <dl class="record-grid">
          ${renderLivlyLevelInfo("HP", item.hpLevels)}
          ${renderLivlyDdInfo(item.ddEmissions)}
          ${renderLivlyLevelInfo("手札枚数", item.handLevels)}
          ${renderLivlyLevelInfo("攻撃力", item.attackLevels)}
        </dl>
      </section>
    </div>
  `;
}

function renderLivlyLevelInfo(label, rows, options = {}) {
  return sortedLivlyLevelRows(rows).map(row => {
    const levelText = `<span class="livly-info-level">Lv.${escapeHtml(row.level || "-")}</span>`;

    return `
    <div>
      <dt>${options.hideLabel ? levelText : `${escapeHtml(label)} ${levelText}`}</dt>
      <dd class="livly-info-value">${escapeHtml(numberText(row.value))}</dd>
    </div>
  `;
  }).join("");
}

function renderLivlyDdInfo(rows, options = {}) {
  return sortedLivlyLevelRows(rows).map(row => {
    const levelText = `<span class="livly-info-level">Lv.${escapeHtml(row.level || "-")}</span>`;

    return `
    <div>
      <dt>${options.hideLabel ? levelText : `dd排出量 ${levelText}`}</dt>
      <dd class="livly-info-value">${escapeHtml(ddMarkText(row))}</dd>
    </div>
  `;
  }).join("");
}

function editableCopyItems(route = activeRoute) {
  if (route === "livlies") {
    return appData.livlies;
  }

  if (route === "materials") {
    return appData.materials;
  }

  return [];
}

function editCopyCardSelector(route = activeRoute) {
  return route === "livlies" ? ".livly-detail-card[data-id]" : ".material-detail-card[data-id]";
}

function findEditCopyTarget(target) {
  if (!editMode || !["livlies", "materials"].includes(activeRoute)) {
    return null;
  }

  if (target.closest(".edit-copy-toolbar, .edit-action-panel, .edit-copy-card-selector")) {
    return null;
  }

  const card = target.closest(editCopyCardSelector(activeRoute));
  const item = card ? editableCopyItems(activeRoute).find(candidate => candidate.id === card.dataset.id) : null;

  if (!card || !item) {
    return null;
  }

  const fieldHost = target.closest("[data-edit-copy-field]");
  const fallbackField = activeRoute === "livlies"
    ? target.closest("[data-livly-field]")?.dataset.livlyField
    : target.closest("[data-material-field]")?.dataset.materialField;
  const field = fieldHost?.dataset.editCopyField || fallbackField;

  if (!field || field === "descriptions") {
    return null;
  }

  return {
    route: activeRoute,
    field,
    item,
    card,
    label: editCopyLabel(activeRoute, field)
  };
}

function copyValueForEditField(route, item, field) {
  if (route === "materials") {
    if (field === "tags") {
      return cloneData(itemMaterialTags(item));
    }

    if (field === "seriesTags") {
      return cloneData(itemMaterialSeriesTags(item));
    }
  }

  return item[field] == null ? "" : cloneData(item[field]);
}

function formValueForEditCopyTarget(targetInfo) {
  const { route, field, card } = targetInfo || {};

  if (!card || !field) {
    return undefined;
  }

  if (route === "materials") {
    if (field === "tags") {
      const tagInput = card.querySelector("[data-material-tag]");

      return tagInput?.value ? [tagInput.value] : [];
    }

    if (field === "seriesTags") {
      const seriesInput = card.querySelector("[data-material-series-tag]");

      return seriesInput?.value ? [seriesInput.value] : [];
    }

    const input = card.querySelector(`[data-material-field="${CSS.escape(field)}"]`);

    return input && "value" in input ? input.value : undefined;
  }

  if (route === "livlies") {
    const simpleFields = ["species", "feature", "fullness", "facilitySuitability", "waza", "favorite"];

    if (simpleFields.includes(field)) {
      const input = card.querySelector(`[data-livly-field="${CSS.escape(field)}"]`);

      return input && "value" in input ? input.value : undefined;
    }
  }

  return undefined;
}

function copyValueForEditTarget(targetInfo) {
  const formValue = formValueForEditCopyTarget(targetInfo);

  if (formValue !== undefined) {
    return cloneData(formValue);
  }

  return copyValueForEditField(targetInfo.route, targetInfo.item, targetInfo.field);
}

function clonedPasteValue(route, field, value) {
  if (route === "livlies") {
    const levelPrefixes = {
      hpLevels: "hp",
      handLevels: "hand",
      attackLevels: "attack"
    };

    if (levelPrefixes[field] && Array.isArray(value)) {
      return value.map(row => ({
        ...row,
        id: createId(levelPrefixes[field])
      }));
    }

    if (field === "ddEmissions" && Array.isArray(value)) {
      return value.map(row => ({
        ...row,
        id: createId("dd-emission")
      }));
    }

    if (["movementTypes", "movementPowers"].includes(field)) {
      return Array.isArray(value) ? [...value] : [];
    }
  }

  if (Array.isArray(value)) {
    return [...value];
  }

  if (value && typeof value === "object") {
    return cloneData(value);
  }

  return value == null ? "" : String(value);
}

function applyEditCopyValue(route, item, field, value) {
  const nextValue = clonedPasteValue(route, field, value);

  if (route === "materials") {
    if (field === "tags") {
      item.tags = cleanMaterialTags(nextValue);

      if (!materialAllowsSeries(item.tags)) {
        item.seriesTags = [];
      }

      return;
    }

    if (field === "seriesTags") {
      item.seriesTags = materialAllowsSeries(item.tags)
        ? cleanMaterialSeriesTags(nextValue, true)
        : [];
      return;
    }
  }

  item[field] = nextValue;

  if (route === "livlies" && livlyLevelRowFields.has(field)) {
    sortLivlyLevelRowsInPlace(item[field]);
  }
}

function editCopyMenuPosition(event) {
  const fallback = {
    clientX: window.innerWidth / 2,
    clientY: window.innerHeight / 2
  };
  const x = Number.isFinite(event?.clientX) ? event.clientX : fallback.clientX;
  const y = Number.isFinite(event?.clientY) ? event.clientY : fallback.clientY;

  return {
    x: Math.max(8, Math.min(x, window.innerWidth - 172)),
    y: Math.max(8, Math.min(y, window.innerHeight - 92))
  };
}

function closeEditActionPanel() {
  document.querySelector(".edit-action-panel")?.remove();
}

function openEditActionPanel(actionInfo, event) {
  const position = editCopyMenuPosition(event);
  const menu = document.createElement("section");
  const buttons = [];

  if (actionInfo.edit) {
    buttons.push(`<button type="button" data-panel-action="edit">編集</button>`);
  }

  if (actionInfo.copyInfo) {
    buttons.push(`<button type="button" data-panel-action="copy">編集をコピー</button>`);
  }

  if (actionInfo.delete) {
    buttons.push(`<button type="button" class="danger-button" data-panel-action="delete">削除</button>`);
  }

  if (!buttons.length) {
    return;
  }

  closeEditActionPanel();

  menu.className = "edit-action-panel";
  menu.style.setProperty("--edit-copy-menu-left", `${Math.round(position.x)}px`);
  menu.style.setProperty("--edit-copy-menu-top", `${Math.round(position.y)}px`);
  menu.innerHTML = `
    <p>${escapeHtml(actionInfo.title || "編集")}</p>
    ${buttons.join("")}
  `;

  menu.addEventListener("click", panelEvent => {
    const action = panelEvent.target.closest("[data-panel-action]")?.dataset.panelAction;

    if (!action) {
      return;
    }

    panelEvent.preventDefault();

    if (action === "edit") {
      closeEditActionPanel();
      actionInfo.edit?.();
      return;
    }

    if (action === "delete") {
      closeEditActionPanel();
      actionInfo.delete?.();
      return;
    }

    if (action !== "copy" || !actionInfo.copyInfo) {
      return;
    }

    const targetInfo = actionInfo.copyInfo;
    editCopyClipboard = {
      route: targetInfo.route,
      field: targetInfo.field,
      label: targetInfo.label,
      value: copyValueForEditTarget(targetInfo)
    };
    editCopySelectMode[targetInfo.route] = true;
    closeEditActionPanel();
    renderView();
  });

  document.body.appendChild(menu);
}

function clearEditCopyPressTimer() {
  clearTimeout(editCopyPressTimer);
  editCopyPressTimer = null;
  editCopyPressTarget = null;
}

function resetEditCopyState() {
  closeEditActionPanel();
  clearEditCopyPressTimer();
  editCopyClipboard = null;
  editCopySelectMode.livlies = false;
  editCopySelectMode.materials = false;
  editCopySelectedIds.livlies.clear();
  editCopySelectedIds.materials.clear();
}

function toggleEditCopySelectMode() {
  if (!["livlies", "materials"].includes(activeRoute)) {
    return;
  }

  editCopySelectMode[activeRoute] = !editCopySelectMode[activeRoute];
  renderView();
}

function toggleEditCopyCard(button) {
  const route = button.dataset.copyRoute || activeRoute;
  const card = button.closest(editCopyCardSelector(route));
  const id = card?.dataset.id;

  if (!id || !editCopySelectedIds[route]) {
    return;
  }

  if (editCopySelectedIds[route].has(id)) {
    editCopySelectedIds[route].delete(id);
  } else {
    editCopySelectedIds[route].add(id);
  }

  renderView();
}

function selectAllVisibleEditCopyCards() {
  if (!editCopySelectedIds[activeRoute]) {
    return;
  }

  contentArea.querySelectorAll(editCopyCardSelector(activeRoute)).forEach(card => {
    editCopySelectedIds[activeRoute].add(card.dataset.id);
  });
  editCopySelectMode[activeRoute] = true;
  renderView();
}

function clearVisibleEditCopySelection() {
  if (!editCopySelectedIds[activeRoute]) {
    return;
  }

  editCopySelectedIds[activeRoute].clear();
  renderView();
}

function pasteEditCopyToSelection() {
  if (!editCopyClipboard || editCopyClipboard.route !== activeRoute) {
    alert("先にコピーする編集を選んでください。");
    return;
  }

  const selectedIds = [...editCopySelectedIds[activeRoute]];

  if (!selectedIds.length) {
    alert("貼り付け先のカードを選択してください。");
    return;
  }

  const items = editableCopyItems(activeRoute);

  selectedIds.forEach(id => {
    const item = items.find(candidate => candidate.id === id);

    if (item) {
      applyEditCopyValue(activeRoute, item, editCopyClipboard.field, editCopyClipboard.value);
    }
  });

  updateEditSaveButtonState();
  renderView();
}

function handleEditCopyToolbarClick(event) {
  if (!editMode || !["livlies", "materials"].includes(activeRoute)) {
    return false;
  }

  const toggleEditCopyModeButton = event.target.closest('[data-action="toggle-edit-copy-select-mode"]');

  if (toggleEditCopyModeButton) {
    event.preventDefault();
    toggleEditCopySelectMode();
    return true;
  }

  const toggleEditCopyCardButton = event.target.closest('[data-action="toggle-edit-copy-card"]');

  if (toggleEditCopyCardButton) {
    event.preventDefault();
    toggleEditCopyCard(toggleEditCopyCardButton);
    return true;
  }

  const selectAllEditCopyButton = event.target.closest('[data-action="select-all-edit-copy"]');

  if (selectAllEditCopyButton) {
    event.preventDefault();
    selectAllVisibleEditCopyCards();
    return true;
  }

  const clearEditCopyButton = event.target.closest('[data-action="clear-edit-copy-selection"]');

  if (clearEditCopyButton) {
    event.preventDefault();
    clearVisibleEditCopySelection();
    return true;
  }

  const pasteEditCopyButton = event.target.closest('[data-action="paste-edit-copy"]');

  if (pasteEditCopyButton) {
    event.preventDefault();
    pasteEditCopyToSelection();
    return true;
  }

  return false;
}

function focusEditableElement(element) {
  if (!element) {
    return;
  }

  element.focus?.();

  if (typeof element.select === "function") {
    element.select();
  }
}

function editActionFromTarget(target, event) {
  const livlyPanelButton = target.closest?.('[data-action="open-livly-panel"]');

  if (livlyPanelButton && activeRoute === "livlies") {
    return () => openLivlyEditPanel(livlyPanelButton, event);
  }

  const materialNameButton = target.closest?.('[data-action="open-material-name-panel"]');

  if (materialNameButton && activeRoute === "materials") {
    return () => openMaterialNameEditPanel(materialNameButton, event);
  }

  const materialSeriesButton = target.closest?.('[data-action="open-material-series-panel"]');

  if (materialSeriesButton && activeRoute === "materials") {
    return () => openMaterialSeriesEditPanel(materialSeriesButton, event);
  }

  const ddSymbolButton = target.closest?.('[data-action="open-dd-symbol-menu"]');

  if (ddSymbolButton && activeRoute === "livlies") {
    return () => toggleDdSymbolMenu(ddSymbolButton);
  }

  const editableInput = target.closest?.("input, textarea, select");

  if (
    editableInput &&
    (
      editableInput.closest("[data-material-field], [data-material-tag], [data-material-series-tag]") ||
      editableInput.closest("[data-livly-field], [data-livly-level-field], [data-livly-dd-property]")
    )
  ) {
    return () => focusEditableElement(editableInput);
  }

  return null;
}

function materialSeriesDeleteActionFromTarget(target) {
  const materialSeriesButton = target.closest?.('[data-action="open-material-series-panel"][data-material-series-mode="edit"]');
  const seriesName = materialSeriesButton?.getAttribute("data-material-series-name") || "";

  if (!seriesName || activeRoute !== "materials") {
    return null;
  }

  return () => deleteMaterialSeries(seriesName);
}

function directDeleteActionFromTarget(target) {
  if (activeRoute === "livlies") {
    const livlyDeleteButton = target.closest?.('[data-action="delete-livly"]');

    if (livlyDeleteButton) {
      const card = livlyDeleteButton.closest("[data-id]");
      const item = card ? appData.livlies.find(livly => livly.id === card.dataset.id) : null;

      return {
        title: item ? livlyTitle(item) : "リブリー",
        action: () => {
          if (card?.dataset.id) {
            deleteLivly(card.dataset.id);
          }
        }
      };
    }

    const livlyLevelDeleteButton = target.closest?.('[data-action="delete-livly-level"]');

    if (livlyLevelDeleteButton) {
      return {
        title: "レベル行",
        action: () => deleteLivlyLevelRow(livlyLevelDeleteButton)
      };
    }

    const livlyDdRowDeleteButton = target.closest?.('[data-action="delete-livly-dd-row"]');

    if (livlyDdRowDeleteButton) {
      return {
        title: "dd排出量行",
        action: () => deleteLivlyDdRow(livlyDdRowDeleteButton)
      };
    }
  }

  if (activeRoute === "materials") {
    const materialDeleteButton = target.closest?.('[data-action="delete-material"]');

    if (materialDeleteButton) {
      const card = materialDeleteButton.closest("[data-id]");
      const item = card ? appData.materials.find(material => material.id === card.dataset.id) : null;

      return {
        title: item?.name || "素材",
        action: () => {
          if (card?.dataset.id) {
            deleteMaterial(card.dataset.id);
          }
        }
      };
    }
  }

  return null;
}

function editActionPanelInfoFromTarget(target, event) {
  if (!editMode || !["livlies", "materials"].includes(activeRoute)) {
    return null;
  }

  if (target.closest(".edit-copy-toolbar, .edit-action-panel, .edit-copy-card-selector")) {
    return null;
  }

  const copyInfo = findEditCopyTarget(target);
  const removableTarget = findLivlyRemovableTarget(target);
  const edit = editActionFromTarget(target, event);
  const directDelete = directDeleteActionFromTarget(target);
  const deleteAction = removableTarget
    ? () => deleteLivlyRemovableTarget(removableTarget)
    : materialSeriesDeleteActionFromTarget(target) || directDelete?.action;
  const title = copyInfo?.label ||
    directDelete?.title ||
    target.closest?.('[data-action="open-material-series-panel"]')?.getAttribute("data-material-series-name") ||
    target.closest?.(".livly-dd-symbol")?.textContent?.trim() ||
    target.closest?.(".livly-removable-option")?.dataset.choiceValue ||
    "編集";

  if (!copyInfo && !edit && !deleteAction) {
    return null;
  }

  return {
    title,
    copyInfo,
    edit,
    delete: deleteAction
  };
}

function switchRoute(route) {
  if (!routeConfig[route]) {
    return;
  }

  if (itemModal.classList.contains("is-open")) {
    closeEditor();
  }

  if (route !== activeRoute) {
    discardUnsavedPersonalityEdits();
    discardUnsavedLivlyEdits();
    discardUnsavedMaterialEdits();
    discardUnsavedProbabilitySettings();
    discardUnsavedExperienceEdits();
    discardUnsavedDdEdits();
    livlyEditPanel = null;
    livlyPanelDragState = null;
    openLivlyId = null;
    openMaterialId = null;
    materialNameEditPanel = null;
    materialSeriesEditPanel = null;
    resetEditCopyState();
    resetLivlyCropState();
  }

  activeRoute = route;
  closeTouchInfo();
  closeMenu();
  window.history.replaceState(null, "", `#${route}`);
  renderView();
}

function toggleEditMode() {
  const nextEditMode = !editMode;

  if (!nextEditMode) {
    discardUnsavedPersonalityEdits();
    discardUnsavedLivlyEdits();
    discardUnsavedMaterialEdits();
    discardUnsavedProbabilitySettings();
    discardUnsavedExperienceEdits();
    discardUnsavedDdEdits();
    livlyEditPanel = null;
    livlyPanelDragState = null;
    materialNameEditPanel = null;
    materialSeriesEditPanel = null;
    resetEditCopyState();
    resetLivlyCropState();
  }

  editMode = nextEditMode;
  document.body.classList.toggle("is-edit-mode", editMode);
  editModeButton.querySelector(".edit-status-text").textContent = editMode ? "編集 ON" : "編集 OFF";
  editModeButton.setAttribute("aria-pressed", String(editMode));

  if (editMode) {
    beginPersonalityEditSession();
    beginLivlyEditSession();
    beginMaterialEditSession();
    beginProbabilitySettingsEditSession();
    beginExperienceEditSession();
    beginDdEditSession();
  }

  closeMenu();
  updateViewportSizeBadge();
  renderView();
}

function canUseEditMode() {
  return Boolean(firebaseUser);
}

function updateAuthUi() {
  if (!menuAuthPanel) {
    return;
  }

  const isLoggedIn = Boolean(firebaseUser);
  const statusText = firebaseAuthError ||
    (isLoggedIn
      ? `ログイン中 ${firebaseUser.email || ""}`.trim()
      : firebaseAuthReady
        ? "ログインしていません"
        : "ログイン確認中");

  authStatusText.textContent = statusText;
  authLoginForm.hidden = isLoggedIn;
  authLogoutButton.hidden = !isLoggedIn;
  editModeButton.hidden = !isLoggedIn;

  if (!isLoggedIn && editMode) {
    toggleEditMode();
  }
}

function setupFirebaseAuth(services) {
  if (!services) {
    updateAuthUi();
    return;
  }

  if (firebaseAuthSubscribed) {
    updateAuthUi();
    return;
  }

  firebaseServices = services;
  firebaseAuthReady = false;
  firebaseAuthSubscribed = true;
  updateAuthUi();

  services.onAuthStateChanged(services.auth, user => {
    firebaseAuthReady = true;
    firebaseUser = user;
    firebaseAuthError = "";
    updateAuthUi();
  }, () => {
    firebaseAuthReady = true;
    firebaseUser = null;
    firebaseAuthError = "ログイン状態を確認できませんでした";
    updateAuthUi();
  });
}

function initializeFirebaseAuthUi() {
  if (window.livlivFirebase) {
    setupFirebaseAuth(window.livlivFirebase);
    return;
  }

  window.addEventListener("livliv:firebase-ready", event => {
    setupFirebaseAuth(event.detail);
  }, { once: true });

  updateAuthUi();
}

async function loginEditor() {
  if (!firebaseServices) {
    firebaseAuthError = "ログイン機能を読み込み中です";
    updateAuthUi();
    return;
  }

  const email = authEmailInput.value.trim();
  const password = authPasswordInput.value;

  if (!email || !password) {
    firebaseAuthError = "メールとパスワードを入力してください";
    updateAuthUi();
    return;
  }

  authLoginButton.disabled = true;
  firebaseAuthError = "";
  updateAuthUi();

  try {
    await firebaseServices.signInWithEmailAndPassword(firebaseServices.auth, email, password);
    authPasswordInput.value = "";
  } catch (error) {
    firebaseAuthError = "ログインできませんでした";
  } finally {
    authLoginButton.disabled = false;
    updateAuthUi();
  }
}

async function logoutEditor() {
  if (!firebaseServices) {
    return;
  }

  authLogoutButton.disabled = true;

  try {
    await firebaseServices.signOut(firebaseServices.auth);
  } finally {
    authLogoutButton.disabled = false;
    updateAuthUi();
  }
}

function handleEditModeButtonClick() {
  if (!canUseEditMode()) {
    firebaseAuthError = "ログインすると編集できます";
    updateAuthUi();
    return;
  }

  toggleEditMode();
}

function findItem(id) {
  if (!isListRoute()) {
    return null;
  }

  return appData[activeRoute].find(item => item.id === id);
}

function beginPersonalityEditSession() {
  if (activeRoute === "personalities" && editMode && !personalityEditBackup) {
    personalityEditBackup = cloneData(appData.personalities);
  }
}

function discardUnsavedPersonalityEdits() {
  if (activeRoute !== "personalities" || !personalityEditBackup) {
    return;
  }

  clearTimeout(personalityRateFormatTimer);
  personalityRateFormatTimer = null;
  appData.personalities = cloneData(personalityEditBackup);
  personalityEditBackup = null;
  stopPersonalityAutoScroll();
  personalityDragState = null;
}

function commitPersonalityEditSession() {
  if (activeRoute === "personalities" && editMode) {
    personalityEditBackup = cloneData(appData.personalities);
  }
}

function beginMaterialEditSession() {
  if (activeRoute === "materials" && editMode && !materialEditBackup) {
    materialEditBackup = cloneData(currentMaterialEditData());
  }
}

function discardUnsavedMaterialEdits() {
  if (activeRoute !== "materials" || !materialEditBackup) {
    return;
  }

  const backup = cloneData(materialEditBackup);

  appData.materials = backup.materials || [];
  appData.materialSeriesTags = backup.materialSeriesTags || [];
  materialVisibleSeriesTags = materialVisibleSeriesTags.filter(tag => appData.materialSeriesTags.includes(tag));
  saveMaterialVisibleSeriesTags();
  materialEditBackup = null;
  materialSeriesEditPanel = null;
  resetLivlyCropState();
}

function commitMaterialEditSession() {
  if (activeRoute === "materials" && editMode) {
    materialEditBackup = cloneData(currentMaterialEditData());
  }
}

function sameData(left, right) {
  return JSON.stringify(left) === JSON.stringify(right);
}

function currentLivlyEditData() {
  return {
    livlies: appData.livlies,
    livlyOptionSets: appData.livlyOptionSets,
    livlyFieldDescriptions: appData.livlyFieldDescriptions
  };
}

function currentMaterialEditData() {
  return {
    materials: appData.materials,
    materialSeriesTags: appData.materialSeriesTags || []
  };
}

function hasUnsavedPersonalityEdits() {
  return Boolean(
    activeRoute === "personalities" &&
    editMode &&
    personalityEditBackup &&
    !sameData(appData.personalities, personalityEditBackup)
  );
}

function hasUnsavedLivlyEdits() {
  return Boolean(
    activeRoute === "livlies" &&
    editMode &&
    livlyEditBackup &&
    !sameData(currentLivlyEditData(), livlyEditBackup)
  );
}

function hasUnsavedMaterialEdits() {
  return Boolean(
    activeRoute === "materials" &&
    editMode &&
    materialEditBackup &&
    !sameData(currentMaterialEditData(), materialEditBackup)
  );
}

function updateEditSaveButtonState() {
  const action = activeRoute === "personalities"
    ? "save-personalities"
    : activeRoute === "livlies"
      ? "save-livlies"
      : activeRoute === "materials"
        ? "save-materials"
        : "";

  if (!action) {
    return;
  }

  const button = document.querySelector(`[data-action="${action}"]`);

  if (!button) {
    return;
  }

  const hasUnsavedChanges = activeRoute === "personalities"
    ? hasUnsavedPersonalityEdits()
    : activeRoute === "livlies"
      ? hasUnsavedLivlyEdits()
      : hasUnsavedMaterialEdits();

  button.classList.toggle("is-dirty", hasUnsavedChanges);
}

function beginLivlyEditSession() {
  if (activeRoute === "livlies" && editMode && !livlyEditBackup) {
    livlyEditBackup = cloneData(currentLivlyEditData());
  }
}

function discardUnsavedLivlyEdits() {
  if (activeRoute !== "livlies" || !livlyEditBackup) {
    return;
  }

  appData.livlies = cloneData(livlyEditBackup.livlies);
  appData.livlyOptionSets = cloneData(livlyEditBackup.livlyOptionSets);
  appData.livlyFieldDescriptions = cloneData(livlyEditBackup.livlyFieldDescriptions);
  livlyEditBackup = null;
  livlyEditPanel = null;
  livlyPanelDragState = null;
}

function commitLivlyEditSession() {
  if (activeRoute === "livlies" && editMode) {
    livlyEditBackup = cloneData(currentLivlyEditData());
  }
}

function beginProbabilitySettingsEditSession() {
  if (activeRoute === "personalityProbability" && editMode && !probabilitySettingsBackup) {
    probabilitySettingsBackup = cloneData(appData.personalitySlotRates);
  }
}

function discardUnsavedProbabilitySettings() {
  if (activeRoute !== "personalityProbability" || !probabilitySettingsBackup) {
    return;
  }

  appData.personalitySlotRates = cloneData(probabilitySettingsBackup);
  probabilitySettingsBackup = null;
}

function commitProbabilitySettingsEditSession() {
  if (activeRoute === "personalityProbability" && editMode) {
    probabilitySettingsBackup = cloneData(appData.personalitySlotRates);
  }
}

function findLivlyByRow(element) {
  const row = element.closest("[data-id]");
  return row ? appData.livlies.find(item => item.id === row.dataset.id) : null;
}

function findMaterialByRow(element) {
  const row = element.closest("[data-id]");
  return row ? appData.materials.find(item => item.id === row.dataset.id) : null;
}

function isCropRoute() {
  return activeRoute === "livlies" || activeRoute === "materials";
}

function cropTypeFromElement(element) {
  if (element.closest(".material-detail-card") || element.matches?.("[data-material-image-upload]")) {
    return "material";
  }

  return "livly";
}

function findImageCropTargetByRow(element) {
  const type = cropTypeFromElement(element);
  const item = type === "material" ? findMaterialByRow(element) : findLivlyByRow(element);

  return item ? { item, type } : null;
}

function resetLivlyCropState() {
  livlyCropState = null;
  livlyCropDragState = null;
  livlyCropPinnedLoupeHandle = null;
  livlyCropLoupePosition = null;
  livlyCropLoupeDragState = null;
  clearLivlyCropPinPressTimer();
}

function cleanNumberLikeInput(value) {
  return normalizeNumericInputText(value).replace(/[^\d.]/g, "");
}

function openLivlyEditPanel(button, event = null) {
  const item = findLivlyByRow(button);
  const panel = button.dataset.livlyPanel;

  if (!item || !panel) {
    return;
  }

  const anchor = livlyPanelAnchorFromEvent(event, button);
  livlyEditPanel = { livlyId: item.id, panel, placement: "after", x: anchor.x, y: anchor.y };
  renderView();

  requestAnimationFrame(() => {
    const card = contentArea.querySelector(`[data-id="${item.id}"]`);
    const firstInput = card ? card.querySelector(".livly-inline-panel input, .livly-inline-panel select, .livly-inline-panel textarea") : null;

    if (firstInput && firstInput.type !== "file") {
      firstInput.focus();
    }
  });
}

function setLivlyCardOpenState(card, isOpen) {
  card.classList.toggle("is-open-card", isOpen);
  card.dataset.livlyExpanded = String(isOpen);

  const imageButton = card.querySelector('[data-action="toggle-livly-card"]');

  if (imageButton) {
    const item = appData.livlies.find(livly => livly.id === card.dataset.id);
    const title = item ? livlyTitle(item) : "リブリー";

    imageButton.setAttribute("aria-expanded", String(isOpen));
    imageButton.setAttribute("aria-label", `${title}を${isOpen ? "閉じる" : "開く"}`);
  }
}

function applyLivlyCardOpenState(nextOpenId) {
  openLivlyId = nextOpenId;

  contentArea.querySelectorAll(".livly-detail-card[data-id]").forEach(card => {
    setLivlyCardOpenState(card, card.dataset.id === openLivlyId);
  });
}

function toggleLivlyCard(button) {
  if (editMode || activeRoute !== "livlies" || livlyColumnCount === 1) {
    return;
  }

  const card = button.closest("[data-id]");

  if (!card) {
    return;
  }

  closeTouchInfo();
  const nextOpenId = openLivlyId === card.dataset.id ? null : card.dataset.id;
  const update = () => applyLivlyCardOpenState(nextOpenId);

  if (document.startViewTransition) {
    document.startViewTransition(update);
    return;
  }

  update();
}

function setMaterialCardOpenState(card, isOpen) {
  card.classList.toggle("is-open-card", isOpen);
  card.dataset.materialExpanded = String(isOpen);

  const imageButton = card.querySelector('[data-action="toggle-material-card"]');

  if (imageButton) {
    const item = appData.materials.find(material => material.id === card.dataset.id);
    const title = item?.name || "素材";

    imageButton.setAttribute("aria-expanded", String(isOpen));
    imageButton.setAttribute("aria-label", `${title}を${isOpen ? "閉じる" : "開く"}`);
  }
}

function applyMaterialCardOpenState(nextOpenId) {
  openMaterialId = nextOpenId;

  contentArea.querySelectorAll(".material-detail-card[data-id]").forEach(card => {
    setMaterialCardOpenState(card, card.dataset.id === openMaterialId);
  });
}

function applyCardColumnCount(route, count) {
  const normalizedCount = clampCardColumnCount(count);
  const isLivlyRoute = route === "livlies";
  const list = contentArea.querySelector(isLivlyRoute ? ".livly-card-list" : ".material-card-list");

  if (list) {
    list.style.setProperty("--card-columns", normalizedCount);
  }

  if (isLivlyRoute) {
    contentArea.querySelectorAll(".livly-detail-card[data-id]").forEach(card => {
      setLivlyCardOpenState(card, normalizedCount === 1 || card.dataset.id === openLivlyId);
    });
    return;
  }

  contentArea.querySelectorAll(".material-detail-card[data-id]").forEach(card => {
    setMaterialCardOpenState(card, normalizedCount === 1 || card.dataset.id === openMaterialId);
  });
  scheduleMaterialHeaderFit();
}

function updateCardColumnSlider(input) {
  const route = input.dataset.cardColumnSlider;
  const count = clampCardColumnCount(input.value);

  input.value = String(count);

  if (route === "livlies") {
    livlyColumnCount = count;
    localStorage.setItem("livlyColumnCount", String(count));
  } else if (route === "materials") {
    materialColumnCount = count;
    localStorage.setItem("materialColumnCount", String(count));
  } else {
    return;
  }

  const valueLabel = input.closest(".card-column-slider")?.querySelector("[data-card-column-value]");

  if (valueLabel) {
    valueLabel.textContent = String(count);
  }

  applyCardColumnCount(route, count);
}

function syncCardColumnSliderLimits() {
  livlyColumnCount = clampCardColumnCount(livlyColumnCount);
  materialColumnCount = clampCardColumnCount(materialColumnCount);
  localStorage.setItem("livlyColumnCount", String(livlyColumnCount));
  localStorage.setItem("materialColumnCount", String(materialColumnCount));

  contentArea.querySelectorAll("[data-card-column-slider]").forEach(input => {
    const route = input.dataset.cardColumnSlider;
    const count = route === "materials" ? materialColumnCount : livlyColumnCount;

    input.max = String(currentCardColumnMax());
    input.value = String(count);
    input.closest(".card-column-slider")?.querySelector("[data-card-column-value]")?.replaceChildren(String(count));
    applyCardColumnCount(route, count);
  });
}

function toggleMaterialCard(button) {
  if (activeRoute !== "materials" || materialColumnCount === 1) {
    return;
  }

  const card = button.closest("[data-id]");

  if (!card) {
    return;
  }

  closeTouchInfo();
  const nextOpenId = openMaterialId === card.dataset.id ? null : card.dataset.id;
  const update = () => {
    applyMaterialCardOpenState(nextOpenId);
    scheduleMaterialHeaderFit();
  };

  if (document.startViewTransition) {
    document.startViewTransition(update);
    return;
  }

  update();
}

function materialNamePanelAnchorFromEvent(event, fallbackElement = null) {
  if (event && Number.isFinite(event.clientX) && Number.isFinite(event.clientY)) {
    return {
      x: event.clientX + 10,
      y: event.clientY + 10
    };
  }

  if (fallbackElement) {
    const rect = fallbackElement.getBoundingClientRect();
    return {
      x: rect.left,
      y: rect.bottom + 8
    };
  }

  return {
    x: Math.min(window.innerWidth - 16, Math.max(16, window.innerWidth / 2)),
    y: 96
  };
}

function placeMaterialNameEditPanel() {
  const panel = contentArea.querySelector("[data-material-name-panel]");

  if (!panel || !materialNameEditPanel) {
    return;
  }

  const margin = 10;
  const rect = panel.getBoundingClientRect();
  let left = Number.isFinite(materialNameEditPanel.x) ? materialNameEditPanel.x : window.innerWidth / 2;
  let top = Number.isFinite(materialNameEditPanel.y) ? materialNameEditPanel.y : 96;

  if (left + rect.width > window.innerWidth - margin) {
    left = window.innerWidth - rect.width - margin;
  }

  if (top + rect.height > window.innerHeight - margin) {
    top = window.innerHeight - rect.height - margin;
  }

  left = Math.max(margin, left);
  top = Math.max(margin, top);
  materialNameEditPanel.x = left;
  materialNameEditPanel.y = top;
  panel.style.left = `${Math.round(left)}px`;
  panel.style.top = `${Math.round(top)}px`;
}

function scheduleMaterialNameEditPanel() {
  if (!materialNameEditPanel) {
    return;
  }

  requestAnimationFrame(placeMaterialNameEditPanel);
}

function placeMaterialSeriesEditPanel() {
  const panel = contentArea.querySelector("[data-material-series-panel]");

  if (!panel || !materialSeriesEditPanel) {
    return;
  }

  const margin = 10;
  const rect = panel.getBoundingClientRect();
  let left = Number.isFinite(materialSeriesEditPanel.x) ? materialSeriesEditPanel.x : window.innerWidth / 2;
  let top = Number.isFinite(materialSeriesEditPanel.y) ? materialSeriesEditPanel.y : 96;

  if (left + rect.width > window.innerWidth - margin) {
    left = window.innerWidth - rect.width - margin;
  }

  if (top + rect.height > window.innerHeight - margin) {
    top = window.innerHeight - rect.height - margin;
  }

  left = Math.max(margin, left);
  top = Math.max(margin, top);
  materialSeriesEditPanel.x = left;
  materialSeriesEditPanel.y = top;
  panel.style.left = `${Math.round(left)}px`;
  panel.style.top = `${Math.round(top)}px`;
}

function scheduleMaterialSeriesEditPanel() {
  if (!materialSeriesEditPanel) {
    return;
  }

  requestAnimationFrame(placeMaterialSeriesEditPanel);
}

function openMaterialNameEditPanel(button, event = null) {
  const card = button.closest("[data-id]");
  const item = card ? appData.materials.find(material => material.id === card.dataset.id) : null;

  if (!item) {
    return;
  }

  const anchor = materialNamePanelAnchorFromEvent(event, button);
  materialNameEditPanel = { materialId: item.id, x: anchor.x, y: anchor.y };
  closeTouchInfo();
  renderView();

  requestAnimationFrame(() => {
    const input = contentArea.querySelector(`[data-id="${item.id}"] [data-material-name-panel] [data-material-field="name"]`);

    if (input) {
      input.focus();
      input.select();
    }
  });
}

function closeMaterialNameEditPanel() {
  materialNameEditPanel = null;
  renderView();
}

function openMaterialSeriesEditPanel(button, event = null) {
  const mode = button.dataset.materialSeriesMode === "edit" ? "edit" : "add";
  const name = mode === "edit" ? button.getAttribute("data-material-series-name") || "" : "";

  if (mode === "edit" && !appData.materialSeriesTags.includes(name)) {
    return;
  }

  const anchor = materialNamePanelAnchorFromEvent(event, button);
  materialSeriesEditPanel = { mode, name, x: anchor.x, y: anchor.y };
  closeTouchInfo();
  renderView();

  requestAnimationFrame(() => {
    const input = contentArea.querySelector("[data-material-series-panel-input]");

    if (input) {
      input.focus();
      input.select();
    }
  });
}

function closeMaterialSeriesEditPanel() {
  materialSeriesEditPanel = null;
  renderView();
}

function closeLivlyEditPanel() {
  livlyEditPanel = null;
  livlyPanelDragState = null;
  renderView();
}

function addInlineLivly() {
  const item = createNewItem();
  const anchor = livlyPanelAnchorFromEvent(null, null);

  appData.livlies.push(item);
  livlyEditPanel = { livlyId: item.id, panel: "species", placement: "after", x: anchor.x, y: anchor.y };
  closeTouchInfo();
  renderView();

  requestAnimationFrame(() => {
    const nameInput = contentArea.querySelector(`[data-id="${item.id}"] [data-livly-field="species"]`);

    if (nameInput) {
      nameInput.focus();
    }
  });
}

function deleteLivly(itemId) {
  const item = appData.livlies.find(livly => livly.id === itemId);

  if (!item) {
    return;
  }

  const name = livlyTitle(item);

  if (!confirm(`${name}を削除していいですか？`)) {
    return;
  }

  appData.livlies = appData.livlies.filter(livly => livly.id !== itemId);
  if (livlyEditPanel?.livlyId === itemId) {
    livlyEditPanel = null;
    livlyPanelDragState = null;
  }
  if (openLivlyId === itemId) {
    openLivlyId = null;
  }
  renderView();
}

function clearLivlyImage(button) {
  const item = findLivlyByRow(button);

  if (!item) {
    return;
  }

  item.imageUrl = "";
  updateEditSaveButtonState();
  renderView();
}

function clearMaterialImage(button) {
  const item = findMaterialByRow(button);

  if (!item) {
    return;
  }

  item.imageUrl = "";
  updateEditSaveButtonState();
  renderView();
}

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onerror = () => reject(new Error("画像を読み込めませんでした。"));
    reader.onload = () => resolve(reader.result);
    reader.readAsDataURL(file);
  });
}

function loadImage(dataUrl) {
  return new Promise((resolve, reject) => {
    const image = new Image();

    image.onerror = reject;
    image.onload = () => resolve(image);
    image.src = dataUrl;
  });
}

function sampleDominantColor(image) {
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d", { willReadFrequently: true });
  const size = 32;
  const colors = new Map();

  canvas.width = size;
  canvas.height = size;
  context.drawImage(image, 0, 0, size, size);

  const data = context.getImageData(0, 0, size, size).data;

  for (let index = 0; index < data.length; index += 4) {
    const alpha = data[index + 3];

    if (alpha < 32) {
      continue;
    }

    const red = Math.round(data[index] / 24) * 24;
    const green = Math.round(data[index + 1] / 24) * 24;
    const blue = Math.round(data[index + 2] / 24) * 24;
    const key = `${red},${green},${blue}`;
    colors.set(key, (colors.get(key) || 0) + 1);
  }

  const dominant = Array.from(colors.entries()).sort((a, b) => b[1] - a[1])[0];
  return dominant ? `rgb(${dominant[0]})` : "#3b3d41";
}

function imageRatioKey(width, height) {
  const safeWidth = Math.max(1, Math.round(Number(width) || 1));
  const safeHeight = Math.max(1, Math.round(Number(height) || 1));
  const divisor = greatestCommonDivisor(safeWidth, safeHeight);

  return `${safeWidth / divisor}:${safeHeight / divisor}`;
}

function greatestCommonDivisor(left, right) {
  let a = Math.abs(left);
  let b = Math.abs(right);

  while (b) {
    const next = a % b;
    a = b;
    b = next;
  }

  return a || 1;
}

function readCropPresets() {
  try {
    const presets = JSON.parse(localStorage.getItem(cropPresetStorageKey) || "[]");

    if (!Array.isArray(presets)) {
      return [];
    }

    return presets
      .filter(preset => preset && preset.ratioKey && Number.isFinite(Number(preset.xRatio)) && Number.isFinite(Number(preset.yRatio)) && Number.isFinite(Number(preset.sizeRatio)))
      .slice(0, cropPresetMaxCount);
  } catch (error) {
    return [];
  }
}

function writeCropPresets(presets) {
  localStorage.setItem(cropPresetStorageKey, JSON.stringify(presets.slice(0, cropPresetMaxCount)));
}

function cropPresetForState(state = livlyCropState) {
  if (!state) {
    return null;
  }

  const ratioKey = imageRatioKey(state.naturalWidth, state.naturalHeight);

  return readCropPresets().find(preset => preset.ratioKey === ratioKey) || null;
}

function saveCropPreset(state = livlyCropState) {
  if (!state) {
    return;
  }

  const ratioKey = imageRatioKey(state.naturalWidth, state.naturalHeight);
  const preset = {
    ratioKey,
    width: state.naturalWidth,
    height: state.naturalHeight,
    xRatio: state.x / state.naturalWidth,
    yRatio: state.y / state.naturalHeight,
    sizeRatio: state.size / state.naturalWidth,
    updatedAt: Date.now()
  };
  const presets = readCropPresets().filter(item => item.ratioKey !== ratioKey);

  writeCropPresets([preset, ...presets]);
}

function applyCropPresetToState(preset, state = livlyCropState) {
  if (!preset || !state) {
    return false;
  }

  state.x = Math.round(Number(preset.xRatio) * state.naturalWidth);
  state.y = Math.round(Number(preset.yRatio) * state.naturalHeight);
  state.size = Math.round(Number(preset.sizeRatio) * state.naturalWidth);
  clampLivlyCropState();
  updateLivlyCropBoxElement();

  return true;
}

function fileBaseName(file) {
  return (file?.name || "画像")
    .replace(/\.[^.]+$/g, "")
    .trim() || "画像";
}

async function imageInfoFromFile(file) {
  const dataUrl = await fileToDataUrl(file);
  const image = await loadImage(dataUrl);

  return {
    dataUrl,
    fileName: fileBaseName(file),
    naturalWidth: image.width,
    naturalHeight: image.height,
    fillColor: sampleDominantColor(image)
  };
}

function cropStateFromImageInfo(item, itemType, imageInfo, batch = null) {
  const cropSize = Math.min(imageInfo.naturalWidth, imageInfo.naturalHeight);

  return {
    livlyId: item.id,
    itemId: item.id,
    itemType,
    dataUrl: imageInfo.dataUrl,
    naturalWidth: imageInfo.naturalWidth,
    naturalHeight: imageInfo.naturalHeight,
    fillColor: imageInfo.fillColor,
    x: Math.round((imageInfo.naturalWidth - cropSize) / 2),
    y: Math.round((imageInfo.naturalHeight - cropSize) / 2),
    size: cropSize,
    batch
  };
}

async function startBulkImageUpload(route, fileList) {
  if (!editMode || !["livlies", "materials"].includes(route)) {
    return;
  }

  const files = Array.from(fileList || []).filter(file => file.type.startsWith("image/"));

  if (!files.length) {
    return;
  }

  try {
    const imageInfos = [];

    for (const file of files) {
      imageInfos.push(await imageInfoFromFile(file));
    }

    const ratioKeys = imageInfos.map(info => imageRatioKey(info.naturalWidth, info.naturalHeight));
    const firstRatioKey = ratioKeys[0];

    if (!ratioKeys.every(key => key === firstRatioKey)) {
      alert("複数追加は、すべて同じ縦横比率の画像だけ使えます。");
      return;
    }

    removePendingCropBatchItems();
    resetLivlyCropState();

    const itemType = route === "materials" ? "material" : "livly";
    const createdItems = imageInfos.map(imageInfo => createBulkImageItem(route, imageInfo.fileName));
    const firstItem = createdItems[0];
    const batch = {
      itemType,
      ratioKey: firstRatioKey,
      createdItemIds: createdItems.map(item => item.id),
      items: createdItems.map((item, index) => ({
        itemId: item.id,
        imageInfo: imageInfos[index]
      }))
    };

    livlyCropPinnedLoupeHandle = null;
    livlyCropLoupePosition = null;
    livlyCropLoupeDragState = null;
    clearLivlyCropPinPressTimer();
    livlyCropState = cropStateFromImageInfo(firstItem, itemType, imageInfos[0], batch);

    if (route === "livlies") {
      const anchor = livlyPanelAnchorFromEvent(null, null);
      livlyEditPanel = { livlyId: firstItem.id, panel: "image", placement: "after", x: anchor.x, y: anchor.y };
      openLivlyId = firstItem.id;
    } else {
      materialVisibleTags = [];
      materialVisibleSeriesTags = [];
      saveMaterialVisibleTags();
      saveMaterialVisibleSeriesTags();
      openMaterialId = firstItem.id;
    }

    updateEditSaveButtonState();
    renderView();
  } catch (error) {
    alert("画像を読み込めませんでした。別の画像を試してください。");
  }
}

function createBulkImageItem(route, name) {
  const item = createNewItem();

  if (route === "materials") {
    item.name = name;
    appData.materials.push(item);
    return item;
  }

  item.species = name;
  appData.livlies.push(item);
  return item;
}

async function cropImageDataUrl(imageInfo, cropSource) {
  const image = await loadImage(imageInfo.dataUrl);
  const outputSize = 512;
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  const crop = {
    x: Math.round((cropSource.x / cropSource.naturalWidth) * imageInfo.naturalWidth),
    y: Math.round((cropSource.y / cropSource.naturalHeight) * imageInfo.naturalHeight),
    size: Math.round((cropSource.size / cropSource.naturalWidth) * imageInfo.naturalWidth)
  };
  const safeSize = Math.max(16, crop.size || Math.min(imageInfo.naturalWidth, imageInfo.naturalHeight));

  canvas.width = outputSize;
  canvas.height = outputSize;
  context.fillStyle = imageInfo.fillColor || "#3b3d41";
  context.fillRect(0, 0, outputSize, outputSize);
  context.drawImage(
    image,
    -crop.x * (outputSize / safeSize),
    -crop.y * (outputSize / safeSize),
    image.width * (outputSize / safeSize),
    image.height * (outputSize / safeSize)
  );

  return canvas.toDataURL("image/webp", 0.84);
}

async function updateLivlyImage(input) {
  const target = findImageCropTargetByRow(input);
  const item = target?.item;
  const file = input.files && input.files[0];

  if (!item || !file) {
    return;
  }

  try {
    const imageInfo = await imageInfoFromFile(file);
    livlyCropPinnedLoupeHandle = null;
    livlyCropLoupePosition = null;
    livlyCropLoupeDragState = null;
    clearLivlyCropPinPressTimer();
    livlyCropState = cropStateFromImageInfo(item, target.type, imageInfo);
    renderView();
  } catch (error) {
    alert("画像を保存できませんでした。別の画像を試してください。");
  }
}

function renderLivlyCropTool(item, itemType = "livly") {
  const activeType = livlyCropState?.itemType || "livly";

  if (!livlyCropState || livlyCropState.itemId !== item.id || activeType !== itemType) {
    return "";
  }

  const state = livlyCropState;
  const cropStyle = livlyCropStyleText(state);
  const loupeImageStyle = livlyCropLoupeImageStyleText(state);
  const loupeFrameStyle = livlyCropLoupeFrameStyleText(state);
  const preset = cropPresetForState(state);
  const isBatch = Boolean(state.batch?.items?.length > 1);
  const applyLabel = isBatch ? `${state.batch.items.length}枚を一括トリミング` : "トリミングする";

  return `
    <section class="livly-crop-tool">
      <div class="livly-crop-heading">
        <span>${isBatch ? `一括トリミング ${state.batch.items.length}枚` : "トリミング"}</span>
        <button type="button" class="plain-button" data-action="cancel-livly-crop" aria-label="閉じる">×</button>
      </div>
      <div class="livly-crop-stage" data-livly-crop-stage style="--fill-color:${escapeHtml(state.fillColor)}">
        <img src="${escapeHtml(state.dataUrl)}" alt="トリミング画像" draggable="false">
        <span class="livly-crop-box" data-livly-crop-box style="${cropStyle}">
          ${["nw", "ne", "sw", "se"].map(handle => `<i class="${livlyCropPinnedLoupeHandle === handle ? "is-pinned" : ""}" data-livly-crop-handle="${handle}"></i>`).join("")}
        </span>
      </div>
      <div class="livly-crop-loupe ${livlyCropPinnedLoupeHandle ? "is-visible is-pinned" : ""}" data-livly-crop-loupe style="--fill-color:${escapeHtml(state.fillColor)}">
        <img src="${escapeHtml(state.dataUrl)}" alt="" draggable="false" data-livly-crop-loupe-image style="${loupeImageStyle}">
        <span class="livly-crop-loupe-frame" data-livly-crop-loupe-frame style="${loupeFrameStyle}"></span>
      </div>
      <div class="livly-crop-actions">
        <div class="livly-crop-button-group">
          ${preset ? `<button type="button" class="plain-button crop-replay-button" data-action="replay-livly-crop">前回の位置を再現</button>` : ""}
          ${preset && isBatch ? `<button type="button" class="plain-button crop-replay-button" data-action="apply-livly-crop-preset">前回の位置で一括</button>` : ""}
          <button type="button" data-action="apply-livly-crop">${escapeHtml(applyLabel)}</button>
          <button type="button" class="plain-button" data-action="cancel-livly-crop">やめる</button>
        </div>
      </div>
    </section>
  `;
}

function livlyCropStyleText(state) {
  const previewSize = 100;
  const scale = Math.min(previewSize / state.naturalWidth, previewSize / state.naturalHeight);
  const imageWidth = state.naturalWidth * scale;
  const imageHeight = state.naturalHeight * scale;
  const imageLeft = (previewSize - imageWidth) / 2;
  const imageTop = (previewSize - imageHeight) / 2;

  return `
    left:${imageLeft + state.x * scale}%;
    top:${imageTop + state.y * scale}%;
    width:${state.size * scale}%;
    height:${state.size * scale}%;
  `;
}

function livlyCropLoupeImageStyleText(state, handle = "center") {
  const metrics = livlyCropLoupeMetrics(state, handle);

  return `
    width:${metrics.imageWidth * metrics.zoom}%;
    height:${metrics.imageHeight * metrics.zoom}%;
    left:${50 - metrics.centerX * metrics.zoom}%;
    top:${50 - metrics.centerY * metrics.zoom}%;
  `;
}

function livlyCropLoupeFrameStyleText(state, handle = "center") {
  const metrics = livlyCropLoupeMetrics(state, handle);
  const cropLeft = metrics.imageLeft + state.x * metrics.scale;
  const cropTop = metrics.imageTop + state.y * metrics.scale;
  const cropSize = state.size * metrics.scale;

  return `
    left:${50 + (cropLeft - metrics.centerX) * metrics.zoom}%;
    top:${50 + (cropTop - metrics.centerY) * metrics.zoom}%;
    width:${cropSize * metrics.zoom}%;
    height:${cropSize * metrics.zoom}%;
  `;
}

function livlyCropLoupeMetrics(state, handle = "center") {
  const previewSize = 100;
  const scale = Math.min(previewSize / state.naturalWidth, previewSize / state.naturalHeight);
  const imageWidth = state.naturalWidth * scale;
  const imageHeight = state.naturalHeight * scale;
  const imageLeft = (previewSize - imageWidth) / 2;
  const imageTop = (previewSize - imageHeight) / 2;
  const focalPoint = livlyCropFocalPoint(state, handle);
  const centerX = imageLeft + focalPoint.x * scale;
  const centerY = imageTop + focalPoint.y * scale;
  const zoom = 2.4;

  return { centerX, centerY, imageHeight, imageLeft, imageTop, imageWidth, scale, zoom };
}

function livlyCropFocalPoint(state, handle) {
  const points = {
    nw: { x: state.x, y: state.y },
    ne: { x: state.x + state.size, y: state.y },
    sw: { x: state.x, y: state.y + state.size },
    se: { x: state.x + state.size, y: state.y + state.size }
  };

  return points[handle] || { x: state.x + state.size / 2, y: state.y + state.size / 2 };
}

function clampLivlyCropState() {
  if (!livlyCropState) {
    return;
  }

  const maxSize = Math.max(livlyCropState.naturalWidth, livlyCropState.naturalHeight);
  livlyCropState.size = Math.min(Math.max(16, Number(livlyCropState.size) || 16), maxSize);
  livlyCropState.x = Math.min(
    Math.max(-livlyCropState.size, Number(livlyCropState.x) || 0),
    livlyCropState.naturalWidth
  );
  livlyCropState.y = Math.min(
    Math.max(-livlyCropState.size, Number(livlyCropState.y) || 0),
    livlyCropState.naturalHeight
  );
}

function updateLivlyCropBoxElement() {
  if (!livlyCropState) {
    return;
  }

  const cropBox = contentArea.querySelector("[data-livly-crop-box]");

  if (cropBox) {
    cropBox.style.cssText = livlyCropStyleText(livlyCropState);
  }

  updateLivlyCropLoupe();
}

function livlyCropStageScale(stage) {
  if (!livlyCropState || !stage) {
    return 1;
  }

  const rect = stage.getBoundingClientRect();
  return Math.min(rect.width / livlyCropState.naturalWidth, rect.height / livlyCropState.naturalHeight) || 1;
}

function updateLivlyCropLoupe(event = null) {
  if (!livlyCropState) {
    return;
  }

  const stage = contentArea.querySelector("[data-livly-crop-stage]");
  const cropBox = contentArea.querySelector("[data-livly-crop-box]");
  const loupe = contentArea.querySelector("[data-livly-crop-loupe]");
  const image = contentArea.querySelector("[data-livly-crop-loupe-image]");
  const frame = contentArea.querySelector("[data-livly-crop-loupe-frame]");

  if (!loupe || !image) {
    return;
  }

  const dragHandle = livlyCropDragState?.handle || "";
  const activeHandle = livlyCropPinnedLoupeHandle || (dragHandle && dragHandle !== "move" ? dragHandle : "");
  const shouldShow = Boolean(activeHandle);
  const handle = activeHandle || "center";
  loupe.classList.toggle("is-visible", Boolean(shouldShow));
  loupe.classList.toggle("is-pinned", Boolean(livlyCropPinnedLoupeHandle));

  if (shouldShow && stage && cropBox) {
    const loupeRect = loupe.getBoundingClientRect();
    const loupeSize = loupeRect.width || 132;
    const zoom = 2.4;
    const imageRect = livlyCropRenderedImageRect(stage);
    const cropRect = cropBox.getBoundingClientRect();
    const focalPoint = livlyCropHandleScreenPoint(cropRect, handle);

    image.style.cssText = `
      width:${imageRect.width * zoom}px;
      height:${imageRect.height * zoom}px;
      left:${loupeSize / 2 - (focalPoint.x - imageRect.left) * zoom}px;
      top:${loupeSize / 2 - (focalPoint.y - imageRect.top) * zoom}px;
    `;

    if (frame) {
      frame.style.cssText = `
        left:${loupeSize / 2 + (cropRect.left - focalPoint.x) * zoom}px;
        top:${loupeSize / 2 + (cropRect.top - focalPoint.y) * zoom}px;
        width:${cropRect.width * zoom}px;
        height:${cropRect.height * zoom}px;
      `;
    }
  } else {
    image.style.cssText = livlyCropLoupeImageStyleText(livlyCropState, handle);

    if (frame) {
      frame.style.cssText = livlyCropLoupeFrameStyleText(livlyCropState, handle);
    }
  }

  applyLivlyCropLoupePosition(loupe);
}

function clampLivlyCropLoupePosition(position, loupe) {
  const margin = 10;
  const width = loupe.offsetWidth || 132;
  const height = loupe.offsetHeight || 132;
  const maxX = Math.max(margin, window.innerWidth - width - margin);
  const maxY = Math.max(margin, window.innerHeight - height - margin);

  return {
    x: Math.min(Math.max(position.x, margin), maxX),
    y: Math.min(Math.max(position.y, margin), maxY)
  };
}

function applyLivlyCropLoupePosition(loupe = contentArea.querySelector("[data-livly-crop-loupe]")) {
  if (!loupe) {
    return;
  }

  if (!livlyCropLoupePosition) {
    loupe.style.left = "";
    loupe.style.top = "";
    loupe.style.right = "";
    loupe.style.bottom = "";
    return;
  }

  livlyCropLoupePosition = clampLivlyCropLoupePosition(livlyCropLoupePosition, loupe);
  loupe.style.left = `${livlyCropLoupePosition.x}px`;
  loupe.style.top = `${livlyCropLoupePosition.y}px`;
  loupe.style.right = "auto";
  loupe.style.bottom = "auto";
}

function toggleLivlyCropPinnedLoupe(handle) {
  if (!["nw", "ne", "sw", "se"].includes(handle)) {
    return;
  }

  livlyCropPinnedLoupeHandle = livlyCropPinnedLoupeHandle === handle ? null : handle;
  updateLivlyCropPinnedUi();
  updateLivlyCropLoupe();
}

function updateLivlyCropPinnedUi() {
  contentArea.querySelectorAll("[data-livly-crop-handle]").forEach(handle => {
    handle.classList.toggle("is-pinned", handle.dataset.livlyCropHandle === livlyCropPinnedLoupeHandle);
  });

  const loupe = contentArea.querySelector("[data-livly-crop-loupe]");

  if (loupe) {
    loupe.classList.toggle("is-pinned", Boolean(livlyCropPinnedLoupeHandle));
  }
}

function clearLivlyCropPinPressTimer() {
  clearTimeout(livlyCropPinPressTimer);
  livlyCropPinPressTimer = null;
}

function startLivlyCropLoupeDrag(event) {
  const loupe = event.target.closest("[data-livly-crop-loupe]");

  if (
    !loupe ||
    !livlyCropState ||
    !isCropRoute() ||
    !editMode ||
    event.button !== 0 ||
    !loupe.classList.contains("is-visible")
  ) {
    return;
  }

  const rect = loupe.getBoundingClientRect();
  livlyCropLoupePosition = clampLivlyCropLoupePosition({ x: rect.left, y: rect.top }, loupe);
  livlyCropLoupeDragState = {
    loupe,
    pointerId: event.pointerId,
    startClientX: event.clientX,
    startClientY: event.clientY,
    startX: livlyCropLoupePosition.x,
    startY: livlyCropLoupePosition.y
  };

  loupe.setPointerCapture?.(event.pointerId);
  loupe.classList.add("is-dragging");
  event.preventDefault();
}

function moveLivlyCropLoupeDrag(event) {
  if (!livlyCropLoupeDragState || livlyCropLoupeDragState.pointerId !== event.pointerId) {
    return;
  }

  livlyCropLoupePosition = clampLivlyCropLoupePosition({
    x: livlyCropLoupeDragState.startX + event.clientX - livlyCropLoupeDragState.startClientX,
    y: livlyCropLoupeDragState.startY + event.clientY - livlyCropLoupeDragState.startClientY
  }, livlyCropLoupeDragState.loupe);

  applyLivlyCropLoupePosition(livlyCropLoupeDragState.loupe);
  event.preventDefault();
}

function finishLivlyCropLoupeDrag(event) {
  if (!livlyCropLoupeDragState || livlyCropLoupeDragState.pointerId !== event.pointerId) {
    return;
  }

  livlyCropLoupeDragState.loupe.releasePointerCapture?.(event.pointerId);
  livlyCropLoupeDragState.loupe.classList.remove("is-dragging");
  livlyCropLoupeDragState = null;
}

function livlyCropRenderedImageRect(stage) {
  const stageRect = stage.getBoundingClientRect();
  const scale = Math.min(
    stageRect.width / livlyCropState.naturalWidth,
    stageRect.height / livlyCropState.naturalHeight
  );
  const width = livlyCropState.naturalWidth * scale;
  const height = livlyCropState.naturalHeight * scale;

  return {
    left: stageRect.left + (stageRect.width - width) / 2,
    top: stageRect.top + (stageRect.height - height) / 2,
    width,
    height
  };
}

function livlyCropHandleScreenPoint(cropRect, handle) {
  const points = {
    nw: { x: cropRect.left, y: cropRect.top },
    ne: { x: cropRect.right, y: cropRect.top },
    sw: { x: cropRect.left, y: cropRect.bottom },
    se: { x: cropRect.right, y: cropRect.bottom }
  };

  return points[handle] || {
    x: cropRect.left + cropRect.width / 2,
    y: cropRect.top + cropRect.height / 2
  };
}

function updateLivlyCropInput(input) {
  if (!livlyCropState) {
    return;
  }

  const field = input.dataset.livlyCropField;
  livlyCropState[field] = Number(input.value) || 0;
  clampLivlyCropState();
  renderView();
}

function startLivlyCropDrag(event) {
  const cropBox = event.target.closest("[data-livly-crop-box]");

  if (!cropBox || !livlyCropState || !isCropRoute() || !editMode || event.button !== 0) {
    return;
  }

  const stage = cropBox.closest("[data-livly-crop-stage]");
  const handle = event.target.closest("[data-livly-crop-handle]")?.dataset.livlyCropHandle || "move";

  livlyCropDragState = {
    cropBox,
    handle,
    hasMoved: false,
    maxSize: Math.max(livlyCropState.naturalWidth, livlyCropState.naturalHeight),
    pointerId: event.pointerId,
    scale: livlyCropStageScale(stage),
    startClientX: event.clientX,
    startClientY: event.clientY,
    startSize: livlyCropState.size,
    startX: livlyCropState.x,
    startY: livlyCropState.y
  };

  cropBox.setPointerCapture?.(event.pointerId);
  cropBox.classList.add("is-dragging");
  updateLivlyCropLoupe(event);

  if (handle !== "move") {
    clearLivlyCropPinPressTimer();
    livlyCropPinPressTimer = setTimeout(() => {
      if (livlyCropDragState && livlyCropDragState.pointerId === event.pointerId && !livlyCropDragState.hasMoved) {
        toggleLivlyCropPinnedLoupe(handle);
      }
    }, 620);
  }

  event.preventDefault();
}

function moveLivlyCropDrag(event) {
  if (!livlyCropDragState || livlyCropDragState.pointerId !== event.pointerId || !livlyCropState) {
    return;
  }

  const scale = livlyCropDragState.scale || 1;
  const deltaX = (event.clientX - livlyCropDragState.startClientX) / scale;
  const deltaY = (event.clientY - livlyCropDragState.startClientY) / scale;

  if (Math.hypot(event.clientX - livlyCropDragState.startClientX, event.clientY - livlyCropDragState.startClientY) > 8) {
    livlyCropDragState.hasMoved = true;
    clearLivlyCropPinPressTimer();
  }

  if (livlyCropDragState.handle === "move") {
    livlyCropState.x = Math.round(livlyCropDragState.startX + deltaX);
    livlyCropState.y = Math.round(livlyCropDragState.startY + deltaY);
  } else {
    resizeLivlyCropBox(deltaX, deltaY);
  }

  clampLivlyCropState();
  updateLivlyCropBoxElement();
  updateLivlyCropLoupe(event);
  event.preventDefault();
}

function resizeLivlyCropBox(deltaX, deltaY) {
  const handle = livlyCropDragState.handle;
  const minSize = Math.max(16, Math.round(livlyCropDragState.maxSize * 0.15));
  let nextSize = livlyCropDragState.startSize;
  let nextX = livlyCropDragState.startX;
  let nextY = livlyCropDragState.startY;

  if (handle === "se") {
    nextSize = livlyCropDragState.startSize + Math.max(deltaX, deltaY);
  }

  if (handle === "nw") {
    nextSize = livlyCropDragState.startSize + Math.max(-deltaX, -deltaY);
    nextX = livlyCropDragState.startX + livlyCropDragState.startSize - nextSize;
    nextY = livlyCropDragState.startY + livlyCropDragState.startSize - nextSize;
  }

  if (handle === "ne") {
    nextSize = livlyCropDragState.startSize + Math.max(deltaX, -deltaY);
    nextY = livlyCropDragState.startY + livlyCropDragState.startSize - nextSize;
  }

  if (handle === "sw") {
    nextSize = livlyCropDragState.startSize + Math.max(-deltaX, deltaY);
    nextX = livlyCropDragState.startX + livlyCropDragState.startSize - nextSize;
  }

  const clampedSize = Math.round(Math.min(Math.max(nextSize, minSize), livlyCropDragState.maxSize));

  if (handle === "nw") {
    nextX = livlyCropDragState.startX + livlyCropDragState.startSize - clampedSize;
    nextY = livlyCropDragState.startY + livlyCropDragState.startSize - clampedSize;
  }

  if (handle === "ne") {
    nextX = livlyCropDragState.startX;
    nextY = livlyCropDragState.startY + livlyCropDragState.startSize - clampedSize;
  }

  if (handle === "sw") {
    nextX = livlyCropDragState.startX + livlyCropDragState.startSize - clampedSize;
    nextY = livlyCropDragState.startY;
  }

  livlyCropState.size = clampedSize;
  livlyCropState.x = Math.round(nextX);
  livlyCropState.y = Math.round(nextY);
}

function finishLivlyCropDrag(event) {
  if (!livlyCropDragState || livlyCropDragState.pointerId !== event.pointerId) {
    return;
  }

  livlyCropDragState.cropBox.releasePointerCapture?.(event.pointerId);
  livlyCropDragState.cropBox.classList.remove("is-dragging");
  livlyCropDragState = null;
  clearLivlyCropPinPressTimer();
  updateLivlyCropLoupe();
}

async function applyLivlyCrop(button) {
  const target = findImageCropTargetByRow(button);
  const item = target?.item;
  const activeType = livlyCropState?.itemType || "livly";

  if (!item || !livlyCropState || livlyCropState.itemId !== item.id || activeType !== target.type) {
    return;
  }

  if (livlyCropState.batch?.items?.length) {
    await applyCropToBatch(livlyCropState);
  } else {
    item.imageUrl = await cropImageDataUrl({
      dataUrl: livlyCropState.dataUrl,
      naturalWidth: livlyCropState.naturalWidth,
      naturalHeight: livlyCropState.naturalHeight,
      fillColor: livlyCropState.fillColor
    }, livlyCropState);
  }

  saveCropPreset(livlyCropState);
  resetLivlyCropState();
  updateEditSaveButtonState();
  renderView();
}

async function applyCropToBatch(cropState, cropSource = cropState) {
  const collection = cropState.itemType === "material" ? appData.materials : appData.livlies;

  for (const batchItem of cropState.batch.items) {
    const item = collection.find(entry => entry.id === batchItem.itemId);

    if (!item) {
      continue;
    }

    item.imageUrl = await cropImageDataUrl(batchItem.imageInfo, cropSource);
  }
}

async function applyLivlyCropPreset() {
  if (!livlyCropState?.batch?.items?.length) {
    return;
  }

  const preset = cropPresetForState(livlyCropState);

  if (!preset) {
    return;
  }

  const presetState = {
    ...livlyCropState,
    x: Math.round(Number(preset.xRatio) * livlyCropState.naturalWidth),
    y: Math.round(Number(preset.yRatio) * livlyCropState.naturalHeight),
    size: Math.round(Number(preset.sizeRatio) * livlyCropState.naturalWidth)
  };

  await applyCropToBatch(livlyCropState, presetState);
  saveCropPreset(presetState);
  resetLivlyCropState();
  updateEditSaveButtonState();
  renderView();
}

function replayLivlyCrop() {
  const preset = cropPresetForState(livlyCropState);

  if (!preset || !applyCropPresetToState(preset, livlyCropState)) {
    return;
  }

  renderView();
}

function removePendingCropBatchItems() {
  const batch = livlyCropState?.batch;

  if (!batch?.createdItemIds?.length) {
    return;
  }

  if (batch.itemType === "material") {
    appData.materials = appData.materials.filter(item => !batch.createdItemIds.includes(item.id));
    if (batch.createdItemIds.includes(openMaterialId)) {
      openMaterialId = null;
    }
    return;
  }

  appData.livlies = appData.livlies.filter(item => !batch.createdItemIds.includes(item.id));
  if (batch.createdItemIds.includes(openLivlyId)) {
    openLivlyId = null;
  }
  if (batch.createdItemIds.includes(livlyEditPanel?.livlyId)) {
    livlyEditPanel = null;
    livlyPanelDragState = null;
  }
}

function cancelLivlyCrop() {
  removePendingCropBatchItems();
  resetLivlyCropState();
  renderView();
}

function updateLivlyField(input) {
  const item = findLivlyByRow(input);

  if (!item || !input.dataset.livlyField) {
    return;
  }

  if (["fullness"].includes(input.dataset.livlyField)) {
    const cleanValue = cleanNumberLikeInput(input.value);
    input.value = cleanValue;
    item[input.dataset.livlyField] = cleanValue;
    updateEditSaveButtonState();
    return;
  }

  item[input.dataset.livlyField] = input.value;
  updateEditSaveButtonState();
}

function updateLivlyLevelField(input) {
  const item = findLivlyByRow(input);
  const field = input.dataset.livlyLevelField;
  const rowElement = input.closest(".livly-level-row");
  const row = item && rowElement ? item[field].find(levelRow => levelRow.id === rowElement.dataset.rowId) : null;

  if (!row) {
    return;
  }

  const cleanValue = cleanNumberLikeInput(input.value);
  input.value = cleanValue;
  row[input.dataset.levelProperty] = cleanValue;
  if (input.dataset.levelProperty === "level") {
    sortLivlyLevelRowsInPlace(item[field]);
  }
  updateEditSaveButtonState();
}

function addLivlyLevelRow(button) {
  const item = findLivlyByRow(button);
  const field = button.dataset.levelField;
  const prefix = button.dataset.levelPrefix || "level";

  if (!item || !item[field]) {
    return;
  }

  item[field].push({
    id: createId(prefix),
    level: nextLivlyLevelValue(item[field]),
    value: ""
  });
  sortLivlyLevelRowsInPlace(item[field]);
  renderView();
}

function deleteLivlyLevelRow(button) {
  const item = findLivlyByRow(button);
  const field = button.dataset.levelField;
  const row = button.closest(".livly-level-row");

  if (!item || !item[field] || !row) {
    return;
  }

  item[field] = item[field].filter(levelRow => levelRow.id !== row.dataset.rowId);

  if (!item[field].length) {
    item[field].push({ id: createId(field), level: "1", value: "" });
  }

  sortLivlyLevelRowsInPlace(item[field]);
  renderView();
}

function findLivlyDdRow(element) {
  const item = findLivlyByRow(element);
  const rowElement = element.closest(".livly-dd-row");
  const row = item && rowElement
    ? item.ddEmissions.find(ddRow => ddRow.id === rowElement.dataset.rowId)
    : null;

  return { item, row };
}

function updateLivlyDdLevel(input) {
  const { item, row } = findLivlyDdRow(input);

  if (!item || !row) {
    return;
  }

  const cleanValue = cleanNumberLikeInput(input.value);
  input.value = cleanValue;
  row.level = cleanValue;
  sortLivlyLevelRowsInPlace(item.ddEmissions);
  updateEditSaveButtonState();
}

function addLivlyDdRow(button) {
  const item = findLivlyByRow(button);

  if (!item) {
    return;
  }

  item.ddEmissions.push({
    id: createId("dd-emission"),
    level: nextLivlyLevelValue(item.ddEmissions),
    blackCount: "0",
    whiteCount: "0"
  });
  sortLivlyLevelRowsInPlace(item.ddEmissions);
  renderView();
}

function deleteLivlyDdRow(button) {
  const item = findLivlyByRow(button);
  const row = button.closest(".livly-dd-row");

  if (!item || !row) {
    return;
  }

  item.ddEmissions = item.ddEmissions.filter(ddRow => ddRow.id !== row.dataset.rowId);

  if (!item.ddEmissions.length) {
    item.ddEmissions.push({ id: createId("dd-emission"), level: "1", blackCount: "0", whiteCount: "0" });
  }

  sortLivlyLevelRowsInPlace(item.ddEmissions);
  renderView();
}

function closeDdSymbolMenus() {
  contentArea.querySelectorAll(".dd-symbol-menu").forEach(menu => {
    menu.hidden = true;
  });
}

function toggleDdSymbolMenu(button) {
  const menu = button.parentElement.querySelector(".dd-symbol-menu");
  const willOpen = menu ? menu.hidden : false;

  closeDdSymbolMenus();

  if (menu) {
    menu.hidden = !willOpen;
  }
}

function addDdSymbol(button) {
  const { row } = findLivlyDdRow(button);

  if (!row) {
    return;
  }

  if (button.dataset.ddSymbol === "black") {
    row.blackCount = String((Number(row.blackCount) || 0) + 1);
  }

  if (button.dataset.ddSymbol === "white") {
    row.whiteCount = String((Number(row.whiteCount) || 0) + 1);
  }

  renderView();
}

function updateDdSymbol(button) {
  const { row } = findLivlyDdRow(button);
  const symbolButton = button.closest(".livly-dd-symbol-wrap").querySelector(".livly-dd-symbol");
  const currentType = symbolButton ? symbolButton.dataset.symbolType : "";
  const nextType = button.dataset.ddSymbol;

  if (!row || !currentType || !nextType || currentType === nextType) {
    closeDdSymbolMenus();
    return;
  }

  if (currentType === "black") {
    row.blackCount = String(Math.max(0, (Number(row.blackCount) || 0) - 1));
  }

  if (currentType === "white") {
    row.whiteCount = String(Math.max(0, (Number(row.whiteCount) || 0) - 1));
  }

  if (nextType === "black") {
    row.blackCount = String((Number(row.blackCount) || 0) + 1);
  }

  if (nextType === "white") {
    row.whiteCount = String((Number(row.whiteCount) || 0) + 1);
  }

  renderView();
}

function deleteDdSymbolWithConfirm(symbolButton) {
  const { row } = findLivlyDdRow(symbolButton);
  const currentType = symbolButton.dataset.symbolType;
  const mark = currentType === "black" ? "⚫︎" : "⚪︎";

  if (!row || !currentType) {
    return false;
  }

  if (!confirm(`${mark}を削除していいですか？`)) {
    return false;
  }

  if (currentType === "black") {
    row.blackCount = String(Math.max(0, (Number(row.blackCount) || 0) - 1));
  }

  if (currentType === "white") {
    row.whiteCount = String(Math.max(0, (Number(row.whiteCount) || 0) - 1));
  }

  renderView();
  return true;
}

function setLivlyUnset(button) {
  const item = findLivlyByRow(button);
  const field = button.dataset.livlyField;

  if (!item || !field) {
    return;
  }

  item[field] = [];
  renderView();
}

function toggleLivlyChoice(button) {
  const item = findLivlyByRow(button);
  const field = button.dataset.livlyField;
  const value = button.dataset.choiceValue;

  if (!item || !field || !value) {
    return;
  }

  if (!Array.isArray(item[field])) {
    item[field] = [];
  }

  if (item[field].includes(value)) {
    item[field] = item[field].filter(selected => selected !== value);
  } else {
    item[field].push(value);
  }

  renderView();
}

function addLivlyOption(button) {
  const optionSet = button.dataset.optionSet;
  const label = prompt("追加する項目名を入力してください。");
  const value = label ? label.trim() : "";

  if (!optionSet || !value || !appData.livlyOptionSets[optionSet].includes(value)) {
    if (optionSet && value) {
      appData.livlyOptionSets[optionSet].push(value);
      renderView();
    }
    return;
  }
}

function removeLivlyOption(button) {
  const optionSet = button.dataset.optionSet;
  const value = button.dataset.choiceValue;

  if (!optionSet || !value) {
    return;
  }

  appData.livlyOptionSets[optionSet] = appData.livlyOptionSets[optionSet].filter(option => option !== value);
  appData.livlies.forEach(item => {
    if (optionSet === "movementTypes") {
      item.movementTypes = item.movementTypes.filter(selected => selected !== value);
    }

    if (optionSet === "movementPowers") {
      item.movementPowers = item.movementPowers.filter(selected => selected !== value);
    }
  });
  renderView();
}

function removeLivlyOptionWithConfirm(button) {
  const value = button.dataset.choiceValue;

  if (!value) {
    return false;
  }

  if (!confirm(`${value}を項目から削除していいですか？`)) {
    return false;
  }

  removeLivlyOption(button);
  return true;
}

function findLivlyRemovableTarget(target) {
  const option = target.closest(".livly-removable-option");

  if (option && activeRoute === "livlies" && editMode) {
    return { type: "option", element: option };
  }

  const ddSymbol = target.closest(".livly-dd-symbol");

  if (ddSymbol && activeRoute === "livlies" && editMode) {
    return { type: "dd-symbol", element: ddSymbol };
  }

  return null;
}

function deleteLivlyRemovableTarget(removableTarget) {
  if (!removableTarget) {
    return false;
  }

  if (removableTarget.type === "option") {
    return removeLivlyOptionWithConfirm(removableTarget.element);
  }

  if (removableTarget.type === "dd-symbol") {
    return deleteDdSymbolWithConfirm(removableTarget.element);
  }

  return false;
}

function clearLivlyDeletePressTimer() {
  clearTimeout(livlyDeletePressTimer);
  livlyDeletePressTimer = null;
  livlyDeletePressTarget = null;
}

function saveLivlyEdits() {
  appData = saveAppData(appData);
  commitLivlyEditSession();
  renderView();

  const button = document.querySelector('[data-action="save-livlies"]');

  if (!button) {
    return;
  }

  button.textContent = "保存しました";
  button.classList.add("is-saved");

  setTimeout(() => {
    const currentButton = document.querySelector('[data-action="save-livlies"]');

    if (currentButton) {
      currentButton.textContent = "編集内容を保存";
      currentButton.classList.remove("is-saved");
    }
  }, 1200);
}

function addInlineMaterial() {
  const item = createNewItem();
  const anchor = materialNamePanelAnchorFromEvent(null, null);

  appData.materials.push(item);
  openMaterialId = item.id;
  materialNameEditPanel = { materialId: item.id, x: anchor.x, y: anchor.y };
  closeTouchInfo();
  renderView();

  requestAnimationFrame(() => {
    const nameInput = contentArea.querySelector(`[data-id="${item.id}"] [data-material-name-panel] [data-material-field="name"]`);

    if (nameInput) {
      nameInput.focus();
    }
  });
}

function updateMaterialField(input) {
  const card = input.closest("[data-id]");
  const item = card ? appData.materials.find(material => material.id === card.dataset.id) : null;

  if (!item || !input.dataset.materialField) {
    return;
  }

  item[input.dataset.materialField] = input.value;

  if (input.dataset.materialField === "name") {
    const title = input.value || "素材名";
    const titleText = card.querySelector("[data-material-fit-text]");
    const titleButton = card.querySelector('[data-action="open-material-name-panel"]');

    if (titleText) {
      titleText.textContent = title;
    }

    if (titleButton) {
      titleButton.setAttribute("aria-label", `${title}の名前を編集`);
    }

    scheduleMaterialHeaderFit();
    scheduleMaterialNameEditPanel();
  }

  updateEditSaveButtonState();
}

function updateMaterialTags(input) {
  const card = input.closest("[data-id]");
  const item = card ? appData.materials.find(material => material.id === card.dataset.id) : null;

  if (!item) {
    return;
  }

  const selectedTags = cleanMaterialTags([input.value]);

  item.tags = selectedTags.length ? selectedTags : ["その他"];

  if (!materialAllowsSeries(item.tags)) {
    item.seriesTags = [];
  }

  updateEditSaveButtonState();
  renderView();
}

function updateMaterialSeriesTags(input) {
  const card = input.closest("[data-id]");
  const item = card ? appData.materials.find(material => material.id === card.dataset.id) : null;

  if (!item) {
    return;
  }

  if (!materialAllowsSeries(item.tags)) {
    item.seriesTags = [];
    updateEditSaveButtonState();
    renderView();
    return;
  }

  item.seriesTags = cleanMaterialSeriesTags([input.value], true);
  updateEditSaveButtonState();
  renderView();
}

function setMaterialVisibleTag(tag) {
  if (tag && !materialTagOptions.includes(tag)) {
    return;
  }

  materialVisibleTags = tag ? [tag] : [];

  if (!isMaterialSeriesFilterAvailable()) {
    materialVisibleSeriesTags = [];
    saveMaterialVisibleSeriesTags();
  }

  saveMaterialVisibleTags();
  closeTouchInfo();
  renderView();
}

function setMaterialVisibleSeriesTag(tag) {
  if (tag && !appData.materialSeriesTags.includes(tag)) {
    return;
  }

  if (tag && !isMaterialSeriesFilterAvailable()) {
    return;
  }

  materialVisibleSeriesTags = tag ? [tag] : [];
  saveMaterialVisibleSeriesTags();
  closeTouchInfo();
  renderView();
}

function saveMaterialSeriesPanel() {
  if (!materialSeriesEditPanel) {
    return;
  }

  const input = contentArea.querySelector("[data-material-series-panel-input]");

  if (!input) {
    return;
  }

  const name = input.value.trim();

  if (!name) {
    input.focus();
    return;
  }

  const oldName = materialSeriesEditPanel.name;
  const isEdit = materialSeriesEditPanel.mode === "edit";
  const isDuplicate = appData.materialSeriesTags.some(tag => tag === name && tag !== oldName);

  if (isDuplicate) {
    input.focus();
    input.select();
    return;
  }

  if (isEdit) {
    if (!appData.materialSeriesTags.includes(oldName)) {
      materialSeriesEditPanel = null;
      renderView();
      return;
    }

    appData.materialSeriesTags = appData.materialSeriesTags.map(tag => tag === oldName ? name : tag);
    appData.materials.forEach(material => {
      material.seriesTags = itemMaterialSeriesTags(material).map(tag => tag === oldName ? name : tag);
    });
    materialVisibleSeriesTags = materialVisibleSeriesTags.map(tag => tag === oldName ? name : tag);
  } else {
    appData.materialSeriesTags.push(name);
  }

  materialSeriesEditPanel = null;
  saveMaterialVisibleSeriesTags();
  updateEditSaveButtonState();
  renderView();
}

function deleteMaterialSeries(seriesName) {
  if (!appData.materialSeriesTags.includes(seriesName)) {
    return;
  }

  if (!confirm(`${seriesName}を削除していいですか？`)) {
    return;
  }

  appData.materialSeriesTags = appData.materialSeriesTags.filter(tag => tag !== seriesName);
  appData.materials.forEach(material => {
    material.seriesTags = itemMaterialSeriesTags(material).filter(tag => tag !== seriesName);
  });
  materialVisibleSeriesTags = materialVisibleSeriesTags.filter(tag => tag !== seriesName);
  if (materialSeriesEditPanel && materialSeriesEditPanel.name === seriesName) {
    materialSeriesEditPanel = null;
  }
  saveMaterialVisibleSeriesTags();
  updateEditSaveButtonState();
  renderView();
}

function startMaterialFilterDrag(event) {
  if (activeRoute !== "materials" || event.button !== 0) {
    return;
  }

  const scroller = event.target.closest("[data-material-chip-scroller]");

  if (!scroller) {
    return;
  }

  materialFilterDragState = {
    scroller,
    pointerId: event.pointerId,
    startX: event.clientX,
    startY: event.clientY,
    scrollLeft: scroller.scrollLeft,
    moved: false
  };
  scroller.setPointerCapture?.(event.pointerId);
}

function moveMaterialFilterDrag(event) {
  if (!materialFilterDragState || materialFilterDragState.pointerId !== event.pointerId) {
    return;
  }

  const deltaX = event.clientX - materialFilterDragState.startX;
  const deltaY = event.clientY - materialFilterDragState.startY;
  const absX = Math.abs(deltaX);
  const absY = Math.abs(deltaY);
  const isHorizontalDrag = absX > 12 && absX > absY * 1.2;

  if (!materialFilterDragState.moved && isHorizontalDrag) {
    materialFilterDragState.moved = true;
    materialFilterDragState.scroller.classList.add("is-dragging");
  }

  if (!materialFilterDragState.moved) {
    return;
  }

  materialFilterDragState.scroller.scrollLeft = materialFilterDragState.scrollLeft - deltaX;
  event.preventDefault();
}

function finishMaterialFilterDrag(event) {
  if (!materialFilterDragState || materialFilterDragState.pointerId !== event.pointerId) {
    return;
  }

  if (materialFilterDragState.moved) {
    suppressNextMaterialFilterClick = true;
  }

  materialFilterDragState.scroller.classList.remove("is-dragging");
  materialFilterDragState.scroller.releasePointerCapture?.(event.pointerId);
  materialFilterDragState = null;
}

function deleteMaterial(itemId) {
  const item = appData.materials.find(material => material.id === itemId);

  if (!item) {
    return;
  }

  const name = item.name || "この素材";

  if (!confirm(`${name}を削除していいですか？`)) {
    return;
  }

  appData.materials = appData.materials.filter(material => material.id !== itemId);
  if (openMaterialId === itemId) {
    openMaterialId = null;
  }
  renderView();
}

function saveMaterialEdits() {
  appData = saveAppData(appData);
  commitMaterialEditSession();
  renderView();

  const button = document.querySelector('[data-action="save-materials"]');

  if (!button) {
    return;
  }

  button.textContent = "保存しました";
  button.classList.add("is-saved");

  setTimeout(() => {
    const currentButton = document.querySelector('[data-action="save-materials"]');

    if (currentButton) {
      currentButton.textContent = "編集内容を保存";
      currentButton.classList.remove("is-saved");
    }
  }, 1200);
}

function addInlinePersonality() {
  const item = createNewItem();

  appData.personalities.push(item);
  closeTouchInfo();
  renderView();

  requestAnimationFrame(() => {
    const newNameInput = contentArea.querySelector(`[data-id="${item.id}"] [data-personality-field="name"]`);

    if (newNameInput) {
      newNameInput.focus();
    }
  });
}

function deletePersonality(itemId) {
  const item = appData.personalities.find(personality => personality.id === itemId);

  if (!item) {
    return;
  }

  const name = item.name || "この個性";

  if (!confirm(`${name}を削除していいですか？`)) {
    return;
  }

  appData.personalities = appData.personalities.filter(personality => personality.id !== itemId);
  closeTouchInfo();
  renderView();
}

function updatePersonalityField(input) {
  const row = input.closest(".personality-row");
  const item = row ? appData.personalities.find(personality => personality.id === row.dataset.id) : null;

  if (!item || !input.dataset.personalityField) {
    return;
  }

  if (input.dataset.personalityField === "modificationRate") {
    const cleanValue = cleanPercentageNumber(input.value);

    if (input.value !== cleanValue) {
      input.value = cleanValue;
    }

    item.modificationRate = percentageStorageValue(cleanValue);
    schedulePersonalityRateFormat(input);
    updateEditSaveButtonState();
    return;
  }

  item[input.dataset.personalityField] = input.value;
  updateEditSaveButtonState();
}

function formatPersonalityRateInput(input) {
  const row = input.closest(".personality-row");
  const item = row ? appData.personalities.find(personality => personality.id === row.dataset.id) : null;
  const formattedValue = formatPercentageNumber(input.value);

  input.value = formattedValue;

  if (item) {
    item.modificationRate = percentageStorageValue(formattedValue);
  }

  updateEditSaveButtonState();
}

function schedulePersonalityRateFormat(input) {
  clearTimeout(personalityRateFormatTimer);

  personalityRateFormatTimer = setTimeout(() => {
    if (input.isConnected && editMode && activeRoute === "personalities") {
      formatPersonalityRateInput(input);
    }

    personalityRateFormatTimer = null;
  }, 900);
}

function handlePersonalityRateCommit(event) {
  const input = event.target.closest('[data-personality-field="modificationRate"]');

  if (input && editMode && activeRoute === "personalities") {
    clearTimeout(personalityRateFormatTimer);
    formatPersonalityRateInput(input);
  }
}

function normalizePersonalityPercentages() {
  appData.personalities.forEach(item => {
    item.modificationRate = percentageStorageValue(item.modificationRate);
  });
}

function savePersonalityEdits() {
  normalizePersonalityPercentages();
  appData = saveAppData(appData);
  commitPersonalityEditSession();
  renderView();

  const button = document.querySelector('[data-action="save-personalities"]');

  if (!button) {
    return;
  }

  button.textContent = "保存しました";
  button.classList.add("is-saved");

  setTimeout(() => {
    const currentButton = document.querySelector('[data-action="save-personalities"]');

    if (currentButton) {
      currentButton.textContent = "編集内容を保存";
      currentButton.classList.remove("is-saved");
    }
  }, 1200);
}

function getPersonalityDragAfterElement(list, y) {
  const rows = Array.from(list.querySelectorAll(".personality-row:not(.is-dragging)"));

  return rows.reduce((closest, row) => {
    const rect = row.getBoundingClientRect();
    const offset = y - rect.top - rect.height / 2;

    if (offset < 0 && offset > closest.offset) {
      return { offset, element: row };
    }

    return closest;
  }, { offset: Number.NEGATIVE_INFINITY, element: null }).element;
}

function animatePersonalityRows(list, moveRows) {
  const oldPositions = new Map(
    Array.from(list.querySelectorAll(".personality-row")).map(row => [row.dataset.id, row.getBoundingClientRect()])
  );

  moveRows();

  Array.from(list.querySelectorAll(".personality-row")).forEach(row => {
    if (row.classList.contains("is-dragging") || typeof row.animate !== "function") {
      return;
    }

    const oldPosition = oldPositions.get(row.dataset.id);

    if (!oldPosition) {
      return;
    }

    const newPosition = row.getBoundingClientRect();
    const deltaY = oldPosition.top - newPosition.top;

    if (!deltaY) {
      return;
    }

    if (typeof row.getAnimations === "function") {
      row.getAnimations().forEach(animation => animation.cancel());
    }

    row.animate(
      [
        { transform: `translateY(${deltaY}px)` },
        { transform: "translateY(0)" }
      ],
      {
        duration: 170,
        easing: "cubic-bezier(0.2, 0.8, 0.2, 1)"
      }
    );
  });
}

function syncPersonalitiesFromDom(list) {
  const currentItems = new Map(appData.personalities.map(item => [item.id, item]));
  const orderedIds = Array.from(list.querySelectorAll(".personality-row")).map(row => row.dataset.id);
  appData.personalities = orderedIds.map(id => currentItems.get(id)).filter(Boolean);
}

function reorderPersonalityDrag(clientY) {
  if (!personalityDragState) {
    return;
  }

  const { list, row } = personalityDragState;
  const afterElement = getPersonalityDragAfterElement(list, clientY);

  if (afterElement === row || afterElement === row.nextElementSibling) {
    return;
  }

  animatePersonalityRows(list, () => {
    if (afterElement) {
      list.insertBefore(row, afterElement);
    } else {
      list.appendChild(row);
    }
  });
}

function stopPersonalityAutoScroll() {
  if (!personalityDragState) {
    return;
  }

  personalityDragState.autoScrollSpeed = 0;

  if (personalityDragState.autoScrollFrame) {
    cancelAnimationFrame(personalityDragState.autoScrollFrame);
    personalityDragState.autoScrollFrame = null;
  }
}

function runPersonalityAutoScroll() {
  if (!personalityDragState) {
    return;
  }

  const speed = personalityDragState.autoScrollSpeed;

  if (!speed) {
    personalityDragState.autoScrollFrame = null;
    return;
  }

  window.scrollBy(0, speed);
  reorderPersonalityDrag(personalityDragState.lastClientY);
  personalityDragState.autoScrollFrame = requestAnimationFrame(runPersonalityAutoScroll);
}

function updatePersonalityAutoScroll(clientY) {
  if (!personalityDragState) {
    return;
  }

  const edgeSize = 84;
  const maxSpeed = 18;
  let speed = 0;

  if (clientY < edgeSize) {
    speed = -Math.ceil(((edgeSize - clientY) / edgeSize) * maxSpeed);
  } else if (clientY > window.innerHeight - edgeSize) {
    speed = Math.ceil(((clientY - (window.innerHeight - edgeSize)) / edgeSize) * maxSpeed);
  }

  personalityDragState.autoScrollSpeed = speed;

  if (speed && !personalityDragState.autoScrollFrame) {
    personalityDragState.autoScrollFrame = requestAnimationFrame(runPersonalityAutoScroll);
  }
}

function startPersonalityDrag(event) {
  const handle = event.target.closest('[data-action="drag-personality"]');

  if (!handle || !editMode || activeRoute !== "personalities") {
    return;
  }

  const row = handle.closest(".personality-row");
  const list = row ? row.closest(".personality-list") : null;

  if (!row || !list) {
    return;
  }

  personalityDragState = {
    autoScrollFrame: null,
    autoScrollSpeed: 0,
    handle,
    lastClientY: event.clientY,
    list,
    pointerId: event.pointerId,
    row
  };

  handle.setPointerCapture?.(event.pointerId);
  handle.classList.add("is-grabbing");
  row.classList.add("is-dragging");
  list.classList.add("is-sorting");
  setInfoPanelDragSuppressed(true);
  event.preventDefault();
}

function movePersonalityDrag(event) {
  if (!personalityDragState || event.pointerId !== personalityDragState.pointerId) {
    return;
  }

  personalityDragState.lastClientY = event.clientY;
  updatePersonalityAutoScroll(event.clientY);
  reorderPersonalityDrag(event.clientY);

  event.preventDefault();
}

function finishPersonalityDrag(event) {
  if (!personalityDragState || event.pointerId !== personalityDragState.pointerId) {
    return;
  }

  const { handle, list, row } = personalityDragState;

  stopPersonalityAutoScroll();
  syncPersonalitiesFromDom(list);
  handle.releasePointerCapture?.(event.pointerId);
  handle.classList.remove("is-grabbing");
  row.classList.remove("is-dragging");
  list.classList.remove("is-sorting");
  personalityDragState = null;
  renderView();
}

function openEditor(itemId) {
  if (!isListRoute()) {
    return;
  }

  editingItemId = itemId;
  const item = itemId ? findItem(itemId) : createNewItem();
  editingBackupItem = itemId ? JSON.parse(JSON.stringify(item)) : null;

  if (!itemId) {
    appData[activeRoute].push(item);
    editingItemId = item.id;
    editingNewItemId = item.id;
  }

  modalTitle.textContent = `${routeConfig[activeRoute].label}を編集`;
  modalBody.innerHTML = renderEditorForm(item);
  itemModal.classList.add("is-open");
  itemModal.setAttribute("aria-hidden", "false");
}

function closeEditor() {
  if (editingNewItemId) {
    appData[activeRoute] = appData[activeRoute].filter(item => item.id !== editingNewItemId);
    renderView();
  } else if (editingBackupItem && editingItemId) {
    const itemIndex = appData[activeRoute].findIndex(item => item.id === editingItemId);

    if (itemIndex !== -1) {
      appData[activeRoute][itemIndex] = editingBackupItem;
      renderView();
    }
  }

  itemModal.classList.remove("is-open");
  itemModal.setAttribute("aria-hidden", "true");
  editingItemId = null;
  editingNewItemId = null;
  editingBackupItem = null;
}

function createNewItem() {
  if (activeRoute === "livlies") {
    return {
      id: createId("livly"),
      name: "",
      imageUrl: "",
      species: "",
      feature: "",
      hpLevels: [{ id: createId("hp"), level: "1", value: "" }],
      fullness: "",
      ddEmissions: [{ id: createId("dd-emission"), level: "1", blackCount: "0", whiteCount: "0" }],
      facilitySuitability: "",
      movementTypes: [],
      movementPowers: [],
      handLevels: [{ id: createId("hand"), level: "1", value: "" }],
      attackLevels: [{ id: createId("attack"), level: "1", value: "" }],
      waza: "",
      favorite: ""
    };
  }

  if (activeRoute === "personalities") {
    return {
      id: createId("personality"),
      name: "",
      content: "",
      modificationRate: ""
    };
  }

  return {
    id: createId("material"),
    name: "",
    imageUrl: "",
    tags: ["その他"],
    seriesTags: [],
    content: "",
    effect: "",
    acquisitionMethod: "",
    purchasePrice: "",
    tradePrice: "",
    merchantTradePrice: "",
    buybackPrice: ""
  };
}

function renderEditorForm(item) {
  if (activeRoute === "livlies") {
    return `
      <label>
        名前
        <input type="text" data-main-field="name" value="${escapeHtml(item.name)}">
      </label>
      <label>
        見た目画像URL
        <input type="url" data-main-field="imageUrl" value="${escapeHtml(item.imageUrl)}">
      </label>
      <section class="modal-nested">
        <div class="modal-nested-heading">
          <h3>能力値</h3>
          <button type="button" class="mini-button" data-action="add-ability">追加</button>
        </div>
        <div class="modal-nested-list" data-list="abilities">
          ${renderAbilityInputs(item.abilities)}
        </div>
      </section>
      <section class="modal-nested">
        <div class="modal-nested-heading">
          <h3>レベル毎のdd排出量</h3>
          <button type="button" class="mini-button" data-action="add-dd">追加</button>
        </div>
        <div class="modal-nested-list" data-list="ddDrops">
          ${renderDdInputs(item.ddDrops)}
        </div>
      </section>
    `;
  }

  if (activeRoute === "personalities") {
    return `
      <label>
        名前
        <input type="text" data-main-field="name" value="${escapeHtml(item.name)}">
      </label>
      <label>
        内容
        <textarea rows="4" data-main-field="content">${escapeHtml(item.content)}</textarea>
      </label>
      <label>
        改造確率
        <input type="text" data-main-field="modificationRate" value="${escapeHtml(item.modificationRate)}">
      </label>
    `;
  }

  return `
    <label>
      名前
      <input type="text" data-main-field="name" value="${escapeHtml(item.name)}">
    </label>
    <label>
      内容
      <textarea rows="4" data-main-field="content">${escapeHtml(item.content)}</textarea>
    </label>
    <label>
      入手方法
      <input type="text" data-main-field="acquisitionMethod" value="${escapeHtml(item.acquisitionMethod)}">
    </label>
    <div class="modal-price-grid">
      <label>
        購入価格
        <input type="number" min="0" data-main-field="purchasePrice" value="${escapeHtml(item.purchasePrice)}">
      </label>
      <label>
        取引価格
        <input type="number" min="0" data-main-field="tradePrice" value="${escapeHtml(item.tradePrice)}">
      </label>
      <label>
        商人取引価格
        <input type="number" min="0" data-main-field="merchantTradePrice" value="${escapeHtml(item.merchantTradePrice)}">
      </label>
    </div>
  `;
}

function renderAbilityInputs(abilities) {
  if (!abilities.length) {
    return `<p class="nested-empty">登録なし</p>`;
  }

  return abilities.map(ability => `
    <div class="modal-nested-row" data-row="ability" data-id="${escapeHtml(ability.id)}">
      <label>
        能力値の名前
        <input type="text" data-field="name" value="${escapeHtml(ability.name)}">
      </label>
      <label>
        能力値の内容
        <textarea rows="3" data-field="content">${escapeHtml(ability.content)}</textarea>
      </label>
      <button type="button" class="mini-button danger-button" data-action="delete-row">削除</button>
    </div>
  `).join("");
}

function renderDdInputs(ddDrops) {
  if (!ddDrops.length) {
    return `<p class="nested-empty">登録なし</p>`;
  }

  return ddDrops.map(ddDrop => `
    <div class="modal-nested-row" data-row="dd" data-id="${escapeHtml(ddDrop.id)}">
      <label>
        レベル
        <input type="number" min="1" data-field="level" value="${escapeHtml(ddDrop.level)}">
      </label>
      <label>
        dd排出量
        <input type="number" min="0" data-field="amount" value="${escapeHtml(ddDrop.amount)}">
      </label>
      <button type="button" class="mini-button danger-button" data-action="delete-row">削除</button>
    </div>
  `).join("");
}

function fieldValue(field) {
  const input = modalBody.querySelector(`[data-main-field="${field}"]`);
  return input ? input.value.trim() : "";
}

function nestedFieldValue(row, field) {
  const input = row.querySelector(`[data-field="${field}"]`);
  return input ? input.value.trim() : "";
}

function saveEditor() {
  const item = findItem(editingItemId);

  if (!item) {
    return;
  }

  if (activeRoute === "livlies") {
    item.name = fieldValue("name");
    item.imageUrl = fieldValue("imageUrl");
    item.abilities = Array.from(modalBody.querySelectorAll('[data-row="ability"]')).map(row => ({
      id: row.dataset.id || createId("ability"),
      name: nestedFieldValue(row, "name"),
      content: nestedFieldValue(row, "content")
    }));
    item.ddDrops = Array.from(modalBody.querySelectorAll('[data-row="dd"]')).map(row => ({
      id: row.dataset.id || createId("dd"),
      level: nestedFieldValue(row, "level"),
      amount: nestedFieldValue(row, "amount")
    }));
  }

  if (activeRoute === "personalities") {
    item.name = fieldValue("name");
    item.content = fieldValue("content");
    item.modificationRate = fieldValue("modificationRate");
  }

  if (activeRoute === "materials") {
    item.name = fieldValue("name");
    item.content = fieldValue("content");
    item.acquisitionMethod = fieldValue("acquisitionMethod");
    item.purchasePrice = fieldValue("purchasePrice");
    item.tradePrice = fieldValue("tradePrice");
    item.merchantTradePrice = fieldValue("merchantTradePrice");
  }

  appData = saveAppData(appData);
  editingNewItemId = null;
  editingBackupItem = null;
  renderView();
  closeEditor();
}

function deleteCurrentItem() {
  if (!editingItemId || !confirm("この項目を削除しますか？")) {
    return;
  }

  appData[activeRoute] = appData[activeRoute].filter(item => item.id !== editingItemId);
  appData = saveAppData(appData);
  editingNewItemId = null;
  editingBackupItem = null;
  renderView();
  closeEditor();
}

function addNestedRow(kind) {
  const item = findItem(editingItemId);

  if (!item) {
    return;
  }

  readLivlyNestedFields(item);

  if (kind === "ability") {
    item.abilities.push({
      id: createId("ability"),
      name: "",
      content: ""
    });
  }

  if (kind === "dd") {
    item.ddDrops.push({
      id: createId("dd"),
      level: "",
      amount: ""
    });
  }

  modalBody.innerHTML = renderEditorForm(item);
}

function readLivlyNestedFields(item) {
  item.name = fieldValue("name");
  item.imageUrl = fieldValue("imageUrl");
  item.abilities = Array.from(modalBody.querySelectorAll('[data-row="ability"]')).map(row => ({
    id: row.dataset.id || createId("ability"),
    name: nestedFieldValue(row, "name"),
    content: nestedFieldValue(row, "content")
  }));
  item.ddDrops = Array.from(modalBody.querySelectorAll('[data-row="dd"]')).map(row => ({
    id: row.dataset.id || createId("dd"),
    level: nestedFieldValue(row, "level"),
    amount: nestedFieldValue(row, "amount")
  }));
}

function closeTouchInfo() {
  if (activeTouchItem) {
    activeTouchItem.classList.remove("is-open");
    activeTouchItem = null;
  }

  resetAllInfoPanelPositions();
  clearActiveInfoHost();
}

function closeMenu() {
  floatingMenu.classList.remove("is-open");
  menuButton.textContent = "•••";
}

routeButtons.forEach(button => {
  button.addEventListener("click", () => {
    switchRoute(button.dataset.route);
  });
});

editModeButton.addEventListener("click", handleEditModeButtonClick);
authLoginButton.addEventListener("click", loginEditor);
authLogoutButton.addEventListener("click", logoutEditor);

[authEmailInput, authPasswordInput].forEach(input => {
  input.addEventListener("keydown", event => {
    if (event.key === "Enter") {
      loginEditor();
    }
  });
});

addNewButton.addEventListener("click", () => {
  openEditor(null);
});

contentArea.addEventListener("click", event => {
  if (handleEditCopyToolbarClick(event)) {
    return;
  }

  if (suppressNextLivlyClick) {
    suppressNextLivlyClick = false;
    event.preventDefault();
    return;
  }

  if (suppressNextTouchClick) {
    const touchedInfoHost = findInfoPanelHost(event.target);
    suppressNextTouchClick = false;

    if (touchedInfoHost) {
      event.preventDefault();
      return;
    }
  }

  if (suppressNextProbabilityClick) {
    suppressNextProbabilityClick = false;
    event.preventDefault();
    return;
  }

  if (suppressNextExpClick) {
    suppressNextExpClick = false;
    event.preventDefault();
    return;
  }

  if (suppressNextEditCopyClick) {
    suppressNextEditCopyClick = false;
    event.preventDefault();
    return;
  }

  if (suppressGlobalDisplayToggleClickUntil) {
    const isSyntheticDisplayToggleClick = Date.now() < suppressGlobalDisplayToggleClickUntil &&
      Boolean(displayToggleActionFromTarget(event.target));

    if (!isSyntheticDisplayToggleClick) {
      suppressGlobalDisplayToggleClickUntil = 0;
    } else {
      event.preventDefault();
      return;
    }
  }

  if (suppressNextMaterialFilterClick && event.target.closest("[data-material-chip-scroller]")) {
    suppressNextMaterialFilterClick = false;
    event.preventDefault();
    return;
  }

  const livlyPanelButton = event.target.closest('[data-action="open-livly-panel"]');

  if (livlyPanelButton && editMode && activeRoute === "livlies") {
    openLivlyEditPanel(livlyPanelButton, event);
    return;
  }

  const materialNamePanelButton = event.target.closest('[data-action="open-material-name-panel"]');

  if (materialNamePanelButton && editMode && activeRoute === "materials") {
    openMaterialNameEditPanel(materialNamePanelButton, event);
    return;
  }

  const livlyToggleButton = event.target.closest('[data-action="toggle-livly-card"]');

  if (livlyToggleButton && activeRoute === "livlies") {
    toggleLivlyCard(livlyToggleButton);
    return;
  }

  const materialToggleButton = event.target.closest('[data-action="toggle-material-card"]');

  if (materialToggleButton && activeRoute === "materials") {
    toggleMaterialCard(materialToggleButton);
    return;
  }

  const closeLivlyPanelButton = event.target.closest('[data-action="close-livly-panel"]');

  if (closeLivlyPanelButton && editMode && activeRoute === "livlies") {
    closeLivlyEditPanel();
    return;
  }

  const closeMaterialNamePanelButton = event.target.closest('[data-action="close-material-name-panel"]');

  if (closeMaterialNamePanelButton && editMode && activeRoute === "materials") {
    closeMaterialNameEditPanel();
    return;
  }

  const clearLivlyImageButton = event.target.closest('[data-action="clear-livly-image"]');

  if (clearLivlyImageButton && editMode && activeRoute === "livlies") {
    clearLivlyImage(clearLivlyImageButton);
    return;
  }

  const clearMaterialImageButton = event.target.closest('[data-action="clear-material-image"]');

  if (clearMaterialImageButton && editMode && activeRoute === "materials") {
    clearMaterialImage(clearMaterialImageButton);
    return;
  }

  const livlyDescriptionPanelButton = event.target.closest('[data-action="open-livly-description-panel"]');

  if (livlyDescriptionPanelButton && editMode && activeRoute === "livlies") {
    const firstLivly = appData.livlies[0];

    if (firstLivly) {
      const anchor = livlyPanelAnchorFromEvent(event, livlyDescriptionPanelButton);
      livlyEditPanel = { livlyId: firstLivly.id, panel: "descriptions", placement: "after", x: anchor.x, y: anchor.y };
      renderView();
    }
    return;
  }

  const applyLivlyCropButton = event.target.closest('[data-action="apply-livly-crop"]');

  if (applyLivlyCropButton && editMode && isCropRoute()) {
    applyLivlyCrop(applyLivlyCropButton);
    return;
  }

  const replayLivlyCropButton = event.target.closest('[data-action="replay-livly-crop"]');

  if (replayLivlyCropButton && editMode && isCropRoute()) {
    replayLivlyCrop();
    return;
  }

  const applyLivlyCropPresetButton = event.target.closest('[data-action="apply-livly-crop-preset"]');

  if (applyLivlyCropPresetButton && editMode && isCropRoute()) {
    applyLivlyCropPreset();
    return;
  }

  const cancelLivlyCropButton = event.target.closest('[data-action="cancel-livly-crop"]');

  if (cancelLivlyCropButton && editMode && isCropRoute()) {
    cancelLivlyCrop();
    return;
  }

  const closeInfoButton = event.target.closest('[data-action="close-info"]');

  if (closeInfoButton) {
    closeTouchInfo();
    return;
  }

  const filterButton = event.target.closest("[data-personality-display]");

  if (filterButton) {
    closeTouchInfo();
    personalityDisplayMode = filterButton.dataset.personalityDisplay;
    localStorage.setItem("personalityDisplayMode", personalityDisplayMode);
    renderView();
    return;
  }

  const livlyCardDisplayButton = event.target.closest("[data-livly-card-display-toggle]");

  if (livlyCardDisplayButton && activeRoute === "livlies") {
    closeTouchInfo();
    const card = livlyCardDisplayButton.closest("[data-id]");

    if (card) {
      const currentMode = livlyCardDisplayModes[card.dataset.id] === "profile" ? "profile" : "stats";
      livlyCardDisplayModes[card.dataset.id] = currentMode === "profile" ? "stats" : "profile";
      saveLivlyCardDisplayModes();
      renderView();
    }
    return;
  }

  const livlyDisplayButton = event.target.closest("[data-livly-display-toggle]");

  if (livlyDisplayButton) {
    closeTouchInfo();
    livlyDisplayMode = livlyDisplayMode === "stats" ? "profile" : "stats";
    localStorage.setItem("livlyDisplayMode", livlyDisplayMode);
    renderView();
    return;
  }

  const livlySortDirectionButton = event.target.closest("[data-livly-sort-direction]");

  if (livlySortDirectionButton && activeRoute === "livlies") {
    livlySortDirection = livlySortDirection === "desc" ? "asc" : "desc";
    localStorage.setItem("livlySortDirection", livlySortDirection);
    renderView();
    return;
  }

  const materialDisplayToggleButton = event.target.closest("[data-material-display-toggle]");

  if (materialDisplayToggleButton && activeRoute === "materials") {
    const card = materialDisplayToggleButton.closest("[data-id]");

    if (card) {
      const currentMode = materialCardDisplayModes[card.dataset.id] === "price" ? "price" : "info";
      materialCardDisplayModes[card.dataset.id] = currentMode === "price" ? "info" : "price";
      saveMaterialCardDisplayModes();
      closeTouchInfo();
      renderView();
    }
    return;
  }

  const materialSortDirectionButton = event.target.closest("[data-material-sort-direction]");

  if (materialSortDirectionButton && activeRoute === "materials") {
    materialSortDirection = materialSortDirection === "desc" ? "asc" : "desc";
    localStorage.setItem("materialSortDirection", materialSortDirection);
    renderView();
    return;
  }

  const materialFilterAllButton = event.target.closest("[data-material-filter-all]");

  if (materialFilterAllButton && activeRoute === "materials") {
    setMaterialVisibleTag("");
    return;
  }

  const materialFilterTagButton = event.target.closest("[data-material-filter-tag]");

  if (materialFilterTagButton && activeRoute === "materials") {
    setMaterialVisibleTag(materialFilterTagButton.getAttribute("data-material-filter-tag"));
    return;
  }

  const materialSeriesFilterAllButton = event.target.closest("[data-material-series-filter-all]");

  if (materialSeriesFilterAllButton && activeRoute === "materials") {
    setMaterialVisibleSeriesTag("");
    return;
  }

  const materialSeriesFilterTagButton = event.target.closest("[data-material-series-filter-tag]");

  if (materialSeriesFilterTagButton && activeRoute === "materials") {
    setMaterialVisibleSeriesTag(materialSeriesFilterTagButton.getAttribute("data-material-series-filter-tag"));
    return;
  }

  const openMaterialSeriesPanelButton = event.target.closest('[data-action="open-material-series-panel"]');

  if (openMaterialSeriesPanelButton && editMode && activeRoute === "materials") {
    openMaterialSeriesEditPanel(openMaterialSeriesPanelButton, event);
    return;
  }

  const closeMaterialSeriesPanelButton = event.target.closest('[data-action="close-material-series-panel"]');

  if (closeMaterialSeriesPanelButton && editMode && activeRoute === "materials") {
    closeMaterialSeriesEditPanel();
    return;
  }

  const saveMaterialSeriesPanelButton = event.target.closest('[data-action="save-material-series-panel"]');

  if (saveMaterialSeriesPanelButton && editMode && activeRoute === "materials") {
    saveMaterialSeriesPanel();
    return;
  }

  const deleteMaterialSeriesPanelButton = event.target.closest('[data-action="delete-material-series-panel"]');

  if (deleteMaterialSeriesPanelButton && editMode && activeRoute === "materials") {
    if (materialSeriesEditPanel?.mode === "edit") {
      deleteMaterialSeries(materialSeriesEditPanel.name);
    }
    return;
  }

  const deleteMaterialSeriesButton = event.target.closest('[data-action="delete-material-series"]');

  if (deleteMaterialSeriesButton && editMode && activeRoute === "materials") {
    deleteMaterialSeries(deleteMaterialSeriesButton.getAttribute("data-material-series-name"));
    return;
  }

  const savePersonalitiesButton = event.target.closest('[data-action="save-personalities"]');

  if (savePersonalitiesButton) {
    savePersonalityEdits(savePersonalitiesButton);
    return;
  }

  const saveLivliesButton = event.target.closest('[data-action="save-livlies"]');

  if (saveLivliesButton) {
    saveLivlyEdits();
    return;
  }

  const saveMaterialsButton = event.target.closest('[data-action="save-materials"]');

  if (saveMaterialsButton) {
    saveMaterialEdits();
    return;
  }

  const addPersonalityButton = event.target.closest('[data-action="add-personality"]');

  if (addPersonalityButton) {
    addInlinePersonality();
    return;
  }

  const addLivlyInlineButton = event.target.closest('[data-action="add-livly-inline"]');

  if (addLivlyInlineButton) {
    addInlineLivly();
    return;
  }

  const addMaterialInlineButton = event.target.closest('[data-action="add-material-inline"]');

  if (addMaterialInlineButton) {
    addInlineMaterial();
    return;
  }

  const deleteLivlyButton = event.target.closest('[data-action="delete-livly"]');

  if (deleteLivlyButton) {
    const item = deleteLivlyButton.closest("[data-id]");
    deleteLivly(item.dataset.id);
    return;
  }

  const deleteMaterialButton = event.target.closest('[data-action="delete-material"]');

  if (deleteMaterialButton) {
    const item = deleteMaterialButton.closest("[data-id]");
    deleteMaterial(item.dataset.id);
    return;
  }

  const livlyLevelAddButton = event.target.closest('[data-action="add-livly-level"]');

  if (livlyLevelAddButton) {
    addLivlyLevelRow(livlyLevelAddButton);
    return;
  }

  const livlyLevelDeleteButton = event.target.closest('[data-action="delete-livly-level"]');

  if (livlyLevelDeleteButton) {
    deleteLivlyLevelRow(livlyLevelDeleteButton);
    return;
  }

  const livlyDdRowAddButton = event.target.closest('[data-action="add-livly-dd-row"]');

  if (livlyDdRowAddButton) {
    addLivlyDdRow(livlyDdRowAddButton);
    return;
  }

  const livlyDdRowDeleteButton = event.target.closest('[data-action="delete-livly-dd-row"]');

  if (livlyDdRowDeleteButton) {
    deleteLivlyDdRow(livlyDdRowDeleteButton);
    return;
  }

  const ddMenuButton = event.target.closest('[data-action="open-dd-add-menu"], [data-action="open-dd-symbol-menu"]');

  if (ddMenuButton) {
    toggleDdSymbolMenu(ddMenuButton);
    return;
  }

  const ddSymbolAddButton = event.target.closest('[data-action="add-dd-symbol"]');

  if (ddSymbolAddButton) {
    addDdSymbol(ddSymbolAddButton);
    return;
  }

  const ddSymbolUpdateButton = event.target.closest('[data-action="update-dd-symbol"]');

  if (ddSymbolUpdateButton) {
    updateDdSymbol(ddSymbolUpdateButton);
    return;
  }

  const livlyUnsetButton = event.target.closest('[data-action="set-livly-unset"]');

  if (livlyUnsetButton) {
    setLivlyUnset(livlyUnsetButton);
    return;
  }

  const livlyChoiceButton = event.target.closest('[data-action="toggle-livly-choice"]');

  if (livlyChoiceButton) {
    toggleLivlyChoice(livlyChoiceButton);
    return;
  }

  const livlyOptionAddButton = event.target.closest('[data-action="add-livly-option"]');

  if (livlyOptionAddButton) {
    addLivlyOption(livlyOptionAddButton);
    return;
  }

  const livlyOptionRemoveButton = event.target.closest('[data-action="remove-livly-option"]');

  if (livlyOptionRemoveButton) {
    removeLivlyOption(livlyOptionRemoveButton);
    return;
  }

  const removeProbabilityGroupButton = event.target.closest('[data-action="remove-probability-group"]');

  if (removeProbabilityGroupButton && activeRoute === "personalityProbability") {
    event.stopPropagation();
    removeProbabilityGroup(removeProbabilityGroupButton.dataset.groupIndex);
    return;
  }

  const addProbabilityGroupButton = event.target.closest('[data-action="add-probability-group"]');

  if (addProbabilityGroupButton && activeRoute === "personalityProbability") {
    addProbabilityGroup();
    return;
  }

  const selectProbabilityGroupButton = event.target.closest('[data-action="select-probability-group"]');

  if (selectProbabilityGroupButton && activeRoute === "personalityProbability") {
    selectProbabilityGroup(selectProbabilityGroupButton.dataset.groupIndex);
    return;
  }

  const removeUnwantedButton = event.target.closest('[data-action="remove-probability-unwanted"]');

  if (removeUnwantedButton && activeRoute === "personalityProbability") {
    removeProbabilityUnwantedPersonality(removeUnwantedButton.dataset.personalityId, {
      animate: true,
      sourceElement: removeUnwantedButton
    });
    return;
  }

  const probabilityChoiceButton = event.target.closest("[data-probability-personality]");

  if (probabilityChoiceButton) {
    toggleProbabilityPersonality(probabilityChoiceButton.dataset.probabilityPersonality, event);
    return;
  }

  const saveProbabilitySettingsButton = event.target.closest('[data-action="save-probability-settings"]');

  if (saveProbabilitySettingsButton) {
    if (editMode) {
      saveProbabilitySettings();
    }
    return;
  }

  const saveExperienceButton = event.target.closest('[data-action="save-experience"]');

  if (saveExperienceButton && activeRoute === "exp") {
    saveExperienceEdits();
    return;
  }

  const saveDdButton = event.target.closest('[data-action="save-dd"]');

  if (saveDdButton && activeRoute === "dd") {
    saveDdEdits();
    return;
  }

  const addExperienceRowButton = event.target.closest('[data-action="add-exp-row"]');

  if (addExperienceRowButton && editMode && activeRoute === "exp") {
    addExperienceRow();
    return;
  }

  const addExperienceColumnButton = event.target.closest('[data-action="add-exp-column"]');

  if (addExperienceColumnButton && editMode && activeRoute === "exp") {
    addExperienceColumn();
    return;
  }

  const addDdHouseRowButton = event.target.closest('[data-action="add-dd-house-row"]');

  if (addDdHouseRowButton && activeRoute === "dd") {
    addDdHouseRow();
    return;
  }

  const deleteDdHouseRowButton = event.target.closest('[data-action="delete-dd-house-row"]');

  if (deleteDdHouseRowButton && activeRoute === "dd") {
    deleteDdHouseRow(deleteDdHouseRowButton);
    return;
  }

  const addDdRateRowButton = event.target.closest('[data-action="add-dd-rate-row"]');

  if (addDdRateRowButton && editMode && activeRoute === "dd") {
    addDdRateRow(addDdRateRowButton);
    return;
  }

  const copyDdTableButton = event.target.closest('[data-action="copy-dd-table"]');

  if (copyDdTableButton && editMode && activeRoute === "dd") {
    copyDdTable(copyDdTableButton);
    return;
  }

  const deleteDdRateRowButton = event.target.closest('[data-action="delete-dd-rate-row"]');

  if (deleteDdRateRowButton && editMode && activeRoute === "dd") {
    deleteDdRateRow(deleteDdRateRowButton);
    return;
  }

  const deletePersonalityButton = event.target.closest('[data-action="delete-personality"]');

  if (deletePersonalityButton) {
    if (!editMode || activeRoute !== "personalities") {
      return;
    }

    const item = deletePersonalityButton.closest(".list-item");
    deletePersonality(item.dataset.id);
    return;
  }

  const editButton = event.target.closest('[data-action="edit"]');

  if (editButton) {
    if (!editMode) {
      return;
    }

    const item = editButton.closest(".list-item");
    openEditor(item.dataset.id);
    return;
  }

  const item = event.target.closest(".list-item");

  if (editMode) {
    if (item && activeRoute !== "personalities") {
      openEditor(item.dataset.id);
    }

    return;
  }
});

contentArea.addEventListener("input", event => {
  const columnSlider = event.target.closest("[data-card-column-slider]");

  if (columnSlider) {
    updateCardColumnSlider(columnSlider);
    return;
  }

  const cropInput = event.target.closest("[data-livly-crop-field]");

  if (cropInput && editMode && isCropRoute()) {
    updateLivlyCropInput(cropInput);
    return;
  }

  const descriptionInput = event.target.closest("[data-livly-description-field]");

  if (descriptionInput && editMode && activeRoute === "livlies") {
    const field = descriptionInput.dataset.livlyDescriptionField;
    appData.livlyFieldDescriptions[field] = descriptionInput.value;
    updateEditSaveButtonState();
    return;
  }

  const input = event.target.closest("[data-personality-field]");

  if (input && editMode && activeRoute === "personalities") {
    updatePersonalityField(input);
  }

  const livlyInput = event.target.closest("[data-livly-field]");

  if (livlyInput && editMode && activeRoute === "livlies") {
    updateLivlyField(livlyInput);
  }

  const livlyLevelInput = event.target.closest("[data-livly-level-field]");

  if (livlyLevelInput && editMode && activeRoute === "livlies") {
    updateLivlyLevelField(livlyLevelInput);
  }

  const livlyDdLevelInput = event.target.closest("[data-livly-dd-property]");

  if (livlyDdLevelInput && editMode && activeRoute === "livlies") {
    updateLivlyDdLevel(livlyDdLevelInput);
  }

  const materialInput = event.target.closest("[data-material-field]");

  if (materialInput && editMode && activeRoute === "materials") {
    updateMaterialField(materialInput);
  }

  const slotRateInput = event.target.closest("[data-slot-rate]");

  if (slotRateInput && editMode && activeRoute === "personalityProbability") {
    updateProbabilitySlotRate(slotRateInput);
  }

  const expInput = event.target.closest("[data-exp-input]");

  if (expInput && activeRoute === "exp") {
    updateExperienceInput(expInput);
  }

  const expTableInput = event.target.closest("[data-exp-table-field]");

  if (expTableInput && editMode && activeRoute === "exp") {
    updateExperienceTableField(expTableInput);
  }

  const ddHouseInput = event.target.closest("[data-dd-house-field]");

  if (ddHouseInput && activeRoute === "dd") {
    updateDdHouseField(ddHouseInput);
  }

  const ddRateInput = event.target.closest("[data-dd-rate-field]");

  if (ddRateInput && editMode && activeRoute === "dd") {
    updateDdRateField(ddRateInput);
  }
});

contentArea.addEventListener("change", event => {
  const livlySortSelect = event.target.closest("[data-livly-sort-field]");

  if (livlySortSelect && activeRoute === "livlies") {
    livlySortField = livlySortSelect.value;

    if (!livlySortFieldOptions.some(option => option[0] === livlySortField)) {
      livlySortField = "";
    }

    localStorage.setItem("livlySortField", livlySortField);
    renderView();
    return;
  }

  const materialSortSelect = event.target.closest("[data-material-sort-field]");

  if (materialSortSelect && activeRoute === "materials") {
    materialSortField = materialSortSelect.value;

    if (!materialSortFieldOptions.some(option => option[0] === materialSortField)) {
      materialSortField = "";
    }

    localStorage.setItem("materialSortField", materialSortField);
    renderView();
    return;
  }

  const materialFilterSelect = event.target.closest("[data-material-filter-select]");

  if (materialFilterSelect && activeRoute === "materials") {
    setMaterialVisibleTag(materialFilterSelect.value);
    return;
  }

  const materialSeriesFilterSelect = event.target.closest("[data-material-series-filter-select]");

  if (materialSeriesFilterSelect && activeRoute === "materials") {
    setMaterialVisibleSeriesTag(materialSeriesFilterSelect.value);
    return;
  }

  const materialTagInput = event.target.closest("[data-material-tag]");

  if (materialTagInput && editMode && activeRoute === "materials") {
    updateMaterialTags(materialTagInput);
    return;
  }

  const materialSeriesTagInput = event.target.closest("[data-material-series-tag]");

  if (materialSeriesTagInput && editMode && activeRoute === "materials") {
    updateMaterialSeriesTags(materialSeriesTagInput);
    return;
  }

  const bulkImageInput = event.target.closest("[data-bulk-image-upload]");

  if (bulkImageInput && editMode && isCropRoute()) {
    startBulkImageUpload(bulkImageInput.dataset.bulkImageUpload, bulkImageInput.files);
    bulkImageInput.value = "";
    return;
  }

  const imageInput = event.target.closest("[data-livly-image-upload], [data-material-image-upload]");

  if (imageInput && editMode && isCropRoute()) {
    updateLivlyImage(imageInput);
    return;
  }

  const livlyInput = event.target.closest("[data-livly-field]");

  if (livlyInput && editMode && activeRoute === "livlies") {
    updateLivlyField(livlyInput);
    return;
  }

  const livlyLevelInput = event.target.closest("[data-livly-level-field]");

  if (
    livlyLevelInput &&
    editMode &&
    activeRoute === "livlies" &&
    livlyLevelInput.dataset.levelProperty === "level"
  ) {
    updateLivlyLevelField(livlyLevelInput);
    renderView();
    return;
  }

  const livlyDdLevelInput = event.target.closest("[data-livly-dd-property='level']");

  if (livlyDdLevelInput && editMode && activeRoute === "livlies") {
    updateLivlyDdLevel(livlyDdLevelInput);
    renderView();
  }
});

contentArea.addEventListener("blur", handlePersonalityRateCommit, true);
contentArea.addEventListener("change", handlePersonalityRateCommit);

contentArea.addEventListener("dragover", event => {
  const zone = event.target.closest("[data-bulk-upload-zone]");

  if (!zone || !editMode || !isCropRoute()) {
    return;
  }

  event.preventDefault();
  zone.classList.add("is-drag-over");
});

contentArea.addEventListener("dragleave", event => {
  const zone = event.target.closest("[data-bulk-upload-zone]");

  if (!zone || zone.contains(event.relatedTarget)) {
    return;
  }

  zone.classList.remove("is-drag-over");
});

contentArea.addEventListener("drop", event => {
  const zone = event.target.closest("[data-bulk-upload-zone]");

  if (!zone || !editMode || !isCropRoute()) {
    return;
  }

  event.preventDefault();
  zone.classList.remove("is-drag-over");
  startBulkImageUpload(zone.dataset.bulkUploadZone, event.dataTransfer?.files);
});

contentArea.addEventListener("blur", event => {
  const input = event.target.closest("[data-slot-rate]");

  if (input && editMode && activeRoute === "personalityProbability") {
    formatProbabilitySlotRateInput(input);
  }
}, true);

contentArea.addEventListener("change", event => {
  const input = event.target.closest("[data-slot-rate]");

  if (input && editMode && activeRoute === "personalityProbability") {
    formatProbabilitySlotRateInput(input);
  }
});

contentArea.addEventListener("change", event => {
  const expInput = event.target.closest("[data-exp-input]");

  if (expInput && activeRoute === "exp") {
    updateExperienceInput(expInput);
  }

  const expColumnSelect = event.target.closest("[data-exp-column-personality]");

  if (expColumnSelect && editMode && activeRoute === "exp") {
    updateExperienceColumnPersonality(expColumnSelect);
  }

  const ddHouseInput = event.target.closest("[data-dd-house-field]");

  if (ddHouseInput && activeRoute === "dd") {
    updateDdHouseField(ddHouseInput);
  }

  const ddRateInput = event.target.closest("[data-dd-rate-field]");

  if (ddRateInput && editMode && activeRoute === "dd") {
    updateDdRateField(ddRateInput);
  }
});

contentArea.addEventListener("contextmenu", event => {
  const cropHandle = event.target.closest("[data-livly-crop-handle]");

  if (cropHandle && editMode && isCropRoute() && livlyCropState) {
    event.preventDefault();
    toggleLivlyCropPinnedLoupe(cropHandle.dataset.livlyCropHandle);
    return;
  }

  const expRow = event.target.closest("[data-exp-row-id]");

  if (expRow && editMode && activeRoute === "exp") {
    event.preventDefault();
    deleteExperienceRow();
    return;
  }

  const globalDisplayToggleAction = displayToggleActionFromTarget(event.target);

  if (globalDisplayToggleAction) {
    event.preventDefault();
    applyGlobalDisplayToggle(globalDisplayToggleAction);
    return;
  }

  const editActionInfo = editActionPanelInfoFromTarget(event.target, event);

  if (!editActionInfo) {
    return;
  }

  event.preventDefault();
  openEditActionPanel(editActionInfo, event);
});

contentArea.addEventListener("pointerdown", startFloatingLivlyPanelDrag);
contentArea.addEventListener("pointerdown", startPersonalityDrag);
contentArea.addEventListener("pointerdown", startProbabilityDrag);
contentArea.addEventListener("pointerdown", startLivlyCropLoupeDrag);
contentArea.addEventListener("pointerdown", startLivlyCropDrag);
contentArea.addEventListener("pointerdown", startMaterialFilterDrag);
contentArea.addEventListener("pointerdown", event => {
  const expRow = event.target.closest("[data-exp-row-id]");

  if (
    expRow &&
    editMode &&
    activeRoute === "exp" &&
    event.button === 0 &&
    !event.target.closest("input, select, textarea, button")
  ) {
    expDeletePressTarget = expRow;
    expDeletePressTimer = setTimeout(() => {
      const deleted = deleteExperienceRow();
      suppressNextExpClick = deleted;
      clearExperienceDeletePressTimer();
    }, 650);
    return;
  }

  const globalDisplayToggleAction = displayToggleActionFromTarget(event.target);

  if (globalDisplayToggleAction && event.button === 0) {
    globalDisplayTogglePressTarget = globalDisplayToggleAction;
    globalDisplayTogglePressTimer = setTimeout(() => {
      const changed = applyGlobalDisplayToggle(globalDisplayTogglePressTarget);
      suppressGlobalDisplayToggleClickUntil = changed ? Date.now() + 450 : 0;
      clearGlobalDisplayTogglePressTimer();
    }, 650);
    return;
  }

  const editActionInfo = editActionPanelInfoFromTarget(event.target, event);

  if (!editActionInfo || event.button !== 0) {
    return;
  }

  editCopyPressTarget = editActionInfo;
  editCopyPressTimer = setTimeout(() => {
    openEditActionPanel(editCopyPressTarget, event);
    suppressNextEditCopyClick = true;
    clearEditCopyPressTimer();
  }, 650);
});
contentArea.addEventListener("pointermove", moveFloatingLivlyPanelDrag);
contentArea.addEventListener("pointermove", movePersonalityDrag);
contentArea.addEventListener("pointermove", moveProbabilityDrag);
contentArea.addEventListener("pointermove", moveLivlyCropLoupeDrag);
contentArea.addEventListener("pointermove", moveLivlyCropDrag);
contentArea.addEventListener("pointermove", moveMaterialFilterDrag);
contentArea.addEventListener("pointermove", clearLivlyDeletePressTimer);
contentArea.addEventListener("pointermove", clearEditCopyPressTimer);
contentArea.addEventListener("pointermove", clearGlobalDisplayTogglePressTimer);
contentArea.addEventListener("pointermove", clearExperienceDeletePressTimer);
contentArea.addEventListener("pointerup", finishFloatingLivlyPanelDrag);
contentArea.addEventListener("pointerup", finishPersonalityDrag);
contentArea.addEventListener("pointerup", finishProbabilityDrag);
contentArea.addEventListener("pointerup", finishLivlyCropLoupeDrag);
contentArea.addEventListener("pointerup", finishLivlyCropDrag);
contentArea.addEventListener("pointerup", finishMaterialFilterDrag);
contentArea.addEventListener("pointerup", clearLivlyDeletePressTimer);
contentArea.addEventListener("pointerup", clearEditCopyPressTimer);
contentArea.addEventListener("pointerup", clearGlobalDisplayTogglePressTimer);
contentArea.addEventListener("pointerup", clearExperienceDeletePressTimer);
contentArea.addEventListener("pointercancel", finishFloatingLivlyPanelDrag);
contentArea.addEventListener("pointercancel", finishPersonalityDrag);
contentArea.addEventListener("pointercancel", finishProbabilityDrag);
contentArea.addEventListener("pointercancel", finishLivlyCropLoupeDrag);
contentArea.addEventListener("pointercancel", finishLivlyCropDrag);
contentArea.addEventListener("pointercancel", finishMaterialFilterDrag);
contentArea.addEventListener("pointercancel", clearLivlyDeletePressTimer);
contentArea.addEventListener("pointercancel", clearEditCopyPressTimer);
contentArea.addEventListener("pointercancel", clearGlobalDisplayTogglePressTimer);
contentArea.addEventListener("pointercancel", clearExperienceDeletePressTimer);
document.addEventListener("pointerup", finishProbabilityDrag);
document.addEventListener("pointercancel", finishProbabilityDrag);
document.addEventListener("pointermove", moveProbabilityDrag);
document.addEventListener("pointerup", scheduleInfoPanelAtProbabilityReleasePoint);
document.addEventListener("mouseup", scheduleInfoPanelAtProbabilityReleasePoint);
document.addEventListener("pointermove", cancelScheduledProbabilityInfoPanelOnMove, true);
document.addEventListener("mousemove", cancelScheduledProbabilityInfoPanelOnMove, true);
document.addEventListener("dragover", rememberProbabilityDragPoint, true);
document.addEventListener("drop", rememberProbabilityDragPoint, true);
document.addEventListener("dragend", showInfoPanelForNativeReturnBeforeCleanup, true);
document.addEventListener("dragend", releaseInfoPanelSuppressionAfterDrag);
document.addEventListener("dragend", scheduleInfoPanelAtProbabilityDragPoint);

contentArea.addEventListener("dragstart", event => {
  const experienceColumnButton = event.target.closest("[data-exp-column-drag]");

  if (experienceColumnButton && activeRoute === "exp" && editMode) {
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", experienceColumnButton.dataset.expColumnDrag);
    event.dataTransfer.setData("source", "experience-column");
    document.body.classList.add("is-experience-column-dragging");
    setInfoPanelDragSuppressed(true);
    closeTouchInfo();
    return;
  }

  const unwantedButton = event.target.closest("[data-probability-unwanted-personality]");
  const personalityButton = unwantedButton || event.target.closest("[data-probability-personality]");

  if (!personalityButton || activeRoute !== "personalityProbability") {
    return;
  }

  if (!useNativeProbabilityDrag) {
    event.preventDefault();
    return;
  }

  const personalityId = personalityButton.dataset.probabilityPersonality || personalityButton.dataset.probabilityUnwantedPersonality;
  rememberProbabilityDragPoint(event);
  if (probabilityDragState) {
    stopProbabilityAutoScroll(probabilityDragState);
    removeProbabilityDragGhost(probabilityDragState);
    probabilityDragState.button?.classList.remove("is-dragging");
    probabilityDragState.button?.releasePointerCapture?.(probabilityDragState.pointerId);
    probabilityDragState = null;
  }
  probabilityNativeDragSource = unwantedButton ? "unwanted" : "choice";
  probabilityNativeDragId = personalityId;
  event.dataTransfer.effectAllowed = probabilityNativeDragSource === "unwanted" ? "move" : "copy";
  event.dataTransfer.setData("text/plain", personalityId);
  event.dataTransfer.setData("source", probabilityNativeDragSource);
  probabilityNativeDropInsideUnwanted = false;
  document.body.classList.remove("is-probability-pressing");
  document.body.classList.add("is-probability-dragging");
  setProbabilityDragSourceState(probabilityNativeDragSource);
  setInfoPanelDragSuppressed(true);
  closeTouchInfo();

  requestAnimationFrame(() => {
    personalityButton.classList.add("is-dragging");
  });
});

contentArea.addEventListener("dragover", event => {
  rememberProbabilityDragPoint(event);

  if (activeRoute === "exp" && editMode) {
    const columnHead = event.target.closest("[data-exp-column-id]");

    if (columnHead) {
      event.preventDefault();
      event.dataTransfer.dropEffect = "move";
      document.querySelectorAll(".experience-column-head.is-drag-over").forEach(element => {
        if (element !== columnHead) {
          element.classList.remove("is-drag-over");
        }
      });
      columnHead.classList.add("is-drag-over");
      return;
    }
  }

  if (activeRoute !== "personalityProbability") {
    return;
  }

  const unwantedZone = event.target.closest("[data-probability-unwanted-zone]");
  const choiceList = findProbabilityChoiceListFromElement(event.target);

  clearProbabilityDropIndicators();

  if (probabilityNativeDragSource === "choice" && unwantedZone) {
    event.preventDefault();
    event.dataTransfer.dropEffect = "copy";
    unwantedZone.classList.add("is-drag-over");
    return;
  }

  if (probabilityNativeDragSource === "unwanted" && choiceList) {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
    showProbabilityReturnTarget(probabilityNativeDragId);
  }
});

contentArea.addEventListener("dragleave", event => {
  const experienceColumnHead = event.target.closest("[data-exp-column-id]");

  if (experienceColumnHead && !experienceColumnHead.contains(event.relatedTarget)) {
    experienceColumnHead.classList.remove("is-drag-over");
  }

  const unwantedZone = event.target.closest("[data-probability-unwanted-zone]");
  const choiceList = findProbabilityChoiceListFromElement(event.target);

  if (unwantedZone && !unwantedZone.contains(event.relatedTarget)) {
    unwantedZone.classList.remove("is-drag-over");
  }

  if (choiceList && !choiceList.contains(event.relatedTarget)) {
    clearProbabilityDropIndicators();
  }
});

contentArea.addEventListener("drop", event => {
  rememberProbabilityDragPoint(event);

  const experienceColumnHead = event.target.closest("[data-exp-column-id]");

  if (activeRoute === "exp" && editMode && experienceColumnHead && event.dataTransfer.getData("source") === "experience-column") {
    event.preventDefault();
    document.querySelectorAll(".experience-column-head.is-drag-over").forEach(element => element.classList.remove("is-drag-over"));
    moveExperienceColumn(event.dataTransfer.getData("text/plain"), experienceColumnHead.dataset.expColumnId);
    return;
  }

  if (activeRoute !== "personalityProbability") {
    return;
  }

  const unwantedZone = event.target.closest("[data-probability-unwanted-zone]");
  const choiceList = findProbabilityChoiceListFromElement(event.target);
  const source = event.dataTransfer.getData("source") || probabilityNativeDragSource;
  const personalityId = event.dataTransfer.getData("text/plain") || probabilityNativeDragId;

  if (source === "choice" && !unwantedZone) {
    return;
  }

  if (source === "unwanted" && !choiceList) {
    return;
  }

  event.preventDefault();
  clearProbabilityDropIndicators();
  probabilityNativeDropInsideUnwanted = !!unwantedZone || !!choiceList;

  if (source !== "unwanted" && unwantedZone) {
    const sourceElement = document.querySelector(`[data-probability-personality="${CSS.escape(personalityId)}"]`);
    clearProbabilityDragStateAfterRelease({ keepNativeDropInside: true });

    addProbabilityUnwantedPersonality(personalityId, {
      animate: true,
      sourceElement,
      releasePoint: {
        x: event.clientX,
        y: event.clientY
      }
    });
    return;
  }

  if (source === "unwanted" && choiceList && !unwantedZone) {
    const sourceElement = document.querySelector(`[data-probability-unwanted-personality="${CSS.escape(personalityId)}"]`);
    clearProbabilityDragStateAfterRelease({ keepNativeDropInside: true });
    removeProbabilityUnwantedPersonality(personalityId, {
      animate: true,
      sourceElement,
      releasePoint: {
        x: event.clientX,
        y: event.clientY
      }
    });
  }
});

contentArea.addEventListener("dragend", event => {
  rememberProbabilityDragPoint(event);

  const experienceColumnButton = event.target.closest("[data-exp-column-drag]");

  if (experienceColumnButton && activeRoute === "exp") {
    document.body.classList.remove("is-experience-column-dragging");
    document.querySelectorAll(".experience-column-head.is-drag-over").forEach(element => element.classList.remove("is-drag-over"));
    return;
  }

  const unwantedButton = event.target.closest("[data-probability-unwanted-personality]");
  const probabilityButton = unwantedButton || event.target.closest("[data-probability-personality]");

  if (!probabilityButton || activeRoute !== "personalityProbability") {
    return;
  }

  const sourceHost = probabilityButton.closest(".probability-choice-card");
  const releasePoint = infoPanelPointFromEvent(event, sourceHost);
  const elementBelowPointer = document.elementFromPoint(event.clientX, event.clientY);
  const choiceList = findProbabilityChoiceListFromElement(elementBelowPointer);
  const droppedInsideKnownTarget = probabilityNativeDropInsideUnwanted;
  const returnedToChoiceList = Boolean(unwantedButton && !probabilityNativeDropInsideUnwanted && choiceList);

  clearProbabilityDropIndicators();
  probabilityButton.classList.remove("is-dragging");
  clearProbabilityDragVisualState();

  if (returnedToChoiceList) {
    removeProbabilityUnwantedPersonality(unwantedButton.dataset.probabilityUnwantedPersonality, {
      animate: true,
      sourceElement: unwantedButton,
      releasePoint: {
        x: event.clientX,
        y: event.clientY
      }
    });
  }

  clearProbabilityDragStateAfterRelease();

  if (!droppedInsideKnownTarget && !returnedToChoiceList) {
    scheduleInfoPanelForHostAfterRelease(releasePoint || event, sourceHost);
  }
});

contentArea.addEventListener("pointerover", showCursorInfoPanel);
contentArea.addEventListener("pointermove", showCursorInfoPanel);
contentArea.addEventListener("mouseover", showCursorInfoPanel);
contentArea.addEventListener("mousemove", showCursorInfoPanel);
contentArea.addEventListener("pointerenter", showCursorInfoPanel, true);
contentArea.addEventListener("mouseenter", showCursorInfoPanel, true);

contentArea.addEventListener("pointerleave", event => {
  if (canUseCursorPanel(event)) {
    resetAllInfoPanelPositions();
    clearActiveInfoHost();
  }
});

contentArea.addEventListener("touchstart", event => {
  const canShowBulkUploadInfo = editMode && Boolean(event.target.closest(".bulk-file-picker"));

  if (editMode && !canShowBulkUploadInfo) {
    return;
  }

  const item = findInfoPanelHost(event.target);

  if (!item) {
    return;
  }

  const touch = event.touches && event.touches[0];
  const touchPoint = touch
    ? {
      clientX: touch.clientX,
      clientY: touch.clientY,
      pointerType: "touch",
      target: event.target
    }
    : null;
  longPressTouchPoint = touchPoint;

  longPressTimer = setTimeout(() => {
    const panel = item.querySelector(".info-popover");

    if (!panel) {
      return;
    }

    suppressNextTouchClick = true;
    stopProbabilityAutoScroll(probabilityDragState);
    removeProbabilityDragGhost(probabilityDragState);
    probabilityDragState?.button?.classList.remove("is-dragging");
    probabilityDragState?.button?.releasePointerCapture?.(probabilityDragState.pointerId);
    probabilityDragState = null;
    probabilityNativeDragId = "";
    probabilityNativeDragSource = "";
    probabilityNativeDropInsideUnwanted = false;
    setInfoPanelDragSuppressed(false);
    document.body.classList.remove("is-probability-pressing", "is-probability-dragging");
    clearProbabilityDragVisualState();
    closeTouchInfo();
    item.classList.add("is-open");
    activeTouchItem = item;
    positionInfoPanel(touchPoint || {
      clientX: window.innerWidth / 2,
      clientY: window.innerHeight / 2,
      pointerType: "touch",
      target: event.target
    }, panel);
    longPressTouchPoint = null;
  }, 520);
});

contentArea.addEventListener("touchend", () => {
  clearTimeout(longPressTimer);
  longPressTouchPoint = null;
});

contentArea.addEventListener("touchmove", event => {
  if (!longPressTouchPoint) {
    clearTimeout(longPressTimer);
    return;
  }

  const touch = event.touches && event.touches[0];

  if (!touch) {
    clearTimeout(longPressTimer);
    longPressTouchPoint = null;
    return;
  }

  const distance = Math.hypot(
    touch.clientX - longPressTouchPoint.clientX,
    touch.clientY - longPressTouchPoint.clientY
  );

  if (distance > 14) {
    clearTimeout(longPressTimer);
    longPressTouchPoint = null;
  }
});

document.addEventListener("click", event => {
  if (
    floatingMenu.classList.contains("is-open") &&
    !event.target.closest("#floatingMenu") &&
    !event.target.closest("#menuButton")
  ) {
    closeMenu();
  }

  if (!event.target.closest(".livly-dd-symbol-wrap")) {
    closeDdSymbolMenus();
  }

  if (!event.target.closest(".edit-action-panel")) {
    closeEditActionPanel();
  }

  if (!findInfoPanelHost(event.target)) {
    closeTouchInfo();
  }
});

document.addEventListener("pointermove", event => {
  if (editMode) {
    if (activeInfoHost?.classList.contains("bulk-file-picker") && !event.target.closest(".bulk-file-picker")) {
      closeTouchInfo();
    }
    return;
  }

  if (!activeInfoHost || !canUseCursorPanel(event)) {
    return;
  }

  if (!findInfoPanelHost(event.target)) {
    resetAllInfoPanelPositions();
    clearActiveInfoHost();
  }
});

document.addEventListener("dragstart", event => {
  if (
    activeRoute === "personalityProbability" &&
    event.target.closest("[data-probability-personality], [data-probability-unwanted-personality]")
  ) {
    return;
  }

  if (activeRoute === "exp" && event.target.closest("[data-exp-column-drag]")) {
    return;
  }

  event.preventDefault();
});

modalBody.addEventListener("click", event => {
  const action = event.target.dataset.action;

  if (action === "add-ability") {
    addNestedRow("ability");
  }

  if (action === "add-dd") {
    addNestedRow("dd");
  }

  if (action === "delete-row") {
    const row = event.target.closest(".modal-nested-row");
    row.remove();
  }
});

modalSaveButton.addEventListener("click", saveEditor);
modalDeleteButton.addEventListener("click", deleteCurrentItem);
modalCancelButton.addEventListener("click", closeEditor);
modalCloseButton.addEventListener("click", closeEditor);

itemModal.addEventListener("click", event => {
  if (event.target === itemModal) {
    closeEditor();
  }
});

menuButton.addEventListener("click", () => {
  closeTouchInfo();
  floatingMenu.classList.toggle("is-open");
  menuButton.textContent = "•••";
});

window.addEventListener("hashchange", () => {
  switchRoute(getInitialRoute());
});

initializeFirebaseAuthUi();
renderView();

setTimeout(() => {
  document.body.classList.add("is-loaded");
}, 1100);

function updateViewportSizeBadge() {
  let badge = document.getElementById("viewportSizeBadge");

  if (!editMode) {
    badge?.remove();
    return;
  }

  if (!badge) {
    badge = document.createElement("div");
    badge.id = "viewportSizeBadge";
    badge.className = "viewport-size-badge";
    badge.setAttribute("aria-live", "polite");
    document.body.appendChild(badge);
  }

  const width = document.documentElement.clientWidth;
  const height = window.innerHeight;
  badge.textContent = `${width}px × ${height}px`;
}

updateViewportSizeBadge();
window.addEventListener("resize", () => {
  updateViewportSizeBadge();
  syncCardColumnSliderLimits();
  scheduleLivlyHeaderFit();
  scheduleMaterialHeaderFit();
  scheduleMaterialNameEditPanel();
  scheduleMaterialSeriesEditPanel();
});

if (window.visualViewport) {
  window.visualViewport.addEventListener("resize", () => {
    updateViewportSizeBadge();
    syncCardColumnSliderLimits();
    scheduleLivlyHeaderFit();
    scheduleMaterialHeaderFit();
    scheduleMaterialNameEditPanel();
    scheduleMaterialSeriesEditPanel();
  });
}
