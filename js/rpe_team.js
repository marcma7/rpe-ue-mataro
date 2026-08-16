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


    // -----------------------------------------
    // 1. TROBAR L'EQUIP DEL TEAM
    // -----------------------------------------

    const userTeams = await getUserTeamByUserUuid(user.uuid);

    if (userTeams.length === 0) {

        alert("Aquest usuari no està assignat a cap equip.");

        mostrarPantalla("login");

        return;
    }


    teamActual = userTeams[0];

    const teamUuid = teamActual.team_uuid;


    // -----------------------------------------
    // 2. CARREGAR JUGADORS DE L'EQUIP
    // -----------------------------------------

    const userTeamsEquip = await getPlayersByTeam(teamUuid);
    userTeamsEquipGlobal = userTeamsEquip;

    const userUuids = [
        ...new Set(
            userTeamsEquip.map(x => x.user_uuid)
        )
    ];

    const users = await getUsersByUserTeam(userUuids);


    // NOMÉS JUGADORS
    teamJugadors = users.filter(
        u => u.role === "JUGADOR"
    );


    // -----------------------------------------
// 3. CARREGAR SESSIONS DE L'EQUIP
// NOMÉS AVUI O SESSIONS PASSADES
// -----------------------------------------

const practices = await getPracticesByTeam(teamUuid);

const avui = new Date();
avui.setHours(0, 0, 0, 0);

teamDates = [
    ...new Set(
        practices
            .filter(p => {
                const parts = p.practice_date.split("-");

                const data = new Date(
                    Number(parts[2]),
                    Number(parts[1]) - 1,
                    Number(parts[0])
                );

                data.setHours(0, 0, 0, 0);

                return data <= avui;
            })
            .map(p => p.practice_date)
    )
];

// més recent → més antiga
teamDates.sort(
    (a, b) => sortKey(b).localeCompare(sortKey(a))
);


    // -----------------------------------------
    // 4. CARREGAR RPE EXISTENTS
    // -----------------------------------------

    const jugadorUuids = teamJugadors.map(
        j => j.uuid
    );

    teamRpes = await getRPEByUsers(jugadorUuids);


    // -----------------------------------------
    // 5. CARREGAR PTPT
    // -----------------------------------------

    const playerTeamUuids = userTeamsEquip
        .filter(ut =>
            jugadorUuids.includes(ut.user_uuid)
        )
        .map(ut => ut.uuid);


    teamPTPT = await getPTPTByUserTeamUuids(
        playerTeamUuids
    );

    // -----------------------------------------
// 6. ELIMINAR DATES COMPLETADES
// -----------------------------------------
actualitzarDatesRpeTeam();

if (teamDates.length === 0) {

    document.getElementById("selectorDataRpeTeam").innerHTML = "";

    document.getElementById("llistaJugadorsRpeTeam").innerHTML =
        "<p>No hi ha sessions pendents.</p>";

    return;
}

teamDataSeleccionada = teamDates[0];

omplirSelectorDatesRpeTeam();
pintarJugadorsRpeTeam();
}


function omplirSelectorDatesRpeTeam() {

    const selector =
        document.getElementById("selectorDataRpeTeam");

    selector.innerHTML = "";


    for (const data of teamDates) {

        const option =
            document.createElement("option");

        option.value = data;
        option.textContent = data;

        selector.appendChild(option);
    }


    selector.value = teamDataSeleccionada;
}


document
    .getElementById("selectorDataRpeTeam")
    .addEventListener("change", async function () {

        teamDataSeleccionada = this.value;

        pintarJugadorsRpeTeam();

    });


function pintarJugadorsRpeTeam() {

    const div =
        document.getElementById(
            "llistaJugadorsRpeTeam"
        );

    div.innerHTML = "";


    for (const jugador of teamJugadors) {

        const fila =
            document.createElement("div");

        fila.className = "jugadorRpeTeamFila";


        const nom =
            `${capitalize(jugador.name)} ${capitalize(jugador.surname)}`;


        const boto =
            document.createElement("button");

        boto.className = "jugadorRpeTeamButton";

        boto.textContent = "RPE";


        // -----------------------------------------
        // BUSCAR RPE D'AQUEST JUGADOR
        // I AQUESTA DATA
        // -----------------------------------------

        const rpe = teamRpes.find(
            r =>
                r.player_uuid === jugador.uuid &&
                r.date_practice === teamDataSeleccionada
        );


        if (rpe) {

            boto.textContent = rpe.register;

            pintarColorRPE(
                boto,
                rpe.register
            );

        } else {

            boto.textContent = "RPE";

            boto.classList.add(
                "rpeTeamButtonPendent"
            );
        }


        boto.addEventListener(
            "click",
            () => {

                obrirRPEJugadorTeam(
                    jugador
                );

            }
        );


        const nomElement =
            document.createElement("span");

        nomElement.textContent = nom;


        fila.appendChild(nomElement);
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

    if (!jugador)
        return;


    const userTeam = await getUserTeamByTeamUuidAndUserUuid(
        teamActual.team_uuid,
        jugador.uuid
    );


    if (userTeam.length === 0) {

        alert(
            "Aquest jugador no està assignat a l'equip."
        );

        return;
    }


    const userTeamUuid =
        userTeam[0].uuid;


    // -----------------------------------------
    // TEMPS DE LA SESSIÓ
    // -----------------------------------------

    const practTimes =
        teamPTPT.filter(x => {

            return (
                x.player_team_uuid === userTeamUuid &&
                x.practices &&
                x.practices.practice_date ===
                    teamDataSeleccionada
            );
        });


    const prepfis =
        practTimes.filter(
            x => x.practice_type === "prepfis"
        );

    const train =
        practTimes.filter(
            x => x.practice_type === "train"
        );

    const game =
        practTimes.filter(
            x => x.practice_type === "game"
        );


    // -----------------------------------------
    // CREAR RPE
    // -----------------------------------------

    const registre = {

    player_uuid: jugador.uuid,

    register: selectedRPE,

    date_register:
        new Date().toISOString(),

    date_practice:
        teamDataSeleccionada,

    weighted_register:
        getRPEWeight(
            selectedRPE,
            prepfis,
            train,
            game
        ),

    te_molesties: teMolesties,

    molesties: textMolesties
};


    await addRPERegister([registre]);


    // -----------------------------------------
    // ACTUALITZAR MEMÒRIA LOCAL
    // -----------------------------------------

    const index = teamRpes.findIndex(
    r =>
        r.player_uuid === registre.player_uuid &&
        r.date_practice === registre.date_practice
);

if (index >= 0) {
    teamRpes[index] = {
        ...teamRpes[index],
        ...registre
    };
} else {
    teamRpes.push(registre);
}



    // -----------------------------------------
    // NETEJAR ESTAT RPE
    // -----------------------------------------

    selectedRPE = -1;

    document
        .querySelectorAll(".rpeButton")
        .forEach(b =>
            b.classList.remove("rpeSelected")
        );


    document
        .getElementById("selectorData")
        .disabled = false;


    // -----------------------------------------
    // TORNAR A LA LLISTA TEAM
    // -----------------------------------------

    venimDeRpeTeam = false;

    teamJugadorSeleccionat = null;


    document
        .getElementById("sortirButtonRPE")
        .style.display = "";


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