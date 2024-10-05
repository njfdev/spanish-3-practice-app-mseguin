import { ModeToggle } from "@/components/ModeToggle";
import QuestionView from "@/components/QuestionView";
import { SpanishWordInfo, Tense } from "@/lib/types";
import { parse } from "csv-parse";
import { ExternalLinkIcon } from "lucide-react";

const CSV_DATA_URL =
  "https://docs.google.com/spreadsheets/u/2/d/1Gplyg0M_jsvTBd6BNHiQM--JjVhkBrIjEqcb5zfYDXo/export?format=csv&id=1Gplyg0M_jsvTBd6BNHiQM--JjVhkBrIjEqcb5zfYDXo&gid=0";

function getCsvData(): Promise<SpanishWordInfo[]> {
  return new Promise(async (resolve) => {
    const csv_data = await (await fetch(CSV_DATA_URL)).text()!;

    let tenses: string[] = [];
    const spanish_data: SpanishWordInfo[] = [];
    parse(csv_data, {
      trim: true,
      skip_empty_lines: true,
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
            spanish_data.push({
              infinitive: record[0],
              definition: record[1],
              tenses: record.splice(2).map((string_data, index): Tense => {
                const data = string_data.split(", ");
                const hint_data = data[4].includes("(")
                  ? data[4].slice(data[4].indexOf("("))
                  : "";
                return {
                  name: tenses[index],
                  yo_form: data[0],
                  tu_form: data[1],
                  el_form: data[2],
                  nosotros_form: data[3],
                  ellos_form: (hint_data.length > 0
                    ? data[4].slice(0, data[4].indexOf("(")).trim()
                    : data[4]
                  ).trim(),
                  hint: hint_data ? hint_data : undefined,
                };
              }),
            });
          }
        }
      })
      // When we are done, test that the parsed records matched what expected
      .on("end", function () {
        resolve(spanish_data);
      });
  });
}

export default async function Home() {
  const spanishData = await getCsvData();

  return (
    <main className="flex justify-center align-middle items-center">
      <div className="max-w-[48rem] w-full my-8">
        <div className="flex justify-between align-middle items-center w-full mb-2">
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
          <ModeToggle />
        </div>
        <QuestionView spanishData={spanishData} />
      </div>
    </main>
  );
}
