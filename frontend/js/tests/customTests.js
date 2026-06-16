// Función para asegurar independencia de los tests de samples  y no depender de otro test para tener un token de sesión válido

async function okLogin() {

    // 1. Login como productor (pepe) para obtener un token válido
    const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: 'pepe', password: '12345' }) // Usamos pepe hardcodeado
    });
    
    const data = await response.json();
    // Guardamos el token para tests de samples

    testUtils.log(data);

    localStorage.setItem('test_token', data.token);
}


// Test: Subida - Límite de Peso (HTTP 413 Payload Too Large)

testUtils.createTestButton("Test Subida - Archivo Sobre el Limite de Peso", async (btn) => {

    await okLogin();
    const token = localStorage.getItem('test_token');

    const formData = new FormData();
    formData.append('display_name', 'Test Loop Pedagogico');
    formData.append('category', 'Drums');
    formData.append('bpm', '120');

    // Crear un blob que supere el límite (11 MB > límite de 10 MB)
    const oversizedContent = new Uint8Array(11 * 1024 * 1024); // 11 MB
    const blob = new Blob([oversizedContent], { type: 'audio/wav' });
    formData.append('audioFile', blob, 'DRUM_LOOP_GIGANTE.wav');

    const response = await fetch('/api/samples/upload', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
    });

    const data = await response.json();
    testUtils.log(data);

    // Este test espera un 413, no un 200
    if (response.status === 413) testUtils.setSuccess(btn);

});

testUtils.createTestButton("Test Subida - Archivo Bajo el Limite de Peso", async (btn) => {

    await okLogin();
    const token = localStorage.getItem('test_token');

    const formData = new FormData();
    formData.append('display_name', 'Test Loop Pedagogico');
    formData.append('category', 'Drums');
    formData.append('bpm', '120');

    // Crear un blob que esté dentro del límite (9 MB < límite de 10 MB)
    const normalContent = new Uint8Array(9 * 1024 * 1024); // 9 MB
    const blob = new Blob([normalContent], { type: 'audio/wav' });
    formData.append('audioFile', blob, 'DRUM_LOOP_NORMAL.wav');

    const response = await fetch('/api/samples/upload', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
    });

    const data = await response.json();
    testUtils.log(data);

    // Este test espera un 200, no un 413
    if (response.status === 200) testUtils.setSuccess(btn);

});