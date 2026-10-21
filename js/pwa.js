let registration = null,
  installPrompt = null,
  refreshRequested = false,
  ready = false,
  unavailable = false;
export function offlineStatus() {
  if (unavailable)
    return "Offline caching unavailable · browser storage or service worker is blocked";
  if (!("serviceWorker" in navigator) || !isSecureContext)
    return "Offline caching unavailable · use HTTPS or localhost";
  return ready
    ? "Offline ready · " +
        (navigator.onLine ? "connected" : "currently offline")
    : "Preparing offline files…";
}
function refresh() {
  document
    .querySelectorAll("#offline-state")
    .forEach((el) => (el.textContent = offlineStatus()));
  document
    .querySelectorAll('[data-pwa="install"]')
    .forEach((el) => (el.hidden = !installPrompt));
}
function showUpdate() {
  document.querySelector("#update-notice").hidden = false;
}
export function setupPwa(notify) {
  document.addEventListener("click", async (e) => {
    const button = e.target.closest("[data-pwa]");
    if (!button) return;
    try {
      if (button.dataset.pwa === "install" && installPrompt) {
        await installPrompt.prompt();
        await installPrompt.userChoice;
        installPrompt = null;
        refresh();
      }
      if (button.dataset.pwa === "check") {
        if (!registration) {
          notify("Offline caching is unavailable in this browser.");
          return;
        }
        await registration.update();
        if (registration.waiting) showUpdate();
        else notify("Update check complete. New releases appear when ready.");
      }
      if (button.dataset.pwa === "update" && registration?.waiting) {
        refreshRequested = true;
        registration.waiting.postMessage({ type: "SKIP_WAITING" });
      }
      if (button.dataset.pwa === "later")
        document.querySelector("#update-notice").hidden = true;
    } catch {
      notify(
        "This action is unavailable right now. Try again while connected.",
      );
    }
  });
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    installPrompt = e;
    refresh();
  });
  window.addEventListener("appinstalled", () => {
    installPrompt = null;
    refresh();
    notify("DevKit installed");
  });
  window.addEventListener("online", refresh);
  window.addEventListener("offline", refresh);
  window.addEventListener("devkit:render", refresh);
  if (!("serviceWorker" in navigator) || !isSecureContext) {
    refresh();
    return;
  }
  navigator.serviceWorker.addEventListener("controllerchange", () => {
    ready = true;
    refresh();
    if (refreshRequested) location.reload();
  });
  async function register() {
    try {
      registration = await navigator.serviceWorker.register(
        new URL("../sw.js", import.meta.url),
        {
          scope: new URL("../", import.meta.url).pathname,
          updateViaCache: "none",
        },
      );
      ready = !!navigator.serviceWorker.controller;
      refresh();
      if (registration.waiting) showUpdate();
      registration.addEventListener("updatefound", () => {
        const worker = registration.installing;
        worker?.addEventListener("statechange", () => {
          if (
            worker.state === "installed" &&
            navigator.serviceWorker.controller
          )
            showUpdate();
        });
      });
      await navigator.serviceWorker.ready;
      ready = !!navigator.serviceWorker.controller;
      refresh();
    } catch {
      unavailable = true;
      refresh();
    }
  }
  if (document.readyState === "complete") register();
  else window.addEventListener("load", register, { once: true });
}
