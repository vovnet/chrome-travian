export const findVilliagesInfo = () => {
  const villageElements = document.querySelectorAll<HTMLDivElement>('.listEntry.village');

  const villiages = new Map<number, { id: number; x: string; y: string }>();
  let currentVillageId: number | null = null;

  villageElements.forEach((el) => {
    const id = Number(el.dataset.did);
    const xText = el.querySelector('.coordinateX')?.textContent || '';
    const yText = el.querySelector('.coordinateY')?.textContent || '';

    const x = getCoordinateFromString(xText);
    const y = getCoordinateFromString(yText);

    villiages.set(id, { id, x, y });

    if (el.classList.contains('active')) {
      currentVillageId = id;
    }
  });

  return { currentVillageId,  villiages };
};

function getCoordinateFromString(coord: string) {
  // Убираем невидимые символы и математический минус
  let cleaned = coord.replace(/[\u200B-\u200F\u202A-\u202E]/g, '').replace(/\u2212/g, '-');
  const match = cleaned.match(/-?\d+/);
  if (!match) throw new Error('Coordinates not found!');
  return match[0];
}