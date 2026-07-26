let injuries = [];
let physioEpisodes = [];
let physioVisits = [];
let injuriesUsers = [];
let injuriesShowing = [];

document
.getElementById("lesionsButton")
.addEventListener(
"click",
async()=>{

    await obrirLesionsFisio();

});


async function obrirLesionsFisio(){

    mostrarPantalla("lesions");

    await carregarLesions();

}

document
.getElementById("tornarFisioButton")
.addEventListener(
"click",
()=>{

    mostrarPantalla("fisio");

});


document
.getElementById("fisioButton")
.addEventListener(
"click",
()=>{

    mostrarPantalla("fisio");

});


async function carregarLesions(){

    injuries =
    await getAllInjuries();


    const userUuids =
    injuries.map(
        i => i.user_uuid
    );


    injuriesUsers =
    await getAllUsers(
        userUuids
    );


    injuries.forEach(lesio=>{


        lesio.user =
        injuriesUsers.find(
            u => u.uuid === lesio.user_uuid
        );


        lesio.showText =
        (lesio.user?.name ?? "")
        +
        " "
        +
        (lesio.user?.surname ?? "")
        +
        " - "
        +
        lesio.data_lesio;


    });


    injuriesShowing =
    injuries;


    pintarLesions();

}

document
.getElementById("visitesButton")
.addEventListener(
"click",
async()=>{

    await obrirVisitesFisio();

});

document
.getElementById("tornarFisioVisitesButton")
.addEventListener(
"click",
()=>{

    mostrarPantalla("fisio");

});

function pintarLesions(){


    const div =
    document.getElementById(
        "llistaLesions"
    );


    div.innerHTML = "";


    injuriesShowing.forEach(lesio=>{


        const fila =
        document.createElement("div");


        fila.className =
        "jugadorFila";


        fila.textContent =
        lesio.showText;


        if(lesio.demana_fisio > 0){

            fila.style.background =
            "#ffdddd";

        }


        fila.onclick = ()=>{

            mostrarDetallLesio(lesio);

        };


        div.appendChild(fila);


    });

}


function mostrarDetallLesio(lesio){


    document
    .getElementById("dialogTitle")
    .textContent =
    lesio.showText;



    let missatge =

    "Zona: "
    +
    lesio.zona
    +
    "\n\nTipus: "
    +
    lesio.tipus
    +
    "\n\nGravetat: "
    +
    lesio.gravetat;



    if(lesio.demana_fisio > 0){

        missatge +=
        "\n\nFISIO DEMANAT";

    }



    document
    .getElementById("dialogMessage")
    .textContent =
    missatge;



    const buttons =
    document.getElementById(
        "dialogButtons"
    );


    buttons.innerHTML = "";



    if(lesio.demana_fisio > 0){


        const boto =
        document.createElement("button");


        boto.textContent =
        "ASSIGNAR FISIO";


        boto.onclick = ()=>{


    document
    .getElementById("dialogOverlay")
    .style.display="none";


    obrirAssignarHora(
        lesio.uuid
    );





        };


        buttons.appendChild(boto);

    }



    const tancar =
    document.createElement("button");


    tancar.textContent =
    "TANCAR";


    tancar.onclick = ()=>{


        document
        .getElementById("dialogOverlay")
        .style.display="none";


    };


    buttons.appendChild(tancar);



    document
    .getElementById("dialogOverlay")
    .style.display="flex";


}