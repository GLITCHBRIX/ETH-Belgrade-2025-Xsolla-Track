'use client';

import React from 'react';
import { Stack, SemanticText, Input, Button } from '@xsolla-zk/react';
import { ConnectKitButton } from 'connectkit';
import { usePlayer } from '../../src/providers/player-context';
import { ContentStack } from '../../src/components/stacks/content-stack';
import { Card } from '../../src/components/card/card';

export default function TestPage() {
  const playerContext = usePlayer();
  const [customPlayerId, setCustomPlayerId] = React.useState('');
  const [inputError, setInputError] = React.useState('');

  // Handler for registering player
  const handleRegisterPlayer = () => {
    if (!playerContext.address) {
      console.error('No wallet address available. Connect wallet first.');
      return;
    }

    if (!customPlayerId.trim()) {
      setInputError('Player ID is required');
      return;
    }

    setInputError('');
    playerContext.registerPlayer(playerContext.address, customPlayerId);
  };

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
            This page shows the current state of the player context and allows you to connect your
            wallet
          </SemanticText>
        </ContentStack>
      </Stack>

      {/* Wallet Connect Button */}
      <Stack marginVertical="$space.400" alignItems="center">
        <ConnectKitButton />
      </Stack>

      {/* Registration Section - Only show if wallet connected but player not registered */}
      {playerContext.address && !playerContext.isAuthenticated && (
        <Stack
          gap="$space.300"
          marginVertical="$space.400"
          padding="$space.300"
          borderWidth="$stroke.100"
          borderColor="$border.neutral-secondary"
          borderRadius="$radius.550"
        >
          <SemanticText variant="headerXs">Register Player</SemanticText>

          <Input
            placeholder="Enter Player ID (required)"
            value={customPlayerId}
            onChangeText={(text) => {
              setCustomPlayerId(text);
              if (text.trim()) setInputError('');
            }}
            size="$500"
            marginBottom="$space.200"
          />

          {inputError && (
            <SemanticText
              variant="paragraphS"
              color="$content.critical-tertiary"
              marginBottom="$space.200"
            >
              {inputError}
            </SemanticText>
          )}

          <Button
            onPress={handleRegisterPlayer}
            disabled={playerContext.isLoading || !customPlayerId.trim()}
            size="$500"
            variant="primary"
          >
            Register Player
          </Button>

          {playerContext.error && (
            <SemanticText variant="paragraphS" color="$content.critical-tertiary">
              {playerContext.error}
            </SemanticText>
          )}
        </Stack>
      )}

      {/* Player Context State Display */}
      <Stack gap="$space.400" marginTop="$space.400">
        <SemanticText variant="headerXs">Player Context State:</SemanticText>

        <Card>
          <Stack gap="$space.200" padding="$space.200">
            <StateItem
              label="Is Authenticated"
              value={playerContext.isAuthenticated ? 'Yes' : 'No'}
            />
            <StateItem label="Address" value={playerContext.address || 'Not connected'} />
            <StateItem label="Player ID" value={playerContext.playerId || 'Not available'} />
            <StateItem label="Is Loading" value={playerContext.isLoading ? 'Yes' : 'No'} />
            <StateItem label="Error" value={playerContext.error || 'None'} />
            <StateItem
              label="Available NFTs"
              value={`${playerContext.availableNFTs.length} NFTs`}
            />
            <StateItem label="Owned NFTs" value={`${playerContext.ownedNFTs.length} NFTs`} />
          </Stack>
        </Card>

        {/* Display NFTs if available */}
        {playerContext.ownedNFTs.length > 0 && (
          <>
            <SemanticText variant="headerXs" marginTop="$space.400">
              Owned NFTs:
            </SemanticText>
            <Stack gap="$space.200">
              {playerContext.ownedNFTs.map((nft) => (
                <Card key={nft.pk.toString()}>
                  <Stack padding="$space.200">
                    <SemanticText variant="paragraphM" fontWeight="$weight.600">
                      {nft.name}
                    </SemanticText>
                    <SemanticText variant="paragraphS">ID: {nft.pk}</SemanticText>
                    <SemanticText variant="paragraphS">Token ID: {nft.tokenId}</SemanticText>
                    {nft.description && (
                      <SemanticText variant="paragraphS">
                        Description: {nft.description}
                      </SemanticText>
                    )}
                  </Stack>
                </Card>
              ))}
            </Stack>
          </>
        )}

        {/* Display available NFTs if any */}
        {playerContext.availableNFTs.length > 0 && (
          <>
            <SemanticText variant="headerXs" marginTop="$space.400">
              Available NFTs:
            </SemanticText>
            <Stack gap="$space.200">
              {playerContext.availableNFTs.map((nft) => (
                <Card key={nft.pk.toString()}>
                  <Stack padding="$space.200">
                    <SemanticText variant="paragraphM" fontWeight="$weight.600">
                      {nft.name}
                    </SemanticText>
                    <SemanticText variant="paragraphS">ID: {nft.pk}</SemanticText>
                    <SemanticText variant="paragraphS">Token ID: {nft.tokenId}</SemanticText>
                    {nft.description && (
                      <SemanticText variant="paragraphS">
                        Description: {nft.description}
                      </SemanticText>
                    )}
                    <Button
                      onPress={() => playerContext.mintNFT(nft.pk)}
                      disabled={playerContext.isLoading}
                      size="$500"
                      variant="primary"
                      marginTop="$space.200"
                    >
                      Mint NFT
                    </Button>
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
      <SemanticText variant="paragraphS" fontWeight="$weight.600">
        {label}:
      </SemanticText>
      <SemanticText
        variant="paragraphS"
        numberOfLines={1}
        ellipsizeMode="middle"
        style={{ maxWidth: '60%' }}
      >
        {value}
      </SemanticText>
    </Stack>
  );
}
