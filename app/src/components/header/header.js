import './header.css'

const navigationItems = [
  { label: 'Home', href: '/' },
  { label: 'Login', href: '/login' },
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'Game 42', href: '/games/42/' },
]

const normalizePath = (pathname) => {
  if (pathname !== '/' && pathname.endsWith('/')) {
    return pathname.replace(/\/+$/, '')
  }

  return pathname
}

const isActive = (currentPath, href) => {
  const normalizedPath = normalizePath(currentPath)
  const normalizedHref = normalizePath(href)

  if (normalizedHref === '/') {
    return normalizedPath === '/'
  }

  return normalizedPath === normalizedHref || normalizedPath.startsWith(`${normalizedHref}/`)
}

export function renderHeader(currentPath) {
  return `
    <nav class="navbar navbar-expand-lg app-header">
      <div class="container-fluid px-3 px-lg-4 py-3">
        <a class="navbar-brand app-brand fw-semibold text-white" href="/" data-link>
          Caesar Game
        </a>

        <div class="navbar-nav ms-auto flex-row flex-wrap justify-content-end gap-2">
          ${navigationItems
            .map(
              (item) => `
                <a
                  class="nav-link app-nav-link ${isActive(currentPath, item.href) ? 'active' : ''}"
                  href="${item.href}"
                  data-link
                >
                  ${item.label}
                </a>
              `,
            )
            .join('')}
        </div>
      </div>
    </nav>
  `
}