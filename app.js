const STORAGE_KEY = "signal.session.v3";
const DEFAULT_SUPABASE_URL = "https://iwravorcdoswhssmnzue.supabase.co";
const DEFAULT_SUPABASE_ANON_KEY = "sb_publishable_bK_JuZ6qGdlfypAbfE0Btg_nDgBpom7";
const EVENT_CODE = "LOL-EVENT";
const EVENT_NAME = "LOL Signal";

const localQuestions = [
  "오늘 여기서 제일 먼저 눈에 들어온 건 뭐였어요?",
  "처음 만난 사람에게 의외로 잘 물어보는 질문이 있어요?",
  "연애할 때 나를 바로 웃게 만드는 포인트는?",
  "오늘의 나를 영화 장르로 말하면?",
  "상대가 해주면 은근히 설레는 작은 행동은?",
  "오늘 끝나기 전에 꼭 하나 해보고 싶은 건?",
];

const localFortunes = [
  "오늘은 먼저 웃어주는 사람이 이깁니다. 짧은 Signal 하나가 분위기를 바꿀 수 있어요.",
  "대화운이 좋습니다. 완벽한 멘트보다 가벼운 질문이 더 잘 통합니다.",
  "타이밍운이 강합니다. 눈이 한 번 더 마주치면 그냥 인사해도 됩니다.",
  "오늘의 매력은 담백함입니다. 과한 설명보다 한 문장이 오래 남습니다.",
];

const localCookies = [
  "지금 저장한 용기가 오늘의 하이라이트가 됩니다.",
  "가장 좋은 질문은 이미 네 관심사 안에 있습니다.",
  "상대도 신호를 기다리고 있을 수 있습니다.",
  "오늘의 연결은 길게 말하는 쪽보다 먼저 다가가는 쪽에 있습니다.",
];

const state = {
  client: null,
  session: null,
  room: null,
  me: null,
  people: [],
  receivedSignals: [],
  sentSignals: [],
  matches: [],
  playSessions: [],
  notifications: [],
  selectedPair: null,
  currentGame: null,
  questionMessages: [],
};

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

function pick(items) {
  return items.length ? items[Math.floor(Math.random() * items.length)] : null;
}

function showToast(text) {
  const toast = $("#toast");
  toast.textContent = text;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 1900);
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function loadSession() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
  } catch {
    return null;
  }
}

function saveSession(session) {
  state.session = session;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
}

function setView(view) {
  $$(".view").forEach((item) => item.classList.remove("active"));
  $(`#view-${view}`).classList.add("active");
  $$(".nav-item").forEach((item) => item.classList.toggle("active", item.dataset.view === view));
}

function emptyCard(title, body) {
  return `<article class="empty-card"><h3>${escapeHtml(title)}</h3><p>${escapeHtml(body)}</p></article>`;
}

function participantName(person) {
  return person?.nickname || person?.name || person?.display_name || "익명";
}

function participantTags(person) {
  const raw = person?.interests || person?.tags || [];
  if (Array.isArray(raw)) return raw.filter(Boolean).slice(0, 4);
  if (typeof raw === "string") return raw.split(",").map((item) => item.trim()).filter(Boolean).slice(0, 4);
  return [];
}

function signalName(signal, key) {
  return participantName(signal[key]) || signal.metadata?.[`${key}_nickname`] || "익명";
}

function createClient(url, anonKey) {
  if (!url || !anonKey) throw new Error("앱 연결 정보가 없습니다.");
  return window.supabase.createClient(url, anonKey);
}

async function getOrCreateRoom(roomCode) {
  const code = roomCode.trim();
  let { data, error } = await state.client.from("party_rooms").select("id, room_code, name").eq("room_code", code).maybeSingle();
  if (error) throw error;
  if (data) return data;

  const created = await state.client.from("party_rooms").insert({ room_code: code, name: EVENT_NAME }).select("id, room_code, name").single();
  if (created.error) throw created.error;
  return created.data;
}

async function createParticipant({ nickname, interests }) {
  const { data, error } = await state.client
    .from("participants")
    .insert({
      room_id: state.room.id,
      nickname,
      interests,
      is_online: true,
      is_hidden: false,
    })
    .select("*")
    .single();
  if (error) throw error;
  return data;
}

async function joinRoom() {
  const nickname = $("#nicknameInput").value.trim();
  const roomCode = EVENT_CODE;
  const url = DEFAULT_SUPABASE_URL;
  const anonKey = DEFAULT_SUPABASE_ANON_KEY;
  const interests = $("#interestsInput").value.split(",").map((item) => item.trim()).filter(Boolean);

  if (!nickname) {
    showToast("닉네임을 입력하세요.");
    return;
  }

  try {
    state.client = createClient(url, anonKey);
    state.room = await getOrCreateRoom(roomCode);
    state.me = await createParticipant({ nickname, interests });
    saveSession({ url, anonKey, roomCode, participantId: state.me.id });
    $("#joinPanel").classList.add("hidden");
    await refreshAll();
    subscribeRealtime();
    showToast("LOL 시그널을 시작했습니다.");
  } catch (error) {
    showToast(error.message || "시작 실패");
  }
}

async function restoreSession(session) {
  if (!session?.url || !session?.anonKey || !session?.roomCode || !session?.participantId) {
    renderSignedOut();
    return;
  }

  try {
    state.session = session;
    state.client = createClient(session.url, session.anonKey);
    state.room = await getOrCreateRoom(session.roomCode);
    const { data, error } = await state.client.from("participants").select("*").eq("id", session.participantId).maybeSingle();
    if (error) throw error;
    if (!data) throw new Error("저장된 participant id를 찾을 수 없습니다.");
    state.me = data;
    $("#joinPanel").classList.add("hidden");
    await refreshAll();
    subscribeRealtime();
  } catch (error) {
    showToast(error.message || "세션 복구 실패");
    renderSignedOut();
  }
}

async function refreshAll() {
  await Promise.all([loadPeople(), loadSignals(), loadNotifications(), loadPlaySessions()]);
  renderAll();
}

async function loadPeople() {
  const { data, error } = await state.client
    .from("participants")
    .select("*")
    .eq("room_id", state.room.id)
    .neq("id", state.me.id)
    .order("created_at", { ascending: false });
  if (error) throw error;
  state.people = data || [];
}

async function loadSignals() {
  const received = await state.client
    .from("signals")
    .select("*, sender:participants!signals_sender_id_fkey(id,nickname,interests), receiver:participants!signals_receiver_id_fkey(id,nickname,interests)")
    .eq("room_id", state.room.id)
    .eq("receiver_id", state.me.id)
    .order("created_at", { ascending: false });
  if (received.error) throw received.error;
  state.receivedSignals = received.data || [];

  const sent = await state.client
    .from("signals")
    .select("*, sender:participants!signals_sender_id_fkey(id,nickname,interests), receiver:participants!signals_receiver_id_fkey(id,nickname,interests)")
    .eq("room_id", state.room.id)
    .eq("sender_id", state.me.id)
    .order("created_at", { ascending: false });
  if (sent.error) throw sent.error;
  state.sentSignals = sent.data || [];
}

async function loadNotifications() {
  const { data, error } = await state.client
    .from("notifications")
    .select("*")
    .eq("recipient_id", state.me.id)
    .order("created_at", { ascending: false })
    .limit(50);
  if (error) throw error;
  state.notifications = data || [];
}

async function loadPlaySessions() {
  const { data, error } = await state.client
    .from("game_sessions")
    .select("*")
    .eq("room_id", state.room.id)
    .contains("participants", [state.me.id])
    .order("created_at", { ascending: false });
  if (error) throw error;
  state.playSessions = data || [];
}

function renderSignedOut() {
  $("#joinPanel").classList.remove("hidden");
  $("#eventLabel").textContent = EVENT_NAME;
  $("#onlineCount").textContent = "-";
  $("#meLabel").textContent = "닉네임 필요";
  $("#homeGreeting").textContent = "시작하려면 닉네임을 정하세요.";
  $("#homeSubtext").textContent = "LOL 행사 안에서만 사용할 이름으로 Signal을 보내고 받습니다.";
  $("#peopleList").innerHTML = emptyCard("닉네임 필요", "시작 후 행사 참여자를 볼 수 있습니다.");
  $("#homeReceivedSignals").innerHTML = emptyCard("받은 Signal 없음", "입장 후 받은 Signal이 표시됩니다.");
  $("#receivedSignalsList").innerHTML = emptyCard("받은 Signal 없음", "입장 후 확인할 수 있습니다.");
  $("#sentSignalsList").innerHTML = emptyCard("보낸 Signal 없음", "입장 후 확인할 수 있습니다.");
  $("#notificationList").innerHTML = emptyCard("알림 없음", "입장 후 확인할 수 있습니다.");
}

function renderAll() {
  $("#eventLabel").textContent = EVENT_NAME;
  $("#onlineCount").textContent = `${state.people.length + 1}명`;
  $("#meLabel").textContent = participantName(state.me);
  $("#homeGreeting").textContent = `${participantName(state.me)}님의 오늘 연결`;
  $("#homeSubtext").textContent = "휴대폰은 잠깐만 열고, 실제 대화는 행사 안에서 이어가세요.";

  const unread = state.notifications.filter((item) => !item.is_read).length;
  $("#badge").textContent = String(unread);
  $("#homeUnreadCount").textContent = String(unread);
  $("#homeReceivedCount").textContent = String(state.receivedSignals.length);
  $("#homeSentCount").textContent = String(state.sentSignals.length);
  $("#homePlayCount").textContent = String(state.playSessions.length);

  renderPeople();
  renderSignalLists();
  renderNotifications();
  renderMe();
}

function renderPeople() {
  if (!state.people.length) {
    $("#peopleList").innerHTML = emptyCard("참가자 없음", "아직 표시할 행사 참여자가 없습니다.");
    return;
  }

  $("#peopleList").innerHTML = state.people
    .map((person) => {
      const name = participantName(person);
      const tags = participantTags(person);
      return `
        <article class="person">
          <div class="avatar">${escapeHtml(name[0])}</div>
          <div>
            <h3>${escapeHtml(name)}</h3>
            <div class="tags">${tags.map((tag) => `<span class="tag">${escapeHtml(tag)}</span>`).join("")}</div>
            <div class="button-row">
              <button class="solid" data-signal-id="${escapeHtml(person.id)}">Signal 보내기</button>
              <button class="ghost" data-open-game="roulette">주제 뽑기</button>
            </div>
          </div>
        </article>
      `;
    })
    .join("");
}

function renderSignalLists() {
  $("#homeReceivedSignals").innerHTML = renderSignals(state.receivedSignals.slice(0, 3), "sender", "아직 받은 Signal이 없습니다.");
  $("#receivedSignalsList").innerHTML = renderSignals(state.receivedSignals, "sender", "아직 받은 Signal이 없습니다.");
  $("#sentSignalsList").innerHTML = renderSignals(state.sentSignals, "receiver", "아직 보낸 Signal이 없습니다.");
}

function renderSignals(signals, participantKey, emptyText) {
  if (!signals.length) return emptyCard("Signal 없음", emptyText);
  return signals
    .map((signal) => {
      const name = signalName(signal, participantKey);
      const tags = participantTags(signal[participantKey]);
      return `
        <article class="signal-card">
          <div>
            <p class="muted">${participantKey === "sender" ? "받은 Signal" : "보낸 Signal"}</p>
            <h3>${escapeHtml(name)}</h3>
            <p>${tags.length ? escapeHtml(tags.join(" · ")) : "오늘의 닉네임으로 표시됩니다."}</p>
          </div>
          <span class="pill">${new Date(signal.created_at).toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" })}</span>
        </article>
      `;
    })
    .join("");
}

function renderNotifications() {
  if (!state.notifications.length) {
    $("#notificationList").innerHTML = emptyCard("알림 없음", "새 Signal, Match, 게임 초대가 오면 여기에 표시됩니다.");
    return;
  }
  $("#notificationList").innerHTML = state.notifications
    .map(
      (item) => `
        <article class="notice ${item.is_read ? "" : "unread"}">
          <strong>${escapeHtml(item.title)}</strong>
          <p>${escapeHtml(item.body || "")}</p>
          ${item.is_read ? "" : `<button class="ghost small" data-read-id="${escapeHtml(item.id)}">읽음</button>`}
        </article>
      `
    )
    .join("");
}

function renderMe() {
  const name = participantName(state.me);
  const tags = participantTags(state.me);
  $("#meCard").innerHTML = `
    <div class="avatar large">${escapeHtml(name[0])}</div>
    <h3>${escapeHtml(name)}</h3>
    <p>${tags.length ? escapeHtml(tags.join(" · ")) : "관심사가 아직 없습니다."}</p>
  `;
}

async function sendSignal(receiverId) {
  if (!state.client || !state.me) {
    showToast("먼저 닉네임을 정하세요.");
    return;
  }

  const receiver = state.people.find((person) => person.id === receiverId);
  const { error } = await state.client.from("signals").insert({
    room_id: state.room.id,
    sender_id: state.me.id,
    receiver_id: receiverId,
    metadata: { sender_nickname: participantName(state.me), receiver_nickname: participantName(receiver) },
  });

  if (error) {
    showToast(error.message);
    return;
  }

  await state.client.from("notifications").insert({
    room_id: state.room.id,
    recipient_id: receiverId,
    actor_id: state.me.id,
    type: "received_signal",
    title: `${participantName(state.me)}님이 Signal을 보냈어요.`,
    body: "오늘 하루 닉네임으로 표시됩니다.",
    metadata: { sender_nickname: participantName(state.me) },
  });

  await refreshAll();
  showToast("Signal을 보냈어요.");
}

async function saveGameSession(gameType, resultData) {
  if (!state.client || !state.me) {
    showToast("먼저 닉네임을 정하세요.");
    return null;
  }
  const { data, error } = await state.client.from("game_sessions").insert({
    room_id: state.room.id,
    created_by: state.me.id,
    game_type: gameType,
    participants: [state.me.id],
    input_data: {},
    result_data: resultData,
  }).select("*").single();
  showToast(error ? error.message : "저장했습니다.");
  if (!error) {
    state.playSessions = [data, ...state.playSessions];
    $("#homePlayCount").textContent = String(state.playSessions.length);
  }
  return error ? null : data;
}

async function callSignalAi(mode, messages = []) {
  if (!state.client || !state.me) throw new Error("먼저 닉네임을 정하세요.");
  const context = {
    event: EVENT_NAME,
    nickname: participantName(state.me),
    interests: participantTags(state.me),
  };
  const { data, error } = await state.client.functions.invoke("signal-ai", {
    body: { mode, messages, context },
  });
  if (error) throw error;
  if (!data?.text) throw new Error("응답이 비어 있습니다.");
  return data.text;
}

function fallbackAi(mode) {
  if (mode === "love") return pick(localFortunes);
  if (mode === "cookie") return pick(localCookies);
  return pick(localQuestions);
}

function choosePair() {
  const visible = state.people.filter((person) => !person.is_hidden);
  state.selectedPair = pick(visible);
  return state.selectedPair;
}

function openModal(type) {
  state.currentGame = type;
  const modal = $("#gameModal");
  modal.classList.add("show");
  modal.setAttribute("aria-hidden", "false");
  renderModal(type);
}

function closeModal() {
  const modal = $("#gameModal");
  modal.classList.remove("show");
  modal.setAttribute("aria-hidden", "true");
}

function renderModal(type) {
  const title = $("#modalTitle");
  const kicker = $("#modalKicker");
  const content = $("#modalContent");

  if (type === "love" || type === "cookie") {
    const isLove = type === "love";
    kicker.textContent = isLove ? "LOVE FORTUNE" : "FORTUNE COOKIE";
    title.textContent = isLove ? "오늘의 연애운" : "오늘의 한 줄 시그널";
    content.innerHTML = `
      <div class="modal-result" id="aiResult">${isLove ? "오늘의 연애운을 열어보세요." : "포춘쿠키를 열어보세요."}</div>
      <div class="button-row">
        <button class="solid" id="drawAiCard">${isLove ? "운세 보기" : "열기"}</button>
        <button class="ghost" id="saveAiCard">저장</button>
      </div>
    `;
    $("#drawAiCard").addEventListener("click", () => drawAiCard(type));
    $("#saveAiCard").addEventListener("click", () => saveGameSession(type === "love" ? "love_fortune" : "fortune_cookie", { text: $("#aiResult").textContent }));
    return;
  }

  if (type === "questions") {
    state.questionMessages = [
      { role: "assistant", content: "질문 룰렛을 시작합니다. 아래 버튼을 누르면 지금 분위기에 맞는 첫 질문을 뽑아드릴게요." },
    ];
    kicker.textContent = "QUESTION ROULETTE";
    title.textContent = "채팅형 질문 룰렛";
    content.innerHTML = `
      <div class="chat-log" id="questionChat"></div>
      <label class="chat-input">
        답변 또는 분위기
        <input id="questionInput" placeholder="예: 처음 만난 사람끼리 어색함" autocomplete="off" />
      </label>
      <div class="button-row">
        <button class="solid" id="nextQuestion">다음 질문</button>
        <button class="ghost" id="saveQuestionChat">저장</button>
      </div>
    `;
    renderQuestionChat();
    $("#nextQuestion").addEventListener("click", nextQuestion);
    $("#saveQuestionChat").addEventListener("click", () => saveGameSession("question_roulette", { messages: state.questionMessages }));
    return;
  }

  const pair = choosePair();
  kicker.textContent = "RANDOM SIGNAL";
  title.textContent = "가볍게 Signal 보내기";
  content.innerHTML = pair
    ? `
      <div class="pair-card">
        <div class="avatar large">${escapeHtml(participantName(pair)[0])}</div>
        <h3>${escapeHtml(participantName(pair))}</h3>
        <p>${participantTags(pair).length ? escapeHtml(participantTags(pair).join(" · ")) : "오늘 행사 참여자"}</p>
      </div>
      <div class="button-row">
        <button class="solid" id="signalPair">Signal 보내기</button>
        <button class="ghost" id="nextPair">다른 사람</button>
      </div>
    `
    : `
      <div class="modal-result">아직 추천할 참여자가 없습니다.</div>
      <button class="ghost wide" id="closePairing">닫기</button>
    `;
  if (pair) {
    $("#signalPair").addEventListener("click", () => sendSignal(pair.id));
    $("#nextPair").addEventListener("click", () => renderModal("pairing"));
  } else {
    $("#closePairing").addEventListener("click", closeModal);
  }
}

async function drawAiCard(type) {
  const result = $("#aiResult");
  result.classList.add("spinning");
  result.textContent = "열어보는 중...";
  let text;
  try {
    text = await callSignalAi(type, [{ role: "user", content: type === "love" ? "오늘의 연애운을 짧고 재밌게 봐줘." : "오늘의 포춘쿠키 한 줄을 줘." }]);
  } catch {
    text = fallbackAi(type);
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

async function nextQuestion() {
  const input = $("#questionInput");
  const userText = input.value.trim();
  if (userText) state.questionMessages.push({ role: "user", content: userText });
  input.value = "";
  state.questionMessages.push({ role: "assistant", content: "생각 중..." });
  renderQuestionChat();

  let answer;
  try {
    answer = await callSignalAi("questions", state.questionMessages.filter((message) => message.content !== "생각 중..."));
  } catch {
    answer = fallbackAi("questions");
  }
  state.questionMessages[state.questionMessages.length - 1] = { role: "assistant", content: answer };
  renderQuestionChat();
  await saveGameSession("question_roulette", { messages: state.questionMessages, source: "ai_or_fallback" });
}

function subscribeRealtime() {
  if (!state.client || !state.room || !state.me) return;
  state.client
    .channel(`signal-room-${state.room.id}`)
    .on("postgres_changes", { event: "*", schema: "public", table: "participants", filter: `room_id=eq.${state.room.id}` }, () => refreshAll())
    .on("postgres_changes", { event: "*", schema: "public", table: "signals", filter: `room_id=eq.${state.room.id}` }, () => refreshAll())
    .on("postgres_changes", { event: "*", schema: "public", table: "matches", filter: `room_id=eq.${state.room.id}` }, () => refreshAll())
    .on("postgres_changes", { event: "*", schema: "public", table: "notifications", filter: `recipient_id=eq.${state.me.id}` }, () => {
      refreshAll();
      showToast("새 알림이 도착했어요.");
    })
    .subscribe();
}

function bindEvents() {
  $$(".nav-item, .icon-button, .text-button[data-view]").forEach((button) => {
    button.addEventListener("click", () => setView(button.dataset.view));
  });

  $("#joinRoom").addEventListener("click", joinRoom);
  $("#refreshPeople").addEventListener("click", () => state.client && refreshAll());
  $("#resetMe").addEventListener("click", () => {
    localStorage.removeItem(STORAGE_KEY);
    location.reload();
  });

  $("#closeModal").addEventListener("click", closeModal);
  $("#gameModal").addEventListener("click", (event) => {
    if (event.target.id === "gameModal") closeModal();
  });

  $("#markAllRead").addEventListener("click", async () => {
    if (!state.client || !state.me) return;
    const { error } = await state.client.from("notifications").update({ is_read: true }).eq("recipient_id", state.me.id);
    showToast(error ? error.message : "알림을 읽음 처리했습니다.");
    await refreshAll();
  });

  document.addEventListener("click", async (event) => {
    const signalId = event.target.dataset.signalId;
    const openGame = event.target.dataset.openGame;
    const readId = event.target.dataset.readId;
    if (signalId) await sendSignal(signalId);
    if (openGame) openModal(openGame);
    if (readId) {
      const { error } = await state.client.from("notifications").update({ is_read: true }).eq("id", readId);
      showToast(error ? error.message : "읽음 처리했습니다.");
      await refreshAll();
    }
  });
}

bindEvents();
const session = loadSession();
if (session) {
  session.roomCode = EVENT_CODE;
  restoreSession(session);
} else {
  renderSignedOut();
}
