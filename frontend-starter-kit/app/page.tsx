'use client';

import { Stack } from '@xsolla-zk/react';
import ProfileHeader from '~/components/profile/header';
import { WalletConnectButton } from '~/components/web3/wallet-connect-button';

export default function HomeScreen() {
  return (
    <Stack flexDirection="column" paddingHorizontal={40} paddingTop={40}>
      <ProfileHeader />
      <Stack marginVertical="$space.400" alignItems="center">
        <WalletConnectButton />
      </Stack>
    </Stack>
  );
}
