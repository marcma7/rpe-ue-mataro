let ptpt = [];
let dates = [];
let selectedDate = "";
let selectedRPE = -1;
let isFinished = false;


async function loadRPE(user) {

    const userTeams = await getUserTeamByUserUuid(user.uuid);
    const teamUuids = userTeams.map(x => x.uuid);
    ptpt = await getPTPTByUserTeamUuids(teamUuids);
    const practiceUuids = ptpt.map(x => x.practice_uuid);
    const practices = await getPracticesByUuids(practiceUuids);
    const avui = new Date();
    const validDates = [];

    for (const practice of practices) {
        const parts = practice.practice_date.split("-");
        const data = new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]));
        if (data < avui) validDates.push(practice.practice_date);
    }

    dates = validDates;
}


async function acabarLoadRPE(user) {

    const rpes = await getRPEByUserUuid(user.uuid);
    const rpeDates = rpes.map(x => x.date_practice);
    dates = dates.filter(x => !rpeDates.includes(x));
    dates.sort((a, b) => sortKey(b).localeCompare(sortKey(a)));
    if (dates.length === 0) {
        isFinished = true;
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

    const practTimes = ptpt.filter(x => {
        if (!x.practices)
            return false;
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
        weighted_register: getRPEWeight(selectedRPE, prepfis, train, game)
    };

    await addRPERegister([registre]);

    dates = dates.filter(x => x !== selectedDate);
    selectedRPE = -1;
    
    document.querySelectorAll(".rpeButton").forEach(b => b.classList.remove("rpeSelected"));

    if (dates.length === 0) {
        isFinished = true;
        actualitzarEstatRPE();
        alert("No tens sessions pendents");
        return;
    }
    selectedDate = dates[0];
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
    selector.disabled = isFinished;

    document.querySelectorAll(".rpeButton").forEach(button => {
        button.disabled = isFinished;
        if (isFinished) button.style.opacity = "0.35";
        else button.style.opacity = "1";
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
