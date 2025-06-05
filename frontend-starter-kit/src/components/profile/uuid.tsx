'use client';

import { Image } from '@tamagui/image-next';
import { Face } from '@xsolla-zk/icons';
import {
  Button,
  Input,
  RichIcon,
  SemanticText,
  Separator,
  Stack,
  Typography,
} from '@xsolla-zk/react';
import { useModal } from 'connectkit';
import { useState } from 'react';
import { usePlayer } from '~/providers/player-context';

export default function ConnectUUID() {
  const playerContext = usePlayer();
  const [playerId, setPlayerId] = useState('');
  const [inputError, setInputError] = useState('');

  const handleRegisterPlayer = () => {
    if (!playerContext.address) {
      console.error('No wallet address available');
      return;
    }

    if (!playerId.trim()) {
      setInputError('Player ID is required');
      return;
    }

    setInputError('');
    console.log(playerContext.address);
    console.log(playerId);
    playerContext.registerPlayer(playerContext.address, playerId);
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
        <Image src="/uuid.png" height={200} width={200} />
        <Typography preset="display.400.default">Enter your game UID</Typography>
        <Stack width={200}>
          <Separator weight="$stroke.100" />
        </Stack>
        <Stack flexDirection="row" width={229} alignItems="center" justifyContent="center" gap={5}>
          <Input
            placeholder="UID"
            width={102}
            value={playerId}
            onChangeText={(text) => {
              setPlayerId(text);
              if (text.trim()) setInputError('');
            }}
          >
            <Input.StartSlot>
              <RichIcon shape="squircle" size="$200">
                <RichIcon.Icon icon={Face} />
              </RichIcon>
            </Input.StartSlot>
          </Input>
          <Button onPress={handleRegisterPlayer} height={40}>
            <Typography preset="compact.250.accent">
              {playerContext.isLoading ? 'Loading' : 'Check'}
            </Typography>
          </Button>
        </Stack>
        {inputError && (
          <Stack marginTop={10}>
            <Typography preset="compact.250.default" color="$content.negative-primary">
              {inputError}
            </Typography>
          </Stack>
        )}

        {playerContext.error && (
          <Stack marginTop={10}>
            <Typography preset="compact.250.default" color="$content.negative-primary">
              {playerContext.error}
            </Typography>
          </Stack>
        )}
      </Stack>
    </Stack>
  );
}
