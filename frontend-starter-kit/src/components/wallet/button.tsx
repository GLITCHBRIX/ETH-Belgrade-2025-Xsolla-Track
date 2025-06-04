'use client';

import { Face, Wallet, ChevronDown } from '@xsolla-zk/icons';
import { RichIcon, Stack, Button, Typography } from '@xsolla-zk/react';
import { useAccount } from 'wagmi';
import { useModal } from 'connectkit';

export default function WalletButton() {
  const { isConnected, address } = useAccount();
  const { setOpen } = useModal();

  const formatAddress = (addr: string) => {
    if (!addr) return '';
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const handleWalletClick = () => {
    setOpen(true);
  };

  return (
    <Stack
      flexDirection="row"
      flexShrink={0}
      alignItems="center"
      justifyContent="flex-start"
      gap={10}
    >
      <RichIcon onPress={() => console.log('Connect other account')}>
        <RichIcon backgroundColor="$overlay.neutral" padding="$100" shape="squircle">
          <RichIcon size="$400" shape="squircle" backgroundColor="$background.brand-extra-high">
            <RichIcon size="$400" shape="squircle" backgroundColor="$background.brand-extra-high">
              <RichIcon.Icon icon={Face} color="$content.on-brand-extra" size="$200" />
            </RichIcon>
          </RichIcon>
        </RichIcon>
      </RichIcon>

      <Stack
        flexDirection="row"
        onPress={handleWalletClick}
        gap={8}
        background="transparent"
        alignItems="center"
        backgroundColor="$overlay.neutral"
        padding={4}
        borderRadius={16}
      >
        <RichIcon size="$400" shape="squircle" backgroundColor="$background.brand-extra-high">
          <RichIcon size="$300" shape="squircle" backgroundColor="$background.brand-extra-high">
            <RichIcon.Icon icon={Wallet} color="$content.on-brand-extra" size="$200" />
          </RichIcon>
        </RichIcon>

        {isConnected && address && (
          <>
            <Typography preset="text.300.default">{formatAddress(address)}</Typography>
            <ChevronDown />
          </>
        )}
      </Stack>
    </Stack>
  );
}
