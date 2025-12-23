import React, { FC, useEffect, useState } from "react";
import { Layout } from "../../ui/layout";
import { Typography } from "../../ui/text";
import { scheduler, WorkerTask } from "../../services/backgroundScheduler";
import { Flex } from "../../ui/flex";
import { Button } from "../../ui/button";
import { apiNewDid } from "../../client";
import { STORAGE_NAME, userVilliages } from "../..";
import { FarmService } from "../../services/farmService";
import { TroopForm } from "../troop-form";
import styled from "@emotion/styled";

export const Autofarm: FC = () => {
  const [activeIds, setActiveIds] = useState<string[]>([]);
  const [troopsByVillage, setTroopsByVillage] = useState<Record<string, TroopsData>>({});
  const [lastRunMap, setLastRunMap] = useState<Map<string, number>>(new Map());

  const [intervalsByVillage, setIntervalsByVillage] = useState<Record<string, number>>({});

  // при изменении input:
  const handleIntervalChange = (villageId: string, value: string) => {
    const num = parseInt(value, 10);
    if (!isNaN(num)) {
      setIntervalsByVillage((prev) => ({
        ...prev,
        [villageId]: num,
      }));
    }
  };

  const setTroops = (villageId: string, data: TroopsData) => {
    setTroopsByVillage((prev) => ({
      ...prev,
      [villageId]: data,
    }));
  };

  // при монтировании синхронизируем с scheduler
  useEffect(() => {
    setActiveIds(scheduler.getActiveWorkerIds() as string[]);
    const unsubscribe = scheduler.subscribe((data) => {
      setLastRunMap(data);
    });
    return unsubscribe;
  }, []);

  // функция создания воркера для конкретной деревни
  const createWorker = (villageId: number): WorkerTask => {
    const intervalMinutes = intervalsByVillage[villageId.toString()] ?? 5;

    return {
      id: villageId.toString(),
      interval: intervalMinutes * 60 * 1000,
      prepare: async () => {
        console.log(`prepare: ${villageId}`);
        await apiNewDid(villageId);
      },
      run: async () => {
        const service = new FarmService(STORAGE_NAME + villageId, troopsByVillage[villageId]);
        const farms = service.getFarms();
        console.log({ farms });
        console.log("Troops data for run:", troopsByVillage[villageId]);
        await service.farm();
      },
    };
  };

  const toggle = (villageId: number) => {
    const id = villageId.toString();
    if (activeIds.includes(id)) {
      scheduler.unregister(id);
      setActiveIds((prev) => prev.filter((x) => x !== id));
    } else {
      // создаём воркер на момент старта
      const worker = createWorker(villageId);
      scheduler.register(worker);
      setActiveIds((prev) => [...prev, id]);
    }
  };

  return (
    <Layout title={<Typography size="large">Autofarm</Typography>}>
      <WorkersContainer>
        {Array.from(userVilliages.keys()).map((villageId) => {
          const active = activeIds.includes(villageId.toString());
          const troops = troopsByVillage[villageId];

          // проверяем, есть ли данные и хотя бы одно поле не пустое
          const isStartDisabled =
            !active && (!troops || Object.values(troops).every((v) => !v || v.trim() === ""));

          return (
            <WorkerCard key={villageId} active={active}>
              <Flex gap={8} alignItems="center">
                <span>{`${villageId} Интервал: `}</span>
                <Input
                  type="number"
                  min={1}
                  value={intervalsByVillage[villageId.toString()] ?? 5}
                  onChange={(e) => handleIntervalChange(villageId.toString(), e.target.value)}
                />
                <span>мин</span>
              </Flex>
              Последний запуск:{" "}
              {lastRunMap.get(villageId.toString())
                ? formatTime(lastRunMap.get(villageId.toString()))
                : "-"}
              <Flex gap={12}>
                <TroopForm onChange={(data) => setTroops(villageId.toString(), data)} />
                <Button disabled={isStartDisabled} onClick={() => toggle(villageId)}>
                  {active ? "Stop" : "Start"}
                </Button>
              </Flex>
            </WorkerCard>
          );
        })}
      </WorkersContainer>
    </Layout>
  );
};

export type TroopsData = {
  t1: string;
  t2: string;
  t3: string;
  t4: string;
  t5: string;
  t6: string;
};

function formatTime(timestamp: number | undefined) {
  if (!timestamp) return "-";
  return new Date(timestamp).toLocaleTimeString("ru-RU", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}

const Input = styled.input`
  width: 64px;
`;

const WorkerCard = styled.div<{ active?: boolean }>`
  background-color: ${(props) => (props.active ? "#d3d3d3" : "#ebd0ba")};
  border-radius: 8px;
  padding: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
  gap: 8px;
  transition: transform 0.2s, box-shadow 0.2s, background-color 0.2s, opacity 0.2s;
  cursor: pointer;
  opacity: ${(props) => (props.active ? 0.6 : 1)};

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.4);
  }

  ${(props) =>
    props.active &&
    `
    border: 2px solid #ccc;
  `}
`;

const WorkersContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;

  /* Растягиваем контейнер по доступной высоте */
  height: 100%;
  max-height: 100vh;

  /* Добавляем скролл, если контент превышает высоту */
  overflow-y: auto;

  /* Плавный скролл для эстетики */
  scrollbar-width: thin;
  scrollbar-color: #888 transparent;

  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-thumb {
    background-color: #888;
    border-radius: 4px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }
`;
