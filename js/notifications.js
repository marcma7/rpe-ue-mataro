const VAPID_PUBLIC_KEY = "BMunodwtCSBzKSm8e63o99tTBaw6cUnYt3pn8n1nPlYCnkSsID-tStZjw4GrZLn6BBYSSqVWTMWYq6_k-U0GEf4";


async function activarNotificacionsPush(userUuid) {
    if (!("serviceWorker" in navigator)) {
        console.error("Aquest navegador no suporta Service Workers.");
        return false;
    }

    if (!("PushManager" in window)) {
        console.error("Aquest navegador no suporta Push.");
        return false;
    }

    if (!("Notification" in window)) {
        console.error("Aquest navegador no suporta notificacions.");
        return false;
    }

    if (!userUuid) {
        console.error("No s'ha proporcionat userUuid.");
        return false;
    }


    try {
        const registration = await navigator.serviceWorker.register("./service-worker.js");
        console.log("Service Worker registrat:", registration);

        await navigator.serviceWorker.ready;
        console.log("Service Worker preparat.");

        let permission = Notification.permission;

        if (permission === "default") {
            permission = await Notification.requestPermission();
        }

        if (permission !== "granted") {
            console.log("L'usuari no ha donat permís per a les notificacions.");
            return false;
        }

        let subscription = await registration.pushManager.getSubscription();

        if (!subscription) {
            console.log("No existeix subscripció. Creant-ne una...");
            subscription = await registration.pushManager.subscribe(
                {
                    userVisibleOnly: true,
                    applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
                });

            console.log("Nova subscripció creada:",subscription);
        } else {
            console.log("Ja existeix una subscripció:", subscription);
        }

        const subscriptionJSON = subscription.toJSON();
        console.log("Push subscription:", subscriptionJSON);

        if (!subscriptionJSON.endpoint || !subscriptionJSON.keys || !subscriptionJSON.keys.p256dh || !subscriptionJSON.keys.auth) {
            console.error("La subscripció no conté totes les dades necessàries.");
            return false;
        }

        const response =
            await fetch(
                `${SUPABASE_URL}/rest/v1/push_subscriptions?on_conflict=user_uuid,endpoint`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Prefer": "resolution=merge-duplicates,return=representation",
                        "apikey": SUPABASE_API_KEY,
                        "Authorization": "Bearer " + SUPABASE_API_KEY
                    },
                    body: JSON.stringify({
                        user_uuid: userUuid,
                        endpoint: subscriptionJSON.endpoint,
                        p256dh: subscriptionJSON.keys.p256dh,
                        auth: subscriptionJSON.keys.auth,
                        updated_at: new Date().toISOString()
                    })
                }
            );

        if (!response.ok) {
            const text = await response.text();
            console.error("Error guardant la subscripció:", text);
            return false;
        }

        const resultat = await response.json();
        console.log("Subscripció guardada correctament:", resultat);
        console.log("Notificacions push activades correctament.");
        return true;
    } catch (error) {
        console.error("Error activant notificacions:", error);
        return false;
    }
}


function urlBase64ToUint8Array(base64String) {
    const padding = "=".repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
    const rawData = window.atob(base64);

    return Uint8Array.from([...rawData].map(char => char.charCodeAt(0)));
}


async function getUsuarisPerNotificarFisio(jugadorUuid) {
    const userTeamsJugador = await getUserTeamByUserUuid(jugadorUuid);
    if (!userTeamsJugador || userTeamsJugador.length === 0) return [];

    const teamUuids = [...new Set(userTeamsJugador.map(ut => ut.team_uuid))];

    const usuaris = await getAllUsers();
    if (!usuaris || usuaris.length === 0) return [];

    const userTeams = await getAllUserTeams();

    const usuarisNotificar = usuaris.filter(user => {
        if (user.role === "SUPERADMIN") return true;
        if (user.role === "JUGADOR") return false;

        const equipsUsuari = userTeams.filter(ut => ut.user_uuid === user.uuid).map(ut => ut.team_uuid);
        return equipsUsuari.some(teamUuid => teamUuids.includes(teamUuid));
    });
    console.log(usuarisNotificar);
    return usuarisNotificar;
}


async function getUsuarisPerNotificarMolestia(jugadorUuid) {
    const userTeamsJugador = await getUserTeamByUserUuid(jugadorUuid);
    if (!userTeamsJugador || userTeamsJugador.length === 0) return [];

    const teamUuids = [...new Set(userTeamsJugador.map(ut => ut.team_uuid))];

    const usuaris = await getAllUsers();
    if (!usuaris || usuaris.length === 0) return [];

    const userTeams = await getAllUserTeams();

    const usuarisNotificar = usuaris.filter(user => {
        if (user.role === "SUPERADMIN") return true;
        if (user.role === "JUGADOR") return false;

        const equipsUsuari = userTeams.filter(ut => ut.user_uuid === user.uuid).map(ut => ut.team_uuid);
        return equipsUsuari.some(teamUuid => teamUuids.includes(teamUuid));
    });

    return usuarisNotificar;
}


async function enviarNotificacioFisio(jugador, teamUuid) {
    try {
        const usuaris = await getUsuarisPerNotificarFisio(jugador.uuid);

        if (!usuaris || usuaris.length === 0) return;

        console.log("Usuaris que rebran notificació de fisioteràpia:", usuaris);

        const nomJugador = `${capitalize(jugador.name)} ${capitalize(jugador.surname)}`;

        for (const user of usuaris) {
            try {
                await enviarNotificacio(user.uuid, "🏥 Petició de fisioteràpia", `${nomJugador} ha sol·licitat fisioteràpia.`, "/");
            } catch (error) {
                console.error(`Error enviant notificació a ${user.uuid}:`, error);
            }
        }
    } catch (error) {
        console.error("Error preparant notificacions de fisioteràpia:", error);
    }
}


async function enviarNotificacioMolestia(jugador, molestia) {
    try {
        const usuaris = await getUsuarisPerNotificarMolestia(jugador.uuid);
        if (!usuaris || usuaris.length === 0) return;

        const nomJugador = `${capitalize(jugador.name)} ${capitalize(jugador.surname)}`;

        for (const user of usuaris) {
            try {
                const response = await fetch(
                    `${SUPABASE_URL}/functions/v1/clever-service`,
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            "apikey": SUPABASE_API_KEY,
                            "Authorization": "Bearer " + SUPABASE_API_KEY
                        },
                        body: JSON.stringify({
                            user_uuid: user.uuid,
                            title: "⚠️ Molèstia registrada",
                            body: `${nomJugador} ha registrat una molèstia: ${molestia}`,
                            url: "/"
                        })
                    }
                );
                const data = await response.json();
                console.log(`Notificació de molèstia enviada a ${user.name} ${user.surname}:`, data);
            } catch (error) {
                console.error(`Error enviant notificació a ${user.uuid}:`, error);
            }
        }
    } catch (error) {
        console.error("Error preparant notificacions de molèstia:", error);
    }
}


async function enviarNotificacio(userUuid, title, body, url = "/") {
    try {
        const response = await fetch(
            `${SUPABASE_URL}/functions/v1/clever-service`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "apikey": SUPABASE_API_KEY,
                    "Authorization": "Bearer " + SUPABASE_API_KEY
                },
                body: JSON.stringify({
                    user_uuid: userUuid,
                    title,
                    body,
                    url
                })
            }
        );

        const data = await response.json();

        if (!response.ok) {
            console.error(`Error enviant notificació a ${userUuid}:`, data);
            return false;
        }

        console.log("Notificació enviada:", data);
        return true;

    } catch (error) {
        console.error("Error enviant notificació:", error);
        return false;
    }
}


async function getUsuarisPerNotificarHoraFisio(jugadorUuid) {
    const userTeamsJugador = await getUserTeamByUserUuid(jugadorUuid);
    if (!userTeamsJugador || userTeamsJugador.length === 0) return [];

    const teamUuids = [...new Set(userTeamsJugador.map(ut => ut.team_uuid))];

    const usuaris = await getAllUsers();
    if (!usuaris || usuaris.length === 0) return [];

    const userTeams = await getAllUserTeams();

    const usuarisNotificar = usuaris.filter(user => {
        if (user.role === "SUPERADMIN") return true;
        if (user.uuid === jugadorUuid) return true;
        if (user.role === "JUGADOR") return false;
        
        const equipsUsuari = userTeams.filter(ut => ut.user_uuid === user.uuid).map(ut => ut.team_uuid);
        return equipsUsuari.some(teamUuid =>teamUuids.includes(teamUuid));
    });

    console.log("Usuaris que rebran notificació d'hora de fisio:", usuarisNotificar);
    return usuarisNotificar;
}


async function enviarNotificacioHoraFisio(jugador, data, hora) {
    try {
        const usuaris = await getUsuarisPerNotificarHoraFisio(jugador.uuid);
        if (!usuaris || usuaris.length === 0) return;

        const nomJugador = `${capitalize(jugador.name)} ${capitalize(jugador.surname)}`;

        for (const user of usuaris) {
            try {
                const esJugador = user.uuid === jugador.uuid;
                const title = esJugador ? "🏥 Hora de fisioteràpia" : "🏥 Fisioteràpia assignada";
                const body = esJugador ? `T'han assignat fisioteràpia el ${data} a les ${hora}.` : `${nomJugador} té fisioteràpia el ${data} a les ${hora}.`;

                const response = await fetch(
                    `${SUPABASE_URL}/functions/v1/clever-service`,
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            "apikey": SUPABASE_API_KEY,
                            "Authorization": "Bearer " + SUPABASE_API_KEY
                        },
                        body: JSON.stringify({
                            user_uuid: user.uuid,
                            title: title,
                            body: body,
                            url: "/"
                        })
                    }
                );

                const resultat = await response.json();
                console.log(`Notificació d'hora de fisio enviada a ${user.name} ${user.surname}:`, resultat);

                if (!response.ok) {
                    console.error(`Error notificant ${user.uuid}:`, resultat);
                }
            } catch (error) {
                console.error(`Error enviant notificació a ${user.uuid}:`, error);
            }
        }
    } catch (error) {
        console.error("Error preparant notificacions d'hora de fisio:", error);
    }
}
