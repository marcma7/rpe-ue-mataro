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

document.getElementById("enrereVeureRespostes").addEventListener("click", async ()=>{
    mostrarPantalla("gestioQuestionaris");
    await loadGestQuestionaris();
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
    await activarNotificacionsPush(user.uuid);
    await decideRoute(user);
}


async function decideRoute(user) {
    if (user.role === "TEAM") {
        venimDeRpeTeam = false;
        mostrarPantalla("rpeTeam");
        await loadRPETeam(user);
        return;
    }

    const questionaris = await getQuestionarisPerContestar(user.uuid);
    if (questionaris.length > 0) {
        mostrarPantalla("questionaris");
        await loadQuestionarisPendents(user, questionaris);
        return;
    }

    if (user.role === "JUGADOR") {
        venimDeRpeTeam = false;
        mostrarPantalla("rpe");
        await loadRPE(user);
        await acabarLoadRPE(user);
        return;
    }

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
    document.getElementById("pantallaRespostesQuestionari").style.display = "none";

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
    if (pantalla === "pantallaRespostesQuestionari") document.getElementById("pantallaRespostesQuestionari").style.display = "flex";
}


function sortir() {
    eliminarUsuariLocal();
    inputCodi.value = "";
    mostrarPantalla("login");
}


let estatRPEJugadors = [];
let estatRPEActual = null;


function abreujarEquip(nomEquip) {
    if (!nomEquip) return "";

    return nomEquip
        .trim()
        .split(/\s+/)
        .map(paraula => paraula.charAt(0).toUpperCase())
        .join("");
}


async function loadEstatRPE(user) {

    estatRPEJugadors = [];
    estatRPEActual = user;

    // 1. OBTENIR JUGADORS I EQUIPS
    let jugadors = [];
    let jugadorsTeams = new Map();

    if (user.role === "SUPERADMIN") {
        const [totsUsuaris, totsUserTeams] = await Promise.all([getAllUsers(), getAllUserTeams()]);
        jugadors = totsUsuaris.filter(u => u.role === "JUGADOR");

        for (const ut of totsUserTeams) {
            if (!jugadorsTeams.has(ut.user_uuid)) jugadorsTeams.set(ut.user_uuid, []);
            jugadorsTeams.get(ut.user_uuid).push(ut);
        }
    } else {
        const meusUserTeams = await getUserTeamByUserUuid(user.uuid);
        const meusTeamUuids = [...new Set(meusUserTeams.map(ut => ut.team_uuid))];

        const resultatsEquips = await Promise.all(meusTeamUuids.map(async teamUuid => {
                const userTeamsEquip = await getPlayersByTeam(teamUuid);
                return {teamUuid, userTeamsEquip};
            })
        );

        const jugadorsMap = new Map();
        for (const resultat of resultatsEquips) {
            for (const ut of resultat.userTeamsEquip) {
                const jugadorUuid = ut.user_uuid;
                if (!jugadorsMap.has(jugadorUuid)) jugadorsMap.set(jugadorUuid, []);
                jugadorsMap.get(jugadorUuid).push(ut);
            }
        }

        const jugadorUuids = Array.from(jugadorsMap.keys());

        if (jugadorUuids.length > 0) {
            const users = await getUsersByUserTeam(jugadorUuids);

            jugadors = Array.from(new Map(users.filter(u => u.role === "JUGADOR").map(u => [u.uuid, u])).values());

            for (const jugador of jugadors) {
                jugadorsTeams.set(jugador.uuid, jugadorsMap.get(jugador.uuid) || []);
            }
        }
    }

    // 1.1 OBTENIR NOMS DELS EQUIPS
    const totsElsEquips = await getAllTeams();
    const equipsMap = new Map(totsElsEquips.map(equip => [equip.uuid, equip.team_name]));

    // 2. UUID DELS JUGADORS
    const jugadorUuids = jugadors.map(j => j.uuid);

    // 3. RPE + FISIO EN PARAL·LEL
    let rpes = [];
    const promeses = [];

    if (jugadorUuids.length > 0) promeses.push(getRPEByUsers(jugadorUuids));
    else promeses.push(Promise.resolve([]));
    
    promeses.push(getAllVisits());
    const [rpesResultat, visitesFisio] = await Promise.all(promeses);
    rpes = rpesResultat || [];

    // 4. PREPARAR MAPES DE RPE
    const rpeMap = new Map();
    for (const rpe of rpes) {
        rpeMap.set(`${rpe.player_uuid}_${rpe.date_practice}`, rpe);
    }

    // EQUIPS QUE JA TENEN ALMENYS UN RPE REGISTRAT AVUI
    const araAvui = new Date();
    const avuiString = String(araAvui.getDate()).padStart(2, "0") + "-" + String(araAvui.getMonth() + 1).padStart(2, "0") + "-" + araAvui.getFullYear();
    const equipsAmbRPEAvui = new Set();

    for (const jugador of jugadors) {
        const userTeamsJugador = jugadorsTeams.get(jugador.uuid) || [];
        if (!rpeMap.has(`${jugador.uuid}_${avuiString}`)) continue;

        for (const ut of userTeamsJugador) {
            if (ut.team_uuid) equipsAmbRPEAvui.add(ut.team_uuid);
        }
    }

    // 5. PREPARAR FISIO
    const episodeUuids = [...new Set(visitesFisio.map(v => v.episode_uuid).filter(Boolean))];
    const episodesFisio = episodeUuids.length > 0 ? await getEpisodesByUuid(episodeUuids) : [];
    const injuryUuids = [...new Set(episodesFisio.map(e => e.injury_uuid).filter(Boolean))];
    const injuriesFisio = injuryUuids.length > 0 ? await getInjuriesByUuid(injuryUuids) : [];

    // MAPES FISIO
    const episodesMap = new Map(episodesFisio.map(e => [e.uuid, e]));
    const injuriesMap = new Map(injuriesFisio.map(i => [i.uuid, i]));
    const visitesPendentsFisio = new Map();
    const visitesFisioAssignades = new Map();
    const ara = new Date();

    for (const visita of visitesFisio) {
        if (visita.visita_feta === 1) continue;
        
        const episode = episodesMap.get(visita.episode_uuid);
        if (!episode) continue;

        const injury = injuriesMap.get(episode.injury_uuid);
        if (!injury) continue;

        // VISITA DEMANADA PERÒ SENSE HORA
        if (!visita.date || !visita.hour) {
            visitesPendentsFisio.set(injury.user_uuid, injury.uuid);
            continue;
        }

        // VISITA AMB HORA ASSIGNADA
        const parts = visita.date.split("-");
        if (parts.length !== 3) continue;

        const horaParts = visita.hour.split(":");
        const dataVisita = new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]), Number(horaParts[0]), Number(horaParts[1]));
        if (dataVisita > ara) {
            visitesFisioAssignades.set(injury.user_uuid,
                {
                    injuryUuid: injury.uuid,
                    date: visita.date,
                    hour: visita.hour
                }
            );
        }
    }

    const totsElsTeamUuids = [...new Set(Array.from(jugadorsTeams.values()).flat().map(ut => ut.team_uuid).filter(Boolean))];
    
    // 6. CARREGAR PRÀCTIQUES PER EQUIP EN PARAL·LEL
    const practicesPerTeam = new Map();
    const resultatsPractices = await Promise.all(totsElsTeamUuids.map(async teamUuid => 
        {
            const practices = await getPracticesByTeam(teamUuid);
            return {teamUuid, practices};
        })
    );

    for (const resultat of resultatsPractices) {
        practicesPerTeam.set(resultat.teamUuid, resultat.practices || []);
    }
    
// 6.1. CARREGAR PLAYER_TEAM_PRACTICE_TIME (PTPT)
const totesPractices = resultatsPractices.flatMap(r => r.practices || []);
const practiceUuids = totesPractices.map(p => p.uuid).filter(Boolean);
const ptptResultat = await getPTPTByPractice(practiceUuids);


// MAPA MÉS SEGUR: Guardem tant per (player_team_uuid + practice) com per (player_uuid + practice)
const ptptMap = new Map();
for (const ptpt of ptptResultat) {
    // Clau 1: Per player_team_uuid
    if (ptpt.player_team_uuid) {
        ptptMap.set(`${ptpt.player_team_uuid}_${ptpt.practice_uuid}`, ptpt);
    }
    // Clau 2: Per player_uuid (si existeix a l'objecte ptpt, per si de cas)
    if (ptpt.player_uuid) {
        ptptMap.set(`${ptpt.player_uuid}_${ptpt.practice_uuid}`, ptpt);
    }
}

// 7. BUSCAR ÚLTIMA SESSIÓ DEL JUGADOR
const avui = new Date();
avui.setHours(0, 0, 0, 0);

for (const jugador of jugadors) {
    const userTeamsJug = jugadorsTeams.get(jugador.uuid) || [];
    const ultimesSessionsPerEquip = [];

    // Per a cada equip del jugador, trobem quina és la SEVA última sessió
    for (const playerTeam of userTeamsJug) {
        const practices = practicesPerTeam.get(playerTeam.team_uuid) || [];
        
        let ultimaSessioEquip = null;
        let ultimaDataEquip = null;

        for (const practice of practices) {
            if (!practice.practice_date || practice.practice_date === "-") continue;

            const parts = practice.practice_date.split("-");
            if (parts.length !== 3) continue;

            const dataPrac = new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]));
            dataPrac.setHours(0, 0, 0, 0);

            if (dataPrac > avui) continue;

            if (!ultimaDataEquip || dataPrac > ultimaDataEquip) {
                ultimaDataEquip = dataPrac;
                ultimaSessioEquip = practice;
            }
        }

        if (ultimaSessioEquip) {
            // BUSQUEM EL PTPT PROVANT LES DUES CLAUS PER SI DE CAS
            const ptpt = ptptMap.get(`${playerTeam.uuid}_${ultimaSessioEquip.uuid}`) || 
                         ptptMap.get(`${jugador.uuid}_${ultimaSessioEquip.uuid}`);

            // Validem si el temps és > 0 (convertint a Number de forma segura)
            const tempsEntrenat = ptpt ? Number(ptpt.time || ptpt.minutes || 0) : 0;
            const entrena = tempsEntrenat > 0;

            console.log(`Jugador: ${jugador.name}, Equip: ${playerTeam.team_uuid}, Data: ${ultimaSessioEquip.practice_date}, Minuts: ${tempsEntrenat}, Entrena: ${entrena}`);

            ultimesSessionsPerEquip.push({
                practice: ultimaSessioEquip,
                data: ultimaDataEquip,
                entrena: entrena,
                teamUuid: playerTeam.team_uuid
            });
        }
    }

    if (ultimesSessionsPerEquip.length === 0) continue;

    // Triar la sessió segons la regla
    const sessionsOnEntrena = ultimesSessionsPerEquip.filter(s => s.entrena);

    let sessioSeleccionada = null;
    let noEntrena = false;

    if (sessionsOnEntrena.length > 0) {
        sessioSeleccionada = sessionsOnEntrena.reduce((mesRecent, actual) => 
            actual.data > mesRecent.data ? actual : mesRecent
        );
        noEntrena = false;
    } else {
        sessioSeleccionada = ultimesSessionsPerEquip.reduce((mesRecent, actual) => 
            actual.data > mesRecent.data ? actual : mesRecent
        );
        noEntrena = true;
    }

    const dataUltimaSessio = sessioSeleccionada.practice.practice_date;
    const rpe = rpeMap.get(`${jugador.uuid}_${dataUltimaSessio}`) || null;
    const teMolesties = rpe && rpe.te_molesties === true;
    const fisioDemanada = visitesPendentsFisio.get(jugador.uuid) || null;
    const fisioAssignada = visitesFisioAssignades.get(jugador.uuid) || null;

    estatRPEJugadors.push({
        jugador: jugador,
        equips: userTeamsJug.map(ut => equipsMap.get(ut.team_uuid)).filter(Boolean),
        dataUltimaSessio: dataUltimaSessio,
        rpe: rpe,
        noEntrena: noEntrena,
        teMolesties: !!teMolesties,
        teHoraFisioDemanada: !!fisioDemanada,
        injuryFisioDemanada: fisioDemanada,
        teFisioAssignada: !!fisioAssignada,
        fisioAssignada: fisioAssignada
    });
}
    
    // 8. ORDENAR JUGADORS
    estatRPEJugadors.sort((a, b) => {
        const equipsA = (a.equips || []).map(abreujarEquip).filter(Boolean).join(", ");
        const equipsB = (b.equips || []).map(abreujarEquip).filter(Boolean).join(", ");
        
        // Primer: equip    
        const comparacioEquip = equipsA.localeCompare(equipsB, "ca", { sensitivity: "base" });
        if (comparacioEquip !== 0) return comparacioEquip;

        // Després: jugador
        const nomA = `${a.jugador.player_first_name || ""} ${a.jugador.player_last_name || ""}`.trim();
        const nomB = `${b.jugador.player_first_name || ""} ${b.jugador.player_last_name || ""}`.trim();

        return nomA.localeCompare(nomB, "ca", { sensitivity: "base" });
    });

    // 9. PINTAR
    pintarEstatRPE();
}


function pintarEstatRPE() {
    
    const contenidor = document.getElementById("llistaEstatRPE");
    contenidor.innerHTML = "";

    for (const registre of estatRPEJugadors) {
        const jugador = registre.jugador;
        const rpe = registre.rpe;

        const fila = document.createElement("div");
        fila.className = "filaJugadorEstatRPE";

        const nom = document.createElement("div");
        nom.className = "nomJugadorEstatRPE";
        const nomJugador =`${capitalize(jugador.name)} ${capitalize(jugador.surname)}`.trim();
        const nomsEquips = (registre.equips || []).map(abreujarEquip).filter(Boolean);
        nom.textContent = nomsEquips.length > 0 ? `${nomJugador} (${nomsEquips.join(", ")})` : nomJugador;

        const info = document.createElement("div");
        info.className = "infoJugadorEstatRPE";

        const data = document.createElement("div");
        data.className = "dataJugadorEstatRPE";
        data.textContent = registre.dataUltimaSessio || "-";
    
        const rpeInfo = document.createElement("div");
        rpeInfo.className = "rpeJugadorEstatRPE";

        const bola = document.createElement("span");
        bola.className = "bolaRPE";

        const textRPE = document.createElement("span");
        textRPE.className = "textRPE";

        if (registre.noEntrena) {
            textRPE.textContent = "No entrena";
            rpeInfo.appendChild(textRPE);
        } else if (!registre.dataUltimaSessio) {
        } else if (rpe) {
            bola.classList.add("bolaRPEVerd");
            bola.title = "RPE registrat";
            textRPE.textContent = "RPE registrat";
            rpeInfo.appendChild(bola);
            rpeInfo.appendChild(textRPE);
        } else {
            bola.classList.add("bolaRPETvermella");
            bola.title = "RPE pendent";
            textRPE.textContent = "RPE pendent";
            rpeInfo.appendChild(bola);
            rpeInfo.appendChild(textRPE);
        }

        if (registre.dataUltimaSessio) {
            rpeInfo.appendChild(bola);
            rpeInfo.appendChild(textRPE);
        }

        const molesties = document.createElement("div");
        molesties.className = "molestiesJugadorEstatRPE";

        if (registre.teFisioAssignada) {
            const fisio = registre.fisioAssignada;
            const parts = fisio.date.split("-");

            molesties.textContent = `Fisio ${parts[0]}/${parts[1]} ${fisio.hour}`;

        } else if (registre.teMolesties && rpe && rpe.molesties) {
            molesties.textContent = rpe.molesties;

            const botoFisio = document.createElement("button");
            botoFisio.className = "botoDemanarFisio";
            botoFisio.type = "button";
            botoFisio.title = "Demanar hora de fisioteràpia";
            botoFisio.innerHTML = "🕐";

            botoFisio.addEventListener("click", () => {
                demanarFisioDesDeRPE(jugador, rpe, botoFisio);
            });

            molesties.appendChild(botoFisio);
        } else if (registre.teHoraFisioDemanada) {
            const textHora = document.createElement("span");
            textHora.textContent = "Hora demanada";
        
            const botoHora = document.createElement("button");
            botoHora.className = "botoDemanarFisio";
            botoHora.type = "button";
            botoHora.title = "Assignar hora de fisioteràpia";
            botoHora.innerHTML = "🕐";
        
            botoHora.addEventListener("click", () => {
                obrirAssignarHora(registre.injuryFisioDemanada);
            });
        
            molesties.appendChild(textHora);
            molesties.appendChild(botoHora);
        } else {
            molesties.textContent = "Sense molèsties";
        }

        info.appendChild(data);
        info.appendChild(rpeInfo);
        info.appendChild(molesties);

        fila.appendChild(nom);
        fila.appendChild(info);

        contenidor.appendChild(fila);
    }
}


document.getElementById("accedirAppEstatRPE").addEventListener("click", async () => {
    const code = obtenirCodeLocal();
    const user = await fetchUserByCode(code);
    
    if (!user) {
        sortir();
        return;
    }

    /*if (Notification.permission === "granted") {
        console.log("Les notificacions ja estan activades.");
    } else if (Notification.permission === "default") {
        const activades = await activarNotificacionsPush(user);
        if (activades) {
            alert("Notificacions activades correctament.");
        } else {
            alert("No s'han pogut activar les notificacions.");
        }
    } else if (Notification.permission === "denied") {
        console.log("Les notificacions estan bloquejades.");
    }*/

    mostrarPantalla("management");
});
