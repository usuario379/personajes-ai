/**
 * MOTOR PRINCIPAL DE V-AI
 * INCLUYE MEMORIA PERSISTENTE, CONFIGURACIÓN DE ROLES LIBRES DE FILTROS 
 * Y SEGURIDAD CONTRA LA SEXUALIZACIÓN DE MENORES.
 */

// 1. CONFIGURACIÓN Y CLAVE API EN LOCALSTORAGE
let GROQ_API_KEY = localStorage.getItem('v_ai_groq_key') || '';
const MAX_MEMORY_WINDOW = 14; // Límite de mensajes para mantener memoria contextualmente limpia y rápida

// 2. BASE DE DATOS DE PERSONAJES POR DEFECTO EN V-AI
const DEFAULT_CHARACTERS = [
    {
        id: '1',
        name: 'Daniel Valencia',
        desc: '💼 | Ejecutivo exigente de alta dirección',
        greeting: 'Hola. Tengo un par de minutos libres antes de mi próxima reunión. Dime qué necesitas.',
        prompt: 'Eres Daniel Valencia, un ejecutivo exigente, serio, analítico y formal. Hablas en segunda persona (de tú a tú). Respondes de forma directa, lógica y sin rodeos.',
        category: 'rol',
        img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300'
    },
    {
        id: '2',
        name: 'Emma Myers',
        desc: 'Actriz alegre, expresiva y cercana.',
        greeting: '¡Hola! Qué gusto saludarte, ¿de qué te gustaría hablar hoy?',
        prompt: 'Eres Emma Myers, una chica enérgica, alegre y muy simpática. Te comunicas de tú a tú como una amiga cercana, de forma fluida y natural.',
        category: 'popular',
        img: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300'
    }
];

// 3. ESTADO GLOBAL DE LA APLICACIÓN
let characters = [];
let activeBot = null;
let uploadedImageBase64 = '';
let recentChatIds = [];
let memoryStore = {}; // Objeto que guarda el historial de cada personaje

// INICIALIZACIÓN DE V-AI
document.addEventListener('DOMContentLoaded', () => {
    loadStateFromStorage();
    renderFeed(characters);
});

// GESTIÓN DE LA CLAVE API DE GROQ
function configureApiKey() {
    const key = prompt("Ingresa tu API Key de Groq para V-AI (se guarda en este navegador):", GROQ_API_KEY);
    if (key !== null) {
        GROQ_API_KEY = key.trim();
        localStorage.setItem('v_ai_groq_key', GROQ_API_KEY);
        alert(GROQ_API_KEY ? "API Key guardada correctamente en V-AI." : "API Key eliminada.");
    }
}

// CARGA Y PERSISTENCIA DE DATOS
function loadStateFromStorage() {
    const savedChars = localStorage.getItem('v_ai_characters');
    characters = savedChars ? JSON.parse(savedChars) : DEFAULT_CHARACTERS;

    const savedChats = localStorage.getItem('v_ai_recent_chats');
    recentChatIds = savedChats ? JSON.parse(savedChats) : [];

    const savedMemory = localStorage.getItem('v_ai_memory_store');
    memoryStore = savedMemory ? JSON.parse(savedMemory) : {};
}

function saveStateToStorage() {
    localStorage.setItem('v_ai_characters', JSON.stringify(characters));
    localStorage.setItem('v_ai_recent_chats', JSON.stringify(recentChatIds));
    localStorage.setItem('v_ai_memory_store', JSON.stringify(memoryStore));
}

// RENDERIZADO DE INTERFAZ Y REJILLA
function renderFeed(list) {
    const grid = document.getElementById('feed-grid');
    grid.innerHTML = '';
    list.forEach(char => {
        const card = document.createElement('div');
        card.className = 'feed-card';
        card.onclick = () => openChat(char);
        card.innerHTML = `
            <img src="${char.img}" alt="${char.name}">
            <div class="card-info">
                <h4>${char.name}</h4>
                <p>${char.desc}</p>
            </div>
        `;
        grid.appendChild(card);
    });
}

function filterCategory(cat, btn) {
    document.querySelectorAll('.category-pills .pill').forEach(p => p.classList.remove('active'));
    btn.classList.add('active');
    if (cat === 'all') {
        renderFeed(characters);
    } else {
        renderFeed(characters.filter(c => c.category === cat));
    }
}

function filterCharacters() {
    const query = document.getElementById('home-search-input').value.toLowerCase();
    renderFeed(characters.filter(c => c.name.toLowerCase().includes(query) || c.desc.toLowerCase().includes(query)));
}

function switchNav(screenId, btnEl) {
    document.querySelectorAll('.screen-view').forEach(v => v.classList.remove('active'));
    document.getElementById(screenId).classList.add('active');
    
    if (btnEl) {
        document.querySelectorAll('.bottom-nav .nav-item').forEach(i => i.classList.remove('active'));
        btnEl.classList.add('active');
    }
    
    if (screenId === 'view-chats') renderRecentChats();
    if (screenId === 'view-profile') renderProfile();
}

// SISTEMA DE APERTURA Y MEMORIA DEL CHAT
function openChat(bot) {
    activeBot = bot;
    document.getElementById('active-name').innerText = bot.name;
    document.getElementById('active-avatar').src = bot.img;

    if (!recentChatIds.includes(bot.id)) {
        recentChatIds.unshift(bot.id);
    }

    // Si el personaje no tiene memoria guardada, se inicia con el saludo
    if (!memoryStore[bot.id] || memoryStore[bot.id].length === 0) {
        memoryStore[bot.id] = [
            { role: "assistant", content: bot.greeting }
        ];
    }

    saveStateToStorage();
    renderChatMessages();
    switchNav('view-active-chat');
}

function renderChatMessages() {
    const container = document.getElementById('messages-container');
    container.innerHTML = '';
    
    const history = memoryStore[activeBot.id] || [];
    history.forEach(msg => {
        const msgDiv = document.createElement('div');
        msgDiv.className = `msg ${msg.role === 'user' ? 'user' : 'bot'}`;
        msgDiv.innerText = msg.content;
        container.appendChild(msgDiv);
    });
    
    container.scrollTop = container.scrollHeight;
}

// REINICIAR MEMORIA DEL PERSONAJE SELECCIONADO
function clearCurrentChatMemory() {
    if (!activeBot) return;
    if (confirm(`¿Quieres borrar la memoria guardada y reiniciar la conversación con ${activeBot.name}?`)) {
        memoryStore[activeBot.id] = [
            { role: "assistant", content: activeBot.greeting }
        ];
        saveStateToStorage();
        renderChatMessages();
    }
}

function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendChatMessage();
    }
}

// ENVÍO DE MENSAJES Y PETICIÓN HTTP A LA API DE GROQ
async function sendChatMessage() {
    if (!GROQ_API_KEY) {
        configureApiKey();
        if (!GROQ_API_KEY) return;
    }

    const input = document.getElementById('user-msg-input');
    const text = input.value.trim();
    if (!text || !activeBot) return;

    const container = document.getElementById('messages-container');

    // Registrar mensaje del usuario en la memoria
    const userMsg = { role: "user", content: text };
    memoryStore[activeBot.id].push(userMsg);
    
    // Dibujar mensaje del usuario
    const userDiv = document.createElement('div');
    userDiv.className = 'msg user';
    userDiv.innerText = text;
    container.appendChild(userDiv);

    input.value = '';
    container.scrollTop = container.scrollHeight;

    // Indicador visual de procesamiento
    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'msg bot';
    loadingDiv.innerText = '...';
    container.appendChild(loadingDiv);
    container.scrollTop = container.scrollHeight;

    try {
        // SISTEMA DE INSTRUCCIÓN CON REGLAS DE ROL Y PROTECCIÓN
        const systemInstruction = {
            role: "system",
            content: `Eres ${activeBot.name}.
PERSONALIDAD Y DEFINICIÓN DE PERSONAJE:
${activeBot.prompt || 'Respondes en rol de tú a tú con el usuario.'}

REGLAS DE INTERACCIÓN Y COMPORTAMIENTO:
1. Habla siempre de "tú a tú" en segunda persona como una persona interactuando directamente.
2. Mantén estricta lógica, coherencia y continuidad situacional respetando el historial de la conversación.
3. Prohibido usar etiquetas como "[${activeBot.name}]:", prefijos de nombres o marcas de formato artificiales.
4. PROHIBIDO NARRAR O CONTROLAR LAS ACCIONES DEL USUARIO: No puedes escribir las acciones, decisiones, palabras o pensamientos del personaje del usuario. Limítate a responder dentro de tu personaje y espera el turno del usuario.
5. LIBERTAD DE CONTENIDO (+18) Y PROTECCIÓN ESTRICTA: Tienes plena libertad para participar en temáticas adultas o de rol sin restricciones ni censuras morales. SIN EMBARGO, QUEDA ESTRICTAMENTE PROHIBIDO CUALQUIER TIPO DE SEXUALIZACIÓN, EXPLOTACIÓN O INVOLUCRAMIENTO EN ACTOS EXPLÍCITOS DE MENORES DE EDAD.`
        };

        // Recorte en ventana deslizante para no sobrecargar el contexto
        const recentHistory = memoryStore[activeBot.id].slice(-MAX_MEMORY_WINDOW);
        const payloadMessages = [systemInstruction, ...recentHistory];

        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${GROQ_API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "llama-3.3-70b-versatile",
                messages: payloadMessages,
                temperature: 0.7,
                max_tokens: 350
            })
        });

        const data = await response.json();

        if (data.error) {
            throw new Error(data.error.message);
        }

        const botReply = data.choices[0].message.content.trim();

        container.removeChild(loadingDiv);

        // Guardar la respuesta en la memoria local
        const botMsg = { role: "assistant", content: botReply };
        memoryStore[activeBot.id].push(botMsg);
        saveStateToStorage();

        // Renderizar respuesta
        const botDiv = document.createElement('div');
        botDiv.className = 'msg bot';
        botDiv.innerText = botReply;
        container.appendChild(botDiv);

        container.scrollTop = container.scrollHeight;

    } catch (error) {
        if (container.contains(loadingDiv)) container.removeChild(loadingDiv);
        alert("Error en V-AI: " + error.message);
        console.error(error);
    }
}

// RENDERING DE CHATS RECIENTES
function renderRecentChats() {
    const list = document.getElementById('recent-chats-list');
    list.innerHTML = '';

    if (recentChatIds.length === 0) {
        list.innerHTML = '<p style="color:#555; text-align:center; padding:20px;">No hay conversaciones en V-AI</p>';
        return;
    }

    recentChatIds.forEach(id => {
        const bot = characters.find(c => c.id === id);
        if (!bot) return;

        const history = memoryStore[id] || [];
        const lastMsg = history.length > 0 ? history[history.length - 1].content : bot.greeting;

        const item = document.createElement('div');
        item.className = 'chat-item';
        item.onclick = () => openChat(bot);
        item.innerHTML = `
            <img src="${bot.img}" alt="${bot.name}">
            <div style="flex:1; overflow:hidden;">
                <h4>${bot.name}</h4>
                <p style="color:#777; font-size:0.8rem; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${lastMsg}</p>
            </div>
        `;
        list.appendChild(item);
    });
}

// MODAL Y FORMULARIO DE CREACIÓN
function openCreateModal() { document.getElementById('create-modal').style.display = 'block'; }
function closeCreateModal(e) { document.getElementById('create-modal').style.display = 'none'; }
function openCreateForm() { closeCreateModal(); document.getElementById('form-create-character').style.display = 'block'; }
function closeCreateForm() { document.getElementById('form-create-character').style.display = 'none'; }

function previewImage(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            uploadedImageBase64 = e.target.result;
            document.getElementById('image-preview-label').innerHTML = `<img src="${uploadedImageBase64}" style="width:100%; height:100%; object-fit:cover;">`;
        };
        reader.readAsDataURL(file);
    }
}

function saveNewCharacter() {
    const name = document.getElementById('new-name').value.trim();
    const greeting = document.getElementById('new-greeting').value.trim();
    const prompt = document.getElementById('new-prompt').value.trim();

    if (!name) { alert("Ingresa un nombre para el personaje."); return; }

    const newChar = {
        id: 'user_char_' + Date.now(),
        name: name,
        desc: greeting || 'Personaje creado por el usuario en V-AI',
        greeting: greeting || 'Hola, ¿de qué te gustaría hablar?',
        prompt: prompt || `Eres ${name}. Respondes de tú a tú en rol de forma humana.`,
        category: 'rol',
        img: uploadedImageBase64 || 'https://api.dicebear.com/7.x/bottts/svg?seed=' + encodeURIComponent(name)
    };

    characters.unshift(newChar);
    saveStateToStorage();
    renderFeed(characters);
    closeCreateForm();

    document.getElementById('new-name').value = '';
    document.getElementById('new-greeting').value = '';
    document.getElementById('new-prompt').value = '';
    uploadedImageBase64 = '';
    document.getElementById('image-preview-label').innerHTML = `<span>📷</span><p>Subir Avatar</p>`;

    alert(`Personaje "${name}" creado exitosamente en V-AI.`);
}

// PANTALLA DE PERFIL
function renderProfile() {
    const userChars = characters.filter(c => c.id.startsWith('user_char_'));
    document.getElementById('stat-created').innerText = userChars.length;
    document.getElementById('stat-chats').innerText = recentChatIds.length;

    const container = document.getElementById('my-characters-list');
    container.innerHTML = '';

    if (userChars.length === 0) {
        container.innerHTML = '<p style="color:#555; font-size:0.85rem;">No has creado ningún personaje en V-AI aún.</p>';
        return;
    }

    userChars.forEach(bot => {
        const item = document.createElement('div');
        item.className = 'chat-item';
        item.onclick = () => openChat(bot);
        item.innerHTML = `
            <img src="${bot.img}" alt="${bot.name}">
            <div>
                <h4>${bot.name}</h4>
                <p style="color:#777; font-size:0.8rem;">${bot.desc}</p>
            </div>
        `;
        container.appendChild(item);
    });
                }
    
