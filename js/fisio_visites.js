let visitesFisio = [];

let visitesFisioMostrar = [];

let visitaSeleccionada = null;

document
.getElementById("dataVisitaFisio")
.addEventListener(
"change",
()=>{

    filtrarVisitesFisio();

});


 async function obrirVisitesFisio(){

    mostrarPantalla("visites");

    await carregarVisitesFisio();

}


async function carregarVisitesFisio(){


    visitesFisio =
    await getAllVisits();


    const episodes =
    await getEpisodesByUuid(
        visitesFisio.map(v=>v.episode_uuid)
    );


    const injuries =
    await getInjuriesByUuid(
        episodes.map(e=>e.injury_uuid)
    );


    const users =
    await getAllUsers(
        [...new Set(
            injuries.map(i=>i.user_uuid)
        )]
    );


    const teams =
    await getAllTeams();



    visitesFisio.sort(
        (a,b)=>
        (a.hour ?? "")
        .localeCompare(
            b.hour ?? ""
        )
    );



    visitesFisio.forEach(v=>{


        const ep =
        episodes.find(
            e=>e.uuid===v.episode_uuid
        );


        const inj =
        injuries.find(
            i=>i.uuid===ep?.injury_uuid
        );


        const user =
        users.find(
            u=>u.uuid===inj?.user_uuid
        );


        const team =
        teams.find(
            t=>t.uuid===inj?.team_uuid
        );



        v.user=user;
        v.injury=inj;
        v.team=team;



        v.text =

        (v.hour ?? "")
        +
        " "
        +
        (user?.name ?? "")
        +
        " "
        +
        (user?.surname ?? "")
        +
        "\n\nEquip: "
        +
        (team?.team_name ?? "-")
        +
        "\nData lesió: "
        +
        (inj?.data_lesio ?? "");


    });



    const avui =
    new Date();


    document
    .getElementById(
        "dataVisitaFisio"
    )
    .value =
    avui.toISOString()
    .substring(0,10);



    filtrarVisitesFisio();


}



function filtrarVisitesFisio(){


    const input =
    document.getElementById(
        "dataVisitaFisio"
    );


    const data =
    input.value
    .split("-")
    .reverse()
    .join("-");



    visitesFisioMostrar =
    visitesFisio.filter(
        v=>v.date===data
    );


    pintarVisitesFisio();


}



function pintarVisitesFisio(){


    const div =
    document.getElementById(
        "llistaVisitesFisio"
    );


    div.innerHTML="";



    visitesFisioMostrar.forEach(visita=>{


        const fila =
        document.createElement("div");


        fila.className =
        "jugadorFila";


        fila.textContent =
        visita.text;



        if(visita.visita_feta===1){

            fila.style.background =
            "#ddffdd";

        }



        fila.onclick=()=>{


            mostrarDetallVisitaFisio(
                visita
            );


        };



        div.appendChild(fila);


    });


}


function mostrarDetallVisitaFisio(visita){


    document
    .getElementById("dialogTitle")
    .textContent =
    visita.user?.name
    +
    " "
    +
    visita.user?.surname;



    document
    .getElementById("dialogMessage")
    .textContent =
    visita.text;



    const buttons =
    document.getElementById(
        "dialogButtons"
    );


    buttons.innerHTML="";



    const introduir =
    document.createElement("button");


    introduir.textContent =
    "INTRODUIR VISITA";


introduir.onclick=()=>{

    document
    .getElementById("dialogOverlay")
    .style.display="none";


    visitaSeleccionada = visita;

    obrirInfoVisita(visita);

};


    buttons.appendChild(
        introduir
    );



    const tancar =
    document.createElement("button");


    tancar.textContent =
    "TANCAR";


    tancar.onclick=()=>{


        document
        .getElementById(
            "dialogOverlay"
        )
        .style.display="none";


    };


    buttons.appendChild(tancar);



    document
    .getElementById(
        "dialogOverlay"
    )
    .style.display="flex";


}