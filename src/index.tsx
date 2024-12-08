import { createPortal } from "./tools";
import { FC, useState } from "react";
import { createRoot } from "react-dom/client";
import React from "react";
import { OasisFarmer } from "./components/oasis-farmer";
import { Tabs } from "./ui/tabs";
import { AppContainer } from "./styles";
import { Farmlist } from "./components/farmlist";
import { FarmSearch } from "./components/farm-search";
import { Settings } from "./components/settings";
import "./style.css";
import { Find15 } from "./components/find-15";
import { GlobalStyles } from "./variables/global-styles";

console.log("Travian bot started!");

const portal = createPortal("travianBot");
const root = createRoot(portal);

export const CURRENT_NATION = 0;
export const STORAGE_NAME = "bot-farm-list";

type Page = "oasis" | "farm" | "searchFarm" | "15" | "settings";

const App: FC = () => {
  const [page, setPage] = useState<Page>("oasis");

  return (
    <>
      <GlobalStyles />
      <AppContainer>
        <Tabs
          items={[
            { id: "oasis", title: chrome.i18n.getMessage("oases") },
            { id: "farm", title: chrome.i18n.getMessage("farmlist") },
            { id: "searchFarm", title: chrome.i18n.getMessage("farmSearch") },
            { id: "15", title: chrome.i18n.getMessage("crop") },
            { id: "settings", title: chrome.i18n.getMessage("settings") },
          ]}
          selected={page}
          onChange={setPage}
        />
        {page === "oasis" && <OasisFarmer />}
        {page === "farm" && <Farmlist />}
        {page === "searchFarm" && <FarmSearch />}
        {page === "settings" && <Settings />}
        {page === "15" && <Find15 />}
      </AppContainer>
    </>
  );
};

root.render(<App />);
