// POST
// /messages/write
// Form Data
// an: Kingxays
// be: привет
// message: Как дела?

import React, { FC, useState } from "react";
import { Layout } from "../../ui/layout";
import { Typography } from "../../ui/text";
import { Flex } from "../../ui/flex";
import { Button } from "../../ui/button";
import { apiMapPosition, apiWriteMessage } from "../../client";
import { getAllPositions } from "../../utils/map";
import { Tile } from "../../types";

export const WriteMessage: FC = () => {
  const [players, setPlayers] = useState<string[]>();
  const [loading, setLoading] = useState(false);
  const [sended, setSended] = useState(0);

  return (
    <Layout title={<Typography size="large">Spam</Typography>}>
      <div>Found: {players?.length}</div>
      <Button
        disabled={loading}
        onClick={async () => {
          setLoading(true);
          const positions = getAllPositions({ size: 401, step: 31 });
          if (!positions) {
            setLoading(false);
            return;
          }
          let tiles: Tile[] = [];
          for (let i = 0; i < positions?.length; i++) {
            const res = await apiMapPosition(positions[i]);
            tiles = tiles.concat(res);
          }

          const filtered = tiles
            .filter((t) => t.uid)
            .map((t) => {
              const matches = t.text?.match(/spieler} .*<br/g)?.[0];
              const player = matches?.split(" ")?.[1].split("<br")?.[0];
              return player;
            })
            .filter((p) => p !== "Natars");

          const players = new Set(filtered);
          setPlayers(Array.from(players));

          setLoading(false);
        }}
      >
        Find
      </Button>
      <div>Sended: {sended}</div>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          if (!players?.length) {
            return;
          }
          const formData = new FormData(e.currentTarget);
          for (let i = 0; i < players?.length; i++) {
            formData.set("an", players[i]);
            await apiWriteMessage(formData);
            setSended((prev) => prev + 1);
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
