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


async function loadPantallaValoracionsJugador(user) {
    const qs = await getAllValoracions();
    pintarValoracionsJugador(user, qs);
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


function pintarValoracionsJugador(user, questionaris){

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
            obrirEnviarValoracionsJugador(user, q);
        };

        div.appendChild(fila);
    });
}
