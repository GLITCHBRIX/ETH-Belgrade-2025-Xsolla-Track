'use client';

import { Image } from '@tamagui/image-next';
import { Face } from '@xsolla-zk/icons';
import { Button, Input, RichIcon, Separator, Stack, Typography } from '@xsolla-zk/react';
import { useModal } from 'connectkit';

export default function ConnectUUID() {
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
        <Image src="/uuid.png" height={200} width={200} />
        <Typography preset="display.400.default">Enter your game UID</Typography>
        <Stack width={200}>
          <Separator weight="$stroke.100" />
        </Stack>
        <Stack flexDirection="row" width={229} alignItems="center" justifyContent="center" gap={5}>
          <Input placeholder="UID" width={102}>
            <Input.StartSlot>
              <RichIcon shape="squircle" size="$200">
                <RichIcon.Icon icon={Face} />
              </RichIcon>
            </Input.StartSlot>
          </Input>
          <Button onPress={handleWalletClick} height={40}>
            <Typography preset="compact.250.accent">Check</Typography>
          </Button>
        </Stack>
      </Stack>
    </Stack>
  );
}
