let preguntaEditant = null;

let opcionsPregunta = [];

let tipusPregunta = "ESCALA NUMÈRICA";


let minimPregunta = 0;

let maximPregunta = 10;



function obrirNovaPregunta(){


    preguntaEditant = {

        uuid:"",

        pregunta:"",

        tipus_pregunta:
        "ESCALA NUMÈRICA",

        opcions_resposta:""

    };


    opcionsPregunta=[];

    mostrarPantalla("addQuestion");

    pintarFormPregunta();

}




function obrirEditarPregunta(q){


    preguntaEditant = q;


    tipusPregunta =
    q.tipus_pregunta;


    if(tipusPregunta==="OPCIONS"){

        opcionsPregunta =
        q.opcions_resposta
        .split("//")
        .filter(x=>x);

    }


    if(tipusPregunta==="ESCALA NUMÈRICA"){

        const nums =
        q.opcions_resposta
        .split("//")
        .map(Number);


        minimPregunta =
        Math.min(...nums);


        maximPregunta =
        Math.max(...nums);

    }


    mostrarPantalla("addQuestion");


    pintarFormPregunta();

}



function pintarFormPregunta(){

    console.log("tipusPregunta =", `"${tipusPregunta}"`);

    document.getElementById("preguntaText").value =
        preguntaEditant.pregunta || "";

    document.getElementById("tipusPregunta").value =
        tipusPregunta;

    document.getElementById("minPregunta").value =
        minimPregunta;

    document.getElementById("maxPregunta").value =
        maximPregunta;

    // Mostrar/amagar segons el tipus
    const divEscala = document.getElementById("filaEscalaPregunta");
    const divOpcions = document.getElementById("configOpcions");

    divEscala.style.display =
        tipusPregunta === "ESCALA NUMÈRICA" ? "flex" : "none";

    divOpcions.style.display =
        tipusPregunta === "OPCIONS" ? "block" : "none";

    pintarOpcionsPregunta();
}


function canviarTipusPregunta(){

    tipusPregunta =
        document.getElementById("tipusPregunta").value;

    console.log("CANVI", `"${tipusPregunta}"`);

    pintarFormPregunta();

}



function afegirOpcioPregunta(){


    const input =
    document.getElementById(
        "novaOpcio"
    );


    if(!input.value)
        return;



    opcionsPregunta.push(
        input.value
    );


    input.value="";


    pintarOpcionsPregunta();

}





function eliminarOpcioPregunta(opcio){


    opcionsPregunta =
    opcionsPregunta.filter(
        x=>x!==opcio
    );


    pintarOpcionsPregunta();

}




function pintarOpcionsPregunta(){


    const div =
    document.getElementById(
        "llistaOpcions"
    );


    if(!div)
        return;


    div.innerHTML="";


    opcionsPregunta.forEach(
        op=>{


        const fila =
        document.createElement("div");


        fila.innerHTML=`

            ${op}

            <button>
                ✕
            </button>

        `;


        fila.querySelector("button")
        .onclick=()=>{

            eliminarOpcioPregunta(op);

        };


        div.appendChild(fila);


    });

}




async function guardarPregunta(){


    const text =
    document.getElementById(
        "preguntaText"
    ).value.trim();



    if(!text){

        alert(
            "Escriu una pregunta"
        );

        return;

    }



    let opcions="";



    if(tipusPregunta==="ESCALA NUMÈRICA"){


        let arr=[];


        for(
            let i=minimPregunta;
            i<=maximPregunta;
            i++
        ){

            arr.push(i);

        }


        opcions =
        arr.join("//");

    }



    if(tipusPregunta==="OPCIONS"){


        opcions =
        opcionsPregunta.join("//");

    }

const numeroPregunta = questions.length + 1;

    const data = {


        pregunta:text,
        num_pregunta: numeroPregunta,
        tipus_pregunta:
        tipusPregunta,

        opcions_resposta:
        opcions,


        questionari_uuid:
        questionariActual.uuid

    };



   if (preguntaEditant.uuid) {

    data.uuid = preguntaEditant.uuid;
    delete data.num_pregunta;
    await upsertQuestion(data);

} else {

    await addQuestion(data);

}

await loadQuestionsGestio();

    mostrarPantalla("questions");

}