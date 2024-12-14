import { apiMapPosition, apiProfile } from "../client";
import { getAllPositions } from "./map";

window.searchPlayers = async (pos) => {
  const positions = pos ? pos : getAllPositions({ size: 401, step: 31 });
  if (!positions) return;

  const uids = new Set<number>();

  for (let i = 0; i < positions?.length; i++) {
    const res = await apiMapPosition(positions[i]);
    res.forEach((tile) => {
      if (tile.uid && !tile.aid && tile.uid !== 1) {
        uids.add(tile.uid);
      }
    });
  }

  const uidsArr = Array.from(uids);
  console.log("users: ", uidsArr.length);

  const profiles: any[] = [];
  for (let i = 0; i < uidsArr.length; i++) {
    const html = await apiProfile(uidsArr[i]);
    const fromRu = html.match(/"language":"ru-/g)?.length;
    if (fromRu) {
      profiles.push(`http://${location.host}/profile/${uidsArr[i]}`);
    }
  }

  return profiles;
};
