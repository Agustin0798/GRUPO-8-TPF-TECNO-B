// Test: Subida - Límite de Peso (HTTP 413 Payload Too Large) 


testUtils.createTestButton("Test Subida - Límite de Peso", async (btn) => {

    // 1. Asegurar y guardar una sesión válida    
    const token = localStorage.getItem('test_token');
    
    // 2. Realizar la petición
    const response = await fetch('/api/samples/my-samples', {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const data = await response.json();
    testUtils.log(data);
    if (response.ok) testUtils.setSuccess(btn);

});