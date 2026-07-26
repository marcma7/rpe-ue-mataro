let usuarisEnviar = [];

let usuarisSeleccionats = [];

let equipsEnviar = [];

let equipsSeleccionats = [];



document
.getElementById("enviarQuestionariButton")
.onclick =
enviarQuestionaris;


document
.getElementById("tornarEnviarQuestionariButton")
.onclick =
()=>{

    mostrarPantalla(
        "gestioQuestionaris"
    );

};

// ===============================
// OBRIR PANTALLA
// ===============================

function obrirEnviar(q){

    questionariEnviar = q;

    usuarisSeleccionats = [];
    equipsSeleccionats = [];

    mostrarPantalla(
        "enviarQuestionari"
    );

    carregarEnviarQuestionari();

}


// ===============================
// CARREGAR EQUIPS I USUARIS
// ===============================

async function carregarEnviarQuestionari(){


    const usersResponse =
    await fetch(
        `${SUPABASE_URL}/rest/v1/app_users?select=*`,
        {
            headers:{
                apikey:SUPABASE_API_KEY,
                Authorization:`Bearer ${SUPABASE_API_KEY}`
            }
        }
    );


    usuarisEnviar =
    await usersResponse.json();



    const teamsResponse =
    await fetch(
        `${SUPABASE_URL}/rest/v1/teams?select=*`,
        {
            headers:{
                apikey:SUPABASE_API_KEY,
                Authorization:`Bearer ${SUPABASE_API_KEY}`
            }
        }
    );


    equipsEnviar =
    await teamsResponse.json();



    const relacioResponse =
    await fetch(
        `${SUPABASE_URL}/rest/v1/user_teams?select=*`,
        {
            headers:{
                apikey:SUPABASE_API_KEY,
                Authorization:`Bearer ${SUPABASE_API_KEY}`
            }
        }
    );


    const relacions =
    await relacioResponse.json();



    equipsEnviar =
    equipsEnviar.map(e=>{


        const ids =
        relacions
        .filter(
            r=>r.team_uuid===e.uuid
        )
        .map(
            r=>r.user_uuid
        );


        e.users =
        usuarisEnviar.filter(
            u=>ids.includes(u.uuid)
        );


        return e;

    });



    pintarEquipsEnviar();

    pintarUsuarisEnviar();

}


function pintarEquipsEnviar(){

    const div =
    document.getElementById(
        "llistaEquipsEnviar"
    );


    div.innerHTML="";


    equipsEnviar.forEach(e=>{


        div.innerHTML += `

        <label>

        <input
        type="checkbox"
        onchange="toggleEquipEnviar('${e.uuid}')">

        ${e.team_name}

        </label>

        <br>

        `;


    });

}


function toggleEquipEnviar(uuid){


    const equip =
    equipsEnviar.find(
        e=>e.uuid===uuid
    );



    if(equipsSeleccionats.includes(uuid)){


        equipsSeleccionats =
        equipsSeleccionats.filter(
            x=>x!==uuid
        );


    }
    else{


        equipsSeleccionats.push(uuid);



        const nousUsuaris =
        equip.users.map(
            u=>u.uuid
        );


        usuarisSeleccionats =
        [
            ...new Set(
                [
                    ...usuarisSeleccionats,
                    ...nousUsuaris
                ]
            )
        ];


    }


    pintarUsuarisEnviar();

}


function pintarUsuarisEnviar(){

    const div =
    document.getElementById(
        "llistaUsuarisEnviar"
    );


    div.innerHTML="";


    usuarisEnviar.forEach(u=>{


        const checked =
        usuarisSeleccionats.includes(u.uuid)
        ? "checked"
        : "";


        div.innerHTML += `

        <label>

        <input
        type="checkbox"
        ${checked}
        onchange="toggleUsuariEnviar('${u.uuid}')">

        ${u.name} ${u.surname}

        </label>

        <br>

        `;


    });

}


async function enviarQuestionaris(){


    if(usuarisSeleccionats.length===0){

        alert(
            "Selecciona algun usuari"
        );

        return;

    }


    const avui =
    new Date();


    const dia =
    String(avui.getDate())
    .padStart(2,"0");


    const mes =
    String(avui.getMonth()+1)
    .padStart(2,"0");


    const any =
    avui.getFullYear();


    const data =
    `${dia}-${mes}-${any}`;



    const registres =
    usuarisSeleccionats.map(u=>({

        user_uuid:u,

        questionari_uuid:
        questionariEnviar.uuid,

        data_enviament:data,

        contestat:0

    }));



    try {

        await upsertContestarQuestionari(
            registres
        );


        alert(
            "Questionari enviat"
        );


        mostrarPantalla(
            "gestioQuestionaris"
        );


    } catch(error){


        console.error(error);


        alert(
            "Error enviant qüestionari"
        );

    }

}