import { currentVillageId, userVilliages } from "..";
import { apiGetHero, apiMapPosition, apiNewDid } from "../client";
import { ANIMALS, AnimalTypeId } from "../client/types/animal";
import { getDistance } from "../utils";

export class HeroFarmService {
  private minHealth: number;

  private strength: number;

  constructor(minHealth: number, strength: number) {
    this.minHealth = minHealth;
    this.strength = strength;
  }

  async run() {
    const heroInfo = await apiGetHero();

    if (heroInfo.commonData.currentHealth < this.minHealth) {
      console.log("hero healt is to low: ", heroInfo.commonData.currentHealth);
      return;
    }

    if (heroInfo.heroState.status.inVillage?.id) {
      await apiNewDid(heroInfo.heroState.status.inVillage?.id);
    } else {
      console.log("Hero is not at home.");
      return;
    }

    const farm = await getFarm(this.strength);

    if (!farm.length) {
      console.log("Empty farm list");
      return;
    }

    const { x, y } = farm[0].position;

    const formData = new FormData();
    formData.append("troop[t1]", "");
    formData.append("troop[t4]", "");
    formData.append("troop[t5]", "");
    formData.append("troop[t3]", "");
    formData.append("troop[t11]", "1");
    formData.append("villagename", "");
    formData.append("eventType", "4");
    formData.append("x", x.toString());
    formData.append("y", y.toString());
    formData.append("ok", "ok");

    const sendResponse = await sendTroops(formData);

    const newData = collectTroopSendFormDataFromHTML(sendResponse, "troopSendForm");

    for (const [key, value] of newData.entries()) {
      console.log(key, value);
    }

    await fetch("/build.php?gid=16&tt=2", { method: "POST", body: newData });

    console.log(`Send hero to: ${x}|${y}`);
  }
}

async function getFarm(attackPower = 100) {
  const currentVilliage = userVilliages.get(currentVillageId);
  const tiles = await apiMapPosition({
    x: Number(currentVilliage?.x),
    y: Number(currentVilliage?.y),
  });

  return tiles
    .filter((t) => t.title === "{k.fo}")
    .map((d) => {
      const units = parseUnits(d.text || "").map((u) => ({
        ...u,
        ...ANIMALS[u.unitId as AnimalTypeId],
      }));

      const sum = units.reduce(
        (acc, unit) => {
          acc.totalResources += unit.resources * unit.amount;
          acc.totalInfantryDefense += unit.infantryDefense * unit.amount;
          acc.totalCavalryDefense += unit.cavalryDefense * unit.amount;
          return acc;
        },
        { totalResources: 0, totalInfantryDefense: 0, totalCavalryDefense: 0 }
      );

      const distance = getDistance(
        d.position.x,
        Number(currentVilliage?.x),
        d.position.y,
        Number(currentVilliage?.y)
      );

      const priority = calculateOasisPriority({
        attackPower,
        distanceInFields: distance,
        speedFieldsPerHour: 19,
        totalInfantryDefense: 0,
        totalCavalryDefense: sum.totalCavalryDefense,
        totalResources: sum.totalResources,
      });

      return {
        position: d.position,
        units,
        sum,
        distance,
        priority,
      };
    })
    .filter((t) => t.priority > 0)
    .sort((a, b) => b.priority - a.priority);
}

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

interface OasisAssessmentInput {
  attackPower: number; // Сила атаки героя
  totalCavalryDefense: number; // Суммарная защита от кавалерии у всех животных
  totalInfantryDefense: number; // Суммарная защита от пехоты
  totalResources: number; // Суммарные ресурсы животных
  distanceInFields: number; // Дистанция до оазиса в полях
  speedFieldsPerHour: number; // Скорость героя в полях/час
}

function calculateOasisPriority({
  attackPower,
  totalCavalryDefense,
  totalResources,
  distanceInFields,
  speedFieldsPerHour,
}: OasisAssessmentInput): number {
  if (totalCavalryDefense === 0 && totalResources === 0) return 0;
  if (totalCavalryDefense > 0 && attackPower < 5 * totalCavalryDefense) return 0;

  const resourceScore = Math.pow(totalResources, 1.3); // больше веса на ресурсы
  const timeHours = distanceInFields / speedFieldsPerHour;
  const distanceScore = 1 / (1 + timeHours / 2); // мягкий эффект дистанции
  const safetyFactor =
    totalCavalryDefense > 0
      ? Math.sqrt(attackPower / totalCavalryDefense) // меньше доминирования защиты
      : 1;

  return resourceScore * distanceScore * safetyFactor;
}

async function sendTroops(formData: FormData): Promise<string> {
  const response = await fetch("/build.php?gid=16&tt=2", { method: "POST", body: formData });
  return response.text();
}

function collectTroopSendFormDataFromHTML(html: string, formId: string): FormData {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");

  const form = doc.getElementById(formId) as HTMLFormElement | null;
  if (!form) throw new Error(`Форма с id="${formId}" не найдена`);

  const formData = new FormData();

  // input, select, textarea
  form
    .querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>(
      "input, select, textarea"
    )
    .forEach((el) => {
      if (!el.name) return;
      formData.append(el.name, el.value);
    });

  // Пытаемся вытянуть checksum из onclick кнопки
  const btn = doc.querySelector<HTMLButtonElement>("#confirmSendTroops");
  if (btn?.getAttribute("onclick")) {
    const onclick = btn.getAttribute("onclick")!;
    const match = onclick.match(
      /document\.querySelector\('#troopSendForm input\[name=checksum\]'\)\.value\s*=\s*['"](.+?)['"]/
    );
    if (match) {
      formData.set("checksum", match[1]);
    }
  }

  return formData;
}
