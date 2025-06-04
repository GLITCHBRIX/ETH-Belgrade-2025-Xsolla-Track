'use client';

import { Stack } from '@xsolla-zk/react';
import ProfileHeader from '~/components/profile/header';
import { ConnectKitButton } from 'connectkit';

export default function HomeScreen() {
  return (
    <Stack flexDirection="column" paddingHorizontal={40} paddingTop={40}>
      <ProfileHeader />
      <Stack marginVertical="$space.400" alignItems="center">
        <ConnectKitButton />
      </Stack>
    </Stack>
  );
}
