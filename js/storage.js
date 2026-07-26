function guardarUsuariLocal(user) {

    localStorage.setItem("code", user.code);
    localStorage.setItem("role", user.role);
    localStorage.setItem("userUuid", user.uuid);

}

function eliminarUsuariLocal() {

    localStorage.removeItem("code");
    localStorage.removeItem("role");
    localStorage.removeItem("userUuid");

}

function obtenirCodeLocal() {

    return localStorage.getItem("code");

}

function obtenirRoleLocal() {

    return localStorage.getItem("role");

}

function obtenirUserUuidLocal() {

    return localStorage.getItem("userUuid");

}