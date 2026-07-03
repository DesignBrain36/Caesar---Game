import { renderFooter } from './components/footer/footer.js'
import { renderHeader } from './components/header/header.js'

const routes = [
  {
    pattern: /^\/$/,
    load: () => import('./pages/home/home.js'),
  },
  {
    pattern: /^\/login\/?$/,
    load: () => import('./pages/login/login.js'),
  },
  {
    pattern: /^\/dashboard\/?$/,
    load: () => import('./pages/dashboard/dashboard.js'),
  },
  {
    pattern: /^\/games\/([^/]+)\/?$/,
    load: () => import('./pages/game-detail/game-detail.js'),
  },
]

const normalizePath = (pathname) => {
  if (pathname !== '/' && pathname.endsWith('/')) {
    return pathname.replace(/\/+$/, '')
  }

  return pathname
}

const findRoute = (pathname) => {
  const normalizedPath = normalizePath(pathname)

  for (const route of routes) {
    const match = normalizedPath.match(route.pattern)

    if (match) {
      return {
        load: route.load,
        params: {
          id: match[1],
        },
        path: normalizedPath,
      }
    }
  }

  return {
    load: routes[0].load,
    params: {},
    path: '/',
  }
}

const isSameOriginUrl = (href) => {
  try {
    return new URL(href, window.location.href).origin === window.location.origin
  } catch {
    return false
  }
}

export function createAppRouter({ headerMount, outlet, footerMount }) {
  const render = async () => {
    const { load, params, path } = findRoute(window.location.pathname)
    const pageModule = await load()

    headerMount.innerHTML = renderHeader(path)
    outlet.innerHTML = pageModule.renderPage(params)
    footerMount.innerHTML = renderFooter()
    document.title = pageModule.pageTitle?.(params) ?? 'Caesar Game'

    pageModule.setupPage?.(outlet, params)
  }

  const navigate = async (to, replace = false) => {
    const url = to.startsWith('/') ? to : `/${to}`

    if (replace) {
      history.replaceState({}, '', url)
    } else {
      history.pushState({}, '', url)
    }

    await render()
  }

  document.addEventListener('click', (event) => {
    const link = event.target.closest('a[data-link]')

    if (!link || !isSameOriginUrl(link.href)) {
      return
    }

    event.preventDefault()

    const target = new URL(link.href)
    void navigate(`${target.pathname}${target.search}${target.hash}`)
  })

  window.addEventListener('popstate', () => {
    void render()
  })

  void render()

  return {
    navigate,
  }
}