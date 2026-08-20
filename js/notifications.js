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

        // 1. Registrar el Service Worker
        const registration =
            await navigator.serviceWorker.register(
                "/service-worker.js"
            );

        console.log(
            "Service Worker registrat:",
            registration
        );


        // 2. Demanar permís per a les notificacions
        let permission = Notification.permission;

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


        // 3. Mirar si ja existeix una subscripció
        let subscription =
            await registration.pushManager.getSubscription();


        // 4. Si no existeix, crear-la
        if (!subscription) {

            subscription =
                await registration.pushManager.subscribe({
                    userVisibleOnly: true,

                    // AIXÒ HO POSAREM AL SEGÜENT PAS
                    applicationServerKey:
                        urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
                });
        }


        // 5. Convertir la subscripció a JSON
        const subscriptionJSON =
            subscription.toJSON();

        console.log(
            "Push subscription:",
            subscriptionJSON
        );


        // 6. Guardar-la a Supabase
        const { error } = await supabase
            .from("push_subscriptions")
            .upsert(
                {
                    user_uuid: user.uuid,

                    endpoint:
                        subscriptionJSON.endpoint,

                    p256dh:
                        subscriptionJSON.keys.p256dh,

                    auth:
                        subscriptionJSON.keys.auth,

                    updated_at:
                        new Date().toISOString()
                },
                {
                    onConflict:
                        "user_uuid,endpoint"
                }
            );


        if (error) {

            console.error(
                "Error guardant la subscripció:",
                error
            );

            return false;
        }


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
