let equipValoracio = null;
let equipValoracioOrigen = null;


async function obrirValoracio(valoracioUuid, userUuid, teamUuid = null){
    equipValoracioOrigen = teamUuid;
    jugadorValoracio = await getUser(userUuid);
    if(!jugadorValoracio){
        alert("No s'ha trobat el jugador");
        return;
    }

    valoracioActual = await getValoracio(valoracioUuid);
    valoracioItems = await getValoracioItems(valoracioUuid);
    valoracioItems.sort((a,b) => a.num_item-b.num_item);

    respostesValoracio = {};
    respostes = respostesValoracio;
    mostrarPantalla("passValoracio");
    pintarValoracio();
}


function pintarValoracio(){

    document.getElementById("valoracioTitol").textContent = valoracioActual.name;
    document.getElementById("valoracioDescripcio").textContent = valoracioActual.description;
    document.getElementById("valoracioJugador").textContent = `${jugadorValoracio.name} ${jugadorValoracio.surname}`;

    const container = document.getElementById("itemsValoracio");

    container.className = "";
    container.innerHTML = "";

    valoracioItems.forEach(item => {
        const bloc = document.createElement("div");
        bloc.className = "questionBloc";

        const titol = document.createElement("h3");
        titol.textContent = item.item;

        bloc.appendChild(titol);

        switch(item.tipus_item){

            case "ESCALA NUMÈRICA":
                crearEscala(bloc,item);
                break;

            case "OPCIONS":
                crearOpcions(bloc,item);
                break;

            case "NÚMERO LLIURE":
                crearNumero(bloc,item);
                break;

            default:
                crearTextLliure(bloc,item);
        }

        container.appendChild(bloc);
    });
}


async function enviarValoracio(){
    for(const item of valoracioItems){
        if(respostesValoracio[item.uuid] === undefined || respostesValoracio[item.uuid] === ""){
            alert("Falta respondre algunes preguntes");
            return;
        }
    }

    const avui = new Date();
    const data = `${String(avui.getDate()).padStart(2,"0")}-${String(avui.getMonth()+1).padStart(2,"0")}-${avui.getFullYear()}`;
    const answers = valoracioItems.map(item=>({
        user_uuid: jugadorValoracio.uuid,
        valoracio_item_uuid: item.uuid,
        date: data,
        resposta: respostesValoracio[item.uuid]
    }));

    await addValoracioAnswers(answers);
    alert("VALORACIÓ PASSADA");
    if(equipValoracio){
        await carregarDadesEquip(equipValoracio);
        mostrarPantalla("dades");
    }else if(equipValoracioOrigen){
        mostrarPantalla("teams");
    }else{
        mostrarPantalla("gestioValoracions");
    }
}


document.getElementById("confirmarValoracioButton").onclick = enviarValoracio;


function guardarResposta(uuid, valor){
    respostesValoracio[uuid]=valor;
}


function seleccionarResposta(uuid, valor, boto){
    respostesValoracio[uuid]=valor;
    boto.parentElement.querySelectorAll("button").forEach(b=>{
        b.style.background="";
        b.style.color="";
    });

    boto.style.background="#006400";
    boto.style.color="white";
}
