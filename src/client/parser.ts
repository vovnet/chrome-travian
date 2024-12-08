export const isFailedLastAttack = (html: string) => {
  const warning = html.match(/iReport\d/g);
  return warning?.[0] === "iReport2" || warning?.[0] === "iReport3";
};

export const lastLootedResources = (html: string) => {
  return html.match(/\d+\/\d+/g)?.[0];
};
