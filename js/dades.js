let equipActualUuid = "";
let dadesTeams = [];

document.getElementById("passarValoracioButton").addEventListener("click", async()=>{
    equipValoracio = equipActualUuid;
    document.getElementById("playerCard").style.display="none";
    await obrirSelectorValoracions();
});


async function obrirDades(){
    mostrarPantalla("dades");
    await carregarDadesTeams();
}


async function obrirSelectorValoracions(){
    mostrarPantalla("seleccionValoracio");
    const div = document.getElementById("llistaValoracions");
    div.innerHTML="";
    const valoracions = await getAllValoracions();
    valoracions.forEach(valoracio=>{
        const button = document.createElement("button");
        button.textContent = valoracio.name;
        button.onclick = async()=>{
            await obrirValoracio(valoracio.uuid, jugadorActual.uuid);
        };
        div.appendChild(button);
    });
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

    return users.filter(u=>u.role==="JUGADOR").map(user=>{
            const rpeJugador = rpes
                .filter(r=>r.player_uuid===user.uuid)
                .map(r=>{
                    return {
                        ...r,
                        data: r.date_practice ? convertirDataRPE(r.date_practice) : null,
                        dataSort: r.date_practice ? convertirDataRPE(r.date_practice) : new Date(0),
                        load: Number(r.weighted_register)
                    };
                })
                .sort((a,b)=>b.dataSort-a.dataSort);

            const setmanaRPE = rpeJugador.filter(r=>r.dataSort>=setmana);
            const mesRPE = rpeJugador.filter(r=>r.dataSort>=mes);

            const load7 = setmanaRPE.reduce((sum,r)=>sum+r.load,0);
            const load28 = mesRPE.reduce((sum,r)=>sum+r.load,0);

            const acwr = load28===0 ? 0 : load7/(load28/4);

            return {
                uuid: user.uuid,
                nom: capitalize(user.name) + " " + capitalize(user.surname),
                acwr,
                load7,
                load28,
                sessions7: setmanaRPE.length,
                sessions28: mesRPE.length,
                lastPractice: rpeJugador.length>0 ? rpeJugador[0].date_practice : null,
                averageLoad: setmanaRPE.length>0 ? load7/setmanaRPE.length : 0,
                daysWithoutTraining: rpeJugador.length>0 ? Math.floor((new Date()-rpeJugador[0].dataSort)/(1000*60*60*24)) : null
            };
        })
        .sort((a,b)=>{
            function priority(value){
                if(value>=0.8 && value<=1.3) return 3;
                if(value<0.8) return 2;
                return 1;
            }
            const pa=priority(a.acwr);
            const pb=priority(b.acwr);

            if(pa!==pb) return pa-pb;

            return b.acwr-a.acwr;
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
                <div class="valorJugador" style="background:${colorACWR(jugador1.acwr)}">${jugador1.acwr.toFixed(2)}</div>
            </div>

            ${jugador2 ? `
                <div class="cardDadaJugador">
                    <div class="nomJugador">${jugador2.nom}</div>
                    <div class="valorJugador" style="background:${colorACWR(jugador2.acwr)}">${jugador2.acwr.toFixed(2)}</div>
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

    jugadorActual=jugador;
    document.getElementById("playerCardName").textContent = jugador.nom;

    const estat=calcularEstatJugador(jugador);
    const status=document.getElementById("playerStatus");
    status.textContent=estat.text;
    status.className= "playerStatus "+estat.class;

    document.getElementById("playerACWR").textContent=jugador.acwr.toFixed(2);
    document.getElementById("playerLoad7").textContent=jugador.load7.toFixed(0)+" AU";
    const variacio=calcularVariacioCarrega(jugador);
    document.getElementById("playerVariation").textContent=(variacio>=0?"+":"")+variacio.toFixed(0)+"%";
    document.getElementById("playerSessions").textContent=jugador.sessions7;
    document.getElementById("playerLastPractice").textContent=jugador.lastPractice ?? "-";
    document.getElementById("playerAverageLoad").textContent=jugador.averageLoad.toFixed(0)+" AU";
    document.getElementById("playerDaysWithoutTraining").textContent=jugador.daysWithoutTraining ?? "-";
    const diesRPE = await calcularDiesSenseRPE(jugador.uuid);
    document.getElementById("playerDaysWithoutRPE").textContent = diesRPE === null ? "-" : diesRPE;

    const wellness = await calcularWellnessDetallat(jugador.uuid);
    jugador.wellness = wellness;
    pintarWellness(wellness);

    const lesio=await comprovarLesioActiva(jugador.uuid);
    jugador.lesionActiva=lesio.activa;
    pintarEstatLesio(lesio);

    const historialLesions = await obtenirHistorialLesions(jugador.uuid);
    pintarHistorialLesions(historialLesions);

    await carregarUltimesSessions(jugador.uuid);

    generarAlertes(jugador);

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


async function calcularWellnessDetallat(userUuid){

    const questionaris = await getQuestionarisByCodeWord("WELLNESS");

    if(questionaris.length===0) return null;


    const qUuids = questionaris.map(q=>q.uuid);


    const questionarisUser = await getQuestionarisUser(
        qUuids,
        [userUuid]
    );


    if(questionarisUser.length===0) return null;


    const dates = questionarisUser.map(q=>({
        uuid:q.uuid,
        date:q.data_resposta ? convertirData(q.data_resposta) : new Date(0)
    }));


    const ultima = dates.sort((a,b)=>b.date-a.date)[0];


    const respostes = await getAnswersByQuestionari([
        ultima.uuid
    ]);


    const valors = respostes
        .map(r=>Number(r.resposta));


    const wellness = {

        estres: valors[0] ?? 0,

        fatiga: valors[1] ?? 0,

        dolor: valors[2] ?? 0,

        anim: valors[3] ?? 0

    };


    wellness.total =
        wellness.estres +
        wellness.fatiga +
        wellness.dolor +
        wellness.anim;


    wellness.mitjana =
        wellness.total / 4;


    if(wellness.mitjana <= 2){

        wellness.estat="🟢";
        wellness.class="available";

    }
    else if(wellness.mitjana <= 3.5){

        wellness.estat="🟡";
        wellness.class="warning";

    }
    else{

        wellness.estat="🔴";
        wellness.class="danger";

    }


    return wellness;
}


function calcularEstatJugador(player){

    let score = 100;
    if(player.acwr > 1.5) score -= 30;
    if(player.acwr < 0.8) score -= 10;

    if(score >=75) return {text:"🟢 Disponible", class:"available"};
    if(score >=50) return {text:"🟡 Vigilància", class:"warning"};
    
    return {text:"🔴 Risc", class:"danger"};
}


function calcularVariacioCarrega(jugador){

    if(jugador.load28===0) return 0;
    
    const setmanaAnterior = (jugador.load28 - jugador.load7) / 3;
    if(setmanaAnterior===0) return 0;

    return ((jugador.load7 - setmanaAnterior) / setmanaAnterior) * 100;
}


async function comprovarLesioActiva(userUuid){
    const lesions = await getInjuriesByUuid([userUuid]);
    console.log("LESIONS:",lesions);

    for(const lesio of lesions){
        const episodis = await getPhysioEpisodesByInjury(lesio.uuid);
        console.log("EPISODIS:",episodis);

        const actiu = episodis.find(e=>e.closed===0);
        if(actiu){
            return {
                activa:true,
                injury:lesio,
                episode:actiu
            };
        }
    }

    return {activa:false};
}


function pintarEstatLesio(data){
    const div = document.getElementById("playerInjury");
    if(!data.activa){
        div.innerHTML = `
            <div class="alertPlayer">🟢 Sense lesions actives</div>
        `;
        return;
    }

    div.innerHTML = `
        <div class="alertPlayer">
            🔴 LESIÓ ACTIVA
            <br><br>
            Zona: ${data.injury.zona}
            <br>
            Tipus: ${data.injury.tipus}
            <br>
            Gravetat: ${data.injury.gravetat}
        </div>
    `;
}


async function carregarUltimesSessions(userUuid){
    const div = document.getElementById("playerLastSessions");
    div.innerHTML="";

    const sessions = await getRPEByUsers([userUuid]);
    console.log("RPE:",sessions);

    sessions.sort((a,b)=> convertirDataRPE(b.date_practice) - convertirDataRPE(a.date_practice)).slice(0,5)
        .forEach(s=>{
            const fila = document.createElement("div");
            fila.className = "lastSession";
            fila.textContent = `${s.date_practice} - ${s.register} RPE - ${s.weighted_register} AU`;
            div.appendChild(fila);
        });
}


function generarAlertes(jugador){
    const div = document.getElementById("playerAlerts");
    div.innerHTML="";

    const alertes=[];

    if(jugador.lesionActiva) alertes.push("🔴 Lesió activa");
    if(jugador.acwr>1.5) alertes.push("🔴 ACWR elevat");
    if(jugador.acwr<0.8) alertes.push("🟡 ACWR baix");
    if(jugador.sessions7===0) alertes.push("🟡 Sense entrenaments últims 7 dies");

    if(alertes.length===0){
        div.innerHTML= `
            <div class="alertPlayer">🟢 Sense alertes</div>
        `;
        return;
    }

    alertes.forEach(a=>{
        const e=document.createElement("div");
        e.className="alertPlayer";
        e.textContent=a;
        div.appendChild(e);
    });
}


async function calcularDiesSenseRPE(userUuid){
    const rpes = await getRPEByUsers([userUuid]);

    if(rpes.length===0) return null;

    rpes.sort((a,b)=>{ return convertirDataRPE(b.date_practice) - convertirDataRPE(a.date_practice); });

    const ultima = convertirDataRPE(rpes[0].date_practice);
    const avui = new Date();
    avui.setHours(0,0,0,0);

    return Math.floor((avui-ultima)/(1000*60*60*24));
}


async function obtenirHistorialLesions(userUuid){

    const lesions = await getInjuriesByUuid([userUuid]);
    if(lesions.length===0) return [];
    const resultat=[];

    for(const lesio of lesions){
        const episodis = await getEpisodesByInjury([lesio.uuid]);
        episodis.forEach(e=>{
            resultat.push({
                zona: lesio.zona,
                tipus: lesio.tipus,
                gravetat: lesio.gravetat,
                inici: e.start_date,
                final: e.end_date,
                activa: e.closed===0
            });
        });
    }

    return resultat.sort((a,b)=>{
        return new Date(b.inici)-new Date(a.inici);
    });
}



function pintarHistorialLesions(lesions){

    const div = document.getElementById("playerInjuryHistory");
    div.innerHTML="";

    if(lesions.length===0){
        div.innerHTML=`<div class="alertPlayer">🟢 Sense historial de lesions</div>`;
        return;
    }

    lesions.slice(0,5).forEach(l=>{
        const fila=document.createElement("div");
        fila.className="lastSession";
        fila.innerHTML=`
            ${l.activa ? "🔴" : "⚪"}${l.zona} - ${l.tipus}
            <br>
            ${l.inici ?? "-"} ${l.final ? " → "+l.final : ""}
        `;
        div.appendChild(fila);
    });
}


function pintarWellness(w){

    const globalValue = document.getElementById("wellnessGlobalValue");
    const globalDot = document.getElementById("wellnessGlobalDot");
    const variables = document.getElementById("wellnessVariables");

    if(!w){
        globalValue.textContent = "- / 5";
        globalDot.style.background = "#bbb";
        variables.innerHTML = "";
        return;
    }

    console.log(w);
    globalValue.textContent = w.mitjana.toFixed(1) + " / 5";
    globalDot.style.background = colorGlobalWellness(w.mitjana);

    const dades = [
        {
            nom:"Estrès",
            valor:w.estres
        },
        {
            nom:"Fatiga",
            valor:w.fatiga
        },
        {
            nom:"Dolor",
            valor:w.dolor
        },
        {
            nom:"Ànim",
            valor:w.anim
        }
    ];

    variables.innerHTML = dades.map(x => `
        <div class="wellnessVariable">

            <span>${x.nom}</span>

            <span class="wellnessVariableValue">

                <span
                    class="dotWellness"
                    style="background:${colorWellness(x.nom,x.valor)}">
                </span>

                ${x.valor ?? "-"}

            </span>

        </div>
    `).join("");
}


function colorWellness(tipus, valor){

    if(valor == null) return "#bbb";

    if(tipus === "Ànim"){
        if(valor >= 4) return "#006400";
        if(valor === 3) return "#FCB714";
        return "#D90808";
    }

    if(valor <= 2) return "#006400";
    if(valor === 3) return "#FCB714";
    return "#D90808";
}


function colorGlobalWellness(valor){

    if(valor >= 4) return "#006400";
    if(valor >= 3) return "#FCB714";
    return "#D90808";
}
