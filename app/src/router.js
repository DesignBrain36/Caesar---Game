import { renderFooter } from './components/footer/footer.js'
import { renderHeader } from './components/header/header.js'
import { getCurrentSession, hasAdminRole, logoutUser } from './lib/auth.js'

const routes = [
  {
    pattern: /^\/$/,
    load: () => import('./pages/home/home.js'),
    requiresAuth: false,
  },
  {
    pattern: /^\/Games\/?$/,
    load: () => import('./pages/games/games.js'),
    requiresAuth: true,
  },
  {
    pattern: /^\/games\/?$/,
    load: () => import('./pages/games/games.js'),
    requiresAuth: true,
  },
  {
    pattern: /^\/login\/?$/,
    load: () => import('./pages/login/login.js'),
    requiresAuth: false,
  },
  {
    pattern: /^\/dashboard\/?$/,
    load: () => import('./pages/dashboard/dashboard.js'),
    requiresAuth: true,
  },
  {
    pattern: /^\/profile\/?$/,
    load: () => import('./pages/profile/profile.js'),
    requiresAuth: true,
  },
  {
    pattern: /^\/admin\/?$/,
    load: () => import('./pages/admin/admin.js'),
    requiresAuth: true,
    requiresAdmin: true,
  },
  {
    pattern: /^\/game\/start\/?$/,
    load: () => import('./pages/game-start/game-start.js'),
    requiresAuth: true,
  },
  {
    pattern: /^\/game\/([^/]+)\/play\/?$/,
    load: () => import('./pages/game-play/game-play.js'),
    requiresAuth: true,
  },
  {
    pattern: /^\/game\/([^/]+)\/view\/?$/,
    load: () => import('./pages/game-view/game-view.js'),
    requiresAuth: true,
  },
  {
    pattern: /^\/games\/([^/]+)\/?$/,
    load: () => import('./pages/game-view/game-view.js'),
    requiresAuth: true,
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
        requiresAuth: route.requiresAuth,
        requiresAdmin: route.requiresAdmin ?? false,
        params: {
          id: match[1],
        },
        path: normalizedPath,
      }
    }
  }

  return {
    load: routes[0].load,
    requiresAuth: false,
    requiresAdmin: false,
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
    const route = findRoute(window.location.pathname)
    const session = await getCurrentSession()
    const isAdmin = hasAdminRole(session?.user)

    if (route.requiresAuth && !session) {
      history.replaceState({}, '', '/login')
      return render()
    }

    if (route.requiresAdmin && !isAdmin) {
      history.replaceState({}, '', session ? '/dashboard' : '/login')
      return render()
    }

    if (route.path === '/login' && session) {
      history.replaceState({}, '', '/dashboard')
      return render()
    }

    const { load, params, path } = route
    const pageModule = await load()

    headerMount.innerHTML = renderHeader(path, session)
    outlet.innerHTML = pageModule.renderPage(params)
    footerMount.innerHTML = renderFooter()
    document.title = pageModule.pageTitle?.(params) ?? 'Caesar Game'

    pageModule.setupPage?.(outlet, params, { session })
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
    const logoutButton = event.target.closest('[data-action="logout"]')

    if (logoutButton) {
      event.preventDefault()
      void logoutUser().then(() => navigate('/', true))
      return
    }

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