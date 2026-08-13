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
        div.innerHTML += `
            <label class="filaEnviar">
                <span>${e.team_name}</span>
                <input type="checkbox" onchange="toggleEquipEnviar('${e.uuid}')">
            </label>
        `;
    });
}


function toggleEquipEnviar(uuid){

    const equip = equipsEnviar.find(e=>e.uuid===uuid);

    if(equipsSeleccionats.includes(uuid)){
        equipsSeleccionats = equipsSeleccionats.filter(x=>x!==uuid);
    } else {
        equipsSeleccionats.push(uuid);
        const nousUsuaris = equip.users.map(u=>u.uuid);
        usuarisSeleccionats = [...new Set([...usuarisSeleccionats, ...nousUsuaris])];
    }

    pintarUsuarisEnviar();
}


function capitalitzar(text){
    return text.toLowerCase().split(" ").map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(" ");
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

            const checked =
                usuarisSeleccionats.includes(u.uuid)
                    ? "checked"
                    : "";


            const fila = document.createElement("label");

            fila.className = "filaEnviar";


            fila.innerHTML = `
                <span>
                    ${capitalitzar(u.name)}
                    ${capitalitzar(u.surname)}
                </span>

                <input
                    type="checkbox"
                    ${checked}
                    onchange="toggleUsuariEnviar('${u.uuid}')"
                >
            `;


            jugadors.appendChild(fila);
        });


        // ==========================================
        // CLICK EQUIP
        // ==========================================

        capcalera.addEventListener("click", () => {

            const obert =
                jugadors.style.display !== "none";


            if (obert) {

                jugadors.style.display = "none";

                capcalera
                    .querySelector(".fletxaEquipEnviar")
                    .textContent = "▶";

            } else {

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


function toggleUsuariEnviar(uuid){

    if(usuarisSeleccionats.includes(uuid)){
        usuarisSeleccionats =
            usuarisSeleccionats.filter(u => u !== uuid);
    }else{
        usuarisSeleccionats.push(uuid);
    }

    pintarUsuarisEnviar();

}
