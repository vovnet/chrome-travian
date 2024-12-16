export type Unit = { name: string; type: string };

export type Nations = 0 | 1 | 2;

export type UnitDictionary = {
  "1": Unit;
  "2": Unit;
  "3": Unit;
  "4": Unit;
  "5": Unit;
  "6": Unit;
  "7": Unit;
  "8": Unit;
  "9": Unit;
};

export const UNITS: UnitDictionary[] = [
  {
    "1": { name: "Легионер", type: "u1" },
    "2": { name: "Преторианец", type: "u2" },
    "3": { name: "Империанец", type: "u3" },
    "4": { name: "Конный разведчик", type: "u4" },
    "5": { name: "Конница императора", type: "u5" },
    "6": { name: "Конница цезаря", type: "u6" },
    "7": { name: "Таран", type: "u7" },
    "8": { name: "Огненная катапульта", type: "u8" },
    "9": { name: "Сенатор", type: "u9" },
  },
  {
    "1": { name: "Дубинщик", type: "u11" },
    "2": { name: "Копьеносец", type: "u12" },
    "3": { name: "Топорщик", type: "u13" },
    "4": { name: "Скаут", type: "u14" },
    "5": { name: "Паладин", type: "u15" },
    "6": { name: "Тевтонская конница", type: "u16" },
    "7": { name: "Стенобитное орудие", type: "u17" },
    "8": { name: "Катапульта", type: "u18" },
    "9": { name: "Вождь", type: "u19" },
  },
  {
    "1": { name: "Фаланга", type: "u21" },
    "2": { name: "Мечник", type: "u22" },
    "3": { name: "Следопыт", type: "u23" },
    "4": { name: "Тевтатский гром", type: "u24" },
    "5": { name: "Друид-всадник", type: "u25" },
    "6": { name: "Эдуйская конница", type: "u26" },
    "7": { name: "Таран", type: "u27" },
    "8": { name: "Требушет", type: "u28" },
    "9": { name: "Предводитель", type: "u29" },
  },
];
