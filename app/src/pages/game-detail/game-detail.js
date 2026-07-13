import './game-detail.css'

export const pageTitle = ({ id }) => `Game ${id} | Caesar Game`

export function renderPage({ id = 'unknown' }) {
  return `
    <section class="page-panel p-4 p-lg-5 scene-reveal">
      <span class="page-kicker"><i class="bi bi-compass-fill" aria-hidden="true"></i>Challenge Brief</span>
      <h1 class="h2 fw-semibold mt-3">Arena ${id}</h1>
      <p class="mt-3 mb-0 text-body-secondary">
        The selected arena is loaded from <code>/games/{id}/</code>. Use this stage for
        question ladders, current score, and lifeline controls.
      </p>

      <div class="d-flex flex-wrap gap-2 mt-4">
        <a class="btn cta-btn" href="/dashboard" data-link>Back to dashboard</a>
        <a class="btn btn-outline-light" href="/login" data-link>Open login</a>
      </div>

      <div class="roman-card p-4 mt-4 game-detail-note">
        <p class="mb-0 text-body-secondary">
          <i class="bi bi-info-circle-fill me-2" aria-hidden="true"></i>
          Add game state widgets here to track prize tier, timer, and your current answer lock.
        </p>
      </div>
    </section>
  `
}