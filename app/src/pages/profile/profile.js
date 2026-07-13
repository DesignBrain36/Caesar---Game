import './profile.css'
import {
  getCurrentUser,
  navigateTo,
  removeAvatarFile,
  updateCurrentUserProfile,
  uploadAvatarFile,
} from '../../lib/auth.js'

const MAX_AVATAR_BYTES = 500 * 1024

export const pageTitle = () => 'Profile | Caesar Game'

function getInitials(nameOrEmail) {
  const value = String(nameOrEmail || 'Player').trim()
  const parts = value.split(/\s+/).filter(Boolean)
  const initials = parts.slice(0, 2).map((part) => part[0]?.toUpperCase() ?? '').join('')

  return initials || 'P'
}

function renderAvatarPreview({ avatarUrl, nickname, email }) {
  if (avatarUrl) {
    return `<img class="profile-avatar__image" src="${avatarUrl}" alt="${nickname || email || 'Profile avatar'}" />`
  }

  return `<span class="profile-avatar__fallback">${getInitials(nickname || email)}</span>`
}

export function renderPage() {
  return `
    <section class="page-panel p-4 p-lg-5 scene-reveal profile-page">
      <div class="d-flex flex-wrap justify-content-between gap-3 align-items-end">
        <div>
          <span class="page-kicker"><i class="bi bi-person-badge-fill" aria-hidden="true"></i>User Profile</span>
          <h1 class="h2 fw-semibold mt-3">Profile Page</h1>
          <p class="mt-2 mb-0 text-body-secondary">Set your nickname and upload a profile avatar up to 500kb.</p>
        </div>

        <div class="d-flex flex-wrap gap-2">
          <a class="btn btn-outline-light" href="/dashboard" data-link>Dashboard</a>
          <a class="btn cta-btn" href="/Games" data-link>Games</a>
        </div>
      </div>

      <div class="row g-4 mt-3">
        <div class="col-lg-4">
          <div class="roman-card profile-preview-card p-4 h-100 text-center">
            <div class="profile-avatar" id="profileAvatarPreview">
              <span class="profile-avatar__fallback">P</span>
            </div>
            <h2 class="h4 fw-semibold mt-3 mb-1" id="profilePreviewName">Player</h2>
            <p class="mb-0 text-body-secondary" id="profilePreviewEmail">loading@email.com</p>
            <p class="profile-note mt-3 mb-0 text-body-secondary">
              <i class="bi bi-shield-check me-2" aria-hidden="true"></i>Your profile is stored in Supabase Auth metadata.
            </p>
          </div>
        </div>

        <div class="col-lg-8">
          <form class="roman-card profile-form p-4 p-lg-5" id="profileForm">
            <div class="auth-status mb-3" id="profileStatus" role="status" aria-live="polite"></div>

            <div class="mb-3">
              <label class="form-label" for="profileNickname">Nickname</label>
              <input id="profileNickname" class="form-control form-control-lg" name="nickname" type="text" maxlength="32" placeholder="Imperator Mathicus" />
            </div>

            <div class="mb-3">
              <label class="form-label" for="profileAvatar">Avatar</label>
              <input id="profileAvatar" class="form-control form-control-lg" name="avatar" type="file" accept="image/png,image/jpeg,image/webp,image/gif" />
              <div class="form-text text-body-secondary mt-2">Maximum file size: 500kb. Preferred: square image for best results.</div>
            </div>

            <div class="profile-upload-info mb-3" id="profileUploadInfo">No new avatar selected.</div>

            <div class="d-flex flex-wrap gap-2">
              <button class="btn cta-btn btn-lg" type="submit" id="profileSubmitButton">Save Profile</button>
              <a class="btn btn-outline-light btn-lg" href="/Games" data-link>Back to games</a>
            </div>
          </form>
        </div>
      </div>
    </section>
  `
}

export function setupPage(outlet) {
  const form = outlet.querySelector('#profileForm')
  const status = outlet.querySelector('#profileStatus')
  const nicknameInput = outlet.querySelector('#profileNickname')
  const avatarInput = outlet.querySelector('#profileAvatar')
  const uploadInfo = outlet.querySelector('#profileUploadInfo')
  const submitButton = outlet.querySelector('#profileSubmitButton')
  const avatarPreview = outlet.querySelector('#profileAvatarPreview')
  const previewName = outlet.querySelector('#profilePreviewName')
  const previewEmail = outlet.querySelector('#profilePreviewEmail')

  if (!form || !status || !nicknameInput || !avatarInput || !uploadInfo || !submitButton || !avatarPreview || !previewName || !previewEmail) {
    return
  }

  let currentUser = null
  let selectedFile = null
  let selectedPreviewUrl = ''

  const setStatus = (message, level = 'neutral') => {
    status.textContent = message
    status.classList.remove('is-neutral', 'is-error', 'is-success')
    status.classList.add(`is-${level}`)
  }

  const renderPreview = (avatarUrl, nickname, email) => {
    avatarPreview.innerHTML = renderAvatarPreview({ avatarUrl, nickname, email })
    previewName.textContent = nickname || 'Player'
    previewEmail.textContent = email || 'No email available'
  }

  const loadUser = async () => {
    currentUser = await getCurrentUser()

    if (!currentUser) {
      setStatus('You need to log in to edit your profile.', 'error')
      submitButton.disabled = true
      return
    }

    const nickname = currentUser.user_metadata?.nickname || ''
    const avatarUrl = currentUser.user_metadata?.avatar_url || ''

    nicknameInput.value = nickname
    renderPreview(avatarUrl, nickname || currentUser.email, currentUser.email)
    setStatus('Update your profile and save the changes.', 'neutral')
  }

  avatarInput.addEventListener('change', () => {
    const file = avatarInput.files?.[0] ?? null
    selectedFile = null

    if (selectedPreviewUrl) {
      URL.revokeObjectURL(selectedPreviewUrl)
      selectedPreviewUrl = ''
    }

    if (!file) {
      uploadInfo.textContent = 'No new avatar selected.'
      const avatarUrl = currentUser?.user_metadata?.avatar_url || ''
      renderPreview(avatarUrl, nicknameInput.value || currentUser?.email || 'Player', currentUser?.email || '')
      return
    }

    if (file.size > MAX_AVATAR_BYTES) {
      avatarInput.value = ''
      uploadInfo.textContent = 'Avatar must be 500kb or less.'
      setStatus('The selected avatar exceeds the 500kb limit.', 'error')
      return
    }

    selectedFile = file
    selectedPreviewUrl = URL.createObjectURL(file)
    uploadInfo.textContent = `${file.name} selected (${Math.ceil(file.size / 1024)}kb)`
    renderPreview(selectedPreviewUrl, nicknameInput.value || currentUser?.email || 'Player', currentUser?.email || '')
  })

  nicknameInput.addEventListener('input', () => {
    const currentAvatar = selectedPreviewUrl || currentUser?.user_metadata?.avatar_url || ''
    renderPreview(currentAvatar, nicknameInput.value || currentUser?.email || 'Player', currentUser?.email || '')
  })

  form.addEventListener('submit', async (event) => {
    event.preventDefault()

    if (!currentUser) {
      setStatus('You need to log in to edit your profile.', 'error')
      return
    }

    const nickname = nicknameInput.value.trim().slice(0, 32)
    const currentAvatarPath = currentUser.user_metadata?.avatar_path || ''
    const currentAvatarUrl = currentUser.user_metadata?.avatar_url || ''

    submitButton.disabled = true
    setStatus('Saving profile...', 'neutral')

    let nextAvatarUrl = currentAvatarUrl
    let nextAvatarPath = currentAvatarPath

    if (selectedFile) {
      const uploadResult = await uploadAvatarFile(selectedFile, currentUser.id)

      if (uploadResult.error) {
        submitButton.disabled = false
        setStatus(uploadResult.error.message || 'Unable to upload avatar.', 'error')
        return
      }

      nextAvatarUrl = uploadResult.publicUrl || currentAvatarUrl
      nextAvatarPath = uploadResult.path || currentAvatarPath

      if (currentAvatarPath && currentAvatarPath !== nextAvatarPath) {
        await removeAvatarFile(currentAvatarPath)
      }
    }

    const { error } = await updateCurrentUserProfile({
      nickname,
      avatarUrl: nextAvatarUrl,
      avatarPath: nextAvatarPath,
    })

    submitButton.disabled = false

    if (error) {
      setStatus(error.message || 'Unable to save profile.', 'error')
      return
    }

    currentUser = {
      ...currentUser,
      user_metadata: {
        ...(currentUser.user_metadata || {}),
        nickname,
        avatar_url: nextAvatarUrl,
        avatar_path: nextAvatarPath,
      },
    }

    selectedFile = null
    if (selectedPreviewUrl && selectedPreviewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(selectedPreviewUrl)
    }
    selectedPreviewUrl = ''

    avatarInput.value = ''
    uploadInfo.textContent = 'No new avatar selected.'
    renderPreview(nextAvatarUrl, nickname || currentUser.email, currentUser.email)
    setStatus('Profile saved successfully.', 'success')
  })

  void loadUser()
}
