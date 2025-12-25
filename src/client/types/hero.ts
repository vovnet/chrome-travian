export type Gender = "male" | "female";

export type ItemPlace = "inventory" | "bag" | "horse";

export type ItemRarity = "none" | "common" | "uncommon" | "rare" | "epic" | "legendary";

export interface ItemAttribute {
  description: string;
  descriptionDetails: string | null;
}

export interface ClickShortDescription {
  icon: string;
  text: string;
}

export interface Item {
  id: number;
  typeId: number;
  name: string;

  placeId: number;
  place: ItemPlace;
  slot: string;

  amount: number;

  isConsumable: boolean;
  isUsableIfDead: boolean;

  attributes: ItemAttribute[];

  quality: number;
  rarity: ItemRarity;

  canBeUsed: boolean;

  popupMessage: string | null;
  errorMessage: string | null;
  tooltipErrorMessage: string | null;
  warningMessage: string | null;

  maxInput: number;
  minInput: number;
  defaultInput: number;

  alreadyEquipped: number | null;
  isEquipped: boolean;

  canBeClicked: boolean;
  clickShortDescription: ClickShortDescription;
}

export interface Village {
  id?: number;
  mapId?: number;
  name: string;
  type?: number;
  loyalty?: number;
}

export interface HeroStatus {
  status: number;

  inVillage: Village | null;
  inOasis: unknown | null;

  arrivalAt: string | null;
  arrivalIn: number | null;
  onWayTo: unknown | null;
}

export interface HeroState {
  isRegenerating: boolean;
  regenerationTimeLeft: number | null;

  homeVillage: {
    name: string;
    loyalty: number;
  };

  status: HeroStatus;
}

export interface HeroCommonData {
  experiencePerScroll: number;
  experienceBonus: number;
  currentExperience: number;

  heroHomeVillageLoyalty: number;
  heroHomeVillageName: string;

  loyaltyPerTablet: number;

  activeVillageID: number;
  activeVillageName: string;

  currentHealth: number;
  healthDelta: number;
  fullHealth: number;

  isSitter: boolean;
}

export interface HeroResponse {
  imageHash: string;
  gender: Gender;

  itemsInventory: Item[];
  itemsEquipped: Item[];

  heroState: HeroState;
  commonData: HeroCommonData;
}
