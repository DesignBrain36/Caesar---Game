import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error(
    'Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variable.'
  );
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    persistSession: false,
  },
});

function shuffle(values) {
  const result = [...values];

  for (let index = result.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [result[index], result[randomIndex]] = [result[randomIndex], result[index]];
  }

  return result;
}

function buildWrongNumbers(correct) {
  const wrongNumbers = [];
  const deltas = [1, -1, 2, -2, 3, -3, 4, -4, 5, -5, 6, -6];

  for (const delta of deltas) {
    const candidate = correct + delta;

    if (candidate !== correct && !wrongNumbers.includes(candidate)) {
      wrongNumbers.push(candidate);
    }

    if (wrongNumbers.length === 3) {
      break;
    }
  }

  return wrongNumbers;
}

function makeQuestion(value, correct, points) {
  const trueAnswer = String(correct);
  const answers = shuffle([trueAnswer, ...buildWrongNumbers(correct).map(String)]);

  return {
    value,
    true_answer: trueAnswer,
    points,
    answers,
  };
}

function generateLevelOneQuestions() {
  return Array.from({ length: 21 }, (_, index) => {
    const questionNumber = index + 1;

    if (questionNumber % 2 === 1) {
      const left = questionNumber + 1;
      const right = questionNumber + 2;

      return makeQuestion(`What is ${left} + ${right}?`, left + right, 100);
    }

    const minuend = questionNumber + 15;
    const subtrahend = questionNumber + 6;

    return makeQuestion(
      `What is ${minuend} - ${subtrahend}?`,
      minuend - subtrahend,
      100
    );
  });
}

function generateLevelTwoQuestions() {
  return Array.from({ length: 21 }, (_, index) => {
    const questionNumber = index + 1;

    if (questionNumber % 2 === 1) {
      const left = questionNumber + 2;
      const right = (questionNumber % 5) + 3;

      return makeQuestion(`What is ${left} * ${right}?`, left * right, 200);
    }

    const divisor = (questionNumber % 4) + 2;
    const quotient = questionNumber + 4;
    const dividend = divisor * quotient;

    return makeQuestion(`What is ${dividend} / ${divisor}?`, quotient, 200);
  });
}

function generateLevelThreeQuestions() {
  return Array.from({ length: 21 }, (_, index) => {
    const questionNumber = index + 1;

    if (questionNumber % 2 === 1) {
      const left = questionNumber + 3;
      const right = questionNumber + 5;
      const multiplier = (questionNumber % 4) + 2;

      return makeQuestion(
        `What is (${left} + ${right}) * ${multiplier}?`,
        (left + right) * multiplier,
        300
      );
    }

    const left = questionNumber + 4;
    const right = (questionNumber % 6) + 2;
    const subtract = (questionNumber % 5) + 1;

    return makeQuestion(
      `What is ${left} * ${right} - ${subtract}?`,
      left * right - subtract,
      300
    );
  });
}

function generateLevelFourQuestions() {
  return Array.from({ length: 21 }, (_, index) => {
    const questionNumber = index + 1;

    if (questionNumber % 2 === 1) {
      const base = (questionNumber + 5) * 20;
      const percentage = ((questionNumber % 4) + 1) * 5;

      return makeQuestion(
        `What is ${percentage}% of ${base}?`,
        (base * percentage) / 100,
        400
      );
    }

    const number = questionNumber + 5;
    const subtract = (questionNumber % 7) + 2;

    return makeQuestion(
      `What is ${number}^2 - ${subtract}?`,
      number * number - subtract,
      400
    );
  });
}

function generateLevelFiveQuestions() {
  return Array.from({ length: 21 }, (_, index) => {
    const questionNumber = index + 1;

    if (questionNumber % 2 === 1) {
      const x = (questionNumber % 7) + 3;
      const multiplier = (questionNumber % 4) + 3;
      const offset = questionNumber + 5;
      const rightSide = multiplier * x + offset;

      return makeQuestion(
        `Solve for x: ${multiplier}x + ${offset} = ${rightSide}`,
        x,
        500
      );
    }

    const x = (questionNumber % 6) + 4;
    const multiplier = (questionNumber % 5) + 2;
    const offset = (questionNumber % 4) + 1;
    const rightSide = multiplier * x - offset;

    return makeQuestion(
      `Solve for x: ${multiplier}x - ${offset} = ${rightSide}`,
      x,
      500
    );
  });
}

const levelSeeds = [
  {
    rank: 1,
    name: 'Warm Up',
    prize: 'Copper Badge',
    questions: generateLevelOneQuestions(),
  },
  {
    rank: 2,
    name: 'Rising',
    prize: 'Silver Badge',
    questions: generateLevelTwoQuestions(),
  },
  {
    rank: 3,
    name: 'Challenger',
    prize: 'Gold Badge',
    questions: generateLevelThreeQuestions(),
  },
  {
    rank: 4,
    name: 'Expert',
    prize: 'Platinum Badge',
    questions: generateLevelFourQuestions(),
  },
  {
    rank: 5,
    name: 'Master',
    prize: 'Diamond Badge',
    questions: generateLevelFiveQuestions(),
  },
];

async function upsertLevel(levelSeed) {
  const { data, error } = await supabase
    .from('game_levels')
    .upsert(
      {
        rank: levelSeed.rank,
        name: levelSeed.name,
        prize: levelSeed.prize,
      },
      { onConflict: 'rank' }
    )
    .select('id, rank, name');

  if (error) {
    throw new Error(`Failed to upsert level ${levelSeed.rank}: ${error.message}`);
  }

  return data[0];
}

async function fetchQuestionsForLevel(levelId) {
  const { data, error } = await supabase
    .from('questions')
    .select('id, value')
    .eq('level_id', levelId);

  if (error) {
    throw new Error(`Failed to load questions for level ${levelId}: ${error.message}`);
  }

  return data ?? [];
}

async function fetchAnswersForQuestions(questionIds) {
  if (questionIds.length === 0) {
    return [];
  }

  const { data, error } = await supabase
    .from('answers')
    .select('id, question_id, value')
    .in('question_id', questionIds);

  if (error) {
    throw new Error(`Failed to load answers: ${error.message}`);
  }

  return data ?? [];
}

async function seedLevel(levelSeed) {
  const level = await upsertLevel(levelSeed);
  const existingQuestions = await fetchQuestionsForLevel(level.id);
  const existingQuestionByValue = new Map(
    existingQuestions.map((question) => [question.value, question])
  );

  const missingQuestions = levelSeed.questions
    .filter((question) => !existingQuestionByValue.has(question.value))
    .map((question) => ({
      level_id: level.id,
      value: question.value,
      points: question.points,
      true_answer: question.true_answer,
    }));

  if (missingQuestions.length > 0) {
    const { error } = await supabase.from('questions').insert(missingQuestions);

    if (error) {
      throw new Error(`Failed to insert questions for level ${level.rank}: ${error.message}`);
    }
  }

  const allQuestions = await fetchQuestionsForLevel(level.id);
  const questionByValue = new Map(
    allQuestions.map((question) => [question.value, question])
  );
  const questionIds = allQuestions.map((question) => question.id);
  const existingAnswers = await fetchAnswersForQuestions(questionIds);
  const existingAnswersByQuestionId = new Map();

  for (const answer of existingAnswers) {
    if (!existingAnswersByQuestionId.has(answer.question_id)) {
      existingAnswersByQuestionId.set(answer.question_id, new Set());
    }

    existingAnswersByQuestionId.get(answer.question_id).add(answer.value);
  }

  const missingAnswers = [];

  for (const questionSeed of levelSeed.questions) {
    const questionRow = questionByValue.get(questionSeed.value);

    if (!questionRow) {
      throw new Error(`Question was not found after insert: ${questionSeed.value}`);
    }

    const answerSet = existingAnswersByQuestionId.get(questionRow.id) ?? new Set();

    for (const answerValue of questionSeed.answers) {
      if (!answerSet.has(answerValue)) {
        missingAnswers.push({
          question_id: questionRow.id,
          value: answerValue,
        });
      }
    }
  }

  if (missingAnswers.length > 0) {
    const { error } = await supabase.from('answers').insert(missingAnswers);

    if (error) {
      throw new Error(`Failed to insert answers for level ${level.rank}: ${error.message}`);
    }
  }

  return {
    levelId: level.id,
    questionCount: levelSeed.questions.length,
    answerCount: levelSeed.questions.length * 4,
  };
}

async function main() {
  let totalQuestions = 0;
  let totalAnswers = 0;

  for (const levelSeed of levelSeeds) {
    const result = await seedLevel(levelSeed);
    totalQuestions += result.questionCount;
    totalAnswers += result.answerCount;

    console.log(`Seeded level ${levelSeed.rank}: ${levelSeed.name}`);
  }

  console.log(
    `Done. Seeded ${levelSeeds.length} levels, ${totalQuestions} questions, and ${totalAnswers} answers.`
  );
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});