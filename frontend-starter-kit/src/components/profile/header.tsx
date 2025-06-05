'use client';

import { Separator, Stack, Typography } from '@xsolla-zk/react';

export default function ProfileHeader() {
  return (
    <Stack width="100%" gap={10}>
      <Stack flexDirection="row" alignItems="baseline">
        <Typography preset="display.450.default">Welcome, </Typography>
        <Typography preset="display.450.default" color="$background.brand-extra-high">
          player.
        </Typography>
      </Stack>
      <Separator />
      <Typography preset="text.300.default" paddingTop={10}>
        Start syncing your in-game assets.
      </Typography>
    </Stack>
  );
}
