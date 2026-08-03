let equipActualUuid = "";
let dadesTeams = [];

document.getElementById("passarValoracioButton").addEventListener("click", async()=>{
    equipValoracio = equipActualUuid;
    await obrirSelectorValoracions();
});


async function obrirDades(){
    mostrarPantalla("dades");
    await carregarDadesTeams();
}


async function carregarDadesTeams(){
    dadesTeams = await getAllTeams();

    const selector = document.getElementById("selectorDadesTeams");
    selector.innerHTML = "";

    dadesTeams.forEach(team=>{
       const option = document.createElement("option");
        option.value = team.uuid;
        option.textContent = team.team_name;

        selector.appendChild(option);
    });

    if(dadesTeams.length > 0) await carregarDadesEquip(dadesTeams[0].uuid);
}


document.getElementById("selectorDadesTeams").addEventListener("change", async e=>{
    await carregarDadesEquip(e.target.value);
});


async function carregarDadesEquip(teamUuid){

    const userTeams = await getPlayersByTeam(teamUuid);
    equipActualUuid = teamUuid;
    
    const userUuids = userTeams.map(x => x.user_uuid);
    const users = await getUsersByUserTeam(userUuids);
    const rpes = await getRPEByUsers(userUuids);
    const resultats = calcularACWR(users, rpes);

    pintarDades(resultats);
}


function calcularACWR(users,rpes){
    const avui = new Date();
    avui.setHours(0,0,0,0);

    const setmana = new Date(avui);
    setmana.setDate(avui.getDate()-7);

    const mes = new Date(avui);
    mes.setDate(avui.getDate()-28);

    const setmanaRPE = rpes.filter(r=>{
        const data = convertirData(r.date_practice);
        return data>=setmana;
    });

    const mesRPE = rpes.filter(r=>{
        const data = convertirData(r.date_practice);
        return data>=mes;
    });

    return users.filter(u=>u.role==="JUGADOR").map(user=>{
        const setmanaValors = setmanaRPE.filter(r=>r.player_uuid===user.uuid).map(r=>Number(r.weighted_register));
        const mesValors = mesRPE.filter(r=>r.player_uuid===user.uuid).map(r=>Number(r.weighted_register));

        const setmanaMitjana = setmanaValors.length===0 ? 0 : setmanaValors.reduce((a,b)=>a+b,0) / setmanaValors.length;
        const mesMitjana = mesValors.length===0 ? 0 : mesValors.reduce((a,b)=>a+b,0) / mesValors.length;

        return {
            uuid:user.uuid,
            nom: capitalize(user.name) +" "+ capitalize(user.surname),
            value: mesMitjana===0 ? 0 : setmanaMitjana/mesMitjana
        };
    }).sort((a,b)=>{
        function priority(value){
            if(value>=0.8 && value<=1.3) return 0;
            if(value<0.8) return 1;
            return 2;
        }

        const pa=priority(a.value);
        const pb=priority(b.value);
        if(pa!==pb) return -pa+pb;
        return b.value-a.value;
    });
}


function convertirData(data){
    const parts=data.split("-");
    return new Date(Number(parts[2]), Number(parts[1])-1, Number(parts[0]));
}


function pintarDades(jugadors){

    const div = document.getElementById("llistaDadesJugadors");
    div.innerHTML = "";

    for(let i = 0; i < jugadors.length; i += 2){
        const fila = document.createElement("div");
        fila.className = "filaJugadors";

        const jugador1 = jugadors[i];
        const jugador2 = jugadors[i+1];

        fila.innerHTML = `
            <div class="cardDadaJugador">
                <div class="nomJugador">${jugador1.nom}</div>
                <div class="valorJugador" style="background:${colorACWR(jugador1.value)}">${jugador1.value.toFixed(2)}</div>
            </div>

            ${jugador2 ? `
                <div class="cardDadaJugador">
                    <div class="nomJugador">${jugador2.nom}</div>
                    <div class="valorJugador" style="background:${colorACWR(jugador2.value)}">${jugador2.value.toFixed(2)}</div>
                </div>
                ` : `
                <div></div>
                `
            }
        `;
        div.appendChild(fila);

        fila.children[0].onclick = ()=>mostrarCardJugador(jugador1);
        if(jugador2){
            fila.children[1].onclick = ()=>mostrarCardJugador(jugador2);
        }
    }
}


async function mostrarCardJugador(jugador){
    jugadorActual = jugador;
    document.getElementById("playerCardName").textContent = jugador.nom;
    const acwr = jugador.value;
    const acwrElement = document.getElementById("playerACWR");
    acwrElement.textContent = acwr.toFixed(2);
    acwrElement.style.background = colorACWR(acwr);
    const wellness = await calcularWellness(jugador.uuid);
    document.getElementById("playerWellness").textContent = wellness.toFixed(0);
    document.getElementById("playerCard").style.display="flex";
}


document.getElementById("tancarCardButton").addEventListener("click", ()=>{
    document.getElementById("playerCard").style.display="none";
});


function colorACWR(value){
    if(value < 0.01) return "white";
    if(value < 0.8) return "#FCB714";
    if(value < 1.3) return "#006400";
    if(value < 1.5) return "#FCB714";
    return "#D90808";
}


function convertirDataRPE(data){
    const [d,m,y] = data.split("-");
    return new Date(y, m-1, d);
}


async function calcularWellness(userUuid){
    const questionaris = await getQuestionarisByCodeWord("WELLNESS");
    if(questionaris.length===0) return 0;

    const qUuids = questionaris.map(q=>q.uuid);

    const questionarisUser = await getQuestionarisUser(qUuids, [userUuid]);
    if(questionarisUser.length===0) return 0;

    const respostes = await getAnswersByQuestionari(questionarisUser.map(q=>q.uuid));
    const dates = questionarisUser.map(q=>({
        uuid:q.uuid,
        date:convertirData(q.data_resposta)
    }));

    if(dates.length===0) return 0;

    const ultimaData = dates.sort((a,b)=>b.date-a.date)[0];
    const ultimaSessio = ultimaData.uuid;
    return respostes.filter(r=>r.questionari_user_uuid===ultimaSessio).map(r=>Number(r.resposta)).reduce((a,b)=>a+b, 0);
}
