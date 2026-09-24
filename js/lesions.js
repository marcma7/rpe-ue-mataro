let jugadorLesioActual = null;


document.getElementById("afegirLesioButton").addEventListener("click", async ()=>{
    if(!jugadorLesioActual) return;
    const injury = {
        user_uuid: jugadorLesioActual.uuid,
        team_uuid: document.getElementById("selectorTeams").value,
        data_lesio: document.getElementById("dataLesio").value.split("-").reverse().join("-"),
        zona: document.getElementById("zonaLesio").value,
        tipus: document.getElementById("tipusLesio").value,
        gravetat: document.getElementById("gravetatLesio").value,
        demana_fisio: document.getElementById("needsFisio").checked ? 1 : 0
    };

    await insertInjury(injury);
    mostrarPantalla("teams");
    await pickPlayers(document.getElementById("selectorTeams").value);
});
