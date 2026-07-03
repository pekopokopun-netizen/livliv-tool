const livlivToolStorageKey = "livlivToolData";
const defaultMaterialTagNames = ["エッセンス", "アニマ", "エレメント", "虫", "タマシイ", "ハウス", "その他"];

const defaultData = {
  livlies: [],
  personalities: [
    { id: "personality-goriki", name: "剛力", content: "", modificationRate: "7.80%" },
    { id: "personality-hiyowa", name: "ひ弱", content: "", modificationRate: "3.30%" },
    { id: "personality-mushi-hunter", name: "虫ハンター", content: "", modificationRate: "4.80%" },
    { id: "personality-element-hunter", name: "エレメントハンター", content: "", modificationRate: "4.80%" },
    { id: "personality-anima-hunter", name: "アニマハンター", content: "", modificationRate: "4.80%" },
    { id: "personality-kaiben", name: "快便", content: "", modificationRate: "10.40%" },
    { id: "personality-benpi", name: "便秘", content: "", modificationRate: "4.50%" },
    { id: "personality-sousei", name: "早成", content: "", modificationRate: "10.40%" },
    { id: "personality-bansei", name: "晩成", content: "", modificationRate: "4.50%" },
    { id: "personality-koukatsuryoku", name: "高活力", content: "", modificationRate: "7.80%" },
    { id: "personality-teikatsuryoku", name: "低活力", content: "", modificationRate: "3.30%" },
    { id: "personality-joubu", name: "丈夫", content: "", modificationRate: "10.40%" },
    { id: "personality-nanjaku", name: "軟弱", content: "", modificationRate: "4.50%" },
    { id: "personality-shoushoku", name: "少食", content: "", modificationRate: "10.40%" },
    { id: "personality-taishoku", name: "大食", content: "", modificationRate: "4.50%" },
    { id: "personality-kenkyaku", name: "健脚", content: "", modificationRate: "3.70%" }
  ],
  personalitySlotRates: {
    zeroRate: "0.00%",
    oneRate: "40.00%",
    twoRate: "60.00%"
  },
  livlyOptionSets: {
    movementTypes: ["飛行", "跳躍", "遊泳", "歩行", "夜行"],
    movementPowers: ["1", "2", "3", "4", "5", "6"]
  },
  livlyFieldDescriptions: {
    species: "リブリーの種類です。",
    feature: "リブリーの特徴です。",
    hpLevels: "レベルごとのHPです。",
    fullness: "満腹量です。",
    ddEmissions: "レベルごとのdd排出量です。",
    facilitySuitability: "施設で活躍しやすいかを表します。",
    movementTypes: "移動タイプです。",
    movementPowers: "移動力です。",
    handLevels: "レベルごとの手札枚数です。",
    attackLevels: "レベルごとの攻撃力です。",
    waza: "使える/wazaです。",
    favorite: "得意なことです。"
  },
  materials: [],
  materialSeriesTags: [],
  experienceColumns: [
    { id: "normal", type: "normal", label: "通常", personalityId: "" },
    { id: "personality-sousei", type: "personality", label: "早成", personalityId: "personality-sousei" },
    { id: "personality-bansei", type: "personality", label: "晩成", personalityId: "personality-bansei" }
  ],
  experienceTable: Array.from({ length: 9 }, (_, index) => ({
    id: `experience-${index + 1}`,
    level: String(index + 1),
    values: {
      normal: "",
      "personality-sousei": "",
      "personality-bansei": ""
    }
  })),
  experienceMaxRebirths: "15",
  ddCalculationTables: [],
  ddHouseRows: [
    {
      id: "dd-house-1",
      livlyId: "",
      level: "1",
      rebirth: "0",
      variant: "normal",
      hasPersonality: false,
      hasRebirthAbility: false
    }
  ]
};

function copyData(data) {
  return JSON.parse(JSON.stringify(data));
}

function createFallbackId(prefix) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function textValue(value) {
  return value == null ? "" : String(value);
}

function normalizeAbilities(abilities) {
  if (!Array.isArray(abilities)) {
    return [];
  }

  return abilities.map(ability => ({
    id: textValue(ability.id) || createFallbackId("ability"),
    name: textValue(ability.name),
    content: textValue(ability.content)
  }));
}

function normalizeDdDrops(ddDrops) {
  if (!Array.isArray(ddDrops)) {
    return [];
  }

  return ddDrops.map(ddDrop => ({
    id: textValue(ddDrop.id) || createFallbackId("dd"),
    level: textValue(ddDrop.level),
    amount: textValue(ddDrop.amount)
  }));
}

function normalizedLevelSortValue(value) {
  const text = textValue(value)
    .trim()
    .replace(/[０-９]/g, char => String.fromCharCode(char.charCodeAt(0) - 0xfee0))
    .replace(/。/g, ".");
  const match = text.match(/\d+(?:\.\d+)?/);

  return match ? Number(match[0]) : Number.POSITIVE_INFINITY;
}

function sortLevelRowsByLevel(rows) {
  return rows
    .map((row, index) => ({ row, index }))
    .sort((left, right) => {
      const levelDiff = normalizedLevelSortValue(left.row.level) - normalizedLevelSortValue(right.row.level);

      return levelDiff || left.index - right.index;
    })
    .map(item => item.row);
}

function normalizeLevelRows(rows, prefix) {
  const source = Array.isArray(rows) && rows.length ? rows : [{ level: "1", value: "" }];

  return sortLevelRowsByLevel(source.map(row => ({
    id: textValue(row.id) || createFallbackId(prefix),
    level: textValue(row.level) || "1",
    value: textValue(row.value)
  })));
}

function normalizeDdEmissionRows(rows, oldDdDrops) {
  const fallbackRows = Array.isArray(oldDdDrops) && oldDdDrops.length
    ? oldDdDrops.map(row => ({ level: row.level, blackCount: "0", whiteCount: "0" }))
    : [{ level: "1", blackCount: "0", whiteCount: "0" }];
  const source = Array.isArray(rows) && rows.length ? rows : fallbackRows;

  return sortLevelRowsByLevel(source.map(row => ({
    id: textValue(row.id) || createFallbackId("dd-emission"),
    level: textValue(row.level) || "1",
    blackCount: textValue(row.blackCount || "0"),
    whiteCount: textValue(row.whiteCount || "0")
  })));
}

function normalizeSelectedList(values) {
  if (!Array.isArray(values)) {
    return [];
  }

  return values.map(textValue).filter(Boolean);
}

function normalizeLivlies(livlies) {
  if (!Array.isArray(livlies)) {
    return [];
  }

  return livlies.map(livly => ({
    id: textValue(livly.id) || createFallbackId("livly"),
    name: textValue(livly.name),
    imageUrl: textValue(livly.imageUrl),
    species: textValue(livly.species),
    feature: textValue(livly.feature),
    hpLevels: normalizeLevelRows(livly.hpLevels, "hp"),
    fullness: textValue(livly.fullness),
    ddEmissions: normalizeDdEmissionRows(livly.ddEmissions, livly.ddDrops),
    facilitySuitability: textValue(livly.facilitySuitability),
    movementTypes: normalizeSelectedList(livly.movementTypes),
    movementPowers: normalizeSelectedList(livly.movementPowers),
    handLevels: normalizeLevelRows(livly.handLevels, "hand"),
    attackLevels: normalizeLevelRows(livly.attackLevels, "attack"),
    waza: textValue(livly.waza),
    favorite: textValue(livly.favorite)
  }));
}

function normalizePersonalities(personalities) {
  if (!Array.isArray(personalities)) {
    return [];
  }

  return personalities.map(personality => ({
    id: textValue(personality.id) || createFallbackId("personality"),
    name: textValue(personality.name),
    content: textValue(personality.content),
    modificationRate: textValue(personality.modificationRate)
  }));
}

function normalizeMaterials(materials, materialSeriesTags = []) {
  if (!Array.isArray(materials)) {
    return [];
  }

  return materials.map(material => ({
    id: textValue(material.id) || createFallbackId("material"),
    name: textValue(material.name),
    imageUrl: textValue(material.imageUrl),
    tags: normalizeMaterialTagList(material.tags, material.tag),
    seriesTags: normalizeMaterialSeriesList(material.seriesTags, material.seriesTag, materialSeriesTags),
    content: textValue(material.content),
    effect: textValue(material.effect),
    acquisitionMethod: textValue(material.acquisitionMethod),
    purchasePrice: textValue(material.purchasePrice),
    tradePrice: textValue(material.tradePrice),
    merchantTradePrice: textValue(material.merchantTradePrice),
    buybackPrice: textValue(material.buybackPrice)
  }));
}

function normalizeMaterialTagList(tags, legacyTag) {
  const source = Array.isArray(tags)
    ? tags
    : legacyTag
      ? [legacyTag]
      : ["その他"];
  const cleanTags = [...new Set(source.map(textValue).filter(tag => defaultMaterialTagNames.includes(tag)))];

  return cleanTags.length ? cleanTags : ["その他"];
}

function normalizeMaterialSeriesTags(seriesTags, materials) {
  const sourceTags = Array.isArray(seriesTags) ? seriesTags.map(textValue) : [];
  const materialTags = Array.isArray(materials)
    ? materials.flatMap(material => {
        if (Array.isArray(material.seriesTags)) {
          return material.seriesTags.map(textValue);
        }

        return material.seriesTag ? [textValue(material.seriesTag)] : [];
      })
    : [];

  return [...new Set([...sourceTags, ...materialTags].map(tag => tag.trim()).filter(Boolean))];
}

function normalizeMaterialSeriesList(seriesTags, legacySeriesTag, materialSeriesTags = []) {
  const source = Array.isArray(seriesTags)
    ? seriesTags
    : legacySeriesTag
      ? [legacySeriesTag]
      : [];
  const allowedTags = new Set(materialSeriesTags);

  return [...new Set(source.map(textValue).map(tag => tag.trim()).filter(tag => tag && (!allowedTags.size || allowedTags.has(tag))))];
}

function normalizeExperienceColumns(columns) {
  const source = Array.isArray(columns) && columns.length ? columns : defaultData.experienceColumns;
  const usedIds = new Set();
  const normalizedColumns = source.map(column => {
    const personalityId = textValue(column.personalityId);
    const baseId = textValue(column.id) || personalityId || createFallbackId("experience-column");
    const id = usedIds.has(baseId) ? createFallbackId("experience-column") : baseId;

    usedIds.add(id);

    return {
      id,
      type: textValue(column.type) || (personalityId ? "personality" : "normal"),
      label: textValue(column.label) || (personalityId ? "" : "通常"),
      personalityId
    };
  });

  if (!normalizedColumns.some(column => column.type === "normal")) {
    normalizedColumns.unshift({ id: "normal", type: "normal", label: "通常", personalityId: "" });
  }

  return normalizedColumns;
}

function legacyExperienceValue(row, column) {
  if (row.values && typeof row.values === "object" && row.values[column.id] != null) {
    return row.values[column.id];
  }

  if (column.id === "normal" && row.normal != null) {
    return row.normal;
  }

  if (column.personalityId === "personality-sousei" && row.early != null) {
    return row.early;
  }

  if (column.personalityId === "personality-bansei" && row.late != null) {
    return row.late;
  }

  return row[column.id];
}

function normalizeExperienceTable(rows, columns = defaultData.experienceColumns) {
  const source = Array.isArray(rows) ? rows : defaultData.experienceTable;

  return source.map(row => ({
    id: textValue(row.id) || createFallbackId("experience"),
    level: textValue(row.level),
    values: columns.reduce((values, column) => {
      values[column.id] = textValue(legacyExperienceValue(row, column));
      return values;
    }, {})
  }));
}

function normalizeDdCalculationTables(tables) {
  if (!Array.isArray(tables)) {
    return [];
  }

  return tables.map(table => ({
    id: textValue(table.id) || createFallbackId("dd-table"),
    livlyId: textValue(table.livlyId),
    rows: Array.isArray(table.rows)
      ? table.rows.map(row => ({
        id: textValue(row.id) || createFallbackId("dd-rate"),
        level: textValue(row.level),
        rebirth: textValue(row.rebirth) || (row.hasRebirthAbility || textValue(row.variant) === "rebirthKaiben" ? "1" : "0"),
        variant: textValue(row.variant) === "rebirthKaiben" ? "kaiben" : textValue(row.variant) || (row.hasPersonality ? "kaiben" : "normal"),
        hasPersonality: Boolean(row.hasPersonality),
        hasRebirthAbility: Boolean(row.hasRebirthAbility),
        amount: textValue(row.amount)
      }))
      : []
  }));
}

function normalizeDdHouseRows(rows) {
  const source = Array.isArray(rows) && rows.length ? rows : defaultData.ddHouseRows;

  return source.map(row => ({
    id: textValue(row.id) || createFallbackId("dd-house"),
    livlyId: textValue(row.livlyId),
    level: textValue(row.level) || "1",
    rebirth: textValue(row.rebirth) || (row.hasRebirthAbility || textValue(row.variant) === "rebirthKaiben" ? "1" : "0"),
    variant: textValue(row.variant) === "rebirthKaiben" ? "kaiben" : textValue(row.variant) || (row.hasPersonality ? "kaiben" : "normal"),
    hasPersonality: Boolean(row.hasPersonality),
    hasRebirthAbility: Boolean(row.hasRebirthAbility)
  }));
}

function normalizePersonalitySlotRates(rates) {
  const source = rates && typeof rates === "object" ? rates : defaultData.personalitySlotRates;

  return {
    zeroRate: textValue(source.zeroRate || defaultData.personalitySlotRates.zeroRate),
    oneRate: textValue(source.oneRate || defaultData.personalitySlotRates.oneRate),
    twoRate: textValue(source.twoRate || defaultData.personalitySlotRates.twoRate)
  };
}

function normalizeLivlyOptionSets(optionSets) {
  const source = optionSets && typeof optionSets === "object" ? optionSets : defaultData.livlyOptionSets;
  const movementTypes = Array.isArray(source.movementTypes) && source.movementTypes.length
    ? source.movementTypes
    : defaultData.livlyOptionSets.movementTypes;
  const movementPowers = Array.isArray(source.movementPowers) && source.movementPowers.length
    ? source.movementPowers
    : defaultData.livlyOptionSets.movementPowers;

  return {
    movementTypes: movementTypes.map(textValue).filter(Boolean),
    movementPowers: movementPowers.map(textValue).filter(Boolean)
  };
}

function normalizeLivlyFieldDescriptions(descriptions) {
  const source = descriptions && typeof descriptions === "object"
    ? descriptions
    : defaultData.livlyFieldDescriptions;

  return Object.keys(defaultData.livlyFieldDescriptions).reduce((result, key) => {
    result[key] = textValue(source[key] || defaultData.livlyFieldDescriptions[key]);
    return result;
  }, {});
}

function normalizeAppData(data) {
  const source = data && typeof data === "object" ? data : defaultData;
  const experienceColumns = normalizeExperienceColumns(source.experienceColumns);
  const materialSeriesTags = normalizeMaterialSeriesTags(source.materialSeriesTags, source.materials);

  return {
    livlies: normalizeLivlies(source.livlies),
    personalities: normalizePersonalities(source.personalities),
    personalitySlotRates: normalizePersonalitySlotRates(source.personalitySlotRates),
    livlyOptionSets: normalizeLivlyOptionSets(source.livlyOptionSets),
    livlyFieldDescriptions: normalizeLivlyFieldDescriptions(source.livlyFieldDescriptions),
    materials: normalizeMaterials(source.materials, materialSeriesTags),
    materialSeriesTags,
    experienceColumns,
    experienceTable: normalizeExperienceTable(source.experienceTable, experienceColumns),
    experienceMaxRebirths: textValue(source.experienceMaxRebirths || defaultData.experienceMaxRebirths),
    ddCalculationTables: normalizeDdCalculationTables(source.ddCalculationTables),
    ddHouseRows: normalizeDdHouseRows(source.ddHouseRows)
  };
}

function loadAppData() {
  const savedData = localStorage.getItem(livlivToolStorageKey);

  if (!savedData) {
    return copyData(defaultData);
  }

  try {
    return normalizeAppData(JSON.parse(savedData));
  } catch (error) {
    console.warn("保存データを読み込めませんでした。", error);
    return copyData(defaultData);
  }
}

function saveAppData(data) {
  const normalizedData = normalizeAppData(data);
  localStorage.setItem(livlivToolStorageKey, JSON.stringify(normalizedData));
  return normalizedData;
}

window.defaultData = defaultData;
window.normalizeAppData = normalizeAppData;
window.loadAppData = loadAppData;
window.saveAppData = saveAppData;
