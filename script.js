let bots = [
  { id: 1, name: "Lilith", age: 24, personality: "Dominante, sarcástica y oscura." },
  { id: 2, name: "Alex", age: 21, personality: "Amigable, protector e intenso." }
];
let currentBot = null;
const BANNED_TERMS = ["minor", "underage", "loli", "shota", "schoolgirl", "child", "niño", "niña", "menor", "infantil"];

// Control de Pestañas
document.getElementById('tab-chat').onclick = () => showTab('sec-chat', 'tab-chat');
document.getElementById('tab-explore').onclick = () => { showTab('sec-explore', 'tab-explore'); renderExplore(); };
document.getElementById('tab-create').onclick = () => showTab('sec-create', 'tab-create');

function showTab(secId, tabId) {
  ['sec-chat', 'sec-explore', 'sec-create'].forEach(id => document.getElementById(id).classList.add('hidden'));
  ['tab-chat', 'tab-explore', 'tab-create'].forEach(id => document.getElementById(id).classList.remove('active'));
  document.getElementById(secId).classList.remove('hidden');
  document.getElementById(tabId).classList.add('active');
}

// Renderizar Biblioteca
function renderExplore() {
  const grid = document.getElementById('bot-grid');
  grid.innerHTML = "";
  bots.forEach(bot => {
    const card = document.createElement('div');
    card.className = "bot-card";
    card.innerHTML = `<h3>${bot.name} (+${bot.age})</h3><p>${bot.personality.substring(0, 40)}...</p>`;
    card.onclick = () => selectBot(bot);
    grid.appendChild(card);
  });
}

function selectBot(bot) {
  currentBot = bot;
  document.getElementById('active-bot-name').innerText = bot.name;
  document.getElementById('active-bot-badge').innerText = `+${bot.age}`;
  document.getElementById('user-input').disabled = false;
  document.getElementById('btn-send').disabled = false;
  showTab('sec-chat', 'tab-chat');
  appendMsg("system", `Iniciaste chat con ${bot.name}.`);
}

// Crear Bot
document.getElementById('bot-form').onsubmit = (e) => {
  e.preventDefault();
  const name = document.getElementById('bot-name').value;
  const age = parseInt(document.getElementById('bot-age').value);
  const personality = document.getElementById('bot-personality').value;

  if (age < 18) return alert("SEGURIDAD: Todos los bots deben ser mayores de 18 años.");

  const newBot = { id: Date.now(), name, age, personality };
  bots.push(newBot);
  alert("¡Bot publicado!");
  selectBot(newBot);
};

// Chat y Filtro CSAM
document.getElementById('btn-send').onclick = () => {
  const input = document.getElementById('user-input');
  const text = input.value.trim();
  if (!text || !currentBot) return;

  if (BANNED_TERMS.some(term => text.toLowerCase().includes(term))) {
    appendMsg("error", "MENSAJE BLOQUEADO: Infracción Anti-CSAM detectada.");
    input.value = "";
    return;
  }

  appendMsg("user", text);
  input.value = "";

  setTimeout(() => {
    appendMsg("bot", `[${currentBot.name}]: respondiendo como "${currentBot.personality}": ${text}`);
  }, 1000);
};

function appendMsg(sender, text) {
  const box = document.getElementById('chat-box');
  const msg = document.createElement('div');
  msg.className = `msg ${sender}`;
  msg.innerText = text;
  box.appendChild(msg);
  box.scrollTop = box.scrollHeight;
}

document.getElementById('btn-verify').onclick = () => document.getElementById('age-gate').style.display = 'none';
