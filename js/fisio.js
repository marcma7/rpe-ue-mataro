let injuries = [];
let physioEpisodes = [];
let physioVisits = [];
let injuriesUsers = [];
let injuriesShowing = [];

document.getElementById("lesionsButton").addEventListener("click", async()=>{
    await obrirLesionsFisio();
});


async function obrirLesionsFisio(){
    document.getElementById("filtreLesions").value = "Totes";
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

    // -----------------------------------------
    // FILTRE DE PERMISOS
    // -----------------------------------------

    const visibleUserUuids = await getUserUuidsVisibleInjuries();

    // SUPERADMIN -> totes
    if (visibleUserUuids !== null) {
        injuries = injuries.filter(i =>
            visibleUserUuids.includes(i.user_uuid)
        );
    }

    // -----------------------------------------
    // USUARIS DE LESIONS
    // -----------------------------------------

    const userUuids = [
        ...new Set(injuries.map(i => i.user_uuid))
    ];

    injuriesUsers = await getAllUsers(userUuids);

    // -----------------------------------------
    // EPISODIS
    // -----------------------------------------

    const injuryUuids = injuries.map(i => i.uuid);

    physioEpisodes = await getEpisodesByInjury(injuryUuids);

    // -----------------------------------------
    // VISITES
    // -----------------------------------------

    const episodeUuids = physioEpisodes.map(e => e.uuid);

    physioVisits = await getVisitsByEpisodes(episodeUuids);

    // -----------------------------------------
    // PREPARAR LESIONS
    // -----------------------------------------

    injuries.forEach(lesio => {

        lesio.user = injuriesUsers.find(
            u => u.uuid === lesio.user_uuid
        );

        lesio.episode = physioEpisodes.find(
            e => e.injury_uuid === lesio.uuid
        );

        lesio.visites = physioVisits.filter(
            v => v.episode_uuid === lesio.episode?.uuid
        );

        if(lesio.visites.length > 0) {

            lesio.te_hora =
                lesio.visites.filter(
                    v => v.date != null && v.hour != null
                ).length;

            lesio.visites_fetes =
                lesio.visites.filter(
                    v => v.visita_feta == 1
                ).length;
        }

        lesio.showText =
            (lesio.user?.name ?? "") +
            " " +
            (lesio.user?.surname ?? "") +
            " - " +
            lesio.data_lesio;
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
        const ultimaVisita = [...lesio.visites].reverse().find(v => v.date && v.hour);

        const fila = document.createElement("div");
        fila.className = "lesioFila";
        fila.innerHTML = `
            <b>${capitalize(lesio.user?.name ?? "")} ${capitalize(lesio.user?.surname ?? "")}</b>
            <br>
            ${lesio.data_lesio ?? "-"} &nbsp; | &nbsp; ${lesio.zona ?? "-"} &nbsp; | &nbsp; ${lesio.tipus ?? "-"}
            <br>    
            Gravetat: ${lesio.gravetat ?? "-"}
            <br>
            ${lesio.demana_fisio > 0 ? (lesio.te_hora > 0 ?
              "🟢 Hora: " + (ultimaVisita?.date ?? "") + " " + (ultimaVisita ?.hour ?? "")
            :
              "🔴 Pendent d'assignar hora"
            ) : "No necessita fisio"
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
    else if(filtre === "Sense hora de fisio") injuriesShowing = injuries.filter(l => l.demana_fisio > 0 && l.te_hora == 0);
    else if(filtre === "Pendent de primera visita") injuriesShowing = injuries.filter(l => l.demana_fisio > 0 && l.te_hora > 0 && l.visites_fetes == 0);
    else if(filtre === "En tractament") injuriesShowing = injuries.filter(l => l.demana_fisio > 0 && l.te_hora > 0 && l.visites_fetes > 0 && l.te_hora > l.visites_fetes);
    else if(filtre === "Tancades") injuriesShowing = injuries.filter(l => l.demana_fisio == 0 || l.te_hora == l.visites_fetes);
    
    pintarLesions();
}



async function getUserUuidsVisibleInjuries() {

    const role = obtenirRoleLocal();
    const userUuid = obtenirUserUuidLocal();

    // SUPERADMIN -> pot veure totes les lesions
    if (role === "SUPERADMIN") {
        return null;
    }

    if (!userUuid) {
        return [];
    }

    // Equips als quals pertany l'usuari de l'app
    const myUserTeams = await getUserTeamByUserUuid(userUuid);

    if (myUserTeams.length === 0) {
        return [];
    }

    const myTeamUuids = [
        ...new Set(myUserTeams.map(ut => ut.team_uuid))
    ];

    // Tots els user_teams de tots els equips on
    // pertany l'usuari de l'app
    const allUserTeams = await getAllUserTeams();

    const visibleUserUuids = [
        ...new Set(
            allUserTeams
                .filter(ut => myTeamUuids.includes(ut.team_uuid))
                .map(ut => ut.user_uuid)
        )
    ];

    return visibleUserUuids;
}