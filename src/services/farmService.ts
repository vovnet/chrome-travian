import { STORAGE_NAME, userVilliages } from "..";
import { apiMapPosition, apiTileDetails } from "../client";
import { isFailedLastAttack, lastLootedResources } from "../client/parser";
import { ANIMALS, AnimalTypeId } from "../client/types/animal";
import { TroopsData } from "../components/troop-form";
import { Farm } from "../types";
import { getDistance } from "../utils";

export class FarmService {
  private villageId: string;
  private storageKey: string;

  private farms: Set<string> = new Set();
  private lastPosition = 0;
  private lastCoord: string | null = null;

  private farmVillages: Array<TargetFarm>;

  private troops: TroopsData;
  private currentVillage: { id: number; x: number; y: number };
  private maxOasisDistance: number;

  constructor(villageId: string, troops: TroopsData, maxOasisDistance = 0) {
    this.villageId = villageId;
    this.storageKey = STORAGE_NAME + villageId;
    this.maxOasisDistance = maxOasisDistance;
    const currentVillage = userVilliages.get(Number(this.villageId));
    this.currentVillage = {
      id: Number(currentVillage?.id),
      x: Number(currentVillage?.x),
      y: Number(currentVillage?.y),
    };
    this.load();
    this.farmVillages = initFarm(this.farms, this.currentVillage);
    this.troops = troops;
  }

  getFarms(): Set<string> {
    return new Set(this.farms);
  }

  updateTroops(troops: TroopsData, maxOasisDistance: number) {
    this.troops = troops;
    this.maxOasisDistance = maxOasisDistance;
  }

  async farm() {
    // Получаем список пустых оазисов
    const oasisFarm = await this.getOasis();
    console.log(`Added ${oasisFarm.length} oases.`);

    // Объединяем деревни и оазисы, сортируем по расстоянию
    const computedFarm: TargetFarm[] = [...oasisFarm, ...this.farmVillages].sort(
      (a, b) => a.distance - b.distance
    );

    // Определяем стартовый индекс
    let startIndex = 0;
    if (this.lastCoord) {
      const idx = computedFarm.findIndex((t) => `${t.x}|${t.y}` === this.lastCoord);
      if (idx >= 0) {
        startIndex = (idx + 1) % computedFarm.length;
      }
    } else {
      // lastCoord недоступен — используем lastPosition
      const farmsArray = Array.from(this.farms);
      if (this.lastPosition < farmsArray.length) {
        const coord = farmsArray[this.lastPosition];
        const pos = computedFarm.findIndex((t) => `${t.x}|${t.y}` === coord);
        startIndex = pos >= 0 ? pos : 0;
      }
    }

    console.log({
      startIndex,
      lastCoord: this.lastCoord,
      lastPosition: this.lastPosition,
      computedFarm,
    });

    for (let i = 0; i < computedFarm.length; i++) {
      const target = computedFarm[(startIndex + i) % computedFarm.length];
      const coordStr = `${target.x}|${target.y}`;
      console.log(`[${this.villageId}]`, {
        ...target,
        lastXY: this.lastCoord,
        lastPos: this.lastPosition,
      });

      const html = await apiTileDetails({ x: target.x, y: target.y });

      if (!html.match(/targetMapId=\d*/)) {
        console.log("Wrong village position:", coordStr);
        continue;
      }

      if (isFailedLastAttack(html)) {
        console.log("Last attack failed:", coordStr);
        continue;
      }

      const lastLoot = lastLootedResources(html);
      if (lastLoot) console.log({ coord: coordStr, lastLoot });

      try {
        const formData = troopsDataToFormData(this.troops);
        formData.append("eventType", "4");
        formData.append("x", target.x.toString());
        formData.append("y", target.y.toString());
        formData.append("ok", "ok");

        const htmlText = await sendTroops(formData);
        const parsed = parseTroopResponse(htmlText);
        if (!parsed.checksum) throw new Error("Checksum not found in response");

        const sendFormData = createSendFormData(
          target.x.toString(),
          target.y.toString(),
          formData,
          parsed
        );
        await fetch("/build.php?gid=16&tt=2", { method: "POST", body: sendFormData });

        // Сохраняем текущую координату для runtime
        this.lastCoord = coordStr;

        // Если цель — деревня, обновляем lastPosition для сохранения
        if (target.type === "village") {
          const farmsArray = Array.from(this.farms);
          const pos = farmsArray.indexOf(coordStr);
          if (pos >= 0) this.lastPosition = pos;
        }
      } catch (err) {
        console.log("send farm error!", err);
        break; // останавливаем цикл при ошибке / нехватке войск
      }
    }

    this.save(); // сохраняем lastPosition только деревни
    console.log("Work end.");
  }

  private load() {
    const raw = localStorage.getItem(this.storageKey);
    if (!raw) return;

    try {
      const data = JSON.parse(raw) as Farm;
      this.farms = new Set(data.list);
      this.lastPosition = data.lastPosition ?? 0;
    } catch (e) {
      console.error("Failed to load farms from storage", e);
      this.farms = new Set();
      this.lastPosition = 0;
    }
  }

  private save() {
    const data: Farm = {
      lastPosition: this.lastPosition,
      list: Array.from(this.farms),
    };

    localStorage.setItem(this.storageKey, JSON.stringify(data));
  }

  private async getOasis(): Promise<TargetFarm[]> {
    const tiles = await apiMapPosition({
      x: Number(this.currentVillage.x),
      y: Number(this.currentVillage.y),
    });

    return tiles
      .filter((t) => t.title === "{k.fo}")
      .map((d) => {
        const units = parseUnits(d.text || "").map((u) => ({
          ...u,
          ...ANIMALS[u.unitId as AnimalTypeId],
        }));

        const distance = getDistance(
          d.position.x,
          this.currentVillage.x,
          d.position.y,
          this.currentVillage.y
        );

        return {
          position: d.position,
          units,
          distance,
        };
      })
      .filter((t) => t.distance <= this.maxOasisDistance)
      .filter((oas) => oas.units.length === 0)
      .map((oas) => ({
        x: oas.position.x,
        y: oas.position.y,
        distance: oas.distance,
        type: "oasis",
      }));
  }
}

function initFarm(farms: Set<string>, currentVillage: { x: number; y: number }): Array<TargetFarm> {
  return Array.from(farms).map((v) => {
    const [x, y] = v.split("|").map(Number);
    return {
      x,
      y,
      distance: getDistance(currentVillage.x, x, currentVillage.y, y),
      type: "village",
    };
  });
}

function troopsDataToFormData(troops: TroopsData): FormData {
  const formData = new FormData();

  for (let i = 1; i <= 6; i++) {
    const key = `t${i}` as keyof TroopsData;
    formData.append(`troop[${key}]`, troops[key] || "");
  }

  return formData;
}

// Отправка формы на сервер и получение ответа
async function sendTroops(formData: FormData): Promise<string> {
  const response = await fetch("/build.php?gid=16&tt=2", { method: "POST", body: formData });
  return response.text();
}

// Извлечение данных из html-ответа
function parseTroopResponse(htmlText: string) {
  const [action] = htmlText.match(/troopsSend\/\d*\/\d*/) ?? [];
  const [, checksum] = htmlText.match(/\[name=checksum]'\).value = '\w*/)?.[0].split("= '") ?? [];
  const [, villageId] =
    htmlText.match(/troops\[\d]\[villageId]" value="\d*/)?.[0].split('="') ?? [];
  return { action, checksum, villageId };
}

// Создание FormData для повторной отправки
function createSendFormData(
  x: string,
  y: string,
  formData: FormData,
  parsed: { action: string; checksum: string; villageId: string }
) {
  const sendFormData = new FormData();
  sendFormData.append("checksum", parsed.checksum);
  sendFormData.append("action", parsed.action);
  sendFormData.append("eventType", "4");
  sendFormData.append("x", x);
  sendFormData.append("y", y);
  sendFormData.append("troops[0][villageId]", parsed.villageId);

  for (let i = 1; i <= 6; i++) {
    const t = formData.get(`troop[t${i}]`) as string;
    sendFormData.append(`troops[0][t${i}]`, t);
  }
  return sendFormData;
}

type TargetType = "village" | "oasis";

type TargetFarm = { x: number; y: number; distance: number; type: TargetType };

type UnitEntry = {
  unitId: number;
  amount: number;
};

function parseUnits(html: string): UnitEntry[] {
  const doc = new DOMParser().parseFromString(html, "text/html");

  return Array.from(doc.querySelectorAll(".inlineIcon.tooltipUnit"))
    .map((el) => {
      const unitClass = el.querySelector("i.unit")?.className ?? "";
      const idMatch = unitClass.match(/u(\d+)/);

      const valueText = el.querySelector(".value")?.textContent ?? "";

      if (!idMatch) return null;

      return {
        unitId: Number(idMatch[1]),
        amount: Number(valueText.trim()),
      };
    })
    .filter((u): u is UnitEntry => u !== null);
}
