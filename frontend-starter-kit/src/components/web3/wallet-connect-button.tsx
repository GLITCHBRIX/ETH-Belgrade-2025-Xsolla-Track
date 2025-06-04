'use client';
//TODO This component needs to be deleted later, because it's only for testing purposes.


import { ConnectKitButton } from 'connectkit';
import { useEffect, useRef } from 'react';
import { useAccount } from 'wagmi';
import { usePlayer } from '~/providers/player-context';

export const WalletConnectButton = () => {
  const { address } = useAccount();
  const { getPlayer } = usePlayer();
  const previousAddressRef = useRef<string | undefined>(undefined);

  // When address changes (user connects wallet), update player context
  useEffect(() => {
    console.log('Address changed in WalletConnectButton:', address);
    
    // Only call getPlayer when address changes from undefined to defined (wallet connected)
    // or when address changes to a different address
    if (address && address !== previousAddressRef.current) {
      console.log('Calling getPlayer with address:', address);
      getPlayer(address).catch(console.error);
    }
    
    // Update the ref for next comparison
    previousAddressRef.current = address;
  }, [address, getPlayer]);

  return <ConnectKitButton />;
};
