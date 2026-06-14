/**
 * Test: POST /api/auth/login
 */
 testUtils.createTestButton("Test Login Correcto (Pepe y 12345)", async (btn) => {
    const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: 'pepe', password: '12345' }) // Usamos pepe hardcodeado
    });
    
    const data = await response.json();
    testUtils.log(data);

    if (response.ok) {
        testUtils.setSuccess(btn);
    }
});

testUtils.createTestButton("Test Login - Password Incorrecto (Pepe y 123)", async (btn) => {
    const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: 'pepe', password: '123' }) // Usamos pepe hardcodeado
    });
    
    const data = await response.json();
    testUtils.log(data);

    if (response.status === 401) {
        testUtils.setSuccess(btn);
    }
});

testUtils.createTestButton("Test Login - Usuario Incorrecto (Juan y 12345)", async (btn) => {
    const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: 'pepe', password: '123' }) // Usamos pepe hardcodeado
    });
    
    const data = await response.json();
    testUtils.log(data);

    if (response.status === 401) {
        testUtils.setSuccess(btn);
    }
});

//Test de Registro
//Registro Exitoso
//Contraseña valida y longitud mayor a 6
testUtils.createTestButton("Test Registro Exitoso(Usuario dinamico y abc8888)", async (btn) => {
    const user=`user_${Date.now()}`;
    //Nuevo usuario 
    //await fetch hace peticion con método POST hacia ruta de registros y guarda la 
    //informacion de respuesta del servidor (estadoHTTP, cabecera) en response
    const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }, //indica que esta en formato JSON
        body: JSON.stringify({ username: user, password: 'abc8888' }) //Body e informacion de la peticion, convierte objeto a texto en formato JSON
    });
    const data = await response.json();//transforma el body en formato JSON a objeto y se gaurda en data
    testUtils.log(data);
    if (response.status === 201) { //Si el estado es 201 Created, el registro fue exitoso
        testUtils.setSuccess(btn); //Marca boton verde si es exitoso
    } else {
        throw new Error(`Se lanzo error ${response.status} cuando se esperaba codigo 201`);
    }
});

//Contraseña con longitud igual a 6
testUtils.createTestButton("Test Registro Exitoso-Lgtud contarseña = 6(Usuario dinamico y abc888)", async (btn) => {
    const user=`user_${Date.now()}`;
    //Nuevo usuario 
    //await fetch hace peticion con método POST hacia ruta de registros y guarda la 
    //informacion de respuesta del servidor (estadoHTTP, cabecera) en response
    const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }, //indica que esta en formato JSON
        body: JSON.stringify({ username: user, password: 'abc888' }) //Body e informacion de la peticion, convierte objeto a texto en formato JSON
    });
    const data = await response.json();//transforma el body en formato JSON a objeto y se gaurda en data
    testUtils.log(data);
    if (response.status === 201) { //Si el estado es 201 Created, el registro fue exitoso
        testUtils.setSuccess(btn); //Marca boton verde si es exitoso
    } else {
        throw new Error(`Se lanzo error ${response.status} cuando se esperaba codigo 201`);
    }
});

//Registro fallido
//Usuario ya registrado
testUtils.createTestButton("Test Registro Fallido- Usuario ya Existente(pepe y 123456)", async (btn) => {
    const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }, //indica que esta en formato JSON
        body: JSON.stringify({ username: 'pepe', password: '123456' }) //Body e informacion de la peticion, convierte objeto a texto en formato JSON
    });
    const data = await response.json();//transforma el body en formato JSON a objeto y se gaurda en data
    testUtils.log(data);
    if (response.status === 409) { //Si el estado es 409 registro duplicado, el registro fue fallido
        testUtils.setSuccess(btn); //Marca boton verde si es exitoso
    } else {
        throw new Error(`Se lanzo error ${response.status} cuando se esperaba codigo 409`); //El test fallo
    }
});

//Contraseña menor a 6
testUtils.createTestButton("Test Registro Fallido- Contraseña Corta(Usuario dinamico y 12)", async (btn) => {
    const user=`user_${Date.now()}`;
    const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }, //indica que esta en formato JSON
        body: JSON.stringify({ username: user, password: '12' }) //Body e informacion de la peticion, convierte objeto a texto en formato JSON
    });
    const data = await response.json();//transforma el body en formato JSON a objeto y se gaurda en data
    testUtils.log(data);
    if (response.status === 400) { //Si el estado es 400 por Bad Request, registro fallido
        testUtils.setSuccess(btn); //test exitoso
    } else {
        throw new Error(`Se lanzo error ${response.status} cuando se esperaba codigo 400`); //error en el test, no debería aparecer
    }
});

//Contraseña vacia
testUtils.createTestButton("Test Registro Fallido- Contraseña vacia(Usuario dinamico )", async (btn) => {
    const user=`user_${Date.now()}`;
    const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }, //indica que esta en formato JSON
        body: JSON.stringify({ username: user, password:''}) //Body e informacion de la peticion, convierte objeto a texto en formato JSON
    });
    const data = await response.json();//transforma el body en formato JSON a objeto y se gaurda en data
    testUtils.log(data);
    if (response.status === 400) { //Si el estado es 400 por Bad Request, registro fallido
        testUtils.setSuccess(btn); //test exitoso
    } else {
        throw new Error(`Se lanzo error ${response.status} cuando se esperaba codigo 400`); //error en el test, no debería aparecer
    }
});