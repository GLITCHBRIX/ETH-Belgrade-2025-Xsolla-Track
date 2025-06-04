'use client';

import { Stack } from '@xsolla-zk/react';
import ProfileHeader from '~/components/profile/header';
import NFTList from '~/components/profile/nftlist';
import ConnectUUID from '~/components/profile/uuid';
import ConnectWalletPage from '~/components/profile/wallet';

export default function HomeScreen() {
  return (
    <Stack
      flexDirection="column"
      height="100%"
      flex={1}
      paddingHorizontal={40}
      paddingTop={20}
      alignItems="center"
    >
      <ProfileHeader />
      {/* <ConnectWalletPage /> */}
      {/* <ConnectUUID /> */}
      <NFTList />
    </Stack>
  );
}
