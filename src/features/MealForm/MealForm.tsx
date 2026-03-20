'use client';

import {
  ActionIcon,
  Button,
  Checkbox,
  FileButton,
  Group,
  Image,
  Radio,
  SimpleGrid,
  Stack,
  Text,
  Textarea,
  TextInput
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconPhoto, IconX } from '@tabler/icons-react';
import dayjs from 'dayjs';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import type { Meal, MealFormValues, MealPhoto } from '@/types/meal';
import { mealCategories } from '@/types/meal';

type Props = {
  meal?: Meal;
};

export const MealForm = ({ meal }: Props) => {
  const router = useRouter();
  const [photos, setPhotos] = useState<MealPhoto[]>(meal?.photos ?? []);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<MealFormValues>({
    mode: 'controlled',
    initialValues: {
      category: meal?.category ?? '夕食',
      description: meal?.description ?? '',
      isHomeCooked: meal?.isHomeCooked ?? true,
      mealDate: meal?.mealDate ?? dayjs().format('YYYY-MM-DD'),
      title: meal?.title ?? ''
    },
    validate: {
      mealDate: (v) => (!v ? '日付を入力してください' : null),
      title: (v) => (v.trim().length === 0 ? 'タイトルを入力してください' : null)
    }
  });

  const handleFileUpload = async (files: File[]) => {
    setUploading(true);
    for (const file of files) {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      if (res.ok) {
        const photo = (await res.json()) as MealPhoto;
        setPhotos((prev) => [...prev, photo]);
      }
    }
    setUploading(false);
  };

  const removePhoto = (key: string) => {
    setPhotos((prev) => prev.filter((p) => p.key !== key));
  };

  const handleSubmit = async (values: MealFormValues) => {
    setSubmitting(true);
    const payload = { ...values, photos };
    const url = meal ? `/api/meals/${meal.id}` : '/api/meals';
    const method = meal ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      const saved = (await res.json()) as Meal;
      router.push(`/meals/${saved.id}`);
    }
    setSubmitting(false);
  };

  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      <Stack>
        <TextInput label='タイトル' placeholder='例：ランチのパスタ' required {...form.getInputProps('title')} />

        <TextInput label='日付' type='date' required {...form.getInputProps('mealDate')} />

        <Radio.Group label='カテゴリ' {...form.getInputProps('category')}>
          <Group mt='xs'>
            {mealCategories.map((cat) => (
              <Radio key={cat} value={cat} label={cat} />
            ))}
          </Group>
        </Radio.Group>

        <Checkbox label='自炊' {...form.getInputProps('isHomeCooked', { type: 'checkbox' })} />

        <Textarea
          label='メモ'
          placeholder='感想・レシピなど'
          autosize
          minRows={3}
          {...form.getInputProps('description')}
        />

        <div>
          <Text size='sm' fw='bold' mb='xs'>
            写真
          </Text>
          {photos.length > 0 && (
            <SimpleGrid cols={3} mb='sm'>
              {photos.map((photo) => (
                <div key={photo.key} style={{ position: 'relative' }}>
                  <Image src={photo.thumbnailUrl} alt='' radius='xs' />
                  <ActionIcon
                    size='xs'
                    color='red'
                    pos='absolute'
                    top={4}
                    right={4}
                    onClick={() => removePhoto(photo.key)}
                  >
                    <IconX size={12} />
                  </ActionIcon>
                </div>
              ))}
            </SimpleGrid>
          )}
          <FileButton onChange={(files) => files && void handleFileUpload(files)} multiple accept='image/*'>
            {(props) => (
              <Button {...props} variant='light' leftSection={<IconPhoto size={16} />} loading={uploading} size='sm'>
                写真を追加
              </Button>
            )}
          </FileButton>
        </div>

        <Group justify='space-between' mt='md'>
          <Button variant='subtle' onClick={() => router.back()}>
            キャンセル
          </Button>
          <Button type='submit' loading={submitting}>
            {meal ? '保存' : '登録'}
          </Button>
        </Group>
      </Stack>
    </form>
  );
};
