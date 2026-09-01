let questionariSeleccionat = null;


// ============================================================
// GESTIÓ QÜESTIONARIS
// ============================================================

async function loadGestQuestionaris() {

    const qs = await getAllQuestionaris();
    const allQuestions = await getAllQuestions();

    questionaris = qs.map(q => {

        q.questions = allQuestions.filter(
            x => x.questionari_uuid === q.uuid
        );

        q.nQuestions = q.questions.length;

        return q;
    });

    pintarQuestionaris();
}


async function loadPantallaQuestionarisJugador(user) {

    const qs = await getAllQuestionaris();

    pintarQuestionarisJugador(user, qs);
}


async function loadPantallaValoracionsJugador(user, teamUuid) {

    const qs = await getAllValoracions();

    pintarValoracionsJugador(user, qs, teamUuid);
}


// ============================================================
// PINTAR LLISTA DE QÜESTIONARIS
// ============================================================

function pintarQuestionaris() {
    const div = document.getElementById("llistaQuestionaris");
    div.innerHTML = "";
    questionaris.forEach(q => {
        const fila = document.createElement("div");
        fila.className = "questionariFila";
        fila.innerHTML = `
            <div class="nomQuestionari">${q.name}</div>
            <div class="infoQuestionari">${q.nQuestions} preguntes</div>
            <div class="botonsQuestionari">
                <button class="editar">✎ Modificar</button>
                <button class="enviar">➤ Enviar</button>
            </div>
            <div class="botonsQuestionari">
                <button class="respostes">☷ Veure respostes</button>
                <button class="eliminar">✕ Eliminar</button>
            </div>
        `;

        fila.querySelector(".respostes").onclick = () => {
            questionariSeleccionat = q;
            veureRespostesQuestionari(q);
        };

        fila.querySelector(".editar").onclick = () => {
            questionariSeleccionat = q;
            obrirPreguntes(q);
        };

        fila.querySelector(".enviar").onclick = () => {
            questionariSeleccionat = q;
            obrirEnviar(q);
        };

        fila.querySelector(".eliminar").onclick = () => {
            eliminarQuestionari(q.uuid);
        };

        div.appendChild(fila);
    });
}



function pintarQuestionarisJugador(user, questionaris) {

    const div = document.getElementById("llistaQuestionarisJugador");
    div.innerHTML = "";
    questionaris.forEach(q => {
        const fila = document.createElement("div");
        fila.className = "questionariFila";
        fila.innerHTML = `
            <div class="nomQuestionari">${q.name}</div>
            <div class="botonsQuestionari">
                <button class="enviar">➤ Enviar</button>
            </div>
        `;

        fila.querySelector(".enviar").onclick = () => {
            obrirEnviarJugador(q);
        };

        div.appendChild(fila);
    });
}


function pintarValoracionsJugador(user, questionaris,teamUuid) {
    const div = document.getElementById("llistaValoracionsJugador");
    div.innerHTML = "";
    questionaris.forEach(q => {
        const fila = document.createElement("div");
        fila.className = "questionariFila";
        fila.innerHTML = `
            <div class="nomQuestionari">${q.name}</div>
            <div class="botonsQuestionari">
                <button class="enviar">➤ Passar</button>
            </div>
        `;

        fila.querySelector(".enviar").onclick = () => {
            obrirEnviarValoracionsJugador(user, q, teamUuid);
        };

        div.appendChild(fila);
    });
}


function veureRespostesQuestionari(q) {
    questionariSeleccionat = q;
    document.getElementById("titolRespostesQuestionari").textContent = q.name;

    const filtreData = document.getElementById("filtreDataRespostes");
    if (filtreData) filtreData.value = "";

    const filtreEquip = document.getElementById("filtreEquipRespostes");
    if (filtreEquip) filtreEquip.value = "";

    mostrarPantalla("pantallaRespostesQuestionari");
    carregarRespostesQuestionari(q);
}


function pintarFiltresRespostes(dades) {
    const selectEquip = document.getElementById("filtreEquipRespostes");
    const inputData = document.getElementById("filtreDataRespostes");

    if (selectEquip) {
        selectEquip.innerHTML = `<option value="">Tots els equips</option>`;

        const equipsMap = new Map();
        dades.forEach(x => {
            if (x.equipUuid && x.equip) {
                equipsMap.set(x.equipUuid, x.equip);
            }
        });

        Array.from(equipsMap.entries())
            .sort((a, b) => a[1].localeCompare(b[1], "ca"))
            .forEach(([uuid, nom]) => {
                const option = document.createElement("option");
                option.value = uuid;
                option.textContent = nom;
                selectEquip.appendChild(option);
            });

        selectEquip.onchange = aplicarFiltresRespostes;
    }

    if (inputData) {
        inputData.onchange = aplicarFiltresRespostes;
    }
}


function pintarSelectorPreguntaRespostes(preguntes) {
    let contenidorPregunta = document.getElementById("contenidorNavegacioPregunta");

    if (!contenidorPregunta) {
        const zonaFiltres = document.querySelector(".filtresRespostes");
        contenidorPregunta = document.createElement("div");
        contenidorPregunta.id = "contenidorNavegacioPregunta";
        contenidorPregunta.className = "zonaNavegacioPregunta";

        if (zonaFiltres && zonaFiltres.parentNode) {
            zonaFiltres.parentNode.insertBefore(contenidorPregunta, zonaFiltres.nextSibling);
        } else {
            // Si no troba zonaFiltres, el posa directament abans de la taula
            const taulaDiv = document.getElementById("taulaRespostesQuestionari");
            if (taulaDiv && taulaDiv.parentNode) {
                taulaDiv.parentNode.insertBefore(contenidorPregunta, taulaDiv);
            }
        }
    }

    contenidorPregunta.innerHTML = "";

    if (!preguntes || preguntes.length === 0) {
        contenidorPregunta.innerHTML = `<div class="sensePreguntes">Aquest qüestionari no té preguntes</div>`;
        return;
    }

    const indexActual = window.indexPreguntaRespostes || 0;
    const preguntaActual = preguntes[indexActual];

    // Injectem el contingut HTML
    contenidorPregunta.innerHTML = `
        <div class="visorPreguntaBox">
            <button type="button" id="btnPreguntaPrev" class="botoFletxaPregunta" title="Pregunta anterior">
                &#10094;
            </button>
            <div class="detallPreguntaCentral">
                <span class="comptadorPregunta">Pregunta ${indexActual + 1} de ${preguntes.length}</span>
                <h3 class="textPreguntaActual">${escaparHTML(preguntaActual.pregunta)}</h3>
            </div>
            <button type="button" id="btnPreguntaNext" class="botoFletxaPregunta" title="Pregunta següent">
                &#10095;
            </button>
        </div>
    `;

    // Recuperem els botons creats explícitament
    const btnPrev = document.getElementById("btnPreguntaPrev");
    const btnNext = document.getElementById("btnPreguntaNext");

    // Validem que existeixen abans d'assignar els esdeveniments
    if (btnPrev) {
        btnPrev.onclick = () => {
            const total = window.preguntesQuestionariActuals.length;
            window.indexPreguntaRespostes = (window.indexPreguntaRespostes - 1 + total) % total;
            pintarSelectorPreguntaRespostes(window.preguntesQuestionariActuals);
            aplicarFiltresRespostes();
        };
    }

    if (btnNext) {
        btnNext.onclick = () => {
            const total = window.preguntesQuestionariActuals.length;
            window.indexPreguntaRespostes = (window.indexPreguntaRespostes + 1) % total;
            pintarSelectorPreguntaRespostes(window.preguntesQuestionariActuals);
            aplicarFiltresRespostes();
        };
    }
}


function aplicarFiltresRespostes() {
    const dades = window.respostesQuestionariActuals || [];
    const inputData = document.getElementById("filtreDataRespostes");
    const selectEquip = document.getElementById("filtreEquipRespostes");

    const dataSeleccionada = inputData ? inputData.value : "";
    const equipSeleccionat = selectEquip ? selectEquip.value : "";

    const dadesFiltrades = dades.filter(r => {
        if (dataSeleccionada && !dataRespostaCoincideix(r.dataEnviament, dataSeleccionada)) {
            return false;
        }
        if (equipSeleccionat && r.equipUuid !== equipSeleccionat) {
            return false;
        }
        return true;
    });

    pintarTaulaRespostes(questionariSeleccionat, dadesFiltrades);
}


function majusculaInicials(text) {
    if (!text) return "";
    return text
        .toLowerCase()
        .split(" ")
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
}


function pintarTaulaRespostes(q, respostes) {
    const div = document.getElementById("taulaRespostesQuestionari");
    div.innerHTML = "";

    if (!respostes || respostes.length === 0) {
        div.innerHTML = `
            <div class="senseRespostes">
                No s'han trobat respostes amb els filtres seleccionats.
            </div>
        `;
        return;
    }

    const preguntes = window.preguntesQuestionariActuals || [];
    if (preguntes.length === 0) return;

    let index = window.indexPreguntaRespostes || 0;
    if (index < 0 || index >= preguntes.length) index = 0;

    const preguntaActual = preguntes[index];

    const taula = document.createElement("table");
    taula.className = "taulaRespostesDissenyada";

    taula.innerHTML = `
        <thead>
            <tr>
                <th>Jugador</th>
                <th>Equip</th>
                <th>Data enviament</th>
                <th style="text-align: center;">Estat / Resposta</th>
            </tr>
        </thead>
        <tbody></tbody>
    `;

    const tbody = taula.querySelector("tbody");

    respostes.forEach(r => {
        const tr = document.createElement("tr");

        const respostaObj = r.respostes.find(x => x.preguntaUuid === preguntaActual.uuid);
        const valor = respostaObj ? respostaObj.resposta : "";
        const teResposta = valor !== null && valor !== undefined && String(valor).trim() !== "";

        // Apliquem la transformació de majúscules al nom del jugador
        const nomJugadorFormatat = majusculaInicials(r.jugador);

        tr.innerHTML = `
            <td class="colNomJugador">
                <strong>${escaparHTML(nomJugadorFormatat)}</strong>
            </td>
            <td>
                <span class="badgeEquip">${escaparHTML(r.equip || "Sense equip")}</span>
            </td>
            <td class="colData">
                ${formatejarDataResposta(r.dataEnviament)}
            </td>
            <td class="colResposta" style="text-align: center;">
                ${teResposta
                    ? `<div class="caixaRespostaCompletada">${escaparHTML(String(valor))}</div>`
                    : `<span class="tagPendent">Pendent</span>`
                }
            </td>
        `;

        tbody.appendChild(tr);
    });

    div.appendChild(taula);
}


function tornarGestQuestionaris() {
    mostrarPantalla("pantallaGestioQuestionaris");
}


async function carregarRespostesQuestionari(q) {

    const div = document.getElementById("taulaRespostesQuestionari");
    div.innerHTML = `
        <div style="padding:20px;">Carregant respostes...</div>
    `;

    try {
        const responseQU = await fetch(
            `${SUPABASE_URL}/rest/v1/questionaris_contestar?questionari_uuid=eq.${q.uuid}`,
            {
                headers: {
                    "Accept": "application/json",
                    "apikey": SUPABASE_API_KEY,
                    "Authorization": "Bearer " + SUPABASE_API_KEY
                }
            }
        );

        if (!responseQU.ok) throw new Error(await responseQU.text());

        const assignacions = await responseQU.json();

        const userUuids = [...new Set(assignacions.map(x => x.user_uuid).filter(Boolean))];

        let usuaris = [];
        if (userUuids.length > 0) {
            const responseUsers = await fetch(
                `${SUPABASE_URL}/rest/v1/app_users?uuid=in.(${userUuids.join(",")})`,
                {
                    headers: {
                        "Accept": "application/json",
                        "apikey": SUPABASE_API_KEY,
                        "Authorization": "Bearer " + SUPABASE_API_KEY
                    }
                }
            );

            if (!responseUsers.ok) throw new Error(await responseUsers.text());
            usuaris = await responseUsers.json();
        }

        const questionariUserUuids = assignacions.map(x => x.uuid).filter(Boolean);
        let respostes = [];

        if (questionariUserUuids.length > 0) respostes = await getAnswersByQuestionari(questionariUserUuids);

        const preguntes = await getQuestionsFromQuestionari(q.uuid);

        let userTeams = [];

        if (userUuids.length > 0) {

            const responseTeams = await fetch(
                `${SUPABASE_URL}/rest/v1/user_teams?user_uuid=in.(${userUuids.join(",")})`,
                {
                    headers: {
                        "Accept": "application/json",
                        "apikey": SUPABASE_API_KEY,
                        "Authorization": "Bearer " + SUPABASE_API_KEY
                    }
                }
            );


            if (!responseTeams.ok) throw new Error(await responseTeams.text());

            userTeams = await responseTeams.json();
        }

        const teamUuids = [...new Set(userTeams.map(x => x.team_uuid).filter(Boolean))];
        let equips = [];

        if (teamUuids.length > 0) {
            const responseTeams = await fetch(
                `${SUPABASE_URL}/rest/v1/teams?uuid=in.(${teamUuids.join(",")})`,
                {
                    headers: {
                        "Accept": "application/json",
                        "apikey": SUPABASE_API_KEY,
                        "Authorization":
                            "Bearer " + SUPABASE_API_KEY
                    }
                }
            );

            if (!responseTeams.ok) throw new Error(await responseTeams.text());
            equips = await responseTeams.json();
        }

        const dades = assignacions.map(assignacio => {
            const user = usuaris.find(u => u.uuid === assignacio.user_uuid);
            const userTeam = userTeams.find(ut => ut.user_uuid === assignacio.user_uuid);
            const team = userTeam ? equips.find(t => t.uuid === userTeam.team_uuid) : null;
            const respostesJugador = respostes.filter(r => r.questionari_user_uuid === assignacio.uuid);

            return {
                jugador: user ? `${user.name || ""} ${user.surname || ""}`.trim() : "Jugador desconegut",
                jugadorUuid: assignacio.user_uuid,
                equip: team ? team.team_name : "",
                equipUuid: team ? team.uuid : null,
                dataEnviament: assignacio.data_enviament,
                contestat: assignacio.contestat,
                assignacioUuid: assignacio.uuid,
                respostes: preguntes.map(pregunta => {
                        const resposta = respostesJugador.find(r => r.question_uuid === pregunta.uuid || r.pregunta_uuid === pregunta.uuid);
                        return {
                            preguntaUuid: pregunta.uuid,
                            pregunta: pregunta.pregunta,
                            resposta: resposta ? (resposta.resposta ?? resposta.answer ?? resposta.valor ?? "") : ""
                        };
                    })
            };
        });

        window.respostesQuestionariActuals = dades;
        window.preguntesQuestionariActuals = preguntes;
        window.indexPreguntaRespostes = 0;

        pintarFiltresRespostes(dades);
        pintarSelectorPreguntaRespostes(preguntes);

        aplicarFiltresRespostes();
    } catch (error) {
        console.error("Error carregant respostes del qüestionari:", error);
        div.innerHTML = `
            <div style="padding:20px;color:red;">Error carregant les respostes.</div>
        `;
    }
}



function actualitzarPreguntaRespostes() {

    const select = document.getElementById("selectPreguntaRespostes");
    if (!select) return;

    const index = window.indexPreguntaRespostes || 0;
    select.value = index;
}



function dataRespostaCoincideix(dataResposta, dataFiltre) {
    if (!dataResposta || !dataFiltre) return false;

    const valor = String(dataResposta).trim();

    if (valor.substring(0, 10) === dataFiltre) return true;

    const match = valor.match(/^(\d{2})-(\d{2})-(\d{4})/);

    if (match) {
        const normalitzada = `${match[3]}-${match[2]}-${match[1]}`;
        return (normalitzada === dataFiltre);
    }

    const matchSlash = valor.match(/^(\d{2})\/(\d{2})\/(\d{4})/);

    if (matchSlash) {
        const normalitzada = `${matchSlash[3]}-${matchSlash[2]}-${matchSlash[1]}`;
        return (normalitzada === dataFiltre);
    }

    const data = new Date(valor);
    if (!isNaN(data.getTime())) {
        const any = data.getFullYear();
        const mes = String(data.getMonth() + 1).padStart(2, "0");
        const dia = String(data.getDate()).padStart(2, "0");
        return (`${any}-${mes}-${dia}` === dataFiltre);
    }
    return false;
}


function escaparHTML(valor) {
    if (valor === null || valor === undefined) return "";

    return String(valor)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


function formatejarDataResposta(data) {

    if (!data) return "—";

    const valor = String(data).trim();

    let match = valor.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (match) return `${match[3]}/${match[2]}/${match[1]}`;

    match = valor.match(/^(\d{2})-(\d{2})-(\d{4})/);
    if (match) return `${match[1]}/${match[2]}/${match[3]}`;

    match = valor.match(/^(\d{2})\/(\d{2})\/(\d{4})/);
    if (match) return valor.substring(0, 10);

    return valor;
}
