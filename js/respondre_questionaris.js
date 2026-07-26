let questionariSeleccionat = null;



async function loadGestQuestionaris(){

    const qs =
        await getAllQuestionaris();


    const allQuestions =
        await getAllQuestions();



    questionaris =
    qs.map(q=>{


        q.questions =
        allQuestions.filter(
            x =>
            x.questionari_uuid === q.uuid
        );


        q.nQuestions =
        q.questions.length;


        return q;

    });


    pintarQuestionaris();

}



function pintarQuestionaris(){


    const div =
    document.getElementById(
        "llistaQuestionaris"
    );


    div.innerHTML="";


    questionaris.forEach(q=>{


        const fila =
        document.createElement("div");


        fila.className =
        "questionariFila";


        fila.innerHTML=`

        <div>

            <b>${q.name}</b>

            <br>

            ${q.nQuestions} preguntes

        </div>


        <button class="editar">
            ✎
        </button>


        <button class="enviar">
            ➤
        </button>


        <button class="eliminar">
            ✕
        </button>

        `;



        fila.querySelector(".editar")
        .onclick=()=>{


            questionariSeleccionat=q;

            obrirPreguntes(q);

        };



        fila.querySelector(".enviar")
        .onclick=()=>{


            questionariSeleccionat=q;

            obrirEnviar(q);

        };



        fila.querySelector(".eliminar")
        .onclick=()=>{


            eliminarQuestionari(q.uuid);

        };



        div.appendChild(fila);

    });

}



