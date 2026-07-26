let jugadorActualLesio = null;



function obrirAfegirLesio(user){

    jugadorActualLesio = user;


    document
    .getElementById("nomJugadorLesio")
    .textContent =
    capitalize(user.name)
    +
    " "
    +
    capitalize(user.surname);



    const avui = new Date();


    document
    .getElementById("dataLesio")
    .value =
    avui.toISOString()
    .substring(0,10);



    mostrarPantalla("afegirLesio");

}




document
.getElementById("afegirLesioButton")
.addEventListener(
"click",
guardarLesio
);



async function guardarLesio(){


    if(!jugadorActualLesio)
        return;



    const injury = {


        user_uuid:
        jugadorActualLesio.uuid,


        team_uuid:
        document
        .getElementById("selectorTeams")
        .value,


        data_lesio:
        document
        .getElementById("dataLesio")
        .value
        .split("-")
        .reverse()
        .join("-"),


        zona:
        document
        .getElementById("zonaLesio")
        .value,


        tipus:
        document
        .getElementById("tipusLesio")
        .value,


        gravetat:
        document
        .getElementById("gravetatLesio")
        .value,


        demana_fisio:
        document
        .getElementById("needsFisio")
        .checked ? 1 : 0

    };



    const createdInjury =
await insertInjury(injury);



if(
    injury.demana_fisio === 1 &&
    createdInjury.length > 0
){

    const episode =
    await insertPhysioEpisode({

        injury_uuid:
        createdInjury[0].uuid,

        closed: 0

    });



    await insertPhysioVisit({

        episode_uuid:
        episode[0].uuid,

        num_visit:1,

        last_visit:0,

        visita_feta:0

    });

}



mostrarPantalla("teams");


    await pickPlayers(
        document
        .getElementById("selectorTeams")
        .value
    );


}

