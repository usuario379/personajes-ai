let uploadedImageBase64 = '';

// NAVEGACIÓN INFERIOR
function switchNav(screenId) {
    document.querySelectorAll('.screen-view').forEach(view => view.classList.remove('active'));
    document.getElementById(screenId).classList.add('active');
    
    // Cambiar iconos activos
    document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
}

// MODAL CREAR
function openCreateModal() {
    document.getElementById('create-modal').style.display = 'block';
}

function closeCreateModal() {
    document.getElementById('create-modal').style.display = 'none';
}

// FORMULARIO CREAR PERSONAJE
function openCreateForm() {
    closeCreateModal();
    document.getElementById('form-create-character').style.display = 'block';
}

function closeCreateForm() {
    document.getElementById('form-create-character').style.display = 'none';
}

// PREVISUALIZAR IMAGEN DESDE DISPOSITIVO
function previewImage(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            uploadedImageBase64 = e.target.result;
            const label = document.getElementById('image-preview-label');
            label.innerHTML = `<img src="${uploadedImageBase64}" style="width:100%; height:100%; object-fit:cover;">`;
        };
        reader.readAsDataURL(file);
    }
}

// GUARDAR PERSONAJE NUEVO
function saveNewCharacter() {
    const name = document.getElementById('new-name').value.trim();
    const greeting = document.getElementById('new-greeting').value.trim();
    
    if(!name) {
        alert("Por favor ponle un nombre al personaje.");
        return;
    }

    const imgUrl = uploadedImageBase64 || 'https://api.dicebear.com/7.x/bottts/svg?seed=' + encodeURIComponent(name);

    // Agregar tarjeta a la feed de explorar
    const feed = document.querySelector('.feed-grid');
    const card = document.createElement('div');
    card.className = 'feed-card';
    card.onclick = () => openChat(name, imgUrl, greeting);
    card.innerHTML = `
        <img src="${imgUrl}" alt="${name}">
        <div class="card-info">
            <h4>${name}</h4>
            <p>${greeting || 'Creado recientemente'}</p>
            <span class="stats">💬 1</span>
        </div>
    `;
    
    feed.prepend(card);
    closeCreateForm();
    alert(`¡Personaje "${name}" creado exitosamente!`);
}

// ABRIR CHAT CON BOT
function openChat(name, avatar, greeting = "¡Hola! ¿De qué quieres hablar hoy?") {
    document.getElementById('active-name').innerText = name;
    document.getElementById('active-avatar').src = avatar;

    const messages = document.getElementById('messages-container');
    messages.innerHTML = `<div class="msg bot">${greeting}</div>`;

    switchNav('view-active-chat');
}

// ENVIAR MENSAJE
function sendChatMessage() {
    const input = document.getElementById('user-msg-input');
    const text = input.value.trim();
    if(!text) return;

    const container = document.getElementById('messages-container');

    // Mensaje del usuario
    const userMsg = document.createElement('div');
    userMsg.className = 'msg user';
    userMsg.innerText = text;
    container.appendChild(userMsg);

    input.value = '';
    container.scrollTop = container.scrollHeight;

    // Respuesta automática
    setTimeout(() => {
        const botName = document.getElementById('active-name').innerText;
        const botMsg = document.createElement('div');
        botMsg.className = 'msg bot';
        botMsg.innerText = `[${botName}]: ${text}`;
        container.appendChild(botMsg);
        container.scrollTop = container.scrollHeight;
    }, 1000);
}
