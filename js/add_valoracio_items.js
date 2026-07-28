let itemEditant = null;

let opcionsItem = [];

let tipusItem = "ESCALA NUMÈRICA";

let minimItem = 0;

let maximItem = 10;

function obrirNouValoracioItem(){

    itemEditant = {

        uuid:"",

        item:"",

        tipus_item:"ESCALA NUMÈRICA",

        opcions_resposta:""

    };

    tipusItem = "ESCALA NUMÈRICA";

    opcionsItem = [];

    minimItem = 0;

    maximItem = 10;

    mostrarPantalla(
        "addValoracioItem"
    );

    pintarFormValoracioItem();

}


function obrirEditarValoracioItem(item){

    itemEditant = item;

    tipusItem = item.tipus_item;

    opcionsItem = [];

    if(tipusItem==="OPCIONS"){

        opcionsItem =
        item.opcions_resposta
        .split("//")
        .filter(x=>x);

    }

    if(tipusItem==="ESCALA NUMÈRICA"){

        const nums =
        item.opcions_resposta
        .split("//")
        .map(Number);

        minimItem =
        Math.min(...nums);

        maximItem =
        Math.max(...nums);

    }

    mostrarPantalla(
        "addValoracioItem"
    );

     // Mostrar/amagar segons el tipus
    const divEscala = document.getElementById("configEscalaValoracio");
    const divOpcions = document.getElementById("configOpcionsValoracio");

    divEscala.style.display =
        tipusItem === "ESCALA NUMÈRICA" ? "flex" : "none";

    divOpcions.style.display =
        tipusItem === "OPCIONS" ? "block" : "none";


    pintarFormValoracioItem();

}


function pintarFormValoracioItem(){

    document
    .getElementById("itemValoracioText")
    .value =
    itemEditant.item || "";

    document
    .getElementById("tipusItemValoracio")
    .value =
    tipusItem;

    document
    .getElementById("minItemValoracio")
    .value =
    minimItem;

    document
    .getElementById("maxItemValoracio")
    .value =
    maximItem;

    const divEscala =
document.getElementById(
    "configEscalaValoracio"
);

const divOpcions =
document.getElementById(
    "configOpcionsValoracio"
);


divEscala.style.display =
tipusItem==="ESCALA NUMÈRICA"
? "flex"
: "none";


divOpcions.style.display =
tipusItem==="OPCIONS"
? "block"
: "none";


    pintarOpcionsValoracio();

}


function canviarTipusValoracioItem(){

    tipusItem =
    document
    .getElementById(
        "tipusItemValoracio"
    ).value;

    pintarFormValoracioItem();

}


function afegirOpcioValoracio(){

    const input =
    document.getElementById(
        "novaOpcioValoracio"
    );

    if(!input.value)
        return;

    opcionsItem.push(
        input.value
    );

    input.value="";

    pintarOpcionsValoracio();

}


function eliminarOpcioValoracio(opcio){

    opcionsItem =
    opcionsItem.filter(
        x=>x!==opcio
    );

    pintarOpcionsValoracio();

}


function pintarOpcionsValoracio(){

    const div =
    document.getElementById(
        "llistaOpcionsValoracio"
    );

    div.innerHTML="";

    opcionsItem.forEach(op=>{

        div.innerHTML += `

<div class="questionFila">

    <div class="questionInfo">
        ${op}
    </div>


    <div class="questionButtons">

        <button
        onclick="eliminarOpcioValoracio('${op}')">

        ✕

        </button>

    </div>

</div>

`;

    });

}


async function guardarValoracioItem(){

    const text =
    document
    .getElementById(
        "itemValoracioText"
    )
    .value
    .trim();

    if(!text){

        alert(
            "Escriu un ítem"
        );

        return;

    }

    let opcions = "";

    if(tipusItem==="ESCALA NUMÈRICA"){

        let arr=[];

        for(
            let i=minimItem;
            i<=maximItem;
            i++
        ){

            arr.push(i);

        }

        opcions =
        arr.join("//");

    }

    if(tipusItem==="OPCIONS"){

        opcions =
        opcionsItem.join("//");

    }

    const data={

        item:text,

        tipus_item:tipusItem,

        opcions_resposta:opcions,

        valoracio_uuid:
        valoracioActualGestio.uuid

    };

    if(itemEditant.uuid){

        data.uuid =
        itemEditant.uuid;

        await updateValoracioItem(
            data
        );

    }else{

        data.num_item =
        valoracioItems.length;

        await addValoracioItem(
            data
        );

    }

    await loadValoracioItems();

    mostrarPantalla(
        "valoracioItems"
    );

}


document
.getElementById(
    "guardarItemValoracioButton"
)
.onclick =
guardarValoracioItem;

document
.getElementById(
    "tipusItemValoracio"
)
.onchange =
canviarTipusValoracioItem;

document
.getElementById(
    "afegirOpcioValoracioButton"
)
.onclick =
afegirOpcioValoracio;