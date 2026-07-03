import './footer.css'

export function renderFooter() {
  return `
    <div class="app-footer">
      <div class="container-fluid px-3 px-lg-4 py-3 d-flex flex-wrap justify-content-between gap-2 small">
        <span>© ${new Date().getFullYear()} Caesar Game</span>
        <span>Vite, JavaScript, HTML, CSS, and Bootstrap scaffold</span>
      </div>
    </div>
  `
}