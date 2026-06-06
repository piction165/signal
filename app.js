const STORAGE_KEY = "signal.conversation.v1";
const SAVED_KEY = "signal.saved.cards.v1";
const DEFAULT_SUPABASE_URL = "https://iwravorcdoswhssmnzue.supabase.co";
const DEFAULT_SUPABASE_ANON_KEY = "sb_publishable_bK_JuZ6qGdlfypAbfE0Btg_nDgBpom7";
const EVENT_CODE = "LOL-EVENT";
const EVENT_NAME = "LOL Conversation Signal";

const decks = {
  opener: [
    "오늘 여기서 제일 먼저 눈에 들어온 건 뭐였어요?",
    "이 행사 오기 전에 기대했던 게 있었어요?",
    "오늘 분위기 한 단어로 말하면 뭐예요?",
    "방금까지 뭐 보고 있었어요?",
  ],
  awkward: [
    "우리 지금 어색한 거 인정하고 갈까요?",
    "처음 만난 사람한테 제일 무난한 질문 뭐라고 생각해요?",
    "오늘 나의 사회성 점수는 몇 점 같아요?",
    "이럴 때 아무 말이나 먼저 하는 사람이 이기는 거 맞죠?",
  ],
  either: [
    "처음 보는 사람과 3분 대화하기 vs 아는 사람과 30분 붙어있기?",
    "바로 칭찬 듣기 vs 웃긴 질문 받기?",
    "오늘 새 친구 만들기 vs 좋은 대화 하나만 남기기?",
    "즉흥적인 사람 vs 계획적인 사람?",
  ],
  bridge: [
    "그 얘기 조금 더 듣고 싶은데, 어떻게 나온 거예요?",
    "그럼 평소에는 어떤 쪽을 더 좋아해요?",
    "방금 말한 것 중에 제일 중요한 포인트가 뭐예요?",
    "이 얘기랑 이어서 하나만 더 물어봐도 돼요?",
  ],
  love: [
    "오늘은 먼저 웃어주는 사람이 분위기를 가져갑니다.",
    "완벽한 멘트보다 짧은 관심 표현이 더 잘 통하는 날입니다.",
    "눈이 한 번 더 마주치면 가벼운 질문 하나면 충분합니다.",
    "오늘의 매력은 담백함입니다. 길게 설명하지 않아도 됩니다.",
  ],
  cookie: [
    "가장 좋은 질문은 이미 네 관심사 안에 있습니다.",
    "상대도 말을 걸 타이밍을 기다리고 있을 수 있습니다.",
    "오늘의 연결은 먼저 가볍게 여는 쪽에 있습니다.",
    "어색함은 실패가 아니라 대화가 열리는 흐름입니다.",
  ],
};

const state = {
  client: null,
  room: null,
  me: null,
  promptType: "opener",
  currentPrompt: "",
  saved: [],
  questionMessages: [],
};

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

function pick(items) {
  return items[Math.floor(Math.random() * items.length)];
}

function showToast(text) {
  const toast = $("#toast");
  toast.textContent = text;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 1700);
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function loadJson(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key) || "null") ?? fallback;
  } catch {
    return fallback;
  }
}

function saveJson(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function createClient() {
  return window.supabase.createClient(DEFAULT_SUPABASE_URL, DEFAULT_SUPABASE_ANON_KEY);
}

async function getOrCreateRoom() {
  const found = await state.client.from("party_rooms").select("id, room_code, name").eq("room_code", EVENT_CODE).maybeSingle();
  if (found.error) throw found.error;
  if (found.data) return found.data;

  const created = await state.client
    .from("party_rooms")
    .insert({ room_code: EVENT_CODE, name: EVENT_NAME })
    .select("id, room_code, name")
    .single();
  if (created.error) throw created.error;
  return created.data;
}

function localNickname() {
  const session = loadJson(STORAGE_KEY, null);
  if (session?.nickname) return session.nickname;
  const nickname = `오늘의 대화 ${Math.floor(1000 + Math.random() * 9000)}`;
  saveJson(STORAGE_KEY, { nickname });
  return nickname;
}

async function bootBackendQuietly() {
  try {
    state.client = createClient();
    state.room = await getOrCreateRoom();
    const session = loadJson(STORAGE_KEY, {});

    if (session.participantId) {
      const existing = await state.client.from("participants").select("*").eq("id", session.participantId).maybeSingle();
      if (existing.data) {
        state.me = existing.data;
        return;
      }
    }

    const nickname = session.nickname || localNickname();
    const created = await state.client
      .from("participants")
      .insert({
        room_id: state.room.id,
        nickname,
        interests: [],
        is_online: true,
        is_hidden: true,
      })
      .select("*")
      .single();
    if (created.error) throw created.error;
    state.me = created.data;
    saveJson(STORAGE_KEY, { nickname, participantId: state.me.id });
  } catch {
    state.client = null;
    state.room = null;
    state.me = null;
  }
}

function setView(view) {
  $$(".view").forEach((item) => item.classList.remove("active"));
  $(`#view-${view}`).classList.add("active");
  $$(".nav-item").forEach((item) => item.classList.toggle("active", item.dataset.view === view));
}

function nextPrompt(type = state.promptType) {
  state.promptType = type;
  state.currentPrompt = pick(decks[type]);
  const labels = {
    opener: "첫 대화",
    awkward: "어색함 깨기",
    either: "둘 중 하나",
    bridge: "다음 대화",
  };
  $("#promptMeta").textContent = labels[type] || "대화 카드";
  $("#promptText").textContent = state.currentPrompt;
}

async function copyText(text, done = "복사했습니다.") {
  try {
    await navigator.clipboard.writeText(text);
    showToast(done);
  } catch {
    showToast("복사할 수 없습니다.");
  }
}

async function shareApp() {
  const data = {
    title: "시그널",
    text: "대화를 자연스럽게 이어주는 LOL 행사 시그널",
    url: location.href.split("?")[0],
  };
  if (navigator.share) {
    try {
      await navigator.share(data);
      return;
    } catch {
      return;
    }
  }
  await copyText(data.url, "앱 링크를 복사했습니다.");
}

function saveCard(text = state.currentPrompt, kind = state.promptType) {
  const card = {
    id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
    text,
    kind,
    createdAt: new Date().toISOString(),
  };
  state.saved = [card, ...state.saved].slice(0, 30);
  saveJson(SAVED_KEY, state.saved);
  renderSaved();
  saveGameSession("ai_icebreaker", { text, kind, card_type: "conversation_card" });
  showToast("저장했습니다.");
}

function renderSaved() {
  if (!state.saved.length) {
    $("#savedList").innerHTML = `<article class="empty-card"><h3>저장한 카드 없음</h3><p>좋았던 문장을 잠깐 보관할 수 있습니다.</p></article>`;
    return;
  }
  $("#savedList").innerHTML = state.saved
    .map(
      (card) => `
        <article class="signal-card">
          <div>
            <p class="muted">${escapeHtml(card.kind)}</p>
            <h3>${escapeHtml(card.text)}</h3>
          </div>
          <button class="ghost small" data-copy-saved="${escapeHtml(card.id)}">복사</button>
        </article>
      `
    )
    .join("");
}

async function saveGameSession(gameType, resultData) {
  if (!state.client || !state.room || !state.me) return null;
  const { data, error } = await state.client
    .from("game_sessions")
    .insert({
      room_id: state.room.id,
      created_by: state.me.id,
      game_type: gameType,
      participants: [state.me.id],
      input_data: {},
      result_data: resultData,
    })
    .select("*")
    .single();
  return error ? null : data;
}

async function callSignalAi(mode, messages = []) {
  if (!state.client || !state.me) throw new Error("AI unavailable");
  const { data, error } = await state.client.functions.invoke("signal-ai", {
    body: {
      mode,
      messages,
      context: {
        event: EVENT_NAME,
        nickname: state.me.nickname,
        interests: [],
      },
    },
  });
  if (error) throw error;
  if (!data?.text) throw new Error("empty response");
  return data.text;
}

function openModal(type) {
  $("#gameModal").classList.add("show");
  $("#gameModal").setAttribute("aria-hidden", "false");
  renderModal(type);
}

function closeModal() {
  $("#gameModal").classList.remove("show");
  $("#gameModal").setAttribute("aria-hidden", "true");
}

function renderModal(type) {
  const title = $("#modalTitle");
  const kicker = $("#modalKicker");
  const content = $("#modalContent");

  if (["opener", "awkward", "either", "bridge"].includes(type)) {
    const text = pick(decks[type]);
    const labels = {
      opener: ["FIRST LINE", "처음 말 걸기"],
      awkward: ["MOOD BREAKER", "어색함 깨기"],
      either: ["THIS OR THAT", "둘 중 하나"],
      bridge: ["NEXT LINE", "다음 대화로 넘기기"],
    };
    kicker.textContent = labels[type][0];
    title.textContent = labels[type][1];
    content.innerHTML = `
      <div class="modal-result">${escapeHtml(text)}</div>
      <div class="button-row">
        <button class="solid" id="useAsMain">메인에 올리기</button>
        <button class="ghost" id="copyModalText">복사</button>
      </div>
      <button class="text-button wide" id="saveModalText">저장</button>
    `;
    $("#useAsMain").addEventListener("click", () => {
      state.promptType = type;
      state.currentPrompt = text;
      $("#promptMeta").textContent = title.textContent;
      $("#promptText").textContent = text;
      closeModal();
    });
    $("#copyModalText").addEventListener("click", () => copyText(text));
    $("#saveModalText").addEventListener("click", () => saveCard(text, type));
    return;
  }

  if (type === "love" || type === "cookie") {
    const isLove = type === "love";
    const text = pick(decks[type]);
    kicker.textContent = isLove ? "LOVE SIGNAL" : "FORTUNE COOKIE";
    title.textContent = isLove ? "오늘의 시그널" : "가볍게 건넬 한 줄";
    content.innerHTML = `
      <div class="modal-result" id="aiResult">${escapeHtml(text)}</div>
      <div class="button-row">
        <button class="solid" id="drawAiCard">다시 뽑기</button>
        <button class="ghost" id="copyAiCard">복사</button>
      </div>
      <button class="text-button wide" id="saveAiCard">저장</button>
    `;
    $("#drawAiCard").addEventListener("click", () => drawAiCard(type));
    $("#copyAiCard").addEventListener("click", () => copyText($("#aiResult").textContent));
    $("#saveAiCard").addEventListener("click", () => saveCard($("#aiResult").textContent, type));
    return;
  }

  state.questionMessages = [
    { role: "assistant", content: "지금 분위기를 한 줄로 적거나, 바로 버튼을 눌러 대화 주제를 뽑아보세요." },
  ];
  kicker.textContent = "MOOD PICK";
  title.textContent = "분위기에 맞는 말 뽑기";
  content.innerHTML = `
    <div class="chat-log" id="questionChat"></div>
    <label class="chat-input">
      지금 분위기
      <input id="questionInput" placeholder="예: 처음 만났고 살짝 어색함" autocomplete="off" />
    </label>
    <div class="button-row">
      <button class="solid" id="nextQuestion">뽑기</button>
      <button class="ghost" id="saveQuestionChat">저장</button>
    </div>
  `;
  renderQuestionChat();
  $("#nextQuestion").addEventListener("click", nextQuestion);
  $("#saveQuestionChat").addEventListener("click", () => saveCard(lastAssistantMessage(), "mood"));
}

async function drawAiCard(type) {
  const result = $("#aiResult");
  result.classList.add("spinning");
  result.textContent = "뽑는 중...";
  let text;
  try {
    text = await callSignalAi(type, [
      { role: "user", content: type === "love" ? "오늘 행사에서 가볍게 건넬 러브 시그널 한 줄." : "대화를 자연스럽게 여는 포춘쿠키 한 줄." },
    ]);
  } catch {
    text = pick(decks[type]);
  }
  result.textContent = text;
  result.classList.remove("spinning");
  await saveGameSession(type === "love" ? "love_fortune" : "fortune_cookie", { text, source: "ai_or_fallback" });
}

function renderQuestionChat() {
  const chat = $("#questionChat");
  chat.innerHTML = state.questionMessages
    .map((message) => `<div class="chat-bubble ${message.role}">${escapeHtml(message.content)}</div>`)
    .join("");
  chat.scrollTop = chat.scrollHeight;
}

function lastAssistantMessage() {
  return [...state.questionMessages].reverse().find((message) => message.role === "assistant")?.content || state.currentPrompt;
}

async function nextQuestion() {
  const input = $("#questionInput");
  const userText = input.value.trim();
  if (userText) state.questionMessages.push({ role: "user", content: userText });
  input.value = "";
  state.questionMessages.push({ role: "assistant", content: "뽑는 중..." });
  renderQuestionChat();

  let answer;
  try {
    answer = await callSignalAi("questions", state.questionMessages.filter((message) => message.content !== "뽑는 중..."));
  } catch {
    answer = pick([...decks.opener, ...decks.awkward, ...decks.bridge]);
  }
  state.questionMessages[state.questionMessages.length - 1] = { role: "assistant", content: answer };
  renderQuestionChat();
  await saveGameSession("question_roulette", { messages: state.questionMessages, source: "ai_or_fallback" });
}

function bindEvents() {
  $$(".nav-item, [data-view]").forEach((button) => {
    button.addEventListener("click", () => setView(button.dataset.view));
  });

  $("#nextPrompt").addEventListener("click", () => nextPrompt());
  $("#copyPrompt").addEventListener("click", () => copyText(state.currentPrompt));
  $("#savePrompt").addEventListener("click", () => saveCard());
  $("#shareAppTop").addEventListener("click", shareApp);
  $("#shareAppMain").addEventListener("click", shareApp);
  $("#clearSaved").addEventListener("click", () => {
    state.saved = [];
    saveJson(SAVED_KEY, state.saved);
    renderSaved();
  });

  $("#closeModal").addEventListener("click", closeModal);
  $("#gameModal").addEventListener("click", (event) => {
    if (event.target.id === "gameModal") closeModal();
  });

  document.addEventListener("click", (event) => {
    const openGame = event.target.closest("[data-open-game]")?.dataset.openGame;
    const savedId = event.target.dataset.copySaved;
    if (openGame) openModal(openGame);
    if (savedId) {
      const card = state.saved.find((item) => item.id === savedId);
      if (card) copyText(card.text);
    }
  });
}

state.saved = loadJson(SAVED_KEY, []);
nextPrompt("opener");
renderSaved();
bindEvents();
bootBackendQuietly();
