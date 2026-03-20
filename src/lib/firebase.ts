import * as admin from 'firebase-admin';

const getCredential = (): admin.credential.Credential => {
  const json =
    process.env.NODE_ENV === 'production' ? process.env.FIREBASE_SECRET_JSON : process.env.FIREBASE_SECRET_DEV_JSON;
  if (!json) throw new Error('Firebase認証情報が設定されていません');
  // JSON.parse は any を返すため、firebase-admin の cert() にそのまま渡せる
  return admin.credential.cert(JSON.parse(json));
};

if (!admin.apps.length) {
  admin.initializeApp({ credential: getCredential() });
}

export const db = admin.firestore();
