'use client';

import { Face, Wallet } from '@xsolla-zk/icons';
import { RichIcon, Stack } from '@xsolla-zk/react';

export default function WalletButton() {
  return (
    <Stack
      flexDirection="row"
      flexShrink={0}
      alignItems="center"
      justifyContent="flex-start"
      gap={10}
    >
      <RichIcon backgroundColor="$overlay.neutral" padding="$100" shape="squircle">
        <RichIcon size="$400" shape="squircle" backgroundColor="$background.brand-extra-high">
          <RichIcon size="$400" shape="squircle" backgroundColor="$background.brand-extra-high">
            <RichIcon.Icon icon={Face} color="$content.on-brand-extra" size="$200" />
          </RichIcon>
        </RichIcon>
      </RichIcon>
      <RichIcon backgroundColor="$overlay.neutral" padding="$100" shape="squircle">
        <RichIcon size="$400" shape="squircle" backgroundColor="$background.brand-extra-high">
          <RichIcon size="$300" shape="squircle" backgroundColor="$background.brand-extra-high">
            <RichIcon.Icon icon={Wallet} color="$content.on-brand-extra" size="$200" />
          </RichIcon>
        </RichIcon>
      </RichIcon>
    </Stack>
  );
}
