// CONTROL DE EDAD (+18)
document.getElementById('btn-verify').addEventListener('click', () => {
    document.getElementById('age-gate').style.display = 'none';
});

// NAVEGACIÓN POR PESTAÑAS
const tabBtns = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');

tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        tabBtns.forEach(b => b.classList.remove('active'));
        tabContents.forEach(c => c.classList.remove('active'));

        btn.classList.add('active');
        const tabId = btn.getAttribute('data-tab');
        document.getElementById(tabId).classList.add('active');
    });
});

// SELECCIONAR BOT DESDE EXPLORAR
function selectBot(name, avatarUrl) {
    document.getElementById('chat-bot-name').innerText = name;
    document.getElementById('chat-bot-avatar').src = avatarUrl;
    
    // Cambiar automáticamente a la pestaña de Chat
    document.querySelectorAll('.tab-btn')[1].click();
    
    // Limpiar mensajes y dar bienvenida
    const container = document.getElementById('chat-messages');
    container.innerHTML = `<div class="message bot">¡Hola! Has comenzado a hablar con ${name}. ¿En qué te puedo ayudar?</div>`;
}

// ENVIAR MENSAJE
document.getElementById('send-btn').addEventListener('click', sendMessage);
document.getElementById('user-input').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
});

function sendMessage() {
    const input = document.getElementById('user-input');
    const text = input.value.trim();
    if (!text) return;

    const messages = document.getElementById('chat-messages');

    // Mensaje del usuario
    const userMsg = document.createElement('div');
    userMsg.className = 'message user';
    userMsg.innerText = text;
    messages.appendChild(userMsg);

    input.value = '';
    messages.scrollTop = messages.scrollHeight;

    // Respuesta simulada del bot
    setTimeout(() => {
        const botName = document.getElementById('chat-bot-name').innerText;
        const botMsg = document.createElement('div');
        botMsg.className = 'message bot';
        botMsg.innerText = `[${botName}]: Entendido tu mensaje: "${text}"`;
        messages.appendChild(botMsg);
        messages.scrollTop = messages.scrollHeight;
    }, 1000);
}

// FORMULARIO PARA CREAR BOT NUEVO
document.getElementById('create-bot-form').addEventListener('submit', (e) => {
    e.preventDefault();

    const name = document.getElementById('new-bot-name').value;
    const desc = document.getElementById('new-bot-desc').value;
    const avatarUrl = `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(name)}`;

    // Crear la tarjeta en la parrilla de explorar
    const grid = document.querySelector('.bot-grid');
    const newCard = document.createElement('div');
    newCard.className = 'bot-card';
    newCard.onclick = () => selectBot(name, avatarUrl);
    newCard.innerHTML = `
        <img src="${avatarUrl}" alt="Bot">
        <h4>${name}</h4>
        <p>${desc}</p>
    `;

    grid.appendChild(newCard);

    // Reiniciar formulario y volver a pestaña Explorar
    e.target.reset();
    document.querySelectorAll('.tab-btn')[0].click();
});

