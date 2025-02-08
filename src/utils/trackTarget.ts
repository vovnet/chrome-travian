import { apiTileDetails } from "../client";

window.trackTarget = async (pos) => {
  console.log("Start tracking: ", pos);
  setInterval(async () => {
    const tileData = await apiTileDetails(pos);
    const isActive = !!tileData.match(/eventType=5/g)?.length;
    console.log("is active: ", isActive);
    if (isActive) {
      const permissions = await Notification.requestPermission();
      if (permissions === "granted") {
        new Notification("Active!", { body: "Target is active!" });
      }
      // chrome.notifications.create({
      //   type: "basic",
      //   title: "Active!",
      //   message: "Target is active!",
      //   iconUrl: "",
      // });
    }
  }, 30000);
};
