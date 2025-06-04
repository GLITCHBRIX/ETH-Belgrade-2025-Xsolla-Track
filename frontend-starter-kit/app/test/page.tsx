'use client';

import React from 'react';
import { Stack, SemanticText } from '@xsolla-zk/react';
import { usePlayer } from '../../src/providers/player-context';
import { ContentStack } from '../../src/components/stacks/content-stack';
import { Card } from '../../src/components/card/card';
import { WalletConnectButton } from '../../src/components/web3/wallet-connect-button';

export default function TestPage() {
  const playerContext = usePlayer();
  
  return (
    <>
      <Stack
        borderRadius="$radius.550"
        borderColor="$border.neutral-tertiary"
        gap="$space.350"
        borderWidth="$stroke.100"
        paddingVertical="$space.400"
        backgroundColor="$layer.floor-1"
      >
        <ContentStack>
          <SemanticText variant="headerS" textAlign="center">
            Player Context Test Page
          </SemanticText>
          <SemanticText variant="paragraphS" textAlign="center" color="$content.neutral-secondary">
            This page shows the current state of the player context and allows you to connect your wallet
          </SemanticText>
        </ContentStack>
      </Stack>

      {/* Wallet Connect Button */}
      <Stack marginVertical="$space.400" alignItems="center">
        <WalletConnectButton />
      </Stack>

      {/* Player Context State Display */}
      <Stack gap="$space.400" marginTop="$space.400">
        <SemanticText variant="headerXs">Player Context State:</SemanticText>
        
        <Card>
          <Stack gap="$space.200" padding="$space.200">
            <StateItem label="Is Authenticated" value={playerContext.isAuthenticated ? 'Yes' : 'No'} />
            <StateItem label="Address" value={playerContext.address || 'Not connected'} />
            <StateItem label="Player ID" value={playerContext.playerId || 'Not available'} />
            <StateItem label="Is Loading" value={playerContext.isLoading ? 'Yes' : 'No'} />
            <StateItem label="Error" value={playerContext.error || 'None'} />
            <StateItem 
              label="Available NFTs" 
              value={`${playerContext.availableNFTs.length} NFTs`} 
            />
            <StateItem 
              label="Owned NFTs" 
              value={`${playerContext.ownedNFTs.length} NFTs`} 
            />
          </Stack>
        </Card>

        {/* Display NFTs if available */}
        {playerContext.ownedNFTs.length > 0 && (
          <>
            <SemanticText variant="headerXs" marginTop="$space.400">Owned NFTs:</SemanticText>
            <Stack gap="$space.200">
              {playerContext.ownedNFTs.map((nft) => (
                <Card key={nft.id}>
                  <Stack padding="$space.200">
                    <SemanticText variant="paragraphM" fontWeight="$weight.600">{nft.name}</SemanticText>
                    <SemanticText variant="paragraphS">ID: {nft.id}</SemanticText>
                    {nft.metadata && nft.metadata.coordinates && (
                      <SemanticText variant="paragraphS">
                        Coordinates: ({nft.metadata.coordinates.x}, {nft.metadata.coordinates.y})
                      </SemanticText>
                    )}
                  </Stack>
                </Card>
              ))}
            </Stack>
          </>
        )}
      </Stack>
    </>
  );
}

// Helper component to display state items
function StateItem({ label, value }: { label: string; value: string }) {
  return (
    <Stack flexDirection="row" justifyContent="space-between">
      <SemanticText variant="paragraphS" fontWeight="$weight.600">{label}:</SemanticText>
      <SemanticText variant="paragraphS" 
        numberOfLines={1} 
        ellipsizeMode="middle"
        style={{ maxWidth: '60%' }}
      >
        {value}
      </SemanticText>
    </Stack>
  );
} 