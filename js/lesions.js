let jugadorLesioActual = null;


function obrirAfegirLesio(user){

    jugadorLesioActual = user;


    document
    .getElementById("nomJugadorLesio")
    .textContent =
        capitalize(user.name)
        +" "
        +
        capitalize(user.surname);


    const avui =
    new Date()
    .toISOString()
    .substring(0,10);


    document
    .getElementById("dataLesio")
    .value = avui;


    mostrarPantalla("afegirLesio");

}



document
.getElementById("afegirLesioButton")
.addEventListener(
"click",
async ()=>{


    if(!jugadorLesioActual)
        return;


    const injury = {


        user_uuid:
        jugadorLesioActual.uuid,


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


        needs_fisio:
        document
        .getElementById("needsFisio")
        .checked
        ?
        1
        :
        0

    };


    await insertInjury(injury);


    mostrarPantalla("teams");


    await pickPlayers(
        document
        .getElementById("selectorTeams")
        .value
    );


});