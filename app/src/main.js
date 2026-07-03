import 'bootstrap/dist/css/bootstrap.min.css'
import './styles/app.css'
import { createAppRouter } from './router.js'

document.body.dataset.bsTheme = 'dark'

const app = document.querySelector('#app')

app.innerHTML = `
  <div class="app-shell">
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
