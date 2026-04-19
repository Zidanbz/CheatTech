import { getApps, initializeApp, cert, AppOptions, type ServiceAccount } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import fs from 'node:fs';
import path from 'node:path';
import { Buffer } from 'node:buffer';

let firebaseAdminApp = getApps()[0];

function stripJsonFence(input: string) {
  const trimmed = input.trim();
  const match = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  return (match?.[1] ?? trimmed).trim();
}

function parseServiceAccountJson(input: string): Record<string, unknown> | null {
  const cleaned = stripJsonFence(input).replace(/^['"]|['"]$/g, '').trim();
  if (!cleaned) return null;
  try {
    const parsed = JSON.parse(cleaned);
    if (!parsed || typeof parsed !== 'object') return null;
    return parsed as Record<string, unknown>;
  } catch {
    return null;
  }
}

function asNonEmptyString(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function toServiceAccount(serviceAccount: Record<string, unknown> | null): ServiceAccount | null {
  if (!serviceAccount) return null;

  const projectId =
    asNonEmptyString(serviceAccount.projectId) ?? asNonEmptyString(serviceAccount.project_id);
  const clientEmail =
    asNonEmptyString(serviceAccount.clientEmail) ?? asNonEmptyString(serviceAccount.client_email);
  const rawPrivateKey =
    asNonEmptyString(serviceAccount.privateKey) ?? asNonEmptyString(serviceAccount.private_key);

  if (!projectId || !clientEmail || !rawPrivateKey) return null;

  const privateKey = rawPrivateKey.replace(/\\n/g, '\n');
  return { projectId, clientEmail, privateKey };
}

function tryReadJsonFile(filePath: string): Record<string, unknown> | null {
  try {
    const absolutePath = path.isAbsolute(filePath) ? filePath : path.join(process.cwd(), filePath);
    const raw = fs.readFileSync(absolutePath, 'utf8');
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return null;
    return parsed as Record<string, unknown>;
  } catch {
    return null;
  }
}

function findLocalServiceAccountFile(): string | null {
  if (process.env.NODE_ENV === 'production') return null;
  try {
    const files = fs.readdirSync(process.cwd());
    const match = files.find((f) => /firebase-adminsdk-.*\.json$/i.test(f));
    return match ?? null;
  } catch {
    return null;
  }
}

function getServiceAccount(): ServiceAccount | null {
  const envJsonBase64 = process.env.FIREBASE_SERVICE_ACCOUNT_JSON_BASE64 || '';
  if (envJsonBase64) {
    try {
      const decoded = Buffer.from(envJsonBase64, 'base64').toString('utf8');
      const fromEnvBase64 = toServiceAccount(parseServiceAccountJson(decoded));
      if (fromEnvBase64) return fromEnvBase64;
    } catch {
      // ignore and continue to other sources
    }
  }

  const fromEnvJson = toServiceAccount(parseServiceAccountJson(process.env.FIREBASE_SERVICE_ACCOUNT_JSON || ''));
  if (fromEnvJson) return fromEnvJson;

  const explicitPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH || process.env.GOOGLE_APPLICATION_CREDENTIALS;
  if (explicitPath) {
    const fromPath = toServiceAccount(tryReadJsonFile(explicitPath));
    if (fromPath) return fromPath;
  }

  const localFile = findLocalServiceAccountFile();
  if (localFile) {
    const fromLocal = toServiceAccount(tryReadJsonFile(localFile));
    if (fromLocal) return fromLocal;
  }

  return null;
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
