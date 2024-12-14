interface Window {
  searchPlayers: (pos?: { x: number; y: number }[]) => Promise<string[] | undefined>;
}
