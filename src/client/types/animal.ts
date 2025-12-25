export type AnimalTypeId = 31 | 32 | 33 | 34 | 35 | 36 | 37 | 38 | 39 | 40;

export interface AnimalUnit {
  /** ID животного (31–40) */
  typeId: AnimalTypeId;

  /** Название животного */
  name: string;

  /** Защита от пехоты */
  infantryDefense: number;

  /** Защита от кавалерии */
  cavalryDefense: number;

  /** Стоимость / ресурсы */
  resources: number;
}

export const ANIMALS: Record<AnimalTypeId, AnimalUnit> = {
  31: {
    typeId: 31,
    name: "Крыса",
    infantryDefense: 25,
    cavalryDefense: 20,
    resources: 160,
  },
  32: {
    typeId: 32,
    name: "Паук",
    infantryDefense: 35,
    cavalryDefense: 40,
    resources: 160,
  },
  33: {
    typeId: 33,
    name: "Змея",
    infantryDefense: 40,
    cavalryDefense: 60,
    resources: 160,
  },
  34: {
    typeId: 34,
    name: "Летучая мышь",
    infantryDefense: 66,
    cavalryDefense: 50,
    resources: 160,
  },
  35: {
    typeId: 35,
    name: "Кабан",
    infantryDefense: 70,
    cavalryDefense: 33,
    resources: 320,
  },
  36: {
    typeId: 36,
    name: "Волк",
    infantryDefense: 80,
    cavalryDefense: 70,
    resources: 320,
  },
  37: {
    typeId: 37,
    name: "Медведь",
    infantryDefense: 140,
    cavalryDefense: 200,
    resources: 480,
  },
  38: {
    typeId: 38,
    name: "Крокодил",
    infantryDefense: 380,
    cavalryDefense: 240,
    resources: 480,
  },
  39: {
    typeId: 39,
    name: "Тигр",
    infantryDefense: 170,
    cavalryDefense: 250,
    resources: 480,
  },
  40: {
    typeId: 40,
    name: "Слон",
    infantryDefense: 440,
    cavalryDefense: 520,
    resources: 800,
  },
};
