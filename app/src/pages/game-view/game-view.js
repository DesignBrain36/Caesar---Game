import './game-view.css'
import { navigateTo } from '../../lib/auth.js'
import { deleteUserGame, fetchGameDetails } from '../../lib/games.js'

export const pageTitle = ({ id }) => `View Game ${id} | Caesar Game`

function renderSummaryCard(label, value, iconClass) {
  return `
    <div class="col-md-6 col-xl-3">
      <article class="roman-card game-view-card p-4 h-100">
        <div class="game-view-card__icon"><i class="${iconClass}" aria-hidden="true"></i></div>
        <p class="page-kicker mb-2">${label}</p>
        <h2 class="h4 fw-semibold mb-0">${value}</h2>
      </article>
    </div>
  `
}

function renderHistoryList(question, game) {
  if (!question) {
    return `
      <div class="roman-card p-4">
        <p class="mb-0 text-body-secondary">No question history is available for this game yet.</p>
      </div>
    `
  }

  return `
    <div class="roman-card p-4">
      <p class="page-kicker mb-3"><i class="bi bi-journal-text" aria-hidden="true"></i>Current Challenge</p>
      <h2 class="h4 fw-semibold">${question.value}</h2>
      <p class="mb-0 text-body-secondary">This game is ${game.finished_at ? 'finished' : 'still active'} and can be resumed from the play screen.</p>
    </div>
  `
}

export function renderPage({ id }) {
  return `
    <section class="page-panel p-4 p-lg-5 scene-reveal game-view-page">
      <div class="d-flex flex-wrap justify-content-between gap-3 align-items-end">
        <div>
          <span class="page-kicker"><i class="bi bi-eye-fill" aria-hidden="true"></i>Game Overview</span>
          <h1 class="h2 fw-semibold mt-3">Game ${id}</h1>
          <p class="mt-2 mb-0 text-body-secondary">Review your Roman mathematics run, resume it, or remove it from the arena.</p>
        </div>

        <div class="d-flex flex-wrap gap-2">
          <a class="btn btn-outline-light" href="/Games" data-link>Back to games</a>
          <a class="btn cta-btn" href="/game/${id}/play" data-link>Play / Resume</a>
        </div>
      </div>

      <div class="row g-3 mt-3" id="gameViewSummary"></div>

      <div class="row g-3 mt-3">
        <div class="col-lg-8" id="gameViewHistory">
          <div class="roman-card p-4 text-body-secondary">Loading game summary...</div>
        </div>

        <div class="col-lg-4">
          <div class="roman-card p-4 h-100 game-view-actions">
            <p class="page-kicker mb-3"><i class="bi bi-tools" aria-hidden="true"></i>Actions</p>
            <a class="btn cta-btn w-100" href="/game/${id}/play" data-link>Open play screen</a>
            <button class="btn game-view-delete-btn w-100 mt-2" type="button" id="deleteGameButton">Delete game</button>
            <p class="mt-3 mb-0 text-body-secondary">Delete uses a popup confirmation before removing the record.</p>
          </div>
        </div>
      </div>
    </section>
  `
}

export function setupPage(outlet, params) {
  const summaryHost = outlet.querySelector('#gameViewSummary')
  const historyHost = outlet.querySelector('#gameViewHistory')
  const deleteButton = outlet.querySelector('#deleteGameButton')

  if (!summaryHost || !historyHost || !deleteButton) {
    return
  }

  const renderGame = async () => {
    const { game, question, error } = await fetchGameDetails(params.id)

    if (error) {
      summaryHost.innerHTML = `
        <div class="col-12">
          <div class="alert alert-danger mb-0" role="alert">${error.message || 'Unable to load this game.'}</div>
        </div>
      `
      historyHost.innerHTML = ''
      return
    }

    if (!game) {
      summaryHost.innerHTML = `
        <div class="col-12">
          <div class="alert alert-warning mb-0" role="alert">This game was not found or you do not have access to it.</div>
        </div>
      `
      historyHost.innerHTML = ''
      return
    }

    summaryHost.innerHTML = [
      renderSummaryCard('Points', String(game.total_points), 'bi bi-coin'),
      renderSummaryCard('Started', game.startedLabel, 'bi bi-calendar-event-fill'),
      renderSummaryCard('Duration', game.durationLabel, 'bi bi-stopwatch-fill'),
      renderSummaryCard('Achieved Level', game.currentLevel?.name ?? 'In progress', 'bi bi-award-fill'),
    ].join('')

    historyHost.innerHTML = renderHistoryList(question, game)
  }

  deleteButton.addEventListener('click', async () => {
    const confirmed = window.confirm('Delete this game? This action cannot be undone.')

    if (!confirmed) {
      return
    }

    deleteButton.disabled = true
    const { error } = await deleteUserGame(params.id)
    deleteButton.disabled = false

    if (error) {
      window.alert(error.message || 'Unable to delete this game.')
      return
    }

    navigateTo('/Games', true)
  })

  void renderGame()
}
