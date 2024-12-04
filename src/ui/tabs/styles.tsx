import styled from "styled-components";

export const Container = styled.div`
  display: flex;
`;

export const Item = styled.div<{ isSelected?: boolean; background?: `#${string}` }>`
  padding: 8px 14px;
  border-bottom: ${(props) => (props.isSelected ? "4px solid #7cb029" : "4px solid transparent")};
  transition: 0.3s;
  background-color: ${(props) => props.background || "#fff"};
  user-select: none;

  &:hover {
    cursor: pointer;
    background-color: #f7ffed;
    border-bottom: 4px solid #b2e066;
  }
`;
