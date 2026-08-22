self.addEventListener("install", event => {

    console.log("Service Worker instal·lat");

    self.skipWaiting();
});


self.addEventListener("activate", event => {

    console.log("Service Worker activat");

    event.waitUntil(
        self.clients.claim()
    );
});


self.addEventListener("push", event => {

    console.log("🔥 PUSH REBUT PEL SERVICE WORKER");

    let data = {};

    try {

        data = event.data
            ? event.data.json()
            : {};

    } catch (error) {

        console.error(
            "Error llegint la notificació push:",
            error
        );
    }


    console.log(
        "📩 DATA PUSH:",
        data
    );


    const title =
        data.title ||
        "La teva aplicació";


    const options = {

        body:
            data.body ||
            "Nova notificació",

        icon:
            "/icon-192.png",

        badge:
            "/icon-192.png",

        tag:
            "rpe-notificacio",

        renotify:
            true,

        requireInteraction:
            true,

        data: {

            url:
                data.url ||
                "/"
        }
    };


    console.log(
        "🔔 Intentant mostrar notificació:",
        title,
        options
    );


    event.waitUntil(

        self.registration
            .showNotification(
                title,
                options
            )
            .then(() => {

                console.log(
                    "✅ NOTIFICACIÓ MOSTRADA CORRECTAMENT"
                );

            })
            .catch(error => {

                console.error(
                    "❌ ERROR MOSTRANT NOTIFICACIÓ:",
                    error
                );

            })
    );
});


self.addEventListener(
    "notificationclick",
    event => {

        console.log(
            "👆 Notificació clicada"
        );


        event.notification.close();


        const url =
            event.notification.data?.url ||
            "/";


        event.waitUntil(

            clients.matchAll({

                type:
                    "window",

                includeUncontrolled:
                    true

            })

            .then(clientList => {

                for (
                    const client
                    of clientList
                ) {

                    if (
                        "focus"
                        in client
                    ) {

                        client.navigate(
                            url
                        );

                        return client.focus();
                    }
                }


                if (
                    clients.openWindow
                ) {

                    return clients.openWindow(
                        url
                    );
                }

            })
        );
    }
);