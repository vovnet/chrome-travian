import React, { FC, useLayoutEffect, useState } from "react";
import { Layout } from "../../ui/layout";
import { Typography } from "../../ui/text";
import { Flex } from "../../ui/flex";
import { Button } from "../../ui/button";
import { apiStatistics, apiWriteMessage } from "../../client";
import { sleep } from "../../utils";

const SPAM_LAST_PAGE = "spamLastPage";

export const WriteMessage: FC = () => {
  const [loading, setLoading] = useState(false);
  const [sended, setSended] = useState(0);
  const [page, setPage] = useState(1);

  useLayoutEffect(() => {
    const page = Number(localStorage.getItem(SPAM_LAST_PAGE) || 1);
    setPage(page);
  }, []);

  const send = async (players: string[], formData: FormData) => {
    for (let i = 0; i < players?.length; i++) {
      formData.set("an", players[i]);
      await apiWriteMessage(formData);
      setSended((prev) => prev + 1);
      await sleep(1000);
    }
  };

  return (
    <Layout title={<Typography size="large">Spam</Typography>}>
      <div>Sended: {sended}</div>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          const formData = new FormData(e.currentTarget);
          const pages = await getPages();
          for (let i = page; i <= pages; i++) {
            const players = await getPlayers(i);
            await send(players, formData);
            setPage(i);
            localStorage.setItem(SPAM_LAST_PAGE, i.toString());
          }
        }}
      >
        <Flex flexDirection="column" gap={8}>
          <input disabled={loading} type="text" name="be" placeholder="Subject" />
          <textarea disabled={loading} name="message" placeholder="Text..." rows={10} />
          <Button disabled={loading} type="submit">
            Send
          </Button>
        </Flex>
      </form>
    </Layout>
  );
};

const getPages = async () => {
  const stat = await apiStatistics();
  const parser = new DOMParser();
  const text = await stat.text();
  const doc = parser.parseFromString(text, "text/html");
  const link = doc.querySelector(".last") as HTMLLinkElement;
  const pages = Number(link.href.split("=")?.[1]);
  return pages;
};

const getPlayers = async (page: number) => {
  const pageStat = await apiStatistics(page);
  const parser = new DOMParser();
  const text = await pageStat.text();
  const doc = parser.parseFromString(text, "text/html");
  const players = doc.querySelectorAll(".pla");
  const res: string[] = [];
  players.forEach((p) => {
    const a = p.querySelector("a")?.innerText;
    if (a) {
      res.push(a);
    }
  });
  return res;
};
