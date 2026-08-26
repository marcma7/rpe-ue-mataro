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
                <button class="eliminar">✕ Eliminar</button>
            </div>
        `;

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

        fila.querySelector(".editar").onclick=()=>{
            questionariSeleccionat=q;
            obrirPreguntes(q);
        };

        fila.querySelector(".enviar").onclick=()=>{
            questionariSeleccionat=q;
            obrirEnviar(q);
        };

        fila.querySelector(".respostes").onclick=()=>{
            questionariSeleccionat=q;
            veureRespostesQuestionari(q);
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


function pintarTaulaRespostes(q){

    const div = document.getElementById("taulaRespostesQuestionari");

    div.innerHTML = "";

    /*
     * De moment les dades són les que després carregarem
     * des de Supabase.
     */
    const respostes = [];

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
                <td>${r.resposta}</td>
            `;

            tbody.appendChild(tr);
        });

        div.appendChild(taula);

    } else {

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

        respostes.forEach((r, index) => {

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
                                    ${x.resposta}
                                </div>
                            </div>
                        `).join("")}
                    </div>
                </td>
            `;

            tr.querySelector(".botoDesplegarResposta").onclick = () => {

                const obert = filaPreguntes.style.display !== "none";

                filaPreguntes.style.display = obert ? "none" : "table-row";

                tr.querySelector(".botoDesplegarResposta").textContent =
                    obert ? "▶" : "▼";
            };

            tbody.appendChild(tr);
            tbody.appendChild(filaPreguntes);
        });

        div.appendChild(taula);
    }
}
