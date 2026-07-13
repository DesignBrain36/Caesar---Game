import './game-start.css'
import { navigateTo } from '../../lib/auth.js'
import { createNewGame } from '../../lib/games.js'

export const pageTitle = () => 'Start Game | Caesar Game'

export function renderPage() {
  return `
    <section class="page-panel p-4 p-lg-5 scene-reveal game-start-page">
      <div class="roman-card p-4 p-lg-5 text-center game-start-card">
        <span class="page-kicker"><i class="bi bi-compass-fill" aria-hidden="true"></i>Launching Arena</span>
        <h1 class="h2 fw-semibold mt-3">Forging a new game</h1>
        <p class="mt-3 mb-0 text-body-secondary">
          A fresh Roman mathematics campaign is being assembled for you now.
        </p>
        <div class="spinner-border text-warning mt-4" role="status" aria-label="Creating game"></div>
        <p class="mt-3 mb-0 text-body-secondary" id="gameStartStatus">Preparing your first challenge...</p>
      </div>
    </section>
  `
}

export function setupPage(outlet) {
  const status = outlet.querySelector('#gameStartStatus')

  if (!status) {
    return
  }

  void (async () => {
    const { game, error } = await createNewGame()

    if (error || !game) {
      status.textContent = error?.message || 'Unable to create a new game.'
      return
    }

    status.textContent = 'Game created. Redirecting to play screen...'
    navigateTo(`/game/${game.id}/play`, true)
  })()
}
