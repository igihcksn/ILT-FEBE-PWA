import App from './views/app.js';
import { registerSW } from './utils.js';

const drawerNavigation = document.querySelector('#navlist');
const drawerButton = document.querySelector('#drawerbutton');
const content = document.querySelector('#maincontent');

// Check if device is mobile or tablet
function isMobileDevice() {
  return /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent) || window.matchMedia('(pointer:coarse)').matches;
}

const app = new App({
  content,
  drawerButton,
  drawerNavigation,
});

document.addEventListener('DOMContentLoaded', async () => {
  await app.renderPage();

  try {
    await registerSW();
    console.log('SW registered successfully');

    // Only setup install prompt for mobile/tablet
    console.log('isMobileDevice', isMobileDevice())
    if (isMobileDevice()) {
      window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        console.log('Install prompt available');

        const installBtn = document.getElementById('installBtn');
        if (installBtn) {
          installBtn.style.display = 'block';
          
          installBtn.addEventListener('click', () => {
            e.prompt();
            installBtn.style.display = 'none';
          });
        }
      });
    }
  } catch (error) {
    console.error('SW registration failed:', error);
  }
});

window.addEventListener('hashchange', async () => {
  await app.renderPage();
});
