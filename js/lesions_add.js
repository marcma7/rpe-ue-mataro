let jugadorActualLesio = null;


function obrirAfegirLesio(user){

    jugadorActualLesio = user;

    document.getElementById("nomJugadorLesio").textContent = capitalize(user.name) + " " + capitalize(user.surname);

    const avui = new Date();
    document.getElementById("dataLesio").value = avui.toISOString().substring(0,10);

    mostrarPantalla("afegirLesio");
}


document.getElementById("afegirLesioButton").addEventListener("click", guardarLesio);


async function guardarLesio(){

    if(!jugadorActualLesio) return;

    const injury = {
        user_uuid: jugadorActualLesio.uuid,
        team_uuid: document.getElementById("selectorTeams").value,
        data_lesio: document.getElementById("dataLesio").value.split("-").reverse().join("-"),
        zona: document.getElementById("zonaLesio").value,
        tipus: document.getElementById("tipusLesio").value,
        gravetat: document.getElementById("gravetatLesio").value,
        demana_fisio: document.getElementById("needsFisio").checked ? 1 : 0
    };

    const createdInjury = await insertInjury(injury);
    
    if(injury.demana_fisio === 1 && createdInjury.length > 0){
        const episode = await insertPhysioEpisode({
            injury_uuid: createdInjury[0].uuid,
            closed: 0
        });

        await insertPhysioVisit({
            episode_uuid: episode[0].uuid,
            num_visit:1,
            last_visit:0,
            visita_feta:0
        });
    }

    mostrarPantalla("teams");

    await pickPlayers(document.getElementById("selectorTeams").value);
}



async function demanarFisioDesDeRPE(
    jugador,
    rpe,
    boto
) {

    if (!jugador || !rpe)
        return;


    // =================================================
    // COMPROVAR QUE REALMENT HI HA MOLÈSTIES
    // =================================================

    const teMolesties =
        rpe.te_molesties === true ||
        rpe.te_molesties === "true" ||
        rpe.te_molesties === 1 ||
        rpe.te_molesties === "1";


    if (
        !teMolesties ||
        !rpe.molesties
    ) {

        return;
    }


    // =================================================
    // CONFIRMACIÓ
    // =================================================

    const nomJugador =
        `${capitalize(jugador.name)} ${capitalize(jugador.surname)}`;


    const confirmar =
        confirm(
            `Demanar fisioteràpia per ${nomJugador}?`
        );


    if (!confirmar)
        return;


    // =================================================
    // BUSCAR EQUIP DEL JUGADOR
    // =================================================

    const userActualCode =
        obtenirCodeLocal();


    const userActual =
        await fetchUserByCode(
            userActualCode
        );


    if (!userActual) {

        alert(
            "No s'ha pogut identificar l'usuari."
        );

        return;
    }


    const userTeamsJugador =
        await getUserTeamByUserUuid(
            jugador.uuid
        );


    if (
        !userTeamsJugador ||
        userTeamsJugador.length === 0
    ) {

        alert(
            "Aquest jugador no està assignat a cap equip."
        );

        return;
    }


    let teamUuid = null;


    // =================================================
    // SUPERADMIN
    // =================================================

    if (
        userActual.role ===
        "SUPERADMIN"
    ) {

        teamUuid =
            userTeamsJugador[0].team_uuid;
    }


    // =================================================
    // ALTRES USUARIS
    // =================================================

    else {

        const userTeamsActual =
            await getUserTeamByUserUuid(
                userActual.uuid
            );


        const teamsActual =
            userTeamsActual.map(
                ut => ut.team_uuid
            );


        const mateixEquip =
            userTeamsJugador.find(
                ut =>
                    teamsActual.includes(
                        ut.team_uuid
                    )
            );


        if (!mateixEquip) {

            alert(
                "No s'ha pogut trobar l'equip del jugador."
            );

            return;
        }


        teamUuid =
            mateixEquip.team_uuid;
    }


    // =================================================
    // CREAR LESIÓ
    // =================================================

    const injury = {

        user_uuid:
            jugador.uuid,

        team_uuid:
            teamUuid,

        // rpe.date_practice ja està en dd-mm-yyyy
        data_lesio:
            rpe.date_practice,

        // TEXT ESCRIT PEL JUGADOR
        zona:
            rpe.molesties,

        tipus:
            "Molèstia",

        gravetat:
            "Lleu",

        demana_fisio:
            1
    };


    try {

        // ---------------------------------------------
        // INSERT INJURY
        // ---------------------------------------------

        const createdInjury =
            await insertInjury(
                injury
            );


        if (
            !createdInjury ||
            createdInjury.length === 0
        ) {

            alert(
                "No s'ha pogut crear la petició de fisioteràpia."
            );

            return;
        }


        // ---------------------------------------------
        // CREAR EPISODE
        // ---------------------------------------------

        const episode =
            await insertPhysioEpisode({

                injury_uuid:
                    createdInjury[0].uuid,

                closed:
                    0
            });


        if (
            !episode ||
            episode.length === 0
        ) {

            alert(
                "S'ha creat la molèstia però no l'episodi de fisioteràpia."
            );

            return;
        }


        // ---------------------------------------------
        // CREAR PRIMERA VISITA
        // ---------------------------------------------

        await insertPhysioVisit({

            episode_uuid:
                episode[0].uuid,

            num_visit:
                1,

            last_visit:
                0,

            visita_feta:
                0
        });


        // ---------------------------------------------
        // CANVIAR BOTÓ
        // ---------------------------------------------

        boto.innerHTML =
            "✓";

        boto.classList.add(
            "botoFisioDemanat"
        );

        boto.disabled =
            true;

        boto.title =
            "Fisioteràpia sol·licitada";


        alert(
            "S'ha sol·licitat fisioteràpia."
        );

    } catch (error) {

        console.error(
            "Error demanant fisioteràpia:",
            error
        );

        alert(
            "Hi ha hagut un error en sol·licitar fisioteràpia."
        );
    }
}