import React, { FC, useState } from "react";
import { Layout } from "../../ui/layout";
import { Typography } from "../../ui/text";
import { Button } from "../../ui/button";
import { getAllReports, getReportsLastDay, getReportsLastHour, getReportsLastWeek } from "./db";
import { Flex } from "../../ui/flex";
import { Scan } from "./components/scan";
import { ReportData } from "./utils";
import { Table } from "../../ui/table";
import styled from "@emotion/styled";
import { tokens } from "../../variables/tokens";

export const Reports: FC = () => {
  const [best, setBest] = useState<AggregatedReport[]>([]);
  const [loading, setLoading] = useState(false);

  const aggregatedColumns = [
    {
      label: "Деревня",
      renderCell: (item: AggregatedReport) => (
        <a
          href={item.villageLink}
          target="_blank"
          rel="noreferrer"
          style={{ color: "#7cbcff", textDecoration: "none" }}
        >
          {item.villageName}
        </a>
      ),
    },
    {
      label: "Добыча",
      renderCell: (item: AggregatedReport) => <span>{item.totalCarry}</span>,
    },
    {
      label: "Отчёты",
      renderCell: (item: AggregatedReport) => <span>{item.reportsCount}</span>,
    },
    {
      label: "Эффективность",
      renderCell: (item: AggregatedReport) => <span>{item.efficiency}%</span>,
    },
  ];

  return (
    <Layout title={<Typography size="large">Reports</Typography>}>
      <Scan />

      <Flex gap={4}>
        <Button
          disabled={loading}
          onClick={async () => {
            setLoading(true);
            const reports = await getAllReports();
            console.log("Из базы извлечено:", reports.length);
            const aggregated = aggregateByDefenderVillage(reports);
            const sorted = sortByCarryDesc(aggregated);
            setBest(sorted);
            setLoading(false);
          }}
        >
          Все отчеты
        </Button>

        <Button
          disabled={loading}
          onClick={async () => {
            setLoading(true);
            const reports = await getReportsLastWeek();
            console.log("Недельный отчет:", reports);
            const aggregated = aggregateByDefenderVillage(reports);
            const sorted = sortByCarryDesc(aggregated);
            setBest(sorted);
            setLoading(false);
          }}
        >
          Неделя
        </Button>

        <Button
          disabled={loading}
          onClick={async () => {
            setLoading(true);
            const reports = await getReportsLastDay();
            console.log("Суточный отчет:", reports);
            const aggregated = aggregateByDefenderVillage(reports);
            const sorted = sortByCarryDesc(aggregated);
            setBest(sorted);
            setLoading(false);
          }}
        >
          Сутки
        </Button>

        <Button
          disabled={loading}
          onClick={async () => {
            setLoading(true);
            const reports = await getReportsLastHour();
            console.log("Часовой отчет:", reports);
            const aggregated = aggregateByDefenderVillage(reports);
            const sorted = sortByCarryDesc(aggregated);
            setBest(sorted);
            setLoading(false);
          }}
        >
          Час
        </Button>
      </Flex>

      <Flex gap={8}>Всего: {best.reduce((acc, curr) => (acc += curr.totalCarry), 0)} рес.</Flex>

      <TableWrapper>
        <Table<AggregatedReport> columns={aggregatedColumns} data={best} />
      </TableWrapper>
    </Layout>
  );
};

type AggregatedReport = {
  villageId: number;
  villageName: string;
  villageLink: string;
  totalCarry: number;
  totalCarryMax: number;
  reportsCount: number;
  efficiency: number; // %
};

function aggregateByDefenderVillage(reports: ReportData[]): AggregatedReport[] {
  const map = new Map<number, AggregatedReport>();

  for (const report of reports) {
    const village = report.defender?.village;
    const carryCurrent = report.attacker?.carry?.current ?? 0;
    const carryMax = report.attacker?.carry?.max ?? 0;

    if (!village?.id || carryMax === 0) continue;

    const existing = map.get(village.id);

    if (existing) {
      existing.totalCarry += carryCurrent;
      existing.totalCarryMax += carryMax;
      existing.reportsCount += 1;
    } else {
      map.set(village.id, {
        villageId: village.id,
        villageName: village.name,
        villageLink: `/karte.php?d=${village.id}`,
        totalCarry: carryCurrent,
        totalCarryMax: carryMax,
        reportsCount: 1,
        efficiency: 0, // посчитаем ниже
      });
    }
  }

  // считаем эффективность в процентах
  return Array.from(map.values()).map((v) => ({
    ...v,
    efficiency: v.totalCarryMax > 0 ? Math.round((v.totalCarry / v.totalCarryMax) * 100) : 0,
  }));
}

function sortByCarryDesc(data: AggregatedReport[]): AggregatedReport[] {
  return [...data].sort((a, b) => b.totalCarry - a.totalCarry);
}

const TableWrapper = styled.div`
  max-height: 600px;
  overflow-y: auto;
  overflow-x: auto;

  border: 1px solid ${tokens.colors.accent};
`;
