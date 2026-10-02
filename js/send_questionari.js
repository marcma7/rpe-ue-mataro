let usuarisEnviar = [];
let usuarisSeleccionats = [];
let equipsEnviar = [];
let equipsSeleccionats = [];

document.getElementById("enviarQuestionariButton").onclick = enviarQuestionaris;

document.getElementById("tornarEnviarQuestionariButton").onclick = ()=>{
    mostrarPantalla("gestioQuestionaris");
};


function obrirEnviar(q){

    questionariEnviar = q;
    usuarisSeleccionats = [];
    equipsSeleccionats = [];

    mostrarPantalla("enviarQuestionari");
    carregarEnviarQuestionari();

}


function obrirEnviarJugador(user, q){

    questionariEnviar = q;
    usuarisSeleccionats = [user];

    enviarQuestionaris();
}


function obrirEnviarValoracionsJugador(user, q, teamUuid){
    obrirValoracio(q.uuid, user.uuid, teamUuid);
}


async function carregarEnviarQuestionari(){
    const usersResponse = await fetch(
        `${SUPABASE_URL}/rest/v1/app_users?select=*`,
        {
            headers:{
                apikey:SUPABASE_API_KEY,
                Authorization:`Bearer ${SUPABASE_API_KEY}`
            }
        }
    );

    usuarisEnviar = await usersResponse.json();
    usuarisEnviar = usuarisEnviar.filter(u => u.role !== "TEAM");

    const teamsResponse = await fetch(
        `${SUPABASE_URL}/rest/v1/teams?select=*`,
        {
            headers:{
                apikey:SUPABASE_API_KEY,
                Authorization:`Bearer ${SUPABASE_API_KEY}`
            }
        }
    );
    equipsEnviar = await teamsResponse.json();

    const relacioResponse = await fetch(
        `${SUPABASE_URL}/rest/v1/user_teams?select=*`,
        {
            headers:{
                apikey:SUPABASE_API_KEY,
                Authorization:`Bearer ${SUPABASE_API_KEY}`
            }
        }
    );
    const relacions = await relacioResponse.json();

    const roleActual = obtenirRoleLocal();
    const userUuidActual = obtenirUserUuidLocal();

    if (roleActual === "SUPERADMIN") {
        equipsEnviar = equipsEnviar;
        usuarisEnviar = usuarisEnviar;
    } else {
        const meusEquips = relacions.filter(r => r.user_uuid === userUuidActual).map(r => r.team_uuid);
        equipsEnviar = equipsEnviar.filter(e => meusEquips.includes(e.uuid));
        const usuarisCompartits = relacions.filter(r => meusEquips.includes(r.team_uuid)).map(r => r.user_uuid);
        const usuarisUnics = [...new Set(usuarisCompartits)];
        usuarisEnviar = usuarisEnviar.filter(u => usuarisUnics.includes(u.uuid));
    }

    equipsEnviar = equipsEnviar.map(e => {
        const ids = relacions.filter(r => r.team_uuid === e.uuid).map(r => r.user_uuid);
        e.users = usuarisEnviar.filter(u => ids.includes(u.uuid));
        return e;
    });

    pintarEquipsEnviar();
    pintarUsuarisEnviar();
}


function pintarEquipsEnviar(){
    const div = document.getElementById("llistaEquipsEnviar");
    div.innerHTML = "";
    equipsEnviar.forEach(e => {
        const fila = document.createElement("label");
        fila.className = "filaEnviar";
        const checked = equipsSeleccionats.includes(e.uuid) ? "checked" : "";
        fila.innerHTML = `
            <span>${e.team_name}</span>
            <input type="checkbox" ${checked} onchange="toggleEquipEnviar('${e.uuid}')">
        `;
        div.appendChild(fila);
    });
}


function pintarUsuarisEnviar(){

    const div = document.getElementById("llistaUsuarisEnviar");
    div.innerHTML = "";

    const equipsOrdenats = [...equipsEnviar].sort((a, b) => a.team_name.localeCompare(b.team_name, "ca"));
    equipsOrdenats.forEach(equip => {
        const usuaris = [...equip.users].sort((a, b) => a.surname.localeCompare(b.surname, "ca"));

        const equipContainer = document.createElement("div");
        equipContainer.className = "grupEquipEnviar";
        equipContainer.dataset.uuid = equip.uuid;

        const capcalera = document.createElement("div");
        capcalera.className = "capcaleraEquipEnviar";
        capcalera.innerHTML = `
            <span class="fletxaEquipEnviar">▶</span>
            <span>${equip.team_name}</span>
        `;

        const jugadors = document.createElement("div");
        jugadors.className = "jugadorsEquipEnviar";
        jugadors.style.display = "none";

        usuaris.forEach(u => {
            const fila = document.createElement("label");
            fila.className = "filaEnviar";

            const nomComplet = `${capitalitzar(u.name)} ${capitalitzar(u.surname)}`;
            
            let mida = "14px";
            if(nomComplet.length > 12) mida = "13px";
            if(nomComplet.length > 20) mida = "12px";
            
            fila.innerHTML = `
                <span style="font-size:${mida}">${nomComplet}</span>
                <input type="checkbox" ${usuarisSeleccionats.includes(u.uuid) ? "checked" : ""} data-user-uuid="${u.uuid}" onchange="toggleUsuariEnviar('${u.uuid}')">
            `;

            jugadors.appendChild(fila);
        });

        capcalera.addEventListener("click", () => {
            const obert = jugadors.style.display !== "none";
            if(obert){
                jugadors.style.display = "none";
                capcalera.querySelector(".fletxaEquipEnviar").textContent = "▶";
            }else{
                jugadors.style.display = "block";
                capcalera.querySelector(".fletxaEquipEnviar").textContent = "▼";
            }
        });

        equipContainer.appendChild(capcalera);
        equipContainer.appendChild(jugadors);

        div.appendChild(equipContainer);
    });
}


function toggleEquipEnviar(uuid){
    const equip = equipsEnviar.find(e => e.uuid === uuid);
    if(!equip) return;

    const seleccionat = equipsSeleccionats.includes(uuid);

    if(seleccionat){
        equipsSeleccionats = equipsSeleccionats.filter(x => x !== uuid);
        const idsUsuarisEquip = equip.users.map(u => u.uuid);
        usuarisSeleccionats = usuarisSeleccionats.filter(u => !idsUsuarisEquip.includes(u));
    }else{
        equipsSeleccionats.push(uuid);
        const nousUsuaris = equip.users.map(u => u.uuid);
        usuarisSeleccionats = [...new Set([...usuarisSeleccionats, ...nousUsuaris])];
    }

    equip.users.forEach(u => {
        const checkbox = document.querySelector(`input[data-user-uuid="${u.uuid}"]`);
        if(checkbox) checkbox.checked = usuarisSeleccionats.includes(u.uuid);
    });
}


function toggleUsuariEnviar(uuid){
    if(usuarisSeleccionats.includes(uuid)) usuarisSeleccionats = usuarisSeleccionats.filter(u => u !== uuid);
    else usuarisSeleccionats.push(uuid);

    equipsEnviar.forEach(equip => {
        const idsUsuarisEquip = equip.users.map(u => u.uuid);
        const totsSeleccionats = idsUsuarisEquip.length > 0 && idsUsuarisEquip.every(u => usuarisSeleccionats.includes(u));
        const checkboxEquip = document.querySelector(`input[onchange="toggleEquipEnviar('${equip.uuid}')"]`);
        if(checkboxEquip) checkboxEquip.checked = totsSeleccionats;

        if(totsSeleccionats){
            if(!equipsSeleccionats.includes(equip.uuid)) equipsSeleccionats.push(equip.uuid);
        }else{
            equipsSeleccionats = equipsSeleccionats.filter(x => x !== equip.uuid);
        }
    });
}


function capitalitzar(text){
    return text.toLowerCase().split(" ").map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(" ");
}


async function enviarQuestionaris(){

    if(usuarisSeleccionats.length===0){
        alert("Selecciona algun usuari");
        return;
    }

    const avui = new Date();
    const dia = String(avui.getDate()).padStart(2,"0");
    const mes = String(avui.getMonth()+1).padStart(2,"0");
    const any = avui.getFullYear();
    const data = `${dia}-${mes}-${any}`;

    const registres = usuarisSeleccionats.map(u=>({
        user_uuid:u,
        questionari_uuid: questionariEnviar.uuid,
        data_enviament:data,
        contestat:0
    }));

    try {
        await upsertContestarQuestionari(registres);
        alert("Qüestionari enviat");

        // En lloc de sortir directament, obrim el diàleg de duplicació
        document.getElementById("duplicateDialogQuestionaris").style.display = "flex";

    } catch(error){
        console.error(error);
        alert("Error enviant qüestionari");
    }
}


async function duplicarQuestionari(questionariUuid, usuaris, daily, weekly, limitDateStr, dataIniciOriginal) {
    if (!limitDateStr) {
        alert("Selecciona una data límit");
        return;
    }

    // Convertim la data inicial del qüestionari enviat (format DD-MM-YYYY o objecte Date)
    // Suposant que rep una cadena "DD-MM-YYYY":
    const [dia, mes, any] = dataIniciOriginal.split("-");
    let data = new Date(`${any}-${mes}-${dia}`);
    const dataLimit = new Date(limitDateStr);

    // Increment inicial
    data.setDate(data.getDate() + (daily ? 1 : 7));

    while (data <= dataLimit) {
        const nouDia = String(data.getDate()).padStart(2,"0");
        const nouMes = String(data.getMonth()+1).padStart(2,"0");
        const nouAny = data.getFullYear();
        const novaDataStr = `${nouDia}-${nouMes}-${nouAny}`;

        const registresNous = usuaris.map(u => ({
            user_uuid: u,
            questionari_uuid: questionariUuid,
            data_enviament: novaDataStr,
            contestat: 0
        }));

        try {
            await upsertContestarQuestionari(registresNous);
        } catch (error) {
            console.error("Error duplicant qüestionari per a la data:", novaDataStr, error);
        }

        if (daily) data.setDate(data.getDate() + 1);
        else data.setDate(data.getDate() + 7);
    }

    alert("QÜESTIONARIS DUPLICATS CORRECTAMENT");
    document.getElementById("duplicateDialogQuestionaris").style.display = "none";
    mostrarPantalla("gestioQuestionaris");
}


document.getElementById("confirmDuplicateButtonQuestionaris").addEventListener("click", async () => {
    const daily = document.getElementById("repeatDailyQuestionaris").checked;
    const weekly = document.getElementById("repeatWeeklyQuestionaris").checked;
    const limit = document.getElementById("duplicateLimitDateQuestionaris").value;

    if (!daily && !weekly) {
        alert("Selecciona diari o setmanal");
        return;
    }

    // Suposant que guardes globalment el questionariEnviar.uuid i la data d'avui
    const avui = new Date();
    const dia = String(avui.getDate()).padStart(2,"0");
    const mes = String(avui.getMonth()+1).padStart(2,"0");
    const any = avui.getFullYear();
    const dataAvuiStr = `${dia}-${mes}-${any}`;

    await duplicarQuestionari(
        questionariEnviar.uuid,
        usuarisSeleccionats,
        daily,
        weekly,
        limit,
        dataAvuiStr
    );
});

document.getElementById("cancelDuplicateButtonQuestionaris").addEventListener("click", () => {
    document.getElementById("duplicateDialogQuestionaris").style.display = "none";
    mostrarPantalla("gestioQuestionaris");
});


