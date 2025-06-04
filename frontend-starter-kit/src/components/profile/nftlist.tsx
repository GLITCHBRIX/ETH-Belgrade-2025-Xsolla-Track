'use client';

import { Image } from '@tamagui/image-next';
import { Cross, Plus } from '@xsolla-zk/icons';
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

export default function NFTList() {
  const gameCards = [
    {
      id: 1,
      title: 'Enter UID',
      subtitle: 'Connect game',
      image: '/test.png',
      isMinted: true,
    },
    {
      id: 2,
      title: 'Stats',
      subtitle: 'View stats',
      image: '/test.png',
      isMinted: false,
    },
    {
      id: 3,
      title: 'Controller',
      subtitle: 'Game settings',
      image: '/test.png',
      isMinted: false,
    },
    {
      id: 4,
      title: 'Profile',
      subtitle: 'Update profile',
      image: '/test.png',
      isMinted: false,
    },
    {
      id: 5,
      title: 'Profile',
      subtitle: 'Update profile',
      image: '/test.png',
      isMinted: false,
    },
    {
      id: 6,
      title: 'Profile',
      subtitle: 'Update profile',
      image: '/test.png',
      isMinted: false,
    },
    {
      id: 7,
      title: 'Profile',
      subtitle: 'Update profile',
      image: '/test.png',
      isMinted: false,
    },
    {
      id: 8,
      title: 'Profile',
      subtitle: 'Update profile',
      image: '/test.png',
      isMinted: false,
    },
  ];

  return (
    <Stack
      flex={1}
      width="100%"
      alignItems="flex-start"
      justifyContent="flex-start"
      overflow="hidden"
      paddingTop={10}
    >
      <Stack
        flex={1}
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
        {gameCards.map((card) => (
          <Modal key={card.id} title={card.title} collection={card.subtitle} image={card.image}>
            <Stack
              flexDirection="column"
              width={204}
              alignItems="center"
              justifyContent="center"
              padding={15}
              gap={12}
            >
              <Image src={card.image} height={160} width={160} />

              <Cell withBoard width={160} height={60}>
                <Cell.Content>
                  <List>
                    <List.Row>
                      <List.Title preset="compact.300.accent">{card.title}</List.Title>
                      <List.TitleValue
                        preset="compact.300.numeric"
                        color="$content.neutral-tertiary"
                      >
                        Value
                      </List.TitleValue>
                    </List.Row>
                    <List.Row>
                      <List.SubtitleValue>{card.subtitle}</List.SubtitleValue>
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
  title: string;
  collection: string;
  image: string;
}

function Modal({ children, title, collection, image }: PropsWithChildren<ModalProps>) {
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
              <Stack flexDirection="column" alignItems="flex-start" flex={1}>
                <SemanticText variant="paragraphM" color="$content.neutral-primary">
                  {collection}
                </SemanticText>
                <List width="100%">
                  <List.Row justifyContent="space-between">
                    <List.Title preset="compact.350.accent">{title}</List.Title>
                    <List.TitleValue
                      preset="compact.350.numeric"
                      color="$content.neutral-secondary"
                    >
                      Value
                    </List.TitleValue>
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
            <Button>
              <Plus />
              <Typography preset="compact.350.accent">Mint NFT</Typography>
            </Button>
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog>
  );
}
