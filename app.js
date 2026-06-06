const people = [
  { name: "Vega", tags: ["Design", "Film", "Night walk"], line: "오늘의 vibe를 노래 제목으로 말한다면?" },
  { name: "Nari", tags: ["Books", "Wine", "Indie"], line: "요즘 가장 빠져있는 것 하나 말하기" },
  { name: "Lumi", tags: ["Dance", "Cafe", "Photo"], line: "오늘 파티에서 꼭 하고 싶은 것 하나" },
  { name: "June", tags: ["Music", "Travel", "Tattoo"], line: "서로 첫인상을 한 단어로 말해보기" },
];

const topics = [
  "오늘 여기 오게 된 이유는?",
  "오늘의 vibe를 노래 제목으로 말한다면?",
  "서로 첫인상을 한 단어로 말해보기",
  "요즘 가장 빠져있는 것 하나 말하기",
  "연애할 때 가장 큰 green flag는?",
  "내가 생각하는 최고의 플러팅 멘트는?",
  "오늘 파티에서 꼭 하고 싶은 것 하나",
  "서로 인스타에서 가장 나다운 게시물 고르기",
];

const missions = [
  "서로 닉네임의 뜻 말하기",
  "지금 기분을 이모지 3개로 표현하기",
  "상대방에게 질문 하나 하기",
  "오늘 가장 마음에 드는 스타일 말하기",
  "둘 다 좋아하는 관심사 찾기",
  "같이 사진 찍기 or 인스타 교환하기, 선택 가능",
];

const outcomes = ["질문하기", "칭찬하기", "노래 추천하기", "인스타 교환 제안하기", "AI 주제 받기", "다음 사람 초대하기"];

const aiTopics = [
  "Pass 가능: 오늘 여기서 제일 마음에 드는 분위기 하나씩 말하기",
  "서로 요즘 반복해서 듣는 노래 하나 추천하기",
  "오늘 처음 본 사람에게 듣고 싶은 가벼운 질문 하나 고르기",
];

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

function pick(items) {
  return items[Math.floor(Math.random() * items.length)];
}

function showToast(text) {
  const toast = $("#toast");
  toast.textContent = text;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 1800);
}

function setView(view) {
  $$(".view").forEach((item) => item.classList.remove("active"));
  $(`#view-${view}`).classList.add("active");
  $$(".nav-item").forEach((item) => item.classList.toggle("active", item.dataset.view === view));
}

function renderPeople() {
  $("#peopleList").innerHTML = people
    .map(
      (person) => `
        <article class="person">
          <div class="avatar">${person.name[0]}</div>
          <div>
            <h3>${person.name}</h3>
            <div class="tags">${person.tags.map((tag) => `<span class="tag">${tag}</span>`).join("")}</div>
            <div class="button-row">
              <button class="solid" data-signal="${person.name}">Signal 보내기</button>
              <button class="ghost" data-game="${person.name}">같이 게임하기</button>
            </div>
          </div>
        </article>
      `
    )
    .join("");
}

function bindEvents() {
  $$(".nav-item, .icon-button").forEach((button) => {
    button.addEventListener("click", () => setView(button.dataset.view));
  });

  $("#spinRoulette").addEventListener("click", () => {
    const topic = $("#rouletteTopic");
    topic.classList.add("spinning");
    topic.textContent = "돌아가는 중...";
    setTimeout(() => {
      topic.textContent = pick(topics);
      topic.classList.remove("spinning");
    }, 850);
  });

  $("#aiTopic").addEventListener("click", () => {
    $("#rouletteTopic").textContent = pick(aiTopics);
    showToast("AI 주제가 준비됐어요.");
  });

  $("#rollDice").addEventListener("click", () => {
    let ticks = 0;
    const timer = setInterval(() => {
      const value = Math.floor(Math.random() * 6) + 1;
      $("#diceValue").textContent = value;
      $("#diceMission").textContent = missions[value - 1];
      ticks += 1;
      if (ticks > 10) clearInterval(timer);
    }, 80);
  });

  $("#runLadder").addEventListener("click", () => {
    $("#ladderResult").textContent = `${pick(people).name}: ${pick(outcomes)}`;
  });

  $("#nextPair").addEventListener("click", () => {
    const person = pick(people);
    $("#pairName").textContent = person.name;
    $("#pairLine").textContent = person.line;
  });

  $("#makeIcebreaker").addEventListener("click", () => {
    $("#icebreakers").innerHTML = aiTopics.map((topic) => `<li>${topic}</li>`).join("");
    showToast("새 대화 주제가 준비됐어요.");
  });

  document.addEventListener("click", (event) => {
    const signalTarget = event.target.dataset.signal;
    const gameTarget = event.target.dataset.game;
    if (signalTarget) showToast(`${signalTarget}님에게 익명 Signal을 보냈어요.`);
    if (gameTarget) showToast(`${gameTarget}님에게 게임 초대를 보냈어요.`);
  });
}

renderPeople();
bindEvents();
setTimeout(() => showToast("누군가 당신에게 Signal을 보냈어요."), 1200);
