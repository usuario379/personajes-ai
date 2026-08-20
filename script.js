let uploadedImageBase64 = '';

// NAVEGACIÓN INFERIOR
function switchNav(screenId) {
    document.querySelectorAll('.screen-view').forEach(view => view.classList.remove('active'));
    document.getElementById(screenId).classList.add('active');
    
    document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
}

// MODALES
function openCreateModal() {
    document.getElementById('create-modal').style.display = 'block';
}

function closeCreateModal() {
    document.getElementById('create-modal').style.display = 'none';
}

function openCreateForm() {
    closeCreateModal();
    document.getElementById('form-create-character').style.display = 'block';
}

function closeCreateForm() {
    document.getElementById('form-create-character').style.display = 'none';
}

// CARGAR IMAGEN DE PERFIL
function previewImage(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            uploadedImageBase64 = e.target.result;
            const label = document.getElementById('image-preview-label');
            label.innerHTML = `<img src="${uploadedImageBase64}" style="width:100%; height:100%; object-fit:cover; border-radius:50%;">`;
        };
        reader.readAsDataURL(file);
    }
}

// GUARDAR PERSONAJE NUEVO
function saveNewCharacter() {
    const name = document.getElementById('new-name').value.trim();
    const greeting = document.getElementById('new-greeting').value.trim();
    const prompt = document.getElementById('new-prompt').value.trim();
    
    if(!name) {
        alert("Por favor ponle un nombre al personaje.");
        return;
    }

    const imgUrl = uploadedImageBase64 || 'https://api.dicebear.com/7.x/bottts/svg?seed=' + encodeURIComponent(name);

    const feed = document.querySelector('.feed-grid');
    const card = document.createElement('div');
    card.className = 'feed-card';
    card.onclick = () => openChat(name, imgUrl, greeting, prompt);
    card.innerHTML = `
        <img src="${imgUrl}" alt="${name}">
        <div class="card-info">
            <h4>${name}</h4>
            <p>${greeting || 'Hola, ¿de qué quieres hablar?'}</p>
            <span class="stats">💬 1</span>
        </div>
    `;
    
    feed.prepend(card);
    closeCreateForm();
    
    // Limpiar formulario
    document.getElementById('new-name').value = '';
    document.getElementById('new-greeting').value = '';
    document.getElementById('new-prompt').value = '';
    uploadedImageBase64 = '';
    document.getElementById('image-preview-label').innerHTML = `<span>📷</span><p>Subir Foto de Perfil</p>`;
    
    alert(`¡Personaje "${name}" creado exitosamente!`);
}

// ABRIR CHAT CON EL BOT
function openChat(name, avatar, greeting, prompt = "") {
    document.getElementById('active-name').innerText = name;
    document.getElementById('active-avatar').src = avatar;

    const messages = document.getElementById('messages-container');
    const initialGreeting = greeting || `Hola, me alegra verte. ¿De qué quieres que hablemos hoy?`;
    
    // El bot empieza la conversación en personaje de tú a tú
    messages.innerHTML = `<div class="msg bot">${initialGreeting}</div>`;

    switchNav('view-active-chat');
}

// SIMULACIÓN DE RESPUESTA DIRECTA ("TÚ A TÚ" SIN ASUMIR ACCIONES DEL USUARIO)
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

    // Respuesta en segunda persona (Tú a Tú), natural y fluida
    setTimeout(() => {
        const botMsg = document.createElement('div');
        botMsg.className = 'msg bot';
        
        // Genera respuestas directas en tono cercano sin etiquetas de nombre ni corchetes
        const respuestasNaturales = [
            `Te escucho atentamente. Dime más sobre eso.`,
            `Entiendo lo que me dices. ¿Qué opinas si lo vemos de esta otra forma?`,
            `Justo estaba pensando en algo similar. ¿Tú qué piensas hacer ahora?`,
            `Me parece muy interesante. Cuenta conmigo para eso, dime cuál es el siguiente paso.`
        ];
        
        const respuestaElegida = respuestasNaturales[Math.floor(Math.random() * respuestasNaturales.length)];
        
        botMsg.innerText = respuestaElegida;
        container.appendChild(botMsg);
        container.scrollTop = container.scrollHeight;
    }, 1000);
            }

