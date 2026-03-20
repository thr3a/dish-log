'use client';

import { Text, Title } from '@mantine/core';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import { MealForm } from '@/features/MealForm/MealForm';
import type { Meal } from '@/types/meal';

export default function EditMealPage() {
  const { id } = useParams<{ id: string }>();

  const {
    data: meal,
    isLoading,
    error
  } = useQuery<Meal>({
    queryKey: ['meals', id],
    queryFn: async () => {
      const res = await fetch(`/api/meals/${id}`);
      if (!res.ok) throw new Error('取得失敗');
      return res.json();
    }
  });

  if (isLoading) return <Text c='dimmed'>読み込み中...</Text>;
  if (error || !meal) return <Text c='red'>食事が見つかりませんでした</Text>;

  return (
    <>
      <Title order={4} mb='md'>
        食事を編集
      </Title>
      <MealForm meal={meal} />
    </>
  );
}
