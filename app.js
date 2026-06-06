const STORAGE_KEY = "signal.session.v3";
const DEFAULT_SUPABASE_URL = "https://iwravorcdoswhssmnzue.supabase.co";
const DEFAULT_SUPABASE_ANON_KEY = "sb_publishable_bK_JuZ6qGdlfypAbfE0Btg_nDgBpom7";
const EVENT_CODE = "LOL-EVENT";
const EVENT_NAME = "LOL Signal";

const topics = [
  "오늘 여기 오게 된 이유는?",
  "오늘의 vibe를 노래 제목으로 말한다면?",
  "서로 첫인상을 한 단어로 말해보기",
  "요즘 가장 빠져있는 것 하나 말하기",
  "연애할 때 가장 큰 green flag는?",
  "오늘 파티에서 꼭 하고 싶은 것 하나",
];

const missions = [
  "서로 닉네임의 뜻 말하기",
  "지금 기분을 이모지 3개로 표현하기",
  "상대방에게 질문 하나 하기",
  "오늘 가장 마음에 드는 스타일 말하기",
  "둘 다 좋아하는 관심사 찾기",
  "같이 사진 찍기 or 인스타 교환하기, 선택 가능",
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
  notifications: [],
  selectedPair: null,
  currentGame: null,
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
  await Promise.all([loadPeople(), loadSignals(), loadNotifications(), loadMatches()]);
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

async function loadMatches() {
  const { data, error } = await state.client
    .from("matches")
    .select("*")
    .eq("room_id", state.room.id)
    .or(`participant_a.eq.${state.me.id},participant_b.eq.${state.me.id}`)
    .order("created_at", { ascending: false });
  if (error) throw error;
  state.matches = data || [];
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
  $("#matchesList").innerHTML = emptyCard("Match 없음", "입장 후 확인할 수 있습니다.");
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
  $("#homeMatchCount").textContent = String(state.matches.length);

  renderPeople();
  renderSignalLists();
  renderMatches();
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

function renderMatches() {
  if (!state.matches.length) {
    $("#matchesList").innerHTML = emptyCard("아직 Match 없음", "서로 Signal이 통하면 여기에 표시됩니다.");
    return;
  }
  $("#matchesList").innerHTML = state.matches
    .map(
      (match) => `
        <article class="match-card">
          <h3>${escapeHtml(match.title || "Match!")}</h3>
          <p>${escapeHtml(match.metadata?.summary || "서로 Signal이 통했어요.")}</p>
          <button class="solid">대화 주제 보기</button>
        </article>
      `
    )
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
    return;
  }
  const { error } = await state.client.from("game_sessions").insert({
    room_id: state.room.id,
    created_by: state.me.id,
    game_type: gameType,
    participants: [state.me.id],
    input_data: {},
    result_data: resultData,
  });
  showToast(error ? error.message : "저장했습니다.");
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

  if (type === "roulette") {
    kicker.textContent = "TOPIC ROULETTE";
    title.textContent = "지금 꺼낼 대화 주제";
    content.innerHTML = `
      <div class="modal-result" id="rouletteTopic">버튼을 누르면 주제가 나옵니다.</div>
      <div class="button-row">
        <button class="solid" id="spinRoulette">뽑기</button>
        <button class="ghost" id="saveRoulette">저장</button>
      </div>
    `;
    $("#spinRoulette").addEventListener("click", spinRoulette);
    $("#saveRoulette").addEventListener("click", () => saveGameSession("topic_roulette", { topic: $("#rouletteTopic").textContent }));
    return;
  }

  if (type === "dice") {
    kicker.textContent = "DICE MISSION";
    title.textContent = "짧은 미션";
    content.innerHTML = `
      <div class="dice" id="diceValue">-</div>
      <div class="modal-result" id="diceMission">주사위를 굴려 미션을 뽑으세요.</div>
      <div class="button-row">
        <button class="solid" id="rollDice">굴리기</button>
        <button class="ghost" id="closeDice">닫기</button>
      </div>
    `;
    $("#rollDice").addEventListener("click", rollDice);
    $("#closeDice").addEventListener("click", closeModal);
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

function spinRoulette() {
  const topic = $("#rouletteTopic");
  topic.classList.add("spinning");
  topic.textContent = "뽑는 중...";
  setTimeout(() => {
    topic.textContent = pick(topics);
    topic.classList.remove("spinning");
  }, 520);
}

function rollDice() {
  let ticks = 0;
  const timer = setInterval(() => {
    const value = Math.floor(Math.random() * 6) + 1;
    $("#diceValue").textContent = value;
    $("#diceMission").textContent = missions[value - 1];
    ticks += 1;
    if (ticks > 10) {
      clearInterval(timer);
      saveGameSession("dice_mission", { dice: Number($("#diceValue").textContent), mission: $("#diceMission").textContent });
    }
  }, 75);
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
