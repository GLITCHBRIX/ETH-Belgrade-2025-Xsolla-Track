'use client';

import { Image } from '@tamagui/image-next';
import { Cross, Plus, Checkmark } from '@xsolla-zk/icons';
import {
  Button,
  Cell,
  Dialog,
  List,
  NavBar,
  RichIcon,
  SemanticText,
  Stack,
  Typography,
} from '@xsolla-zk/react';
import { PropsWithChildren, useState } from 'react';
import { GAME_NFT_CONTRACT_ADDRESS, usePlayer } from '~/providers/player-context';
import { Linking } from 'react-native';

export default function NFTList() {
  const playerContext = usePlayer();

  return (
    <Stack
      flex={1}
      flexDirection="column"
      width="100%"
      alignItems="flex-start"
      justifyContent="flex-start"
      alignContent="flex-start"
      overflow="hidden"
      paddingTop={10}
    >
      <Typography preset="display.400.accent">Available for mint NFTs</Typography>
      <Stack
        flexDirection="row"
        gap={15}
        alignItems="flex-start"
        alignContent="flex-start"
        justifyContent="flex-start"
        flexWrap="wrap"
        width="100%"
        overflow="scroll"
        scrollbarWidth="none"
      >
        {playerContext.availableNFTs.map((card) => (
          <Modal
            key={card.pk}
            pk={card.pk}
            isLoading={playerContext.isLoading}
            isMinted={false}
            title={card.name}
            collection="Minecraft"
            description={card.description}
            image={card.image}
            handleMint={playerContext.mintNFT}
          >
            <Stack
              flexDirection="column"
              width={204}
              alignItems="center"
              justifyContent="center"
              padding={15}
              gap={12}
            >
              <Image src={card.image} height={200} width={200} />

              <Cell withBoard width={200} height={60}>
                <Cell.Content>
                  <List>
                    <List.Row>
                      <List.Title
                        preset="compact.300.accent"
                        maxWidth={150}
                        numberOfLines={1}
                        ellipsizeMode="tail"
                      >
                        {card.name}
                      </List.Title>
                      <List.TitleValue
                        preset="compact.300.numeric"
                        color="$content.brand-extra-tertiary"
                      >
                        Mint
                      </List.TitleValue>
                    </List.Row>
                    <List.Row>
                      <List.SubtitleValue>Minecraft</List.SubtitleValue>
                    </List.Row>
                  </List>
                </Cell.Content>
              </Cell>
            </Stack>
          </Modal>
        ))}
      </Stack>

      <Typography preset="display.400.accent">Owned NFTs</Typography>
      <Stack
        flexDirection="row"
        gap={15}
        alignItems="flex-start"
        alignContent="flex-start"
        justifyContent="flex-start"
        flexWrap="wrap"
        width="100%"
        overflow="scroll"
        scrollbarWidth="none"
      >
        {playerContext.ownedNFTs.map((card) => (
          <Modal
            key={card.pk}
            pk={card.pk}
            isLoading={playerContext.isLoading}
            isMinted={true}
            title={card.name}
            collection="Minecraft"
            description={card.description}
            image={card.image}
            handleMint={playerContext.mintNFT}
          >
            <Stack
              flexDirection="column"
              width={204}
              alignItems="center"
              justifyContent="center"
              padding={15}
              gap={12}
            >
              <Image src={card.image} height={200} width={200} />

              <Cell withBoard width={200} height={60}>
                <Cell.Content>
                  <List>
                    <List.Row>
                      <List.Title
                        preset="compact.300.accent"
                        maxWidth={150}
                        numberOfLines={1}
                        ellipsizeMode="tail"
                      >
                        {card.name}
                      </List.Title>
                      <List.TitleValue
                        preset="compact.300.numeric"
                        color="$content.neutral-tertiary"
                      >
                        Minted
                      </List.TitleValue>
                    </List.Row>
                    <List.Row>
                      <List.SubtitleValue>Minecraft</List.SubtitleValue>
                    </List.Row>
                  </List>
                </Cell.Content>
              </Cell>
            </Stack>
          </Modal>
        ))}
      </Stack>
    </Stack>
  );
}

interface ModalProps {
  pk: number;
  isLoading: boolean;
  isMinted: boolean;
  title: string;
  collection: string;
  description: string;
  image: string;
  handleMint: (nftPk: number) => void;
}

function Modal({
  pk,
  isLoading,
  isMinted,
  children,
  title,
  collection,
  description,
  image,
  handleMint,
}: PropsWithChildren<ModalProps>) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog modal open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild onPress={() => setOpen(true)}>
        {children}
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay
          key="overlay"
          animateOnly={['transform', 'opacity']}
          animation={[
            'medium',
            {
              opacity: {
                overshootClamping: true,
              },
            },
          ]}
          enterStyle={{ opacity: 0 }}
          exitStyle={{ opacity: 0 }}
        />

        <Dialog.Content
          key="content"
          maxWidth={600}
          animateOnly={['transform', 'opacity']}
          animation={[
            'medium',
            {
              opacity: {
                overshootClamping: true,
              },
            },
          ]}
          enterStyle={{ x: 0, y: -20, opacity: 0 }}
          exitStyle={{ x: 0, y: 10, opacity: 0, scale: 0.95 }}
        >
          <Dialog.Header
            blured
            paddingHorizontal="$platform.layout.margin-horizontal.sm"
            $md={{
              paddingHorizontal: '$platform.layout.margin-horizontal.md',
            }}
            $lg={{
              paddingHorizontal: '$platform.layout.margin-horizontal.lg',
            }}
            $xl={{
              paddingHorizontal: '$platform.layout.margin-horizontal.xl',
            }}
          >
            <Stack flexDirection="row" width="100%" justifyContent="space-between">
              <Typography preset="display.500.accent">{title}</Typography>

              <RichIcon size="$300" pressable onPress={() => setOpen(false)}>
                <RichIcon.Icon icon={Cross} />
              </RichIcon>
            </Stack>
          </Dialog.Header>
          <Dialog.Body
            paddingVertical={20}
            paddingHorizontal="$platform.layout.margin-horizontal.sm"
            $md={{
              paddingHorizontal: '$platform.layout.margin-horizontal.md',
            }}
            $lg={{
              paddingHorizontal: '$platform.layout.margin-horizontal.lg',
            }}
            $xl={{
              paddingHorizontal: '$platform.layout.margin-horizontal.xl',
            }}
          >
            <Stack flexDirection="row" gap={20}>
              <Image src={image} height={160} width={160} />
              <Stack flexDirection="column" alignItems="flex-start" flex={1} maxWidth={160}>
                <SemanticText variant="paragraphM" color="$content.neutral-primary">
                  {collection}
                </SemanticText>
                <List width="100%">
                  <List.Row width="100%">
                    <List.Title preset="compact.350.accent">{title}</List.Title>
                  </List.Row>
                  <List.Row width="100%">
                    <List.Title preset="compact.250.default">{description}</List.Title>
                  </List.Row>
                </List>
              </Stack>
            </Stack>
          </Dialog.Body>
          <Dialog.Footer
            paddingHorizontal="$platform.layout.margin-horizontal.sm"
            $md={{
              paddingHorizontal: '$platform.layout.margin-horizontal.md',
            }}
            $lg={{
              paddingHorizontal: '$platform.layout.margin-horizontal.lg',
            }}
            $xl={{
              paddingHorizontal: '$platform.layout.margin-horizontal.xl',
            }}
          >
            {isMinted ? (
              <Button
                onPress={() =>
                  Linking.openURL(`https://x.la/explorer/address/${GAME_NFT_CONTRACT_ADDRESS}`)
                }
                size="$500"
                backgroundColor="$background.neutral-high"
                marginTop="$space.200"
              >
                <Checkmark />
                <Typography preset="compact.350.accent">View on scanner</Typography>
              </Button>
            ) : (
              <Button
                onPress={() => handleMint(pk)}
                disabled={isLoading}
                size="$500"
                variant="primary"
                marginTop="$space.200"
              >
                <Plus />
                <Typography preset="compact.350.accent">Mint NFT</Typography>
              </Button>
            )}
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog>
  );
}
