const inputCodi = document.getElementById("codi");
const botoEntrar = document.getElementById("entrarButton");

document.getElementById("valoracionsButton").onclick = async ()=>{
    mostrarPantalla("gestioValoracions");
    await loadGestValoracions();
};

document.getElementById("aplicarJugadorsButton").addEventListener("click", ()=>{
    document.getElementById("zonaJugadorsSessio").style.display="flex";
});

document.getElementById("tornarValoracionsButton").onclick = () => {
    mostrarPantalla("gestioValoracions");
};

document.getElementById("tornarLesionsButton").onclick = () => {
    mostrarPantalla("lesions");
};

document.getElementById("tornarQuestionarisButton").addEventListener("click", () => {
    mostrarPantalla("gestioQuestionaris");
});

document.getElementById("tornarModificarTeamsButton").addEventListener("click", () => {
    mostrarPantalla("teams");
});

document.getElementById("tornarGestioButton").addEventListener("click", () => {
    mostrarPantalla("management");
});

document.getElementById("tornarEliminarTeamsButton").addEventListener("click", () => {
    mostrarPantalla("teams");
});

document.getElementById("fisioButton").addEventListener("click", ()=>{
    mostrarPantalla("fisio");
});

document.getElementById("novaPreguntaButton").onclick = () => {
    obrirNovaPregunta();
};

document.getElementById("questionarisButton").addEventListener("click", async ()=>{
    mostrarPantalla("gestioQuestionaris");
    await loadGestQuestionaris();
});

document.getElementById("enrereLesions").addEventListener("click", ()=>{
    mostrarPantalla("teams");
});

const botoSortir = document.getElementById("botoSortir");
botoSortir.addEventListener("click", sortir);

const sortirButtonRPE = document.getElementById("sortirButtonRPE");
sortirButtonRPE.addEventListener("click", sortir);

botoEntrar.addEventListener("click", entrar);

document.getElementById("enrereDades").addEventListener("click", ()=>{
    mostrarPantalla("management");
});

window.addEventListener("load", iniciarAplicacio);

const botoConfirmar = document.getElementById("confirmarRPEButton");

botoConfirmar.addEventListener("click", async () => {
    const code = obtenirCodeLocal();
    const user = await fetchUserByCode(code);
    if (!user) return;
    await confirmarRPE(user);
});

document.getElementById("confirmarQuestionariButton").addEventListener("click", async () => {
    await confirmarQuestionari();
});

document.getElementById("equipsButton").addEventListener("click", async () => {
    mostrarPantalla("teams");
    await loadTeams();
});

document.getElementById("dadesButton").addEventListener("click", obrirDades);

document.getElementById("passarValoracioButton").addEventListener("click", async()=>{
    await obrirSelectorValoracions();
});

document.getElementById("nouEquipButton").addEventListener("click", crearEquip);


async function iniciarAplicacio() {
    const code = obtenirCodeLocal();
    if (!code) return;
    inputCodi.value = code;

    const user = await fetchUserByCode(code);

    if (!user) {
        eliminarUsuariLocal();
        alert("La informació d'aquest usuari ha canviat o ha estat eliminat.");
        return;
    }

    await decideRoute(user);
}


async function entrar() {

    const codi = inputCodi.value.trim();

    if (codi === "") {
        alert("S'ha d'escriure un codi d'accés");
        return;
    }

    botoEntrar.disabled = true;
    botoEntrar.textContent = "CARREGANT...";

    const user = await fetchUserByCode(codi);

    botoEntrar.disabled = false;
    botoEntrar.textContent = "ENTRAR";

    if (!user) {
        alert("Aquest codi no està a la base de dades.");
        return;
    }

    guardarUsuariLocal(user);
    await decideRoute(user);
}


async function decideRoute(user) {

    if (user.role !== "JUGADOR") {
        mostrarPantalla("management");
        return;
    }

    const questionaris = await getQuestionarisPerContestar(user.uuid);

    if (questionaris.length === 0) {
        mostrarPantalla("rpe");
        await loadRPE(user);
        await acabarLoadRPE(user);
    } else {
        mostrarPantalla("questionaris");
        await loadQuestionarisPendents(user, questionaris);
    }
}


function mostrarPantalla(pantalla) {
    document.getElementById("pantallaLogin").style.display = "none";
    document.getElementById("pantallaRPE").style.display = "none";
    document.getElementById("pantallaQuestionaris").style.display = "none";
    document.getElementById("pantallaManagement").style.display = "none";
    document.getElementById("pantallaTeams").style.display = "none";
    document.getElementById("pantallaSessions").style.display = "none";
    document.getElementById("pantallaModifySessions").style.display = "none";
    document.getElementById("pantallaDeleteSessions").style.display = "none";
    document.getElementById("pantallaDades").style.display = "none";
    document.getElementById("pantallaSeleccionValoracio").style.display = "none";
    document.getElementById("pantallaPassarValoracio").style.display = "none";
    document.getElementById("pantallaFisio").style.display = "none";
    document.getElementById("pantallaLesions").style.display = "none";
    document.getElementById("pantallaAssignarHora").style.display="none";
    document.getElementById("pantallaVisites").style.display="none";
    document.getElementById("pantallaInfoVisita").style.display="none";
    document.getElementById("pantallaAfegirLesio").style.display="none";
    document.getElementById("pantallaGestioQuestionaris").style.display="none";
    document.getElementById("pantallaEnviarQuestionari").style.display="none";
    document.getElementById("questions").style.display = "none";
    document.getElementById("addQuestion").style.display = "none";
    document.getElementById("pantallaGestioValoracions").style.display="none";
    document.getElementById("pantallaValoracioItems").style.display="none";
    document.getElementById("pantallaAddValoracioItem").style.display="none";

    if (pantalla === "login") document.getElementById("pantallaLogin").style.display = "flex";
    if (pantalla === "rpe") document.getElementById("pantallaRPE").style.display = "flex";
    if (pantalla === "questionaris") document.getElementById("pantallaQuestionaris").style.display = "flex";
    if (pantalla === "management") document.getElementById("pantallaManagement").style.display = "flex";
    if (pantalla === "teams") document.getElementById("pantallaTeams").style.display = "flex";
    if (pantalla === "sessions") document.getElementById("pantallaSessions").style.display = "flex";
    if (pantalla === "modifySessions") document.getElementById("pantallaModifySessions").style.display = "flex";
    if (pantalla === "deleteSessions") document.getElementById("pantallaDeleteSessions").style.display = "flex";
    if (pantalla === "dades") document.getElementById("pantallaDades").style.display = "flex";
    if (pantalla === "seleccionValoracio") document.getElementById("pantallaSeleccionValoracio").style.display = "flex";
    if (pantalla === "passValoracio") document.getElementById("pantallaPassarValoracio").style.display = "flex";
    if (pantalla === "fisio") document.getElementById("pantallaFisio").style.display="flex";
    if (pantalla === "lesions") document.getElementById("pantallaLesions").style.display="flex";
    if(pantalla==="assignarHora") document.getElementById("pantallaAssignarHora").style.display="flex";
    if(pantalla==="visites") document.getElementById("pantallaVisites").style.display="flex";
    if(pantalla==="infoVisita") document.getElementById("pantallaInfoVisita").style.display="flex";
    if(pantalla==="afegirLesio") document.getElementById("pantallaAfegirLesio").style.display="flex";
    if(pantalla==="gestioQuestionaris") document.getElementById("pantallaGestioQuestionaris").style.display="flex";
    if(pantalla==="enviarQuestionari") document.getElementById("pantallaEnviarQuestionari").style.display="flex";
    if (pantalla === "questions") document.getElementById("questions").style.display = "flex";
    if (pantalla === "addQuestion") document.getElementById("addQuestion").style.display = "flex";
    if(pantalla==="gestioValoracions") document.getElementById("pantallaGestioValoracions").style.display="flex";
    if(pantalla==="valoracioItems") document.getElementById("pantallaValoracioItems").style.display="flex";
    if(pantalla==="addValoracioItem") document.getElementById("pantallaAddValoracioItem").style.display="flex";
}


function sortir() {
    eliminarUsuariLocal();
    inputCodi.value = "";
    mostrarPantalla("login");
}
