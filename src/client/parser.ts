export const isFailedLastAttack = (html: string) => {
  const warning = html.match(/iReport\d/g);
  return warning?.[0] === "iReport2" || warning?.[0] === "iReport3";
};

export const lastLootedResources = (html: string) => {
  return html.match(/\d+\/\d+/g)?.[0];
};

export const getOasesResources = (html: string) => {
  return html.match(/{a:r\d} {a.r\d} \d+/g)?.map((r) => {
    const arr = r.split(" ");
    if (arr.length < 3) return;
    const className = arr[0].match(/r\d/g)?.[0];
    const value = arr[2];
    return { value, className };
  });
};
