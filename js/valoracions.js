let equipValoracio = null;


async function obrirValoracio(
    valoracioUuid,
    userUuid
){

    jugadorValoracio =
        await getUser(userUuid);


    if(!jugadorValoracio){

        alert(
            "No s'ha trobat el jugador"
        );

        return;
    }


    valoracioActual =
        await getValoracio(
            valoracioUuid
        );


    valoracioItems =
        await getValoracioItems(
            valoracioUuid
        );


    valoracioItems.sort(
        (a,b)=>
        a.num_item-b.num_item
    );


    respostesValoracio = {};


    mostrarPantalla(
        "passValoracio"
    );


    pintarValoracio();

}



function pintarValoracio(){


    document
    .getElementById("valoracioTitol")
    .textContent =
    valoracioActual.name;


    document
    .getElementById("valoracioDescripcio")
    .textContent =
    valoracioActual.description;


    document
    .getElementById("valoracioJugador")
    .textContent =
    `${jugadorValoracio.name} ${jugadorValoracio.surname}`;


    const container =
    document.getElementById(
        "itemsValoracio"
    );

      container.className = "questionBloc";


    container.innerHTML="";


    valoracioItems.forEach(item=>{


        switch(item.tipus_item){


            case "ESCALA NUMÈRICA":

                container.innerHTML +=
                crearEscala(container,item);

                break;


            case "OPCIONS":

                container.innerHTML +=
                crearOpcions(container,item);

                break;


            case "NÚMERO LLIURE":

                container.innerHTML +=
                crearNumero(container,item);

                break;


            default:

                container.innerHTML +=
                crearText(container,item);

        }


    });


}



async function enviarValoracio(){


    for(const item of valoracioItems){


        if(
            respostesValoracio[item.uuid] === undefined ||
            respostesValoracio[item.uuid] === ""
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
    `${String(avui.getDate()).padStart(2,"0")}-${String(avui.getMonth()+1).padStart(2,"0")}-${avui.getFullYear()}`;



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


    alert(
        "VALORACIÓ PASSADA"
    );


    if(equipValoracio){

        await carregarDadesEquip(
            equipValoracio
        );


        mostrarPantalla(
            "dades"
        );


    }else{


        mostrarPantalla(
            "gestioValoracions"
        );


    }

}



document
.getElementById(
"confirmarValoracioButton"
)
.onclick =
enviarValoracio;



function guardarResposta(
    uuid,
    valor
){

    respostesValoracio[uuid]=valor;

}



function seleccionarResposta(
    uuid,
    valor,
    boto
){

    respostesValoracio[uuid]=valor;


    boto.parentElement
    .querySelectorAll("button")
    .forEach(b=>{

        b.style.background="";
        b.style.color="";

    });


    boto.style.background="#006400";
    boto.style.color="white";

}