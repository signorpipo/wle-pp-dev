/*
export let deferredPrompt = null;

if (window != null && window.addEventListener != null) {
    console.error("REGISTERING PWA INSTALL");
    window.addEventListener("beforeinstallprompt", (e) => {
        console.error("PWA ENABLED");

        // Prevent the mini-infobar from appearing on mobile
        e.preventDefault();

        // Stash the event so it can be triggered later.
        deferredPrompt = e;
    });
}
*/