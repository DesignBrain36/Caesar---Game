import './footer.css'

export function renderFooter() {
  return `
    <div class="app-footer">
      <div class="container-fluid px-3 px-lg-4 py-3 d-flex flex-wrap justify-content-between gap-2 small">
        <span><i class="bi bi-columns-gap me-2" aria-hidden="true"></i>© ${new Date().getFullYear()} Caesar Numerus</span>
        <span><i class="bi bi-calculator me-2" aria-hidden="true"></i>Roman mathematics game show experience</span>
      </div>
    </div>
  `
}