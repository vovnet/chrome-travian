import React, { FC, useState } from "react";
import { getLastReport, saveReports } from "../../db";
import { apiGetReportById, apiGetReports } from "../../../../client";
import { extractReportIds, parseReportHTML, ReportData } from "../../utils";
import { Flex } from "../../../../ui/flex";
import { Button } from "../../../../ui/button";
import { Typography } from "../../../../ui/text";

export const Scan: FC = () => {
  const [page, setPage] = useState(0);
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const [maxReports, setMaxReports] = useState(1000);

  async function fetchAllReports(): Promise<Map<string, boolean>> {
    let page = 1;
    const allIds = new Map<string, boolean>();
    const lastId = (await getLastReport())?.id;

    while (true) {
      const html = await apiGetReports(page.toString());
      const ids = extractReportIds(html);
      if (!ids.length) break;

      for (const id of ids) {
        if (lastId && id === lastId) {
          // остановка при нахождении последнего отчета
          return allIds;
        }
        allIds.set(id, true);
      }

      page++;
      setPage(page);

      if (allIds.size >= maxReports) {
        break;
      }
    }

    return allIds;
  }

  const handleScan = async () => {
    const reportIdsMap = await fetchAllReports();
    const reportIds = Array.from(reportIdsMap.keys()); // превращаем ключи Map в массив
    setProgress({ done: 0, total: reportIds.length });

    const reports: ReportData[] = [];

    for (let i = 0; i < reportIds.length; i++) {
      const repId = reportIds[i];
      const html = await apiGetReportById(repId);
      const parsed = parseReportHTML(html, repId);
      if (parsed.timestamp) {
        reports.push(parsed);
      }

      // обновляем прогресс
      setProgress({ done: i + 1, total: reportIds.length });
    }

    console.log("Все отчеты:", reports);
    await saveReports(reports); // сохраняем в IndexedDB
    console.log("Отчеты сохранены!");
  };

  return (
    <Flex flexDirection="column" gap={8}>
      <Flex gap={8} alignItems="center">
        <span>Max. reports:</span>
        <input type="number" value={maxReports} onChange={(e) => setMaxReports(+e.target.value)} />
        <Button onClick={handleScan}>Scan</Button>
      </Flex>
      <Flex gap={8} alignItems="baseline">
        <span>Страница: {page}</span>
        <div style={{ marginTop: "10px" }}>
          {progress.total > 0 && (
            <Typography size="medium">
              Загружено {progress.done} из {progress.total} отчетов
            </Typography>
          )}
        </div>
      </Flex>
    </Flex>
  );
};
