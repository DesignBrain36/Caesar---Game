import './login.css'

export const pageTitle = () => 'Login | Caesar Game'

export function renderPage() {
  return `
    <section class="page-panel p-4 p-lg-5 scene-reveal">
      <div class="row g-4 align-items-center">
        <div class="col-lg-5">
          <span class="page-kicker"><i class="bi bi-shield-lock-fill" aria-hidden="true"></i>Imperial Access</span>
          <h1 class="h2 fw-semibold mt-3">Login to start playing</h1>
          <p class="mt-3 mb-0 text-body-secondary">
            Enter the arena with your account and continue your mathematics campaign.
            Your rank, streak, and reward milestones wait inside.
          </p>

          <div class="roman-card login-note p-3 mt-4">
            <p class="mb-0 text-body-secondary">
              <i class="bi bi-lightning-charge-fill me-2" aria-hidden="true"></i>
              Quick entry grants immediate access to current rounds and challenge ladders.
            </p>
          </div>
        </div>

        <div class="col-lg-7">
          <form class="login-card roman-card p-4 p-lg-5">
            <div class="mb-3">
              <label class="form-label" for="loginEmail">Email</label>
              <input id="loginEmail" class="form-control form-control-lg" type="email" placeholder="you@example.com" />
            </div>

            <div class="mb-3">
              <label class="form-label" for="loginPassword">Password</label>
              <input id="loginPassword" class="form-control form-control-lg" type="password" placeholder="••••••••" />
            </div>

            <button class="btn cta-btn btn-lg w-100" type="button">
              <i class="bi bi-door-open-fill me-2" aria-hidden="true"></i>Enter The Arena
            </button>
          </form>
        </div>
      </div>
    </section>
  `
}