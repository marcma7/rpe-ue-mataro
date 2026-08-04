let existingUser = null;

document.getElementById("modificarSessioButton").addEventListener("click", obrirModificarSessions);

async function obrirModificarSessions() {
    const selector = document.getElementById("selectorTeams");

    window.teamSeleccionat = {
        uuid: selector.value,
        nom: selector.options[selector.selectedIndex].text
    };

    mostrarPantalla("modifySessions");
    await loadModifySessions();
}

document.getElementById("nouEquipButton").addEventListener("click", crearEquip);

document.getElementById("eliminarEquipButton").addEventListener("click", eliminarEquip);

document.getElementById("afegirSessionsButton").addEventListener("click", obrirSessions);

document.getElementById("tornarTeamsButton").addEventListener("click", () => {
    mostrarPantalla("teams");
});

document.getElementById("enrereSessionsATeams").addEventListener("click", () => {
    mostrarPantalla("management");
});


async function loadTeams() {
    const teams = await getAllTeams();
    const selector = document.getElementById("selectorTeams");
    selector.innerHTML = "";

    for (const team of teams) {
        const option = document.createElement("option");
        option.value = team.uuid;
        option.textContent = team.team_name;
        selector.appendChild(option);
    }

    if(teams.length > 0){
        selector.value = teams[0].uuid;
        await pickPlayers(teams[0].uuid);
    } else {
        document.getElementById("llistaJugadors").innerHTML = "";
    }
    return teams;
}


document.getElementById("selectorTeams").addEventListener("change", async e => {
    await pickPlayers(e.target.value);
});


async function pickPlayers(teamUuid) {
    const userTeams = await getPlayersByTeam(teamUuid);
    const userUuids = userTeams.map(u => u.user_uuid);
    const users = await getUsersByUserTeam(userUuids);
    pintarJugadors(users);
}


function pintarJugadors(users) {
    const llista = document.getElementById("llistaJugadors");
    llista.innerHTML = "";
    users.sort((a, b) => {
        function priority(role) {
            switch(role){
                case "JUGADOR": return 0;
                case "ENTR./PREPA/FISIO": return 1;
                case "SUPERADMIN": return 2;
                default: return 3;
            }
        }
        return priority(a.role) - priority(b.role);
    });

    for (const user of users) {
        const fila = document.createElement("div");
        fila.className = "jugadorFila";
        fila.innerHTML = `
            <span>${capitalize(user.name)} ${capitalize(user.surname)} - ${user.code}</span>
            <div>
                ${user.role === "JUGADOR" ? ` <button class="addInjuryButton" data-uuid="${user.uuid}">+</button>` : `<div class="addInjuryPlaceholder"></div>`}
                <button class="deletePlayerButton" data-uuid="${user.uuid}">✕</button>
            </div>
        `;
        llista.appendChild(fila);
    
        const deleteButton = fila.querySelector(".deletePlayerButton");
        deleteButton.addEventListener("click", () => {
            eliminarJugador(user);
        });

        const addButton = fila.querySelector(".addInjuryButton");
        if(addButton){
            addButton.addEventListener("click", () => {
                obrirAfegirLesio(user);
            });
        }
    }
}


async function eliminarJugador(user){
    if(!confirm("Segur que vols eliminar aquest jugador de l'equip?")) return;

    const teamUuid = document.getElementById("selectorTeams").value;
    const userTeam = await getUserTeamByTeamUuidAndUserUuid(teamUuid, user.uuid);
    if(userTeam.length===0) return;

    await deleteUserTeam(userTeam[0].uuid);

    const userTeams = await getUserTeamByUserUuid(user.uuid);

    if(userTeams.length === 0 && user.role !== "SUPERADMIN"){
        await deleteUser(user.uuid);
    }
    await pickPlayers(teamUuid);
}


function capitalize(text){
    if(!text) return "";
    return text.charAt(0).toUpperCase() + text.slice(1);
}


document.getElementById("afegirJugadorButton").addEventListener("click", afegirJugador);


async function afegirJugador() {

    const nom = document.getElementById("nomJugador").value.trim().toLowerCase();
    const cognom = document.getElementById("cognomJugador").value.trim().toLowerCase();
    const rol = document.getElementById("rolJugador").value;
    const teamUuid = document.getElementById("selectorTeams").value;
    if (nom === "") return;

    const users = await findUserByNameAndSurnameAndRole(nom, cognom, rol);

    if (users.length > 0) {
        existingUser = users[0];
        if (confirm("Aquest usuari ja existeix.\n\nVols assignar-lo a aquest equip?")) {
            await insertUserTeam({
                user_uuid: existingUser.uuid,
                team_uuid: teamUuid
            });
            await assignarSessionsExistents(existingUser.uuid, teamUuid);
            await pickPlayers(teamUuid);
        }
        return;
    }
    
    const allUsers = await getAllUsers();
    const code = createUserCode(nom, cognom, allUsers);
    const newUser = {
        code: code,
        name: nom,
        surname: cognom,
        role: rol
    };

    const createdUser = await insertUser(newUser);
    if (createdUser.length === 0) return;
    await insertUserTeam({
        user_uuid: createdUser[0].uuid,
        team_uuid: teamUuid
    });
    await assignarSessionsExistents(createdUser[0].uuid, teamUuid);
    await pickPlayers(teamUuid);

    document.getElementById("nomJugador").value = "";
    document.getElementById("cognomJugador").value = "";
    document.getElementById("rolJugador").value = "JUGADOR";
}


function createUserCode(name, surname, users) {
    function removeAccents(text) {
        return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    }

    const cleanName = removeAccents(name.toLowerCase());
    const cleanSurname = removeAccents(surname.toLowerCase().replaceAll(" ", ""));
    const provisional = cleanName.charAt(0) + cleanSurname;
    const iguals = users.filter(u => {
        const code = removeAccents(u.name).charAt(0) + removeAccents(u.surname.replaceAll(" ", ""));
        return code.toLowerCase() === provisional;
    });
    return provisional + (iguals.length + 1);
}


async function crearEquip(){
    const teamName = prompt("Nom del nou equip");
    if(teamName.trim()==="") return;
    if(!teamName) return;

    const result = await addTeam(teamName);
    await loadTeams();

    document.getElementById("selectorTeams").value = result[0].uuid;
    await pickPlayers(result[0].uuid);
}


async function eliminarEquip(){

    const selector = document.getElementById("selectorTeams");
    const teamUuid = selector.value;
    const teamName = selector.options[selector.selectedIndex].text;
    if(!confirm(`Segur que vols eliminar l'equip "${teamName}"?`)) return;
    await deleteTeam(teamUuid);
    await loadTeams();
}


async function obrirSessions(){
    const selector = document.getElementById("selectorTeams");
    const teamUuid = selector.value;
    const teamName = selector.options[selector.selectedIndex].text;

    window.teamSeleccionat = {
        uuid: teamUuid,
        nom: teamName
    };

    document.getElementById("nomEquipSessio").textContent = teamName;
    mostrarPantalla("sessions");
    await loadAddSession();
}


function moda(valors){

    const comptador = {};

    for(const valor of valors){
        comptador[valor] = (comptador[valor] || 0) + 1;
    }

    let millorValor = null;
    let millorComptador = -1;

    for(const [valor, vegades] of Object.entries(comptador)){
        if(vegades > millorComptador){
            millorComptador = vegades;
            millorValor = Number(valor);
        }
    }

    return millorValor;

}


async function assignarSessionsExistents(userUuid, teamUuid){

    const practices = await getPracticesByTeam(teamUuid);

    if(practices.length === 0) return;

    if(!confirm("Aquest equip ja té sessions creades.\n\nVols assignar-les també a aquest jugador?")){
        return;
    }

    const ptpt = await getPTPTByPractice(
        practices.map(p => p.uuid)
    );

    const perSessio = {};

    for(const fila of ptpt){

        if(!perSessio[fila.practice_uuid]){
            perSessio[fila.practice_uuid] = [];
        }

        perSessio[fila.practice_uuid].push(fila);

    }

    for(const [practiceUuid, files] of Object.entries(perSessio)){

        await insertPracticeTime({
            practice_uuid: practiceUuid,
            player_uuid: userUuid,
            train: moda(files.map(f => f.train)),
            pf: moda(files.map(f => f.pf)),
            game: moda(files.map(f => f.game))
        });

    }

}