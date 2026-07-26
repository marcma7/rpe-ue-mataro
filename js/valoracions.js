equipValoracio = ""

function pintarValoracio(){


document.getElementById("valoracioTitol")
.textContent =
valoracioActual.name;



document.getElementById("valoracioDescripcio")
.textContent =
valoracioActual.description;



document.getElementById("valoracioJugador")
.textContent =
jugadorValoracio.name+
" "+
jugadorValoracio.surname;



const container =
document.getElementById(
"itemsValoracio"
);


container.innerHTML="";



valoracioItems.forEach(item=>{


let html="";


switch(item.tipus_item){


case "ESCALA NUMÈRICA":

html =
crearEscala(item);

break;



case "OPCIONS":

html =
crearOpcions(item);

break;



case "NÚMERO LLIURE":

html =
crearNumero(item);

break;



default:

html =
crearText(item);

}



container.innerHTML += html;


});


}


async function enviarValoracio(){


for(const item of valoracioItems){


    if(
        !respostesValoracio[item.uuid]
    ){

        alert(
        "Falta respondre algunes preguntes"
        );

        return;

    }


}



const avui =
new Date();


const data =
String(avui.getDate()).padStart(2,"0")
+
"-"
+
String(avui.getMonth()+1).padStart(2,"0")
+
"-"
+
avui.getFullYear();



const answers =
valoracioItems.map(item=>({


    user_uuid:
    jugadorValoracio.uuid,


    valoracio_item_uuid:
    item.uuid,


    date:
    data,


    resposta:
    respostesValoracio[item.uuid]


}));



await addValoracioAnswers(
    answers
);


alert("VALORACIÓ PASSADA");


if(equipValoracio){

    await carregarDadesEquip(equipValoracio);
    mostrarPantalla("dades");

}else{

    mostrarPantalla("gestioValoracions");

}


}


document
.getElementById(
"confirmarValoracioButton"
)
.addEventListener(
"click",
async()=>{

await enviarValoracio();

});


async function obrirSelectorValoracions(){

    document
    .getElementById("playerCard")
    .style.display="none";


    mostrarPantalla(
        "seleccionValoracio"
    );


    valoracionsDisponibles =
        await getAllValoracions();


    const div =
    document.getElementById(
        "llistaValoracions"
    );


    div.innerHTML="";


    valoracionsDisponibles.forEach(v=>{


        const b =
        document.createElement("button");


        b.textContent =
        v.name;


        b.onclick=()=>{


            obrirValoracio(
                v.uuid,
                jugadorActual.uuid
            );


        };


        div.appendChild(b);


    });


}


async function obrirValoracio(
    valoracioUuid,
    userUuid
){


    jugadorValoracio =
    await getUser(userUuid);

if(!jugadorValoracio){
    alert("No s'ha trobat el jugador");
    return;
}



    valoracioActual =
        await getValoracio(valoracioUuid);



    valoracioItems =
        await getValoracioItems(valoracioUuid);



    respostesValoracio={};



    mostrarPantalla(
        "passValoracio"
    );


    pintarValoracio();


}






function crearNumero(item){

    return `

    <div class="valoracioItem">

        <h3>
        ${item.item}
        </h3>


        <input

        type="number"

        step="0.1"

        oninput="
        guardarResposta(
            '${item.uuid}',
            this.value
        )">

    </div>

    `;

}




function crearText(item){


    return `

    <div class="valoracioItem">


        <h3>
        ${item.item}
        </h3>


        <textarea

        oninput="
        guardarResposta(
            '${item.uuid}',
            this.value
        )">

        </textarea>


    </div>


    `;


}




function guardarResposta(uuid,valor){

    respostesValoracio[uuid]=valor;

}




function seleccionarResposta(uuid,valor,boto){


    respostesValoracio[uuid]=valor;


    const botons =
        boto.parentElement
        .querySelectorAll("button");


    botons.forEach(b=>{

        b.style.background="";

    });


    boto.style.background="#006400";
    boto.style.color="white";

}