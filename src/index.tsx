import { createPortal } from "./tools";
import { FC, useLayoutEffect, useState } from "react";
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
import styled from "@emotion/styled";
import { SettingsIcon } from "./icons/settings-icon";
import { findVilliagesInfo } from "./utils/findVilliagesInfo";
import { Waves } from "./components/waves";
import { WriteMessage } from "./components/write-message";
import { Autofarm } from "./components/autofarm";
import { Reports } from "./components/reports";

export const { currentVillageId, villiages: userVilliages } = findVilliagesInfo();

console.log("Travian bot started!", { currentVillageId, userVilliages });

const portal = createPortal("travianBot");
const root = createRoot(portal);

export const CURRENT_NATION = 0;
export const STORAGE_NAME = "bot-farm-list";
export const LAST_TAB = "bot-last-opened-tab";

type Page =
  | "oasis"
  | "farm"
  | "searchFarm"
  | "15"
  | "settings"
  | "waves"
  | "auto"
  | "spam"
  | "reports";

const App: FC = () => {
  const [page, setPage] = useState<Page>("settings");

  useLayoutEffect(() => {
    const lastTab = (localStorage.getItem(LAST_TAB) as Page) || "settings";
    setPage(lastTab);
  }, []);

  const changeTabHandler = (tab: string) => {
    setPage(tab as Page);
    localStorage.setItem(LAST_TAB, tab);
  };

  return (
    <>
      <GlobalStyles />
      <AppContainer>
        <Tabs
          items={[
            { id: "oasis", title: chrome.i18n.getMessage("oases") },
            { id: "farm", title: chrome.i18n.getMessage("farmlist") },
            { id: "searchFarm", title: chrome.i18n.getMessage("farmSearch") },
            { id: "waves", title: chrome.i18n.getMessage("waves") },
            { id: "15", title: chrome.i18n.getMessage("crop") },
            { id: "auto", title: "Autofarm" },
            { id: "reports", title: "Reports" },
            { id: "spam", title: "Spam" },
            {
              id: "settings",
              title: (
                <IconWrapper>
                  <SettingsIcon />
                </IconWrapper>
              ),
            },
          ]}
          selected={page}
          onChange={changeTabHandler}
        />
        {page === "oasis" && <OasisFarmer />}
        {page === "farm" && <Farmlist />}
        {page === "searchFarm" && <FarmSearch />}
        {page === "settings" && <Settings />}
        {page === "15" && <Find15 />}
        {page === "waves" && <Waves />}
        {page === "auto" && <Autofarm />}
        {page === "reports" && <Reports />}
        {page === "spam" && <WriteMessage />}
      </AppContainer>
    </>
  );
};

root.render(<App />);

//////// Styles
const IconWrapper = styled.div`
  display: flex;
  justify-content: center;

  & svg {
    width: 14px;
    height: 14px;
  }
`;
