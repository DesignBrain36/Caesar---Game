import './login.css'
import {
  isAuthConfigured,
  loginWithPassword,
  navigateTo,
  registerWithPassword,
} from '../../lib/auth.js'

export const pageTitle = () => 'Login | Caesar Game'

export function renderPage() {
  const authNotice = isAuthConfigured()
    ? ''
    : `
      <div class="alert alert-warning login-alert mt-3 mb-0" role="alert">
        Missing environment values: <strong>VITE_SUPABASE_URL</strong> and <strong>VITE_SUPABASE_ANON_KEY</strong>.
      </div>
    `

  return `
    <section class="page-panel p-4 p-lg-5 scene-reveal">
      <div class="row g-4 align-items-center">
        <div class="col-lg-5">
          <span class="page-kicker"><i class="bi bi-shield-lock-fill" aria-hidden="true"></i>Imperial Access</span>
          <h1 class="h2 fw-semibold mt-3">Login or Register to start playing</h1>
          <p class="mt-3 mb-0 text-body-secondary">
            Enter the arena with your account and continue your mathematics campaign.
            Your rank, streak, and reward milestones wait inside.
          </p>
          ${authNotice}

          <div class="roman-card login-note p-3 mt-4">
            <p class="mb-0 text-body-secondary">
              <i class="bi bi-lightning-charge-fill me-2" aria-hidden="true"></i>
              Quick entry grants immediate access to current rounds and challenge ladders.
            </p>
          </div>
        </div>

        <div class="col-lg-7">
          <div class="login-mode-switch mb-3" role="tablist" aria-label="Authentication mode">
            <button type="button" class="btn login-mode-btn active" data-auth-mode="login" aria-selected="true">Login</button>
            <button type="button" class="btn login-mode-btn" data-auth-mode="register" aria-selected="false">Register</button>
          </div>

          <form class="login-card roman-card p-4 p-lg-5" id="authForm">
            <div class="auth-status mb-3" id="authStatus" role="status" aria-live="polite"></div>

            <div class="mb-3">
              <label class="form-label" for="loginEmail">Email</label>
              <input id="loginEmail" class="form-control form-control-lg" name="email" type="email" placeholder="you@example.com" required />
            </div>

            <div class="mb-3">
              <label class="form-label" for="loginPassword">Password</label>
              <input id="loginPassword" class="form-control form-control-lg" name="password" type="password" placeholder="••••••••" minlength="6" required />
            </div>

            <button class="btn cta-btn btn-lg w-100" type="submit" id="authSubmitButton">
              <i class="bi bi-door-open-fill me-2" aria-hidden="true"></i><span id="authSubmitLabel">Enter The Arena</span>
            </button>
          </form>
        </div>
      </div>
    </section>
  `
}

function setStatus(statusElement, message, level = 'neutral') {
  statusElement.textContent = message
  statusElement.classList.remove('is-neutral', 'is-error', 'is-success')
  statusElement.classList.add(`is-${level}`)
}

export function setupPage(outlet) {
  const form = outlet.querySelector('#authForm')
  const statusElement = outlet.querySelector('#authStatus')
  const submitButton = outlet.querySelector('#authSubmitButton')
  const submitLabel = outlet.querySelector('#authSubmitLabel')
  const modeButtons = outlet.querySelectorAll('[data-auth-mode]')

  if (!form || !statusElement || !submitButton || !submitLabel || modeButtons.length === 0) {
    return
  }

  let currentMode = 'login'

  const setMode = (mode) => {
    currentMode = mode

    modeButtons.forEach((button) => {
      const isActive = button.dataset.authMode === mode
      button.classList.toggle('active', isActive)
      button.setAttribute('aria-selected', String(isActive))
    })

    submitLabel.textContent = mode === 'login' ? 'Enter The Arena' : 'Create Account'
    setStatus(
      statusElement,
      mode === 'login'
        ? 'Use your account credentials to continue.'
        : 'Create your account to begin your first arena run.',
      'neutral',
    )
  }

  modeButtons.forEach((button) => {
    button.addEventListener('click', () => {
      setMode(button.dataset.authMode)
    })
  })

  setMode('login')

  form.addEventListener('submit', async (event) => {
    event.preventDefault()

    const formData = new FormData(form)
    const email = String(formData.get('email') ?? '').trim()
    const password = String(formData.get('password') ?? '').trim()

    if (!email || !password) {
      setStatus(statusElement, 'Email and password are required.', 'error')
      return
    }

    submitButton.disabled = true
    setStatus(statusElement, currentMode === 'login' ? 'Logging in...' : 'Creating account...', 'neutral')

    const result =
      currentMode === 'login'
        ? await loginWithPassword(email, password)
        : await registerWithPassword(email, password)

    submitButton.disabled = false

    if (result.error) {
      setStatus(statusElement, result.error.message || 'Authentication failed.', 'error')
      return
    }

    if (currentMode === 'register' && !result.session) {
      setStatus(
        statusElement,
        'Registration created. If email confirmation is enabled, confirm your email then login.',
        'success',
      )
      return
    }

    setStatus(statusElement, 'Success. Redirecting to dashboard...', 'success')
    navigateTo('/dashboard', true)
  })
}