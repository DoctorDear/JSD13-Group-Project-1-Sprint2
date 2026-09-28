import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { NodeHttpHandler } from "@smithy/node-http-handler";
import { getR2Config } from "../config/r2.js";

let client;

function getClient(config) {
  if (!client) {
    client = new S3Client({
      region: "auto",
      endpoint: config.endpoint,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
      requestHandler: new NodeHttpHandler({ requestTimeout: 30_000 }),
      maxAttempts: 2,
    });
  }
  return client;
}

export async function putImageObject({ key, body, contentType, contentLength }) {
  const config = getR2Config();
  await getClient(config).send(new PutObjectCommand({
    Bucket: config.bucketName,
    Key: key,
    Body: body,
    ContentType: contentType,
    ContentLength: contentLength,
    CacheControl: "public, max-age=31536000, immutable",
  }));
}

export function buildPublicImageUrl(key, publicBaseUrl) {
  const encodedKey = key.split("/").map(encodeURIComponent).join("/");
  return `${publicBaseUrl.replace(/\/+$/, "")}/${encodedKey}`;
}
