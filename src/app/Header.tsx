'use client';

import { ActionIcon, Anchor, Group, Title } from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';
import Link from 'next/link';

export const Header = () => {
  return (
    <Group justify='space-between' py='md'>
      <Anchor component={Link} href='/' c='dark' td='none'>
        <Title order={3}>ごはんログ 🍽</Title>
      </Anchor>
      <ActionIcon component={Link} href='/meals/new' size='lg' variant='filled'>
        <IconPlus size={20} />
      </ActionIcon>
    </Group>
  );
};
