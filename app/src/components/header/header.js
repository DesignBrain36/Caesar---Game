import './header.css'

const navigationItems = [
  { label: 'Home', href: '/' },
  { label: 'Login', href: '/login' },
  { label: 'Games', href: '/Games' },
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'Profile', href: '/profile' },
  { label: 'Arena 42', href: '/games/42/' },
]

const normalizePath = (pathname) => {
  if (pathname !== '/' && pathname.endsWith('/')) {
    return pathname.replace(/\/+$/, '').toLowerCase()
  }

  return pathname.toLowerCase()
}

const isActive = (currentPath, href) => {
  const normalizedPath = normalizePath(currentPath)
  const normalizedHref = normalizePath(href)

  if (normalizedHref === '/') {
    return normalizedPath === '/'
  }

  return normalizedPath === normalizedHref || normalizedPath.startsWith(`${normalizedHref}/`)
}

export function renderHeader(currentPath, session) {
  const visibleNavigationItems = navigationItems.filter((item) => {
    if (item.href === '/login') {
      return !session
    }

    if (item.href === '/Games' || item.href === '/dashboard' || item.href === '/profile' || item.href.startsWith('/games/')) {
      return Boolean(session)
    }

    return true
  })

  return `
    <nav class="navbar navbar-expand-lg app-header">
      <div class="container-fluid px-3 px-lg-4 py-3">
        <a class="navbar-brand app-brand fw-semibold" href="/" data-link>
          <span class="app-brand__icon" aria-hidden="true"><i class="bi bi-bank"></i></span>
          <span>
            Caesar Numerus
            <small>Mathematica Maxima</small>
          </span>
        </a>

        <div class="navbar-nav ms-auto flex-row flex-wrap justify-content-end gap-2">
          ${visibleNavigationItems
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

          ${
            session
              ? '<button class="btn app-logout-btn" type="button" data-action="logout"><i class="bi bi-box-arrow-right me-2" aria-hidden="true"></i>Logout</button>'
              : ''
          }
        </div>
      </div>
    </nav>
  `
}