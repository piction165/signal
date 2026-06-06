const STORAGE_KEY = "signal.supabase.config.v1";

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

const outcomes = ["질문하기", "칭찬하기", "노래 추천하기", "인스타 교환 제안하기", "AI 주제 받기", "다음 사람 초대하기"];

const state = {
  client: null,
  config: null,
  room: null,
  me: null,
  people: [],
  notifications: [],
  selectedPair: null,
};

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

function pick(items) {
  if (!items.length) return null;
  return items[Math.floor(Math.random() * items.length)];
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

function setView(view) {
  $$(".view").forEach((item) => item.classList.remove("active"));
  $(`#view-${view}`).classList.add("active");
  $$(".nav-item").forEach((item) => item.classList.toggle("active", item.dataset.view === view));
}

function loadConfig() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
  } catch {
    return null;
  }
}

function saveConfig(config) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
}

function applyConfigToInputs(config) {
  $("#supabaseUrl").value = config?.url || "";
  $("#supabaseAnonKey").value = config?.anonKey || "";
  $("#roomCodeInput").value = config?.roomCode || "";
  $("#participantIdInput").value = config?.participantId || "";
}

function setConnected(isConnected) {
  $("#connectionState").innerHTML = isConnected ? '<span class="status-dot"></span>Live' : "Offline";
  $("#setupPanel").classList.toggle("collapsed", Boolean(isConnected));
}

function emptyCard(title, body) {
  return `<article class="empty-card"><h3>${escapeHtml(title)}</h3><p>${escapeHtml(body)}</p></article>`;
}

function participantName(person) {
  return person.nickname || person.name || person.display_name || "익명 참가자";
}

function participantTags(person) {
  const raw = person.interests || person.tags || person.profile_tags || [];
  if (Array.isArray(raw)) return raw.filter(Boolean).slice(0, 4);
  if (typeof raw === "string") return raw.split(",").map((item) => item.trim()).filter(Boolean).slice(0, 4);
  return [];
}

async function connectSupabase(config) {
  if (!config?.url || !config?.anonKey || !config?.roomCode) {
    setConnected(false);
    renderDisconnected();
    return;
  }

  state.config = config;
  state.client = window.supabase.createClient(config.url, config.anonKey);
  $("#roomLabel").textContent = config.roomCode;

  await refreshAll();
  subscribeRealtime();
}

async function refreshAll() {
  try {
    await loadRoom();
    await Promise.all([loadPeople(), loadNotifications(), loadSignals(), loadMatches(), loadMe()]);
    setConnected(true);
  } catch (error) {
    setConnected(false);
    showToast(error.message || "Supabase 연결 실패");
    renderDisconnected(error.message);
  }
}

async function loadRoom() {
  const { data, error } = await state.client
    .from("party_rooms")
    .select("id, room_code, name")
    .eq("room_code", state.config.roomCode)
    .maybeSingle();

  if (error) throw error;
  if (!data) throw new Error("room_code에 해당하는 party_rooms row가 없습니다.");
  state.room = data;
  $("#roomLabel").textContent = data.name || data.room_code;
}

async function loadPeople() {
  const { data, error } = await state.client
    .from("participants")
    .select("*")
    .eq("room_id", state.room.id)
    .neq("id", state.config.participantId || "00000000-0000-0000-0000-000000000000")
    .order("created_at", { ascending: false });

  if (error) throw error;
  state.people = data || [];
  $("#onlineCount").textContent = `${state.people.length}명`;
  renderPeople();
}

async function loadMe() {
  if (!state.config.participantId) {
    $("#meCard").innerHTML = `
      <div class="avatar large">?</div>
      <h3>participant id 필요</h3>
      <p>내 participant id를 넣으면 실제 내 프로필을 불러옵니다.</p>
    `;
    return;
  }

  const { data, error } = await state.client.from("participants").select("*").eq("id", state.config.participantId).maybeSingle();
  if (error) throw error;
  state.me = data;
  if (!data) {
    $("#meCard").innerHTML = `
      <div class="avatar large">?</div>
      <h3>프로필 없음</h3>
      <p>입력한 participant id에 해당하는 row가 없습니다.</p>
    `;
    return;
  }

  const name = participantName(data);
  const tags = participantTags(data);
  $("#meCard").innerHTML = `
    <div class="avatar large">${escapeHtml(name[0])}</div>
    <h3>${escapeHtml(name)}</h3>
    <p>${tags.length ? escapeHtml(tags.join(" · ")) : "관심사가 아직 없습니다."}</p>
  `;
}

async function loadNotifications() {
  if (!state.config.participantId) {
    state.notifications = [];
    renderNotifications();
    return;
  }

  const { data, error } = await state.client
    .from("notifications")
    .select("*")
    .eq("recipient_id", state.config.participantId)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) throw error;
  state.notifications = data || [];
  renderNotifications();
}

async function loadSignals() {
  if (!state.config.participantId || !state.room) {
    $("#receivedSignalCount").textContent = "-";
    return;
  }

  const { count, error } = await state.client
    .from("signals")
    .select("id", { count: "exact", head: true })
    .eq("room_id", state.room.id)
    .eq("receiver_id", state.config.participantId);

  if (error) throw error;
  $("#receivedSignalCount").textContent = String(count || 0);
  $("#signalHelp").textContent = count ? "서로 Signal을 보내면 닉네임이 공개됩니다." : "아직 받은 Signal이 없습니다.";
}

async function loadMatches() {
  if (!state.config.participantId || !state.room) {
    renderMatches([]);
    return;
  }

  const { data, error } = await state.client
    .from("matches")
    .select("*")
    .eq("room_id", state.room.id)
    .or(`participant_a.eq.${state.config.participantId},participant_b.eq.${state.config.participantId}`)
    .order("created_at", { ascending: false });

  if (error) throw error;
  renderMatches(data || []);
}

function renderDisconnected(message = "") {
  $("#peopleList").innerHTML = emptyCard("Supabase 연결 필요", message || "URL, anon key, room code를 입력하면 실제 참가자 목록을 불러옵니다.");
  $("#notificationList").innerHTML = emptyCard("알림 없음", "Supabase 연결 후 실제 알림이 표시됩니다.");
  $("#matchesList").innerHTML = emptyCard("매치 없음", "Supabase 연결 후 실제 매치가 표시됩니다.");
  $("#onlineCount").textContent = "-";
  $("#badge").textContent = "0";
  $("#receivedSignalCount").textContent = "-";
}

function renderPeople() {
  if (!state.people.length) {
    $("#peopleList").innerHTML = emptyCard("참가자 없음", "현재 room_id에 표시할 참가자가 없습니다.");
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
              <button class="ghost" data-game-id="${escapeHtml(person.id)}">같이 게임하기</button>
            </div>
          </div>
        </article>
      `;
    })
    .join("");
}

function renderNotifications() {
  const unread = state.notifications.filter((item) => !item.is_read);
  $("#badge").textContent = String(unread.length);

  if (!state.notifications.length) {
    $("#notificationList").innerHTML = emptyCard("알림 없음", "새 Signal, Match, 게임 초대가 오면 여기에 표시됩니다.");
    return;
  }

  const newItems = state.notifications.filter((item) => !item.is_read);
  const oldItems = state.notifications.filter((item) => item.is_read);
  $("#notificationList").innerHTML = `
    ${newItems.length ? "<h3>New</h3>" : ""}
    ${newItems.map(renderNotificationCard).join("")}
    ${oldItems.length ? "<h3>Earlier</h3>" : ""}
    ${oldItems.map(renderNotificationCard).join("")}
  `;
}

function renderNotificationCard(item) {
  return `
    <article class="notice ${item.is_read ? "" : "unread"}">
      <strong>${escapeHtml(item.title)}</strong>
      <p>${escapeHtml(item.body || "")}</p>
      ${item.is_read ? "" : `<button class="ghost small" data-read-id="${escapeHtml(item.id)}">읽음</button>`}
    </article>
  `;
}

function renderMatches(matches) {
  if (!matches.length) {
    $("#matchesList").innerHTML = emptyCard("아직 Match 없음", "서로 Signal이 통하면 여기에 표시됩니다.");
    return;
  }

  $("#matchesList").innerHTML = matches
    .map(
      (match) => `
        <article class="match-card">
          <h3>Match!</h3>
          <p>${escapeHtml(match.title || match.id)}</p>
          <button class="solid">AI 대화 주제 만들기</button>
        </article>
      `
    )
    .join("");
}

async function sendSignal(receiverId) {
  if (!state.client || !state.room || !state.config.participantId) {
    showToast("Supabase 연결과 내 participant id가 필요합니다.");
    return;
  }

  const { error } = await state.client.from("signals").insert({
    room_id: state.room.id,
    sender_id: state.config.participantId,
    receiver_id: receiverId,
  });

  if (error) {
    showToast(error.message);
    return;
  }

  await state.client.from("notifications").insert({
    room_id: state.room.id,
    recipient_id: receiverId,
    actor_id: state.config.participantId,
    type: "received_signal",
    title: "누군가 당신에게 Signal을 보냈어요.",
    body: "서로 Signal을 보내면 공개돼요.",
    metadata: { anonymous: true },
  });

  showToast("익명 Signal을 보냈어요.");
}

async function saveGameSession(gameType, resultData) {
  if (!state.client || !state.room || !state.config.participantId) {
    showToast("Supabase 연결 후 저장할 수 있습니다.");
    return;
  }

  const { error } = await state.client.from("game_sessions").insert({
    room_id: state.room.id,
    created_by: state.config.participantId,
    game_type: gameType,
    participants: [state.config.participantId],
    input_data: {},
    result_data: resultData,
  });

  showToast(error ? error.message : "게임 결과를 저장했습니다.");
}

function choosePair() {
  const visible = state.people.filter((person) => !person.is_hidden && person.id !== state.config?.participantId);
  state.selectedPair = pick(visible);
  if (!state.selectedPair) {
    $("#pairName").textContent = "추천 없음";
    $("#pairLine").textContent = "현재 추천할 참가자가 없습니다.";
    return;
  }

  $("#pairName").textContent = participantName(state.selectedPair);
  $("#pairLine").textContent = "가볍게 인사하고 오늘의 분위기를 물어보세요.";
}

function subscribeRealtime() {
  if (!state.client || !state.room) return;

  state.client
    .channel(`signal-room-${state.room.id}`)
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "notifications", filter: `recipient_id=eq.${state.config.participantId}` },
      () => {
        loadNotifications();
        showToast("새 알림이 도착했어요.");
      }
    )
    .on("postgres_changes", { event: "*", schema: "public", table: "participants", filter: `room_id=eq.${state.room.id}` }, loadPeople)
    .on("postgres_changes", { event: "*", schema: "public", table: "matches", filter: `room_id=eq.${state.room.id}` }, loadMatches)
    .subscribe();
}

function bindEvents() {
  $$(".nav-item, .icon-button").forEach((button) => {
    button.addEventListener("click", () => setView(button.dataset.view));
  });

  $("#saveConfig").addEventListener("click", async () => {
    const config = {
      url: $("#supabaseUrl").value.trim(),
      anonKey: $("#supabaseAnonKey").value.trim(),
      roomCode: $("#roomCodeInput").value.trim(),
      participantId: $("#participantIdInput").value.trim(),
    };
    saveConfig(config);
    await connectSupabase(config);
  });

  $("#clearConfig").addEventListener("click", () => {
    localStorage.removeItem(STORAGE_KEY);
    location.reload();
  });

  $("#refreshPeople").addEventListener("click", refreshAll);

  $("#spinRoulette").addEventListener("click", () => {
    const topic = $("#rouletteTopic");
    topic.classList.add("spinning");
    topic.textContent = "돌아가는 중...";
    setTimeout(() => {
      topic.textContent = pick(topics);
      topic.classList.remove("spinning");
    }, 820);
  });

  $("#saveRoulette").addEventListener("click", () => saveGameSession("topic_roulette", { topic: $("#rouletteTopic").textContent }));

  $("#rollDice").addEventListener("click", () => {
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
    }, 80);
  });

  $("#runLadder").addEventListener("click", () => {
    const person = pick(state.people);
    const result = person ? `${participantName(person)}: ${pick(outcomes)}` : "참가자가 없습니다.";
    $("#ladderResult").textContent = result;
    saveGameSession("ladder_game", { result });
  });

  $("#nextPair").addEventListener("click", choosePair);
  $("#signalPair").addEventListener("click", () => state.selectedPair && sendSignal(state.selectedPair.id));

  $("#makeIcebreaker").addEventListener("click", () =>
    saveGameSession("ai_icebreaker", {
      status: "requested",
      note: "Static Pages preview records the request. Production app should call server-side OpenAI endpoint.",
    })
  );

  $("#markAllRead").addEventListener("click", async () => {
    if (!state.client || !state.config.participantId) return;
    const { error } = await state.client.from("notifications").update({ is_read: true }).eq("recipient_id", state.config.participantId);
    showToast(error ? error.message : "알림을 읽음 처리했습니다.");
    await loadNotifications();
  });

  document.addEventListener("click", async (event) => {
    const signalId = event.target.dataset.signalId;
    const gameId = event.target.dataset.gameId;
    const readId = event.target.dataset.readId;

    if (signalId) await sendSignal(signalId);
    if (gameId) {
      await saveGameSession("game_invite", { receiver_id: gameId });
      showToast("게임 초대 기록을 만들었습니다.");
    }
    if (readId) {
      const { error } = await state.client.from("notifications").update({ is_read: true }).eq("id", readId);
      showToast(error ? error.message : "읽음 처리했습니다.");
      await loadNotifications();
    }
  });
}

bindEvents();
const initialConfig = loadConfig();
applyConfigToInputs(initialConfig);
if (initialConfig) {
  connectSupabase(initialConfig);
} else {
  renderDisconnected();
}
