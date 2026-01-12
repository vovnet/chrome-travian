import { apiGetReports } from "../../client";

export async function fetchAllReports() {
  let page = 1;
  let allIds: string[] = [];

  while (true) {
    const html = await apiGetReports(page.toString());
    const data = extractReportIdsFromHTML(html);
    if (page >= 5) {
      break;
    }
    if (data.length === 0) {
      break;
    }
    allIds = allIds.concat(data);
    page += 1;
  }
  return allIds;
}

export function extractReportIdsFromHTML(html: string): string[] {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  return Array.from(doc.querySelectorAll<HTMLInputElement>("input.check.report")).map(
    (input) => input.value
  );
}

export type PlayerVillage = {
  player: { name: string; id: number | null };
  village: { name: string; id: number };
};

export type Carry = {
  current: number;
  max: number;
};

export type ReportData = {
  id: string;
  timestamp: number; // миллисекунды
  attacker: PlayerVillage & { carry: Carry };
  defender: PlayerVillage;
};

export function parseReportHTML(htmlString: string, id: string): ReportData {
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlString, "text/html");

  function parseCarry(carryText: string | null): Carry {
    if (!carryText) return { current: 0, max: 0 };
    const [current, max] = carryText
      .replace(/[^\d\/]/g, "")
      .split("/")
      .map(Number);
    return { current, max };
  }

  function parsePlayerVillage(roleSelector: Element, role: "attacker" | "defender"): PlayerVillage {
    const playerEl = roleSelector.querySelector(".player");
    const villageEl = roleSelector.querySelector(".village");

    // если нет игрока (например, природа), ставим null
    const playerHref = playerEl?.getAttribute("href");
    const playerId = playerHref ? Number(playerHref.match(/\/profile\/(\d+)/)?.[1] ?? null) : null;
    const playerName =
      playerEl?.textContent?.trim() ?? (role === "defender" ? "Unknown" : "Unknown");

    const villageHref = villageEl?.getAttribute("href");
    const villageId = villageHref ? Number(villageHref.match(/d=(\d+)/)?.[1] ?? 0) : 0;
    const villageName = villageEl?.textContent?.trim() ?? "Unknown";

    return {
      player: { name: playerName, id: playerId },
      village: { name: villageName, id: villageId },
    };
  }

  // timestamp
  const timestampEl = doc.querySelector(".time .text");
  let timestamp = 0;
  if (timestampEl?.textContent) {
    const timestampText = timestampEl.textContent.trim();
    const [datePart, timePart] = timestampText.split(",").map((s) => s.trim());
    const [day, month, year] = datePart.split(".").map(Number);
    const [hours, minutes, seconds] = timePart.split(":").map(Number);
    const fullYear = year < 100 ? 2000 + year : year;
    timestamp = new Date(fullYear, month - 1, day, hours, minutes, seconds).getTime();
  }

  const attackerEl = doc.querySelector(".role.attacker");
  const defenderEl = doc.querySelector(".role.defender");

  const attacker = attackerEl ? parsePlayerVillage(attackerEl, "attacker") : null;
  const defender = defenderEl ? parsePlayerVillage(defenderEl, "defender") : null;

  // carry для атакующего
  let carry: Carry = { current: 0, max: 0 };
  if (attackerEl) {
    const carryText = attackerEl.querySelector(".carry .value")?.textContent ?? null;
    carry = parseCarry(carryText);
    if (attacker) attacker.carry = carry;
  }

  return {
    id,
    timestamp,
    attacker: attacker!,
    defender: defender!,
  };
}

export function extractReportIds(htmlString: string): string[] {
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlString, "text/html");

  const tbody = doc.querySelector("tbody");
  if (!tbody) return [];

  const inputs = tbody.querySelectorAll<HTMLInputElement>("input.check.report");

  return Array.from(inputs, (input) => input.value);
}
