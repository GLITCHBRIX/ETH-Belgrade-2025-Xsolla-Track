'use client';

import { Image } from '@tamagui/image-next';
import { Gamepad, Bag, Wallet, Plus, Repeat } from '@xsolla-zk/icons';
import {
  Button,
  Cell,
  Input,
  List,
  RichIcon,
  Separator,
  Stack,
  Typography,
} from '@xsolla-zk/react';
import { useModal } from 'connectkit';
import { NamedExoticComponent } from 'react';

export default function FAQContent() {
  const faqCards = [
    {
      id: 1,
      title: '1. Play the Game',
      subtitle: 'Explore and build inside your favorite Minecraft server.',
      Icon: Gamepad,
    },
    {
      id: 2,
      title: '2. Privatize Land',
      subtitle: 'Use the in-game command to mark your territory.',
      Icon: Bag,
    },
    {
      id: 3,
      title: 'Connect Here',
      subtitle: 'Enter your in-game nickname (UID) and wallet to sync assets.',
      Icon: Wallet,
    },
    {
      id: 4,
      title: 'Mint NFT',
      subtitle: 'Turn your land into a tradable NFT on Xsolla ZK.',
      Icon: Plus,
    },
    {
      id: 5,
      title: 'Keep it Updated',
      subtitle: 'Every time your property evolves — refresh the metadata to reflect it.',
      Icon: Repeat,
    },
  ];
  return (
    <Stack
      flex={1}
      flexDirection="row"
      width="100%"
      alignItems="flex-start"
      justifyContent="center"
      paddingVertical={40}
    >
      <Stack
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        gap={10}
        flex={1}
        height={526}
      >
        {faqCards.map((card) => (
          <Card title={card.title} subtitle={card.subtitle} Icon={card.Icon ?? Gamepad}></Card>
        ))}
      </Stack>
      <Stack height={526}>
        <Stack aspectRatio={1 / 1} height="100%">
          <Image src="/faq.png" objectFit="cover" />
        </Stack>
      </Stack>
    </Stack>
  );
}

interface Card {
  title: string;
  subtitle: string;
  Icon: NamedExoticComponent;
}

function Card({ title, subtitle, Icon }: Card) {
  return (
    <Cell
      withBoard
      width="100%"
      maxWidth={600}
      height={90}
      backgroundColor="transparent"
      borderRadius={20}
      borderWidth={2}
      borderColor="#6939F91F"
    >
      <Cell.Slot padding={10}>
        <Icon />
      </Cell.Slot>
      <Cell.Content>
        <List>
          <List.Row>
            <List.Title preset="compact.350.accent">{title}</List.Title>
          </List.Row>
          <List.Row>
            <List.Title preset="compact.250.default">{subtitle}</List.Title>
          </List.Row>
        </List>
      </Cell.Content>
    </Cell>
  );
}
