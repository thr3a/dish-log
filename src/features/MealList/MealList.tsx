'use client';

import { Badge, Card, Group, Image, Stack, Text } from '@mantine/core';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';

import type { Meal } from '@/types/meal';

const fetchMeals = async (): Promise<Meal[]> => {
  const res = await fetch('/api/meals');
  if (!res.ok) throw new Error('食事一覧の取得に失敗しました');
  return res.json();
};

export const MealList = () => {
  const { data: meals, isLoading, error } = useQuery({ queryKey: ['meals'], queryFn: fetchMeals });

  if (isLoading) return <Text c='dimmed'>読み込み中...</Text>;
  if (error) return <Text c='red'>エラーが発生しました</Text>;
  if (!meals || meals.length === 0)
    return (
      <Text c='dimmed' ta='center' mt='xl'>
        まだ食事が登録されていません
      </Text>
    );

  return (
    <Stack gap='sm'>
      {meals.map((meal) => (
        <Card key={meal.id} component={Link} href={`/meals/${meal.id}`} withBorder style={{ textDecoration: 'none' }}>
          <Group wrap='nowrap'>
            {meal.photos.length > 0 && (
              <Image
                src={meal.photos[0].thumbnailUrl}
                alt=''
                w={80}
                h={80}
                style={{ objectFit: 'cover', flexShrink: 0 }}
              />
            )}
            <div style={{ minWidth: 0 }}>
              <Text fw='bold' truncate>
                {meal.title}
              </Text>
              <Group gap='xs' mt='xs'>
                <Text size='sm' c='dimmed'>
                  {meal.mealDate}
                </Text>
                <Badge size='sm' variant='light'>
                  {meal.category}
                </Badge>
                {meal.isHomeCooked && (
                  <Badge size='sm' variant='light' color='green'>
                    自炊
                  </Badge>
                )}
              </Group>
              {meal.description && (
                <Text size='sm' c='dimmed' truncate mt='xs'>
                  {meal.description}
                </Text>
              )}
            </div>
          </Group>
        </Card>
      ))}
    </Stack>
  );
};
