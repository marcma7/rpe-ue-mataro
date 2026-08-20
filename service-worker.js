// service-worker.js

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

    let data = {};

    try {
        data = event.data ? event.data.json() : {};
    } catch (error) {
        console.error(
            "Error llegint la notificació push:",
            error
        );
    }

    const title = data.title || "La teva aplicació";

    const options = {
        body: data.body || "",
        icon: data.icon || "/icon-192.png",
        badge: data.badge || "/icon-192.png",
        data: {
            url: data.url || "/"
        }
    };

    event.waitUntil(
        self.registration.showNotification(
            title,
            options
        )
    );
});


self.addEventListener("notificationclick", event => {

    event.notification.close();

    const url =
        event.notification.data?.url || "/";

    event.waitUntil(
        clients.matchAll({
            type: "window",
            includeUncontrolled: true
        }).then(clientList => {

            // Si la web ja està oberta, la portem al davant
            for (const client of clientList) {

                if ("focus" in client) {

                    client.navigate(url);

                    return client.focus();
                }
            }

            // Si no està oberta, l'obrim
            if (clients.openWindow) {
                return clients.openWindow(url);
            }
        })
    );
});
