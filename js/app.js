const inputCodi = document.getElementById("codi");
const botoEntrar = document.getElementById("entrarButton");

let estatUltimaSessioJugadors = [];

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

const sortirButtonRPETeam = document.getElementById("sortirButtonRpeTeam");
sortirButtonRPETeam.addEventListener("click", sortir);

botoEntrar.addEventListener("click", entrar);

document.getElementById("enrereDades").addEventListener("click", ()=>{
    mostrarPantalla("management");
});

document.getElementById("tornarDadesValoracioButton").addEventListener("click", ()=>{
    mostrarPantalla("teams");
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

document.getElementById("pantallaEnviarQuestionarisJugador").addEventListener("click", async () => {
    mostrarPantalla("teams");
});

document.getElementById("pantallaEnviarValoracionsJugador").addEventListener("click", async () => {
    mostrarPantalla("teams");
});

document.getElementById("dadesButton").addEventListener("click", obrirDades);

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

    if (user.role === "JUGADOR") {

        venimDeRpeTeam = false;

        const questionaris =
            await getQuestionarisPerContestar(
                user.uuid
            );

        if (questionaris.length === 0) {

            mostrarPantalla("rpe");

            await loadRPE(user);
            await acabarLoadRPE(user);

        } else {

            mostrarPantalla("questionaris");

            await loadQuestionarisPendents(
                user,
                questionaris
            );
        }

        return;
    }


    if (user.role === "TEAM") {

        venimDeRpeTeam = false;

        mostrarPantalla("rpeTeam");

        await loadRPETeam(user);

        return;
    }


    // =================================================
    // TOTS ELS NO JUGADORS
    // =================================================

    mostrarPantalla("estatRPE");

    await loadEstatRPE(user);
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
    document.getElementById("pantallaEnviarQuestionarisJugador").style.display="none";
    document.getElementById("pantallaRpeTeam").style.display = "none";
    document.getElementById("pantallaEnviarValoracionsJugador").style.display="none";
    document.getElementById("pantallaEstatRPE").style.display = "none";

    if (pantalla === "login") document.getElementById("pantallaLogin").style.display = "flex";
    if (pantalla === "questionariJugadors") document.getElementById("pantallaEnviarQuestionarisJugador").style.display = "flex";
    if (pantalla === "valoracioJugadors") document.getElementById("pantallaEnviarValoracionsJugador").style.display = "flex";
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
    if (pantalla === "rpeTeam") document.getElementById("pantallaRpeTeam").style.display = "flex";
    if (pantalla === "estatRPE") document.getElementById("pantallaEstatRPE").style.display = "flex";
}


function sortir() {
    eliminarUsuariLocal();
    inputCodi.value = "";
    mostrarPantalla("login");
}


let estatRPEJugadors = [];
let estatRPEActual = null;


// =====================================================
// CARREGAR ESTAT RPE
// =====================================================

async function loadEstatRPE(user) {

    estatRPEJugadors = [];
    estatRPEActual = user;

    // =====================================================
    // 1. OBTENIR JUGADORS I EQUIPS
    // =====================================================

    let jugadors = [];
    let jugadorsTeams = new Map();


    // =====================================================
    // SUPERADMIN
    // =====================================================

    if (user.role === "SUPERADMIN") {

        const totsUsuaris = await getAllUsers();

        jugadors = totsUsuaris.filter(
            u => u.role === "JUGADOR"
        );


        const resultatsTeams = await Promise.all(
            jugadors.map(async jugador => {

                const userTeamsJugador =
                    await getUserTeamByUserUuid(
                        jugador.uuid
                    );

                return {
                    uuid: jugador.uuid,
                    teams: userTeamsJugador
                };
            })
        );


        for (const resultat of resultatsTeams) {

            jugadorsTeams.set(
                resultat.uuid,
                resultat.teams
            );
        }
    }


    // =====================================================
    // NO SUPERADMIN
    // =====================================================

    else {

        const meusUserTeams =
            await getUserTeamByUserUuid(
                user.uuid
            );


        const meusTeamUuids = [
            ...new Set(
                meusUserTeams.map(
                    ut => ut.team_uuid
                )
            )
        ];


        const jugadorsMap = new Map();


        for (const teamUuid of meusTeamUuids) {

            const userTeamsEquip =
                await getPlayersByTeam(
                    teamUuid
                );


            for (const ut of userTeamsEquip) {

                const jugadorUuid =
                    ut.user_uuid;


                if (!jugadorsMap.has(jugadorUuid)) {

                    jugadorsMap.set(
                        jugadorUuid,
                        []
                    );
                }


                jugadorsMap
                    .get(jugadorUuid)
                    .push(ut);
            }
        }


        const jugadorUuids =
            Array.from(
                jugadorsMap.keys()
            );


        if (jugadorUuids.length > 0) {

            const users =
                await getUsersByUserTeam(
                    jugadorUuids
                );


            jugadors =
                Array.from(
                    new Map(
                        users
                            .filter(
                                u =>
                                    u.role === "JUGADOR"
                            )
                            .map(
                                u => [
                                    u.uuid,
                                    u
                                ]
                            )
                    ).values()
                );


            for (const jugador of jugadors) {

                jugadorsTeams.set(
                    jugador.uuid,
                    jugadorsMap.get(
                        jugador.uuid
                    ) || []
                );
            }
        }
    }


    // =====================================================
    // 2. OBTENIR TOTS ELS RPE
    // =====================================================

    const jugadorUuids =
        jugadors.map(
            j => j.uuid
        );


    let rpes = [];


    if (jugadorUuids.length > 0) {

        rpes =
            await getRPEByUsers(
                jugadorUuids
            );
    }


    // =====================================================
    // 3. CARREGAR PRÀCTIQUES UNA SOLA VEGADA PER EQUIP
    // =====================================================

    const practicesPerTeam = new Map();


    const totsElsTeamUuids = [
        ...new Set(
            Array.from(
                jugadorsTeams.values()
            )
                .flat()
                .map(
                    ut => ut.team_uuid
                )
        )
    ];


    const resultatsPractices =
        await Promise.all(

            totsElsTeamUuids.map(
                async teamUuid => {

                    const practices =
                        await getPracticesByTeam(
                            teamUuid
                        );


                    return {
                        teamUuid,
                        practices
                    };
                }
            )
        );


    for (const resultat of resultatsPractices) {

        practicesPerTeam.set(
            resultat.teamUuid,
            resultat.practices
        );
    }


    // =====================================================
    // 4. BUSCAR ÚLTIMA SESSIÓ DE CADA JUGADOR
    // =====================================================

    for (const jugador of jugadors) {

        const userTeamsJugador =
            jugadorsTeams.get(
                jugador.uuid
            ) || [];


        const teamUuids = [
            ...new Set(
                userTeamsJugador.map(
                    ut => ut.team_uuid
                )
            )
        ];


        let practicesJugador = [];


        // =================================================
        // SESSIONS DELS SEUS EQUIPS
        // =================================================

        for (const teamUuid of teamUuids) {

            const practices =
                practicesPerTeam.get(
                    teamUuid
                ) || [];


            for (const practice of practices) {

                if (
                    !practice.practice_date ||
                    practice.practice_date === "-"
                ) {
                    continue;
                }


                const parts =
                    practice.practice_date.split("-");


                if (parts.length !== 3) {
                    continue;
                }


                const data =
                    new Date(
                        Number(parts[2]),
                        Number(parts[1]) - 1,
                        Number(parts[0])
                    );


                data.setHours(
                    0,
                    0,
                    0,
                    0
                );


                const avui =
                    new Date();


                avui.setHours(
                    0,
                    0,
                    0,
                    0
                );


                // Només sessions ja realitzades
                if (data <= avui) {

                    practicesJugador.push(
                        practice
                    );
                }
            }
        }


        // =================================================
        // SI NO TÉ CAP SESSIÓ
        // =================================================

        if (
            practicesJugador.length === 0
        ) {

            continue;
        }


        // =================================================
        // ELIMINAR DUPLICATS
        // =================================================

        const practicesUnics =
            Array.from(
                new Map(
                    practicesJugador.map(
                        p => [
                            p.uuid ||
                            p.practice_uuid ||
                            p.practice_date,
                            p
                        ]
                    )
                ).values()
            );


        // =================================================
        // ORDENAR MÉS RECENT -> MÉS ANTIGA
        // =================================================

        practicesUnics.sort(
            (a, b) =>
                sortKey(
                    b.practice_date
                ).localeCompare(
                    sortKey(
                        a.practice_date
                    )
                )
        );


        // =================================================
        // ÚLTIMA SESSIÓ
        // =================================================

        const ultimaSessio =
            practicesUnics[0];


        const dataUltimaSessio =
            ultimaSessio.practice_date;



        // =================================================
        // BUSCAR RPE D'AQUELLA DATA
        // =================================================

        const rpe =
            rpes.find(

                r =>
                    r.player_uuid ===
                    jugador.uuid &&

                    r.date_practice ===
                    dataUltimaSessio
            );



        // =================================================
        // COMPROVAR MOLÈSTIES
        // =================================================

        const teMolesties =
            rpe &&
            (
                rpe.te_molesties === true ||
                rpe.te_molesties === "true" ||
                rpe.te_molesties === 1 ||
                rpe.te_molesties === "1"
            );


        // =================================================
        // GUARDAR RESULTAT
        // =================================================

        estatRPEJugadors.push({

            jugador: jugador,

            dataUltimaSessio:
                dataUltimaSessio,

            rpe:
                rpe || null,

            teMolesties:
                !!teMolesties
        });
    }


    // =====================================================
    // 5. ORDENAR JUGADORS PER NOM
    // =====================================================

    estatRPEJugadors.sort(
        (a, b) => {

            const nomA =
                `${a.jugador.player_first_name} ${a.jugador.player_last_name}`;


            const nomB =
                `${b.jugador.player_first_name} ${b.jugador.player_last_name}`;


            return nomA.localeCompare(
                nomB
            );
        }
    );


    // =====================================================
    // 6. PINTAR
    // =====================================================

    pintarEstatRPE();
}



// =====================================================
// PINTAR ESTAT RPE
// =====================================================

function pintarEstatRPE() {

    const contenidor =
        document.getElementById("llistaEstatRPE");

    contenidor.innerHTML = "";

    for (const registre of estatRPEJugadors) {

        const jugador = registre.jugador;
        const rpe = registre.rpe;

        // =================================================
        // FILA
        // =================================================

        const fila = document.createElement("div");
        fila.className = "filaJugadorEstatRPE";


        // =================================================
        // NOM
        // =================================================

        const nom = document.createElement("div");
        nom.className = "nomJugadorEstatRPE";

        nom.textContent =
            `${capitalize(jugador.name)} ${capitalize(jugador.surname)}`.trim();


        // =================================================
        // INFORMACIÓ
        // =================================================

        const info = document.createElement("div");
        info.className = "infoJugadorEstatRPE";


        // =================================================
        // DATA
        // =================================================

        const data = document.createElement("div");
        data.className = "dataJugadorEstatRPE";

        data.textContent =
            registre.dataUltimaSessio || "-";


        // =================================================
// RPE
// =================================================

const rpeInfo = document.createElement("div");
rpeInfo.className = "rpeJugadorEstatRPE";

const bola = document.createElement("span");
bola.className = "bolaRPE";

const textRPE = document.createElement("span");
textRPE.className = "textRPE";

if (!registre.dataUltimaSessio) {

    // No mostrar cap rodona ni text

} else if (rpe) {

    bola.classList.add("bolaRPEVerd");
    bola.title = "RPE registrat";

    textRPE.textContent = "RPE registrat";

} else {

    bola.classList.add("bolaRPETvermella");
    bola.title = "RPE pendent";

    textRPE.textContent = "RPE pendent";
}

if (registre.dataUltimaSessio) {
    rpeInfo.appendChild(bola);
    rpeInfo.appendChild(textRPE);
}


        // =================================================
        // MOLÈSTIES
        // =================================================

        const molesties = document.createElement("div");
        molesties.className = "molestiesJugadorEstatRPE";


        if (
            registre.teMolesties &&
            rpe &&
            rpe.molesties
        ) {

            molesties.textContent =
                rpe.molesties;


            // =============================================
            // RELLOTGE
            // =============================================

            const botoFisio =
                document.createElement("button");

            botoFisio.className =
                "botoDemanarFisio";

            botoFisio.type = "button";

            botoFisio.title =
                "Demanar hora de fisioteràpia";

            botoFisio.innerHTML = "🕐";

            botoFisio.addEventListener(
                "click",
                () => {
                    demanarFisioDesDeRPE(
                        jugador,
                        rpe,
                        botoFisio
                    );
                }
            );

            molesties.appendChild(
                botoFisio
            );

        } else {

            molesties.textContent =
                "Sense molèsties";
        }


        // =================================================
        // AFEGIR
        // =================================================

        info.appendChild(data);
        info.appendChild(rpeInfo);
        info.appendChild(molesties);

        fila.appendChild(nom);
        fila.appendChild(info);

        contenidor.appendChild(fila);
    }
}



// =====================================================
// ACCÉS A MANAGEMENT
// =====================================================

document
    .getElementById(
        "accedirAppEstatRPE"
    )
    .addEventListener(
        "click",
        async () => {

            const code =
                obtenirCodeLocal();


            const user =
                await fetchUserByCode(
                    code
                );


            if (!user) {

                sortir();

                return;
            }


            mostrarPantalla(
                "management"
            );
        }
    );

