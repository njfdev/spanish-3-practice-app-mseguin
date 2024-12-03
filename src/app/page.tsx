import { AllDataView } from "@/components/AllDataView";
import { ModeToggle } from "@/components/ModeToggle";
import QuestionView from "@/components/QuestionView";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SpanishWordInfo, Tense } from "@/lib/types";
import { parse } from "csv-parse";
import { ExternalLinkIcon } from "lucide-react";
const SpanishVerbs = require("spanish-verbs");

const CSV_DATA_URL =
  "https://docs.google.com/spreadsheets/u/2/d/1Gplyg0M_jsvTBd6BNHiQM--JjVhkBrIjEqcb5zfYDXo/export?format=csv&id=1Gplyg0M_jsvTBd6BNHiQM--JjVhkBrIjEqcb5zfYDXo&gid=0";

// const removePrefix = (value: string, prefix: string): string =>
//   value.startsWith(prefix) ? value.slice(prefix.length) : value;
const removeSuffix = (value: string, suffix: string): string =>
  value.endsWith(suffix) ? value.slice(0, value.length - suffix.length) : value;

// function removeSubjectPronouns(phrase: string) {
//   let final = phrase.trim();

//   for (const prefix of [
//     "yo",
//     "tu",
//     "t.",
//     "t",
//     "ella",
//     "ellos",
//     "el",
//     "nosotros",
//     "ustedes",
//   ]) {
//     final = removePrefix(final, prefix + " ");
//   }

//   return final.trim();
// }

function getConjugationTenseName(rawTense: string): [string, string] {
  const trimmedTense = rawTense.trim();
  if (trimmedTense == "present") {
    return ["Present", "INDICATIVE_PRESENT"];
  } else if (trimmedTense == "preterite") {
    return ["Preterite", "INDICATIVE_PRETERITE"];
  } else if (trimmedTense == "imperfect") {
    return ["Imperfect", "INDICATIVE_IMPERFECT"];
  } else if (trimmedTense == "present perfect") {
    return ["Present Perfect", "INDICATIVE_PERFECT"];
  } else if (trimmedTense.includes("pluperfect")) {
    return ["Pluperfect", "INDICATIVE_PLUPERFECT"];
  } else if (trimmedTense.startsWith("future")) {
    return ["Future", "INDICATIVE_FUTURE"];
  } else if (trimmedTense.startsWith("conditional")) {
    return ["Conditional", "SUBJUNCTIVE_CONDITIONAL"];
  }

  throw "Unknown tense: " + trimmedTense;
}

function getVerbTense(raw_infinitive: string, rawTense: string): Tense {
  const infinitive = removeSuffix(raw_infinitive.trim(), "se");
  const isReflexive = raw_infinitive.trim().endsWith("se");

  const [tenseName, conjugationTenseName] = getConjugationTenseName(rawTense);
  const tenseData: Tense = {
    name: tenseName,
    yo_form: SpanishVerbs.getConjugation(infinitive, conjugationTenseName, 0),
    tu_form: SpanishVerbs.getConjugation(infinitive, conjugationTenseName, 1),
    el_form: SpanishVerbs.getConjugation(infinitive, conjugationTenseName, 2),
    nosotros_form: SpanishVerbs.getConjugation(
      infinitive,
      conjugationTenseName,
      3
    ),
    ellos_form: SpanishVerbs.getConjugation(
      infinitive,
      conjugationTenseName,
      5
    ),
  };

  //--------------- patches to spanish verbs conjugations ---------------//

  // patch for leer verb
  if (infinitive == "leer" && conjugationTenseName == "INDICATIVE_PRETERITE") {
    tenseData.tu_form = "leíste";
    tenseData.el_form = "leyó";
    tenseData.nosotros_form = "leímos";
  }
  if (infinitive == "leer") {
    tenseData.yo_form = tenseData.yo_form.replace("leido", "leído");
    tenseData.tu_form = tenseData.tu_form.replace("leido", "leído");
    tenseData.el_form = tenseData.el_form.replace("leido", "leído");
    tenseData.nosotros_form = tenseData.nosotros_form.replace("leido", "leído");
    tenseData.ellos_form = tenseData.ellos_form.replace("leido", "leído");
  }

  // patch for jugar verb
  if (infinitive == "jugar" && conjugationTenseName == "INDICATIVE_PRESENT") {
    tenseData.yo_form = "juego";
    tenseData.tu_form = "juegas";
    tenseData.el_form = "juega";
    tenseData.ellos_form = "juegan";
  }

  // patch for pedir
  if (infinitive == "pedir" && conjugationTenseName == "INDICATIVE_PRESENT") {
    tenseData.yo_form = "pido";
    tenseData.tu_form = "pides";
    tenseData.el_form = "pide";
    tenseData.ellos_form = "piden";
  }

  // patch for vestirse
  if (infinitive == "vestir" && conjugationTenseName == "INDICATIVE_PRESENT") {
    tenseData.yo_form = "visto";
    tenseData.tu_form = "vistes";
    tenseData.el_form = "viste";
    tenseData.ellos_form = "visten";
  }

  // patch for ver
  if (infinitive == "ver" && conjugationTenseName == "INDICATIVE_IMPERFECT") {
    tenseData.yo_form = "veía";
    tenseData.tu_form = "veías";
    tenseData.el_form = "veía";
    tenseData.nosotros_form = "veíamos";
    tenseData.ellos_form = "veían";
  }

  // patch for dormir
  if (
    infinitive == "dormir" &&
    conjugationTenseName == "INDICATIVE_PRETERITE"
  ) {
    tenseData.el_form = "durmió";
    tenseData.ellos_form = "durmieron";
  }

  // patch for pedir
  if (infinitive == "pedir" && conjugationTenseName == "INDICATIVE_PRETERITE") {
    tenseData.el_form = "pidió";
    tenseData.ellos_form = "pidieron";
  }

  // patch for venir
  if (infinitive == "venir" && conjugationTenseName == "INDICATIVE_FUTURE") {
    tenseData.yo_form = "vendré";
    tenseData.tu_form = "vendrás";
    tenseData.el_form = "vendrá";
    tenseData.nosotros_form = "vendremos";
    tenseData.ellos_form = "vendrán";
  }

  // patch for reflexive verbs
  if (isReflexive) {
    tenseData.yo_form = "me " + tenseData.yo_form;
    tenseData.tu_form = "te " + tenseData.tu_form;
    tenseData.el_form = "se " + tenseData.el_form;
    tenseData.nosotros_form = "nos " + tenseData.nosotros_form;
    tenseData.ellos_form = "se " + tenseData.ellos_form;
  }

  return tenseData;
}

function getCsvData(): Promise<SpanishWordInfo[]> {
  return new Promise(async (resolve) => {
    const csv_data = await (
      await fetch(CSV_DATA_URL, { cache: "no-cache" })
    ).text()!;

    let tenses: string[] = [];
    const spanish_data: SpanishWordInfo[] = [];
    parse(csv_data, {
      trim: false,
      skip_empty_lines: false,
    })
      // Use the readable stream api
      .on("readable", function () {
        let record: string[];
        let is_first = true;
        // @ts-expect-error this has any type
        while ((record = this.read()) !== null) {
          if (is_first) {
            is_first = false;
            tenses = record
              .splice(2)
              .map((tense) => removeSuffix(tense, " tense"));
          } else {
            try {
              if (!record[0] || !record[1]) continue;

              spanish_data.push({
                infinitive: record[0],
                definition: record[1],
                tenses: [...tenses]
                  .splice(2)
                  .map((tense_name): Tense | undefined => {
                    try {
                      if (tense_name == "conditional") {
                        const conditional = getVerbTense(record[0], "future");
                        conditional.yo_form = conditional.yo_form.replace(
                          "é",
                          "ía"
                        );
                        conditional.tu_form = conditional.tu_form.replace(
                          "ás",
                          "ías"
                        );
                        conditional.el_form = conditional.el_form.replace(
                          "á",
                          "ía"
                        );
                        conditional.nosotros_form =
                          conditional.nosotros_form.replace("emos", "íamos");
                        conditional.ellos_form = conditional.ellos_form.replace(
                          "án",
                          "ían"
                        );
                        conditional.name = "Conditional";
                        return conditional;
                      } else {
                        return getVerbTense(record[0], tense_name);
                      }
                    } catch {
                      console.error(
                        `Invalid "${tense_name}" tense data for verb "${record[0]}"`
                      );
                    }
                  })
                  .filter((n) => n) as Tense[],
              });
            } catch {
              console.error("Invalid Record Data: " + record);
            }
          }
        }
      })
      // When we are done, test that the parsed records matched what expected
      .on("end", function () {
        console.log(tenses);
        resolve(spanish_data);
      });
  });
}

function weeksBetween(d1: Date, d2: Date) {
  return Math.floor(
    Math.abs(d2.getTime() - d1.getTime()) / (7 * 24 * 60 * 60 * 1000)
  );
}

export default async function Home() {
  const spanishData = await getCsvData();
  //console.log(JSON.stringify(spanishData));
  //console.log(getVerbTense("leer", "pluperfect"));
  const quizWeek = weeksBetween(new Date(), new Date(2024, 8, 26));

  return (
    <main className="flex justify-center align-middle items-center">
      <div className="max-w-[48rem] w-full my-8">
        <div className="flex justify-between align-middle w-full mb-2">
          <div>
            <h1 className="text-2xl font-bold flex">
              Ms. Eguin&apos;s Spanish 3 Practice{" "}
              <a
                target="_blank"
                href={CSV_DATA_URL.split("/").slice(0, -1).join("/")}
              >
                <ExternalLinkIcon
                  className="ml-0.5 hover:cursor-pointer"
                  size={"1rem"}
                  strokeWidth="3px"
                />
              </a>
            </h1>
            <h2 className="text-lg text-muted-foreground">
              You are studying for the week {quizWeek} tense quiz.
            </h2>
          </div>
          <ModeToggle />
        </div>
        <Tabs defaultValue="questions" className="flex flex-col items-center">
          <TabsList className="w-max">
            <TabsTrigger value="questions">Questions</TabsTrigger>
            <TabsTrigger value="data">All Quiz Data</TabsTrigger>
          </TabsList>
          <TabsContent value="questions">
            <QuestionView spanishData={spanishData} />
          </TabsContent>
          <TabsContent value="data">
            <AllDataView spanishData={spanishData} />
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}
