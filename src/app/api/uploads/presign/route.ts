import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3 } from "@/lib/aws/s3";
import { randomUUID } from "crypto";

export async function POST(request: Request) {
  const { fileName, contentType } = await request.json();
  const key = `uploads/${randomUUID()}-${fileName}`;
  const command = new PutObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET!,
    Key: key,
    ContentType: contentType,
  });

  const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 300 });
  return Response.json({ uploadUrl, key });
}
