import {
  DeleteObjectCommand,
  DeleteObjectsCommand,
  GetObjectCommand,
  HeadObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

import { ALLOWED_IMAGE_TYPES } from "@/lib/constants";
import { getEnv } from "@/lib/env";
import { buildPhotoObjectKeys } from "@/lib/utils";

let r2Client: S3Client | null = null;

export function getR2Client() {
  if (!r2Client) {
    const env = getEnv();

    r2Client = new S3Client({
      region: "auto",
      endpoint: `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: env.R2_ACCESS_KEY_ID,
        secretAccessKey: env.R2_SECRET_ACCESS_KEY,
      },
    });
  }

  return r2Client;
}

export function assertAllowedImageType(contentType: string) {
  if (!ALLOWED_IMAGE_TYPES.has(contentType)) {
    throw new Error(`Unsupported image type: ${contentType}`);
  }
}

export async function createPresignedUploadUrl(input: {
  key: string;
  contentType: string;
}) {
  const env = getEnv();
  const command = new PutObjectCommand({
    Bucket: env.R2_BUCKET_NAME,
    Key: input.key,
    ContentType: input.contentType,
  });

  const url = await getSignedUrl(getR2Client(), command, {
    expiresIn: 60 * 15,
  });

  return url;
}

export async function headPrivateObject(key: string) {
  const env = getEnv();

  return getR2Client().send(
    new HeadObjectCommand({
      Bucket: env.R2_BUCKET_NAME,
      Key: key,
    }),
  );
}

export async function getPrivateObject(key: string) {
  const env = getEnv();

  return getR2Client().send(
    new GetObjectCommand({
      Bucket: env.R2_BUCKET_NAME,
      Key: key,
    }),
  );
}

export async function deletePrivateObject(key: string) {
  const env = getEnv();

  return getR2Client().send(
    new DeleteObjectCommand({
      Bucket: env.R2_BUCKET_NAME,
      Key: key,
    }),
  );
}

export async function deletePrivateObjects(keys: string[]) {
  if (keys.length === 0) {
    return;
  }

  const env = getEnv();

  for (let index = 0; index < keys.length; index += 1000) {
    const batch = keys.slice(index, index + 1000);

    await getR2Client().send(
      new DeleteObjectsCommand({
        Bucket: env.R2_BUCKET_NAME,
        Delete: {
          Objects: batch.map((key) => ({ Key: key })),
          Quiet: true,
        },
      }),
    );
  }
}

export async function deletePhotoObjects(storageKey: string) {
  await deletePrivateObjects(buildPhotoObjectKeys(storageKey));
}

export async function deleteGalleryObjects(galleryId: string) {
  const env = getEnv();
  const prefix = `galleries/${galleryId}/`;
  const keys: string[] = [];
  let continuationToken: string | undefined;

  do {
    const listed = await getR2Client().send(
      new ListObjectsV2Command({
        Bucket: env.R2_BUCKET_NAME,
        Prefix: prefix,
        ContinuationToken: continuationToken,
      }),
    );

    for (const object of listed.Contents ?? []) {
      if (object.Key) {
        keys.push(object.Key);
      }
    }

    continuationToken = listed.NextContinuationToken;
  } while (continuationToken);

  if (keys.length === 0) {
    return;
  }

  for (let index = 0; index < keys.length; index += 1000) {
    const batch = keys.slice(index, index + 1000);

    await getR2Client().send(
      new DeleteObjectsCommand({
        Bucket: env.R2_BUCKET_NAME,
        Delete: {
          Objects: batch.map((key) => ({ Key: key })),
          Quiet: true,
        },
      }),
    );
  }
}
