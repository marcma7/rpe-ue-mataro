let injuries = [];
let physioEpisodes = [];
let physioVisits = [];
let injuriesUsers = [];
let injuriesShowing = [];

document.getElementById("lesionsButton").addEventListener("click", async()=>{
    await obrirLesionsFisio();
});


async function obrirLesionsFisio(){
    mostrarPantalla("lesions");
    await carregarLesions();
}

document.getElementById("tornarFisioButton").addEventListener("click", ()=>{
    mostrarPantalla("fisio");
});

document.getElementById("enrereFisio").addEventListener("click", ()=>{
    mostrarPantalla("management");
});

document.getElementById("fisioButton").addEventListener("click", ()=>{
    mostrarPantalla("fisio");
});


async function carregarLesions(){

    injuries = await getAllInjuries();
    const userUuids = injuries.map(i => i.user_uuid);
    injuriesUsers = await getAllUsers(userUuids);

    // Buscar episodis de totes les lesions
    const injuryUuids = injuries.map(i => i.uuid);
    physioEpisodes = await getEpisodesByInjury(injuryUuids);

    // Buscar visites de tots els episodis
    const episodeUuids = physioEpisodes.map(e => e.uuid);
    physioVisits = await getVisitsByEpisodes(episodeUuids);

    injuries.forEach(lesio=>{
        lesio.user = injuriesUsers.find(u => u.uuid === lesio.user_uuid);

        // Episodi d'aquesta lesió
        lesio.episode = physioEpisodes.find(e => e.injury_uuid === lesio.uuid);

        // Totes les visites d'aquest episodi
        lesio.visites = physioVisits.filter(v => v.episode_uuid === lesio.episode?.uuid);

        // Comprovar si té hora assignada
        const visitaAmbHora = lesio.visites.find(v => v.date != null && v.hour != null);
    
        if(visitaAmbHora) lesio.te_hora = 1;
        else lesio.te_hora = 0;

        const visitaFeta = lesio.visites.find(v => v.visita_feta = 1);
        
        if(visitaFeta) lesio.visites_fetes = 1;
        else lesio.visites_fetes = 0;
        lesio.showText = (lesio.user?.name ?? "") + " " + (lesio.user?.surname ?? "") + " - " + lesio.data_lesio;
    });

    injuriesShowing = injuries;
    pintarLesions();
}


document.getElementById("visitesButton").addEventListener("click", async()=>{
    await obrirVisitesFisio();
});

document.getElementById("tornarFisioVisitesButton").addEventListener("click", ()=>{
    mostrarPantalla("fisio");
});


function pintarLesions(){

    const div = document.getElementById("llistaLesions");
    div.innerHTML = "";

    injuriesShowing.forEach(lesio=>{
        const fila = document.createElement("div");
        fila.className = "lesioFila";
        fila.innerHTML = `
            <b>${capitalize(lesio.user?.name ?? "")} ${capitalize(lesio.user?.surname ?? "")}</b>
            <br>
            ${lesio.data_lesio ?? "-"} &nbsp; | &nbsp; ${lesio.zona ?? "-"} &nbsp; | &nbsp; ${lesio.tipus ?? "-"}
            <br>    
            Gravetat: ${lesio.gravetat ?? "-"}
            <br>
            ${lesio.te_hora === 1 ? 
              "🟢 Hora: " + (lesio.visites.find(v => v.date && v.hour)?.date ?? "") + " " + (lesio.visites.find(v => v.date && v.hour)?.hour ?? "")
            :
              "🔴 Pendent d'assignar hora"
            }
        `;

        if(lesio.demana_fisio > 0) fila.style.background = "#ffdddd";

        fila.className = "lesioFila";
        fila.onclick = ()=>{ 
            mostrarDetallLesio(lesio);
        };
        div.appendChild(fila);
    });
}


function mostrarDetallLesio(lesio){

    document.getElementById("dialogTitle").textContent = lesio.showText;
    let missatge = "Data lesió: " + lesio.data_lesio + "\n\n" + "Zona: " + lesio.zona + "  |  " + "Tipus: " + lesio.tipus + "  |  " + "Gravetat: " + lesio.gravetat;
    
    if(lesio.demana_fisio > 0) missatge += "\n\nFISIO SOL·LICITAT";
    else missatge += "\n\nNo necessita fisio";

    document.getElementById("dialogMessage").textContent = missatge;
    const buttons = document.getElementById("dialogButtons");
    buttons.innerHTML = "";
    buttons.style.display = "flex";
    buttons.style.flexDirection = "row";
    buttons.style.gap = "10px";
    buttons.innerHTML = "";

    if(lesio.demana_fisio > 0){
        const boto = document.createElement("button");
        boto.textContent = "ASSIGNAR HORA";
        boto.style.flex = "1";
        boto.onclick = ()=>{
            document.getElementById("dialogOverlay").style.display="none";
            obrirAssignarHora(lesio.uuid);
        };
        buttons.appendChild(boto);
    }

    const tancar = document.createElement("button");
    tancar.textContent = "ENRERE";
    tancar.style.flex = "1";
    tancar.onclick = ()=>{
        document.getElementById("dialogOverlay").style.display="none";
    };

    buttons.appendChild(tancar);

    document.getElementById("dialogOverlay").style.display="flex";
}


document.getElementById("filtreLesions").addEventListener("change", ()=>{
    filtrarLesions();
});


function filtrarLesions(){
    const filtre = document.getElementById("filtreLesions").value;
    if(filtre === "Totes") injuriesShowing = injuries;
    else if(filtre === "Sense fisio") injuriesShowing = injuries.filter(l => l.demana_fisio == 0);
    else if(filtre === "Pendent de donar hora") injuriesShowing = injuries.filter(l => l.demana_fisio > 0 && l.te_hora == 0);
    else if(filtre === "Hora donada") injuriesShowing = injuries.filter(l => l.te_hora == 1);
    else if(filtre === "Visita feta") injuriesShowing = injuries.filter(l => l.visita_feta);
    
    pintarLesions();
}
