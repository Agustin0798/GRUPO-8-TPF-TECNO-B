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

    // Cabecera mínima de WAV: empieza con RIFF (magic bytes válidos)
    // El servidor valida solo los primeros bytes, no que sea un WAV completo
    const wavHeader = new Uint8Array([
        0x52, 0x49, 0x46, 0x46,  // "RIFF"
        0x00, 0x00, 0x00, 0x00,  // tamaño (0, no importa para el test)
        0x57, 0x41, 0x56, 0x45   // "WAVE"
    ]);
    const blob = new Blob([wavHeader], { type: 'audio/wav' });
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
 * Test 4: Inconsistencia de Tipo MIME (HTTP 415 Unsupported Media Type)
 *
 * Se sube un archivo con extensión .wav y MIME type audio/wav,
 * pero cuyo contenido real es texto plano (no tiene magic bytes de audio).
 * El servidor debe rechazarlo con status 415 y el mensaje:
 * "El archivo no es un audio válido".
 *
 * La validación ocurre en el backend leyendo los primeros bytes del archivo
 * (magic bytes), lo que impide que archivos disfrazados pasen la verificación.
 */
testUtils.createTestButton("Test MIME Inconsistente (.wav falso → 415)", async (btn) => {
    // 1. Obtener sesión válida
    await okLogin();
    const token = localStorage.getItem('test_token');

    // 2. Crear un archivo "trampa": extensión .wav, MIME audio/wav,
    const contenidoTexto = "Este es un archivo de texto, no un audio. No tiene magic bytes de WAV.";
    const archivoFalso   = new Blob([contenidoTexto], { type: 'audio/wav' });

    const formData = new FormData();
    formData.append('display_name', 'Test MIME Inconsistente');
    formData.append('category',     'Test');
    formData.append('bpm',          '0');
    formData.append('audioFile',    archivoFalso, 'sample_trampa.wav');

    // 3. Enviar la petición al endpoint de upload
    const response = await fetch('/api/samples/upload', {
        method:  'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body:    formData
    });

    const data = await response.json();
    testUtils.log(data);

    // 4. Verificar que el servidor rechazó con 415
    if (response.status === 415 && data.message === "El archivo no es un audio válido") {
        // Test pasado
        testUtils.setSuccess(btn);
    } else {
        // Test fallido: el servidor no rechazó correctamente
        testUtils.log({ 
            error: "El test falló", 
            statusRecibido: response.status, 
            mensajeRecibido: data.message 
        }, true);
        btn.className = "w3-button w3-block w3-section w3-round w3-red";
    }
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