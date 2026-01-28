#!/usr/bin/env tsx
import "dotenv/config";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import {
  createDbClient,
  ensureDatabase,
} from "@root/db-utils";

const SYSTEM_SUB = "system";
const SYSTEM_EMAIL = "system@localhost";
const SYSTEM_NICKNAME = "system";

const IMAGES = [
  {
    uuid: "550e8400-e29b-41d4-a716-446655440001",
    imageName: "Misty Forest",
    imageDescription: "Soft light over a quiet evergreen canopy.",
    url: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80",
  },
  {
    uuid: "550e8400-e29b-41d4-a716-446655440002",
    imageName: "Mountain Trail",
    imageDescription: "A winding path through alpine terrain.",
    url: "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=1200&q=80",
  },
  {
    uuid: "550e8400-e29b-41d4-a716-446655440003",
    imageName: "City Glow",
    imageDescription: "Evening light across a lively skyline.",
    url: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1200&q=80",
  },
  {
    uuid: "550e8400-e29b-41d4-a716-446655440004",
    imageName: "Desert Lines",
    imageDescription: "Warm dunes shaped by the wind.",
    url: "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1200&q=80",
  },
  {
    uuid: "550e8400-e29b-41d4-a716-446655440005",
    imageName: "Ocean Cliff",
    imageDescription: "Waves rolling into rugged coastline.",
    url: "https://images.unsplash.com/photo-1482192596544-9eb780fc7f66?auto=format&fit=crop&w=1200&q=80",
  },
  {
    uuid: "550e8400-e29b-41d4-a716-446655440006",
    imageName: "Golden Field",
    imageDescription: "Late sun over a wide open meadow.",
    url: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1200&q=80",
  },
];

export async function initImages(): Promise<void> {
  if (!process.env.CDK_DATABASE_NAME)
    throw new Error("CDK_DATABASE_NAME must be set");
  if (!process.env.CDK_IMAGES_BUCKET_NAME)
    throw new Error("CDK_IMAGES_BUCKET_NAME must be set");

  if (process.env.PROFILE) {
    process.env.AWS_PROFILE = process.env.PROFILE;
  }

  await ensureDatabase(process.env.CDK_DATABASE_NAME);
  const client = await createDbClient(process.env.CDK_DATABASE_NAME);

  await client.query(
    `INSERT INTO registered_user (sub, email, nickname)
     VALUES ($1, $2, $3)
     ON CONFLICT (sub) DO UPDATE SET email = EXCLUDED.email, nickname = EXCLUDED.nickname`,
    [SYSTEM_SUB, SYSTEM_EMAIL, SYSTEM_NICKNAME],
  );

  const s3 = new S3Client();
  const bucket = process.env.CDK_IMAGES_BUCKET_NAME;

  for (const img of IMAGES) {
    const res = await fetch(img.url);
    if (!res.ok) throw new Error(`Failed to fetch ${img.url}: ${res.status}`);
    const body = new Uint8Array(await res.arrayBuffer());
    const contentType = res.headers.get("content-type") ?? "image/jpeg";

    await s3.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: img.uuid,
        Body: body,
        ContentType: contentType,
      }),
    );

    await client.query(
      `INSERT INTO images (sub, uuid_filename, image_name, image_description)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (uuid_filename) DO UPDATE SET
         image_name = EXCLUDED.image_name,
         image_description = EXCLUDED.image_description`,
      [SYSTEM_SUB, img.uuid, img.imageName, img.imageDescription],
    );
  }

  await client.end();
}

async function main() {
  await initImages();
  console.log("✅ init-images complete: system user and 6 images seeded.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
