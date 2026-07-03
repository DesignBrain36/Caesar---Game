import './home.css'

export const pageTitle = () => 'Home | Caesar Game'

export function renderPage() {
  return `
    <section class="page-panel home-panel p-4 p-lg-5">
      <div class="row align-items-center g-4">
        <div class="col-lg-7">
          <span class="page-kicker">Homepage</span>
          <h1 class="display-5 fw-semibold mt-3">Hello world!</h1>
          <p class="lead mt-3 mb-0 text-body-secondary">
            This scaffold is split into routed pages, shared layout components,
            and small modular files so each feature stays easy to extend.
          </p>

          <div class="d-flex flex-wrap gap-2 mt-4">
            <a class="btn btn-warning btn-lg" href="/dashboard" data-link>Open dashboard</a>
            <a class="btn btn-outline-light btn-lg" href="/login" data-link>Go to login</a>
          </div>
        </div>

        <div class="col-lg-5">
          <div class="home-highlight rounded-4 p-4 h-100">
            <p class="page-kicker mb-2">Routing ready</p>
            <p class="mb-0 text-body-secondary">
              Supported URLs include <code>/</code>, <code>/login</code>,
              <code>/dashboard</code>, and <code>/games/{id}/</code>.
            </p>
          </div>
        </div>
      </div>
    </section>
  `
}