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

document
    .getElementById("btnProvarNotificacio")
    .addEventListener(
        "click",
        async () => {

            const userUuid =
                obtenirUserUuidLocal();


            // ==================================================
            // COMPROVAR USUARI
            // ==================================================

            if (!userUuid) {

                alert(
                    "No hi ha cap usuari identificat."
                );

                return;
            }


            console.log(
                "Usuari:",
                userUuid
            );


            // ==================================================
            // ACTIVAR PUSH EN AQUEST DISPOSITIU
            // ==================================================

            console.log(
                "Activant notificacions Push..."
            );


            const pushActivat =
                await activarNotificacionsPush(
                    userUuid
                );


            if (!pushActivat) {

                alert(
                    "No s'han pogut activar les notificacions Push."
                );

                return;
            }


            console.log(
                "Push activat correctament."
            );


            // ==================================================
            // ENVIAR NOTIFICACIÓ
            // ==================================================

            console.log(
                "Enviant notificació a:",
                userUuid
            );


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
                                    userUuid,

                                title:
                                    "🔔 Notificació de prova",

                                body:
                                    "Perfecte! Les notificacions push funcionen.",

                                url:
                                    "/"
                            })
                        }
                    );


                const data =
                    await response.json();


                console.log(
                    "Resposta Edge Function:",
                    data
                );


                // ==================================================
                // ERROR HTTP
                // ==================================================

                if (!response.ok) {

                    console.error(
                        "Error Edge Function:",
                        data
                    );

                    alert(
                        "Error enviant la notificació."
                    );

                    return;
                }


                // ==================================================
                // COMPTAR RESULTATS
                // ==================================================

                const enviades =
                    data.results
                        ?.filter(
                            r => r.success
                        )
                        .length || 0;


                const errors =
                    data.results
                        ?.filter(
                            r => !r.success
                        )
                        .length || 0;


                console.log(
                    "Push enviats:",
                    enviades
                );

                console.log(
                    "Errors:",
                    errors
                );


                // ==================================================
                // RESULTAT
                // ==================================================

                if (enviades > 0) {

                    alert(
                        "✅ Notificació enviada."
                    );

                } else {

                    alert(
                        "❌ No s'ha enviat cap notificació.\n\n" +
                        "Errors: " +
                        errors
                    );
                }


            } catch (error) {

                console.error(
                    "Error fent la petició:",
                    error
                );

                alert(
                    "Error enviant la notificació."
                );
            }
        }
    );
