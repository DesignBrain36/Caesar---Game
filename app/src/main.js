import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap-icons/font/bootstrap-icons.css'
import './styles/app.css'
import { createAppRouter } from './router.js'

document.body.dataset.bsTheme = 'dark'

const app = document.querySelector('#app')

app.innerHTML = `
  <div class="app-shell">
    <div class="live-background" aria-hidden="true">
      <div class="live-grid"></div>
      <div class="live-orb live-orb--one"></div>
      <div class="live-orb live-orb--two"></div>
      <div class="live-bars">
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
      </div>
      <i class="bi bi-calculator live-icon live-icon--calc"></i>
      <i class="bi bi-patch-question live-icon live-icon--question"></i>
      <i class="bi bi-trophy live-icon live-icon--trophy"></i>
      <i class="bi bi-graph-up-arrow live-icon live-icon--graph"></i>
      <i class="bi bi-stopwatch live-icon live-icon--clock"></i>
      <i class="bi bi-bank live-icon live-icon--laurel"></i>
    </div>
    <header id="app-header"></header>
    <main id="page-content" class="app-shell__content" aria-live="polite"></main>
    <footer id="app-footer"></footer>
  </div>
`

createAppRouter({
  headerMount: app.querySelector('#app-header'),
  outlet: app.querySelector('#page-content'),
  footerMount: app.querySelector('#app-footer'),
})
