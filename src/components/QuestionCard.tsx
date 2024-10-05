"use client";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  InfinitiveQuestion,
  InfinitiveQuestionData,
  ConjugateTenseQuestion,
  ConjugateTenseQuestionData,
} from "@/lib/types";
import { useState } from "react";
import { toast } from "sonner";
import { XIcon } from "lucide-react";

export default function QuestionCard({
  question_data,
  onCorrect,
}: {
  question_data: InfinitiveQuestion | ConjugateTenseQuestion;
  onCorrect: () => void;
}) {
  const [responses, setResponses] = useState<
    InfinitiveQuestionData | ConjugateTenseQuestionData
  >(
    "definition" in question_data
      ? {
          infinitive: "",
        }
      : {
          yo_form: "",
          tu_form: "",
          el_form: "",
          nosotros_form: "",
          ellos_form: "",
        }
  );
  const [isError, setIsError] = useState(false);
  const [showAnswers, setShowAnswers] = useState(false);

  return (
    <Card>
      <form
        onSubmit={(e) => {
          e.preventDefault();

          if (
            Object.entries(responses).every(
              (value) =>
                value[1].trim().toLowerCase() ==
                question_data[value[0] as keyof typeof question_data]
                  .trim()
                  .toLowerCase()
            )
          ) {
            setIsError(false);
            onCorrect();
          } else {
            toast("That is not correct");
            setIsError(true);
          }
        }}
      >
        <CardHeader className="flex !flex-row items-center justify-between">
          <CardTitle>
            {"definition" in question_data
              ? `Enter the verb that means "${question_data.definition}"`
              : `Conjugate the verb "${question_data.infinitive}" in the ${question_data.name} tense`}
          </CardTitle>
          {isError && <XIcon color="red" strokeWidth={"4px"} />}
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          {Object.keys(responses).map((key, index) => {
            return (
              <div key={key}>
                <Label className="font-semibold">
                  {key[0].toUpperCase() + key.slice(1).split("_").join(" ")}
                  {showAnswers
                    ? ` (${question_data[key as keyof typeof question_data]})`
                    : ""}
                </Label>
                <Input
                  value={responses[key as keyof typeof responses]}
                  onChange={(e) => {
                    setResponses((old) => ({
                      ...old,
                      [key as keyof typeof responses]: e.target.value,
                    }));
                  }}
                  autoFocus={index == 0}
                />
              </div>
            );
          })}
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
          <div className="flex gap-2">
            <Button>Check</Button>
            <Button
              variant={"secondary"}
              type="button"
              onClick={() => onCorrect()}
            >
              Skip
            </Button>
          </div>
          {isError && (
            <Button
              variant={"link"}
              onClick={() => setShowAnswers((old) => !old)}
            >
              {showAnswers ? "Hide" : "Show"} Answers
            </Button>
          )}
        </CardFooter>
      </form>
    </Card>
  );
}
