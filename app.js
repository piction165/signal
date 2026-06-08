const tarotCards = [
  { name: "THE FOOL", koName: "바보", image: "./assets/tarot/rws-fool-20260608.jpg", reading: "새로운 대화가 열리는 카드입니다. 완벽한 첫마디보다 가벼운 질문 하나가 좋습니다. 즉흥적으로 웃을 수 있는 말을 건네보세요." },
  { name: "THE MAGICIAN", koName: "마법사", image: "./assets/tarot/rws-magician-20260608.jpg", reading: "말재주보다 타이밍이 중요한 카드입니다. 이미 신호는 충분합니다. 망설이다가 흐름을 놓치기 전에, 지금 바로 한 문장만 건네보세요." },
  { name: "THE EMPRESS", koName: "여제", image: "./assets/tarot/rws-empress-20260608.jpg", reading: "편안한 매력과 여유가 강한 카드입니다. 상대를 급하게 끌어당기기보다 자연스럽게 칭찬하고 리액션을 넉넉하게 보여주세요." },
  { name: "THE LOVERS", koName: "연인", image: "./assets/tarot/rws-lovers-20260608.jpg", reading: "선택과 끌림이 선명해지는 카드입니다. 마음에 드는 사람이 있다면 돌려 말하기보다 짧고 솔직한 관심 표현이 잘 통합니다." },
  { name: "THE CHARIOT", koName: "전차", image: "./assets/tarot/rws-chariot-20260608.jpg", reading: "먼저 움직일수록 유리합니다. 고민이 길어지면 흐름이 식을 수 있으니 게임 초대나 질문 룰렛처럼 바로 이어지는 행동을 선택하세요." },
  { name: "STRENGTH", koName: "힘", image: "./assets/tarot/rws-strength-20260608.jpg", reading: "부드럽지만 자신감 있는 태도가 좋습니다. 세게 밀어붙이기보다 웃으면서 여유 있게 한 번 더 말을 걸어보세요." },
  { name: "WHEEL OF FORTUNE", koName: "운명의 수레바퀴", image: "./assets/tarot/rws-wheel-20260608.jpg", reading: "오늘의 연결은 우연처럼 들어옵니다. 평소라면 지나칠 사람에게 한 번 더 시선을 두세요. 짧은 게임 초대나 질문 룰렛이 좋은 출발점이 됩니다." },
  { name: "TEMPERANCE", koName: "절제", image: "./assets/tarot/rws-temperance-20260608.jpg", reading: "속도를 맞추는 감각이 중요합니다. 상대의 말투와 텐션을 먼저 보고, 부담 없는 리액션으로 대화를 부드럽게 이어가세요." },
  { name: "THE STAR", koName: "별", image: "./assets/tarot/rws-star-20260608.jpg", reading: "칭찬과 리액션 운이 좋습니다. 상대의 스타일, 말투, 선택한 게임 같은 구체적인 포인트를 짧게 말하면 대화가 부드럽게 열립니다." },
  { name: "THE MOON", koName: "달", image: "./assets/tarot/rws-moon-20260608.jpg", reading: "오늘은 서두르기보다 분위기를 읽는 쪽이 유리합니다. 눈이 자주 마주치는 사람이 있다면 가볍게 웃고, 바로 깊은 질문보다 지금 공간에 대한 한마디로 시작해보세요." },
  { name: "THE SUN", koName: "태양", image: "./assets/tarot/rws-sun-20260608.jpg", reading: "밝고 장난스러운 에너지가 잘 맞는 카드입니다. 너무 멋있게 보이려 하기보다 지금 떠오른 가벼운 질문 하나를 던져보세요. 웃음이 먼저 오면 대화는 따라옵니다." },
  { name: "THE WORLD", koName: "세계", image: "./assets/tarot/rws-world-20260608.jpg", reading: "마무리와 확신이 좋은 카드입니다. 이미 좋은 흐름이 있다면 대화를 흘려보내지 말고 다음 약속이나 다음 게임으로 이어보세요." },
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
    image: "./assets/profile-cards/chaewon-clear-20260608.jpg",
    focus: "50% 18%",
  },
  {
    name: "사쿠라",
    group: "LE SSERAFIM",
    image: "./assets/profile-cards/sakura-official-20260608.jpg",
    focus: "50% 18%",
  },
  {
    name: "허윤진",
    group: "LE SSERAFIM",
    image: "./assets/profile-cards/yunjin-clear-20260608.jpg",
    focus: "50% 20%",
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
    image: "./assets/profile-cards/sullyoon-clear-20260608.jpg",
    focus: "50% 20%",
  },
  {
    name: "마스다 아야노",
    group: "CUTIE STREET",
    image: "./assets/profile-cards/ayano-official-20260608.jpg",
    focus: "50% 16%",
  },
];

let mode = "roulette";
let currentText = rouletteQuestions[0];
let bracket = [];
let nextRound = [];
let matchIndex = 0;
let roundSize = 16;
let tarotChoices = [];
let modalPrimaryAction = "retry";
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

function tarotTitle(card) {
  return `${card.name} · ${card.koName}`;
}

function toast(text) {
  $("#toast").textContent = text;
  $("#toast").classList.add("show");
  setTimeout(() => $("#toast").classList.remove("show"), 1300);
}

function setStage(kicker, title, body, actionsHtml) {
  currentText = title || body || currentText;
}

function openResultModal(kicker, title, body, extraHtml = "", options = {}) {
  const { primaryLabel = "다시", primaryAction = "retry", closeLabel = "닫기" } = options;
  modalPrimaryAction = primaryAction;
  $("#modalKicker").textContent = kicker;
  $("#modalTitle").textContent = title;
  $("#modalBody").textContent = body || "";
  $("#modalBody").hidden = !body;
  $("#modalExtra").innerHTML = extraHtml;
  $("#modalRetry").textContent = primaryLabel;
  $("#modalClose").textContent = closeLabel;
  $("#resultModal").hidden = false;
}

function confettiHtml() {
  return `
    <div class="confetti" aria-hidden="true">
      ${Array.from({ length: 72 }, (_, index) => {
        const left = 5 + Math.random() * 90;
        const drift = -120 + Math.random() * 240;
        const rotate = Math.random() * 720;
        const delay = Math.random() * 0.5;
        const color = ["#ff4fb8", "#7c5cff", "#38d9ff", "#ffd166", "#ffffff"][index % 5];
        return `<i style="--left:${left}%;--drift:${drift}px;--rotate:${rotate}deg;--delay:${delay}s;--color:${color}"></i>`;
      }).join("")}
    </div>
  `;
}

function fireworksHtml() {
  return `
    <div class="fireworks" aria-hidden="true">
      ${[
        ["18%", "24%", "#ffd166", "0s"],
        ["50%", "18%", "#38d9ff", "0.12s"],
        ["78%", "28%", "#ff4fb8", "0.24s"],
        ["28%", "58%", "#7c5cff", "0.36s"],
        ["68%", "62%", "#34c759", "0.48s"],
      ]
        .map(([left, top, color, delay]) => `<i style="--left:${left};--top:${top};--color:${color};--delay:${delay};"></i>`)
        .join("")}
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
    const data = await response.json();
    if (!response.ok || !data.text) {
      throw new Error(data.error || "AI unavailable");
    }
    return data.text;
  } catch {
    return null;
  }
}

function renderTarot() {
  tarotChoices = shuffle(tarotCards).slice(0, 5);
  currentText = "오늘의 타로 카드 5장 중 한 장을 고르세요.";
  setStage(
    "LOVE TAROT",
    "카드 한 장으로 오늘의 흐름 보기",
    "다섯 장 중 끌리는 카드를 고르면 결과가 모달에 열립니다.",
    ""
  );
  openResultModal(
    "LOVE TAROT",
    "오늘의 카드 5장",
    "끌리는 카드를 한 장 선택하세요.",
    `
      <div class="tarot-grid shuffle-deck">
        ${tarotChoices
          .map(
            (_, index) => `
              <button class="tarot-card" data-tarot-index="${index}" aria-label="${index + 1}번 타로 카드 선택" style="--card-index:${index};">
                <span class="tarot-back">
                  <img src="${tarotImage(null, "back", index + 1)}" alt="${index + 1}번 타로 카드" />
                </span>
              </button>
            `
          )
          .join("")}
      </div>
    `
  );
}

function chooseTarot(index) {
  const card = tarotChoices[index];
  if (!card) return;
  currentText = `${tarotTitle(card)}: ${card.reading}`;
  openResultModal(
    "TODAY'S TAROT",
    tarotTitle(card),
    card.reading,
    `
      <div class="tarot-result">
        <div class="tarot-face">
          <img src="${tarotImage(card, "front")}" alt="${tarotTitle(card)} 타로 카드" />
        </div>
      </div>
    `
  );
}

function renderFlirt() {
  setStage(
    "AI FLIRTING LINE",
    "부담 없는 첫 문장 만들기",
    "메뉴를 누르면 AI 플러팅 멘트가 모달로 생성됩니다.",
    ""
  );
  openFlirtResult();
}

function renderRoulette() {
  setStage(
    "QUESTION ROULETTE",
    "대화를 여는 질문 하나",
    "메뉴를 누르면 질문 룰렛 결과가 모달로 생성됩니다.",
    ""
  );
  openRouletteResult();
}

async function openFlirtResult() {
  const fallback = drawFromBag("flirt", flirtLines);
  openResultModal("AI FLIRTING LINE", "생성 중...", "");
  currentText = await generateAiText("flirt", fallback);
  if (!currentText) {
    currentText = fallback;
    openResultModal("AI FLIRTING LINE", currentText, "");
    return;
  }
  openResultModal("AI FLIRTING LINE", currentText, "");
}

async function openRouletteResult() {
  const fallback = drawFromBag("roulette", rouletteQuestions);
  openResultModal("QUESTION ROULETTE", "생성 중...", "");
  currentText = await generateAiText("roulette", fallback);
  if (!currentText) {
    currentText = fallback;
    openResultModal("QUESTION ROULETTE", currentText, "");
    return;
  }
  openResultModal("QUESTION ROULETTE", currentText, "");
}

function startBalance() {
  bracket = shuffle(balanceSeeds);
  nextRound = [];
  matchIndex = 0;
  roundSize = 16;
  renderBalanceMatch();
}

function balanceRoundLabel(size) {
  return size === 2 ? "결승" : `${size}강`;
}

function openBalanceRoundIntro() {
  const label = balanceRoundLabel(roundSize);
  const matchCount = Math.floor(bracket.length / 2);
  currentText = `${label} 시작`;
  openResultModal(
    `BALANCE ${label}`,
    `${label} 시작`,
    label === "결승" ? "마지막 선택입니다. 준비되면 진행하세요." : `${matchCount}번 선택하면 다음 라운드로 넘어갑니다.`,
    "",
    { primaryLabel: "진행", primaryAction: "balance-round" }
  );
}

function renderBalanceMatch() {
  if (bracket.length === 1) {
    const winner = bracket[0];
    currentText = `${winner.name} · ${winner.group}`;
    setStage(
      "BALANCE WINNER",
      "밸런스 16강 우승",
      `${winner.name} · ${winner.group}`,
      ""
    );
    openResultModal(
      "BALANCE 1등",
      `1등은 ${winner.name}`,
      `${winner.group} · 최종 선택`,
      `
        ${confettiHtml()}
        ${fireworksHtml()}
        <div class="winner-image">
          <span class="winner-rank">1등</span>
          ${imageCard(winner)}
        </div>
      `
    );
    return;
  }

  if (matchIndex >= bracket.length) {
    bracket = nextRound;
    nextRound = [];
    matchIndex = 0;
    roundSize = bracket.length;
    if (bracket.length === 1) {
      renderBalanceMatch();
      return;
    }
    openBalanceRoundIntro();
    return;
  }

  const left = bracket[matchIndex];
  const right = bracket[matchIndex + 1];
  const currentRound = balanceRoundLabel(roundSize);
  const progress = `${Math.floor(matchIndex / 2) + 1}/${Math.floor(bracket.length / 2)}`;
  currentText = `${left.name} vs ${right.name}`;
  setStage(
    `BALANCE ${currentRound} ${progress}`,
    "밸런스 16강 진행 중",
    `${currentRound} ${progress} 매치가 모달에 표시됩니다.`,
    ""
  );
  openResultModal(
    `BALANCE ${currentRound} ${progress}`,
    "둘 중 더 끌리는 쪽은?",
    "",
    `
      <div class="choice-grid">
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
      </div>
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

function handleModalPrimary() {
  if (modalPrimaryAction === "balance-round") {
    closeResultModal();
    modalPrimaryAction = "retry";
    renderBalanceMatch();
    return;
  }
  retryCurrentMode();
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
$("#modalRetry").addEventListener("click", handleModalPrimary);
$("#resultModal").addEventListener("click", (event) => {
  if (event.target.id === "resultModal") closeResultModal();
});

renderQr();
