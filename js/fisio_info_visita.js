let visitaInfoActual = null;


// Carregar dades de la visita
function obrirInfoVisita(visita){

    // TANCAR TARGETA / DIALOG OBERT
    const dialog = document.getElementById("dialogOverlay");

    if(dialog) dialog.style.display = "none";
    
    visitaInfoActual = visita;

    document.getElementById("anamnesiVisita").value = visita.anamnesi ?? "";
    document.getElementById("feinaVisita").value = visita.feina_visita ?? "";
    document.getElementById("seguentsPassos").value = visita.seguents_passos ?? "";

    mostrarPantalla("infoVisita");
}


document.getElementById("programarSessioFisioButton").addEventListener("click", async()=>{
    await guardarVisitaFisio(false);
    obrirAssignarHora(visitaInfoActual.injury.uuid);
});

document.getElementById("tancarEpisodiFisioButton").addEventListener("click", async()=>{
    await guardarVisitaFisio(true);
    mostrarPantalla("visites");
});


async function guardarVisitaFisio(tancar){

    const comments = {
        uuid: visitaInfoActual.uuid,
        visita_feta: 1,
        last_visit: tancar ? 1 : 0,
        anamnesi: document.getElementById("anamnesiVisita").value || "-",
        feina_visita: document.getElementById("feinaVisita").value || "-",
        seguents_passos: document.getElementById("seguentsPassos").value || "-"
    };

    await addComments(comments);

    if(tancar){
        await closeEpisode({
            uuid: visitaInfoActual.episode_uuid
        });
    }else{
        await insertVisit({
            episode_uuid: visitaInfoActual.episode_uuid,
            num_visit: visitaInfoActual.num_visit + 1
        });
    }

    document.getElementById("pantallaInfoVisita").style.display="none";
    await obrirVisitesFisio();
}
