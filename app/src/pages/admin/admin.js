import './admin.css'
import { navigateTo, getCurrentSession, hasAdminRole, removeAvatarFile } from '../../lib/auth.js'
import {
  deleteAdminTableRecord,
  deleteAdminUser,
  fetchAdminTable,
  fetchAdminUsers,
  saveAdminTableRecord,
  saveAdminUser,
} from '../../lib/admin.js'

export const pageTitle = () => 'Admin | Caesar Game'

const TAB_KEYS = ['games', 'users', 'questions', 'answers', 'levels']

const ENTITY_CONFIGS = {
  games: {
    title: 'Games',
    subtitle: 'Create, reassign, inspect, or remove any game.',
    table: 'games',
    orderBy: 'started_at',
    columns: ['ID', 'Owner', 'Points', 'Level', 'Started', 'Finished', 'Current Question', 'Actions'],
    canCreate: true,
    fields: [
      { name: 'owner', label: 'Owner', type: 'select', required: true },
      { name: 'total_points', label: 'Total Points', type: 'number', required: true, min: '0' },
      { name: 'achieved_level', label: 'Achieved Level', type: 'select', required: false },
      { name: 'started_at', label: 'Started At', type: 'datetime-local', required: false },
      { name: 'finished_at', label: 'Finished At', type: 'datetime-local', required: false },
      { name: 'current_question_id', label: 'Current Question', type: 'select', required: false },
    ],
    buildPayload: (formData) => ({
      owner: String(formData.get('owner') ?? '').trim(),
      total_points: Number.parseInt(String(formData.get('total_points') ?? '0'), 10) || 0,
      achieved_level: toNullableNumber(formData.get('achieved_level')),
      ...(String(formData.get('started_at') ?? '').trim() ? { started_at: toNullableDateTime(formData.get('started_at')) } : {}),
      finished_at: toNullableDateTime(formData.get('finished_at')),
      current_question_id: toNullableNumber(formData.get('current_question_id')),
    }),
    renderRow: (record, state) => `
      <tr>
        <td>${record.id}</td>
        <td>${resolveUserLabel(state.usersById, record.owner)}</td>
        <td>${record.total_points}</td>
        <td>${resolveLevelLabel(state.levelsById, record.achieved_level)}</td>
        <td>${formatDisplayDate(record.started_at)}</td>
        <td>${formatDisplayDate(record.finished_at) || 'Active'}</td>
        <td>${resolveQuestionLabel(state.questionsById, record.current_question_id)}</td>
        <td>
          <div class="d-flex flex-wrap gap-2">
            <button class="btn btn-sm btn-outline-light" type="button" data-admin-edit="games" data-record-id="${record.id}">Edit</button>
            <button class="btn btn-sm games-delete-btn" type="button" data-admin-delete="games" data-record-id="${record.id}">Delete</button>
          </div>
        </td>
      </tr>
    `,
  },
  users: {
    title: 'Users',
    subtitle: 'Edit profile metadata or promote and remove accounts.',
    columns: ['ID', 'Email', 'Role', 'Nickname', 'Avatar', 'Created', 'Last Sign In', 'Actions'],
    canCreate: false,
    fields: [
      { name: 'nickname', label: 'Nickname', type: 'text', required: false, maxLength: '32' },
      { name: 'avatar_url', label: 'Avatar URL', type: 'text', required: false },
      { name: 'avatar_path', label: 'Avatar Path', type: 'text', required: false },
      { name: 'role', label: 'Role', type: 'select', required: false },
    ],
    buildPayload: (formData) => ({
      nickname: String(formData.get('nickname') ?? '').trim().slice(0, 32),
      avatarUrl: String(formData.get('avatar_url') ?? '').trim(),
      avatarPath: String(formData.get('avatar_path') ?? '').trim(),
      role: String(formData.get('role') ?? '').trim(),
    }),
    renderRow: (record) => `
      <tr>
        <td>${record.id}</td>
        <td>${record.email || 'No email'}</td>
        <td>${record.role === 'admin' ? 'Admin' : 'User'}</td>
        <td>${record.nickname || '—'}</td>
        <td>${record.avatar_url ? `<a href="${record.avatar_url}" target="_blank" rel="noreferrer">Open</a>` : '—'}</td>
        <td>${formatDisplayDate(record.created_at)}</td>
        <td>${formatDisplayDate(record.last_sign_in_at)}</td>
        <td>
          <div class="d-flex flex-wrap gap-2">
            <button class="btn btn-sm btn-outline-light" type="button" data-admin-edit="users" data-record-id="${record.id}">Edit</button>
            <button class="btn btn-sm games-delete-btn" type="button" data-admin-delete="users" data-record-id="${record.id}" data-avatar-path="${escapeHtml(record.avatar_path || '')}">Delete</button>
          </div>
        </td>
      </tr>
    `,
  },
  questions: {
    title: 'Questions',
    subtitle: 'Manage the text, level, points, and answer key for every question.',
    table: 'questions',
    orderBy: 'id',
    columns: ['ID', 'Question', 'Level', 'Points', 'True Answer', 'Actions'],
    canCreate: true,
    fields: [
      { name: 'value', label: 'Question', type: 'textarea', required: true, rows: '4' },
      { name: 'level_id', label: 'Level', type: 'select', required: true },
      { name: 'points', label: 'Points', type: 'number', required: true, min: '1' },
      { name: 'true_answer', label: 'True Answer', type: 'text', required: true },
    ],
    buildPayload: (formData) => ({
      value: String(formData.get('value') ?? '').trim(),
      level_id: toNullableNumber(formData.get('level_id')),
      points: Number.parseInt(String(formData.get('points') ?? '0'), 10) || 0,
      true_answer: String(formData.get('true_answer') ?? '').trim(),
    }),
    renderRow: (record, state) => `
      <tr>
        <td>${record.id}</td>
        <td>${record.value}</td>
        <td>${resolveLevelLabel(state.levelsById, record.level_id)}</td>
        <td>${record.points}</td>
        <td>${record.true_answer}</td>
        <td>
          <div class="d-flex flex-wrap gap-2">
            <button class="btn btn-sm btn-outline-light" type="button" data-admin-edit="questions" data-record-id="${record.id}">Edit</button>
            <button class="btn btn-sm games-delete-btn" type="button" data-admin-delete="questions" data-record-id="${record.id}">Delete</button>
          </div>
        </td>
      </tr>
    `,
  },
  answers: {
    title: 'Answers',
    subtitle: 'Manage answer choices tied to each question.',
    table: 'answers',
    orderBy: 'id',
    columns: ['ID', 'Question', 'Answer', 'Actions'],
    canCreate: true,
    fields: [
      { name: 'question_id', label: 'Question', type: 'select', required: true },
      { name: 'value', label: 'Answer', type: 'text', required: true },
    ],
    buildPayload: (formData) => ({
      question_id: toNullableNumber(formData.get('question_id')),
      value: String(formData.get('value') ?? '').trim(),
    }),
    renderRow: (record, state) => `
      <tr>
        <td>${record.id}</td>
        <td>${resolveQuestionLabel(state.questionsById, record.question_id)}</td>
        <td>${record.value}</td>
        <td>
          <div class="d-flex flex-wrap gap-2">
            <button class="btn btn-sm btn-outline-light" type="button" data-admin-edit="answers" data-record-id="${record.id}">Edit</button>
            <button class="btn btn-sm games-delete-btn" type="button" data-admin-delete="answers" data-record-id="${record.id}">Delete</button>
          </div>
        </td>
      </tr>
    `,
  },
  levels: {
    title: 'Levels',
    subtitle: 'Edit the progression ladder and prize names.',
    table: 'game_levels',
    orderBy: 'rank',
    columns: ['ID', 'Rank', 'Name', 'Prize', 'Actions'],
    canCreate: true,
    fields: [
      { name: 'rank', label: 'Rank', type: 'number', required: true, min: '1' },
      { name: 'name', label: 'Name', type: 'text', required: true },
      { name: 'prize', label: 'Prize', type: 'text', required: true },
    ],
    buildPayload: (formData) => ({
      rank: Number.parseInt(String(formData.get('rank') ?? '0'), 10) || 0,
      name: String(formData.get('name') ?? '').trim(),
      prize: String(formData.get('prize') ?? '').trim(),
    }),
    renderRow: (record) => `
      <tr>
        <td>${record.id}</td>
        <td>${record.rank}</td>
        <td>${record.name}</td>
        <td>${record.prize}</td>
        <td>
          <div class="d-flex flex-wrap gap-2">
            <button class="btn btn-sm btn-outline-light" type="button" data-admin-edit="levels" data-record-id="${record.id}">Edit</button>
            <button class="btn btn-sm games-delete-btn" type="button" data-admin-delete="levels" data-record-id="${record.id}">Delete</button>
          </div>
        </td>
      </tr>
    `,
  },
}

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

function toNullableNumber(value) {
  const trimmed = String(value ?? '').trim()

  if (!trimmed) {
    return null
  }

  const parsed = Number.parseInt(trimmed, 10)
  return Number.isNaN(parsed) ? null : parsed
}

function toNullableDateTime(value) {
  const trimmed = String(value ?? '').trim()

  if (!trimmed) {
    return null
  }

  return new Date(trimmed).toISOString()
}

function formatDisplayDate(value) {
  if (!value) {
    return '—'
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return '—'
  }

  return date.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatInputDateTime(value) {
  if (!value) {
    return ''
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return ''
  }

  return date.toISOString().slice(0, 16)
}

function resolveUserLabel(usersById, userId) {
  return usersById.get(userId)?.email || userId || '—'
}

function resolveLevelLabel(levelsById, levelId) {
  return levelsById.get(levelId)?.name || levelId || '—'
}

function resolveQuestionLabel(questionsById, questionId) {
  return questionsById.get(questionId)?.value || questionId || '—'
}

function renderField(field, record, state) {
  const value = record?.[field.name] ?? ''
  const fieldId = `admin-${field.name}`

  if (field.type === 'select') {
    const options = field.name === 'role'
      ? [
          { value: '', label: 'User' },
          { value: 'admin', label: 'Admin' },
        ]
      : field.name === 'owner'
        ? state.users.map((user) => ({ value: user.id, label: `${user.email || user.id}${user.role === 'admin' ? ' (admin)' : ''}` }))
        : field.name === 'level_id'
          ? state.levels.map((level) => ({ value: String(level.id), label: `${level.rank} - ${level.name}` }))
          : field.name === 'question_id'
            ? state.questions.map((question) => ({ value: String(question.id), label: `${question.id}: ${question.value}` }))
            : []

    return `
      <div class="mb-3">
        <label class="form-label" for="${fieldId}">${field.label}</label>
        <select class="form-select" id="${fieldId}" name="${field.name}" ${field.required ? 'required' : ''}>
          <option value="">${field.name === 'role' ? 'User' : 'Select...'}</option>
          ${options
            .map(
              (option) => `
                <option value="${escapeHtml(option.value)}" ${String(option.value) === String(value ?? '') ? 'selected' : ''}>${escapeHtml(option.label)}</option>
              `,
            )
            .join('')}
        </select>
      </div>
    `
  }

  if (field.type === 'textarea') {
    return `
      <div class="mb-3">
        <label class="form-label" for="${fieldId}">${field.label}</label>
        <textarea class="form-control" id="${fieldId}" name="${field.name}" rows="${field.rows || '4'}" ${field.required ? 'required' : ''}>${escapeHtml(value)}</textarea>
      </div>
    `
  }

  return `
    <div class="mb-3">
      <label class="form-label" for="${fieldId}">${field.label}</label>
      <input
        class="form-control"
        id="${fieldId}"
        name="${field.name}"
        type="${field.type}"
        value="${field.type === 'datetime-local' ? formatInputDateTime(value) : escapeHtml(value)}"
        ${field.required ? 'required' : ''}
        ${field.min ? `min="${field.min}"` : ''}
        ${field.maxLength ? `maxlength="${field.maxLength}"` : ''}
      />
    </div>
  `
}

function renderEditor(entityKey, state) {
  const config = ENTITY_CONFIGS[entityKey]
  const currentRecord = state.currentRecords[entityKey]
  const singularTitle = config.title.slice(0, -1)
  const formTitle = config.canCreate
    ? (currentRecord ? `Edit ${singularTitle}` : `Add ${singularTitle}`)
    : (currentRecord ? `Edit ${singularTitle}` : `Select a ${singularTitle.toLowerCase()} to edit`)
  const submitLabel = config.canCreate
    ? (currentRecord ? 'Save changes' : `Create ${singularTitle}`)
    : 'Update user'

  return `
    <div class="admin-editor p-4 mb-4">
      <div class="d-flex flex-wrap justify-content-between gap-3 align-items-center mb-3">
        <div>
          <h2 class="h5 fw-semibold mb-1">${formTitle}</h2>
          <p class="mb-0 text-body-secondary">${config.subtitle}</p>
        </div>

        ${config.canCreate ? '<button class="btn btn-outline-light btn-sm" type="button" data-admin-reset="true">New record</button>' : ''}
      </div>

      <form data-admin-form="${entityKey}">
        <input type="hidden" name="recordId" value="${currentRecord?.id ?? ''}" />
        ${config.fields.map((field) => renderField(field, currentRecord, state)).join('')}

        <div class="d-flex flex-wrap gap-2">
          <button class="btn cta-btn" type="submit">${submitLabel}</button>
          ${currentRecord ? '<button class="btn btn-outline-light" type="button" data-admin-cancel="true">Cancel edit</button>' : ''}
        </div>
      </form>

      <div class="admin-status mt-3" role="status" aria-live="polite" data-admin-status="${entityKey}"></div>
    </div>
  `
}

function renderTable(entityKey, state) {
  const config = ENTITY_CONFIGS[entityKey]
  const records = state.records[entityKey]

  if (!records.length) {
    return `
      <div class="admin-table-wrap p-5 text-center text-body-secondary">
        No ${config.title.toLowerCase()} found.
      </div>
    `
  }

  return `
    <div class="table-responsive admin-table-wrap">
      <table class="table align-middle admin-table">
        <thead>
          <tr>${config.columns.map((column) => `<th scope="col">${column}</th>`).join('')}</tr>
        </thead>
        <tbody>
          ${records.map((record) => config.renderRow(record, state)).join('')}
        </tbody>
      </table>
    </div>
  `
}

function renderPane(entityKey, state) {
  const config = ENTITY_CONFIGS[entityKey]

  return `
    <div class="admin-pane ${entityKey === 'games' ? 'active' : ''}" data-admin-pane="${entityKey}">
      <div class="d-flex flex-wrap justify-content-between gap-3 align-items-end mb-3">
        <div>
          <span class="page-kicker"><i class="bi bi-sliders" aria-hidden="true"></i>${config.title}</span>
          <h2 class="h4 fw-semibold mt-3 mb-0">${config.title} Management</h2>
        </div>

        ${config.canCreate ? '<button class="btn btn-outline-light btn-sm" type="button" data-admin-reset="true">Add record</button>' : ''}
      </div>

      ${renderEditor(entityKey, state)}
      ${renderTable(entityKey, state)}
    </div>
  `
}

export function renderPage() {
  return `
    <section class="page-panel p-4 p-lg-5 scene-reveal admin-page">
      <div class="d-flex flex-wrap justify-content-between gap-3 align-items-end">
        <div>
          <span class="page-kicker"><i class="bi bi-shield-lock-fill" aria-hidden="true"></i>Administrator Console</span>
          <h1 class="h2 fw-semibold mt-3">Admin</h1>
          <p class="mt-2 mb-0 text-body-secondary">
            Manage games, users, questions, answers, and levels from a single protected console.
          </p>
        </div>

        <div class="d-flex flex-wrap gap-2">
          <a class="btn btn-outline-light" href="/dashboard" data-link>Dashboard</a>
          <a class="btn cta-btn" href="/Games" data-link>Games</a>
        </div>
      </div>

      <ul class="nav nav-tabs mt-4" id="adminTabs" role="tablist">
        ${TAB_KEYS.map(
          (key, index) => `
            <li class="nav-item" role="presentation">
              <button
                class="nav-link ${index === 0 ? 'active' : ''}"
                type="button"
                role="tab"
                aria-selected="${index === 0 ? 'true' : 'false'}"
                data-admin-tab="${key}"
              >
                ${key.toUpperCase()}
              </button>
            </li>
          `,
        ).join('')}
      </ul>

      <div class="mt-4" id="adminContent">
        <div class="admin-status mb-3" id="adminPageStatus" role="status" aria-live="polite"></div>
        ${TAB_KEYS.map((key) => renderPane(key, createEmptyState())).join('')}
      </div>
    </section>
  `
}

function createEmptyState() {
  return {
    records: {
      games: [],
      users: [],
      questions: [],
      answers: [],
      levels: [],
    },
    currentRecords: {
      games: null,
      users: null,
      questions: null,
      answers: null,
      levels: null,
    },
    users: [],
    levels: [],
    questions: [],
    usersById: new Map(),
    levelsById: new Map(),
    questionsById: new Map(),
  }
}

function applyStateLookups(state) {
  state.usersById = new Map(state.users.map((user) => [user.id, user]))
  state.levelsById = new Map(state.levels.map((level) => [level.id, level]))
  state.questionsById = new Map(state.questions.map((question) => [question.id, question]))
}

async function loadAdminData() {
  const [gamesResult, usersResult, questionsResult, answersResult, levelsResult] = await Promise.all([
    fetchAdminTable('games', 'id, owner, total_points, achieved_level, started_at, finished_at, current_question_id', 'started_at', false),
    fetchAdminUsers(),
    fetchAdminTable('questions', 'id, value, level_id, points, true_answer', 'id', true),
    fetchAdminTable('answers', 'id, question_id, value', 'id', true),
    fetchAdminTable('game_levels', 'id, rank, name, prize', 'rank', true),
  ])

  return {
    gamesResult,
    usersResult,
    questionsResult,
    answersResult,
    levelsResult,
  }
}

function setStatus(statusElement, message, level = 'neutral') {
  statusElement.textContent = message
  statusElement.classList.remove('is-neutral', 'is-error', 'is-success')
  statusElement.classList.add(`is-${level}`)
}

function getPaneElements(outlet, entityKey) {
  return {
    pane: outlet.querySelector(`[data-admin-pane="${entityKey}"]`),
    status: outlet.querySelector(`[data-admin-status="${entityKey}"]`),
    form: outlet.querySelector(`[data-admin-form="${entityKey}"]`),
  }
}

function fillForm(form, record) {
  if (!form) {
    return
  }

  const recordIdInput = form.querySelector('[name="recordId"]')
  if (recordIdInput) {
    recordIdInput.value = record?.id ?? ''
  }

  for (const element of Array.from(form.elements)) {
    if (!element.name || element.name === 'recordId') {
      continue
    }

    if (element.type === 'datetime-local') {
      element.value = formatInputDateTime(record?.[element.name])
      continue
    }

    element.value = record?.[element.name] ?? ''
  }
}

function resetForm(form) {
  if (!form) {
    return
  }

  form.reset()
  const recordIdInput = form.querySelector('[name="recordId"]')
  if (recordIdInput) {
    recordIdInput.value = ''
  }
}

export function setupPage(outlet) {
  const pageStatus = outlet.querySelector('#adminPageStatus')
  const tabButtons = outlet.querySelectorAll('[data-admin-tab]')

  if (!pageStatus || tabButtons.length === 0) {
    return
  }

  let state = createEmptyState()

  const renderActivePane = (entityKey) => {
    const currentRecord = state.currentRecords[entityKey]
    const pane = outlet.querySelector(`[data-admin-pane="${entityKey}"]`)

    if (!pane) {
      return
    }

    pane.innerHTML = renderPane(entityKey, state)

    const form = pane.querySelector(`[data-admin-form="${entityKey}"]`)
    if (form && currentRecord) {
      fillForm(form, currentRecord)
    }
  }

  const renderAllPanes = () => {
    for (const entityKey of TAB_KEYS) {
      renderActivePane(entityKey)
    }
  }

  const setActiveTab = (entityKey) => {
    tabButtons.forEach((button) => {
      const isActive = button.dataset.adminTab === entityKey
      button.classList.toggle('active', isActive)
      button.setAttribute('aria-selected', String(isActive))
    })

    outlet.querySelectorAll('[data-admin-pane]').forEach((pane) => {
      pane.classList.toggle('active', pane.dataset.adminPane === entityKey)
    })
  }

  const refreshData = async () => {
    setStatus(pageStatus, 'Loading admin data...', 'neutral')

    const results = await loadAdminData()

    const errors = [
      results.gamesResult.error,
      results.usersResult.error,
      results.questionsResult.error,
      results.answersResult.error,
      results.levelsResult.error,
    ].filter(Boolean)

    if (errors.length > 0) {
      setStatus(pageStatus, errors[0].message || 'Unable to load admin data.', 'error')
    } else {
      setStatus(pageStatus, 'Admin data loaded.', 'success')
    }

    state.records.games = results.gamesResult.records
    state.records.users = results.usersResult.records
    state.records.questions = results.questionsResult.records
    state.records.answers = results.answersResult.records
    state.records.levels = results.levelsResult.records

    state.users = state.records.users
    state.questions = state.records.questions
    state.levels = state.records.levels

    applyStateLookups(state)
    renderAllPanes()
  }

  tabButtons.forEach((button) => {
    button.addEventListener('click', () => {
      setActiveTab(button.dataset.adminTab)
    })
  })

  outlet.addEventListener('click', async (event) => {
    const tabTarget = event.target.closest('[data-admin-tab]')
    if (tabTarget) {
      setActiveTab(tabTarget.dataset.adminTab)
      return
    }

    const resetButton = event.target.closest('[data-admin-reset]')
    if (resetButton) {
      const activePane = outlet.querySelector('.admin-pane.active')
      const entityKey = activePane?.dataset.adminPane
      const paneElements = entityKey ? getPaneElements(outlet, entityKey) : null

      if (paneElements?.form) {
        resetForm(paneElements.form)
      }

      if (entityKey) {
        state.currentRecords[entityKey] = null
        renderActivePane(entityKey)
      }
      return
    }

    const cancelButton = event.target.closest('[data-admin-cancel]')
    if (cancelButton) {
      const activePane = outlet.querySelector('.admin-pane.active')
      const entityKey = activePane?.dataset.adminPane

      if (entityKey) {
        state.currentRecords[entityKey] = null
        renderActivePane(entityKey)
      }
      return
    }

    const editButton = event.target.closest('[data-admin-edit]')
    if (editButton) {
      const entityKey = editButton.dataset.adminEdit
      const recordId = Number.parseInt(editButton.dataset.recordId, 10)
      const record = state.records[entityKey].find((item) => item.id === recordId)

      if (!record) {
        return
      }

      state.currentRecords[entityKey] = record
      setActiveTab(entityKey)
      renderActivePane(entityKey)
      return
    }

    const deleteButton = event.target.closest('[data-admin-delete]')
    if (!deleteButton) {
      return
    }

    const entityKey = deleteButton.dataset.adminDelete
    const recordId = Number.parseInt(deleteButton.dataset.recordId, 10)
    const config = ENTITY_CONFIGS[entityKey]
    const paneElements = getPaneElements(outlet, entityKey)

    if (!window.confirm(`Delete this ${config.title.slice(0, -1).toLowerCase()}? This cannot be undone.`)) {
      return
    }

    deleteButton.disabled = true
    setStatus(paneElements.status, 'Deleting record...', 'neutral')

    if (entityKey === 'users') {
      const userRecord = state.records.users.find((item) => item.id === deleteButton.dataset.recordId)

      if (userRecord?.avatar_path) {
        await removeAvatarFile(userRecord.avatar_path)
      }

      const { error } = await deleteAdminUser(deleteButton.dataset.recordId)
      deleteButton.disabled = false

      if (error) {
        setStatus(paneElements.status, error.message || 'Unable to delete user.', 'error')
        return
      }
    } else {
      const { error } = await deleteAdminTableRecord(config.table, recordId)
      deleteButton.disabled = false

      if (error) {
        setStatus(paneElements.status, error.message || `Unable to delete ${config.title.toLowerCase()}.`, 'error')
        return
      }
    }

    setStatus(paneElements.status, 'Record deleted successfully.', 'success')
    state.currentRecords[entityKey] = null
    await refreshData()
  })

  outlet.addEventListener('submit', async (event) => {
    const form = event.target.closest('[data-admin-form]')

    if (!form) {
      return
    }

    event.preventDefault()

    const entityKey = form.dataset.adminForm
    const config = ENTITY_CONFIGS[entityKey]
    const paneElements = getPaneElements(outlet, entityKey)
    const formData = new FormData(form)
    const recordId = String(formData.get('recordId') ?? '').trim()

    setStatus(paneElements.status, 'Saving record...', 'neutral')

    if (entityKey === 'users') {
      const currentUser = state.records.users.find((item) => String(item.id) === recordId)

      if (!currentUser) {
        setStatus(paneElements.status, 'Select a user to update.', 'error')
        return
      }

      const payload = config.buildPayload(formData)
      const { error } = await saveAdminUser(recordId, payload)

      if (error) {
        setStatus(paneElements.status, error.message || 'Unable to update user.', 'error')
        return
      }

      setStatus(paneElements.status, 'User updated successfully.', 'success')
      state.currentRecords[entityKey] = null
      await refreshData()
      return
    }

    const payload = config.buildPayload(formData)
    const { error } = await saveAdminTableRecord(config.table, recordId || null, payload)

    if (error) {
      setStatus(paneElements.status, error.message || `Unable to save ${config.title.toLowerCase()}.`, 'error')
      return
    }

    setStatus(paneElements.status, 'Record saved successfully.', 'success')
    state.currentRecords[entityKey] = null
    await refreshData()
  })

  void getCurrentSession().then((session) => {
    if (!hasAdminRole(session?.user)) {
      setStatus(pageStatus, 'You do not have admin access.', 'error')
      navigateTo('/dashboard', true)
      return
    }

    void refreshData()
  })
}