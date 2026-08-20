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

    // Respuesta dinámica y propia (de tú a tú, sin repetir)
    setTimeout(() => {
        const botMsg = document.createElement('div');
        botMsg.className = 'msg bot';
        
        // Lista de respuestas propias y fluidas
        const respuestasNaturales = [
            "Te entiendo perfectamente. Cuenta conmigo para eso, dime qué más tienes en mente.",
            "Eso suena genial. Me gusta cómo piensas, ¿qué sigue?",
            "Aquí estoy escuchándote a tu lado. Continúa, te presto toda mi atención.",
            "Totalmente de acuerdo contigo. Vamos a seguir con la idea."
        ];
        
        // Selecciona una respuesta diferente de forma aleatoria
        const respuestaElegida = respuestasNaturales[Math.floor(Math.random() * respuestasNaturales.length)];
        
        botMsg.innerText = respuestaElegida;
        container.appendChild(botMsg);
        container.scrollTop = container.scrollHeight;
    }, 1000);
}
