import { ModeToggle } from "@/components/ModeToggle";
import QuestionView from "@/components/QuestionView";
import { SpanishWordInfo, Tense } from "@/lib/types";
import { parse } from "csv-parse";
import { ExternalLinkIcon } from "lucide-react";

const CSV_DATA_URL =
  "https://docs.google.com/spreadsheets/u/2/d/1Gplyg0M_jsvTBd6BNHiQM--JjVhkBrIjEqcb5zfYDXo/export?format=csv&id=1Gplyg0M_jsvTBd6BNHiQM--JjVhkBrIjEqcb5zfYDXo&gid=0";

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
            tenses = record.splice(2);
          } else {
            try {
              spanish_data.push({
                infinitive: record[0],
                definition: record[1],
                tenses: record.splice(2).map((string_data, index): Tense => {
                  let hard_coded_data = {};
                  // hard code preterite (2nd index) form of pedir due to
                  // bad formatting in CSV file
                  if (record[0].includes("pedir") && index == 1) {
                    hard_coded_data = {
                      nosotros_form: "pedimos",
                      ellos_form: "pidieron",
                      hint: "Third person changes to pid",
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
                    yo_form: data[0].replace(",", ""),
                    tu_form: data[1],
                    el_form: data[2],
                    nosotros_form: data[3],
                    ellos_form: (hint_data.length > 0
                      ? data[4]
                          .slice(0, data[4].indexOf("("))
                          .slice(0, data[4].indexOf("-"))
                          .trim()
                      : data[4]
                    ).trim(),
                    hint: hint_data ? hint_data : undefined,
                    ...hard_coded_data,
                  };
                }),
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
  const quizWeek = weeksBetween(new Date(), new Date(2024, 9, 27));

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
