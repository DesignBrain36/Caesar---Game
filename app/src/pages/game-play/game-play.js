import './game-play.css'
import { navigateTo } from '../../lib/auth.js'
import { fetchGameDetails, submitGameAnswer } from '../../lib/games.js'

export const pageTitle = ({ id }) => `Play Game ${id} | Caesar Game`

function renderLoading() {
  return `
    <div class="roman-card p-4 text-center">
      <div class="spinner-border text-warning" role="status" aria-label="Loading game"></div>
      <p class="mt-3 mb-0 text-body-secondary">Loading your arena...</p>
    </div>
  `
}

function renderQuestionCard(question, answers) {
  return `
    <form class="play-question-card roman-card p-4 p-lg-5" id="playAnswerForm">
      <div class="play-question-card__header">
        <span class="page-kicker"><i class="bi bi-patch-question-fill" aria-hidden="true"></i>Question</span>
        <h2 class="h3 fw-semibold mt-3 mb-0">${question.value}</h2>
      </div>

      <div class="play-answers mt-4" role="radiogroup" aria-label="Available answers">
        ${answers
          .map(
            (answer, index) => `
              <label class="play-answer-choice" for="answer-${answer.id}">
                <input class="play-answer-choice__input" type="radio" name="answerId" id="answer-${answer.id}" value="${answer.id}" />
                <span class="play-answer-choice__marker">${String.fromCharCode(65 + index)}</span>
                <span class="play-answer-choice__text">${answer.value}</span>
              </label>
            `,
          )
          .join('')}
      </div>

      <div class="d-flex flex-wrap gap-2 mt-4">
        <button class="btn cta-btn" type="submit">Lock Answer</button>
        <a class="btn btn-outline-light" href="/Games" data-link>Back to games</a>
      </div>

      <div class="game-play__status mt-3" id="playStatus" role="status" aria-live="polite"></div>
    </form>
  `
}

function renderFinishedCard(game) {
  return `
    <div class="roman-card p-4 p-lg-5 text-center">
      <span class="page-kicker"><i class="bi bi-trophy-fill" aria-hidden="true"></i>Game Complete</span>
      <h2 class="h3 fw-semibold mt-3">Your game has finished</h2>
      <p class="mt-3 text-body-secondary mb-0">
        Final points: ${game.total_points}. Duration: ${game.durationLabel}. Resume details in the view page.
      </p>
      <div class="d-flex flex-wrap justify-content-center gap-2 mt-4">
        <a class="btn cta-btn" href="/game/${game.id}/view" data-link>View game</a>
        <a class="btn btn-outline-light" href="/Games" data-link>All games</a>
      </div>
    </div>
  `
}

export function renderPage({ id }) {
  return `
    <section class="page-panel p-4 p-lg-5 scene-reveal game-play-page">
      <div class="d-flex flex-wrap justify-content-between gap-3 align-items-end">
        <div>
          <span class="page-kicker"><i class="bi bi-play-circle-fill" aria-hidden="true"></i>Play Screen</span>
          <h1 class="h2 fw-semibold mt-3">Game ${id}</h1>
          <p class="mt-2 mb-0 text-body-secondary">Answer the current Roman mathematics challenge to advance the arena.</p>
        </div>

        <div class="d-flex flex-wrap gap-2">
          <a class="btn btn-outline-light" href="/game/${id}/view" data-link>View Game</a>
          <a class="btn cta-btn" href="/Games" data-link>All Games</a>
        </div>
      </div>

      <div class="row g-3 mt-3">
        <div class="col-lg-8">
          <div id="gamePlayMain">${renderLoading()}</div>
        </div>

        <div class="col-lg-4">
          <div class="roman-card p-4 h-100 game-play-sidebar" id="gamePlaySidebar">
            <p class="page-kicker mb-3"><i class="bi bi-columns-gap" aria-hidden="true"></i>Arena Stats</p>
            <div class="game-play-sidebar__placeholder text-body-secondary">Loading summary...</div>
          </div>
        </div>
      </div>
    </section>
  `
}

export function setupPage(outlet, params) {
  const mainHost = outlet.querySelector('#gamePlayMain')
  const sidebarHost = outlet.querySelector('#gamePlaySidebar')

  if (!mainHost || !sidebarHost) {
    return
  }

  const renderGame = async () => {
    const { game, question, answers, error } = await fetchGameDetails(params.id)

    if (error) {
      mainHost.innerHTML = `
        <div class="alert alert-danger mb-0" role="alert">
          ${error.message || 'Unable to load the selected game.'}
        </div>
      `
      sidebarHost.innerHTML = `
        <p class="page-kicker mb-3"><i class="bi bi-columns-gap" aria-hidden="true"></i>Arena Stats</p>
        <p class="text-body-secondary mb-0">No summary available.</p>
      `
      return
    }

    if (!game) {
      mainHost.innerHTML = `
        <div class="alert alert-warning mb-0" role="alert">
          This game could not be found or you do not have access to it.
        </div>
      `
      sidebarHost.innerHTML = ''
      return
    }

    sidebarHost.innerHTML = `
      <p class="page-kicker mb-3"><i class="bi bi-columns-gap" aria-hidden="true"></i>Arena Stats</p>
      <div class="game-stat-item">
        <span class="game-stat-item__label">Points</span>
        <strong class="game-stat-item__value">${game.total_points}</strong>
      </div>
      <div class="game-stat-item">
        <span class="game-stat-item__label">Started</span>
        <strong class="game-stat-item__value">${game.startedLabel}</strong>
      </div>
      <div class="game-stat-item">
        <span class="game-stat-item__label">Duration</span>
        <strong class="game-stat-item__value">${game.durationLabel}</strong>
      </div>
      <div class="game-stat-item">
        <span class="game-stat-item__label">Achieved Level</span>
        <strong class="game-stat-item__value">${game.currentLevel?.name ?? 'In progress'}</strong>
      </div>
      <div class="game-stat-item mb-0">
        <span class="game-stat-item__label">Prize</span>
        <strong class="game-stat-item__value">${game.currentLevel?.prize ?? 'Unclaimed'}</strong>
      </div>
    `

    if (game.finished_at || !question) {
      mainHost.innerHTML = renderFinishedCard(game)
      return
    }

    mainHost.innerHTML = renderQuestionCard(question, answers)

    const form = outlet.querySelector('#playAnswerForm')
    const status = outlet.querySelector('#playStatus')

    if (!form || !status) {
      return
    }

    form.addEventListener('submit', async (event) => {
      event.preventDefault()

      const formData = new FormData(form)
      const answerId = formData.get('answerId')

      if (!answerId) {
        status.textContent = 'Select an answer before continuing.'
        status.classList.add('is-error')
        return
      }

      status.textContent = 'Locking your answer...'
      status.classList.remove('is-error', 'is-success')

      const result = await submitGameAnswer({ gameId: params.id, answerId })

      if (result.error) {
        status.textContent = result.error.message || 'Unable to submit your answer.'
        status.classList.add('is-error')
        return
      }

      if (result.completed) {
        navigateTo(`/game/${params.id}/view`, true)
        return
      }

      navigateTo(`/game/${params.id}/play`, true)
    })
  }

  void renderGame()
}
