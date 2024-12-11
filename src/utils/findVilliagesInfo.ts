export const findVilliagesInfo = () => {
  const currentVillageId = Number(
    document.querySelector(".villageInput")?.getAttribute("data-did")
  );

  const villiages = new Map<number, { id: number; x: string; y: string }>();

  document.querySelectorAll("[data-did][data-x][data-y]").forEach((v) => {
    const id = Number(v.getAttribute("data-did"));
    const x = v.getAttribute("data-x");
    const y = v.getAttribute("data-y");
    if (id && x !== null && y !== null) {
      villiages.set(id, { id, x, y });
    }
  });

  return { currentVillageId, villiages };
};
