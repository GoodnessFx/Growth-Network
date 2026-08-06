import { createHash } from "node:crypto"
import path from "node:path"
import fs from "node:fs"
import { PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3"
import { S3Client } from "@aws-sdk/client-s3"

export interface StoredObject {
  key: string
  url: string
  size: number
}

export interface UploadInput {
  businessId: string
  fileName: string
  mimeType: string
  data: Buffer
}

/**
 * Object storage for business assets. Files are always namespaced under
 * `businesses/{businessId}/assets/...` so one business can never address
 * another business's objects — access control is structural, on top of the
 * tenant middleware.
 *
 * STORAGE_DRIVER=local  (default) writes to DATA_DIR (persistent disk).
 * STORAGE_DRIVER=r2     writes to Cloudflare R2 / any S3-compatible bucket
 *                       (R2_ACCOUNT_ID / R2_ACCESS_KEY_ID / R2_SECRET_ACCESS_KEY / R2_BUCKET).
 */
class Storage {
  private s3: S3Client | null = null
  private bucket: string | null = null
  readonly driver: "local" | "r2"
  private localRoot: string

  constructor() {
    this.driver = (process.env.STORAGE_DRIVER === "r2" ? "r2" : "local") as "local" | "r2"
    this.localRoot = process.env.DATA_DIR || path.join(process.cwd(), "data")
    if (this.driver === "r2") {
      const accountId = process.env.R2_ACCOUNT_ID
      const accessKeyId = process.env.R2_ACCESS_KEY_ID
      const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY
      const bucket = process.env.R2_BUCKET
      if (!accountId || !accessKeyId || !secretAccessKey || !bucket) {
        throw new Error(
          "STORAGE_DRIVER=r2 requires R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, and R2_BUCKET",
        )
      }
      this.s3 = new S3Client({
        region: "auto",
        endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
        credentials: { accessKeyId, secretAccessKey },
      })
      this.bucket = bucket
    }
  }

  private keyFor(businessId: string, fileName: string): string {
    const safeName = path.basename(fileName).replace(/[^\w.\-]+/g, "_")
    const digest = createHash("sha256").update(`${businessId}|${fileName}|${Date.now()}`).digest("hex").slice(0, 12)
    return `businesses/${businessId}/assets/${digest}_${safeName}`
  }

  async put(input: UploadInput): Promise<StoredObject> {
    const key = this.keyFor(input.businessId, input.fileName)

    if (this.driver === "r2" && this.s3 && this.bucket) {
      await this.s3.send(
        new PutObjectCommand({
          Bucket: this.bucket,
          Key: key,
          Body: input.data,
          ContentType: input.mimeType || "application/octet-stream",
        }),
      )
      return {
        key,
        url: `https://pub-${this.bucket}.r2.dev/${key}`,
        size: input.data.length,
      }
    }

    // local driver
    const abs = path.join(this.localRoot, key)
    fs.mkdirSync(path.dirname(abs), { recursive: true })
    fs.writeFileSync(abs, input.data)
    return { key, url: `/api/assets/file/${encodeURIComponent(key)}`, size: input.data.length }
  }

  async delete(key: string): Promise<void> {
    if (this.driver === "r2" && this.s3 && this.bucket) {
      await this.s3.send(new DeleteObjectCommand({ Bucket: this.bucket, Key: key }))
      return
    }
    const abs = path.join(this.localRoot, key)
    if (fs.existsSync(abs)) fs.unlinkSync(abs)
  }

  async get(key: string): Promise<{ data: Buffer; mimeType: string } | null> {
    if (this.driver === "r2" && this.s3 && this.bucket) {
      try {
        const res = await this.s3.send(new GetObjectCommand({ Bucket: this.bucket, Key: key }))
        const data = await res.Body?.transformToByteArray()
        if (!data) return null
        return { data: Buffer.from(data), mimeType: res.ContentType || "application/octet-stream" }
      } catch {
        return null
      }
    }
    const abs = path.join(this.localRoot, key)
    if (!fs.existsSync(abs)) return null
    return { data: fs.readFileSync(abs), mimeType: mimeFromKey(key) }
  }
}

const EXT_MIME: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".pdf": "application/pdf",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".doc": "application/msword",
  ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ".xls": "application/vnd.ms-excel",
  ".xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
}

function mimeFromKey(key: string): string {
  const ext = path.extname(key.split("?")[0]).toLowerCase()
  return EXT_MIME[ext] || "application/octet-stream"
}

export const storage = new Storage()
