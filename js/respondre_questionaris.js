let questionariSeleccionat = null;


async function loadGestQuestionaris(){

    const qs = await getAllQuestionaris();
    const allQuestions = await getAllQuestions();
    questionaris = qs.map(q=>{
        q.questions = allQuestions.filter(x => x.questionari_uuid === q.uuid);
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


function pintarQuestionaris(){

    const div = document.getElementById("llistaQuestionaris");
    div.innerHTML="";

    questionaris.forEach(q=>{

        const fila = document.createElement("div");
        fila.className = "questionariFila";

        fila.innerHTML = `
            <div class="nomQuestionari">${q.name}</div>
            <div class="infoQuestionari">${q.nQuestions} preguntes</div>

            <div class="botonsQuestionari">
                <button class="editar">✎ Modificar</button>
                <button class="enviar">➤ Enviar</button>
                <button class="respostes">☷ Veure respostes</button>
                <button class="eliminar">✕ Eliminar</button>
            </div>
        `;

        fila.querySelector(".respostes").onclick=()=>{
            questionariSeleccionat=q;
            veureRespostesQuestionari(q);
        };

        fila.innerHTML = `
            <div class="nomQuestionari">${q.name}</div>
            <div class="infoQuestionari">${q.nQuestions} preguntes</div>

            <div class="botonsQuestionari">
                <button class="editar">✎ Modificar</button>
                <button class="enviar">➤ Enviar</button>
                <button class="eliminar">✕ Eliminar</button>
            </div>
        `;

        fila.querySelector(".editar").onclick=()=>{
            questionariSeleccionat=q;
            obrirPreguntes(q);
        };

        fila.querySelector(".enviar").onclick=()=>{
            questionariSeleccionat=q;
            obrirEnviar(q);
        };

        fila.querySelector(".eliminar").onclick=()=>{
            eliminarQuestionari(q.uuid);
        };

        div.appendChild(fila);
    });
}


function pintarQuestionarisJugador(user, questionaris){

    const div = document.getElementById("llistaQuestionarisJugador");
    div.innerHTML="";
    questionaris.forEach(q=>{
        const fila = document.createElement("div");
        fila.className = "questionariFila";
        fila.innerHTML = `
            <div class="nomQuestionari">${q.name}</div>
            <div class="botonsQuestionari">
                <button class="enviar">➤ Enviar</button>
            </div>
        `;

        fila.querySelector(".enviar").onclick=()=>{
            obrirEnviarJugador(q);
        };

        div.appendChild(fila);
    });
}


function pintarValoracionsJugador(user, questionaris, teamUuid){

    const div = document.getElementById("llistaValoracionsJugador");
    div.innerHTML="";
    questionaris.forEach(q=>{
        const fila = document.createElement("div");
        fila.className = "questionariFila";
        fila.innerHTML = `
            <div class="nomQuestionari">${q.name}</div>
            <div class="botonsQuestionari">
                <button class="enviar">➤ Passar</button>
            </div>
        `;

        fila.querySelector(".enviar").onclick=()=>{
            obrirEnviarValoracionsJugador(user, q, teamUuid);
        };

        div.appendChild(fila);
    });
}


function veureRespostesQuestionari(q){

    questionariSeleccionat = q;

    document.getElementById("titolRespostesQuestionari").textContent = q.name;

    document.getElementById("filtreDataRespostes").value = "";
    document.getElementById("filtreEquipRespostes").value = "";
    document.getElementById("filtreJugadorRespostes").value = "";

    mostrarPantalla("pantallaRespostesQuestionari");

    pintarTaulaRespostes(q);
}


function tornarGestQuestionaris(){
    mostrarPantalla("pantallaGestioQuestionaris");
}


async function obrirRespostesQuestionari(q){

    questionariSeleccionat = q;

    document.getElementById("pantallaGestQuestionaris").style.display = "none";
    document.getElementById("pantallaRespostesQuestionari").style.display = "block";

    document.getElementById("titolRespostesQuestionari").textContent =
        q.name + " — Respostes";

    await carregarRespostesQuestionari(q);
}


async function carregarRespostesQuestionari(q){

    const div = document.getElementById("taulaRespostesQuestionari");

    div.innerHTML = `
        <div style="padding:20px;">
            Carregant respostes...
        </div>
    `;

    try {

        // ---------------------------------------------------------
        // 1. Obtenim les assignacions d'aquest qüestionari
        // ---------------------------------------------------------

        const questionarisUser = await getQuestionarisUser(
            [q.uuid],
            []
        );

        /*
         * Com que getQuestionarisUser necessita també els usuaris,
         * fem la consulta directa per qüestionari.
         */

        const responseQU = await fetch(
            `${SUPABASE_URL}/rest/v1/questionaris_contestar?questionari_uuid=eq.${q.uuid}`,
            {
                headers:{
                    "Accept":"application/json",
                    "apikey":SUPABASE_API_KEY,
                    "Authorization":"Bearer " + SUPABASE_API_KEY
                }
            }
        );

        if(!responseQU.ok){
            throw new Error(await responseQU.text());
        }

        const assignacions = await responseQU.json();


        // ---------------------------------------------------------
        // 2. Usuaris
        // ---------------------------------------------------------

        const userUuids = [
            ...new Set(
                assignacions
                    .map(x => x.user_uuid)
                    .filter(Boolean)
            )
        ];

        let usuaris = [];

        if(userUuids.length > 0){

            const responseUsers = await fetch(
                `${SUPABASE_URL}/rest/v1/app_users?uuid=in.(${userUuids.join(",")})`,
                {
                    headers:{
                        "Accept":"application/json",
                        "apikey":SUPABASE_API_KEY,
                        "Authorization":"Bearer " + SUPABASE_API_KEY
                    }
                }
            );

            if(!responseUsers.ok){
                throw new Error(await responseUsers.text());
            }

            usuaris = await responseUsers.json();
        }


        // ---------------------------------------------------------
        // 3. Respostes
        // ---------------------------------------------------------

        const questionariUserUuids = assignacions
            .map(x => x.uuid)
            .filter(Boolean);

        const respostes = await getAnswersByQuestionari(
            questionariUserUuids
        );


        // ---------------------------------------------------------
        // 4. Preguntes
        // ---------------------------------------------------------

        const preguntes = await getQuestionsFromQuestionari(q.uuid);


        // ---------------------------------------------------------
        // 5. Equips dels usuaris
        // ---------------------------------------------------------

        let userTeams = [];

        if(userUuids.length > 0){

            const responseTeams = await fetch(
                `${SUPABASE_URL}/rest/v1/user_teams?user_uuid=in.(${userUuids.join(",")})`,
                {
                    headers:{
                        "Accept":"application/json",
                        "apikey":SUPABASE_API_KEY,
                        "Authorization":"Bearer " + SUPABASE_API_KEY
                    }
                }
            );

            if(!responseTeams.ok){
                throw new Error(await responseTeams.text());
            }

            userTeams = await responseTeams.json();
        }


        // ---------------------------------------------------------
        // 6. Equips
        // ---------------------------------------------------------

        const teamUuids = [
            ...new Set(
                userTeams
                    .map(x => x.team_uuid)
                    .filter(Boolean)
            )
        ];

        let equips = [];

        if(teamUuids.length > 0){

            const responseTeams = await fetch(
                `${SUPABASE_URL}/rest/v1/teams?uuid=in.(${teamUuids.join(",")})`,
                {
                    headers:{
                        "Accept":"application/json",
                        "apikey":SUPABASE_API_KEY,
                        "Authorization":"Bearer " + SUPABASE_API_KEY
                    }
                }
            );

            if(!responseTeams.ok){
                throw new Error(await responseTeams.text());
            }

            equips = await responseTeams.json();
        }


        // ---------------------------------------------------------
        // 7. Construïm les dades que necessita la taula
        // ---------------------------------------------------------

        const dades = assignacions.map(assignacio => {

            const user = usuaris.find(
                u => u.uuid === assignacio.user_uuid
            );

            const userTeam = userTeams.find(
                ut => ut.user_uuid === assignacio.user_uuid
            );

            const team = userTeam
                ? equips.find(t => t.uuid === userTeam.team_uuid)
                : null;

            const respostesJugador = respostes
                .filter(r =>
                    r.questionari_user_uuid === assignacio.uuid
                );

            return {

                jugador: user
                    ? `${user.name || ""} ${user.surname || ""}`.trim()
                    : "Jugador desconegut",

                jugadorUuid: assignacio.user_uuid,

                equip: team
                    ? team.team_name
                    : "",

                equipUuid: team
                    ? team.uuid
                    : null,

                dataEnviament: assignacio.data_enviament,

                contestat: assignacio.contestat,

                respostes: preguntes.map(pregunta => {

                    const resposta = respostesJugador.find(
                        r =>
                            r.question_uuid === pregunta.uuid ||
                            r.pregunta_uuid === pregunta.uuid
                    );

                    return {

                        pregunta: pregunta.pregunta,

                        resposta: resposta
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


        console.log("RESPOSTES QUESTIONARI:", dades);

        // Guardem les dades per als filtres
        window.respostesQuestionariActuals = dades;

        pintarFiltresRespostes(dades);
        pintarTaulaRespostes(q, dades);


    } catch(error){

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


function pintarTaulaRespostes(q, respostes){

    const div = document.getElementById(
        "taulaRespostesQuestionari"
    );

    div.innerHTML = "";

    if(respostes.length === 0){

        div.innerHTML = `
            <div class="senseRespostes">
                No hi ha respostes.
            </div>
        `;

        return;
    }


    // =========================================================
    // QÜESTIONARI D'UNA SOLA PREGUNTA
    // =========================================================

    if(q.nQuestions === 1){

        const taula = document.createElement("table");

        taula.className = "taulaRespostes";

        taula.innerHTML = `
            <thead>
                <tr>
                    <th>Jugador</th>
                    <th>Resposta</th>
                </tr>
            </thead>
            <tbody></tbody>
        `;

        const tbody = taula.querySelector("tbody");

        respostes.forEach(r => {

            const tr = document.createElement("tr");

            tr.innerHTML = `
                <td>${r.jugador}</td>
                <td>${r.respostes[0]?.resposta || ""}</td>
            `;

            tbody.appendChild(tr);

        });

        div.appendChild(taula);

        return;
    }


    // =========================================================
    // QÜESTIONARI DE MÉS D'UNA PREGUNTA
    // =========================================================

    const taula = document.createElement("table");

    taula.className = "taulaRespostes";

    taula.innerHTML = `
        <thead>
            <tr>
                <th>Jugador</th>
                <th>Respostes</th>
            </tr>
        </thead>
        <tbody></tbody>
    `;

    const tbody = taula.querySelector("tbody");


    respostes.forEach(r => {

        const tr = document.createElement("tr");

        tr.className = "filaJugadorResposta";

        tr.innerHTML = `
            <td>${r.jugador}</td>

            <td>
                <button class="botoDesplegarResposta">
                    ▶
                </button>
            </td>
        `;


        const filaPreguntes = document.createElement("tr");

        filaPreguntes.style.display = "none";

        filaPreguntes.innerHTML = `
            <td colspan="2">

                <div class="respostesJugador">

                    ${r.respostes.map(x => `

                        <div class="respostaPregunta">

                            <div class="pregunta">
                                ${x.pregunta}
                            </div>

                            <div class="resposta">
                                ${x.resposta || "—"}
                            </div>

                        </div>

                    `).join("")}

                </div>

            </td>
        `;


        tr.querySelector(
            ".botoDesplegarResposta"
        ).onclick = () => {

            const obert =
                filaPreguntes.style.display !== "none";

            filaPreguntes.style.display =
                obert ? "none" : "table-row";

            tr.querySelector(
                ".botoDesplegarResposta"
            ).textContent =
                obert ? "▶" : "▼";

        };


        tbody.appendChild(tr);
        tbody.appendChild(filaPreguntes);

    });


    div.appendChild(taula);
}
