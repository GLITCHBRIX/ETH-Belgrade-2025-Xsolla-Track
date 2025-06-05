'use client';

import { Stack } from '@xsolla-zk/react';
import FAQContent from '~/components/faq/content';
import FAQHeader from '~/components/faq/header';

export default function FAQScreen() {
  return (
    <Stack
      flexDirection="column"
      height="100%"
      flex={1}
      paddingHorizontal={40}
      paddingTop={20}
      alignItems="center"
    >
      <FAQHeader />

      <FAQContent />
    </Stack>
  );
}
