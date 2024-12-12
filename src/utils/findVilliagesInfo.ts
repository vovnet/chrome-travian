export const findVilliagesInfo = () => {
  const currentVillageId = Number(
    document.querySelector(".villageInput")?.getAttribute("data-did")
  );

  const villiages = new Map<number, { id: number; x: string; y: string }>();

  const multipleVilliages = document.querySelectorAll("[data-did][data-x][data-y]");
  if (multipleVilliages.length) {
    multipleVilliages.forEach((v) => {
      const id = Number(v.getAttribute("data-did"));
      const x = v.getAttribute("data-x");
      const y = v.getAttribute("data-y");
      if (id && x !== null && y !== null) {
        villiages.set(id, { id, x, y });
      }
    });
  } else {
    const textX = document.querySelector(".coordinateX")?.textContent;
    const textY = document.querySelector(".coordinateY")?.textContent;
    const id = currentVillageId;
    if (!textX || !textY) {
      throw new Error("Not found coordinates!");
    }
    const x = getCoordinateFromString(textX);
    const y = getCoordinateFromString(textY);
    villiages.set(id, { id, x, y });
  }

  return { currentVillageId, villiages };
};

function getCoordinateFromString(coord: string) {
  const num = coord.match(/\d+/g)?.[0];
  if (num === undefined) {
    throw new Error("Coordinates not found!");
  }
  return coord.length - num.length > 3 ? `-${num}` : num;
}
