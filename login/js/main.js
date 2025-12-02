function buscarPorEmailOCel(entrada) {
    for (let i = 0; i < localStorage.length; i++) {
        let key = localStorage.key(i);
        let data = localStorage.getItem(key);

        try {
            let userData = JSON.parse(data);

            if (userData.email === entrada || userData.cel === entrada) {
                return { usuario: key, datos: userData };
            }

        } catch(e) {}
    }
    return null;
}

// Inicializar contador global si no existe
if (!localStorage.getItem("intentos")) {
    localStorage.setItem("intentos", "0");
}
if (!localStorage.getItem("bloqueadoHasta")) {
    localStorage.setItem("bloqueadoHasta", "0");
}


// Registrar usuario
function registrar() {
    let u = document.getElementById("regUser").value;
    let email = document.getElementById("regEmail").value;
    let cel = document.getElementById("regCel").value;
    let p = document.getElementById("regPass").value;
    let p2 = document.getElementById("regPass2").value;
    let msg = document.getElementById("msgReg");

    const regexCorreo = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const regexNombre = /^[A-Za-zÁÉÍÓÚÑáéíóúñ ]+$/;
    const regexPass = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{6,}$/;
    const regexCel = /^[0-9]{7,12}$/

    if (!u || !email || !cel || !p || !p2)
        return msg.innerText = "Completa todos los campos";

    if (!regexCorreo.test(email))
        return msg.innerText = "Correo inválido";

    if (!regexCel.test(cel))
        return msg.innerText = "Celular inválido (7 a 10 digitos)";

    if (!regexCorreo.test(u) && !regexNombre.test(u))
        return msg.innerText = "Usuario debe ser nombre o correo válido";

    if (!regexPass.test(p))
        return msg.innerText = "Contraseña insegura";

    if (p !== p2)
        return msg.innerText = "Las contraseñas no coinciden";

    // Guardar datos
    let userData = { pass: p, email: email, cel: cel };
    localStorage.setItem(u, JSON.stringify(userData));

    msg.innerText = "Registro exitoso";
}



function login() {
    let u = document.getElementById("loginUser").value;
    let p = document.getElementById("loginPass").value;
    let msg = document.getElementById("msgLogin");

    // Buscar por usuario directo
    let data = localStorage.getItem(u);

    // Buscar por correo o celular
    let extra = buscarPorEmailOCel(u);

    // Si no existe ni como usuario ni como correo/cel
    if (!data && !extra)
        return msg.innerText = "Usuario no existe";

    // Obtener datos reales
    let userData = data ? JSON.parse(data) : extra.datos;
    let usuarioReal = data ? u : extra.usuario;

    // --- SISTEMA DE BLOQUEO ---
    let intentos = parseInt(localStorage.getItem("intentos"));
    let bloqueadoHasta = parseInt(localStorage.getItem("bloqueadoHasta"));
    let ahora = Date.now();

    if (ahora < bloqueadoHasta) {
        msg.innerText =
            "Demasiados intentos. Intenta en " +
            Math.ceil((bloqueadoHasta - ahora) / 1000) +
            " segundos.";
        return;
    }

    if (intentos >= 3 && ahora >= bloqueadoHasta) {
        localStorage.setItem("intentos", "0");
        intentos = 0;
    }

    // --- VALIDAR CONTRASEÑA ---
    if (userData.pass !== p) {
        intentos++;
        localStorage.setItem("intentos", intentos);

        if (intentos >= 3) {
            localStorage.setItem("bloqueadoHasta", ahora + 30000);
            return msg.innerText = "Fallaste 3 veces. Bloqueado 30s.";
        }

        return msg.innerText = `Contraseña incorrecta (${intentos}/3)`;
    }

    // SI TODO BIEN: resetear
    localStorage.setItem("intentos", "0");

    // Mostrar nombre de usuario correcto
    msg.innerText = "Bienvenido " + usuarioReal;
}



// Recuperar contraseña
function recuperar() {
    let u = document.getElementById("recUser").value;
    let msg = document.getElementById("msgRec");

    let data = localStorage.getItem(u);
    let extra = buscarPorEmailOCel(u);

    if (!data && !extra) return msg.innerText = "Usuario no encontrado";

    let userData = data ? JSON.parse(data) : extra.datos;


    msg.innerText = "Tu contraseña es: " + userData.pass;
}



// Ver contraseña
function toggle(id){
    let e = document.getElementById(id);
    e.type = (e.type === "password") ? "text" : "password";
}
