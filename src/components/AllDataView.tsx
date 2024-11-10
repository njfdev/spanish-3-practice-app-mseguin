"use client";

import { SpanishWordInfo, Tense } from "@/lib/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { ScrollArea } from "./ui/scroll-area";

export function AllDataView({
  spanishData,
}: {
  spanishData: SpanishWordInfo[];
}) {
  return (
    <ScrollArea className="w-screen max-w-[60rem]">
      <Table className="w-max">
        <TableHeader>
          <TableRow>
            <TableHead>Verb</TableHead>
            <TableHead>Definition</TableHead>
            {spanishData[0].tenses.map((tenseData: Tense) => {
              return (
                <TableHead key={"tense-table-header-name-" + tenseData.name}>
                  {tenseData.name}
                </TableHead>
              );
            })}
          </TableRow>
        </TableHeader>
        <TableBody>
          {spanishData.map((data) => {
            return (
              <TableRow key={data.infinitive}>
                <TableCell>{data.infinitive}</TableCell>
                <TableCell>{data.definition}</TableCell>
                {data.tenses.map((tenseData: Tense) => {
                  return (
                    <TableCell key={tenseData.name + "-" + data.infinitive}>
                      {tenseData.yo_form}, {tenseData.tu_form},{" "}
                      {tenseData.el_form}, {tenseData.nosotros_form},{" "}
                      {tenseData.ellos_form}
                    </TableCell>
                  );
                })}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </ScrollArea>
  );
}
