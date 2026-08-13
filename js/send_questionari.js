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

    // ==========================================
    // CARREGAR USUARIS
    // ==========================================

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
    usuarisEnviar = usuarisEnviar.filter(
    u => u.role === "JUGADOR"
);


    // ==========================================
    // CARREGAR EQUIPS
    // ==========================================

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


    // ==========================================
    // CARREGAR USER_TEAMS
    // ==========================================

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


    // ==========================================
    // USUARI ACTUAL
    // ==========================================

    const roleActual = obtenirRoleLocal();
    const userUuidActual = obtenirUserUuidLocal();


    // ==========================================
    // SUPERADMIN
    // ==========================================

    if (roleActual === "SUPERADMIN") {

        equipsEnviar = equipsEnviar;

        usuarisEnviar = usuarisEnviar;

    }

    // ==========================================
    // RESTA D'USUARIS
    // ==========================================

    else {

        // Equips on està l'usuari actual
        const meusEquips = relacions
            .filter(r => r.user_uuid === userUuidActual)
            .map(r => r.team_uuid);


        // Només aquests equips
        equipsEnviar = equipsEnviar.filter(
            e => meusEquips.includes(e.uuid)
        );


        // Usuaris que comparteixen algun dels meus equips
        const usuarisCompartits = relacions
            .filter(r => meusEquips.includes(r.team_uuid))
            .map(r => r.user_uuid);


        // Eliminar duplicats
        const usuarisUnics = [...new Set(usuarisCompartits)];


        // Només aquests usuaris
        usuarisEnviar = usuarisEnviar.filter(
            u => usuarisUnics.includes(u.uuid)
        );
    }


    // ==========================================
    // ASSIGNAR USUARIS A CADA EQUIP
    // ==========================================

    equipsEnviar = equipsEnviar.map(e => {

        const ids = relacions
            .filter(r => r.team_uuid === e.uuid)
            .map(r => r.user_uuid);


        e.users = usuarisEnviar.filter(
            u => ids.includes(u.uuid)
        );


        return e;
    });


    // ==========================================
    // PINTAR
    // ==========================================

    pintarEquipsEnviar();
    pintarUsuarisEnviar();
}


function pintarEquipsEnviar(){

    const div = document.getElementById("llistaEquipsEnviar");
    div.innerHTML = "";

    equipsEnviar.forEach(e => {

        const fila = document.createElement("label");
        fila.className = "filaEnviar";

        const checked = equipsSeleccionats.includes(e.uuid)
            ? "checked"
            : "";

        fila.innerHTML = `
            <span>${e.team_name}</span>

            <input
                type="checkbox"
                ${checked}
                onchange="toggleEquipEnviar('${e.uuid}')"
            >
        `;

        div.appendChild(fila);
    });
}


function pintarUsuarisEnviar(){

    const div = document.getElementById("llistaUsuarisEnviar");

    div.innerHTML = "";

    // Ordenar equips alfabèticament
    const equipsOrdenats = [...equipsEnviar].sort(
        (a, b) => a.team_name.localeCompare(b.team_name, "ca")
    );

    equipsOrdenats.forEach(equip => {

        const usuaris = [...equip.users].sort(
            (a, b) => a.surname.localeCompare(b.surname, "ca")
        );

        const equipContainer = document.createElement("div");
        equipContainer.className = "grupEquipEnviar";
        equipContainer.dataset.uuid = equip.uuid;


        // ==========================================
        // CAPÇALERA EQUIP
        // ==========================================

        const capcalera = document.createElement("div");

        capcalera.className = "capcaleraEquipEnviar";

        capcalera.innerHTML = `
            <span class="fletxaEquipEnviar">▶</span>
            <span>${equip.team_name}</span>
        `;


        // ==========================================
        // CONTINGUT JUGADORS
        // ==========================================

        const jugadors = document.createElement("div");

        jugadors.className = "jugadorsEquipEnviar";
        jugadors.style.display = "none";


        usuaris.forEach(u => {

            const fila = document.createElement("label");

            fila.className = "filaEnviar";

            const nomComplet =
    `${capitalitzar(u.name)} ${capitalitzar(u.surname)}`;

let mida = "14px";

if(nomComplet.length > 12){
    mida = "13px";
}

if(nomComplet.length > 20){
    mida = "12px";
}

fila.innerHTML = `
    <span style="font-size:${mida}">
        ${nomComplet}
    </span>

    <input
        type="checkbox"
        ${usuarisSeleccionats.includes(u.uuid) ? "checked" : ""}
        data-user-uuid="${u.uuid}"
        onchange="toggleUsuariEnviar('${u.uuid}')"
    >
`;

            jugadors.appendChild(fila);
        });


        // ==========================================
        // OBRIR / TANCAR EQUIP
        // ==========================================

        capcalera.addEventListener("click", () => {

            const obert =
                jugadors.style.display !== "none";

            if(obert){

                jugadors.style.display = "none";

                capcalera
                    .querySelector(".fletxaEquipEnviar")
                    .textContent = "▶";

            }else{

                jugadors.style.display = "block";

                capcalera
                    .querySelector(".fletxaEquipEnviar")
                    .textContent = "▼";
            }
        });


        // ==========================================
        // AFEGIR AL DOM
        // ==========================================

        equipContainer.appendChild(capcalera);
        equipContainer.appendChild(jugadors);

        div.appendChild(equipContainer);
    });
}


function toggleEquipEnviar(uuid){

    const equip = equipsEnviar.find(
        e => e.uuid === uuid
    );

    if(!equip) return;


    // ==========================================
    // SELECCIONAR / DESELECCIONAR EQUIP
    // ==========================================

    const seleccionat =
        equipsSeleccionats.includes(uuid);


    if(seleccionat){

        // Treure equip
        equipsSeleccionats =
            equipsSeleccionats.filter(
                x => x !== uuid
            );

        // Treure els seus jugadors
        const idsUsuarisEquip =
            equip.users.map(u => u.uuid);

        usuarisSeleccionats =
            usuarisSeleccionats.filter(
                u => !idsUsuarisEquip.includes(u)
            );

    }else{

        // Afegir equip
        equipsSeleccionats.push(uuid);

        // Afegir els seus jugadors
        const nousUsuaris =
            equip.users.map(u => u.uuid);

        usuarisSeleccionats = [
            ...new Set([
                ...usuarisSeleccionats,
                ...nousUsuaris
            ])
        ];
    }


    // ==========================================
    // ACTUALITZAR CHECKS DELS JUGADORS
    // ==========================================

    equip.users.forEach(u => {

        const checkbox =
            document.querySelector(
                `input[data-user-uuid="${u.uuid}"]`
            );

        if(checkbox){

            checkbox.checked =
                usuarisSeleccionats.includes(u.uuid);
        }
    });

}


function toggleUsuariEnviar(uuid){

    // ==========================================
    // SELECCIONAR / DESELECCIONAR JUGADOR
    // ==========================================

    if(usuarisSeleccionats.includes(uuid)){

        usuarisSeleccionats =
            usuarisSeleccionats.filter(
                u => u !== uuid
            );

    }else{

        usuarisSeleccionats.push(uuid);
    }


    // ==========================================
    // ACTUALITZAR ESTAT DELS EQUIPS
    // ==========================================

    equipsEnviar.forEach(equip => {

        const idsUsuarisEquip =
            equip.users.map(u => u.uuid);

        const totsSeleccionats =
            idsUsuarisEquip.length > 0 &&
            idsUsuarisEquip.every(
                u => usuarisSeleccionats.includes(u)
            );

        const checkboxEquip =
            document.querySelector(
                `input[onchange="toggleEquipEnviar('${equip.uuid}')"]`
            );

        if(checkboxEquip){

            checkboxEquip.checked =
                totsSeleccionats;
        }


        // Actualitzar equipsSeleccionats
        if(totsSeleccionats){

            if(!equipsSeleccionats.includes(equip.uuid)){
                equipsSeleccionats.push(equip.uuid);
            }

        }else{

            equipsSeleccionats =
                equipsSeleccionats.filter(
                    x => x !== equip.uuid
                );
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
        mostrarPantalla("gestioQuestionaris");
    } catch(error){
        console.error(error);
        alert("Error enviant qüestionari");
    }
}


