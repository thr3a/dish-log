スマホ利用を前提とした食べた料理管理ツールを作成したい
個人利用なのでユーザーの概念、認証は不要、閲覧、アップロードも1人
スタイリッシュより使いやすさのUI目指してる

```ts
export const mealCategories = ['朝食', '昼食', '夕食', 'その他'] as const;

export type MealCategory = (typeof mealCategories)[number];

export type MealPhoto = {
  height: number;
  key: string;
  thumbnailHeight: number;
  thumbnailKey: string;
  thumbnailUrl: string;
  thumbnailWidth: number;
  url: string;
  width: number;
};

export type Meal = {
  category: MealCategory;
  createdAt: string;
  description: string;
  id: string;
  isHomeCooked: boolean;
  mealDate: string;
  photos: MealPhoto[];
  title: string;
  updatedAt: string;
};
```

本番は.envから読み取ったs3で実装
AWS_REGION=ap-northeast-1
AWS_S3_BUCKET=dishlog-storage.turai.work

ローカルのs3はdocker-compose.ymlで起動した パスワードとかコードにベタ書きでいいよローカルのは

firebaseは開発時はFIREBASE_SECRET_DEV_JSONで本番はFIREBASE_SECRET_JSON
本番かどうかの切り分けはNODE_ENV=productionかどうか

