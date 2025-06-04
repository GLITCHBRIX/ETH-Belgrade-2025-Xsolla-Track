'use client';

import { Separator, Stack, Typography } from '@xsolla-zk/react';

export default function FAQHeader() {
  return (
    <Stack width="100%" gap={10}>
      <Stack flexDirection="row" alignItems="baseline">
        <Typography preset="display.450.default">Turn your game progress into </Typography>
        <Typography preset="display.450.default" color="$background.brand-extra-high">
          real ownership.
        </Typography>
      </Stack>
      <Separator />
      <Typography preset="text.300.default" paddingTop={10}>
        Claim your in-game assets as NFTs and trade them freely.
      </Typography>
    </Stack>
  );
}
