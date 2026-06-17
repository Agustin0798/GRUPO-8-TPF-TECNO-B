/**
 * Función para asegurar independencia de los tests de samples 
 * y no depender de otro test para tener un token de sesión válido
 */
 async function okLogin()
 {
    // 1. Login como productor (pepe) para obtener un token válido
     const response = await fetch('/api/auth/login', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ username: 'pepe', password: '12345' }) // Usamos pepe hardcodeado
     });
     const data = await response.json();
     // Guardamos el token para tests de samples
     localStorage.setItem('test_token', data.token);
 }



/**
 * Test: GET /api/samples/my-samples
 */
 testUtils.createTestButton("Test Listar Mis Samples", async (btn) => {
    // 1. Asegurar y guardar una sesión válida
    await okLogin();
    const token = localStorage.getItem('test_token');
    
    // 2. Realizar la petición
    const response = await fetch('/api/samples/my-samples', {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const data = await response.json();
    testUtils.log(data);
    if (response.ok) testUtils.setSuccess(btn);
});

/**
 * Test: POST /api/samples/upload (Simulado)
 */
testUtils.createTestButton("Test Subir Sample (Simulado)", async (btn) => {
    // 1. Asegurar y guardar una sesión válida
    await okLogin();
    const token = localStorage.getItem('test_token');
    
    // Creamos un FormData
    const formData = new FormData();
    formData.append('display_name', 'Test Loop Pedagogico');
    formData.append('category', 'Drums');
    formData.append('bpm', '120');

    // Simulamos un archivo WAV (binario vacío para la prueba)
    const blob = new Blob(["Simulated Audio Content"], { type: 'audio/wav' });
    formData.append('audioFile', blob, 'DRUM_LOOP_01.wav');

    const response = await fetch('/api/samples/upload', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
    });

    const data = await response.json();
    testUtils.log(data);
    if (response.ok) testUtils.setSuccess(btn);
});

/**
 * Test de Seguridad: POST /api/samples/my-samples (Token Corrupto)
 */
testUtils.createTestButton("Test Seguridad: Token Corrupto (Error 401)", async (btn) => {
    // 1. Obtener sesión válida usando la función ya existente en este archivo
    await okLogin();
    
    // 2. Buscar el token y romperlo
    const tokenKey = localStorage.getItem('test_token') ? 'test_token' : 
                     localStorage.getItem('jwt_token') ? 'jwt_token' : 'token';
    const tokenValido = localStorage.getItem(tokenKey);
    const tokenRoto = tokenValido.slice(0, -1);

    // 3. Enviar la petición al endpoint protegido con el token roto
    const response = await fetch('/api/samples/my-samples', {
        method:  'GET',
        headers: { 'Authorization': `Bearer ${tokenRoto}` }
    });

    const data = await response.json();
    testUtils.log(data);

    // 4. Verificar que el servidor nos rechazó correctamente
    if (response.status === 401 && data.message === "Sesión inválida o corrompida. Vuelva a iniciar sesión") {
        testUtils.setSuccess(btn); // Botón Verde
    } else {
        testUtils.log({ 
            error: "El test falló: El backend no devolvió el 401 esperado", 
            statusRecibido: response.status, 
            mensajeRecibido: data.message 
        }, true);
        btn.className = "w3-button w3-block w3-section w3-round w3-red"; // Botón Rojo
    }
});