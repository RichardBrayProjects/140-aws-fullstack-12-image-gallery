import { Client } from "pg";

export interface ImageRecord {
  id: number;
  sub: string;
  uuid_filename: string;
  image_name: string;
  created_at: string;
}

export interface ImageListRow {
  id: number;
  uuid_filename: string;
  image_name: string;
  image_description: string | null;
  created_at: string;
}

export async function listImages(
  client: Client,
  search: string,
): Promise<ImageListRow[]> {
  const term = search.trim();
  const result = await client.query(
    `SELECT DISTINCT i.id, i.uuid_filename, i.image_name, i.image_description, i.created_at
     FROM images i
     LEFT JOIN registered_user u ON i.sub = u.sub
     WHERE $1 = '' OR i.image_name ILIKE '%' || $1 || '%'
        OR COALESCE(i.image_description, '') ILIKE '%' || $1 || '%'
        OR COALESCE(u.nickname, '') ILIKE '%' || $1 || '%'
     ORDER BY i.created_at DESC`,
    [term],
  );
  return result.rows;
}

export async function insertImage(
  client: Client,
  imageData: {
    sub: string;
    uuidFilename: string;
    imageName: string;
    imageDescription?: string;
  },
): Promise<ImageRecord | null> {
  const result = await client.query(
    `INSERT INTO images (sub, uuid_filename, image_name, image_description, created_at) 
     VALUES ($1, $2, $3, $4, NOW()) 
     RETURNING id, sub, uuid_filename, image_name, image_description, created_at`,
    [
      imageData.sub,
      imageData.uuidFilename,
      imageData.imageName,
      imageData.imageDescription,
    ],
  );

  return result.rows[0] || null;
}
