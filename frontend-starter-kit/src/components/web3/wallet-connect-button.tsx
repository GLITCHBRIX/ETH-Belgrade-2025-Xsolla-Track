'use client';

import { ConnectKitButton } from 'connectkit';
import { useAccount } from 'wagmi';

export const WalletConnectButton = () => {
  const { address } = useAccount();

  return <ConnectKitButton />;
};
