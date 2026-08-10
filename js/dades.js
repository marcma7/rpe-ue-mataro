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


async function mostrarCardJugador(jugador) {
    try {
        jugadorActual = jugador;

        /* CAPÇALERA */
        document.getElementById("playerCardName").textContent = jugador.nom;

        /* ESTAT ACTUAL */
        document.getElementById("playerACWR").textContent = typeof jugador.acwr === "number" ? jugador.acwr.toFixed(2) : "-";
        document.getElementById("playerLoad7").textContent = typeof jugador.load7 === "number" ? jugador.load7.toFixed(0) + " AU" : "-";

        let variacio = null;
        try {
            variacio = calcularVariacioCarrega(jugador);
        } catch (e) {
            console.warn("Error calculant variació:", e);
        }

        document.getElementById("playerVariation").textContent = variacio !== null && !isNaN(variacio) ? (variacio >= 0 ? "+" : "") + variacio.toFixed(0) + "%" : "-";

        /* ACTIVITAT */
        document.getElementById("playerSessions").textContent = jugador.sessions7 ?? "-";
        document.getElementById("playerLastPractice").textContent = jugador.lastPractice ?? "-";
        document.getElementById("playerAverageLoad").textContent = typeof jugador.averageLoad === "number" ? jugador.averageLoad.toFixed(0) + " AU" : "-";
        document.getElementById("playerDaysWithoutTraining").textContent = jugador.daysWithoutTraining ?? "-";

        /* RPE */
        const diesRPE = await calcularDiesSenseRPE(jugador.uuid);
        jugador.daysWithoutRPE = diesRPE;
        document.getElementById("playerDaysWithoutRPE").textContent = diesRPE === null ? "-" : diesRPE;

        /* WELLNESS */
        const wellness = await calcularWellnessDetallat(jugador.uuid);
        jugador.wellness = wellness;
        pintarWellness(wellness);

        /* QÜESTIONARIS */
        const questionaris = await carregarQuestionarisJugador(jugador.uuid);
        pintarQuestionaris(questionaris);

        /* VALORACIONS */
        const respostesValoracions = await carregarValoracionsJugador(jugador.uuid);
        const valoracions = agruparValoracions(respostesValoracions);
        pintarValoracions(valoracions);

        /* LESIONS */
        const lesions = await carregarLesionsJugador(jugador.uuid);
 
        /* FISIO */
        const episodis = await carregarEpisodisFisio(lesions);
        const lesionsPreparades = prepararLesions(lesions, episodis);
        pintarLesioActual(lesionsPreparades, episodis);
        pintarHistorialLesions(lesionsPreparades, episodis);
        pintarFisio(episodis);

        /* ÚLTIMES SESSIONS */
        await carregarUltimesSessions(jugador.uuid);

        /* ALERTES */
        jugador.daysWithoutRPE = diesRPE;

        const risc = calcularRiscJugador(jugador, wellness, lesionsPreparades, episodis);
        console.log(risc);
        jugador.risc = risc;

        const estat = calcularEstatJugador(risc);
        
        const status = document.getElementById("playerStatus");
        status.textContent = estat.text;
        status.className = "playerStatus " + estat.class;
        const alertes = calcularAlertesJugador(jugador, questionaris, valoracions, lesionsPreparades, episodis, wellness);
        pintarAlertes(alertes);

        /* RESUM */
        pintarResumJugador(jugador, alertes, lesionsPreparades, wellness);

        /* MOSTRAR CARD */
        document.getElementById("playerCard").style.display = "flex";
    } catch (error) {
        console.error("Error mostrant card jugador:", error);
        alert("No s'ha pogut carregar tota la informació del jugador.");
    }
}



function prepararLesions(lesions, episodis) {

    if (!lesions || !lesions.length) {
        return [];
    }

    return lesions.map(lesio => {

        // Buscar l'episodi associat a aquesta lesió
        const episodi = (episodis || []).find(
            e => e.injury_uuid === lesio.uuid
        );

        // Una lesió es considera tancada
        // si té un episodi i aquest està closed = 1
        const closed =
            episodi
                ? Number(episodi.closed) === 1
                : false;

        // Visites de fisioteràpia de l'episodi
        const visites =
            episodi?.physio_visits || [];

        // Ordenar visites de més recent a més antiga
        const visitesOrdenades =
            ordenarPerDataDesc(visites, "date");

        const ultimaVisita =
            visitesOrdenades.length > 0
                ? visitesOrdenades[0]
                : null;

        return {

            ...lesio,

            // Episodi de fisioteràpia associat
            episodi: episodi || null,

            // Informació preparada per la UI
            _closed: closed,

            _activa: !closed,

            _visites: visitesOrdenades,

            _numVisites: visitesOrdenades.length,

            _ultimaVisita: ultimaVisita,

            _ultimaVisitaData:
                ultimaVisita?.date || null
        };
    });
}



function tancarPlayerCard() {

    document.getElementById(
        "playerCard"
    ).style.display = "none";

}


document
    .getElementById("tancarCardButton")
    ?.addEventListener(
        "click",
        tancarPlayerCard
    );


document
    .getElementById("tancarCardButtonBottom")
    ?.addEventListener(
        "click",
        tancarPlayerCard
    );

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
    const questionarisUser = await getQuestionarisUser(qUuids, [userUuid]);
    if(questionarisUser.length===0) return null;

    const dates = questionarisUser.map(q=>({
        uuid:q.uuid,
        date:q.data_resposta ? convertirData(q.data_resposta) : new Date(0)
    }));

    const ultima = dates.sort((a,b)=>b.date-a.date)[0];

    const respostes = await getAnswersByQuestionari([ultima.uuid]);
    const valors = respostes.map(r=>Number(r.resposta));

    const wellness = {
        estres: valors[0] ?? 0,
        fatiga: valors[1] ?? 0,
        dolor: valors[2] ?? 0,
        anim: valors[3] ?? 0
    };
    wellness.total = wellness.estres + wellness.fatiga + wellness.dolor + wellness.anim;
    wellness.mitjana = wellness.total / 4;

    if(wellness.mitjana <= 2){
        wellness.estat="🟢";
        wellness.class="available";
    } else if(wellness.mitjana <= 3.5){
        wellness.estat="🟡";
        wellness.class="warning";
    } else {
        wellness.estat="🔴";
        wellness.class="danger";
    }

    return wellness;
}


function calcularEstatJugador(risc){
    if (risc.score >= 75) return {text:"🔴 Risc molt alt", class:"danger"};
    if (risc.score >= 50) return {text:"🟠 Risc alt", class:"warning"};
    if (risc.score >= 25) return {text:"🟡 Risc moderat", class:"warning"};
    return {text:"🟢 Risc baix", class:"available"};
}


function calcularVariacioCarrega(jugador){

    if(jugador.load28===0) return 0;
    
    const setmanaAnterior = (jugador.load28 - jugador.load7) / 3;
    if(setmanaAnterior===0) return 0;

    return ((jugador.load7 - setmanaAnterior) / setmanaAnterior) * 100;
}


async function comprovarLesioActiva(userUuid){
    const lesions = await getInjuriesByUuid([userUuid]);

    for(const lesio of lesions){
        const episodis = await getPhysioEpisodesByInjury(lesio.uuid);

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


/* =========================================================
   UTILITATS
========================================================= */

function parseData(data) {

    if (!data) return null;

    if (data instanceof Date) return data;

    const d = new Date(data);

    if (!isNaN(d.getTime())) {
        return d;
    }

    // dd/MM/yyyy
    const match = String(data).match(
        /^(\d{1,2})\/(\d{1,2})\/(\d{4})/
    );

    if (match) {

        const [, dia, mes, any] = match;

        return new Date(
            Number(any),
            Number(mes) - 1,
            Number(dia)
        );
    }

    return null;
}


function formatData(data) {

    const d = parseData(data);

    if (!d) return "-";

    return d.toLocaleDateString("ca-ES");
}


function diesEntre(data) {

    const d = parseData(data);

    if (!d) return null;

    const ara = new Date();

    return Math.floor(
        (ara - d) / (1000 * 60 * 60 * 24)
    );
}


function escaparHTML(text) {

    if (text === null || text === undefined) {
        return "";
    }

    return String(text)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


function ordenarPerDataDesc(array, camp) {

    return [...array].sort((a, b) => {

        const da = parseData(a[camp]);
        const db = parseData(b[camp]);

        if (!da && !db) return 0;
        if (!da) return 1;
        if (!db) return -1;

        return db - da;
    });
}


/* =========================================================
   QÜESTIONARIS
========================================================= */

async function carregarQuestionarisJugador(userUuid) {
    const questionaris = await getQuestionarisPerUsuari( userUuid ); 
    return ordenarPerDataDesc( questionaris, "data_resposta" );
}


function pintarQuestionaris(questionaris) {

    const container = document.getElementById("playerQuestionnaires");
    if (!container) return;
    container.innerHTML = "";
    if (!questionaris.length) {
        container.innerHTML =
            `<div class="noData">
                Aquest jugador encara no té qüestionaris.
            </div>`;
        return;
    }

    questionaris.forEach(q => {
        const nom = q.questionaris?.name || "Qüestionari";
        const contestat = Number(q.contestat) === 1;
        const data = q.data_resposta ||
            q.data_enviament;

        const item = document.createElement("div");

        item.className = "dataItem";

        item.innerHTML = `

            <div class="dataItemLeft">

                <span class="dataItemTitle">
                    ${escaparHTML(nom)}
                </span>

                <span class="dataItemDate">

                    ${contestat
                        ? "Última resposta: " +
                          formatData(data)
                        : "Enviat: " +
                          formatData(q.data_enviament)
                    }

                </span>

            </div>

            <span class="dataItemStatus
                ${contestat
                    ? "statusDone"
                    : "statusPending"}">

                ${contestat
                    ? "CONTESTAT"
                    : "PENDENT"}

            </span>

        `;

        container.appendChild(item);
    });
}


/* =========================================================
   VALORACIONS
========================================================= */

async function carregarValoracionsJugador(userUuid) {

   return await getValoracionsRespostesByUser(userUuid);
}


function agruparValoracions(respostes) {

    const mapa = new Map();

    respostes.forEach(r => {

        const valoracio =
            r.valoracions_items?.valoracions;

        if (!valoracio) return;

        const uuid = valoracio.uuid;

        if (!mapa.has(uuid)) {

            mapa.set(uuid, {

                uuid: uuid,

                name: valoracio.name,

                description:
                    valoracio.description,

                respostes: []

            });
        }

        mapa.get(uuid).respostes.push(r);
    });


    const resultado = [];

    mapa.forEach(v => {

        const ordenades =
            ordenarPerDataDesc(
                v.respostes,
                "date"
            );

        resultado.push({

            ...v,

            ultimaData:
                ordenades.length
                    ? ordenades[0].date
                    : null,

            nombreRespostes:
                ordenades.length

        });
    });


    return resultado.sort((a, b) => {

        const da = parseData(a.ultimaData);
        const db = parseData(b.ultimaData);

        if (!da) return 1;
        if (!db) return -1;

        return db - da;
    });
}


function pintarValoracions(valoracions) {

    const container =
        document.getElementById("playerEvaluations");

    if (!container) return;

    container.innerHTML = "";

    if (!valoracions.length) {

        container.innerHTML =
            `<div class="noData">
                Aquest jugador encara no té valoracions.
            </div>`;

        return;
    }

    valoracions.forEach(v => {

        const item =
            document.createElement("div");

        item.className = "dataItem";

        item.innerHTML = `

            <div class="dataItemLeft">

                <span class="dataItemTitle">

                    ${escaparHTML(v.name)}

                </span>

                <span class="dataItemDate">

                    Última valoració:
                    ${formatData(v.ultimaData)}

                    · ${v.nombreRespostes} respostes

                </span>

            </div>

            <span class="dataItemStatus statusDone">

                REALITZADA

            </span>

        `;

        container.appendChild(item);

    });
}


/* =========================================================
   LESIONS
========================================================= */

async function carregarLesionsJugador(userUuid) {

    return await getInjuriesByUuid([userUuid]);
}


async function carregarEpisodisFisio(lesions) {

    if (!lesions.length) return [];

    const injuryUuids = lesions.map(l => l.uuid);

    return await getPhysioEpisodesByInjuries( injuryUuids );

}


function pintarLesioActual(lesions, episodis) {

    const container =
        document.getElementById("playerInjury");

    if (!container) return;

    container.innerHTML = "";

    const activa =
        lesions.find(l => {

            const episodi =
                episodis.find(
                    e => e.injury_uuid === l.uuid
                );

            return !episodi ||
                   Number(episodi.closed) === 0;

        });


    if (!activa) {

        container.innerHTML =
            `<div class="noData">
                No hi ha cap lesió activa.
            </div>`;

        return;
    }


    const episodi =
        episodis.find(
            e => e.injury_uuid === activa.uuid
        );


    const visites =
        episodi?.physio_visits || [];


    const ultimaVisita =
        ordenarPerDataDesc(
            visites,
            "date"
        )[0];


    container.innerHTML = `

        <div class="injuryCard">

            <strong>
                ${escaparHTML(
                    activa.zona || "Lesió"
                )}
            </strong>

            <div>
                Tipus:
                ${escaparHTML(
                    activa.tipus || "-"
                )}
            </div>

            <div>
                Gravetat:
                ${escaparHTML(
                    activa.gravetat || "-"
                )}
            </div>

            <div>
                Data:
                ${formatData(
                    activa.data_lesio
                )}
            </div>

            <div>
                Fisio:
                ${
                    Number(activa.demana_fisio) === 1
                        ? "Sí"
                        : "No"
                }
            </div>

            ${
                ultimaVisita
                ? `
                    <div style="margin-top:8px;">
                        Última visita:
                        ${formatData(
                            ultimaVisita.date
                        )}
                    </div>
                `
                : ""
            }

        </div>
    `;
}


function pintarHistorialLesions(lesions, episodis) {

    const container =
        document.getElementById(
            "playerInjuryHistory"
        );

    if (!container) return;

    container.innerHTML = "";

    if (!lesions.length) {

        container.innerHTML =
            `<div class="noData">
                No hi ha historial de lesions.
            </div>`;

        return;
    }


    lesions.forEach(lesio => {

        const episodi =
            episodis.find(
                e => e.injury_uuid === lesio.uuid
            );

        const tancada =
            episodi &&
            Number(episodi.closed) === 1;


        const item =
            document.createElement("div");

        item.className = "dataItem";

        item.innerHTML = `

            <div class="dataItemLeft">

                <span class="dataItemTitle">

                    ${escaparHTML(
                        lesio.zona ||
                        "Lesió"
                    )}

                </span>

                <span class="dataItemDate">

                    ${formatData(
                        lesio.data_lesio
                    )}

                    ·

                    ${escaparHTML(
                        lesio.tipus || "-"
                    )}

                </span>

            </div>

            <span class="dataItemStatus
                ${
                    tancada
                        ? "statusDone"
                        : "statusDanger"
                }">

                ${
                    tancada
                        ? "TANCADA"
                        : "ACTIVA"
                }

            </span>

        `;

        container.appendChild(item);
    });
}


/* =========================================================
   FISIO
========================================================= */

function pintarFisio(episodis) {

    const container =
        document.getElementById("playerPhysio");

    if (!container) return;

    container.innerHTML = "";

    if (!episodis.length) {

        container.innerHTML =
            `<div class="noData">
                No hi ha episodis de fisioteràpia.
            </div>`;

        return;
    }


    episodis.forEach(episodi => {

        const visites =
            ordenarPerDataDesc(
                episodi.physio_visits || [],
                "date"
            );

        const ultima =
            visites[0];


        const item =
            document.createElement("div");

        item.className = "dataItem";

        item.style.flexDirection = "column";

        item.style.alignItems = "stretch";


        item.innerHTML = `

            <div style="
                display:flex;
                justify-content:space-between;
                align-items:center;
            ">

                <div class="dataItemLeft">

                    <span class="dataItemTitle">

                        Episodi de fisioteràpia

                    </span>

                    <span class="dataItemDate">

                        ${visites.length}
                        visita/es

                        ${
                            ultima
                            ? " · Última: " +
                              formatData(
                                  ultima.date
                              )
                            : ""
                        }

                    </span>

                </div>

                <span class="dataItemStatus
                    ${
                        Number(episodi.closed) === 1
                            ? "statusDone"
                            : "statusDanger"
                    }">

                    ${
                        Number(episodi.closed) === 1
                            ? "TANCAT"
                            : "OBERT"
                    }

                </span>

            </div>

            ${
                ultima
                ? `
                    <div style="
                        margin-top:8px;
                        font-size:12px;
                        color:#555;
                    ">

                        ${
                            escaparHTML(
                                ultima.feina_visita || "-"
                            )
                        }

                    </div>
                `
                : ""
            }

        `;

        container.appendChild(item);
    });
}


/* =========================================================
   ALERTES AUTOMÀTIQUES
========================================================= */

function calcularAlertesJugador(
    jugador,
    questionaris,
    valoracions,
    lesions,
    episodis,
    wellness
) {

    const alertes = [];


    /* =========================
       LESIÓ ACTIVA
    ========================= */

    const lesioActiva =
        lesions.some(lesio => {

            const episodi =
                episodis.find(
                    e =>
                        e.injury_uuid ===
                        lesio.uuid
                );

            return !episodi ||
                   Number(episodi.closed) === 0;
        });


    if (lesioActiva) {

        alertes.push({

            nivell: "danger",

            titol: "Lesió activa",

            text:
                "El jugador té una lesió o un episodi de fisioteràpia obert."

        });
    }


    /* =========================
       ACWR
    ========================= */

    const acwr =
        Number(jugador.acwr);


    if (!isNaN(acwr)) {

        if (acwr >= 1.5) {

            alertes.push({

                nivell: "danger",

                titol: "ACWR molt elevat",

                text:
                    `ACWR de ${acwr.toFixed(2)}.`
            });

        } else if (acwr >= 1.3) {

            alertes.push({

                nivell: "warning",

                titol: "ACWR elevat",

                text:
                    `ACWR de ${acwr.toFixed(2)}.`
            });
        }
    }


    /* =========================
       VARIACIÓ DE CÀRREGA
    ========================= */

    let variacio = null;

    try {

        variacio =
            calcularVariacioCarrega(
                jugador
            );

    } catch (e) {

        console.warn(
            "No s'ha pogut calcular variació",
            e
        );
    }


    if (
        variacio !== null &&
        !isNaN(variacio)
    ) {

        if (Math.abs(variacio) >= 50) {

            alertes.push({

                nivell: "danger",

                titol:
                    "Canvi important de càrrega",

                text:
                    `Variació de càrrega del ${
                        variacio >= 0 ? "+" : ""
                    }${variacio.toFixed(0)}%.`

            });

        } else if (
            Math.abs(variacio) >= 30
        ) {

            alertes.push({

                nivell: "warning",

                titol:
                    "Canvi de càrrega",

                text:
                    `Variació de càrrega del ${
                        variacio >= 0 ? "+" : ""
                    }${variacio.toFixed(0)}%.`

            });
        }
    }


    /* =========================
       WELLNESS
    ========================= */

    if (wellness) {

        const global =
            Number(
                wellness.global ??
                wellness.globalScore ??
                wellness.total
            );


        if (!isNaN(global)) {

            if (global <= 2) {

                alertes.push({

                    nivell: "danger",

                    titol: "Wellness molt baix",

                    text:
                        `Wellness global de ${global}/5.`

                });

            } else if (global <= 3) {

                alertes.push({

                    nivell: "warning",

                    titol: "Wellness baix",

                    text:
                        `Wellness global de ${global}/5.`

                });
            }
        }
    }


    /* =========================
       DIES SENSE ENTRENAR
    ========================= */

    const diesSenseEntrenar =
        Number(
            jugador.daysWithoutTraining
        );


    if (
        !isNaN(diesSenseEntrenar) &&
        diesSenseEntrenar >= 7
    ) {

        alertes.push({

            nivell: "warning",

            titol:
                "Període llarg sense entrenar",

            text:
                `${diesSenseEntrenar} dies sense entrenar.`

        });
    }


    /* =========================
       RPE
    ========================= */

    const diesSenseRPE =
        Number(
            jugador.daysWithoutRPE
        );


    if (
        !isNaN(diesSenseRPE) &&
        diesSenseRPE >= 3
    ) {

        alertes.push({

            nivell: "warning",

            titol: "RPE no registrat",

            text:
                `${diesSenseRPE} dies sense registrar RPE.`

        });
    }


    /* =========================
       QÜESTIONARIS
    ========================= */

    const pendents =
        questionaris.filter(
            q =>
                Number(q.contestat) !== 1
        );


    if (pendents.length > 0) {

        alertes.push({

            nivell: "info",

            titol:
                "Qüestionaris pendents",

            text:
                `${pendents.length} qüestionari(s) pendent(s).`

        });
    }


    /* =========================
       VALORACIONS ANTIGUES
    ========================= */

    if (valoracions.length) {

        const ultima =
            valoracions
                .filter(v => v.ultimaData)
                .sort((a, b) => {

                    const da =
                        parseData(a.ultimaData);

                    const db =
                        parseData(b.ultimaData);

                    return db - da;
                })[0];


        if (ultima) {

            const dies =
                diesEntre(
                    ultima.ultimaData
                );


            if (
                diasValid(dies) &&
                dies >= 90
            ) {

                alertes.push({

                    nivell: "info",

                    titol:
                        "Valoració antiga",

                    text:
                        `Fa ${dies} dies de l'última valoració.`

                });
            }
        }
    }


    /* =========================
       FISIO
    ========================= */

    const episodisOberts =
        episodis.filter(
            e => Number(e.closed) === 0
        );


    if (episodisOberts.length) {

        alertes.push({

            nivell: "warning",

            titol:
                "Seguiment de fisioteràpia",

            text:
                `${episodisOberts.length} episodi(s) de fisio obert(s).`

        });
    }


    return ordenarAlertes(alertes);
}


function diasValid(dies) {

    return (
        dies !== null &&
        !isNaN(dies)
    );
}


function ordenarAlertes(alertes) {

    const ordre = {

        danger: 1,

        warning: 2,

        info: 3
    };


    return alertes.sort(
        (a, b) =>
            ordre[a.nivell] -
            ordre[b.nivell]
    );
}


function pintarAlertes(alertes) {

    const container =
        document.getElementById(
            "playerAlerts"
        );

    if (!container) return;

    container.innerHTML = "";


    if (!alertes.length) {

        container.innerHTML = `

            <div class="noAlerts">

                ✓ No hi ha alertes automàtiques

            </div>

        `;

        return;
    }


    alertes.forEach(alerta => {

        const div =
            document.createElement("div");

        div.className =
            `alertCard alert${
                alerta.nivell
                    .charAt(0)
                    .toUpperCase() +
                alerta.nivell.slice(1)
            }`;


        const icon =
            alerta.nivell === "danger"
                ? "🔴"
                : alerta.nivell === "warning"
                    ? "🟠"
                    : "🔵";


        div.innerHTML = `

            <div class="alertIcon">
                ${icon}
            </div>

            <div class="alertContent">

                <div class="alertTitle">

                    ${escaparHTML(
                        alerta.titol
                    )}

                </div>

                <div class="alertDescription">

                    ${escaparHTML(
                        alerta.text
                    )}

                </div>

            </div>

        `;


        container.appendChild(div);

    });
}


function pintarResumJugador(jugador, alertes, lesions, wellness) {

    const summaryAlerts = document.getElementById("summaryAlerts");
    const summaryInjury = document.getElementById("summaryInjury");
    const summaryRPE = document.getElementById("summaryRPE");
    const summaryWellness = document.getElementById("summaryWellness");
    const summaryLastTraining = document.getElementById("summaryLastTraining");

    /* ESTAT */
    const summaryStatus = document.getElementById("summaryStatus");
    summaryStatus.textContent = `${jugador.risc.score}/100 · ${jugador.risc.text}`;
    summaryStatus.className = `summaryRisk ${jugador.risc.classe}`;
    summaryAlerts.textContent = alertes.length;

    /* LESIÓ */
    const lesioActiva = lesions.some(l => !l._closed);
    summaryInjury.textContent = lesioActiva ? "ACTIVA" : "Cap";

    /* RPE */
    const diesRPE = Number(jugador.daysWithoutRPE);
    summaryRPE.textContent = !isNaN(diesRPE) ? diesRPE === 0 ? "OK" : `${diesRPE} dies` : "-";

    /* WELLNESS */
    if (wellness) {
        const global = Number(wellness.global ?? wellness.globalScore ?? wellness.total);
        summaryWellness.textContent = !isNaN(global) ? `${global/4}/5` : "-";
    } else {
        summaryWellness.textContent = "-";
    }

    /* ÚLTIM ENTRENAMENT */
    summaryLastTraining.textContent = jugador.lastPractice || "-";
}


function calcularRiscJugador(jugador, wellness, lesions, episodis) {

    let risc = 0;
    const factors = [];

    function afegirPunts(punts, nom, detall) {
        risc += punts;
        factors.push({punts, nom, detall});
    }

    /* 1. LESIÓ / FISIO */
    const lesioActiva = (lesions || []).some(l => l._activa === true);

    if (lesioActiva) {
        afegirPunts(30, "Lesió activa", "El jugador té una lesió activa.");
    }

    const episodisOberts = (episodis || []).filter(e => Number(e.closed) === 0);
    if (!lesioActiva && episodisOberts.length > 0) {
        afegirPunts(15, "Seguiment de fisioteràpia", `${episodisOberts.length} episodi(s) de fisioteràpia obert(s).`);
    }

    /* 2. ACWR */
    const acwr = Number(jugador.acwr);
    if (!isNaN(acwr)) {
        if (acwr >= 1.5) {
            afegirPunts(25, "ACWR molt elevat", `ACWR ${acwr.toFixed(2)}.`);
        } else if (acwr >= 1.3) {
            afegirPunts(15, "ACWR elevat", `ACWR ${acwr.toFixed(2)}.`);
        } else if (acwr < 0.8) {
            afegirPunts(8, "ACWR baix", `ACWR ${acwr.toFixed(2)}.`);
        }
    }

    /* 3. VARIACIÓ DE CÀRREGA */
    let variacio = null;
    try {
        variacio = calcularVariacioCarrega(jugador);
    } catch (e) {
        variacio = null;
    }

    if (variacio !== null && !isNaN(variacio)) {
        const absVariacio = Math.abs(variacio);
        if (absVariacio >= 50) {
            afegirPunts(15, "Canvi molt important de càrrega", `Variació del ${variacio >= 0 ? "+" : ""}${variacio.toFixed(0)}%.`);
        } else if (absVariacio >= 30) {
            afegirPunts(8, "Canvi important de càrrega", `Variació del ${variacio >= 0 ? "+" : ""}${variacio.toFixed(0)}%.`);
        }
    }

    /* 4. WELLNESS GLOBAL */
    if (wellness) {
        const mitjana = Number(wellness.mitjana);
        if (!isNaN(mitjana)) {
            if (mitjana >= 4) {
                afegirPunts(20, "Wellness molt baix", `Valor global ${mitjana.toFixed(1)}/5.`);
            } else if (mitjana >= 3.5) {
                afegirPunts(12, "Wellness baix", `Valor global ${mitjana.toFixed(1)}/5.`);
            } else if (mitjana >= 3) {
                afegirPunts(5, "Wellness moderat", `Valor global ${mitjana.toFixed(1)}/5.`);
            }
        }

        /* VARIABLES INDIVIDUALS */
        const dolor = Number(wellness.dolor);
        const fatiga = Number(wellness.fatiga);
        const estres = Number(wellness.estres);
        const anim = Number(wellness.anim);

        if (dolor >= 4) {
            afegirPunts(15, "Dolor elevat", `Dolor ${dolor}/5.`);
        } else if (dolor === 3) {
            afegirPunts(7, "Dolor moderat", `Dolor ${dolor}/5.`);
        }

        if (fatiga >= 4) {
            afegirPunts(10, "Fatiga elevada", `Fatiga ${fatiga}/5.`);
        } else if (fatiga === 3) {
            afegirPunts(5, "Fatiga moderada", `Fatiga ${fatiga}/5.`);
        }

        if (estres >= 4) {
            afegirPunts(6, "Estrès elevat", `Estrès ${estres}/5.`);
        }

        if (anim <= 2) {
            afegirPunts(5, "Ànim baix", `Ànim ${anim}/5.`);
        }
    }

    /* 5. DIES SENSE ENTRENAR */
    const diesSenseEntrenar = Number(jugador.daysWithoutTraining);
    if (!isNaN(diesSenseEntrenar)) {
        if (diesSenseEntrenar >= 14) {
            afegirPunts(10, "Període molt llarg sense entrenar", `${diesSenseEntrenar} dies sense entrenar.`);
        } else if (diesSenseEntrenar >= 7) {
            afegirPunts(5, "Període sense entrenar", `${diesSenseEntrenar} dies sense entrenar.`);
        }
    }

    /* 6. RPE */
    const diesSenseRPE = Number(jugador.daysWithoutRPE);
    if (!isNaN(diesSenseRPE)) {
        if (diesSenseRPE >= 7 && Number(jugador.sessions7) > 0) {
            afegirPunts(8, "RPE no registrat", `${diesSenseRPE} dies sense registrar RPE tot i haver entrenat.`);
        } else if (diesSenseRPE >= 3 && Number(jugador.sessions7) > 0) {
            afegirPunts(4, "RPE incomplet", `${diesSenseRPE} dies sense registrar RPE.`);
        }
    }

    /* 7. DENSITAT D'ENTRENAMENT */
    const sessions7 = Number(jugador.sessions7);
    if (!isNaN(sessions7)) {
        if (sessions7 >= 6) {
            afegirPunts(8, "Alta densitat d'entrenament", `${sessions7} sessions en 7 dies.`);
        } else if (sessions7 >= 5) {
            afegirPunts(4, "Densitat d'entrenament elevada",`${sessions7} sessions en 7 dies.`);
        }
    }

    /* 8. POCA INFORMACIÓ PER ACWR */
    const sessions28 = Number(jugador.sessions28);
    if (!isNaN(sessions28) && sessions28 > 0 && sessions28 < 4) {
        factors.push({
            punts: 0,
            nom: "Poca informació per ACWR",
            detall: `Només ${sessions28} sessions registrades en 28 dies.`
        });
    }

    /* 9. COMBINACIONS DE RISC */
    if (!isNaN(acwr) && acwr >= 1.3 && wellness && Number(wellness.fatiga) >= 4) {
        afegirPunts(10, "Càrrega + fatiga", `ACWR ${acwr.toFixed(2)} amb fatiga ${wellness.fatiga}/5.`);
    }

    if (!isNaN(acwr) && acwr >= 1.3 && wellness && Number(wellness.dolor) >= 4) {
        afegirPunts(10, "Càrrega + dolor", `ACWR ${acwr.toFixed(2)} amb dolor ${wellness.dolor}/5.`);
    }

    /* RESULTAT  */
    // Limitem el resultat a 100
    risc = Math.min(Math.round(risc), 100);

    let nivell;
    let text;
    let classe;

    if (risc >= 75) {
        nivell = "danger";
        text = "Risc molt elevat";
        classe = "danger";
    } else if (risc >= 50) {
        nivell = "high";
        text = "Risc elevat";
        classe = "warning";
    } else if (risc >= 25) {
        nivell = "medium";
        text = "Vigilància";
        classe = "warning";
    } else {
        nivell = "low";
        text = "Risc baix";
        classe = "available";
    }

    return {
        score: risc,
        nivell,
        text,
        classe,
        factors: factors.sort((a, b) => b.punts - a.punts)
    };
}
