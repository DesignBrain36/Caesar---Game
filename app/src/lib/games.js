import { getCurrentSession, getSupabaseClient, hasAdminRole } from './auth.js'

function toInt(value) {
  const parsed = Number.parseInt(String(value), 10)
  return Number.isNaN(parsed) ? null : parsed
}

function formatDurationValue(startedAt, finishedAt) {
  if (!startedAt) {
    return '0m'
  }

  const endTime = finishedAt ? new Date(finishedAt).getTime() : Date.now()
  const startTime = new Date(startedAt).getTime()
  const totalSeconds = Math.max(0, Math.floor((endTime - startTime) / 1000))
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60

  if (minutes === 0) {
    return `${seconds}s`
  }

  return `${minutes}m ${String(seconds).padStart(2, '0')}s`
}

function buildLevelLookup(levels = []) {
  return new Map(levels.map((level) => [level.id, level]))
}

async function getCurrentUserId() {
  const session = await getCurrentSession()
  return session?.user?.id ?? null
}

async function getCurrentAccessContext() {
  const session = await getCurrentSession()

  return {
    ownerId: session?.user?.id ?? null,
    isAdmin: hasAdminRole(session?.user),
  }
}

export async function fetchUserGames() {
  const supabase = getSupabaseClient()
  const { ownerId, isAdmin } = await getCurrentAccessContext()

  if (!supabase || !ownerId) {
    return {
      error: null,
      games: [],
    }
  }

  let gamesQuery = supabase
    .from('games')
    .select('id, owner, total_points, achieved_level, started_at, finished_at, current_question_id')
    .order('started_at', { ascending: false })

  if (!isAdmin) {
    gamesQuery = gamesQuery.eq('owner', ownerId)
  }

  const { data: games, error: gamesError } = await gamesQuery

  if (gamesError) {
    return {
      error: gamesError,
      games: [],
    }
  }

  const levelIds = [...new Set((games ?? []).map((game) => game.achieved_level).filter(Boolean))]

  const { data: levels, error: levelsError } = levelIds.length
    ? await supabase.from('game_levels').select('id, name, prize, rank').in('id', levelIds)
    : { data: [], error: null }

  if (levelsError) {
    return {
      error: levelsError,
      games: [],
    }
  }

  const levelLookup = buildLevelLookup(levels ?? [])

  return {
    error: null,
    games: (games ?? []).map((game) => {
      const level = game.achieved_level ? levelLookup.get(game.achieved_level) : null

      return {
        ...game,
        achievedLevelLabel: level ? level.name : 'In progress',
        prizeLabel: level ? level.prize : 'Unclaimed',
        durationLabel: game.finished_at ? formatDurationValue(game.started_at, game.finished_at) : 'In progress',
        startedLabel: new Date(game.started_at).toLocaleDateString(undefined, {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        }),
      }
    }),
  }
}

export async function createNewGame() {
  const supabase = getSupabaseClient()
  const ownerId = await getCurrentUserId()

  if (!supabase || !ownerId) {
    return {
      error: {
        message: 'You must be logged in to create a game.',
      },
      game: null,
    }
  }

  const { data: firstLevel, error: levelError } = await supabase
    .from('game_levels')
    .select('id')
    .order('rank', { ascending: true })
    .limit(1)
    .maybeSingle()

  if (levelError) {
    return {
      error: levelError,
      game: null,
    }
  }

  const { data: firstQuestion, error: questionError } = await supabase
    .from('questions')
    .select('id')
    .eq('level_id', firstLevel?.id)
    .order('id', { ascending: true })
    .limit(1)
    .maybeSingle()

  if (questionError) {
    return {
      error: questionError,
      game: null,
    }
  }

  const { data: game, error } = await supabase
    .from('games')
    .insert({
      owner: ownerId,
      total_points: 0,
      achieved_level: null,
      current_question_id: firstQuestion?.id ?? null,
    })
    .select('id')
    .maybeSingle()

  return {
    error,
    game: game ?? null,
  }
}

export async function fetchGameDetails(gameId) {
  const supabase = getSupabaseClient()
  const { ownerId, isAdmin } = await getCurrentAccessContext()
  const gameNumericId = toInt(gameId)

  if (!supabase || !ownerId || !gameNumericId) {
    return {
      error: null,
      game: null,
      question: null,
      answers: [],
      previousQuestionCount: 0,
    }
  }

  let gameQuery = supabase
    .from('games')
    .select('id, owner, total_points, achieved_level, started_at, finished_at, current_question_id')
    .eq('id', gameNumericId)

  if (!isAdmin) {
    gameQuery = gameQuery.eq('owner', ownerId)
  }

  const { data: game, error: gameError } = await gameQuery.maybeSingle()

  if (gameError) {
    return {
      error: gameError,
      game: null,
      question: null,
      answers: [],
      previousQuestionCount: 0,
    }
  }

  if (!game) {
    return {
      error: null,
      game: null,
      question: null,
      answers: [],
      previousQuestionCount: 0,
    }
  }

  const questionId = game.current_question_id
  let question = null

  if (questionId) {
    const { data: questionData, error: questionError } = await supabase
      .from('questions')
      .select('id, value, level_id, points, true_answer')
      .eq('id', questionId)
      .maybeSingle()

    if (questionError) {
      return {
        error: questionError,
        game: null,
        question: null,
        answers: [],
        previousQuestionCount: 0,
      }
    }

    question = questionData
  }

  let answers = []

  if (question) {
    const { data: answerData, error: answersError } = await supabase
      .from('answers')
      .select('id, question_id, value')
      .eq('question_id', question.id)
      .order('id', { ascending: true })

    if (answersError) {
      return {
        error: answersError,
        game: null,
        question: null,
        answers: [],
        previousQuestionCount: 0,
      }
    }

    answers = answerData ?? []
  }

  const { data: previousQuestions, error: previousError } = question
    ? await supabase
        .from('questions')
        .select('id')
        .lt('id', question.id)
    : { data: [], error: null }

  if (previousError) {
    return {
      error: previousError,
      game: null,
      question: null,
      answers: [],
      previousQuestionCount: 0,
    }
  }

  const { data: currentLevel, error: levelError } = game.achieved_level
    ? await supabase
        .from('game_levels')
        .select('id, name, prize, rank')
        .eq('id', game.achieved_level)
        .maybeSingle()
    : { data: null, error: null }

  if (levelError) {
    return {
      error: levelError,
      game: null,
      question: null,
      answers: [],
      previousQuestionCount: 0,
    }
  }

  return {
    error: null,
    game: {
      ...game,
      durationLabel: game.finished_at ? formatDurationValue(game.started_at, game.finished_at) : 'In progress',
      startedLabel: new Date(game.started_at).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      }),
      currentLevel,
    },
    question,
    answers,
    previousQuestionCount: previousQuestions?.length ?? 0,
  }
}

export async function submitGameAnswer({ gameId, answerId }) {
  const supabase = getSupabaseClient()
  const { ownerId, isAdmin } = await getCurrentAccessContext()
  const gameNumericId = toInt(gameId)
  const answerNumericId = toInt(answerId)

  if (!supabase || !ownerId || !gameNumericId || !answerNumericId) {
    return {
      error: {
        message: 'Invalid game or answer selection.',
      },
      completed: false,
      correct: false,
    }
  }

  let gameQuery = supabase
    .from('games')
    .select('id, owner, total_points, achieved_level, started_at, finished_at, current_question_id')
    .eq('id', gameNumericId)

  if (!isAdmin) {
    gameQuery = gameQuery.eq('owner', ownerId)
  }

  const { data: game, error: gameError } = await gameQuery.maybeSingle()

  if (gameError || !game || !game.current_question_id) {
    return {
      error: gameError ?? { message: 'Game not found.' },
      completed: false,
      correct: false,
    }
  }

  const { data: question, error: questionError } = await supabase
    .from('questions')
    .select('id, value, level_id, points, true_answer')
    .eq('id', game.current_question_id)
    .maybeSingle()

  if (questionError || !question) {
    return {
      error: questionError ?? { message: 'Question not found.' },
      completed: false,
      correct: false,
    }
  }

  const { data: answer, error: answerError } = await supabase
    .from('answers')
    .select('id, value, question_id')
    .eq('id', answerNumericId)
    .maybeSingle()

  if (answerError || !answer || answer.question_id !== question.id) {
    return {
      error: answerError ?? { message: 'Answer not found.' },
      completed: false,
      correct: false,
    }
  }

  const correct = answer.value === question.true_answer

  const { data: nextQuestion } = await supabase
    .from('questions')
    .select('id')
    .gt('id', question.id)
    .order('id', { ascending: true })
    .limit(1)
    .maybeSingle()

  const payload = {
    total_points: correct ? game.total_points + question.points : game.total_points,
    achieved_level: correct ? question.level_id : game.achieved_level,
    current_question_id: correct && nextQuestion ? nextQuestion.id : null,
    finished_at: correct && nextQuestion ? game.finished_at : new Date().toISOString(),
  }

  let updateQuery = supabase.from('games').update(payload).eq('id', game.id)

  if (!isAdmin) {
    updateQuery = updateQuery.eq('owner', ownerId)
  }

  const { error: updateError } = await updateQuery

  if (updateError) {
    return {
      error: updateError,
      completed: false,
      correct: false,
    }
  }

  const { error: answerLogError } = await supabase.from('user_answers').insert({
    game_id: game.id,
    question_id: question.id,
    answer_id: answer.id,
    level: question.level_id,
    points: correct ? question.points : 0,
    is_true: correct,
  })

  if (answerLogError) {
    return {
      error: answerLogError,
      completed: false,
      correct,
    }
  }

  return {
    error: null,
    completed: !correct || !nextQuestion,
    correct,
    nextQuestionId: nextQuestion?.id ?? null,
  }
}

export async function deleteUserGame(gameId) {
  const supabase = getSupabaseClient()
  const { ownerId, isAdmin } = await getCurrentAccessContext()
  const gameNumericId = toInt(gameId)

  if (!supabase || !ownerId || !gameNumericId) {
    return {
      error: {
        message: 'Invalid game id.',
      },
    }
  }

  let deleteQuery = supabase.from('games').delete().eq('id', gameNumericId)

  if (!isAdmin) {
    deleteQuery = deleteQuery.eq('owner', ownerId)
  }

  const { error } = await deleteQuery

  return { error }
}
