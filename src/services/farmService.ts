import { apiTileDetails } from "../client";
import { isFailedLastAttack, lastLootedResources } from "../client/parser";
import { TroopsData } from "../components/troop-form";
import { Farm } from "../types";

export class FarmService {
  private storageKey: string;

  private farms: Set<string> = new Set();
  private lastPosition = 0;

  private troops: TroopsData;

  constructor(storageKey: string, troops: TroopsData) {
    this.storageKey = storageKey;
    this.load();
    this.troops = troops;
  }

  getFarms(): Set<string> {
    return new Set(this.farms);
  }

  async farm() {
    const farmsArray = Array.from(this.farms);
    const startIndex = this.lastPosition < farmsArray.length ? this.lastPosition : 0;
    let count = 0;

    for (let i = startIndex; i < farmsArray.length; i++) {
      const v = farmsArray[i];
      count++;
      console.log("send troop to:", v);

      const [x, y] = v.split("|");
      const html = await apiTileDetails({ x: parseFloat(x), y: parseFloat(y) });

      if (!html.match(/targetMapId=\d*/)) {
        console.log("Wrong village position:", v);
        continue;
      }

      if (isFailedLastAttack(html)) {
        console.log("Last attack failed:", v);
        continue;
      }

      const lastLoot = lastLootedResources(html);
      if (lastLoot) console.log({ v, lastLoot });

      try {
        const formData = troopsDataToFormData(this.troops);
        formData.append("eventType", "4");
        formData.append("x", x);
        formData.append("y", y);
        formData.append("ok", "ok");

        const htmlText = await sendTroops(formData);
        const parsed = parseTroopResponse(htmlText);
        if (!parsed.checksum) {
          throw new Error("Checksum not found in response");
        }
        const sendFormData = createSendFormData(x, y, formData, parsed);

        await fetch("/build.php?gid=16&tt=2", { method: "POST", body: sendFormData });

        this.lastPosition = i;
      } catch (err) {
        console.log("send farm error!", err);
        this.lastPosition = i;
        break;
      }

      if (i === farmsArray.length - 1) this.lastPosition = 0;
    }
    this.save();
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
