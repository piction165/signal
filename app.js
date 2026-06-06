const tarotCards = [
  ["THE FOOL", "오늘은 먼저 말 거는 쪽이 이깁니다. 이상해도 시작하면 운이 따라옵니다."],
  ["THE LOVERS", "서로 취향 하나만 맞아도 대화가 길어집니다. 좋아하는 걸 하나 물어보세요."],
  ["THE STAR", "칭찬운이 좋습니다. 관찰한 걸 짧게 말하면 분위기가 풀립니다."],
  ["THE MAGICIAN", "말재주보다 타이밍입니다. 눈 마주치면 바로 한마디."],
  ["WHEEL", "우연처럼 보이는 질문이 오늘의 연결이 됩니다."],
  ["SUN", "가볍고 밝은 말이 잘 먹힙니다. 복잡하게 가지 마세요."],
];

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
  "매일 연락하는 사람",
  "만나면 계속 웃기는 사람",
  "취향이 완전히 같은 사람",
  "내 얘기를 잘 기억하는 사람",
  "눈치 빠른 사람",
  "표현을 아끼지 않는 사람",
  "같이 있으면 조용해도 편한 사람",
  "새로운 곳에 데려가주는 사람",
  "대화가 깊은 사람",
  "장난 코드가 맞는 사람",
  "내 친구들과 잘 어울리는 사람",
  "사진을 잘 찍어주는 사람",
  "음악 취향이 좋은 사람",
  "혼자만의 시간을 존중하는 사람",
  "일할 때 멋있는 사람",
  "밥 취향이 맞는 사람",
];

let mode = "roulette";
let currentText = rouletteQuestions[0];
let bracket = [];
let nextRound = [];
let matchIndex = 0;
let roundSize = 16;
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

function toast(text) {
  $("#toast").textContent = text;
  $("#toast").classList.add("show");
  setTimeout(() => $("#toast").classList.remove("show"), 1300);
}

function setStage(kicker, title, body, actionsHtml) {
  $("#stageKicker").textContent = kicker;
  $("#stageTitle").textContent = title;
  $("#stageBody").textContent = body || "";
  $("#stageActions").innerHTML = actionsHtml;
}

function renderTarot() {
  const [card, text] = drawFromBag("tarot", tarotCards);
  currentText = `${card}: ${text}`;
  setStage(
    "LOVE TAROT",
    card,
    text,
    `<button class="primary" id="drawButton">다시 뽑기</button><button id="copyButton">복사</button>`
  );
}

function renderFlirt() {
  currentText = drawFromBag("flirt", flirtLines);
  setStage(
    "FLIRTING LINE",
    currentText,
    "너무 진지하게 읽지 말고, 웃으면서 던지는 용도.",
    `<button class="primary" id="drawButton">다른 멘트</button><button id="copyButton">복사</button>`
  );
}

function renderRoulette() {
  currentText = drawFromBag("roulette", rouletteQuestions);
  setStage(
    "QUESTION ROULETTE",
    currentText,
    "엉뚱해도 괜찮습니다. 바로 반응이 나오면 성공.",
    `<button class="primary" id="drawButton">다른 질문</button><button id="copyButton">복사</button>`
  );
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
    currentText = bracket[0];
    setStage(
      "BALANCE WINNER",
      bracket[0],
      "오늘의 이상형 키워드 우승.",
      `<button class="primary" id="drawButton">다시 16강</button><button id="copyButton">복사</button>`
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
  currentText = `${left} vs ${right}`;
  setStage(
    `BALANCE ${currentRound}`,
    "둘 중 더 끌리는 쪽은?",
    `${Math.floor(matchIndex / 2) + 1} / ${Math.floor(bracket.length / 2)}`,
    `<button class="choice" data-choice="${left}">${left}</button><button class="choice" data-choice="${right}">${right}</button>`
  );
}

function chooseBalance(value) {
  nextRound.push(value);
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
    if (mode === "flirt") renderFlirt();
    if (mode === "roulette") renderRoulette();
  }
  if (event.target.id === "copyButton") copyCurrent();
  if (event.target.dataset.choice) chooseBalance(event.target.dataset.choice);
});

$("#shareTop").addEventListener("click", shareApp);
$("#shareMain").addEventListener("click", shareApp);

renderQr();
setMode("roulette");
