let ultimaSessioSeleccionat = null;
let totesSessions = null;


// ============================================================
// GESTIÓ QÜESTIONARIS
// ============================================================

async function loadGestUltimaSessios(teamUuid) {
    totesSessions = await getPracticesFilled(teamUuid);
    veureRespostesUltimaSessio(totesSessions[0]);
}


function veureRespostesUltimaSessio(q) {
    ultimaSessioSeleccionat = q;
    document.getElementById("titolUltimaSessio").textContent = "Sessió " + q.practice_date;

    const filtreData = document.getElementById("filtreEquipUltimaSessio");
    if (filtreData) filtreData.value = "";

    const filtreEquip = document.getElementById("filtreDataUltimaSessio");
    if (filtreEquip) filtreEquip.value = "";

    mostrarPantalla("pantallaRespostesUltimaSessio");
    carregarRespostesUltimaSessio(q);
}


function pintarFiltresRespostes(dades) {
    const selectEquip = document.getElementById("filtreEquipRespostes");
    const inputData = document.getElementById("filtreDataRespostes");

    if (selectEquip) {
        selectEquip.innerHTML = `<option value="">Tots els equips</option>`;

        const equipsMap = new Map();
        dades.forEach(x => {
            if (x.equipUuid && x.equip) {
                equipsMap.set(x.equipUuid, x.equip);
            }
        });

        Array.from(equipsMap.entries())
            .sort((a, b) => a[1].localeCompare(b[1], "ca"))
            .forEach(([uuid, nom]) => {
                const option = document.createElement("option");
                option.value = uuid;
                option.textContent = nom;
                selectEquip.appendChild(option);
            });

        selectEquip.onchange = aplicarFiltresRespostes;
    }

    if (inputData) {
        inputData.onchange = aplicarFiltresRespostes;
    }
}


function pintarTaulaUltimaSessio(q, respostes) {
    const div = document.getElementById("taulaRespostesUltimaSessio");
    div.innerHTML = "";

    if (!respostes || respostes.length === 0) {
        div.innerHTML = `
            <div class="senseRespostes">
                No s'han trobat respostes amb els filtres seleccionats.
            </div>
        `;
        return;
    }

    let index = 0;

    const taula = document.createElement("table");
    taula.className = "taulaRespostesDissenyada";

    taula.innerHTML = `
        <thead>
            <tr>
                <th>Jugador</th>
                <th style="text-align: center;">RPE</th>
                <th style="text-align: center;">Molèsties</th>
            </tr>
        </thead>
        <tbody></tbody>
    `;

    const tbody = taula.querySelector("tbody");

    respostes.forEach(r => {
        const tr = document.createElement("tr");

        const valor = r ? r.rpe : "";
        const molest = r ? r.molestia : "";
        const teResposta = valor !== null && valor !== undefined && String(valor).trim() !== "";

        // Apliquem la transformació de majúscules al nom del jugador
        const nomJugadorFormatat = majusculaInicials(r.jugador);

        tr.innerHTML = `
            <td class="colNomJugador">
                <strong>${escaparHTML(nomJugadorFormatat)}</strong>
            </td>

            <td class="colResposta" style="text-align: center;">
                ${teResposta
                    ? `<div class="caixaRespostaCompletada">${escaparHTML(String(valor))}</div>`
                    : `<span class="tagPendent">Pendent</span>`
                }
            </td>

            <td class="colResposta" style="text-align: center;">
                ${teResposta
                    ? `<div class="caixaRespostaCompletada">${escaparHTML(String(molest))}</div>`
                    : `<span class="tagPendent">Pendent</span>`
                }
            </td>
        `;

        tbody.appendChild(tr);
    });

    div.appendChild(taula);
}


function tornarGestUltimaSessios() {
    mostrarPantalla("pantallaGestioUltimaSessios");
}


async function carregarRespostesUltimaSessio(q) {

    const div = document.getElementById("taulaRespostesUltimaSessio");
    div.innerHTML = `
        <div style="padding:20px;">Carregant respostes...</div>
    `;

    const dades = q.teams.user_teams.filter(u => u.app_users.role == "JUGADOR").map(u => {
        return {
            jugador: u.app_users ? `${u.app_users.name || ""} ${u.app_users.surname || ""}`.trim() : "Jugador desconegut",
            rpe: u.app_users.rpe_registers[0] ? u.app_users.rpe_registers[0].register : "No registrat",
            molestia: u.app_users.rpe_registers[0] ? (u.app_users.rpe_registers[0].molesties ? u.app_users.rpe_registers[0].molesties : "-") : "-"
        };
    });

    window.respostesUltimaSessioActuals = dades;
    window.indexPreguntaRespostes = 0;

    pintarTaulaUltimaSessio(ultimaSessioSeleccionat, dades);

}

function escaparHTML(valor) {
    if (valor === null || valor === undefined) return "";

    return String(valor)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}