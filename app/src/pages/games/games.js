import './games.css'
import { deleteUserGame, fetchUserGames } from '../../lib/games.js'

export const pageTitle = () => 'Games | Caesar Game'

function renderGameRow(game) {
  return `
    <tr>
      <td>
        <div class="games-table__date">${game.startedLabel}</div>
        <div class="games-table__subtle text-body-secondary">Game #${game.id}</div>
      </td>
      <td>${game.achievedLevelLabel}</td>
      <td>${game.prizeLabel}</td>
      <td>${game.durationLabel}</td>
      <td>
        <div class="d-flex flex-wrap gap-2">
          <a class="btn btn-sm btn-outline-light" href="/game/${game.id}/view" data-link>View</a>
          <a class="btn btn-sm cta-btn" href="/game/${game.id}/play" data-link>Play</a>
          <button class="btn btn-sm games-delete-btn" type="button" data-game-delete="${game.id}">Delete</button>
        </div>
      </td>
    </tr>
  `
}

function renderEmptyRow(message) {
  return `
    <tr>
      <td colspan="5" class="py-5 text-center text-body-secondary">${message}</td>
    </tr>
  `
}

function renderSummaryCard(label, value, iconClass) {
  return `
    <div class="col-md-4">
      <article class="roman-card games-summary-card p-4 h-100">
        <div class="games-summary-card__icon"><i class="${iconClass}" aria-hidden="true"></i></div>
        <p class="page-kicker mb-2">${label}</p>
        <h2 class="h3 fw-semibold mb-0">${value}</h2>
      </article>
    </div>
  `
}

export function renderPage() {
  return `
    <section class="page-panel p-4 p-lg-5 scene-reveal games-page">
      <div class="d-flex flex-wrap justify-content-between gap-3 align-items-end">
        <div>
          <span class="page-kicker"><i class="bi bi-archive-fill" aria-hidden="true"></i>Campaign Records</span>
          <h1 class="h2 fw-semibold mt-3">Your Games</h1>
          <p class="mt-2 mb-0 text-body-secondary">
            Track every Roman mathematics run, then resume, inspect, or remove a game from the arena.
          </p>
        </div>

        <div class="d-flex flex-wrap gap-2">
          <a class="btn btn-outline-light" href="/dashboard" data-link>Dashboard</a>
          <a class="btn cta-btn" href="/game/start" data-link>Start New Game</a>
        </div>
      </div>

      <div class="row g-3 mt-3" id="gamesSummary"></div>

      <div class="table-responsive mt-4 games-table-wrap">
        <table class="table align-middle games-table mb-0">
          <thead>
            <tr>
              <th scope="col">Date</th>
              <th scope="col">Achieved Level</th>
              <th scope="col">Prize</th>
              <th scope="col">Duration</th>
              <th scope="col">Actions</th>
            </tr>
          </thead>
          <tbody id="gamesTableBody">
            ${renderEmptyRow('Loading your games...')}
          </tbody>
        </table>
      </div>

      <div class="alert alert-danger d-none mt-3" id="gamesError" role="alert"></div>
    </section>
  `
}

export function setupPage(outlet) {
  const summaryHost = outlet.querySelector('#gamesSummary')
  const tableBody = outlet.querySelector('#gamesTableBody')
  const errorHost = outlet.querySelector('#gamesError')

  if (!summaryHost || !tableBody || !errorHost) {
    return
  }

  const renderGames = async () => {
    errorHost.classList.add('d-none')
    errorHost.textContent = ''

    const { games, error } = await fetchUserGames()

    if (error) {
      errorHost.textContent = error.message || 'Unable to load your games.'
      errorHost.classList.remove('d-none')
      tableBody.innerHTML = renderEmptyRow('Unable to load games right now.')
      summaryHost.innerHTML = ''
      return
    }

    const completedGames = games.filter((game) => game.durationLabel !== 'In progress')
    const inProgressGames = games.length - completedGames.length
    summaryHost.innerHTML = [
      renderSummaryCard('Games', String(games.length).padStart(2, '0'), 'bi bi-controller'),
      renderSummaryCard('Completed', String(completedGames.length).padStart(2, '0'), 'bi bi-trophy-fill'),
      renderSummaryCard('In Progress', String(inProgressGames).padStart(2, '0'), 'bi bi-hourglass-split'),
    ].join('')

    if (games.length === 0) {
      tableBody.innerHTML = renderEmptyRow('No games yet. Start one to enter the arena.')
      return
    }

    tableBody.innerHTML = games.map(renderGameRow).join('')
  }

  tableBody.addEventListener('click', async (event) => {
    const deleteButton = event.target.closest('[data-game-delete]')

    if (!deleteButton) {
      return
    }

    const gameId = deleteButton.dataset.gameDelete
    const confirmed = window.confirm('Delete this game? This action cannot be undone.')

    if (!confirmed) {
      return
    }

    deleteButton.disabled = true
    const { error } = await deleteUserGame(gameId)
    deleteButton.disabled = false

    if (error) {
      errorHost.textContent = error.message || 'Unable to delete the selected game.'
      errorHost.classList.remove('d-none')
      return
    }

    await renderGames()
  })

  void renderGames()
}
