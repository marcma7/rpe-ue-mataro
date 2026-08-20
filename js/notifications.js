const VAPID_PUBLIC_KEY = "BMunodwtCSBzKSm8e63o99tTBaw6cUnYt3pn8n1nPlYCnkSsID-tStZjw4GrZLn6BBYSSqVWTMWYq6_k-U0GEf4"; 

async function activarNotificacionsPush(user) {

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

    try {

        const registration =
            await navigator.serviceWorker.register(
                "./service-worker.js"
            );

        console.log(
            "Service Worker registrat:",
            registration
        );

        let permission = Notification.permission;

        if (permission === "default") {
            permission = await Notification.requestPermission();
        }

        if (permission !== "granted") {
            console.log(
                "L'usuari no ha donat permís per a les notificacions."
            );
            return false;
        }

        let subscription =
            await registration.pushManager.getSubscription();

        if (!subscription) {

            subscription =
                await registration.pushManager.subscribe({
                    userVisibleOnly: true,
                    applicationServerKey:
                        urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
                });
        }

        const subscriptionJSON =
            subscription.toJSON();

        console.log(
            "Push subscription:",
            subscriptionJSON
        );

        // GUARDAR A SUPABASE
        const response = await fetch(
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
                    user_uuid: user.uuid,
                    endpoint: subscriptionJSON.endpoint,
                    p256dh: subscriptionJSON.keys.p256dh,
                    auth: subscriptionJSON.keys.auth,
                    updated_at: new Date().toISOString()
                })
            }
        );

        if (!response.ok) {

            const text = await response.text();

            console.error(
                "Error guardant la subscripció:",
                text
            );

            return false;
        }

        const resultat = await response.json();

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



function urlBase64ToUint8Array(base64String) {

    const padding = "=".repeat(
        (4 - base64String.length % 4) % 4
    );

    const base64 =
        (base64String + padding)
            .replace(/-/g, "+")
            .replace(/_/g, "/");

    const rawData =
        window.atob(base64);

    return Uint8Array.from(
        [...rawData].map(char => char.charCodeAt(0))
    );
}


document
    .getElementById("btnProvarNotificacio")
    .addEventListener("click", async () => {

        const userUuid = obtenirUserUuidLocal();

        if (!userUuid) {
            alert("No hi ha cap usuari identificat.");
            return;
        }

        console.log(
            "Enviant notificació a:",
            userUuid
        );

        const {
            data,
            error
        } = await supabase.functions.invoke(
            "send-push",
            {
                body: {
                    user_uuid: userUuid,
                    title: "🔔 Notificació de prova",
                    body: "Perfecte! Les notificacions push funcionen.",
                    url: "/"
                }
            }
        );

        console.log(
            "Resposta Edge Function:",
            data
        );

        console.log(
            "Error Edge Function:",
            error
        );

        if (error) {
            console.error(
                "Error enviant notificació:",
                error
            );

            alert(
                "Error enviant la notificació. Mira la consola."
            );

            return;
        }

        alert(
            "Notificació enviada."
        );
    });
