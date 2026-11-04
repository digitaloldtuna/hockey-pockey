/* Hockey Pockey service worker: shows push notifications and opens the app when one is tapped.
   Deliberately tiny. It caches nothing and loads no outside code. */

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()));

// only paths inside this site are ever opened, never another website
const safePath = (value) =>
  typeof value === 'string' && value.startsWith('/') && !value.startsWith('//') ? value : '/';

self.addEventListener('push', (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch (error) {
    data = { body: event.data ? event.data.text() : '' };
  }

  const title = String(data.title || 'Hockey Pockey').slice(0, 120);
  const options = {
    body: String(data.body || '').slice(0, 300),
    icon: '/logo192.png',
    // the same tag replaces an earlier notification instead of stacking another one
    tag: typeof data.tag === 'string' ? data.tag.slice(0, 64) : undefined,
    // when a tag replaces an older notification, still alert again instead of swapping it silently
    renotify: typeof data.tag === 'string',
    data: { url: safePath(data.url) },
  };

  // every push must show something, or the browser may stop delivering them
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  // checked again here, not only when the push arrived
  const target = new URL(
    safePath(event.notification.data && event.notification.data.url),
    self.location.origin
  );
  if (target.origin !== self.location.origin) return;

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windows) => {
      const open = windows.find((client) => new URL(client.url).origin === self.location.origin);
      if (open) {
        return open.focus().then(() => open.navigate(target.href).catch(() => undefined));
      }
      return self.clients.openWindow(target.href);
    })
  );
});
