import { createPortal } from "./tools";
import "./style.css";
import { FC, useState } from "react";
import { createRoot } from "react-dom/client";
import React from "react";
import { OasisFarmer } from "./components/oasis-farmer";
import { Tabs } from "./ui/tabs";
import { AppContainer } from "./styles";
import { Farmlist } from "./components/farmlist";
import { FarmSearch } from "./components/farm-search";
import { Settings } from "./components/settings";

console.log("Travian bot started!");

const portal = createPortal("travianBot");
const root = createRoot(portal);

export const CURRENT_NATION = 0;
export const STORAGE_NAME = "bot-farm-list";

type Page = "oasis" | "farm" | "searchFarm" | "settings";

const App: FC = () => {
  const [page, setPage] = useState<Page>("oasis");

  return (
    <AppContainer>
      <Tabs
        items={[
          { id: "oasis", title: "Оазисы", styles: { background: "#71ff39" } },
          { id: "farm", title: "Фармлист", styles: { background: "#ff39f5" } },
          { id: "searchFarm", title: "Поиск", styles: { background: "#395dff" } },
          { id: "settings", title: "Настр." },
        ]}
        selected={page}
        onChange={setPage}
      />
      {page === "oasis" && <OasisFarmer />}
      {page === "farm" && <Farmlist />}
      {page === "searchFarm" && <FarmSearch />}
      {page === "settings" && <Settings />}
    </AppContainer>
  );
};

root.render(<App />);
