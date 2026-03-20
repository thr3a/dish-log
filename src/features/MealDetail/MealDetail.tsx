'use client';

import { ActionIcon, Badge, Button, Group, Image, SimpleGrid, Stack, Text, Title } from '@mantine/core';
import { IconArrowLeft, IconEdit, IconTrash } from '@tabler/icons-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import type { Meal } from '@/types/meal';

const fetchMeal = async (id: string): Promise<Meal> => {
  const res = await fetch(`/api/meals/${id}`);
  if (!res.ok) throw new Error('食事の取得に失敗しました');
  return res.json();
};

type Props = {
  id: string;
};

export const MealDetail = ({ id }: Props) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: meal, isLoading, error } = useQuery({ queryKey: ['meals', id], queryFn: () => fetchMeal(id) });

  if (isLoading) return <Text c='dimmed'>読み込み中...</Text>;
  if (error || !meal) return <Text c='red'>食事が見つかりませんでした</Text>;

  const handleDelete = async () => {
    if (!confirm('この食事を削除しますか？')) return;

    const res = await fetch(`/api/meals/${id}`, { method: 'DELETE' });
    if (res.ok) {
      await queryClient.invalidateQueries({ queryKey: ['meals'] });
      router.push('/meals');
    }
  };

  return (
    <Stack>
      <Group justify='space-between'>
        <ActionIcon variant='subtle' component={Link} href='/meals'>
          <IconArrowLeft />
        </ActionIcon>
        <ActionIcon variant='subtle' component={Link} href={`/meals/${id}/edit`}>
          <IconEdit />
        </ActionIcon>
      </Group>

      {meal.photos.length > 0 && (
        <SimpleGrid cols={meal.photos.length === 1 ? 1 : 2}>
          {meal.photos.map((photo) => (
            <Image key={photo.key} src={photo.url} alt='' />
          ))}
        </SimpleGrid>
      )}

      <div>
        <Title order={3}>{meal.title}</Title>
        <Group gap='xs' mt='xs'>
          <Text size='sm' c='dimmed'>
            {meal.mealDate}
          </Text>
          <Badge variant='light'>{meal.category}</Badge>
          {meal.isHomeCooked && (
            <Badge variant='light' color='green'>
              自炊
            </Badge>
          )}
        </Group>
      </div>

      {meal.description && <Text style={{ whiteSpace: 'pre-wrap' }}>{meal.description}</Text>}

      <Button
        color='red'
        variant='light'
        leftSection={<IconTrash size={16} />}
        onClick={() => void handleDelete()}
        mt='xl'
      >
        削除
      </Button>
    </Stack>
  );
};
