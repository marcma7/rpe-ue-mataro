let valoracionsGestio = [];

document.getElementById("novaValoracioButton").onclick = obrirNovaValoracio;

document.getElementById("tornarValoracioButton").onclick = ()=>{
    mostrarPantalla("management");
};


async function loadGestValoracions(){

    valoracionsGestio = await getAllValoracions();
    const items = await getAllValoracionsItems();
    for(const v of valoracionsGestio){
        v.nItems = items.filter(x=>x.valoracio_uuid===v.uuid).length;
    }

    pintarGestValoracions();
}


function pintarGestValoracions(){

    const div = document.getElementById("llistaValoracionsGest");
    div.innerHTML = "";

    valoracionsGestio.forEach(v=>{
        const fila = document.createElement("div");
        fila.className = "questionariFila";
        fila.innerHTML = `
            <div class="nomQuestionari">${v.name}</div>
            <div class="infoQuestionari">${v.nItems} ítems</div>
            <div class="botonsQuestionari">
                <button class="editar">✎ Modificar</button>
                <button class="eliminar">✕ Eliminar</button>
            </div>
        `;

        fila.querySelector(".editar").onclick = ()=>{
            valoracioActualGestio = v;
            obrirValoracioItems(v.uuid);
        };

        fila.querySelector(".eliminar").onclick = ()=>{
            eliminarValoracio(v.uuid);
        };

        div.appendChild(fila);
    });
}


function obrirNovaValoracio(){
    const nom = prompt("Nom de la valoració");
    if(!nom) return;
    crearValoracio(nom);
}


async function crearValoracio(nom){
    await addValoracio({
        name: nom
    });
    await loadGestValoracions();
}


async function eliminarValoracio(uuid){
    if(!confirm("Segur que vols eliminar aquesta valoració?")) return;
    await deleteValoracio(uuid);
    await loadGestValoracions();
}

let valoracioActualGestio = null;


async function obrirValoracioItems(uuid){
    valoracioActualGestio = valoracionsGestio.find(x=>x.uuid===uuid);
    mostrarPantalla("valoracioItems");
    await loadValoracioItems();
}


async function obrirSeleccionarJugadorValoracio(){

    mostrarPantalla("seleccionarJugadorValoracio");
    const usuaris = await getAllUsers();
    const div = document.getElementById("llistaJugadorsValoracio");
    div.innerHTML = "";
    usuaris.forEach(u=>{
        const boto = document.createElement("button");
        boto.textContent = `${u.name} ${u.surname}`;
        boto.onclick = async ()=>{
            document.getElementById("pantallaSeleccionarJugadorValoracio").style.display = "none";
            await obrirValoracio(valoracioActualGestio.uuid, u.uuid);
        };
        div.appendChild(boto);
    });
}
