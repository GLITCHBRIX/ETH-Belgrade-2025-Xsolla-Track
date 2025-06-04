'use client';

import { TabBar, View, Text, NavBar, Typography } from '@xsolla-zk/react';
import { useState, type ReactNode } from 'react';
import { ScreenStack } from '~/components/stacks/screen-stack';
import { Face, Question } from '@xsolla-zk/icons';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import WalletButton from '~/components/wallet/button';

const DynamicToggleThemeButton = dynamic(
  () => import('~/interface/toggle-theme-button').then((mod) => mod.ToggleThemeButton),
  {
    ssr: false,
  },
);

export function MainLayout({ children }: { children: ReactNode }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const router = useRouter();

  const state = {
    index: currentIndex,
    routes: [
      { name: '/colors', key: 'FAQ' },
      { name: '/', key: 'profile' },
    ],
  };

  const descriptors = {
    FAQ: {
      options: {
        title: 'FAQ',
        tabBarShowLabel: true,
        tabBarLabelPosition: 'below-icon' as const,
        tabBarLabel: ({ focused }: { focused: boolean }) => (
          <Typography
            color={focused ? '$content.brand-primary' : '$content.neutral-tertiary'}
            preset="compact.200.default"
            marginTop={5}
          >
            How-to
          </Typography>
        ),
        tabBarIcon: ({
          focused,
          color,
          size,
        }: {
          focused: boolean;
          color: string;
          size: number;
        }) => (
          <Question
            size={size}
            color={focused ? '$content.brand-primary' : '$content.neutral-tertiary'}
          />
        ),
      },
    },
    profile: {
      options: {
        title: 'Profile',
        tabBarShowLabel: true,
        tabBarLabelPosition: 'below-icon' as const,
        tabBarLabel: ({ focused }: { focused: boolean }) => (
          <Typography
            color={focused ? '$content.brand-primary' : '$content.neutral-tertiary'}
            preset="compact.200.default"
            marginTop={5}
          >
            Profile
          </Typography>
        ),
        tabBarIcon: ({
          focused,
          color,
          size,
        }: {
          focused: boolean;
          color: string;
          size: number;
        }) => (
          <Face
            size={size}
            color={focused ? '$content.brand-primary' : '$content.neutral-tertiary'}
          />
        ),
      },
    },
  };

  const navigation = {
    navigate: (routeName: string) => {
      const newIndex = state.routes.findIndex((route) => route.name === routeName);
      if (newIndex !== -1) {
        setCurrentIndex(newIndex);
        router.push(routeName);
      }
    },
  };

  return (
    <View maxWidth={1440} width="100%" height="100vh" marginHorizontal="auto">
      <NavBar preset="default" backgroundColor="$layer.floor-1">
        <NavBar.StartSlot>
          <DynamicToggleThemeButton />
        </NavBar.StartSlot>
        <NavBar.Center>
          <NavBar.Title>Xsolla Zk Web3 Portal</NavBar.Title>
        </NavBar.Center>
        <NavBar.EndSlot>
          <WalletButton />
        </NavBar.EndSlot>
      </NavBar>
      <ScreenStack>{children}</ScreenStack>
      <TabBar
        state={state}
        descriptors={descriptors}
        navigation={navigation}
        backgroundColor="$background.neutral-low"
        position="absolute"
        bottom={0}
        left={0}
        right={0}
        height={80}
        zIndex={1000}
      />
    </View>
  );
}
