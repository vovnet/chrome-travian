import React, { FC } from "react";
import { Typography } from "../../ui/text";
import { useNation } from "../../hooks/use-nation";
import { Nations } from "../../utils/unit";
import { Layout } from "../../ui/layout";
import { Flex } from "../../ui/flex";
import { CakeIcon } from "../../icons/cake-icon";
import styled from "@emotion/styled";

export const Settings: FC = () => {
  const { nation, changeNation } = useNation();
  return (
    <Layout title={<Typography size="large">{chrome.i18n.getMessage("settingsTitle")}</Typography>}>
      <Flex flexDirection="column" gap={12}>
        <select value={nation} onChange={(e) => changeNation(Number(e.target.value) as Nations)}>
          <option value="">{chrome.i18n.getMessage("selectNation")}</option>
          <option value={0}>{chrome.i18n.getMessage("romans")}</option>
          <option value={1}>{chrome.i18n.getMessage("germans")}</option>
          <option value={2}>{chrome.i18n.getMessage("gauls")}</option>
        </select>
        <DonationContainer>
          <Flex justifyContent="center" alignItems="center" gap={8}>
            <CakeIcon />
            <Typography size="large">{chrome.i18n.getMessage("donationTitle")}</Typography>
          </Flex>
          {chrome.i18n.getMessage("donationText")}
          <Typography>5536 9140 2795 1791 - {chrome.i18n.getMessage("author")}</Typography>
        </DonationContainer>
      </Flex>
    </Layout>
  );
};

const DonationContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  max-width: 300px;
`;
