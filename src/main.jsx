import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '@/App.jsx'
import '@/index.css'

// Dev-only: unregister stale service workers and clear caches that can serve
// mixed React chunks and trigger "dispatcher.useState is null" runtime errors.
if (import.meta.env.DEV && 'serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations()
    .then((regs) => Promise.all(regs.map((r) => r.unregister())))
    .then(() => {
      if ('caches' in window) {
        return caches.keys().then((keys) => Promise.all(keys.map((k) => caches.delete(k))));
      }
    })
    .catch(() => {});
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <App />
)