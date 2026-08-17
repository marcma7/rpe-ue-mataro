let userTeamsEquipGlobal = [];
let teamActual = null;
let teamJugadors = [];
let teamDates = [];
let teamDataSeleccionada = "";
let teamJugadorSeleccionat = null;

let teamRpes = [];
let teamPTPT = [];

let venimDeRpeTeam = false;


async function loadRPETeam(user) {

    teamActual = null;
    teamJugadors = [];
    teamDates = [];
    teamRpes = [];
    teamPTPT = [];
    teamJugadorSeleccionat = null;

    const userTeams = await getUserTeamByUserUuid(user.uuid);
    if (userTeams.length === 0) {
        alert("Aquest usuari no està assignat a cap equip.");
        mostrarPantalla("login");
        return;
    }

    teamActual = userTeams[0];
    const teamUuid = teamActual.team_uuid;

    const userTeamsEquip = await getPlayersByTeam(teamUuid);
    userTeamsEquipGlobal = userTeamsEquip;
    const userUuids = [...new Set(userTeamsEquip.map(x => x.user_uuid))];
    const users = await getUsersByUserTeam(userUuids);
    teamJugadors = users.filter(u => u.role === "JUGADOR");
    
    const practices = await getPracticesByTeam(teamUuid);
    const avui = new Date();
    avui.setHours(0, 0, 0, 0);

    teamDates = [...new Set(practices.filter(p => 
        {
            const parts = p.practice_date.split("-");
            const data = new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]));
            data.setHours(0, 0, 0, 0);
            return data <= avui;
        }).map(p => p.practice_date)
    )];

    teamDates.sort((a, b) => sortKey(b).localeCompare(sortKey(a)));

    const jugadorUuids = teamJugadors.map(j => j.uuid);
    teamRpes = await getRPEByUsers(jugadorUuids);

    const playerTeamUuids = userTeamsEquip.filter(ut => jugadorUuids.includes(ut.user_uuid)).map(ut => ut.uuid);
    teamPTPT = await getPTPTByUserTeamUuids(playerTeamUuids);
    
    actualitzarDatesRpeTeam();
    if (teamDates.length === 0) {
        document.getElementById("selectorDataRpeTeam").innerHTML = "";
        document.getElementById("llistaJugadorsRpeTeam").innerHTML = "<p>No hi ha sessions pendents.</p>";
        return;
    }

    teamDataSeleccionada = teamDates[0];
    omplirSelectorDatesRpeTeam();
    pintarJugadorsRpeTeam();
}


function omplirSelectorDatesRpeTeam() {

    const selector = document.getElementById("selectorDataRpeTeam");
    selector.innerHTML = "";

    for (const data of teamDates) {
        const option = document.createElement("option");
        option.value = data;
        option.textContent = data;
        selector.appendChild(option);
    }

    selector.value = teamDataSeleccionada;
}


document.getElementById("selectorDataRpeTeam").addEventListener("change", async function () {
    teamDataSeleccionada = this.value;
    pintarJugadorsRpeTeam();
});


function pintarJugadorsRpeTeam() {

    const div = document.getElementById("llistaJugadorsRpeTeam");
    div.innerHTML = "";

    for (const jugador of teamJugadors) {

        const fila = document.createElement("div");
        fila.className = "jugadorRpeTeamFila";

        const nom = `${capitalize(jugador.name)} ${capitalize(jugador.surname)}`;

        // BOTÓ NO HA VINGUT
        const botoNoVingut = document.createElement("button");
        botoNoVingut.className = "jugadorNoVingutButton";
        botoNoVingut.textContent = "✕";
        botoNoVingut.title = "No ha vingut";

        botoNoVingut.addEventListener("click", async () => {
            await marcarJugadorNoVingut(jugador);
        });


        // BOTÓ RPE
        const boto = document.createElement("button");
        boto.className = "jugadorRpeTeamButton";
        boto.textContent = "RPE";

        const rpe = teamRpes.find(r =>
            r.player_uuid === jugador.uuid &&
            r.date_practice === teamDataSeleccionada
        );

        if (rpe) {
            boto.textContent = rpe.register;
            pintarColorRPE(boto, rpe.register);
        } else {
            boto.textContent = "RPE";
            boto.classList.add("rpeTeamButtonPendent");
        }

        boto.addEventListener("click", () => {
            obrirRPEJugadorTeam(jugador);
        });


        // NOM
        const nomElement = document.createElement("span");
        nomElement.textContent = nom;


        // ORDRE: NOM | NO HA VINGUT | RPE
        fila.appendChild(nomElement);
        fila.appendChild(botoNoVingut);
        fila.appendChild(boto);

        div.appendChild(fila);
    }
}


function obrirRPEJugadorTeam(jugador) {
    teamJugadorSeleccionat = jugador;
    venimDeRpeTeam = true;
    selectedRPE = -1;
    netejarMolestiesRPE();
    document.querySelectorAll(".rpeButton").forEach(b => {
        b.classList.remove("rpeSelected");
    });

    const selector = document.getElementById("selectorData");

    selector.innerHTML = "";

    const option = document.createElement("option");
    option.value = teamDataSeleccionada;
    option.textContent = teamDataSeleccionada;

    selector.appendChild(option);

    selector.value = teamDataSeleccionada;

    isFinished = false;

    actualitzarEstatRPE();

    document.getElementById("sortirButtonRPE").style.display = "none";

    mostrarPantalla("rpe");
}


async function confirmarRPETeam() {
    const jugador = teamJugadorSeleccionat;
    if (!jugador) return;

    const userTeam = await getUserTeamByTeamUuidAndUserUuid(teamActual.team_uuid, jugador.uuid);
    if (userTeam.length === 0) {
        alert("Aquest jugador no està assignat a l'equip.");
        return;
    }

    const userTeamUuid = userTeam[0].uuid;
    const practTimes = teamPTPT.filter(x => 
        {
            return (x.player_team_uuid === userTeamUuid && x.practices && x.practices.practice_date === teamDataSeleccionada);
        });

    let prepfis = practTimes.filter(x => x.practice_type === "prepfis");
let train = practTimes.filter(x => x.practice_type === "train");
let game = practTimes.filter(x => x.practice_type === "game");

const jugadorNoHaVingut =
    practTimes.length > 0 &&
    practTimes.every(x => Number(x.time) === 0);

if (jugadorNoHaVingut) {

    const moda = getModaPTPTEquip(
        userTeamUuid,
        teamDataSeleccionada
    );

    prepfis = [
        {
            time: moda.prepfis
        }
    ];

    train = [
        {
            time: moda.train
        }
    ];

    game = [
        {
            time: moda.game
        }
    ];
}

    const registre = {
        player_uuid: jugador.uuid,
        register: selectedRPE,
        date_register: new Date().toISOString(),
        date_practice: teamDataSeleccionada,
        weighted_register: getRPEWeight(selectedRPE, prepfis, train, game),
        te_molesties: teMolesties,
        molesties: textMolesties
    };

    await addRPERegister([registre]);

    const index = teamRpes.findIndex(r => r.player_uuid === registre.player_uuid && r.date_practice === registre.date_practice);
    if (index >= 0) { 
        teamRpes[index] = {...teamRpes[index], ...registre};
    } else {
        teamRpes.push(registre);
    }

    selectedRPE = -1;

    document.querySelectorAll(".rpeButton").forEach(b => b.classList.remove("rpeSelected"));
    document.getElementById("selectorData").disabled = false;

    venimDeRpeTeam = false;
    teamJugadorSeleccionat = null;
    document.getElementById("sortirButtonRPE").style.display = "";
    mostrarPantalla("rpeTeam");
    pintarJugadorsRpeTeam();
}


function pintarColorRPE(boto, rpe) {
    // Eliminem qualsevol classe RPE anterior
    for (let i = 1; i <= 10; i++) {
        boto.classList.remove(`rpe${i}`);
    }

    // Afegim la classe corresponent
    if (rpe >= 1 && rpe <= 10) {
        boto.classList.add(`rpe${rpe}`);
    }
}


function actualitzarDatesRpeTeam() {
    teamDates = teamDates.filter(data => {

        // Jugadors que tenen una sessió aquell dia
        const jugadorsAmbSessio = userTeamsEquipGlobal
            .filter(ut =>
                teamPTPT.some(pt =>
                    pt.player_team_uuid === ut.uuid &&
                    pt.practices &&
                    pt.practices.practice_date === data
                )
            )
            .map(ut => ut.user_uuid);

        // Si no hi ha cap jugador amb sessió,
        // mantenim la data
        if (jugadorsAmbSessio.length === 0) {
            return true;
        }

        // Eliminem possibles duplicats de jugador
        const jugadorsUnics = [...new Set(jugadorsAmbSessio)];

        // Comprovem si TOTS tenen RPE aquell dia
        const totsTenenRPE = jugadorsUnics.every(playerUuid =>
            teamRpes.some(rpe =>
                rpe.player_uuid === playerUuid &&
                rpe.date_practice === data
            )
        );

        // Si tots tenen RPE -> eliminem la data
        // Si falta algun RPE -> mantenim la data
        return !totsTenenRPE;
    });
}
