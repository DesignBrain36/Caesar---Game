import './dashboard.css'

const gameCards = [
  {
    id: 'alpha',
    title: 'Game alpha',
    description: 'A placeholder card that links into the dynamic game detail route.',
  },
  {
    id: 'beta',
    title: 'Game beta',
    description: 'Use this area for match stats, rewards, or progression data.',
  },
  {
    id: 'delta',
    title: 'Game delta',
    description: 'Add more cards or wire them to live data later.',
  },
]

export const pageTitle = () => 'Dashboard | Caesar Game'

export function renderPage() {
  return `
    <section class="page-panel p-4 p-lg-5">
      <div class="d-flex flex-wrap justify-content-between gap-3 align-items-end">
        <div>
          <span class="page-kicker">Workspace</span>
          <h1 class="h2 fw-semibold mt-3">Dashboard</h1>
          <p class="mt-2 mb-0 text-body-secondary">
            This area is ready for summary cards, quick actions, and game entries.
          </p>
        </div>

        <a class="btn btn-outline-light" href="/" data-link>Back home</a>
      </div>

      <div class="row g-3 mt-3">
        <div class="col-md-4">
          <div class="dashboard-metric p-4 h-100 rounded-4">
            <p class="page-kicker mb-2">Matches</p>
            <h2 class="h3 fw-semibold mb-0">12</h2>
          </div>
        </div>

        <div class="col-md-4">
          <div class="dashboard-metric p-4 h-100 rounded-4">
            <p class="page-kicker mb-2">Players</p>
            <h2 class="h3 fw-semibold mb-0">48</h2>
          </div>
        </div>

        <div class="col-md-4">
          <div class="dashboard-metric p-4 h-100 rounded-4">
            <p class="page-kicker mb-2">Completion</p>
            <h2 class="h3 fw-semibold mb-0">84%</h2>
          </div>
        </div>
      </div>

      <div class="row g-3 mt-2">
        ${gameCards
          .map(
            (game) => `
              <div class="col-md-4">
                <article class="dashboard-card p-4 rounded-4 h-100">
                  <p class="page-kicker mb-2">Game</p>
                  <h3 class="h5 fw-semibold">${game.title}</h3>
                  <p class="mb-4 text-body-secondary">${game.description}</p>
                  <a class="btn btn-sm btn-warning" href="/games/${game.id}/" data-link>Open game</a>
                </article>
              </div>
            `,
          )
          .join('')}
      </div>
    </section>
  `
}