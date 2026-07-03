import './login.css'

export const pageTitle = () => 'Login | Caesar Game'

export function renderPage() {
  return `
    <section class="page-panel p-4 p-lg-5">
      <div class="row g-4 align-items-center">
        <div class="col-lg-5">
          <span class="page-kicker">Account</span>
          <h1 class="h2 fw-semibold mt-3">Login</h1>
          <p class="mt-3 mb-0 text-body-secondary">
            This page is a scaffold for future authentication wiring.
          </p>
        </div>

        <div class="col-lg-7">
          <form class="login-card p-4 p-lg-5">
            <div class="mb-3">
              <label class="form-label" for="loginEmail">Email</label>
              <input id="loginEmail" class="form-control form-control-lg" type="email" placeholder="you@example.com" />
            </div>

            <div class="mb-3">
              <label class="form-label" for="loginPassword">Password</label>
              <input id="loginPassword" class="form-control form-control-lg" type="password" placeholder="••••••••" />
            </div>

            <button class="btn btn-warning btn-lg w-100" type="button">Continue</button>
          </form>
        </div>
      </div>
    </section>
  `
}