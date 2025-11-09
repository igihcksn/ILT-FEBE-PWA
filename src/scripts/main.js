import App from './views/app.js';
import { registerSW } from './utils.js';

const drawerNavigation = document.querySelector('#navlist');
const drawerButton = document.querySelector('#drawerbutton');
const content = document.querySelector('#maincontent');

const app = new App({
  content,
  drawerButton,
  drawerNavigation,
});

// track SW and install event
let swRegistered = false;
let deferredInstallPrompt = null;

function isMobileDevice() {
  return /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent) || window.matchMedia('(pointer:coarse)').matches;
}

async function handleInstallButtonClick() {
  const btn = document.getElementById('installBtn');
  if (!deferredInstallPrompt) {
    console.warn('No deferred install prompt available');
    return;
  }

  try {
    btn.disabled = true;
    // show native install prompt
    deferredInstallPrompt.prompt();
    const choiceResult = await deferredInstallPrompt.userChoice;
    console.log('A2HS choice:', choiceResult.outcome); // 'accepted' or 'dismissed'
    // clear the saved prompt
    deferredInstallPrompt = null;
  } catch (err) {
    console.error('Error during install prompt:', err);
  } finally {
    if (btn) {
      btn.style.display = 'none';
      btn.disabled = false;
    }
  }
}

function showInstallButtonIfReady() {
  if (!isMobileDevice()) return;
  if (!swRegistered) return;
  if (!deferredInstallPrompt) return;

  const btn = document.getElementById('installBtn');
  if (!btn) return;

  btn.style.display = 'inline-block';
  btn.removeAttribute('aria-hidden');

  // attach click handler once
  if (!btn.dataset.installHandlerAttached) {
    btn.addEventListener('click', handleInstallButtonClick);
    btn.dataset.installHandlerAttached = '1';
  }

  console.log('Install button shown (mobile + SW registered + beforeinstallprompt fired)');
}

document.addEventListener('DOMContentLoaded', async () => {
  await app.renderPage();

  // register service worker and mark as ready
  try {
    await registerSW();
    swRegistered = true;
    console.log('Service worker registered');
  } catch (err) {
    console.warn('SW registration failed:', err);
  }

  // If beforeinstallprompt already fired, try to show button now
  showInstallButtonIfReady();
});

window.addEventListener('hashchange', async () => {
  await app.renderPage();
});

window.addEventListener('beforeinstallprompt', (e) => {
  // prevent the browser from auto-showing the prompt
  e.preventDefault();
  console.log('beforeinstallprompt fired — will show install button when SW ready');

  deferredInstallPrompt = e;
  showInstallButtonIfReady();
});
