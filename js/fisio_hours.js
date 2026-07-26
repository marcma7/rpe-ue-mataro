let injuryAssignada = "";

let diesFisio = [];

let diesFilterFisio = [];

let horesFisio = [
"17:00",
"17:30",
"18:00",
"18:30",
"19:00",
"19:30",
"20:00",
"20:30",
"21:00",
"21:30"
];


let horaSeleccionadaFisio = null;

let visitesFisioHora = [];



async function obrirAssignarHora(injuryUuid){

    injuryAssignada = injuryUuid;


    mostrarPantalla(
        "assignarHora"
    );


    await carregarGraellaFisio();

}



async function carregarGraellaFisio(){


    diesFisio=[];
    diesFilterFisio=[];


    let avui =
    new Date();



    for(let i=0;i<=13;i++){


        let d =
        new Date(avui);


        d.setDate(
            avui.getDate()+i
        );


        diesFisio.push(
            d.toLocaleDateString(
                "ca-ES",
                {
                    day:"2-digit",
                    month:"2-digit"
                }
            )
        );


        diesFilterFisio.push(
            String(d.getDate()).padStart(2,"0")
            +
            "-"
            +
            String(d.getMonth()+1).padStart(2,"0")
            +
            "-"
            +
            d.getFullYear()
        );

    }


visitesFisio =
await getVisitsByDates(
    diesFilterFisio
);


await completarDadesVisitesFisio();


pintarHoresFisio();

pintarGraellaFisio();

}

function pintarHoresFisio(){


    const div =
    document.getElementById(
        "horesFisio"
    );


    div.innerHTML="";


    // espai per alinear amb capçalera

    const buit =
    document.createElement("div");

    buit.style.height="30px";

    div.appendChild(buit);



    horesFisio.forEach(hora=>{


        const h =
        document.createElement("div");


        h.textContent =
        hora;


        h.style.height="30px";
        h.style.fontWeight="bold";


        div.appendChild(h);


    });


}


function pintarGraellaFisio(){


    const div =
    document.getElementById(
        "graellaFisio"
    );


    div.innerHTML="";


    const scroll =
    document.createElement("div");

    scroll.style.overflowX="auto";


    const contingut =
    document.createElement("div");

    contingut.style.width =
    (diesFisio.length * 70) + "px";



    // CAPÇALERA DIES

    const header =
    document.createElement("div");

    header.style.display="flex";


    diesFisio.forEach(dia=>{


        const d =
        document.createElement("div");


        d.textContent =
        dia;


        d.style.width="70px";
        d.style.height="30px";
        d.style.textAlign="center";
        d.style.fontWeight="bold";


        header.appendChild(d);

    });


    contingut.appendChild(header);



    // FILES

    horesFisio.forEach(hora=>{


        const fila =
        document.createElement("div");


        fila.style.display="flex";



        diesFisio.forEach(
        (dia,index)=>{


            const boto =
            document.createElement("button");


            boto.style.width="70px";
            boto.style.height="30px";



            const ocupades =
            visitesFisio.filter(v=>{


                return (
                    v.date === diesFilterFisio[index]
                    &&
                    v.hour === hora
                );

            }).length;



            boto.style.background =
            colorConsultesFisio(
                ocupades
            );



            boto.onclick=()=>{


                seleccionarHoraFisio(
                    index,
                    hora
                );


            };


            fila.appendChild(boto);


        });


        contingut.appendChild(fila);


    });



    scroll.appendChild(contingut);

    div.appendChild(scroll);


}


async function seleccionarHoraFisio(
    diaIndex,
    hora
){

    horaSeleccionadaFisio =
    {
        index:diaIndex,
        hora:hora
    };


    document
    .getElementById(
        "horaSeleccionada"
    )
    .textContent =
    diesFisio[diaIndex]
    +
    " "
    +
    hora;



    const data =
    diesFilterFisio[diaIndex];


    visitesFisioHora =
    visitesFisio.filter(v=>{

        return (
            v.date === data
            &&
            v.hour === hora
        );

    });



    pintarVisitesHoraFisio();


}

function pintarVisitesHoraFisio(){


    const div =
    document.getElementById(
        "visitesHoraFisio"
    );


    div.innerHTML="";



    if(visitesFisioHora.length===0){


        div.textContent =
        "No hi ha visites assignades";


        return;

    }



    visitesFisioHora.forEach(visita=>{


        const card =
        document.createElement("div");


        card.className =
        "jugadorFila";



        card.innerHTML =

        `
        <b>
        ${visita.user?.name ?? ""}
        ${visita.user?.surname ?? ""}
        </b>
        <br>
        Zona:
        ${visita.injury?.zona ?? "-"}
        <br>
        Tipus:
        ${visita.injury?.tipus ?? "-"}
        <br>
        Gravetat:
        ${visita.injury?.gravetat ?? "-"}
        `;



        div.appendChild(card);


    });


}

document
.getElementById(
"confirmarHoraFisioButton"
)
.addEventListener(
"click",
async()=>{


    if(!horaSeleccionadaFisio){

        alert(
            "Selecciona una hora"
        );

        return;

    }



    const episodes =
    await getEpisodesByInjury(
        [
            injuryAssignada
        ]
    );


    if(episodes.length===0){

        alert(
            "No hi ha episodi de fisio"
        );

        return;

    }



    const visits =
    await getVisitsByEpisodes(
        episodes.map(
            e=>e.uuid
        )
    );


    if(visits.length===0){

        alert(
            "No hi ha visita creada"
        );

        return;

    }



    const ultimaVisita =
    visits.sort(
        (a,b)=>
        b.num_visit-a.num_visit
    )[0];



    await upsertPhysioHour([{

    uuid:
    ultimaVisita.uuid,

    date:
    diesFilterFisio[
        horaSeleccionadaFisio.index
    ],

    hour:
    horaSeleccionadaFisio.hora

}]);


document
.getElementById("pantallaAssignarHora")
.style.display="none";





    alert(
        "HORA ASSIGNADA"
    );


    horaSeleccionadaFisio = null;


    await obrirLesionsFisio();


});


function colorConsultesFisio(num){


    switch(num){

        case 0:
            return "green";


        case 1:
            return "#99e65c";


        case 2:
            return "yellow";


        case 3:
            return "orange";


        case 4:
        default:
            return "red";

    }

}


async function completarDadesVisitesFisio(){


    if(visitesFisio.length===0)
        return;



    const episodes =
    await getEpisodesByUuid(
        [
            ...new Set(
                visitesFisio.map(v=>v.episode_uuid)
            )
        ]
    );



    const injuries =
    await getInjuriesByUuid(
        [
            ...new Set(
                episodes.map(e=>e.injury_uuid)
            )
        ]
    );



    const users =
    await getAllUsers(
        [
            ...new Set(
                injuries.map(i=>i.user_uuid)
            )
        ]
    );



    visitesFisio.forEach(v=>{


        const ep =
        episodes.find(
            e=>e.uuid===v.episode_uuid
        );


        const injury =
        injuries.find(
            i=>i.uuid===ep?.injury_uuid
        );


        const user =
        users.find(
            u=>u.uuid===injury?.user_uuid
        );


        v.injury = injury;

        v.user = user;


    });


}