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
            <div class="nomQuestionari">
                ${q.name}
            </div>
        
            <div class="infoQuestionari">
                ${q.nQuestions} preguntes
            </div>
        
            <div class="botonsQuestionari">
        
                <button class="editar">
                    ✎ Modificar
                </button>
        
                <button class="enviar">
                    ➤ Enviar
                </button>
        
                        <button class="respostes">
                            ☷ Veure respostes
                        </button>
        
                        <button class="eliminar">
                            ✕ Eliminar
                        </button>
                
        
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


// ============================================================
// QÜESTIONARIS DES DE JUGADOR
// ============================================================

function pintarQuestionarisJugador(user, questionaris) {

    const div = document.getElementById(
        "llistaQuestionarisJugador"
    );

    div.innerHTML = "";

    questionaris.forEach(q => {

        const fila = document.createElement("div");

        fila.className = "questionariFila";

        fila.innerHTML = `
            <div class="nomQuestionari">
                ${q.name}
            </div>

            <div class="botonsQuestionari">

                <button class="enviar">
                    ➤ Enviar
                </button>

            </div>
        `;


        fila.querySelector(".enviar").onclick = () => {

            obrirEnviarJugador(q);
        };


        div.appendChild(fila);
    });
}


// ============================================================
// VALORACIONS DES DE JUGADOR
// ============================================================

function pintarValoracionsJugador(
    user,
    questionaris,
    teamUuid
) {

    const div = document.getElementById(
        "llistaValoracionsJugador"
    );

    div.innerHTML = "";

    questionaris.forEach(q => {

        const fila = document.createElement("div");

        fila.className = "questionariFila";

        fila.innerHTML = `
            <div class="nomQuestionari">
                ${q.name}
            </div>

            <div class="botonsQuestionari">

                <button class="enviar">
                    ➤ Passar
                </button>

            </div>
        `;


        fila.querySelector(".enviar").onclick = () => {

            obrirEnviarValoracionsJugador(
                user,
                q,
                teamUuid
            );
        };


        div.appendChild(fila);
    });
}


// ============================================================
// OBRIR PANTALLA RESPOSTES
// ============================================================

function veureRespostesQuestionari(q) {

    questionariSeleccionat = q;

    document.getElementById(
        "titolRespostesQuestionari"
    ).textContent = q.name;

    document.getElementById(
        "filtreDataRespostes"
    ).value = "";

    document.getElementById(
        "filtreEquipRespostes"
    ).value = "";

    document.getElementById(
        "filtreJugadorRespostes"
    ).value = "";


    mostrarPantalla(
        "pantallaRespostesQuestionari"
    );


    carregarRespostesQuestionari(q);
}


// ============================================================
// TORNAR A GESTIÓ
// ============================================================

function tornarGestQuestionaris() {

    mostrarPantalla(
        "pantallaGestioQuestionaris"
    );
}


// ============================================================
// COMPATIBILITAT AMB L'ANTIGA FUNCIÓ
// ============================================================

async function obrirRespostesQuestionari(q) {

    veureRespostesQuestionari(q);
}


// ============================================================
// CARREGAR TOTES LES RESPOSTES
// ============================================================

async function carregarRespostesQuestionari(q) {

    const div = document.getElementById(
        "taulaRespostesQuestionari"
    );


    div.innerHTML = `
        <div style="padding:20px;">
            Carregant respostes...
        </div>
    `;


    try {

        // =====================================================
        // 1. ASSIGNACIONS DEL QÜESTIONARI
        // =====================================================

        const responseQU = await fetch(
            `${SUPABASE_URL}/rest/v1/questionaris_contestar?questionari_uuid=eq.${q.uuid}`,
            {
                headers: {
                    "Accept": "application/json",
                    "apikey": SUPABASE_API_KEY,
                    "Authorization":
                        "Bearer " + SUPABASE_API_KEY
                }
            }
        );


        if (!responseQU.ok) {

            throw new Error(
                await responseQU.text()
            );
        }


        const assignacions =
            await responseQU.json();


        // =====================================================
        // 2. USUARIS
        // =====================================================

        const userUuids = [
            ...new Set(
                assignacions
                    .map(x => x.user_uuid)
                    .filter(Boolean)
            )
        ];


        let usuaris = [];


        if (userUuids.length > 0) {

            const responseUsers = await fetch(
                `${SUPABASE_URL}/rest/v1/app_users?uuid=in.(${userUuids.join(",")})`,
                {
                    headers: {
                        "Accept": "application/json",
                        "apikey": SUPABASE_API_KEY,
                        "Authorization":
                            "Bearer " + SUPABASE_API_KEY
                    }
                }
            );


            if (!responseUsers.ok) {

                throw new Error(
                    await responseUsers.text()
                );
            }


            usuaris =
                await responseUsers.json();
        }


        // =====================================================
        // 3. RESPOSTES
        // =====================================================

        const questionariUserUuids =
            assignacions
                .map(x => x.uuid)
                .filter(Boolean);


        let respostes = [];


        if (questionariUserUuids.length > 0) {

            respostes =
                await getAnswersByQuestionari(
                    questionariUserUuids
                );
        }


        // =====================================================
        // 4. PREGUNTES
        // =====================================================

        const preguntes =
            await getQuestionsFromQuestionari(
                q.uuid
            );


        // =====================================================
        // 5. EQUIPS DELS USUARIS
        // =====================================================

        let userTeams = [];


        if (userUuids.length > 0) {

            const responseTeams = await fetch(
                `${SUPABASE_URL}/rest/v1/user_teams?user_uuid=in.(${userUuids.join(",")})`,
                {
                    headers: {
                        "Accept": "application/json",
                        "apikey": SUPABASE_API_KEY,
                        "Authorization":
                            "Bearer " + SUPABASE_API_KEY
                    }
                }
            );


            if (!responseTeams.ok) {

                throw new Error(
                    await responseTeams.text()
                );
            }


            userTeams =
                await responseTeams.json();
        }


        // =====================================================
        // 6. EQUIPS
        // =====================================================

        const teamUuids = [
            ...new Set(
                userTeams
                    .map(x => x.team_uuid)
                    .filter(Boolean)
            )
        ];


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


            if (!responseTeams.ok) {

                throw new Error(
                    await responseTeams.text()
                );
            }


            equips =
                await responseTeams.json();
        }


        // =====================================================
        // 7. CONSTRUIR DADES
        // =====================================================

        const dades = assignacions.map(assignacio => {

            const user =
                usuaris.find(
                    u =>
                        u.uuid ===
                        assignacio.user_uuid
                );


            /*
             * Un usuari podria tenir més d'un equip.
             *
             * Per defecte agafem el primer equip.
             * Això manté el comportament actual.
             */

            const userTeam =
                userTeams.find(
                    ut =>
                        ut.user_uuid ===
                        assignacio.user_uuid
                );


            const team =
                userTeam
                    ? equips.find(
                        t =>
                            t.uuid ===
                            userTeam.team_uuid
                    )
                    : null;


            const respostesJugador =
                respostes.filter(
                    r =>
                        r.questionari_user_uuid ===
                        assignacio.uuid
                );


            return {

                jugador: user
                    ? `${user.name || ""} ${user.surname || ""}`.trim()
                    : "Jugador desconegut",

                jugadorUuid:
                    assignacio.user_uuid,

                equip:
                    team
                        ? team.team_name
                        : "",

                equipUuid:
                    team
                        ? team.uuid
                        : null,

                dataEnviament:
                    assignacio.data_enviament,

                contestat:
                    assignacio.contestat,

                assignacioUuid:
                    assignacio.uuid,

                respostes:
                    preguntes.map(pregunta => {

                        const resposta =
                            respostesJugador.find(
                                r =>
                                    r.question_uuid ===
                                        pregunta.uuid ||

                                    r.pregunta_uuid ===
                                        pregunta.uuid
                            );


                        return {

                            preguntaUuid:
                                pregunta.uuid,

                            pregunta:
                                pregunta.pregunta,

                            resposta:
                                resposta
                                    ? (
                                        resposta.resposta ??
                                        resposta.answer ??
                                        resposta.valor ??
                                        ""
                                    )
                                    : ""

                        };

                    })

            };

        });


        console.log(
            "RESPOSTES QUESTIONARI:",
            dades
        );


        // =====================================================
        // 8. GUARDAR DADES
        // =====================================================

        window.respostesQuestionariActuals =
            dades;

        window.preguntesQuestionariActuals =
            preguntes;


        // =====================================================
        // 9. INICIALITZAR PREGUNTA
        // =====================================================

        window.indexPreguntaRespostes = 0;


        // =====================================================
        // 10. PINTAR FILTRES
        // =====================================================

        pintarFiltresRespostes(
            dades
        );


        // =====================================================
        // 11. PINTAR SELECTOR DE PREGUNTA
        // =====================================================

        pintarSelectorPreguntaRespostes(
            preguntes
        );


        // =====================================================
        // 12. PINTAR TAULA
        // =====================================================

        aplicarFiltresRespostes();


    } catch (error) {

        console.error(
            "Error carregant respostes del qüestionari:",
            error
        );


        div.innerHTML = `
            <div style="padding:20px;color:red;">
                Error carregant les respostes.
            </div>
        `;
    }
}


// ============================================================
// FILTRES
// ============================================================

function pintarFiltresRespostes(dades) {

    const selectEquip =
        document.getElementById(
            "filtreEquipRespostes"
        );

    const selectJugador =
        document.getElementById(
            "filtreJugadorRespostes"
        );

    const inputData =
        document.getElementById(
            "filtreDataRespostes"
        );


    // =========================================================
    // EQUIPS
    // =========================================================

    selectEquip.innerHTML = `
        <option value="">
            Tots els equips
        </option>
    `;


    const equips = [
        ...new Map(
            dades
                .filter(x => x.equipUuid)
                .map(x => [
                    x.equipUuid,
                    x.equip
                ])
        ).entries()
    ];


    equips
        .sort((a, b) =>
            a[1].localeCompare(
                b[1],
                "ca"
            )
        )
        .forEach(([uuid, nom]) => {

            const option =
                document.createElement("option");

            option.value = uuid;

            option.textContent = nom;

            selectEquip.appendChild(
                option
            );
        });


    // =========================================================
    // JUGADORS
    // =========================================================

    selectJugador.innerHTML = `
        <option value="">
            Tots els jugadors
        </option>
    `;


    const jugadors = [
        ...new Map(
            dades
                .filter(x => x.jugadorUuid)
                .map(x => [
                    x.jugadorUuid,
                    x.jugador
                ])
        ).entries()
    ];


    jugadors
        .sort((a, b) =>
            a[1].localeCompare(
                b[1],
                "ca"
            )
        )
        .forEach(([uuid, nom]) => {

            const option =
                document.createElement("option");

            option.value = uuid;

            option.textContent = nom;

            selectJugador.appendChild(
                option
            );
        });


    // =========================================================
    // EVENTS
    // =========================================================

    inputData.onchange =
        aplicarFiltresRespostes;

    selectEquip.onchange =
        aplicarFiltresRespostes;

    selectJugador.onchange =
        aplicarFiltresRespostes;
}


// ============================================================
// SELECTOR DE PREGUNTA
// ============================================================

function pintarSelectorPreguntaRespostes(
    preguntes
) {

    const contenidor =
        document.querySelector(
            ".filtresRespostes"
        );


    if (!contenidor) {
        return;
    }


    // Eliminar selector anterior
    const anterior =
        document.getElementById(
            "selectorPreguntaRespostes"
        );


    if (anterior) {
        anterior.remove();
    }


    if (
        !preguntes ||
        preguntes.length === 0
    ) {
        return;
    }


    const filtre =
        document.createElement("div");

    filtre.className =
        "filtre filtrePreguntaRespostes";


    filtre.innerHTML = `

        <label>Pregunta</label>

        <div
            id="selectorPreguntaRespostes"
            class="selectorPreguntaRespostes"
        >

            <button
                type="button"
                id="preguntaAnteriorRespostes"
                class="fletxaPregunta"
            >
                ←
            </button>

            <div
                id="preguntaActualRespostes"
                class="preguntaActualRespostes"
            ></div>

            <button
                type="button"
                id="preguntaSeguentRespostes"
                class="fletxaPregunta"
            >
                →
            </button>

        </div>
    `;


    contenidor.appendChild(
        filtre
    );


    document.getElementById(
        "preguntaAnteriorRespostes"
    ).onclick = () => {

        if (!window.preguntesQuestionariActuals) {
            return;
        }


        const total =
            window.preguntesQuestionariActuals.length;


        if (total === 0) {
            return;
        }


        window.indexPreguntaRespostes--;

        if (
            window.indexPreguntaRespostes < 0
        ) {
            window.indexPreguntaRespostes =
                total - 1;
        }


        actualitzarPreguntaRespostes();

        aplicarFiltresRespostes();
    };


    document.getElementById(
        "preguntaSeguentRespostes"
    ).onclick = () => {

        if (!window.preguntesQuestionariActuals) {
            return;
        }


        const total =
            window.preguntesQuestionariActuals.length;


        if (total === 0) {
            return;
        }


        window.indexPreguntaRespostes++;

        if (
            window.indexPreguntaRespostes >= total
        ) {
            window.indexPreguntaRespostes = 0;
        }


        actualitzarPreguntaRespostes();

        aplicarFiltresRespostes();
    };


    actualitzarPreguntaRespostes();
}


// ============================================================
// ACTUALITZAR TEXT DE LA PREGUNTA
// ============================================================

function actualitzarPreguntaRespostes() {

    const div =
        document.getElementById(
            "preguntaActualRespostes"
        );


    if (!div) {
        return;
    }


    const preguntes =
        window.preguntesQuestionariActuals;


    if (
        !preguntes ||
        preguntes.length === 0
    ) {

        div.textContent =
            "No hi ha preguntes";

        return;
    }


    const index =
        window.indexPreguntaRespostes || 0;


    const pregunta =
        preguntes[index];


    div.textContent =
        `${index + 1}. ${pregunta.pregunta}`;
}


// ============================================================
// APLICAR FILTRES
// ============================================================

function aplicarFiltresRespostes() {

    const dades =
        window.respostesQuestionariActuals || [];


    const inputData =
        document.getElementById(
            "filtreDataRespostes"
        );

    const selectEquip =
        document.getElementById(
            "filtreEquipRespostes"
        );

    const selectJugador =
        document.getElementById(
            "filtreJugadorRespostes"
        );


    const dataSeleccionada =
        inputData
            ? inputData.value
            : "";


    const equipSeleccionat =
        selectEquip
            ? selectEquip.value
            : "";


    const jugadorSeleccionat =
        selectJugador
            ? selectJugador.value
            : "";


    const dadesFiltrades =
        dades.filter(r => {

            // =================================================
            // DATA
            // =================================================

            if (dataSeleccionada) {

                if (
                    !dataRespostaCoincideix(
                        r.dataEnviament,
                        dataSeleccionada
                    )
                ) {
                    return false;
                }
            }


            // =================================================
            // EQUIP
            // =================================================

            if (
                equipSeleccionat &&
                r.equipUuid !==
                    equipSeleccionat
            ) {

                return false;
            }


            // =================================================
            // JUGADOR
            // =================================================

            if (
                jugadorSeleccionat &&
                r.jugadorUuid !==
                    jugadorSeleccionat
            ) {

                return false;
            }


            return true;
        });


    pintarTaulaRespostes(
        questionariSeleccionat,
        dadesFiltrades
    );
}


// ============================================================
// COMPROVAR DATA
// ============================================================

function dataRespostaCoincideix(
    dataResposta,
    dataFiltre
) {

    if (
        !dataResposta ||
        !dataFiltre
    ) {
        return false;
    }


    const valor =
        String(dataResposta).trim();


    // =========================================================
    // FORMAT YYYY-MM-DD
    // =========================================================

    if (
        valor.substring(0, 10) ===
        dataFiltre
    ) {
        return true;
    }


    // =========================================================
    // FORMAT DD-MM-YYYY
    // =========================================================

    const match =
        valor.match(
            /^(\d{2})-(\d{2})-(\d{4})/
        );


    if (match) {

        const normalitzada =
            `${match[3]}-${match[2]}-${match[1]}`;

        return (
            normalitzada ===
            dataFiltre
        );
    }


    // =========================================================
    // FORMAT DD/MM/YYYY
    // =========================================================

    const matchSlash =
        valor.match(
            /^(\d{2})\/(\d{2})\/(\d{4})/
        );


    if (matchSlash) {

        const normalitzada =
            `${matchSlash[3]}-${matchSlash[2]}-${matchSlash[1]}`;

        return (
            normalitzada ===
            dataFiltre
        );
    }


    // =========================================================
    // ÚLTIM RECURS: DATE
    // =========================================================

    const data =
        new Date(valor);


    if (
        !isNaN(
            data.getTime()
        )
    ) {

        const any =
            data.getFullYear();

        const mes =
            String(
                data.getMonth() + 1
            ).padStart(2, "0");

        const dia =
            String(
                data.getDate()
            ).padStart(2, "0");


        return (
            `${any}-${mes}-${dia}` ===
            dataFiltre
        );
    }


    return false;
}


// ============================================================
// PINTAR TAULA
// ============================================================

function pintarTaulaRespostes(
    q,
    respostes
) {

    const div =
        document.getElementById(
            "taulaRespostesQuestionari"
        );


    div.innerHTML = "";


    if (
        !respostes ||
        respostes.length === 0
    ) {

        div.innerHTML = `
            <div class="senseRespostes">
                No hi ha persones que compleixin els filtres.
            </div>
        `;

        return;
    }


    // =========================================================
    // PREGUNTA ACTUAL
    // =========================================================

    const preguntes =
        window.preguntesQuestionariActuals || [];


    if (
        preguntes.length === 0
    ) {

        div.innerHTML = `
            <div class="senseRespostes">
                Aquest qüestionari no té preguntes.
            </div>
        `;

        return;
    }


    let index =
        window.indexPreguntaRespostes || 0;


    if (
        index < 0 ||
        index >= preguntes.length
    ) {
        index = 0;
    }


    const preguntaActual =
        preguntes[index];


    // =========================================================
    // TAULA
    // =========================================================

    const taula =
        document.createElement("table");


    taula.className =
        "taulaRespostes";


    taula.innerHTML = `

        <thead>

            <tr>

                <th>
                    Jugador
                </th>

                <th>
                    Equip
                </th>

                <th>
                    Data enviament
                </th>

                <th>
                    Resposta
                </th>

            </tr>

        </thead>

        <tbody></tbody>
    `;


    const tbody =
        taula.querySelector("tbody");


    // =========================================================
    // FILES
    // =========================================================

    respostes.forEach(r => {

        const tr =
            document.createElement("tr");


        const resposta =
            r.respostes.find(
                x =>
                    x.preguntaUuid ===
                    preguntaActual.uuid
            );


        const valor =
            resposta
                ? resposta.resposta
                : "";


        const respostaMostrada =
            valor !== null &&
            valor !== undefined &&
            String(valor).trim() !== ""
                ? valor
                : "—";


        tr.innerHTML = `

            <td>
                ${escaparHTML(
                    r.jugador
                )}
            </td>

            <td>
                ${escaparHTML(
                    r.equip || "—"
                )}
            </td>

            <td>
                ${formatejarDataResposta(
                    r.dataEnviament
                )}
            </td>

            <td class="respostaTaula">

                ${escaparHTML(
                    String(
                        respostaMostrada
                    )
                )}

            </td>
        `;


        tbody.appendChild(tr);
    });


    div.appendChild(taula);
}


// ============================================================
// ESCAPAR HTML
// ============================================================

function escaparHTML(valor) {

    if (
        valor === null ||
        valor === undefined
    ) {
        return "";
    }


    return String(valor)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


// ============================================================
// FORMAT DATA
// ============================================================

function formatejarDataResposta(
    data
) {

    if (!data) {
        return "—";
    }


    const valor =
        String(data).trim();


    // YYYY-MM-DD
    let match =
        valor.match(
            /^(\d{4})-(\d{2})-(\d{2})/
        );


    if (match) {

        return `${match[3]}/${match[2]}/${match[1]}`;
    }


    // DD-MM-YYYY
    match =
        valor.match(
            /^(\d{2})-(\d{2})-(\d{4})/
        );


    if (match) {

        return `${match[1]}/${match[2]}/${match[3]}`;
    }


    // DD/MM/YYYY
    match =
        valor.match(
            /^(\d{2})\/(\d{2})\/(\d{4})/
        );


    if (match) {

        return valor.substring(
            0,
            10
        );
    }


    return valor;
}
