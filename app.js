let characterData = {};

const characterSelect = document.getElementById("characterSelect");
const levelSelect = document.getElementById("levelSelect");
const calculateButton = document.getElementById("calculateButton");
const result = document.getElementById("result");

// data.jsonを読み込む
fetch("data.json")
  .then(response => response.json())
  .then(data => {
    characterData = data.characters;
    setCharacterOptions();
  })
  .catch(error => {
    result.innerHTML = "データの読み込みに失敗しました。";
    console.error(error);
  });

// キャラクター選択欄を作る
function setCharacterOptions() {
  Object.keys(characterData).forEach(characterId => {
    const character = characterData[characterId];

    const option = document.createElement("option");
    option.value = characterId;
    option.textContent = character.name;

    characterSelect.appendChild(option);
  });
}

// キャラクターを選んだらレベル選択欄を作る
characterSelect.addEventListener("change", () => {
  const characterId = characterSelect.value;

  levelSelect.innerHTML = "";

  if (!characterId) {
    const option = document.createElement("option");
    option.value = "";
    option.textContent = "先にキャラクターを選んでください";
    levelSelect.appendChild(option);
    return;
  }

  const levels = characterData[characterId].levels;

  Object.keys(levels).forEach(level => {
    const option = document.createElement("option");
    option.value = level;
    option.textContent = `Lv.${level}`;

    levelSelect.appendChild(option);
  });
});

// 計算ボタン
calculateButton.addEventListener("click", () => {
  const characterId = characterSelect.value;
  const level = levelSelect.value;

  if (!characterId || !level) {
    result.innerHTML = "キャラクターとレベルを選んでください。";
    return;
  }

  const character = characterData[characterId];
  const stats = character.levels[level];

  const power = stats.attack + stats.defense;

  result.innerHTML = `
    <strong>${character.name} / Lv.${level}</strong><br>
    HP：${stats.hp}<br>
    攻撃：${stats.attack}<br>
    防御：${stats.defense}<br>
    戦力：${power}
  `;
});
const menuButton = document.getElementById("menuButton");
const floatingMenu = document.getElementById("floatingMenu");

menuButton.addEventListener("click", () => {
  floatingMenu.classList.toggle("is-open");

  if (floatingMenu.classList.contains("is-open")) {
    menuButton.textContent = "×";
  } else {
    menuButton.textContent = "☰";
  }
});