let sessions = [];
let teamSessions = [];
let addSessionPlayers = [];
let createdPracticeUuid = null;
let createdPractice = null;


document
    .getElementById("aplicarJugadorsModificarButton")
    .addEventListener("click", aplicarTempsModificar);


async function loadModifySessions() {

    if (!window.teamSeleccionat)
        return;

    modifyPractices =
        await getPracticesByTeam(
            window.teamSeleccionat.uuid
        );

    pastOrToday = [];
    future = [];

    const avui = new Date();
    avui.setHours(0, 0, 0, 0);

    for (const practice of modifyPractices) {

        const [d, m, y] =
            practice.practice_date.split("-");

        const data =
            new Date(y, m - 1, d);

        data.setHours(0, 0, 0, 0);

        if (data <= avui)
            pastOrToday.push(practice.practice_date);
        else
            future.push(practice.practice_date);

    }

    pastOrToday.reverse();

    pintarLlistesModificar();

}

async function loadDeleteSessions(){

    console.log("ENTRANT A DELETE");

    if(!window.teamSeleccionat){

        console.log("NO HI HA EQUIP SELECCIONAT");

        return;

    }


    const practices =
        await getPracticesByTeam(
            window.teamSeleccionat.uuid
        );


    console.log(
        "SESSIONS TROBADES:",
        practices
    );


    const anteriors = [];
    const futures = [];


    const avui =
        new Date();

    avui.setHours(0,0,0,0);


    practices.forEach(practice=>{


        const [d,m,y] =
            practice.practice_date.split("-");


        const data =
            new Date(
                y,
                m-1,
                d
            );


        data.setHours(0,0,0,0);


        if(data <= avui)
            anteriors.push(practice);

        else
            futures.push(practice);


    });


    console.log(
        "ANTERIORS:",
        anteriors
    );

    console.log(
        "FUTURES:",
        futures
    );


    anteriors.reverse();


    pintarLlistesEliminar(
        anteriors,
        futures
    );

}

function pintarLlistesModificar() {

    const anteriors =
        document.getElementById("llistaSessionsAnteriors");

    const futures =
        document.getElementById("llistaSessionsFutures");


    anteriors.innerHTML = "";
    futures.innerHTML = "";


    function crearFila(data) {

        const boto =
            document.createElement("button");


        boto.className = "sessioModificarFila";

        boto.textContent = data;


        boto.addEventListener(
            "click",
            async () => {

                await loadModifyPractice(data);

            }
        );


        return boto;

    }


    pastOrToday.forEach(data => {

        anteriors.appendChild(
            crearFila(data)
        );

    });


    future.forEach(data => {

        futures.appendChild(
            crearFila(data)
        );

    });

}

function pintarLlistesEliminar(
    anteriors,
    futures
){

    const divAnteriors =
        document.getElementById(
            "llistaSessionsAnteriorsEliminar"
        );


    const divFutures =
        document.getElementById(
            "llistaSessionsFuturesEliminar"
        );


    divAnteriors.innerHTML="";
    divFutures.innerHTML="";


    function crearFila(practice){


        const boto =
            document.createElement("button");


        boto.className =
            "jugadorFila";


        boto.textContent =
            practice.practice_date;


        boto.dataset.uuid =
            practice.uuid;


        boto.onclick = ()=>{


            document
            .querySelectorAll(
                "#pantallaDeleteSessions .jugadorFila"
            )
            .forEach(b=>{

                b.classList.remove(
                    "seleccionat"
                );

            });


            boto.classList.add(
                "seleccionat"
            );


            document
            .getElementById(
                "eliminarSessioButton"
            )
            .dataset.uuid =
                practice.uuid;


        };


        return boto;

    }


    anteriors.forEach(p=>{

        divAnteriors.appendChild(
            crearFila(p)
        );

    });


    futures.forEach(p=>{

        divFutures.appendChild(
            crearFila(p)
        );

    });

}


async function loadModifyPractice(practiceDate) {

    selectedPracticeDate =
        practiceDate;

    const practice =
        modifyPractices.find(
            x => x.practice_date === practiceDate
        );

    if (!practice)
        return;

    selectedPracticeUuid =
        practice.uuid;

    const userTeams =
        await getPlayersByTeam(
            window.teamSeleccionat.uuid
        );

    const users =
        await getUsersByUserTeam(
            userTeams.map(x => x.user_uuid)
        );

    const practiceTimes =
        await getPTPTByPractice(
            [practice.uuid]
        );

    modifyUsersAndPractice = [];

    for (const user of users) {

        if (user.role !== "JUGADOR")
            continue;

        const userTeam =
            userTeams.find(
                x => x.user_uuid === user.uuid
            );

        const meusTemps =
            practiceTimes.filter(
                x => x.player_team_uuid === userTeam.uuid
            );

        modifyUsersAndPractice.push({

            ...user,

            user_team_uuid:
                userTeam.uuid,

            train:
                meusTemps
                    .filter(x => x.practice_type === "train")
                    .reduce((s, x) => s + x.time, 0),

            pf:
                meusTemps
                    .filter(x => x.practice_type === "prepfis")
                    .reduce((s, x) => s + x.time, 0),

            game:
                meusTemps
                    .filter(x => x.practice_type === "game")
                    .reduce((s, x) => s + x.time, 0)

        });

    }

    pintarJugadorsModificar();

}


function pintarJugadorsModificar() {

    const llista =
        document.getElementById(
            "jugadorsModificar"
        );

    llista.innerHTML = "";

    trainTime = 0;
    pfTime = 0;
    gameTime = 0;

    if (modifyUsersAndPractice.length > 0) {

        trainTime =
            modifyUsersAndPractice[0].train;

        pfTime =
            modifyUsersAndPractice[0].pf;

        gameTime =
            modifyUsersAndPractice[0].game;

    }

    document.getElementById("trainTimeMod").value =
        trainTime;

    document.getElementById("pfTimeMod").value =
        pfTime;

    document.getElementById("gameTimeMod").value =
        gameTime;

    for (const player of modifyUsersAndPractice) {

        const fila =
            document.createElement("div");

        fila.className = "sessioFila";

        fila.innerHTML = `

            <div>
                ${capitalize(player.name)}
                ${capitalize(player.surname)}
            </div>

            <input
                class="train"
                type="number"
                value="${player.train}">

            <input
                class="pf"
                type="number"
                value="${player.pf}">

            <input
                class="game"
                type="number"
                value="${player.game}">

        `;

        fila.dataset.userTeamUuid =
            player.user_team_uuid;

        llista.appendChild(fila);

    }

}


document
    .addEventListener("click", async e => {

        if (!e.target.classList.contains("modificarSessioButton"))
            return;

        const practiceUuid =
            e.target.dataset.uuid;


        mostrarPantalla("modifySessions");
        await obrirModificarSessio(
            practiceUuid
        );

    });


async function loadAddSession(){

    if(!window.teamSeleccionat)
        return;


    const userTeams =
        await getPlayersByTeam(
            window.teamSeleccionat.uuid
        );


    const users =
        await getUsersByUserTeam(
            userTeams.map(x=>x.user_uuid)
        );


    addSessionPlayers = [];


    for(const user of users){

        if(user.role !== "JUGADOR")
            continue;


        const userTeam =
            userTeams.find(
                x=>x.user_uuid === user.uuid
            );


        addSessionPlayers.push({

            uuid:user.uuid,

            name:user.name,

            surname:user.surname,

            user_team_uuid:userTeam.uuid,

            train:0,

            pf:0,

            game:0

        });

    }


    pintarJugadorsSessio();

}


function pintarJugadorsSessio(){

    const div =
        document.getElementById(
            "jugadorsSessio"
        );


    div.innerHTML="";


    for(const player of addSessionPlayers){


        const fila =
            document.createElement("div");


        fila.className="sessioFila";


        fila.innerHTML=`

        <div>
            ${capitalize(player.name)}
            ${capitalize(player.surname)}
        </div>


        <input class="train"
            type="number"
            value="${player.train}">


        <input class="pf"
            type="number"
            value="${player.pf}">


        <input class="game"
            type="number"
            value="${player.game}">

        `;


        fila.dataset.uuid =
            player.uuid;


        div.appendChild(fila);


    }

}


function aplicarTempsSessio(){

    const train =
        Number(
            document.getElementById(
                "trainTime"
            ).value
        );


    const pf =
        Number(
            document.getElementById(
                "pfTime"
            ).value
        );


    const game =
        Number(
            document.getElementById(
                "gameTime"
            ).value
        );


    for(const player of addSessionPlayers){

        player.train=train;
        player.pf=pf;
        player.game=game;

    }


    pintarJugadorsSessio();

}


document
.getElementById("aplicarJugadorsButton")
.addEventListener(
"click",
aplicarTempsSessio
);


document
.getElementById("guardarSessioButton")
.addEventListener(
"click",
guardarSessio
);


async function guardarSessio(){

    if(!window.teamSeleccionat)
        return;


    const dataInput =
        document.getElementById(
            "dataSessio"
        ).value;


    if(!dataInput){

        alert(
            "Selecciona una data"
        );

        return;

    }


    const [y,m,d] =
        dataInput.split("-");


    const practiceDate =
        `${d}-${m}-${y}`;


    // Crear sessió

    const newPractice = {

        practice_date:
            practiceDate,

        team_uuid:
            window.teamSeleccionat.uuid

    };


    const created =
        await insertPractice(
            newPractice
        );




    if(created.length === 0)
        return;


    createdPracticeUuid =
        created[0].uuid;



    // Preparar dades jugadors

    const ptpt = [];


    for(const player of addSessionPlayers){


        if(player.train > 0){

            ptpt.push({

                time:
                    player.train,

                practice_type:
                    "train",

                player_team_uuid:
                    player.user_team_uuid,

                practice_uuid:
                    createdPracticeUuid

            });

        }



        if(player.pf > 0){

            ptpt.push({

                time:
                    player.pf,

                practice_type:
                    "prepfis",

                player_team_uuid:
                    player.user_team_uuid,

                practice_uuid:
                    createdPracticeUuid

            });

        }



        if(player.game > 0){

            ptpt.push({

                time:
                    player.game,

                practice_type:
                    "game",

                player_team_uuid:
                    player.user_team_uuid,

                practice_uuid:
                    createdPracticeUuid

            });

        }


    }


    if(ptpt.length > 0){

        await insertPracticeTime(
            ptpt
        );

    }


    // netegem per poder afegir-ne una altra

    document.getElementById(
        "dataSessio"
    ).value = "";


    document.getElementById(
        "trainTime"
    ).value = 0;


    document.getElementById(
        "pfTime"
    ).value = 0;


    document.getElementById(
        "gameTime"
    ).value = 0;


    createdPractice = {
    uuid: createdPracticeUuid,
    date: practiceDate
};


obrirPostCreateDialog();

}


function aplicarTempsModificar() {

    trainTime =
        Number(
            document.getElementById(
                "trainTimeMod"
            ).value
        );

    pfTime =
        Number(
            document.getElementById(
                "pfTimeMod"
            ).value
        );

    gameTime =
        Number(
            document.getElementById(
                "gameTimeMod"
            ).value
        );

    for (const player of modifyUsersAndPractice) {

        player.train = trainTime;
        player.pf = pfTime;
        player.game = gameTime;

    }

    pintarJugadorsModificar();

}


function llegirJugadorsModificar() {

    const files =
        document.querySelectorAll(
            "#jugadorsModificar .sessioFila"
        );

    files.forEach((fila, index) => {

        modifyUsersAndPractice[index].train =
            Number(
                fila.querySelector(".train").value
            );

        modifyUsersAndPractice[index].pf =
            Number(
                fila.querySelector(".pf").value
            );

        modifyUsersAndPractice[index].game =
            Number(
                fila.querySelector(".game").value
            );

    });

}


document
    .getElementById("actualitzarSessioButton")
    .addEventListener("click", async () => {

        llegirJugadorsModificar();

        await updateModifySession();

    });


async function updateModifySession() {

    const practice =
        modifyPractices.find(
            x => x.uuid === selectedPracticeUuid
        );

    if (!practice)
        return;

    const practiceTimes =
        await getPTPTByPractice(
            [practice.uuid]
        );

    const upserts = [];
    const deletes = [];

    for (const player of modifyUsersAndPractice) {

        actualitzarTipus(
            "train",
            player.train
        );

        actualitzarTipus(
            "prepfis",
            player.pf
        );

        actualitzarTipus(
            "game",
            player.game
        );

        function actualitzarTipus(
            tipus,
            temps
        ) {

            const existent =
                practiceTimes.find(

                    x =>

                        x.player_team_uuid ===
                        player.user_team_uuid &&

                        x.practice_type ===
                        tipus

                );

            if (temps === 0) {

                if (existent)
                    deletes.push(existent.uuid);

                return;

            }

            upserts.push({

                practice_uuid:
                    practice.uuid,

                player_team_uuid:
                    player.user_team_uuid,

                practice_type:
                    tipus,

                time:
                    temps

            });

        }

    }

    if (upserts.length > 0)
        await upsertPracticeTime(upserts);

    if (deletes.length > 0)
        await deletePracticeTime(deletes);

await recalcularRPE(
    practice.uuid
);
    alert(
        "SESSIÓ ACTUALITZADA CORRECTAMENT"
    );

    await loadModifySessions();

await loadModifyPractice(
    selectedPracticeDate
);


async function recalcularRPE(practiceUuid) {

    const practice =
        modifyPractices.find(
            x => x.uuid === practiceUuid
        );

    if (!practice)
        return;

    const userTeams =
        await getPlayersByTeam(
            window.teamSeleccionat.uuid
        );

    const playerUuids =
        userTeams.map(x => x.user_uuid);

    const rpes =
        await getRPEByUsersAndDate(
            playerUuids,
            practice.practice_date
        );

    if (rpes.length === 0)
        return;

    const practiceTimes =
        await getPTPTByPractice(
            [practiceUuid]
        );

    const actualitzacions = [];

    for (const rpe of rpes) {

        const userTeam =
            userTeams.find(
                x => x.user_uuid === rpe.player_uuid
            );

        if (!userTeam)
            continue;

        const meusTemps =
            practiceTimes.filter(
                x =>
                    x.player_team_uuid ===
                    userTeam.uuid
            );

        const train =
            meusTemps
                .filter(
                    x => x.practice_type === "train"
                )
                .reduce(
                    (s, x) => s + x.time,
                    0
                );

        const pf =
            meusTemps
                .filter(
                    x => x.practice_type === "prepfis"
                )
                .reduce(
                    (s, x) => s + x.time,
                    0
                );

        const game =
            meusTemps
                .filter(
                    x => x.practice_type === "game"
                )
                .reduce(
                    (s, x) => s + x.time,
                    0
                );

        actualitzacions.push({

            player_uuid:
                rpe.player_uuid,

            register:
                rpe.register,

            date_register:
                rpe.date_register,

            date_practice:
                rpe.date_practice,

            weighted_register:
                getWeight(
                    rpe.register,
                    pf,
                    train,
                    game
                )

        });

    }

    if (actualitzacions.length > 0)
        await upsertRPE(actualitzacions);

}

}


function getWeight(
    rpe,
    pf,
    train,
    game
) {

    return rpe * (

        pf * 0.5 +

        train +

        game * 2.5

    );

}


document
.getElementById("eliminarSessionsButton")
.addEventListener(
"click",
async () => {

    const selector =
        document.getElementById("selectorTeams");


    window.teamSeleccionat = {

        uuid: selector.value,

        nom: selector.options[
            selector.selectedIndex
        ].text

    };


    document
        .getElementById("nomEquipEliminar")
        .textContent =
            window.teamSeleccionat.nom;


    mostrarPantalla("deleteSessions");


    await loadDeleteSessions();

});


async function eliminarSessions() {

    if (!window.teamSeleccionat)
        return;

    const practices =
        await getPracticesByTeam(
            window.teamSeleccionat.uuid
        );

    if (practices.length === 0) {

        alert(
            "Aquest equip no té sessions."
        );

        return;

    }

    const text = practices

        .sort((a, b) => {

            const da =
                a.practice_date
                    .split("-")
                    .reverse()
                    .join("-");

            const db =
                b.practice_date
                    .split("-")
                    .reverse()
                    .join("-");

            return new Date(db) - new Date(da);

        })

        .map((p, i) =>

            `${i + 1}. ${p.practice_date}`

        )

        .join("\n");

    const resposta =
        prompt(

`Quina sessió vols eliminar?

${text}

Escriu el número:`

        );

    if (!resposta)
        return;

    const index =
        Number(resposta) - 1;

    if (

        isNaN(index) ||

        index < 0 ||

        index >= practices.length

    ) {

        alert("Número incorrecte.");

        return;

    }

    const practice =
        practices[index];

    if (

        !confirm(

            `Eliminar la sessió del ${practice.practice_date}?`

        )

    )

        return;

    await eliminarSessio(
        practice
    );

}


async function eliminarSessio(practice) {

    const practiceTimes =
        await getPTPTByPractice(
            [practice.uuid]
        );

    if (practiceTimes.length > 0) {

        await deletePracticeTime(

            practiceTimes.map(
                x => x.uuid
            )

        );

    }

    const rpes =
        await getRPEByDate(
            practice.practice_date
        );

    if (rpes.length > 0) {

        await deleteRPE(

            rpes.map(
                x => x.uuid
            )

        );

    }

    await deletePractice(
        practice.uuid
    );

    alert(
        "SESSIÓ ELIMINADA CORRECTAMENT"
    );

    await loadDeleteSessions();

}



async function updateSession() {

    llegirJugadorsModificar();

    let ptptUps = [];
    let ptptDel = [];
    let playerUuid = [];

    const practice =
        modifyPractice;

    const ptpts =
        modifyPTPT.filter(
            x => x.practice_uuid === practice.uuid
        );

    for (const player of modifyPlayers) {

        actualitzarTipus(
            "train",
            player.train,
            player,
            ptpts,
            ptptUps,
            ptptDel,
            playerUuid,
            practice.uuid
        );

        actualitzarTipus(
            "prepfis",
            player.pf,
            player,
            ptpts,
            ptptUps,
            ptptDel,
            playerUuid,
            practice.uuid
        );

        actualitzarTipus(
            "game",
            player.game,
            player,
            ptpts,
            ptptUps,
            ptptDel,
            playerUuid,
            practice.uuid
        );

    }

    if (ptptUps.length > 0)
        await upsertPracticeTime(ptptUps);

    if (ptptDel.length > 0)
        await deletePracticeTime(ptptDel);

    const userTeams =
        await getPlayersByTeam(
            window.teamSeleccionat.uuid
        );

    modifyPTPT =
        await getPTPTByUserTeamUuids(
            userTeams.map(x => x.uuid)
        );

    playerUuid =
        [...new Set(playerUuid)];

    if (playerUuid.length > 0)
        await actualitzarRPE(
            playerUuid,
            userTeams
        );

    alert("SESSIÓ ACTUALITZADA CORRECTAMENT");

    await loadModifySessions();

}



function actualitzarTipus(
    tipus,
    valor,
    player,
    ptpts,
    ptptUps,
    ptptDel,
    playerUuid,
    practiceUuid
){

    const actual =
        ptpts.filter(
            x =>
                x.practice_type === tipus &&
                x.player_team_uuid === player.user_team_uuid
        );

    if(
        valor > 0 &&
        (
            actual.length === 0 ||
            actual[0].time !== valor
        )
    ){

        ptptUps.push({

            time: valor,
            practice_type: tipus,
            player_team_uuid: player.user_team_uuid,
            practice_uuid: practiceUuid

        });

        playerUuid.push(player.uuid);

    }
    else if(
        valor === 0 &&
        actual.length > 0
    ){

        ptptDel.push(actual[0].uuid);

        playerUuid.push(player.uuid);

    }

}

document
.getElementById("eliminarSessioButton")
.addEventListener(
"click",
async ()=>{


    const uuid =
        document
        .getElementById(
            "eliminarSessioButton"
        )
        .dataset.uuid;


    if(!uuid){

        alert(
            "Selecciona una sessió"
        );

        return;

    }


    const practices =
        await getPracticesByTeam(
            window.teamSeleccionat.uuid
        );


    const practice =
        practices.find(
            x=>x.uuid===uuid
        );


    if(!practice)
        return;



    if(
        !confirm(
            `Eliminar la sessió del ${practice.practice_date}?`
        )
    )
        return;



    await eliminarSessio(
        practice
    );


    await loadDeleteSessions();


});


function obrirDuplicateDialog(){

    document
    .getElementById("duplicateDialog")
    .style.display="flex";

}


document
.getElementById("cancelDuplicateButton")
.addEventListener(
"click",
()=>{

    document
    .getElementById("duplicateDialog")
    .style.display="none";

});



document
.getElementById("confirmDuplicateButton")
.addEventListener(
"click",
async ()=>{

    const daily =
        document.getElementById(
            "repeatDaily"
        ).checked;


    const weekly =
        document.getElementById(
            "repeatWeekly"
        ).checked;


    const limit =
        document.getElementById(
            "duplicateLimitDate"
        ).value;


    if(!limit){

        alert(
            "Selecciona una data límit"
        );

        return;

    }


    if(!daily && !weekly){

        alert(
            "Selecciona una opció de repetició"
        );

        return;

    }


    await duplicarSessio(
        createdPracticeUuid,
        daily,
        weekly,
        limit
    );


    document
.getElementById("duplicateDialog")
.style.display="none";


mostrarPantalla("teams");

});


document
.getElementById("cancelDuplicateButton")
.addEventListener(
"click",
()=>{

    document
    .getElementById("duplicateDialog")
    .style.display="none";

mostrarPantalla("teams");

});


async function duplicarSessio(
    practiceUuid,
    daily,
    weekly,
    limit
){

    const original =
        await getPracticesByTeam(
            window.teamSeleccionat.uuid
        );


    const practice =
        original.find(
            x=>x.uuid===practiceUuid
        );


    if(!practice)
        return;



    const temps =
        await getPTPTByPractice(
            [practiceUuid]
        );


    let data =
        convertirData(practice.practice_date);


    const dataLimit =
        new Date(limit);


    data.setDate(
        data.getDate()+(
            daily ? 1 : 7
        )
    );


    while(data <= dataLimit){


        const novaData =
            formatData(data);



        const novaPractice =
            await insertPractice({

                practice_date:novaData,

                team_uuid:
                    practice.team_uuid

            });



        if(novaPractice.length>0){


            const nouUuid =
                novaPractice[0].uuid;



            const nousTemps =
                temps.map(x=>({

                    time:x.time,

                    practice_type:
                        x.practice_type,

                    player_team_uuid:
                        x.player_team_uuid,

                    practice_uuid:
                        nouUuid

                }));


            if(nousTemps.length>0)
                await insertPracticeTime(
                    nousTemps
                );

        }



        if(daily)
            data.setDate(
                data.getDate()+1
            );
        else
            data.setDate(
                data.getDate()+7
            );

    }


    alert(
        "SESSIONS DUPLICADES CORRECTAMENT"
    );

await loadAddSession();

}


function convertirData(data){

    const [d,m,y] =
        data.split("-");

    return new Date(
        y,
        m-1,
        d
    );

}


function formatData(data){

    const d =
        String(data.getDate())
        .padStart(2,"0");


    const m =
        String(data.getMonth()+1)
        .padStart(2,"0");


    const y =
        data.getFullYear();


    return `${d}-${m}-${y}`;

}

function obrirPostCreateDialog(){

    document
    .getElementById("postCreateDialog")
    .style.display="flex";

}


document
.getElementById("addAnotherSessionButton")
.addEventListener(
"click",
()=>{

    document
    .getElementById("postCreateDialog")
    .style.display="none";


    reiniciarPantallaSessio();

});


document
.getElementById("duplicateSessionButton")
.addEventListener(
"click",
()=>{


    document
    .getElementById("postCreateDialog")
    .style.display="none";


    obrirDuplicateDialog();


});


document
.getElementById("exitSessionButton")
.addEventListener(
"click",
()=>{

    document
    .getElementById("postCreateDialog")
    .style.display="none";


    reiniciarPantallaSessio();

});


function reiniciarPantallaSessio(){

    document
    .getElementById("zonaConfiguracioSessio")
    .style.display="block";


    document
    .getElementById("zonaJugadorsSessio")
    .style.display="none";

}