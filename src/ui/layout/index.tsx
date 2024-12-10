import React, { FC, ReactNode } from "react";
import { Flex } from "../flex";
import styled from "@emotion/styled";

type LayoutProps = {
  title?: ReactNode;
  children?: ReactNode;
};

export const Layout: FC<LayoutProps> = ({ title, children }) => {
  return (
    <Container>
      <Flex alignItems="center" justifyContent="center">
        {title}
      </Flex>
      {children}
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
  padding: 12px;
  gap: 12px;
`;
