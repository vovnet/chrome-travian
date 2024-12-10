import React, { FC } from "react";
import { Typography } from "../../ui/text";
import { useNation } from "../../hooks/use-nation";
import { Nations } from "../../utils/unit";
import { Layout } from "../../ui/layout";

export const Settings: FC = () => {
  const { nation, changeNation } = useNation();
  return (
    <Layout title={<Typography size="large">{chrome.i18n.getMessage("settingsTitle")}</Typography>}>
      <select value={nation} onChange={(e) => changeNation(Number(e.target.value) as Nations)}>
        <option value="">{chrome.i18n.getMessage("selectNation")}</option>
        <option value={0}>{chrome.i18n.getMessage("romans")}</option>
        <option value={1}>{chrome.i18n.getMessage("germans")}</option>
        <option value={2}>{chrome.i18n.getMessage("gauls")}</option>
      </select>
    </Layout>
  );
};
