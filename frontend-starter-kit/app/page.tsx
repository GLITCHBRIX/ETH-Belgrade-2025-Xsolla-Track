'use client';

import { Stack } from '@xsolla-zk/react';
import ProfileHeader from '~/components/profile/header';
import NFTList from '~/components/profile/nftlist';
import ConnectUUID from '~/components/profile/uuid';
import ConnectWalletPage from '~/components/profile/wallet';
import { usePlayer } from '~/providers/player-context';

export default function HomeScreen() {
  const playerContext = usePlayer();

  const renderContent = () => {
    if (!playerContext.address) {
      return <ConnectWalletPage />;
    }

    if (playerContext.address && !playerContext.isAuthenticated) {
      return <ConnectUUID />;
    }

    return <NFTList />;
  };

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
      {renderContent()}
    </Stack>
  );
}
