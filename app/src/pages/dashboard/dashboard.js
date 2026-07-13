import './dashboard.css'

const gameCards = [
  {
    id: 'alpha',
    title: 'Gauntlet Alpha',
    description: 'Prime numbers and equation pattern rounds in a high-speed opener.',
  },
  {
    id: 'beta',
    title: 'Gauntlet Beta',
    description: 'Geometry and ratio challenges built for precision under pressure.',
  },
  {
    id: 'delta',
    title: 'Gauntlet Delta',
    description: 'Advanced logic duels where one wrong step breaks the streak.',
  },
]

export const pageTitle = () => 'Dashboard | Caesar Game'

export function renderPage() {
  return `
    <section class="page-panel p-4 p-lg-5 scene-reveal">
      <div class="d-flex flex-wrap justify-content-between gap-3 align-items-end">
        <div>
          <span class="page-kicker"><i class="bi bi-columns-gap" aria-hidden="true"></i>Command Deck</span>
          <h1 class="h2 fw-semibold mt-3">Arena Dashboard</h1>
          <p class="mt-2 mb-0 text-body-secondary">
            Monitor your current campaign, inspect gauntlets, and launch the next challenge.
          </p>
        </div>

        <a class="btn cta-btn" href="/login" data-link>
          <i class="bi bi-door-open-fill me-2" aria-hidden="true"></i>Login to start playing
        </a>
      </div>

      <div class="row g-3 mt-3">
        <div class="col-md-4">
          <div class="dashboard-metric roman-card p-4 h-100 rounded-4">
            <p class="page-kicker mb-2"><i class="bi bi-fire" aria-hidden="true"></i>Win Streak</p>
            <h2 class="h3 fw-semibold mb-0">12</h2>
          </div>
        </div>

        <div class="col-md-4">
          <div class="dashboard-metric roman-card p-4 h-100 rounded-4">
            <p class="page-kicker mb-2"><i class="bi bi-people-fill" aria-hidden="true"></i>Contenders</p>
            <h2 class="h3 fw-semibold mb-0">48</h2>
          </div>
        </div>

        <div class="col-md-4">
          <div class="dashboard-metric roman-card p-4 h-100 rounded-4">
            <p class="page-kicker mb-2"><i class="bi bi-graph-up-arrow" aria-hidden="true"></i>Campaign Rate</p>
            <h2 class="h3 fw-semibold mb-0">84%</h2>
          </div>
        </div>
      </div>

      <div class="row g-3 mt-2">
        ${gameCards
          .map(
            (game) => `
              <div class="col-md-4">
                <article class="dashboard-card roman-card p-4 rounded-4 h-100">
                  <p class="page-kicker mb-2"><i class="bi bi-dice-6-fill" aria-hidden="true"></i>Game</p>
                  <h3 class="h5 fw-semibold">${game.title}</h3>
                  <p class="mb-4 text-body-secondary">${game.description}</p>
                  <a class="btn cta-btn btn-sm" href="/games/${game.id}/" data-link>Open game</a>
                </article>
              </div>
            `,
          )
          .join('')}
      </div>
    </section>
  `
}