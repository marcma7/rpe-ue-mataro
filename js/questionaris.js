let questionaris = [];
let questions = [];
let respostes = {};

document.getElementById("nouQuestionariButton").onclick = obrirNouQuestionari;


function obrirNouQuestionari(){
    document.getElementById("nomQuestionari").value = "";
    document.getElementById("descripcioQuestionari").value = "";
    document.getElementById("nouQuestionariDialog").style.display = "flex";
}


document.getElementById("cancelNouQuestionariButton").onclick = ()=>{
    document.getElementById("nouQuestionariDialog").style.display = "none";
};

document.getElementById("confirmNouQuestionariButton").onclick = async ()=>{
    const nom = document.getElementById("nomQuestionari").value.trim();
    const descripcio = document.getElementById("descripcioQuestionari").value.trim();
    if(nom===""){
        alert("Introdueix un nom");
        return;
    }
    await addQuestionari({
        name: nom,
        description: descripcio
    });

    document.getElementById("nouQuestionariDialog").style.display = "none";
    await loadGestQuestionaris();
};


async function loadQuestionarisPendents(user, pendents) {

    questionaris = [...pendents];

    const quest = await getQuestionarisFromUuid(questionaris.map(x => x.questionari_uuid));

    for (const q of questionaris) {
        const info = quest.find(x => x.uuid === q.questionari_uuid);
        q.name = info.name;
        q.description = info.description;
    }

    await loadQuestions();
}


async function loadQuestions() {
    if (questionaris.length === 0) {
        const code = obtenirCodeLocal();
        const user = await fetchUserByCode(code);
        if (!user) {
            sortir();
            return;
        }
        if (user.role === "JUGADOR") {
            mostrarPantalla("rpe");
            await loadRPE(user);
            await acabarLoadRPE(user);
        } else {
            mostrarPantalla("management");
        }
        return;
    }

    questions = await getQuestionsFromQuestionari(questionaris[0].questionari_uuid);
    respostes = {};

    for (const q of questions) {
        respostes[q.uuid] = "";
    }

    pintarQuestionari();
}


function pintarQuestionari() {

    document.getElementById("questionariNom").textContent = questionaris[0].name;
    document.getElementById("questionariDescripcio").textContent = questionaris[0].description;
    
    const container = document.getElementById("questionsContainer");
    container.innerHTML = "";

    for (const q of questions) {
        const bloc = document.createElement("div");
        bloc.className = "questionBloc";
        const titol = document.createElement("h3");
        titol.textContent = q.pregunta;
        titol.className = "questionTitle";
        bloc.appendChild(titol);
        switch (q.tipus_pregunta) {
            case "ESCALA NUMÈRICA":
                crearEscala(bloc, q);
                break;
            case "OPCIONS":
                crearOpcions(bloc, q);
                break;
            default:
                crearTextLliure(bloc, q);
                break;
        }
        container.appendChild(bloc);
    }
}


function crearEscala(bloc, question) {

    const grid = document.createElement("div");
    grid.className = "escalaGrid";

    const numeros = question.opcions_resposta.split("//").filter(numero => numero.trim() !== "");

    for (const numero of numeros) {

        const boto = document.createElement("button");
        boto.textContent = numero;
        boto.addEventListener("click", () => {
            respostes[question.uuid] = numero;
            grid.querySelectorAll("button").forEach(b => b.classList.remove("selected"));
            boto.classList.add("selected");
        });
        grid.appendChild(boto);
    }
    bloc.appendChild(grid);
}


function crearOpcions(bloc, question) {

    const select = document.createElement("select");
    const buit = document.createElement("option");
    buit.value = "";
    buit.textContent = "Selecciona...";
    select.appendChild(buit);

    const opcions = question.opcions_resposta.split("//").filter(opcio => opcio.trim() !== "");

    for (const opcio of opcions) {
        const option = document.createElement("option");
        option.value = opcio;
        option.textContent = opcio;
        select.appendChild(option);
    }

    select.addEventListener("change", () => {
        respostes[question.uuid] = select.value;
    });

    bloc.appendChild(select);
}


function crearTextLliure(bloc, question) {

    const textarea = document.createElement("textarea");
    textarea.rows = 4;
    textarea.addEventListener("input", () => {
        respostes[question.uuid] =
            textarea.value;
    });
    bloc.appendChild(textarea);
}


function crearNumero(bloc, question) {

    const input = document.createElement("input");
    input.type = "text";
    input.inputMode = "numeric";
    input.placeholder = "Introdueix un valor";

    input.addEventListener("input", () => {
        respostes[question.uuid] = input.value;
    });

    bloc.appendChild(input);
}


async function confirmarQuestionari() {

    const answers = [];
    for (const questionId in respostes) {
        if (respostes[questionId] === "") {
            alert("Falta respondre algunes preguntes");
            return;
        }

        answers.push({
            questionari_user_uuid: questionaris[0].uuid,
            question_uuid: questionId,
            resposta: respostes[questionId]
        });
    }

    const avui = new Date();
    const dia = String(avui.getDate()).padStart(2, "0");
    const mes = String(avui.getMonth() + 1).padStart(2, "0");
    const any = avui.getFullYear();
    const dataResposta = `${dia}-${mes}-${any}`;
    
    await addQuestionariAnswers(answers);
    await setContestat({
        uuid: questionaris[0].uuid,
        user_uuid: questionaris[0].user_uuid,
        data_resposta: dataResposta,
        contestat: 1
    });
    questionaris.shift();
    await loadQuestions();
}


async function eliminarQuestionari(uuid){
    if(!confirm("Segur que vols eliminar aquest qüestionari?")) return;
    await deleteQuestionari(uuid);
    await loadGestQuestionaris();
}


let questionariEnviar = null;

function obrirEnviar(q){
    questionariEnviar = q;
    mostrarPantalla("enviarQuestionari");
    carregarUsuarisEnviar();
}
