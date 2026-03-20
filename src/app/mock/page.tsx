'use client';

import 'dayjs/locale/ja';
import { Badge, Box, Card, Group, Image, Indicator, Stack, Text, Title } from '@mantine/core';
import { Calendar } from '@mantine/dates';
import '@mantine/dates/styles.css';
import dayjs from 'dayjs';
import { useState } from 'react';

import type { Meal, MealCategory } from '@/types/meal';

// ダミーデータ
const DUMMY_MEALS: Meal[] = [
  {
    id: '1',
    title: '鮭の塩焼き定食',
    category: '朝食',
    mealDate: '2026-03-01',
    description: 'ご飯・みそ汁・鮭の塩焼き・漬物',
    isHomeCooked: true,
    photos: [
      {
        key: '',
        thumbnailKey: '',
        url: '',
        thumbnailUrl: 'https://placehold.jp/80x80.jpg',
        width: 80,
        height: 80,
        thumbnailWidth: 80,
        thumbnailHeight: 80
      }
    ],
    createdAt: '2026-03-01T07:00:00Z',
    updatedAt: '2026-03-01T07:00:00Z'
  },
  {
    id: '2',
    title: 'ラーメン（豚骨）',
    category: '昼食',
    mealDate: '2026-03-01',
    description: '博多風とんこつラーメン',
    isHomeCooked: false,
    photos: [],
    createdAt: '2026-03-01T12:00:00Z',
    updatedAt: '2026-03-01T12:00:00Z'
  },
  {
    id: '3',
    title: '唐揚げ定食',
    category: '夕食',
    mealDate: '2026-03-03',
    description: 'サクサクの唐揚げ、キャベツ千切り添え',
    isHomeCooked: true,
    photos: [
      {
        key: '',
        thumbnailKey: '',
        url: '',
        thumbnailUrl: 'https://placehold.jp/80x80.jpg',
        width: 80,
        height: 80,
        thumbnailWidth: 80,
        thumbnailHeight: 80
      }
    ],
    createdAt: '2026-03-03T18:00:00Z',
    updatedAt: '2026-03-03T18:00:00Z'
  },
  {
    id: '4',
    title: 'シーザーサラダ',
    category: '昼食',
    mealDate: '2026-03-05',
    description: 'チキン入りシーザーサラダ',
    isHomeCooked: true,
    photos: [],
    createdAt: '2026-03-05T12:30:00Z',
    updatedAt: '2026-03-05T12:30:00Z'
  },
  {
    id: '5',
    title: 'カレーライス',
    category: '夕食',
    mealDate: '2026-03-05',
    description: '野菜たっぷりのカレー',
    isHomeCooked: true,
    photos: [
      {
        key: '',
        thumbnailKey: '',
        url: '',
        thumbnailUrl: 'https://placehold.jp/80x80.jpg',
        width: 80,
        height: 80,
        thumbnailWidth: 80,
        thumbnailHeight: 80
      }
    ],
    createdAt: '2026-03-05T19:00:00Z',
    updatedAt: '2026-03-05T19:00:00Z'
  },
  {
    id: '6',
    title: 'トースト＆目玉焼き',
    category: '朝食',
    mealDate: '2026-03-10',
    description: 'バタートースト、目玉焼き、サラダ',
    isHomeCooked: true,
    photos: [],
    createdAt: '2026-03-10T07:30:00Z',
    updatedAt: '2026-03-10T07:30:00Z'
  },
  {
    id: '7',
    title: 'パスタ（ペペロンチーノ）',
    category: '昼食',
    mealDate: '2026-03-10',
    description: 'ガーリックたっぷりペペロンチーノ',
    isHomeCooked: true,
    photos: [
      {
        key: '',
        thumbnailKey: '',
        url: '',
        thumbnailUrl: 'https://placehold.jp/80x80.jpg',
        width: 80,
        height: 80,
        thumbnailWidth: 80,
        thumbnailHeight: 80
      }
    ],
    createdAt: '2026-03-10T12:30:00Z',
    updatedAt: '2026-03-10T12:30:00Z'
  },
  {
    id: '8',
    title: '焼き魚定食',
    category: '夕食',
    mealDate: '2026-03-12',
    description: 'サバの味噌煮、ご飯、みそ汁',
    isHomeCooked: false,
    photos: [],
    createdAt: '2026-03-12T19:00:00Z',
    updatedAt: '2026-03-12T19:00:00Z'
  },
  {
    id: '9',
    title: '牛丼',
    category: '夕食',
    mealDate: '2026-03-15',
    description: '大盛り牛丼、紅ショウガたっぷり',
    isHomeCooked: false,
    photos: [
      {
        key: '',
        thumbnailKey: '',
        url: '',
        thumbnailUrl: 'https://placehold.jp/80x80.jpg',
        width: 80,
        height: 80,
        thumbnailWidth: 80,
        thumbnailHeight: 80
      }
    ],
    createdAt: '2026-03-15T18:30:00Z',
    updatedAt: '2026-03-15T18:30:00Z'
  },
  {
    id: '10',
    title: 'おにぎり2個',
    category: '昼食',
    mealDate: '2026-03-18',
    description: '鮭・梅のおにぎり',
    isHomeCooked: true,
    photos: [],
    createdAt: '2026-03-18T12:00:00Z',
    updatedAt: '2026-03-18T12:00:00Z'
  },
  {
    id: '11',
    title: '豚汁定食',
    category: '夕食',
    mealDate: '2026-03-18',
    description: '根菜たっぷり豚汁、白米',
    isHomeCooked: true,
    photos: [
      {
        key: '',
        thumbnailKey: '',
        url: '',
        thumbnailUrl: 'https://placehold.jp/80x80.jpg',
        width: 80,
        height: 80,
        thumbnailWidth: 80,
        thumbnailHeight: 80
      }
    ],
    createdAt: '2026-03-18T19:00:00Z',
    updatedAt: '2026-03-18T19:00:00Z'
  },
  {
    id: '12',
    title: '寿司（回転寿司）',
    category: '夕食',
    mealDate: '2026-03-21',
    description: 'まぐろ・サーモン・えびなど15皿',
    isHomeCooked: false,
    photos: [
      {
        key: '',
        thumbnailKey: '',
        url: '',
        thumbnailUrl: 'https://placehold.jp/80x80.jpg',
        width: 80,
        height: 80,
        thumbnailWidth: 80,
        thumbnailHeight: 80
      }
    ],
    createdAt: '2026-03-21T18:00:00Z',
    updatedAt: '2026-03-21T18:00:00Z'
  }
];

const CATEGORY_COLORS: Record<MealCategory, string> = {
  朝食: 'yellow',
  昼食: 'blue',
  夕食: 'violet',
  その他: 'gray'
};

// 日付文字列 (YYYY-MM-DD) ごとの食事をまとめたマップを作成
const buildMealMap = (meals: Meal[]): Map<string, Meal[]> => {
  const map = new Map<string, Meal[]>();
  for (const meal of meals) {
    const existing = map.get(meal.mealDate) ?? [];
    map.set(meal.mealDate, [...existing, meal]);
  }
  return map;
};

export default function MockPage() {
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date('2026-03-21'));
  const mealMap = buildMealMap(DUMMY_MEALS);

  // selectedDate は Date オブジェクトだが、mealMap のキーは YYYY-MM-DD 文字列
  const selectedDateStr = selectedDate ? dayjs(selectedDate).format('YYYY-MM-DD') : null;
  const selectedMeals = selectedDateStr ? (mealMap.get(selectedDateStr) ?? []) : [];

  return (
    <Stack p='md' maw={700} mx='auto'>
      <Title order={2}>食事ログ</Title>

      {/* カレンダー */}
      <Card withBorder>
        <Calendar
          value={selectedDate}
          onChange={setSelectedDate}
          size='md'
          locale='ja'
          lang='ja'
          firstDayOfWeek={0}
          weekendDays={[0]}
          monthLabelFormat='YYYY年MMM'
          renderDay={(date) => {
            // date は "YYYY-MM-DD" 形式の文字列
            const meals = mealMap.get(date);
            const day = new Date(date).getDate();

            return (
              <Indicator size={6} color='red' offset={-2} disabled={!meals || meals.length === 0}>
                <div>{day}</div>
              </Indicator>
            );
          }}
        />
      </Card>

      {/* 選択日の食事一覧 */}
      <Box>
        <Title order={4} mb='sm'>
          {selectedDate ? dayjs(selectedDate).format('M月D日') : '日付を選択してください'}
          {selectedMeals.length > 0 && (
            <Text span size='sm' c='dimmed' ml='xs'>
              ({selectedMeals.length}件)
            </Text>
          )}
        </Title>

        {selectedMeals.length === 0 ? (
          <Text c='dimmed' size='sm'>
            この日の記録はありません
          </Text>
        ) : (
          <Stack gap='sm'>
            {selectedMeals.map((meal) => (
              <Card key={meal.id} withBorder>
                <Group wrap='nowrap'>
                  {meal.photos.length > 0 && (
                    <Image
                      src={meal.photos[0].thumbnailUrl}
                      alt=''
                      w={64}
                      h={64}
                      style={{ objectFit: 'cover', flexShrink: 0 }}
                    />
                  )}
                  <div style={{ minWidth: 0 }}>
                    <Group gap='xs' mb={4}>
                      <Badge size='sm' color={CATEGORY_COLORS[meal.category]} variant='light'>
                        {meal.category}
                      </Badge>
                      {meal.isHomeCooked && (
                        <Badge size='sm' color='green' variant='light'>
                          自炊
                        </Badge>
                      )}
                    </Group>
                    <Text fw='bold' truncate>
                      {meal.title}
                    </Text>
                    {meal.description && (
                      <Text size='sm' c='dimmed' truncate>
                        {meal.description}
                      </Text>
                    )}
                  </div>
                </Group>
              </Card>
            ))}
          </Stack>
        )}
      </Box>
    </Stack>
  );
}
