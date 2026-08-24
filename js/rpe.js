let ptpt = [];
let dates = [];
let selectedDate = "";
let selectedRPE = -1;
let isFinished = false;
let teMolesties = null;
let textMolesties = "";
let teRegla = null;

async function loadRPE(user) {
    isFinished = false;

    netejarMolestiesRPE();
    netejarReglaRPE();

    const userTeams = await getUserTeamByUserUuid(user.uuid);

    const teamUuids = userTeams.map(x => x.uuid);

    ptpt = await getPTPTByUserTeamUuids(teamUuids);

    const practiceUuids = ptpt.map(x => x.practice_uuid);
    const practices = await getPracticesByUuids(practiceUuids);

   // =====================================================
    // MIRAR SI ALGUN EQUIP DE L'USUARI DEMANA REGLA
    // =====================================================
    const teams = await getAllTeams();

    console.log("TEAMS:", teams);

    const userTeamUuids = userTeams.map(x => x.team_uuid);

    const preguntaRegla = teams.some(team =>
        userTeamUuids.includes(team.uuid) &&
        team.asks_regla === true
    );

    console.log("EQUIPS DE L'USUARI:", userTeamUuids);
    console.log("PREGUNTA REGLA:", preguntaRegla);

    document.getElementById("reglaRPE").style.display =
        preguntaRegla ? "block" : "none";

    if (!preguntaRegla) {
        teRegla = null;
    }

    const ara = new Date();
    const validDates = [];

    for (const practice of practices) {
        const parts = practice.practice_date.split("-");
        const data = new Date(
            Number(parts[2]),
            Number(parts[1]) - 1,
            Number(parts[0])
        );

        // Les sessions futures no entren
        if (data > ara) {
            continue;
        }
    
        // Si és avui i encara no són les 11:00,
        // no mostrem avui
        const esAvui =
            data.getFullYear() === ara.getFullYear() &&
            data.getMonth() === ara.getMonth() &&
            data.getDate() === ara.getDate();
    
        if (esAvui && ara.getHours() < 11) {
            continue;
        }
    
        validDates.push(practice.practice_date);
    }

    dates = validDates;
}


document
    .querySelectorAll('input[name="teRegla"]')
    .forEach(input => {

        input.addEventListener("change", function () {

            teRegla = this.value === "SI";

        });

    });


function netejarReglaRPE() {

    document
        .querySelectorAll('input[name="teRegla"]')
        .forEach(input => {
            input.checked = false;
        });

    teRegla = null;
}


async function acabarLoadRPE(user) {

    const rpes = await getRPEByUserUuid(user.uuid);
    const rpeDates = rpes.map(x => x.date_practice);
    dates = dates.filter(x => !rpeDates.includes(x));
    dates.sort((a, b) => sortKey(b).localeCompare(sortKey(a)));
    if (dates.length === 0) {
        isFinished = true;
        actualitzarEstatRPE();
        alert("No tens sessions pendents");
        return;
    }

    selectedDate = dates[0];
    omplirSelectorDates();
    actualitzarEstatRPE();
}


function omplirSelectorDates() {

    const selector = document.getElementById("selectorData");
    selector.innerHTML = "";

    for (const data of dates) {
        const option = document.createElement("option");
        option.value = data;
        option.textContent = data;
        selector.appendChild(option);
    }

    selector.value = selectedDate;
}


function sortKey(date) {
    const parts = date.split("-");
    return parts[2] + parts[1] + parts[0];
}


document.getElementById("selectorData").addEventListener("change", function () {
    selectedDate = this.value;
});

document.querySelectorAll(".rpeButton").forEach(button => {
    button.addEventListener("click", function () {
        if (isFinished) return;
        selectedRPE = Number(this.dataset.value);

        document.querySelectorAll(".rpeButton").forEach(b => b.classList.remove("rpeSelected"));
        this.classList.add("rpeSelected");
    });
});


async function confirmarRPE(user) {
    if (isFinished) return;

    if (selectedRPE === -1) {
        alert("Cal registrar un RPE");
        return;
    }

    const molestiesSeleccionada = document.querySelector('input[name="teMolesties"]:checked');
    teMolesties = molestiesSeleccionada?.value === "SI";
    textMolesties = teMolesties ? document.getElementById("textMolesties").value.trim() : "";

    if (venimDeRpeTeam) {
        await confirmarRPETeam();
        return;
    }

    const practTimes = ptpt.filter(x => {
        if (!x.practices) return false;
        return x.practices.practice_date === selectedDate;
    });

    const prepfis = practTimes.filter(x => x.practice_type === "prepfis");
    const train = practTimes.filter(x => x.practice_type === "train");
    const game = practTimes.filter(x => x.practice_type === "game");

    const registre = {
        player_uuid: user.uuid,
        register: selectedRPE,
        date_register: new Date().toISOString(),
        date_practice: selectedDate,
        weighted_register: getRPEWeight(selectedRPE, prepfis, train, game),
        te_molesties: teMolesties,
        molesties: textMolesties,
        te_regla: teRegla
    };

    await addRPERegister([registre]);

    if (teMolesties) {
        await enviarNotificacioMolestia(user, textMolesties);
    }

    dates = dates.filter(x => x !== selectedDate);
    selectedRPE = -1;
    
    document.querySelectorAll(".rpeButton").forEach(b => b.classList.remove("rpeSelected"));
    netejarMolestiesRPE();

    if (dates.length === 0) {
        isFinished = true;
        actualitzarEstatRPE();
        alert("No tens sessions pendents");
        return;
    }

    selectedDate = dates[0];

    if (user) {
        if (Notification.permission === "granted") {
            console.log("Les notificacions ja estan activades.");
        } else if (Notification.permission === "default") {
            const activades = await activarNotificacionsPush(user);
            if (activades) {
                alert("Notificacions activades correctament.");
            } else {
                alert("No s'han pogut activar les notificacions.");
            }
        } else if (Notification.permission === "denied") {
            console.log("Les notificacions estan bloquejades.");
        }
    }
    omplirSelectorDates();
}


function getRPEWeight(rpe, pf, train, game) {
    const pfSum = pf.reduce((sum, x) => sum + x.time, 0);
    const trainSum = train.reduce((sum, x) => sum + x.time, 0);
    const gameSum = game.reduce((sum, x) => sum + x.time, 0);
    return rpe * (pfSum * 0.5 + trainSum + gameSum * 2.5);
}


function actualitzarEstatRPE() {

    const botoConfirmar = document.getElementById("confirmarRPEButton");
    const selector = document.getElementById("selectorData");

    botoConfirmar.disabled = isFinished;

    // Si venim del TEAM, el selector sempre està deshabilitat
    selector.disabled = venimDeRpeTeam || isFinished;

    document.querySelectorAll(".rpeButton").forEach(button => {
        button.disabled = isFinished;

        if (isFinished) {
            button.style.opacity = "0.35";
        } else {
            button.style.opacity = "1";
        }
    });
}


function tancarSessioRPE() {
    eliminarUsuariLocal();
    selectedDate = "";
    selectedRPE = -1;
    dates = [];
    ptpt = [];
    isFinished = false;
    document.querySelectorAll(".rpeButton").forEach(b => b.classList.remove("rpeSelected"));
    mostrarPantalla("login");
}



function actualitzarMolestiesRPE() {

    const seleccionada =
        document.querySelector(
            'input[name="teMolesties"]:checked'
        );

    const textarea =
        document.getElementById("textMolesties");

    if (!seleccionada) {
        textarea.disabled = true;
        textarea.value = "";
        teMolesties = false;
        textMolesties = "";
        return;
    }

    teMolesties =
        seleccionada.value === "SI";

    if (teMolesties) {

        textarea.disabled = false;

    } else {

        textarea.disabled = true;
        textarea.value = "";
        textMolesties = "";
    }
}


document
    .querySelectorAll('input[name="teMolesties"]')
    .forEach(input => {

        input.addEventListener("change", function () {

            actualitzarMolestiesRPE();

        });

    });

function netejarMolestiesRPE() {

    const radioNo =
        document.querySelector(
            'input[name="teMolesties"][value="NO"]'
        );

    const textarea =
        document.getElementById("textMolesties");

    if (radioNo) {
        radioNo.checked = true;
    }

    document
        .querySelectorAll('input[name="teMolesties"][value="SI"]')
        .forEach(input => {
            input.checked = false;
        });

    textarea.value = "";
    textarea.disabled = true;

    teMolesties = false;
    textMolesties = "";
}
