import { MealDetail } from '@/features/MealDetail/MealDetail';

type Props = {
  params: Promise<{ id: string }>;
};

export default async function MealDetailPage({ params }: Props) {
  const { id } = await params;
  return <MealDetail id={id} />;
}
