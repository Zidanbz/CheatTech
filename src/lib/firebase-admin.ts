import { getApps, initializeApp, cert, AppOptions } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

let firebaseAdminApp = getApps()[0];

function getServiceAccount() {
  const json = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!json) return null;
  try {
    return JSON.parse(json);
  } catch (error) {
    console.error('Failed to parse FIREBASE_SERVICE_ACCOUNT_JSON', error);
    return null;
  }
}

if (!firebaseAdminApp) {
  const serviceAccount = getServiceAccount();
  const options: AppOptions = serviceAccount
    ? { credential: cert(serviceAccount) }
    : {};

  firebaseAdminApp = initializeApp(options);
}

export const adminApp = firebaseAdminApp;
export const adminDb = getFirestore(firebaseAdminApp);
export const adminAuth = getAuth(firebaseAdminApp);
