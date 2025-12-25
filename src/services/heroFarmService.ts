import { userVilliages } from "..";
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

  async run(): Promise<void> {
    // const farm = await this.findBestFarm({ x: -2, y: -130 });

    const heroInfo = await this.getReadyHero();
    if (!heroInfo) return;

    const village = await this.getHeroVillage(heroInfo);
    if (!village) return;

    const bestFarm = await this.findBestFarm(village);
    if (!bestFarm) return;

    await this.sendHeroToFarm(bestFarm);
  }

  private async getReadyHero() {
    const heroInfo = await apiGetHero();

    const currentHealth = heroInfo.commonData.currentHealth;
    if (currentHealth < this.minHealth) {
      console.log("[HeroFarm] Hero health too low:", currentHealth);
      return null;
    }

    const homeVillageId = heroInfo.heroState.status.inVillage?.id;
    if (!homeVillageId) {
      console.log("[HeroFarm] Hero is not in village");
      return null;
    }

    await apiNewDid(homeVillageId);

    return heroInfo;
  }

  private async getHeroVillage(heroInfo: Awaited<ReturnType<typeof apiGetHero>>) {
    const villageId = heroInfo.heroState.status.inVillage?.id || 0;
    const village = userVilliages.get(villageId);

    if (!village) {
      console.log("[HeroFarm] Village not found:", villageId);
      return null;
    }

    return village;
  }

  private async findBestFarm(village: { x: number | string; y: number | string }) {
    const farms = await getFarm({
      attackPower: this.strength,
      pos: {
        x: Number(village.x),
        y: Number(village.y),
      },
    });

    if (farms.length === 0) {
      console.log("[HeroFarm] No suitable oases found");
      return null;
    }
    console.log(
      farms.map((f) => ({
        distance: f.distance,
        priority: f.priority,
        totalResources: f.sum.totalResources,
        kpi: `${Math.round(calculateOasisKPI(f.sum.totalResources, f.distance, 19))} res/h`,
      }))
    );
    return farms[0];
  }

  private async sendHeroToFarm(farm: { position: { x: number; y: number }; priority: number }) {
    const { x, y } = farm.position;

    const initialForm = prepareForm(x, y);
    const responseHtml = await sendTroops(initialForm);

    const finalFormData = collectTroopSendFormDataFromHTML(responseHtml, "troopSendForm");

    await fetch("/build.php?gid=16&tt=2", {
      method: "POST",
      body: finalFormData,
    });

    console.log(`[HeroFarm] Hero sent to ${x}|${y}, priority=${farm.priority.toFixed(2)}`);
  }
}

function prepareForm(x: number, y: number) {
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
  return formData;
}

async function getFarm({
  attackPower,
  pos,
}: {
  attackPower: number;
  pos: { x: number; y: number };
}) {
  const tiles = await apiMapPosition(pos);

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

      const distance = getDistance(d.position.x, pos.x, d.position.y, pos.y);

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

// speedFieldsPerHour — скорость героя
function calculateOasisKPI(
  totalResources: number,
  distanceInFields: number,
  speedFieldsPerHour: number
) {
  const roundTripHours = (distanceInFields * 2) / speedFieldsPerHour; // туда + обратно
  if (roundTripHours === 0) return 0;
  return totalResources / roundTripHours;
}

function calculateOasisPriority({
  attackPower,
  totalCavalryDefense,
  totalResources,
  distanceInFields,
  speedFieldsPerHour,
}: OasisAssessmentInput): number {
  if (totalResources <= 0) return 0;

  // герой не должен получать урон
  if (totalCavalryDefense > 0 && attackPower < 5 * totalCavalryDefense) {
    return 0;
  }

  const roundTripHours = (distanceInFields / speedFieldsPerHour) * 2;

  // основной KPI
  const resourcesPerHour = totalResources / Math.max(roundTripHours, 0.1);

  // запас по силе (мягкий бонус, а не доминирующий)
  const safetyFactor =
    totalCavalryDefense > 0 ? Math.min(2, Math.sqrt(attackPower / totalCavalryDefense)) : 1.5;

  return Math.round(resourcesPerHour * safetyFactor);
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
