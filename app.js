const tarotCards = [
  { name: "THE FOOL", symbol: "0", reading: "오늘은 먼저 말 거는 쪽이 이깁니다. 이상해도 시작하면 운이 따라옵니다." },
  { name: "THE LOVERS", symbol: "VI", reading: "서로 취향 하나만 맞아도 대화가 길어집니다. 좋아하는 걸 하나 물어보세요." },
  { name: "THE STAR", symbol: "XVII", reading: "칭찬운이 좋습니다. 관찰한 걸 짧게 말하면 분위기가 풀립니다." },
  { name: "THE MAGICIAN", symbol: "I", reading: "말재주보다 타이밍입니다. 눈 마주치면 바로 한마디." },
  { name: "WHEEL", symbol: "X", reading: "우연처럼 보이는 질문이 오늘의 연결이 됩니다." },
  { name: "THE SUN", symbol: "XIX", reading: "가볍고 밝은 말이 잘 먹힙니다. 복잡하게 가지 마세요." },
  { name: "THE MOON", symbol: "XVIII", reading: "상대의 진짜 마음보다 지금 분위기를 먼저 보세요. 천천히 열면 됩니다." },
  { name: "TEMPERANCE", symbol: "XIV", reading: "밀고 당기기보다 리듬이 중요합니다. 질문 하나, 리액션 하나면 충분합니다." },
];

const AI_ENDPOINT = "https://iwravorcdoswhssmnzue.supabase.co/functions/v1/signal-ai";

const flirtLines = [
  "오늘 여기 조명보다 방금 웃은 게 더 기억에 남는데요.",
  "이 질문 좀 이상한데, 오늘 본 사람 중에 제일 말 걸기 쉬워 보였어요.",
  "혹시 원래 이렇게 자연스럽게 웃어요?",
  "제가 지금 말 걸 타이밍을 놓치면 후회할 것 같아서요.",
  "첫인상 하나만 말해도 돼요? 생각보다 되게 편해 보여요.",
  "오늘 대화 운 테스트 중인데, 첫 상대가 꽤 좋은 것 같아요.",
];

const rouletteQuestions = [
  "사랑으로 2행시 지어보세요. 바로요.",
  "내가 갑자기 좀비가 되면 3초 안에 뭐라고 할 거예요?",
  "첫 데이트 장소가 편의점이면 뭘 사야 성공일까요?",
  "지금 이 공간에 BGM을 깐다면 무슨 노래예요?",
  "상대가 고백했는데 랩으로만 말하면 받아줄 수 있어요?",
  "오늘 내 매력을 게임 스탯으로 나누면 어디에 몰빵했어요?",
  "내가 AI라면 지금 당신한테 어떤 추천을 띄울까요?",
  "사람을 처음 볼 때 제일 먼저 보는 건 신발, 말투, 눈빛 중 뭐예요?",
  "지금부터 10초 동안 아무 이유 없이 서로 칭찬하기 가능?",
  "연애 프로그램에 나가면 내 소개 자막은 뭐라고 뜰까요?",
];

const balanceSeeds = [
  { name: "장원영", group: "IVE", accent: "#111111" },
  { name: "안유진", group: "IVE", accent: "#2b2b2b" },
  { name: "리즈", group: "IVE", accent: "#444444" },
  { name: "카리나", group: "aespa", accent: "#111111" },
  { name: "윈터", group: "aespa", accent: "#343434" },
  { name: "닝닝", group: "aespa", accent: "#555555" },
  { name: "제니", group: "BLACKPINK", accent: "#111111" },
  { name: "로제", group: "BLACKPINK", accent: "#2f2f2f" },
  { name: "리사", group: "BLACKPINK", accent: "#4d4d4d" },
  { name: "김채원", group: "LE SSERAFIM", accent: "#111111" },
  { name: "사쿠라", group: "LE SSERAFIM", accent: "#303030" },
  { name: "허윤진", group: "LE SSERAFIM", accent: "#505050" },
  { name: "원희", group: "ILLIT", accent: "#111111" },
  { name: "민주", group: "ILLIT", accent: "#353535" },
  { name: "설윤", group: "NMIXX", accent: "#111111" },
  { name: "마스다 아야노", group: "CUTIE STREET", accent: "#1f4f8f" },
];

let mode = "roulette";
let currentText = rouletteQuestions[0];
let bracket = [];
let nextRound = [];
let matchIndex = 0;
let roundSize = 16;
let tarotChoices = [];
const drawBags = {
  tarot: [],
  flirt: [],
  roulette: [],
};

const $ = (selector) => document.querySelector(selector);

function shuffle(list) {
  return [...list].sort(() => Math.random() - 0.5);
}

function drawFromBag(name, list) {
  if (!drawBags[name].length) {
    drawBags[name] = shuffle(list);
  }
  return drawBags[name].pop();
}

function svgData(markup) {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(markup)}`;
}

function idolImage(person) {
  const initials = person.name.replace(/\s+/g, "").slice(0, 2);
  return svgData(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 480">
      <rect width="360" height="480" fill="#f7f7f4"/>
      <rect x="18" y="18" width="324" height="444" rx="20" fill="white" stroke="#111" stroke-width="3"/>
      <circle cx="180" cy="158" r="72" fill="${person.accent}"/>
      <path d="M84 386c12-82 76-126 96-126s84 44 96 126" fill="${person.accent}"/>
      <circle cx="156" cy="150" r="8" fill="white"/>
      <circle cx="204" cy="150" r="8" fill="white"/>
      <path d="M150 194c20 18 40 18 60 0" fill="none" stroke="white" stroke-width="8" stroke-linecap="round"/>
      <text x="180" y="84" text-anchor="middle" font-family="Arial, sans-serif" font-size="20" font-weight="800" fill="#111">${person.group}</text>
      <text x="180" y="438" text-anchor="middle" font-family="Arial, sans-serif" font-size="46" font-weight="900" fill="#111">${initials}</text>
    </svg>
  `);
}

function tarotImage(card, variant = "front", index = 1) {
  const label = card ? card.name : "SIGNAL";
  const symbol = card ? card.symbol : index;
  const fill = variant === "front" ? "#ffffff" : "#111111";
  const ink = variant === "front" ? "#111111" : "#ffffff";
  return svgData(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 480">
      <rect width="320" height="480" rx="28" fill="${fill}"/>
      <rect x="20" y="20" width="280" height="440" rx="18" fill="none" stroke="${ink}" stroke-width="4"/>
      <rect x="40" y="40" width="240" height="400" rx="12" fill="none" stroke="${ink}" stroke-width="2"/>
      <circle cx="160" cy="178" r="70" fill="none" stroke="${ink}" stroke-width="5"/>
      <path d="M160 90l20 58 62 2-50 36 18 60-50-36-50 36 18-60-50-36 62-2z" fill="${ink}" opacity="${variant === "front" ? "0.12" : "0.22"}"/>
      <text x="160" y="112" text-anchor="middle" font-family="Arial, sans-serif" font-size="28" font-weight="900" fill="${ink}">${symbol}</text>
      <text x="160" y="286" text-anchor="middle" font-family="Arial, sans-serif" font-size="22" font-weight="900" fill="${ink}">LOVE TAROT</text>
      <text x="160" y="342" text-anchor="middle" font-family="Arial, sans-serif" font-size="32" font-weight="900" fill="${ink}">${label}</text>
    </svg>
  `);
}

function toast(text) {
  $("#toast").textContent = text;
  $("#toast").classList.add("show");
  setTimeout(() => $("#toast").classList.remove("show"), 1300);
}

function setStage(kicker, title, body, actionsHtml) {
  $("#stageKicker").textContent = kicker;
  $("#stageTitle").textContent = title;
  $("#stageBody").textContent = body || "";
  $("#stageBody").hidden = !body;
  $("#stageActions").innerHTML = actionsHtml;
}

function openResultModal(kicker, title, body, extraHtml = "") {
  $("#modalKicker").textContent = kicker;
  $("#modalTitle").textContent = title;
  $("#modalBody").textContent = body || "";
  $("#modalExtra").innerHTML = extraHtml;
  $("#resultModal").hidden = false;
}

function closeResultModal() {
  $("#resultModal").hidden = true;
}

async function generateAiText(kind, fallbackText) {
  try {
    const response = await fetch(AI_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kind, fallback: fallbackText }),
    });
    if (!response.ok) throw new Error("AI unavailable");
    const data = await response.json();
    return data.text || fallbackText;
  } catch {
    return fallbackText;
  }
}

function renderTarot() {
  tarotChoices = [drawFromBag("tarot", tarotCards), drawFromBag("tarot", tarotCards), drawFromBag("tarot", tarotCards)];
  currentText = "오늘의 타로 카드 3장 중 한 장을 고르세요.";
  setStage(
    "LOVE TAROT",
    "오늘의 카드 3장",
    "",
    tarotChoices
      .map(
        (_, index) => `
          <button class="tarot-card" data-tarot-index="${index}" aria-label="${index + 1}번 타로 카드 선택">
            <span class="tarot-back">
              <img src="${tarotImage(null, "back", index + 1)}" alt="${index + 1}번 타로 카드" />
            </span>
          </button>
        `
      )
      .join("")
  );
}

function chooseTarot(index) {
  const card = tarotChoices[index];
  if (!card) return;
  currentText = `${card.name}: ${card.reading}`;
  openResultModal(
    "TODAY'S TAROT",
    card.name,
    card.reading,
    `
      <div class="tarot-result">
        <div class="tarot-face">
          <img src="${tarotImage(card, "front")}" alt="${card.name} 타로 카드" />
        </div>
      </div>
    `
  );
}

function renderFlirt() {
  setStage(
    "FLIRTING LINE",
    "플러팅 멘트",
    "",
    `<button class="primary" id="drawButton">뽑기</button>`
  );
}

function renderRoulette() {
  setStage(
    "QUESTION ROULETTE",
    "질문 룰렛",
    "",
    `<button class="primary" id="drawButton">뽑기</button>`
  );
}

async function openFlirtResult() {
  const fallback = drawFromBag("flirt", flirtLines);
  openResultModal("FLIRTING LINE", "생성 중...", "");
  currentText = await generateAiText("flirt", fallback);
  openResultModal("FLIRTING LINE", currentText, "");
}

async function openRouletteResult() {
  const fallback = drawFromBag("roulette", rouletteQuestions);
  openResultModal("QUESTION ROULETTE", "생성 중...", "");
  currentText = await generateAiText("roulette", fallback);
  openResultModal("QUESTION ROULETTE", currentText, "");
}

function startBalance() {
  bracket = shuffle(balanceSeeds);
  nextRound = [];
  matchIndex = 0;
  roundSize = 16;
  renderBalanceMatch();
}

function renderBalanceMatch() {
  if (bracket.length === 1) {
    const winner = bracket[0];
    currentText = `${winner.name} · ${winner.group}`;
    setStage(
      "BALANCE WINNER",
      winner.name,
      "",
      `<button class="primary" id="drawButton">다시 16강</button><button id="copyButton">복사</button>`
    );
    openResultModal(
      "BALANCE WINNER",
      winner.name,
      winner.group,
      `<div class="winner-image"><img src="${idolImage(winner)}" alt="${winner.name} 이미지 카드" /></div>`
    );
    return;
  }

  if (matchIndex >= bracket.length) {
    bracket = nextRound;
    nextRound = [];
    matchIndex = 0;
    roundSize = bracket.length;
  }

  const left = bracket[matchIndex];
  const right = bracket[matchIndex + 1];
  const currentRound = roundSize === 2 ? "FINAL" : `${roundSize}강`;
  const progress = `${Math.floor(matchIndex / 2) + 1}/${Math.floor(bracket.length / 2)}`;
  currentText = `${left.name} vs ${right.name}`;
  setStage(
    `BALANCE ${currentRound} ${progress}`,
    "둘 중 더 끌리는 쪽은?",
    "",
    `
      <button class="choice choice-card" data-choice-index="0">
        <img src="${idolImage(left)}" alt="${left.name} 이미지 카드" />
        <span>${left.group}</span>
        <strong>${left.name}</strong>
      </button>
      <button class="choice choice-card" data-choice-index="1">
        <img src="${idolImage(right)}" alt="${right.name} 이미지 카드" />
        <span>${right.group}</span>
        <strong>${right.name}</strong>
      </button>
    `
  );
}

function chooseBalance(choiceIndex) {
  const picked = bracket[matchIndex + choiceIndex];
  if (!picked) return;
  nextRound.push(picked);
  matchIndex += 2;
  renderBalanceMatch();
}

function setMode(nextMode) {
  mode = nextMode;
  document.querySelectorAll(".tile").forEach((tile) => tile.classList.toggle("active", tile.dataset.mode === mode));
  if (mode === "tarot") renderTarot();
  if (mode === "balance") startBalance();
  if (mode === "flirt") renderFlirt();
  if (mode === "roulette") renderRoulette();
}

async function copyCurrent() {
  try {
    await navigator.clipboard.writeText(currentText);
    toast("복사했습니다.");
  } catch {
    toast("복사 실패");
  }
}

async function shareApp() {
  const url = location.href.split("?")[0];
  if (navigator.share) {
    try {
      await navigator.share({ title: "Signal", text: "LOL Signal", url });
      return;
    } catch {
      return;
    }
  }
  try {
    await navigator.clipboard.writeText(url);
    toast("링크를 복사했습니다.");
  } catch {
    toast("공유 실패");
  }
}

function renderQr() {
  const url = encodeURIComponent(location.href.split("?")[0]);
  $("#qrImage").src = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&margin=12&data=${url}`;
}

document.querySelectorAll(".tile").forEach((tile) => {
  tile.addEventListener("click", () => setMode(tile.dataset.mode));
});

document.addEventListener("click", (event) => {
  if (event.target.id === "drawButton") {
    if (mode === "tarot") renderTarot();
    if (mode === "balance") startBalance();
    if (mode === "flirt") openFlirtResult();
    if (mode === "roulette") openRouletteResult();
  }
  if (event.target.id === "copyButton") copyCurrent();
  const choiceButton = event.target.closest("[data-choice-index]");
  if (choiceButton) chooseBalance(Number(choiceButton.dataset.choiceIndex));
  const tarotButton = event.target.closest("[data-tarot-index]");
  if (tarotButton) chooseTarot(Number(tarotButton.dataset.tarotIndex));
});

$("#shareTop").addEventListener("click", shareApp);
$("#shareMain").addEventListener("click", shareApp);
$("#modalClose").addEventListener("click", closeResultModal);
$("#modalCopy").addEventListener("click", copyCurrent);
$("#resultModal").addEventListener("click", (event) => {
  if (event.target.id === "resultModal") closeResultModal();
});

renderQr();
setMode("roulette");
