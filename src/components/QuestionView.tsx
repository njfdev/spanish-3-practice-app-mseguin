"use client";

import QuestionCard from "@/components/QuestionCard";
import {
  ConjugateTenseQuestion,
  InfinitiveQuestion,
  SpanishWordInfo,
} from "@/lib/types";
import { useState } from "react";

function getRandomQuestion(
  data: SpanishWordInfo[]
): InfinitiveQuestion | ConjugateTenseQuestion {
  const randomVerb = data[Math.floor(Math.random() * data.length)];

  const random = Math.random();

  if (random >= 0.9) {
    return {
      definition: randomVerb.definition,
      infinitive: randomVerb.infinitive,
    };
  }

  const randomTense =
    randomVerb.tenses[Math.floor(Math.random() * randomVerb.tenses.length)];

  return {
    ...randomTense,
    infinitive: randomVerb.infinitive,
  };
}

export default function QuestionView({
  spanishData,
}: {
  spanishData: SpanishWordInfo[];
}) {
  const [questionData, setQuestionData] = useState(
    getRandomQuestion(spanishData)
  );
  const [key, setKey] = useState(0);

  return (
    <QuestionCard
      question_data={questionData}
      onCorrect={() => {
        setQuestionData(getRandomQuestion(spanishData));
        setKey((old) => old + 1);
      }}
      key={key}
    />
  );
}
