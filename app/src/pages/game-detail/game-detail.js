import './game-detail.css'

export const pageTitle = ({ id }) => `Game ${id} | Caesar Game`

export function renderPage({ id = 'unknown' }) {
  return `
    <section class="page-panel p-4 p-lg-5">
      <span class="page-kicker">Game detail</span>
      <h1 class="h2 fw-semibold mt-3">Game ${id}</h1>
      <p class="mt-3 mb-0 text-body-secondary">
        This dynamic route renders the selected game id from <code>/games/{id}/</code>.
      </p>

      <div class="d-flex flex-wrap gap-2 mt-4">
        <a class="btn btn-warning" href="/dashboard" data-link>Back to dashboard</a>
        <a class="btn btn-outline-light" href="/login" data-link>Open login</a>
      </div>
    </section>
  `
}