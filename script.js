function showSection(sectionId) {
    // Esto oculta o muestra secciones (luego ampliaremos esta lógica)
    alert("Navegando a: " + sectionId);
}

function saveCharacter() {
    const name = document.getElementById('char-name').value;
    const greeting = document.getElementById('char-greeting').value;
    
    if(!name || !greeting) {
        alert("Por favor completa los campos principales");
        return;
    }
    
    // Aquí es donde guardaremos los datos en la memoria del celular
    const charData = { name, greeting };
    localStorage.setItem('tempChar', JSON.stringify(charData));
    
    alert("¡Personaje " + name + " guardado exitosamente!");
}
