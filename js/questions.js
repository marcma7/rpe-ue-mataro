let questionariActual = null;
let preguntaSeleccionada = null;


async function obrirPreguntes(questionari){
    questionariActual = questionari;
    mostrarPantalla("questions");
    await loadQuestionsGestio();
}


async function loadQuestionsGestio(){
    questions = await getQuestionsFromQuestionari(questionariActual.uuid);
    questions.sort((a,b)=> a.ordre - b.ordre);
    pintarQuestions();

}


function pintarQuestions(){

    const div = document.getElementById("llistaPreguntes");
    div.innerHTML="";

    questions.forEach((q,index)=>{
        const fila = document.createElement("div");
        fila.className = "questionFila";
        fila.innerHTML=`
            <div class="questionInfo">
                <b>${q.pregunta}</b>
                <br>
                <small>${q.tipus_pregunta}</small>
            </div>

            <div class="questionButtons">
                <button class="up">↑</button>
                <button class="delete">✕</button>
                <button class="down">↓</button>
            </div>
        `;

        fila.querySelector(".up").onclick=()=>{
            mourePreguntaAmunt(index);
        };

        fila.querySelector(".down").onclick=()=>{
            mourePreguntaAvall(index);
        };

        fila.querySelector(".delete").onclick=()=>{
            eliminarPregunta(q.uuid);
        };

        fila.onclick=()=>{
            preguntaSeleccionada=q;
            obrirEditarPregunta(q);
        };

        fila.querySelector(".up").onclick = (e) => {
            e.stopPropagation();
            mourePreguntaAmunt(index);
        };

        fila.querySelector(".down").onclick = (e) => {
            e.stopPropagation();
            mourePreguntaAvall(index);
        };

        fila.querySelector(".delete").onclick = (e) => {
            e.stopPropagation();
            eliminarPregunta(q.uuid);
        };

        div.appendChild(fila);
    });
}


async function mourePreguntaAmunt(index){

    if(index===0) return;

    const aux = questions[index-1];
    questions[index-1] = questions[index];
    questions[index] = aux;

    await guardarOrdrePreguntes();
    pintarQuestions();
}


async function mourePreguntaAvall(index){

    if(index === questions.length-1) return;

    const aux = questions[index+1];
    questions[index+1] = questions[index];
    questions[index] = aux;

    await guardarOrdrePreguntes();
    pintarQuestions();
}


async function guardarOrdrePreguntes(){

    const updates = questions.map((q,index)=>{
        return {
            uuid:q.uuid,
            num_pregunta:index
        };
    });

    await upsertQuestionOrder(updates);
}


async function eliminarPregunta(uuid){
    if(!confirm("Segur que vols eliminar aquesta pregunta?")) return;
    await deleteQuestion(uuid);
    await loadQuestionsGestio();
}
