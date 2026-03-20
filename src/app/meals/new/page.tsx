import { Title } from '@mantine/core';
import { MealForm } from '@/features/MealForm/MealForm';

export default function NewMealPage() {
  return (
    <>
      <Title order={4} mb='md'>
        食事を記録
      </Title>
      <MealForm />
    </>
  );
}
