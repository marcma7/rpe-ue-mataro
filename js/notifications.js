const VAPID_PUBLIC_KEY =
    "BMunodwtCSBzKSm8e63o99tTBaw6cUnYt3pn8n1nPlYCnkSsID-tStZjw4GrZLn6BBYSSqVWTMWYq6_k-U0GEf4";


// ======================================================
// ACTIVAR NOTIFICACIONS PUSH
// ======================================================

async function activarNotificacionsPush(userUuid) {

    if (!("serviceWorker" in navigator)) {
        console.error(
            "Aquest navegador no suporta Service Workers."
        );
        return false;
    }

    if (!("PushManager" in window)) {
        console.error(
            "Aquest navegador no suporta Push."
        );
        return false;
    }

    if (!("Notification" in window)) {
        console.error(
            "Aquest navegador no suporta notificacions."
        );
        return false;
    }

    if (!userUuid) {
        console.error(
            "No s'ha proporcionat userUuid."
        );
        return false;
    }


    try {

        // ==================================================
        // REGISTRAR SERVICE WORKER
        // ==================================================

        const registration =
            await navigator.serviceWorker.register(
                "./service-worker.js"
            );

        console.log(
            "Service Worker registrat:",
            registration
        );


        // ==================================================
        // ESPERAR QUE ESTIGUI ACTIU
        // ==================================================

        await navigator.serviceWorker.ready;

        console.log(
            "Service Worker preparat."
        );


        // ==================================================
        // DEMANAR PERMÍS
        // ==================================================

        let permission =
            Notification.permission;

        if (permission === "default") {

            permission =
                await Notification.requestPermission();
        }


        if (permission !== "granted") {

            console.log(
                "L'usuari no ha donat permís per a les notificacions."
            );

            return false;
        }


        // ==================================================
        // BUSCAR SUBSCRIPCIÓ EXISTENT
        // ==================================================

        let subscription =
            await registration.pushManager.getSubscription();


        // ==================================================
        // CREAR SUBSCRIPCIÓ SI NO EXISTEIX
        // ==================================================

        if (!subscription) {

            console.log(
                "No existeix subscripció. Creant-ne una..."
            );

            subscription =
                await registration.pushManager.subscribe({

                    userVisibleOnly: true,

                    applicationServerKey:
                        urlBase64ToUint8Array(
                            VAPID_PUBLIC_KEY
                        )
                });

            console.log(
                "Nova subscripció creada:",
                subscription
            );

        } else {

            console.log(
                "Ja existeix una subscripció:",
                subscription
            );
        }


        // ==================================================
        // CONVERTIR SUBSCRIPCIÓ A JSON
        // ==================================================

        const subscriptionJSON =
            subscription.toJSON();

        console.log(
            "Push subscription:",
            subscriptionJSON
        );


        // ==================================================
        // COMPROVAR KEYS
        // ==================================================

        if (
            !subscriptionJSON.endpoint ||
            !subscriptionJSON.keys ||
            !subscriptionJSON.keys.p256dh ||
            !subscriptionJSON.keys.auth
        ) {

            console.error(
                "La subscripció no conté totes les dades necessàries."
            );

            return false;
        }


        // ==================================================
        // GUARDAR A SUPABASE
        // ==================================================

        const response =
            await fetch(
                `${SUPABASE_URL}/rest/v1/push_subscriptions?on_conflict=user_uuid,endpoint`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json",

                        "Prefer":
                            "resolution=merge-duplicates,return=representation",

                        "apikey":
                            SUPABASE_API_KEY,

                        "Authorization":
                            "Bearer " +
                            SUPABASE_API_KEY
                    },

                    body: JSON.stringify({

                        user_uuid:
                            userUuid,

                        endpoint:
                            subscriptionJSON.endpoint,

                        p256dh:
                            subscriptionJSON.keys.p256dh,

                        auth:
                            subscriptionJSON.keys.auth,

                        updated_at:
                            new Date().toISOString()
                    })
                }
            );


        if (!response.ok) {

            const text =
                await response.text();

            console.error(
                "Error guardant la subscripció:",
                text
            );

            return false;
        }


        const resultat =
            await response.json();

        console.log(
            "Subscripció guardada correctament:",
            resultat
        );


        console.log(
            "Notificacions push activades correctament."
        );

        return true;


    } catch (error) {

        console.error(
            "Error activant notificacions:",
            error
        );

        return false;
    }
}


// ======================================================
// CONVERTIR VAPID PUBLIC KEY
// ======================================================

function urlBase64ToUint8Array(base64String) {

    const padding =
        "=".repeat(
            (4 - base64String.length % 4) % 4
        );

    const base64 =
        (base64String + padding)
            .replace(/-/g, "+")
            .replace(/_/g, "/");

    const rawData =
        window.atob(base64);

    return Uint8Array.from(
        [...rawData].map(
            char => char.charCodeAt(0)
        )
    );
}


// ======================================================
// BOTÓ EN PROVES
// ======================================================


async function getUsuarisPerNotificarFisio(jugadorUuid) {

    // ---------------------------------------------------------
    // 1. Equips als quals pertany el jugador
    // ---------------------------------------------------------

    const userTeamsJugador = await getUserTeamByUserUuid(jugadorUuid);

    if (!userTeamsJugador || userTeamsJugador.length === 0) {
        return [];
    }

    const teamUuids = [
        ...new Set(
            userTeamsJugador.map(ut => ut.team_uuid)
        )
    ];

    // ---------------------------------------------------------
    // 2. Tots els usuaris
    // ---------------------------------------------------------

    const usuaris = await getAllUsers();

    if (!usuaris || usuaris.length === 0) {
        return [];
    }

    // ---------------------------------------------------------
    // 3. Tots els user_teams
    // ---------------------------------------------------------

    const userTeams = await getAllUserTeams();

    // ---------------------------------------------------------
    // 4. Filtrar usuaris
    //
    //    - SUPERADMIN -> sempre
    //    - No JUGADOR -> si està relacionat amb algun dels
    //      equips del jugador
    // ---------------------------------------------------------

    const usuarisNotificar = usuaris.filter(user => {

        // SUPERADMIN sempre rep la notificació
        if (user.role === "SUPERADMIN") {
            return true;
        }

        // Els jugadors no reben aquestes notificacions
        if (user.role === "JUGADOR") {
            return false;
        }

        // Buscar els equips d'aquest usuari
        const equipsUsuari = userTeams
            .filter(ut => ut.user_uuid === user.uuid)
            .map(ut => ut.team_uuid);

        // Ha d'estar relacionat amb algun equip del jugador
        return equipsUsuari.some(teamUuid =>
            teamUuids.includes(teamUuid)
        );
    });

    console.log(usuarisNotificar);

    return usuarisNotificar;
}


async function enviarNotificacioFisio(
    jugador,
    teamUuid
) {

    try {

        const usuaris =
            await getUsuarisPerNotificarFisio(
                jugador.uuid
            );

        if (!usuaris || usuaris.length === 0) {

            console.log(
                "No hi ha usuaris als quals enviar la notificació de fisioteràpia."
            );

            return;
        }

        console.log(
            "Usuaris que rebran notificació de fisioteràpia:",
            usuaris
        );

        const nomJugador =
            `${capitalize(jugador.name)} ${capitalize(jugador.surname)}`;

        // ---------------------------------------------------------
        // Enviar a cada usuari
        // ---------------------------------------------------------

        for (const user of usuaris) {

            try {

                const response =
                    await fetch(
                        `${SUPABASE_URL}/functions/v1/clever-service`,
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json",

                                "apikey":
                                    SUPABASE_API_KEY,

                                "Authorization":
                                    "Bearer " +
                                    SUPABASE_API_KEY
                            },

                            body: JSON.stringify({

                                user_uuid:
                                    user.uuid,

                                title:
                                    "🏥 Petició de fisioteràpia",

                                body:
                                    `${nomJugador} ha sol·licitat fisioteràpia.`,

                                url:
                                    "/"
                            })
                        }
                    );

                const data =
                    await response.json();

                console.log(
                    `Notificació enviada a ${user.name} ${user.surname}:`,
                    data
                );

                if (!response.ok) {

                    console.error(
                        `Error notificant ${user.uuid}:`,
                        data
                    );
                }

            } catch (error) {

                console.error(
                    `Error enviant notificació a ${user.uuid}:`,
                    error
                );
            }
        }

    } catch (error) {

        console.error(
            "Error preparant notificacions de fisioteràpia:",
            error
        );
    }
}