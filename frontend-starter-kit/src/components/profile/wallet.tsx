'use client';

import { Image } from '@tamagui/image-next';
import { Wallet } from '@xsolla-zk/icons';
import { Button, Separator, Stack, Typography } from '@xsolla-zk/react';
import { useModal } from 'connectkit';

export default function ConnectWalletPage() {
  const { setOpen } = useModal();

  const handleWalletClick = () => {
    setOpen(true);
  };

  return (
    <Stack flex={1} width="100%" alignItems="center" justifyContent="center">
      <Stack
        flexDirection="column"
        height={378}
        width={296}
        borderRadius={20}
        borderWidth={2}
        borderColor="#6939F91F"
        alignItems="center"
        justifyContent="center"
        gap={10}
      >
        <Image src="/wallet.png" height={200} width={200} />
        <Typography preset="display.400.default">Connect your wallet</Typography>
        <Stack width={200}>
          <Separator weight="$stroke.100" />
        </Stack>
        <Button onPress={handleWalletClick} height={40} width="100%" maxW={220} marginTop={10}>
          <Wallet />
          <Typography preset="compact.250.accent">Connect wallet</Typography>
        </Button>
      </Stack>
    </Stack>
  );
}
