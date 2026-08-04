let itemSeleccionat = null;

async function loadValoracioItems(){
    valoracioItems = await getValoracioItems(valoracioActualGestio.uuid);
    valoracioItems.sort((a,b)=> a.num_item - b.num_item);
    pintarValoracioItems();
}


function pintarValoracioItems(){
    const div = document.getElementById("llistaValoracioItems");
    div.innerHTML = "";

    valoracioItems.forEach((item,index)=>{
        const fila = document.createElement("div");
        fila.className = "questionFila";
        fila.innerHTML = `
            <div class="questionInfo">
                <b>${item.item}</b>
                <br>
                <small>${item.tipus_item}</small>
            </div>
            <div class="questionButtons">
                <button class="up">↑</button>
                <button class="delete">✕</button>
                <button class="down">↓</button>
            </div>
        `;

        fila.querySelector(".up").onclick = (e)=>{
            e.stopPropagation();
            moureItemAmunt(index);
        };

        fila.querySelector(".down").onclick = (e)=>{
            e.stopPropagation();
            moureItemAvall(index);
        };

        fila.querySelector(".delete").onclick = (e)=>{
            e.stopPropagation();
            eliminarValoracioItem(item.uuid);
        };

        fila.onclick = ()=>{
            itemSeleccionat = item;
            obrirEditarValoracioItem(item);
        };

        div.appendChild(fila);
    });
}


async function moureItemAmunt(index){
    if(index===0) return;

    const aux = valoracioItems[index];
    valoracioItems[index] = valoracioItems[index-1];
    valoracioItems[index-1] = aux;
    await guardarOrdreItems();
    pintarValoracioItems();
}


async function moureItemAvall(index){
    if(index===valoracioItems.length-1) return;

    const aux = valoracioItems[index];
    valoracioItems[index] = valoracioItems[index+1];
    valoracioItems[index+1] = aux;
    await guardarOrdreItems();
    pintarValoracioItems();
}


async function guardarOrdreItems(){
    const updates = valoracioItems.map((item,index)=>({
        uuid:item.uuid,
        num_item:index + 1
    }));

    await upsertValoracioItemOrder(updates);
}


async function eliminarValoracioItem(uuid){
    if(!confirm("Segur que vols eliminar aquest ítem?")) return;
    await deleteValoracioItem(uuid);
    await loadValoracioItems();
}


document.getElementById("nouItemValoracioButton").onclick = obrirNouValoracioItem;
