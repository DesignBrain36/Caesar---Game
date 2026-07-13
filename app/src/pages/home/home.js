import './home.css'

export const pageTitle = () => 'Home | Caesar Game'

export function renderPage() {
  return `
    <section class="page-panel home-panel p-4 p-lg-5 scene-reveal">
      <div class="row align-items-center g-4">
        <div class="col-lg-7">
          <span class="page-kicker"><i class="bi bi-stars" aria-hidden="true"></i>Arena Prime</span>
          <h1 class="display-4 fw-semibold mt-3 home-title">Who Wants To Become The Mathematicus Maximus?</h1>
          <p class="lead mt-3 mb-0 text-body-secondary">
            Enter a live Roman game theater where each round is forged around numbers,
            logic, and historic strategy. Track rising stakes, answer with precision,
            and climb from scholar to imperial champion.
          </p>

          <div class="d-flex flex-wrap gap-2 mt-4">
            <a class="btn cta-btn btn-lg" href="/login" data-link>
              <i class="bi bi-door-open-fill me-2" aria-hidden="true"></i>Login to start playing
            </a>
            <a class="btn btn-outline-light btn-lg" href="/dashboard" data-link>
              <i class="bi bi-grid-1x2-fill me-2" aria-hidden="true"></i>View Arena Dashboard
            </a>
          </div>
        </div>

        <div class="col-lg-5">
          <div class="home-highlight rounded-4 p-4 h-100 roman-card">
            <p class="page-kicker mb-3"><i class="bi bi-reception-4" aria-hidden="true"></i>Live Broadcast</p>
            <ul class="home-checks mb-0">
              <li><i class="bi bi-check-circle-fill" aria-hidden="true"></i>Animated score bars and floating arena symbols</li>
              <li><i class="bi bi-check-circle-fill" aria-hidden="true"></i>Ancient Roman visual motifs with modern game energy</li>
              <li><i class="bi bi-check-circle-fill" aria-hidden="true"></i>Mathematics-focused challenge flow and fast sessions</li>
            </ul>
          </div>
        </div>
      </div>

      <div class="row g-3 mt-3">
        <div class="col-md-4">
          <article class="roman-card home-feature p-3 p-lg-4 h-100">
            <i class="bi bi-123 home-feature__icon" aria-hidden="true"></i>
            <h2 class="h5 mt-3 mb-2">Number Duels</h2>
            <p class="mb-0 text-body-secondary">Conquer sequences, algebra, geometry, and tactical mental math rounds.</p>
          </article>
        </div>
        <div class="col-md-4">
          <article class="roman-card home-feature p-3 p-lg-4 h-100">
            <i class="bi bi-hourglass-split home-feature__icon" aria-hidden="true"></i>
            <h2 class="h5 mt-3 mb-2">Timed Decisions</h2>
            <p class="mb-0 text-body-secondary">Beat the countdown clock and lock your answer before the arena fades.</p>
          </article>
        </div>
        <div class="col-md-4">
          <article class="roman-card home-feature p-3 p-lg-4 h-100">
            <i class="bi bi-trophy-fill home-feature__icon" aria-hidden="true"></i>
            <h2 class="h5 mt-3 mb-2">Crown Of Laurels</h2>
            <p class="mb-0 text-body-secondary">Win streaks, earn prestige, and rise on the senate rankings board.</p>
          </article>
        </div>
      </div>
    </section>
  `
}