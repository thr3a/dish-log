import * as admin from 'firebase-admin';

const getCredential = (): admin.credential.Credential => {
  const json =
    process.env.NODE_ENV === 'production' ? process.env.FIREBASE_SECRET_JSON : process.env.FIREBASE_SECRET_DEV_JSON;
  if (!json) throw new Error('Firebase認証情報が設定されていません');
  // base64デコード後にJSONパース（private_keyの改行問題を回避するため）
  // JSON.parse は any を返すため、firebase-admin の cert() にそのまま渡せる
  return admin.credential.cert(JSON.parse(Buffer.from(json, 'base64').toString('utf-8')));
};

const getApp = (): admin.app.App => {
  if (admin.apps.length) return admin.apps[0] as admin.app.App;
  return admin.initializeApp({ credential: getCredential() });
};

export const getDb = (): admin.firestore.Firestore => getApp().firestore();
