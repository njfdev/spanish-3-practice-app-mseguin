import { ModeToggle } from "@/components/ModeToggle";
import QuestionView from "@/components/QuestionView";
import { SpanishWordInfo, Tense } from "@/lib/types";
import { parse } from "csv-parse";
import { ExternalLinkIcon } from "lucide-react";

const CSV_DATA_URL =
  "https://docs.google.com/spreadsheets/u/2/d/1Gplyg0M_jsvTBd6BNHiQM--JjVhkBrIjEqcb5zfYDXo/export?format=csv&id=1Gplyg0M_jsvTBd6BNHiQM--JjVhkBrIjEqcb5zfYDXo&gid=0";

const removePrefix = (value: string, prefix: string): string =>
  value.startsWith(prefix) ? value.slice(prefix.length) : value;
const removeSuffix = (value: string, suffix: string): string =>
  value.endsWith(suffix) ? value.slice(0, value.length - suffix.length) : value;

function removeSubjectPronouns(phrase: string) {
  let final = phrase.trim();

  for (const prefix of [
    "yo",
    "tu",
    "t.",
    "t",
    "ella",
    "ellos",
    "el",
    "nosotros",
    "ustedes",
  ]) {
    final = removePrefix(final, prefix + " ");
  }

  return final.trim();
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
              if (!record[0]) continue;

              spanish_data.push({
                infinitive: record[0],
                definition: record[1],
                tenses: record
                  .splice(2)
                  .map((string_data, index): Tense | undefined => {
                    try {
                      let hard_coded_data = {};
                      // hard code preterite (2nd index) form of pedir due to
                      // bad formatting in CSV file
                      if (record[0].includes("pedir") && index == 1) {
                        hard_coded_data = {
                          nosotros_form: "pedimos",
                          ellos_form: "pidieron",
                          hint: "Third person changes to pid",
                        };
                        // hard code present perfect (4th index) form of leer
                      } else if (record[0].includes("leer") && index == 3) {
                        return {
                          name: tenses[index],
                          yo_form: "he leído",
                          tu_form: "has leído",
                          el_form: "ha leído",
                          nosotros_form: "hemos leído",
                          ellos_form: "han leído",
                          hint: "leido gets an accent on the I",
                        };
                      }

                      const data = string_data.replace("o/", "ó").split(", ");
                      const hint_data = data[4].includes("(")
                        ? data[4].slice(data[4].indexOf("("))
                        : data[4].includes("-")
                        ? data[4].slice(data[4].indexOf("-")).trim()
                        : "";
                      return {
                        name: tenses[index],
                        yo_form: removeSubjectPronouns(
                          data[0].replace(",", "")
                        ),
                        tu_form: removeSubjectPronouns(data[1]),
                        el_form: removeSubjectPronouns(data[2]),
                        nosotros_form: removeSubjectPronouns(data[3]),
                        ellos_form: removeSubjectPronouns(
                          hint_data.length > 0
                            ? data[4]
                                .slice(0, data[4].indexOf("("))
                                .slice(0, data[4].indexOf("-"))
                                .trim()
                            : data[4]
                        ).trim(),
                        hint: hint_data ? hint_data : undefined,
                        ...hard_coded_data,
                      };
                    } catch {
                      console.error(
                        `Invalid "${tenses[index]}" tense data for verb "${record[0]}": ${string_data}`
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
  console.log(JSON.stringify(spanishData));
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
        <QuestionView spanishData={spanishData} />
      </div>
    </main>
  );
}
