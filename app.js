const tarotCards = [
  { name: "THE MOON MIRROR", image: "./assets/tarot/card-1.png", reading: "오늘은 서두르기보다 분위기를 읽는 쪽이 유리합니다. 눈이 자주 마주치는 사람이 있다면 가볍게 웃고, 바로 깊은 질문보다 지금 공간에 대한 한마디로 시작해보세요." },
  { name: "THE STAR HANDS", image: "./assets/tarot/card-2.png", reading: "칭찬과 리액션 운이 좋습니다. 상대의 스타일, 말투, 선택한 게임 같은 구체적인 포인트를 짧게 말하면 대화가 부드럽게 열립니다." },
  { name: "THE DISCO SUN", image: "./assets/tarot/card-3.png", reading: "밝고 장난스러운 에너지가 잘 맞는 카드입니다. 너무 멋있게 보이려 하기보다 지금 떠오른 가벼운 질문 하나를 던져보세요. 웃음이 먼저 오면 대화는 따라옵니다." },
  { name: "THE ORBIT WHEEL", image: "./assets/tarot/card-4.png", reading: "오늘의 연결은 우연처럼 들어옵니다. 평소라면 지나칠 사람에게 한 번 더 시선을 두세요. 짧은 게임 초대나 질문 룰렛이 좋은 출발점이 됩니다." },
  { name: "THE SIGNAL MAGICIAN", image: "./assets/tarot/card-5.png", reading: "말재주보다 타이밍이 중요한 카드입니다. 이미 신호는 충분합니다. 망설이다가 흐름을 놓치기 전에, 지금 바로 한 문장만 건네보세요." },
];

const AI_ENDPOINT = "https://isfrmnswcltmafnptmru.supabase.co/functions/v1/signal-ai";

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
  {
    name: "장원영",
    group: "IVE",
    image: "./assets/profile-cards/wonyoung.jpg",
    focus: "50% 20%",
  },
  {
    name: "안유진",
    group: "IVE",
    image: "./assets/profile-cards/yujin.jpg",
    focus: "50% 22%",
  },
  {
    name: "리즈",
    group: "IVE",
    image: "./assets/profile-cards/liz.jpg",
    focus: "50% 20%",
  },
  {
    name: "카리나",
    group: "aespa",
    image: "./assets/profile-cards/karina.jpg",
    focus: "50% 18%",
  },
  {
    name: "윈터",
    group: "aespa",
    image: "./assets/profile-cards/winter.jpg",
    focus: "50% 18%",
  },
  {
    name: "닝닝",
    group: "aespa",
    image: "./assets/profile-cards/ningning.jpg",
    focus: "50% 20%",
  },
  {
    name: "제니",
    group: "BLACKPINK",
    image: "./assets/profile-cards/jennie.jpg",
    focus: "50% 18%",
  },
  {
    name: "로제",
    group: "BLACKPINK",
    image: "./assets/profile-cards/rose.jpg",
    focus: "50% 22%",
  },
  {
    name: "리사",
    group: "BLACKPINK",
    image: "./assets/profile-cards/lisa.jpg",
    focus: "50% 18%",
  },
  {
    name: "김채원",
    group: "LE SSERAFIM",
    image: "./assets/profile-cards/chaewon.jpg",
    focus: "50% 22%",
  },
  {
    name: "사쿠라",
    group: "LE SSERAFIM",
    image: "./assets/profile-cards/sakura.jpg",
    focus: "50% 22%",
  },
  {
    name: "허윤진",
    group: "LE SSERAFIM",
    image: "./assets/profile-cards/yunjin.jpg",
    focus: "50% 22%",
  },
  {
    name: "원희",
    group: "ILLIT",
    image: "./assets/profile-cards/wonhee.jpg",
    focus: "50% 18%",
  },
  {
    name: "민주",
    group: "ILLIT",
    image: "./assets/profile-cards/minju.jpg",
    focus: "50% 20%",
  },
  {
    name: "설윤",
    group: "NMIXX",
    image: "./assets/profile-cards/sullyoon.jpg",
    focus: "50% 22%",
  },
  {
    name: "마스다 아야노",
    group: "CUTIE STREET",
    image: "./assets/profile-cards/ayano.jpg",
    focus: "50% 18%",
  },
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

function tarotImage(card, variant = "front", index = 1) {
  if (variant === "back") return "./assets/tarot/card-back.png";
  return card?.image || `./assets/tarot/card-${index}.png`;
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

function confettiHtml() {
  return `
    <div class="confetti" aria-hidden="true">
      ${Array.from({ length: 44 }, (_, index) => {
        const left = 5 + Math.random() * 90;
        const drift = -120 + Math.random() * 240;
        const rotate = Math.random() * 720;
        const delay = Math.random() * 0.35;
        const color = ["#ff4fb8", "#7c5cff", "#38d9ff", "#ffd166", "#ffffff"][index % 5];
        return `<i style="--left:${left}%;--drift:${drift}px;--rotate:${rotate}deg;--delay:${delay}s;--color:${color}"></i>`;
      }).join("")}
    </div>
  `;
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
  tarotChoices = Array.from({ length: 5 }, () => drawFromBag("tarot", tarotCards));
  currentText = "오늘의 타로 카드 5장 중 한 장을 고르세요.";
  setStage(
    "LOVE TAROT",
    "오늘의 카드 5장",
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
    "AI FLIRTING LINE",
    "AI 플러팅 멘트",
    "",
    `<button class="primary" id="drawButton">AI로 생성</button>`
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
  openResultModal("AI FLIRTING LINE", "생성 중...", "");
  currentText = await generateAiText("flirt", fallback);
  openResultModal("AI FLIRTING LINE", currentText, "");
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
      `${confettiHtml()}<div class="winner-image">${imageCard(winner)}</div>`
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
        ${imageCard(left)}
        <span>${left.group}</span>
        <strong>${left.name}</strong>
      </button>
      <button class="choice choice-card" data-choice-index="1">
        ${imageCard(right)}
        <span>${right.group}</span>
        <strong>${right.name}</strong>
      </button>
    `
  );
}

function imageCard(person) {
  return `
    <figure class="idol-photo">
      <img src="${person.image}" alt="${person.name} 프로필 사진" loading="lazy" decoding="async" style="object-position: ${person.focus || "50% 22%"};" />
    </figure>
  `;
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

function retryCurrentMode() {
  if (mode === "tarot") {
    closeResultModal();
    renderTarot();
  }
  if (mode === "balance") {
    closeResultModal();
    startBalance();
  }
  if (mode === "flirt") openFlirtResult();
  if (mode === "roulette") openRouletteResult();
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
$("#modalRetry").addEventListener("click", retryCurrentMode);
$("#resultModal").addEventListener("click", (event) => {
  if (event.target.id === "resultModal") closeResultModal();
});

renderQr();
setMode("roulette");
