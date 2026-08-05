async function fetchUserByCode(code) {
    const url = SUPABASE_URL + "/rest/v1/app_users?code=eq." + encodeURIComponent(code);

    try {
        const resposta = await fetch(url, {
            method: "GET",
            headers: {
                "Accept": "application/json",
                "apikey": SUPABASE_API_KEY,
                "Authorization": "Bearer " + SUPABASE_API_KEY
            }
        });

        const dades = await resposta.json();
        return dades.length > 0 ? dades[0] : null;
    } catch (error) {
        console.error(error);
        return null;
    }
}


async function getQuestionarisPerContestar(userUuid) {

    const url = SUPABASE_URL + "/rest/v1/questionaris_contestar" + "?user_uuid=eq." + encodeURIComponent(userUuid) + "&contestat=eq.0";

    try {
        const resposta = await fetch(url, {
            headers: {
                "Accept": "application/json",
                "apikey": SUPABASE_API_KEY,
                "Authorization": "Bearer " + SUPABASE_API_KEY
            }
        });
        return await resposta.json();
    } catch (error) {
        console.error(error);
        return [];
    }
}


async function getUserTeamByUserUuid(userUuid) {
    const url = SUPABASE_URL + "/rest/v1/user_teams?user_uuid=eq." + encodeURIComponent(userUuid);

    const resposta = await fetch(url, {
        headers: {
            "Accept": "application/json",
            "apikey": SUPABASE_API_KEY,
            "Authorization": "Bearer " + SUPABASE_API_KEY
        }
    });
    return await resposta.json();
}


async function getPTPTByUserTeamUuids(uuids) {
    if (uuids.length === 0) return [];

    const joined = uuids.join(",");
    const url = SUPABASE_URL + "/rest/v1/player_team_practice_time" + "?player_team_uuid=in.(" + joined + ")" + "&select=*,practices(*)";

    const resposta = await fetch(url, {
        headers: {
            "Accept": "application/json",
            "apikey": SUPABASE_API_KEY,
            "Authorization": "Bearer " + SUPABASE_API_KEY
        }
    });
    return await resposta.json();
}


async function getPracticesByUuids(uuids) {
    if (uuids.length === 0) return [];

    const joined = uuids.join(",");
    const url = SUPABASE_URL + "/rest/v1/practices?uuid=in.(" + joined + ")";

    const resposta = await fetch(url, {
        headers: {
            "Accept": "application/json",
            "apikey": SUPABASE_API_KEY,
            "Authorization": "Bearer " + SUPABASE_API_KEY
        }
    });

    return await resposta.json();
}


async function getRPEByUserUuid(userUuid) {
    const url = SUPABASE_URL + "/rest/v1/rpe_registers?player_uuid=eq." + encodeURIComponent(userUuid);

    const resposta = await fetch(url, {
        headers: {
            "Accept": "application/json",
            "apikey": SUPABASE_API_KEY,
            "Authorization": "Bearer " + SUPABASE_API_KEY
        }
    });

    return await resposta.json();
}


async function addRPERegister(rpeRegister) {
    const url = SUPABASE_URL + "/rest/v1/rpe_registers";

    const resposta = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Prefer": "return=representation",
            "apikey": SUPABASE_API_KEY,
            "Authorization": "Bearer " + SUPABASE_API_KEY
        },
        body: JSON.stringify(rpeRegister)
    });

    return await resposta.json();
}


async function getQuestionarisFromUuid(uuids) {
    const joined = uuids.join(",");

    const response = await fetch(
        `${SUPABASE_URL}/rest/v1/questionaris?uuid=in.(${joined})`,
        {
            headers: {
                "Content-Type": "application/json",
                "Prefer": "return=representation",
                "apikey": SUPABASE_API_KEY,
                "Authorization": "Bearer " + SUPABASE_API_KEY
            }
        }
    );
    return await response.json();
}


async function getQuestionsFromQuestionari(uuid) {
    const response = await fetch(
        `${SUPABASE_URL}/rest/v1/questions?questionari_uuid=eq.${uuid}`,
        {
            headers: {
                "Content-Type": "application/json",
                "Prefer": "return=representation",
                "apikey": SUPABASE_API_KEY,
                "Authorization": "Bearer " + SUPABASE_API_KEY
            }
        }
    );
    return await response.json();
}


async function addQuestionariAnswers(answers) {
    await fetch(
        `${SUPABASE_URL}/rest/v1/questionari_respostes`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Prefer": "return=representation",
                "apikey": SUPABASE_API_KEY,
                "Authorization": "Bearer " + SUPABASE_API_KEY
            },
            body: JSON.stringify(answers)
        }
    );
}


async function addQuestionari(questionari) {
    await fetch(
        `${SUPABASE_URL}/rest/v1/questionari_`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Prefer": "return=representation",
                "apikey": SUPABASE_API_KEY,
                "Authorization": "Bearer " + SUPABASE_API_KEY
            },
            body: JSON.stringify(answers)
        }
    );
}


async function setContestat(questionari) {
    await fetch(
        `${SUPABASE_URL}/rest/v1/questionaris_contestar?on_conflict=uuid`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "apikey": SUPABASE_API_KEY,
                "Authorization": "Bearer " + SUPABASE_API_KEY,
                "Prefer": "resolution=merge-duplicates,return=representation"
            },
            body: JSON.stringify(questionari)
        }
    );
}


async function getAllTeams() {
    const response = await fetch(
        `${SUPABASE_URL}/rest/v1/teams`,
        {
            headers: {
                "Accept": "application/json",
                "apikey": SUPABASE_API_KEY,
                "Authorization": "Bearer " + SUPABASE_API_KEY
            }
        }
    );
    return await response.json();
}


async function getPlayersByTeam(teamUuid) {
    const response = await fetch(
        `${SUPABASE_URL}/rest/v1/user_teams?team_uuid=eq.${teamUuid}`,
        {
            headers: {
                "Accept": "application/json",
                "apikey": SUPABASE_API_KEY,
                "Authorization": "Bearer " + SUPABASE_API_KEY
            }
        }
    );
    return await response.json();
}


async function getUsersByUserTeam(uuids) {
    if (uuids.length === 0) return [];

    const joined = uuids.join(",");
    const response = await fetch(
        `${SUPABASE_URL}/rest/v1/app_users?uuid=in.(${joined})`,
        {
            headers: {
                "Accept": "application/json",
                "apikey": SUPABASE_API_KEY,
                "Authorization": "Bearer " + SUPABASE_API_KEY
            }
        }
    );
    return await response.json();
}


async function findUserByNameAndSurnameAndRole(name, surname, role) {
    const url = `${SUPABASE_URL}/rest/v1/app_users` + `?name=eq.${encodeURIComponent(name)}` + `&surname=eq.${encodeURIComponent(surname)}` + `&role=eq.${encodeURIComponent(role)}`;

    const response = await fetch(url, {
        headers: {
            "Accept": "application/json",
            "apikey": SUPABASE_API_KEY,
            "Authorization": "Bearer " + SUPABASE_API_KEY
        }
    });
    return await response.json();
}


async function getAllUsers() {
    const response = await fetch(
        `${SUPABASE_URL}/rest/v1/app_users`,
        {
            headers: {
                "Accept": "application/json",
                "apikey": SUPABASE_API_KEY,
                "Authorization": "Bearer " + SUPABASE_API_KEY
            }
        }
    );
    return await response.json();
}


async function insertUser(user) {
    const response = await fetch(
        `${SUPABASE_URL}/rest/v1/app_users`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Prefer": "return=representation",
                "apikey": SUPABASE_API_KEY,
                "Authorization": "Bearer " + SUPABASE_API_KEY
            },
            body: JSON.stringify([user])
        }
    );
    return await response.json();
}


async function insertUserTeam(userTeam) {
    const response = await fetch(
        `${SUPABASE_URL}/rest/v1/user_teams`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Prefer": "return=representation",
                "apikey": SUPABASE_API_KEY,
                "Authorization": "Bearer " + SUPABASE_API_KEY
            },
            body: JSON.stringify([userTeam])
        }
    );
    return await response.json();
}


async function getUserTeamByTeamUuidAndUserUuid(teamUuid, userUuid){
    const response = await fetch(
        `${SUPABASE_URL}/rest/v1/user_teams` + `?team_uuid=eq.${teamUuid}` + `&user_uuid=eq.${userUuid}`,
        {
            headers:{
                "Accept":"application/json",
                "apikey":SUPABASE_API_KEY,
                "Authorization":"Bearer " + SUPABASE_API_KEY
            }
        }
    );
    return await response.json();
}


async function deleteUserTeam(userTeamUuid){
    await fetch(
        `${SUPABASE_URL}/rest/v1/user_teams?uuid=eq.${userTeamUuid}`,
        {
            method:"DELETE",
            headers:{
                "apikey":SUPABASE_API_KEY,
                "Authorization":"Bearer " + SUPABASE_API_KEY
            }
        }
    );
}


async function getUserTeamByUserUuid(userUuid){
    const response = await fetch(
        `${SUPABASE_URL}/rest/v1/user_teams?user_uuid=eq.${userUuid}`,
        {
            headers:{
                "Accept":"application/json",
                "apikey":SUPABASE_API_KEY,
                "Authorization":"Bearer " + SUPABASE_API_KEY
            }
        }
    );
    return await response.json();
}


async function deleteUser(userUuid){
    await fetch(
        `${SUPABASE_URL}/rest/v1/app_users?uuid=eq.${userUuid}`,
        {
            method:"DELETE",
            headers:{
                "apikey":SUPABASE_API_KEY,
                "Authorization":"Bearer " + SUPABASE_API_KEY
            }
        }
    );
}


async function addTeam(teamName){
    const response = await fetch(
        `${SUPABASE_URL}/rest/v1/teams`,
        {
            method:"POST",
            headers:{
                "Content-Type":"application/json",
                "Prefer":"return=representation",
                "apikey":SUPABASE_API_KEY,
                "Authorization":"Bearer " + SUPABASE_API_KEY
            },
            body:JSON.stringify([
                {
                    team_name:teamName
                }
            ])
        }
    );
    return await response.json();
}


async function crearEquip(){

    const teamName = prompt("Nom del nou equip");
    if(!teamName) return;
    if(teamName.trim() === "") return;

    const result = await addTeam(teamName.trim());
    await loadTeams();

    const selector = document.getElementById("selectorTeams");
    selector.value = result[0].uuid;
    await pickPlayers(result[0].uuid);
}


async function deleteTeam(teamUuid){
    await fetch(
        `${SUPABASE_URL}/rest/v1/teams?uuid=eq.${teamUuid}`,
        {
            method:"DELETE",
            headers:{
                "apikey":SUPABASE_API_KEY,
                "Authorization":"Bearer " + SUPABASE_API_KEY
            }
        }
    );
}


async function getPracticesByTeam(teamUuid) {
    const response = await fetch(
        `${SUPABASE_URL}/rest/v1/practices?team_uuid=eq.${teamUuid}`,
        {
            headers: {
                "Accept": "application/json",
                "apikey": SUPABASE_API_KEY,
                "Authorization": "Bearer " + SUPABASE_API_KEY
            }
        }
    );
    return await response.json();
}


async function insertPractice(practice) {
    const response = await fetch(
        `${SUPABASE_URL}/rest/v1/practices`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Prefer": "return=representation",
                "apikey": SUPABASE_API_KEY,
                "Authorization": `Bearer ${SUPABASE_API_KEY}`
            },
            body: JSON.stringify(practice)
        }
    );

    const result = await response.json();
    if (!response.ok) {
        const error = new Error(result.message || "Error en crear la sessió");
        error.status = response.status;
        error.code = result.code;
        error.details = result.details;
        throw error;
    }
    return result;
}


async function insertPracticeTime(data){
    console.log(data);
    const response = await fetch(
        `${SUPABASE_URL}/rest/v1/player_team_practice_time`,
        {
            method:"POST",
            headers:{
                "Content-Type":"application/json",
                "Prefer":"return=representation",
                "apikey":SUPABASE_API_KEY,
                "Authorization":"Bearer " + SUPABASE_API_KEY
            },
            body:JSON.stringify(data)
        }
    );
    return await response.json();
}


async function upsertPracticeTime(data){
    const response = await fetch(
        `${SUPABASE_URL}/rest/v1/player_team_practice_time?on_conflict=player_team_uuid,practice_type,practice_uuid`,
        {
            method:"POST",
            headers:{
                "Content-Type":"application/json",
                "Prefer":"resolution=merge-duplicates,return=representation",
                "apikey":SUPABASE_API_KEY,
                "Authorization":"Bearer " + SUPABASE_API_KEY
            },
            body:JSON.stringify(data)
        }
    );
    return await response.json();
}


async function getPTPTByPractice(practiceUuids){
    if(practiceUuids.length===0) return [];

    const joined = practiceUuids.join(",");
    const response = await fetch(
        `${SUPABASE_URL}/rest/v1/player_team_practice_time?practice_uuid=in.(${joined})&select=*,practices(*)`,
        {
            headers:{
                "Accept":"application/json",
                "apikey":SUPABASE_API_KEY,
                "Authorization":"Bearer " + SUPABASE_API_KEY
            }
        }
    );
    return await response.json();
}


async function deletePracticeTime(uuids){
    if(uuids.length===0) return;

    const joined = uuids.join(",");
    await fetch(
        `${SUPABASE_URL}/rest/v1/player_team_practice_time?uuid=in.(${joined})`,
        {
            method:"DELETE",
            headers:{
                "Content-Type":"application/json",
                "apikey":SUPABASE_API_KEY,
                "Authorization":"Bearer " + SUPABASE_API_KEY
            }
        }
    );
}


async function getRPEByUsersAndDate(users, selDate){
    if(users.length===0) return [];

    const joined = users.join(",");
    const response = await fetch(
        `${SUPABASE_URL}/rest/v1/rpe_registers?player_uuid=in.(${joined})&date_practice=eq.${encodeURIComponent(selDate)}`,
        {
            headers:{
                "Accept":"application/json",
                "apikey":SUPABASE_API_KEY,
                "Authorization":"Bearer " + SUPABASE_API_KEY
            }
        }
    );
    return await response.json();
}


async function upsertRPE(data){
    const response = await fetch(
        `${SUPABASE_URL}/rest/v1/rpe_registers?on_conflict=player_uuid,date_practice`,
        {
            method:"POST",
            headers:{
                "Content-Type":"application/json",
                "Prefer":"resolution=merge-duplicates,return=representation",
                "apikey":SUPABASE_API_KEY,
                "Authorization":"Bearer " + SUPABASE_API_KEY
            },
            body:JSON.stringify(data)
        }
    );
    return await response.json();
}


async function updateSession(selectedDate){
    let ptptUps = [];
    let ptptDel = [];
    let playerUuid = [];

    const practice = practices.find(x => x.practice_date === selectedDate);
    const ptpts = playerTeamPracticeTimes.filter(x => x.practice_uuid === practice.uuid);

    for(const player of fullUsersAndPractice){
        const train = ptpts.filter(x => x.practice_type==="train" && x.player_team_uuid===player.user_team_uuid);
        const prepfis = ptpts.filter(x => x.practice_type==="prepfis" && x.player_team_uuid===player.user_team_uuid);
        const game = ptpts.filter(x => x.practice_type==="game" && x.player_team_uuid===player.user_team_uuid); 

        if(player.train>0 && (train.length===0 || train[0].time!==player.train)){
            ptptUps.push({
                time:player.train,
                practice_type:"train",
                player_team_uuid:player.user_team_uuid,
                practice_uuid:practice.uuid
            });
            playerUuid.push(player.uuid);
        } else if(player.train===0 && train.length>0) {
            ptptDel.push(train[0].uuid);
            playerUuid.push(player.uuid);
        }

        if(player.pf>0 && (prepfis.length===0 || prepfis[0].time!==player.pf)){
            ptptUps.push({
                time:player.pf,
                practice_type:"prepfis",
                player_team_uuid:player.user_team_uuid,
                practice_uuid:practice.uuid
            });
            playerUuid.push(player.uuid);
        } else if(player.pf===0 && prepfis.length>0){
            ptptDel.push(prepfis[0].uuid);
            playerUuid.push(player.uuid);
        }

        if(player.game>0 && (game.length===0 || game[0].time!==player.game)){
            ptptUps.push({
                time:player.game,
                practice_type:"game",
                player_team_uuid:player.user_team_uuid,
                practice_uuid:practice.uuid
            });
            playerUuid.push(player.uuid);
        } else if(player.game===0 && game.length>0){
            ptptDel.push(game[0].uuid);
            playerUuid.push(player.uuid);
        }
    }

    if(ptptUps.length>0) await upsertPracticeTime(ptptUps);
    if(ptptDel.length>0) await deletePracticeTime(ptptDel);

    const userTeams = await getPlayersByTeam(window.teamSeleccionat.uuid);
    playerTeamPracticeTimes = await getPTPTByUserTeamUuids(userTeams.map(x=>x.uuid));
    const practiceUuid = practices.filter(x=>x.practice_date===selectedDate).map(x=>x.uuid);

    playerUuid = [...new Set(playerUuid)];
    if(playerUuid.length>0){
        const rpes = await getRPEByUsersAndDate(playerUuid, selectedDate);
        const updateRPE = [];

        for(const uuid of playerUuid){
            const uTeam = userTeams.find(x=>x.user_uuid===uuid);
            
            const rpeUser = rpes.filter(x=>x.player_uuid===uuid);
            if(rpeUser.length===0) continue;

            const ptptUser = playerTeamPracticeTimes.filter(x=> x.player_team_uuid===uTeam.uuid && practiceUuid.includes(x.practice_uuid));

            const prepfis = ptptUser.filter(x=>x.practice_type==="prepfis");
            const train = ptptUser.filter(x=>x.practice_type==="train");
            const game = ptptUser.filter(x=>x.practice_type==="game");

            updateRPE.push({
                player_uuid:uuid,
                register: rpeUser[0].register,
                date_register: new Date().toISOString(),
                date_practice: selectedDate,
                weighted_register: getWeight(rpeUser[0].register, prepfis, train, game)
            });
        }

        if(updateRPE.length>0) await upsertRPE(updateRPE);
    }
}


function getWeight(rpe, pf, train, game){
    const pfSum = pf.reduce((a,b)=>a+b.time, 0);
    const trainSum = train.reduce((a,b)=>a+b.time, 0);
    const gameSum = game.reduce((a,b)=>a+b.time, 0);
    return rpe * (pfSum * 0.5 + trainSum + gameSum * 2.5);
}


async function deleteRPE(uuids){
    if(uuids.length===0) return;

    const joined = uuids.join(",");
    await fetch(
        `${SUPABASE_URL}/rest/v1/rpe_registers?uuid=in.(${joined})`,
        {
            method:"DELETE",
            headers:{
                "apikey":SUPABASE_API_KEY,
                "Authorization":"Bearer " + SUPABASE_API_KEY
            }
        }
    );
}


async function deletePractice(uuid){
    await fetch(
        `${SUPABASE_URL}/rest/v1/practices?uuid=eq.${uuid}`,
        {
            method:"DELETE",
            headers:{
                "apikey":SUPABASE_API_KEY,
                "Authorization":"Bearer " + SUPABASE_API_KEY
            }
        }
    );
}


async function getRPEByDate(date){
    const response = await fetch(
        `${SUPABASE_URL}/rest/v1/rpe_registers?date_practice=eq.${encodeURIComponent(date)}`,
        {
            headers:{
                "Accept":"application/json",
                "apikey":SUPABASE_API_KEY,
                "Authorization":"Bearer " + SUPABASE_API_KEY
            }
        }
    );
    return await response.json();
}


async function getRPEByUsers(users){
    if(users.length===0) return [];

    const joined = users.join(",");
    const response = await fetch(
        `${SUPABASE_URL}/rest/v1/rpe_registers?player_uuid=in.(${joined})`,
        {
            headers:{
                "Accept":"application/json",
                "apikey":SUPABASE_API_KEY,
                "Authorization": "Bearer " + SUPABASE_API_KEY
            }
        }
    );
    return await response.json();
}


async function getQuestionarisByCodeWord(word){
    const response = await fetch(
        `${SUPABASE_URL}/rest/v1/questionaris?name=ilike.${encodeURIComponent(word)}`,
        {
            headers:{
                "Accept":"application/json",
                "apikey":SUPABASE_API_KEY,
                "Authorization": "Bearer "+SUPABASE_API_KEY
            }
        }
    );
    return await response.json();
}


async function getQuestionarisUser(questionariUuids, userUuids){
    if(questionariUuids.length===0 || userUuids.length===0) return [];
    
    const q = questionariUuids.join(",");
    const u = userUuids.join(",");

    const response = await fetch(
        `${SUPABASE_URL}/rest/v1/questionaris_contestar`+ `?questionari_uuid=in.(${q})`+ `&user_uuid=in.(${u})`,
        {
            headers:{
                "Accept":"application/json",
                "apikey":SUPABASE_API_KEY,
                "Authorization": "Bearer "+SUPABASE_API_KEY
            }
        }
    );
    return await response.json();
}


async function getAnswersByQuestionari(questionariUserUuids){
    if(questionariUserUuids.length===0) return [];

    const joined = questionariUserUuids.join(",");
    const response = await fetch(
        `${SUPABASE_URL}/rest/v1/questionari_respostes?questionari_user_uuid=in.(${joined})`,
        {
            headers:{
                "Accept":"application/json",
                "apikey":SUPABASE_API_KEY,
                "Authorization": "Bearer "+SUPABASE_API_KEY
            }
        }
    );
    return await response.json();
}


async function getValoracio(uuid){
    const response = await fetch(
        `${SUPABASE_URL}/rest/v1/valoracions?uuid=eq.${uuid}`,
        {
            headers:{
                "Accept":"application/json",
                "apikey":SUPABASE_API_KEY,
                "Authorization":
                "Bearer "+SUPABASE_API_KEY
            }
        }
    );

    const data = await response.json();
    return data.length > 0 ? data[0] : null;
}


async function getValoracioItems(valoracioUuid){
    const response = await fetch(
        `${SUPABASE_URL}/rest/v1/valoracions_items?valoracio_uuid=eq.${valoracioUuid}&order=num_item.asc`,
        {
            headers:{
                "Accept":"application/json",
                "apikey":SUPABASE_API_KEY,
                "Authorization":
                "Bearer "+SUPABASE_API_KEY
            }
        }
    );
    return await response.json();
}


async function addValoracioAnswers(answers){
    const response = await fetch(
        `${SUPABASE_URL}/rest/v1/valoracions_respostes`,
        {
            method:"POST",
            headers:{
                "Content-Type":"application/json",
                "Prefer":"return=representation",
                "apikey":SUPABASE_API_KEY,
                "Authorization":
                "Bearer "+SUPABASE_API_KEY
            },
            body: JSON.stringify(answers)
        }
    );
    return await response.json();
}


async function getAllValoracions(){
    const response = await fetch(
        `${SUPABASE_URL}/rest/v1/valoracions`,
        {
            headers:{
                "Accept":"application/json",
                "apikey":SUPABASE_API_KEY,
                "Authorization":
                "Bearer "+SUPABASE_API_KEY
            }
        }
    );
    return await response.json();
}


async function getValoracionsFromUuid(uuids){
    const joined = uuids.join(",");
    const response = await fetch(
        `${SUPABASE_URL}/rest/v1/valoracions?uuid=in.(${joined})`,
        {
            headers:{
                "Accept":"application/json",
                "apikey":SUPABASE_API_KEY,
                "Authorization":
                "Bearer "+SUPABASE_API_KEY
            }
        }
    );
    return await response.json();
}


async function getValoracionsItemsFromValoracio(uuid){
    const response = await fetch(
        `${SUPABASE_URL}/rest/v1/valoracions_items?valoracio_uuid=eq.${uuid}&order=num_item`,
        {
            headers:{
                "Accept":"application/json",
                "apikey":SUPABASE_API_KEY,
                "Authorization":
                "Bearer "+SUPABASE_API_KEY
            }
        }
    );
    return await response.json();
}


async function getUser(userUuid){
    const response = await fetch(
        `${SUPABASE_URL}/rest/v1/app_users?uuid=eq.${userUuid}`,
        {
            headers:{
                "Accept":"application/json",
                "apikey":SUPABASE_API_KEY,
                "Authorization":"Bearer " + SUPABASE_API_KEY
            }
        }
    );
    const users = await response.json();
    return users.length > 0 ? users[0] : null;
}


async function getAllInjuries(){
    const url = `${SUPABASE_URL}/rest/v1/injuries`;
    const res = await fetch(
        url,
        {
            headers:{
                "Accept":"application/json",
                "apikey":SUPABASE_API_KEY,
                "Authorization":"Bearer " + SUPABASE_API_KEY
            }
        }
    );
    return await res.json();
}


async function getEpisodesByInjury(uuids){
    if(uuids.length === 0) return [];
    const url = `${SUPABASE_URL}/rest/v1/physio_episodes?injury_uuid=in.(${uuids.join(",")})`;
    const res = await fetch(
        url,
        {
            headers:{
                "Accept":"application/json",
                "apikey":SUPABASE_API_KEY,
                "Authorization":"Bearer " + SUPABASE_API_KEY
            }
        }
    );
    return await res.json();
}


async function getVisitsByEpisodes(uuids){
    if(uuids.length === 0) return [];
    const url = `${SUPABASE_URL}/rest/v1/physio_visits?episode_uuid=in.(${uuids.join(",")})`;
    const res = await fetch(
        url,
        {
            headers:{
                "Accept":"application/json",
                "apikey":SUPABASE_API_KEY,
                "Authorization":"Bearer " + SUPABASE_API_KEY
            }
        }
    );
    return await res.json();
}


async function getVisitsByDates(dates){
    if(dates.length === 0) return [];
    const url = `${SUPABASE_URL}/rest/v1/physio_visits?date=in.(${dates.join(",")})`;
    const res = await fetch(
        url,
        {
            headers:{
                "Accept":"application/json",
                "apikey":SUPABASE_API_KEY,
                "Authorization":"Bearer " + SUPABASE_API_KEY
            }
        }
    );
    return await res.json();
}


async function upsertPhysioHour(data){
    const url = `${SUPABASE_URL}/rest/v1/physio_visits?on_conflict=uuid`;
    const res = await fetch(
        url,
        {
            method:"POST",
            headers:{
                "Accept":"application/json",
                "Content-Type":"application/json",
                "apikey":SUPABASE_API_KEY,
                "Authorization":"Bearer " + SUPABASE_API_KEY,
                "Prefer": "resolution=merge-duplicates,return=representation"
            },
            body: JSON.stringify(data)
        }
    );
    return await res.json();
}


async function getEpisodesByUuid(uuids){
    if(uuids.length === 0) return [];
    const url = `${SUPABASE_URL}/rest/v1/physio_episodes?uuid=in.(${uuids.join(",")})`;
    const res = await fetch(
        url,
        {
            headers:{
                "Accept":"application/json",
                "apikey":SUPABASE_API_KEY,
                "Authorization":"Bearer " + SUPABASE_API_KEY
            }
        }
    );
    return await res.json();
}


async function getInjuriesByUuid(uuids){
    if(uuids.length === 0) return [];
    const url = `${SUPABASE_URL}/rest/v1/injuries?uuid=in.(${uuids.join(",")})`;
    const res = await fetch(
        url,
        {
            headers:{
                "Accept":"application/json",
                "apikey":SUPABASE_API_KEY,
                "Authorization":"Bearer " + SUPABASE_API_KEY
            }
        }
    );
    return await res.json();
}


async function getAllVisits(){
    const url = `${SUPABASE_URL}/rest/v1/physio_visits`;
    const res = await fetch(
        url,
        {
            headers:{
                "Accept":"application/json",
                "apikey":SUPABASE_API_KEY,
                "Authorization":"Bearer " + SUPABASE_API_KEY
            }
        }
    );
    return await res.json();
}


async function addComments(comm){
    const url = `${SUPABASE_URL}/rest/v1/physio_visits?on_conflict=uuid`;
    const res = await fetch(
        url,
        {
            method:"POST",
            headers:{
                "Content-Type":"application/json",
                "Accept":"application/json",
                "apikey":SUPABASE_API_KEY,
                "Authorization":"Bearer " + SUPABASE_API_KEY,
                "Prefer":"resolution=merge-duplicates,return=representation"
            },
            body:JSON.stringify(comm)
        }
    );
    return await res.json();
}


async function closeEpisode(data){
    const url = `${SUPABASE_URL}/rest/v1/physio_episodes?on_conflict=uuid`;
    const res = await fetch(url,{
        method:"POST",
        headers:{
            "Content-Type":"application/json",
            "Accept":"application/json",
            "Prefer":"return=representation",
            "apikey":SUPABASE_API_KEY,
            "Authorization":
            "Bearer "+SUPABASE_API_KEY
        },
        body:JSON.stringify(data)
    });

    const text = await res.text();
    if(!res.ok) throw new Error(text);
    return text ? JSON.parse(text)[0] : null;
}


async function insertVisit(visit){
    const url = `${SUPABASE_URL}/rest/v1/physio_visits`;
    const res = await fetch(
        url,
        {
            method:"POST",
            headers:{
                "Content-Type":"application/json",
                "Accept":"application/json",
                "Prefer":"return=representation",
                "apikey":SUPABASE_API_KEY,
                "Authorization":
                "Bearer " + SUPABASE_API_KEY
            },
            body:JSON.stringify(visit)
        }
    );

    const text = await res.text();
    if(!res.ok){
        console.error("ERROR INSERT VISIT", text);
        throw new Error(text);
    }
    if(!text) return null;
    return JSON.parse(text)[0];
}


async function insertInjury(injury){
    const response = await fetch(
        `${SUPABASE_URL}/rest/v1/injuries`,
        {
            method:"POST",
            headers:{
                "Content-Type":"application/json",
                "Prefer": "return=representation",
                "apikey": SUPABASE_API_KEY,
                "Authorization": "Bearer "+SUPABASE_API_KEY
            },
            body: JSON.stringify(injury)
        }
    );
    const text = await response.text();
    return JSON.parse(text);
}


async function insertPhysioEpisode(episode){
    const response = await fetch(
        `${SUPABASE_URL}/rest/v1/physio_episodes`,
        {
            method:"POST",
            headers:{
                "Content-Type":"application/json",
                "Prefer": "return=representation",
                "apikey": SUPABASE_API_KEY,
                "Authorization": "Bearer "+SUPABASE_API_KEY
            },
            body: JSON.stringify(episode)
        }
    );
    return await response.json();
}


async function insertPhysioVisit(visit){
    const response = await fetch(
        `${SUPABASE_URL}/rest/v1/physio_visits`,
        {
            method:"POST",
            headers:{
                "Content-Type":"application/json",
                "Prefer": "return=representation",
                "apikey": SUPABASE_API_KEY,
                "Authorization": "Bearer "+SUPABASE_API_KEY
            },
            body: JSON.stringify(visit)
        }
    );
    return await response.json();
}


async function deleteQuestionari(uuid){

    const response = await fetch(
        `${SUPABASE_URL}/rest/v1/questionaris?uuid=eq.${uuid}`,
        {
            method:"DELETE",
            headers:{
                apikey:SUPABASE_API_KEY,
                Authorization:`Bearer ${SUPABASE_API_KEY}`
            }
        }
    );
    if(!response.ok) throw new Error(await response.text());
}


async function getAllQuestionaris(){
    const response = await fetch(
        `${SUPABASE_URL}/rest/v1/questionaris`,
        {
            method:"GET",
            headers:{
                apikey:SUPABASE_API_KEY,
                Authorization:`Bearer ${SUPABASE_API_KEY}`
            }
        }
    );

    if(!response.ok) throw new Error(await response.text());
    return await response.json();
}


async function getAllQuestions(){
    const response = await fetch(
        `${SUPABASE_URL}/rest/v1/questions`,
        {
            method:"GET",
            headers:{
                apikey:SUPABASE_API_KEY,
                Authorization:`Bearer ${SUPABASE_API_KEY}`
            }
        }
    );

    if(!response.ok) throw new Error(await response.text());
    return await response.json();
}


async function upsertContestarQuestionari(data){
    const response = await fetch(
        `${SUPABASE_URL}/rest/v1/questionaris_contestar?on_conflict=user_uuid,questionari_uuid,data_enviament`,
        {
            method:"POST",
            headers:{
                apikey:SUPABASE_API_KEY,
                Authorization:`Bearer ${SUPABASE_API_KEY}`,
                "Content-Type":"application/json",
                Prefer:"resolution=merge-duplicates"
            },
            body: JSON.stringify(data)
        }
    );

    if(!response.ok){
        throw new Error(await response.text());
    }
    return true;
}


async function addQuestionari(data){
    const response = await fetch(
        `${SUPABASE_URL}/rest/v1/questionaris`,
        {
            method: "POST",
            headers: {
                apikey: SUPABASE_API_KEY,
                Authorization: `Bearer ${SUPABASE_API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        }
    );

    if(!response.ok) throw new Error(await response.text());
    return true;
}


async function upsertQuestionOrder(updates) {
    for (const q of updates) {
        const response = await fetch(
            `${SUPABASE_URL}/rest/v1/questions?uuid=eq.${q.uuid}`,
            {
                method: "PATCH",
                headers: {
                    apikey: SUPABASE_API_KEY,
                    Authorization: `Bearer ${SUPABASE_API_KEY}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    ordre: q.ordre
                })
            }
        );

        if (!response.ok) throw new Error(await response.text());
    }
}


async function upsertQuestion(question) {

    const response = await fetch(
        `${SUPABASE_URL}/rest/v1/questions?uuid=eq.${question.uuid}`,
        {
            method: "PATCH",
            headers: {
                apikey: SUPABASE_API_KEY,
                Authorization: `Bearer ${SUPABASE_API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                pregunta: question.pregunta,
                tipus_pregunta: question.tipus_pregunta,
                opcions_resposta: question.opcions_resposta,
                num_pregunta: question.num_pregunta,
                questionari_uuid: question.questionari_uuid
            })
        }
    );

    if (!response.ok) {
        throw new Error(await response.text());
    }
}


async function addQuestion(question) {
    const response = await fetch(
        `${SUPABASE_URL}/rest/v1/questions`,
        {
            method: "POST",
            headers: {
                apikey: SUPABASE_API_KEY,
                Authorization: `Bearer ${SUPABASE_API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(question)
        }
    );

    if (!response.ok) throw new Error(await response.text());
}


async function getValoracio(uuid){
    const response = await fetch(
        `${SUPABASE_URL}/rest/v1/valoracions?uuid=eq.${uuid}&select=*`,
        {
            headers:{
                apikey:SUPABASE_API_KEY,
                Authorization:`Bearer ${SUPABASE_API_KEY}`
            }
        }
    );
    return (await response.json())[0];
}


async function addValoracio(data){
    const response = await fetch(
        `${SUPABASE_URL}/rest/v1/valoracions`,
        {
            method:"POST",
            headers:{
                apikey:SUPABASE_API_KEY,
                Authorization:`Bearer ${SUPABASE_API_KEY}`,
                "Content-Type":"application/json"
            },
            body:JSON.stringify(data)
        }
    );

    if(!response.ok) throw new Error(await response.text());
}


async function updateValoracio(data){
    const uuid = data.uuid;
    delete data.uuid;
    const response = await fetch(
        `${SUPABASE_URL}/rest/v1/valoracions?uuid=eq.${uuid}`,
        {
            method:"PATCH",
            headers:{
                apikey:SUPABASE_API_KEY,
                Authorization:`Bearer ${SUPABASE_API_KEY}`,
                "Content-Type":"application/json"
            },
            body:JSON.stringify(data)
        }
    );
    if(!response.ok) throw new Error(await response.text());
}


async function deleteValoracio(uuid){
    const response = await fetch(
        `${SUPABASE_URL}/rest/v1/valoracions?uuid=eq.${uuid}`,
        {
            method:"DELETE",
            headers:{
                apikey:SUPABASE_API_KEY,
                Authorization:`Bearer ${SUPABASE_API_KEY}`
            }
        }
    );

    if(!response.ok) throw new Error(await response.text());
}


async function getAllValoracionsItems(){
    const response = await fetch(
        `${SUPABASE_URL}/rest/v1/valoracions_items?select=*`,
        {
            headers:{
                apikey:SUPABASE_API_KEY,
                Authorization:`Bearer ${SUPABASE_API_KEY}`
            }
        }
    );
    return await response.json();
}


async function getValoracioItems(valoracioUuid){
    const response = await fetch(
        `${SUPABASE_URL}/rest/v1/valoracions_items?valoracio_uuid=eq.${valoracioUuid}&select=*`,
        {
            headers:{
                apikey:SUPABASE_API_KEY,
                Authorization:`Bearer ${SUPABASE_API_KEY}`
            }
        }
    );
    return await response.json();
}


async function addValoracioItem(data){
    const response = await fetch(
        `${SUPABASE_URL}/rest/v1/valoracions_items`,
        {
            method:"POST",
            headers:{
                apikey:SUPABASE_API_KEY,
                Authorization:`Bearer ${SUPABASE_API_KEY}`,
                "Content-Type":"application/json"
            },
            body:JSON.stringify(data)
        }
    );
    if(!response.ok) throw new Error(await response.text());
}


async function updateValoracioItem(data){
    const uuid = data.uuid;
    delete data.uuid;

    const response = await fetch(
        `${SUPABASE_URL}/rest/v1/valoracions_items?uuid=eq.${uuid}`,
        {
            method:"PATCH",
            headers:{
                apikey:SUPABASE_API_KEY,
                Authorization:`Bearer ${SUPABASE_API_KEY}`,
                "Content-Type":"application/json"
            },
            body:JSON.stringify(data)
        }
    );
    if(!response.ok) throw new Error(await response.text());
}


async function deleteValoracioItem(uuid){
    const response = await fetch(
        `${SUPABASE_URL}/rest/v1/valoracions_items?uuid=eq.${uuid}`,
        {
            method:"DELETE",
            headers:{
                apikey:SUPABASE_API_KEY,
                Authorization:`Bearer ${SUPABASE_API_KEY}`
            }
        }
    );
    if(!response.ok) throw new Error(await response.text());
}


async function upsertValoracioItemOrder(items){
    for(const item of items){
        const response = await fetch(
            `${SUPABASE_URL}/rest/v1/valoracions_items?uuid=eq.${item.uuid}`,
            {
                method:"PATCH",
                headers:{
                    apikey:SUPABASE_API_KEY,
                    Authorization:`Bearer ${SUPABASE_API_KEY}`,
                    "Content-Type":"application/json"
                },
                body:JSON.stringify({
                    num_item:item.num_item
                })
            }
        );
        if(!response.ok) throw new Error(await response.text());
    }
}


async function addValoracioAnswers(answers){
    const response = await fetch(
        `${SUPABASE_URL}/rest/v1/valoracions_respostes`,
        {
            method:"POST",
            headers:{
                apikey:SUPABASE_API_KEY,
                Authorization:`Bearer ${SUPABASE_API_KEY}`,
                "Content-Type":"application/json"
            },
            body:JSON.stringify(answers)
        }
    );
    if(!response.ok) throw new Error(await response.text());
}


async function deleteQuestion(uuid){
    const response = await fetch(
        `${SUPABASE_URL}/rest/v1/questions?uuid=eq.${uuid}`,
        {
            method:"DELETE",
            headers:{
                apikey: SUPABASE_API_KEY,
                Authorization: `Bearer ${SUPABASE_API_KEY}`
            }
        }
    );

    if(!response.ok) throw new Error(await response.text());
}
