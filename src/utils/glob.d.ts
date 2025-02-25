interface Window {
  searchPlayers: (pos?: { x: number; y: number }[]) => Promise<string[] | undefined>;
  trackTarget: (pos: { x: number; y: number }) => void;
  calcDist: (list: { name: string; x: number; y: number }[]) => {
    a: string;
    b: string;
    dist: number;
  }[];
}
