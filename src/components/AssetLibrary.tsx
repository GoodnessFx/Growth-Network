import { useState, useEffect, useCallback, useRef } from 'react'
import { Upload, Trash2, Image as ImageIcon, FileText, Loader2 } from 'lucide-react'
import {
  fetchAssets,
  uploadAsset,
  deleteAsset,
  type ApiBusiness,
  type Asset,
} from '../lib/api'

function fmtBytes(n: number): string {
  if (n >= 1024 * 1024) return `${(n / 1024 / 1024).toFixed(1)} MB`
  if (n >= 1024) return `${Math.round(n / 1024)} KB`
  return `${n} B`
}

export default function AssetLibrary({ bizId, businesses }: { bizId: string; businesses: ApiBusiness[] }) {
  const [assets, setAssets] = useState<Asset[]>([])
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const load = useCallback(async () => {
    if (!bizId) {
      setAssets([])
      return
    }
    setLoading(true)
    setMessage(null)
    try {
      const res = await fetchAssets(bizId)
      setAssets(res.assets)
    } catch (err) {
      setMessage({ kind: 'err', text: err instanceof Error ? err.message : 'Could not load assets.' })
    } finally {
      setLoading(false)
    }
  }, [bizId])

  useEffect(() => {
    load()
  }, [load])

  const onUpload = async (file: File) => {
    if (!bizId) return
    setUploading(true)
    setMessage(null)
    try {
      await uploadAsset(bizId, file)
      setMessage({ kind: 'ok', text: `Uploaded ${file.name}` })
      await load()
    } catch (err) {
      setMessage({ kind: 'err', text: err instanceof Error ? err.message : 'Upload failed.' })
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Delete "${name}"?`)) return
    try {
      await deleteAsset(id)
      await load()
    } catch (err) {
      setMessage({ kind: 'err', text: err instanceof Error ? err.message : 'Could not delete this asset.' })
    }
  }

  const isImage = (a: Asset) => a.mime_type?.startsWith('image/')

  return (
    <div style={{ border: '1px solid var(--border)', borderRadius: 3, background: 'var(--card)', marginBottom: 24, overflow: 'hidden' }}>
      <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
        <span style={{ fontSize: 12, fontFamily: 'JetBrains Mono', color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: 1 }}>
          Asset Library
        </span>
        <button
          onClick={() => fileRef.current?.click()}
          disabled={!bizId || uploading}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: 'var(--primary)', border: 'none', color: '#FFFFFF',
            padding: '9px 16px', minHeight: 44, borderRadius: 3, fontSize: 12, fontWeight: 700,
            cursor: !bizId || uploading ? 'not-allowed' : 'pointer',
            fontFamily: 'Barlow Condensed', letterSpacing: 0.5, opacity: !bizId ? 0.5 : 1,
          }}
        >
          {uploading ? <Loader2 size={13} className="spin" /> : <Upload size={13} />}
          {uploading ? 'UPLOADING…' : 'UPLOAD IMAGE'}
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif,application/pdf"
          style={{ display: 'none' }}
          onChange={(e) => {
            const f = e.target.files?.[0]
            if (f) onUpload(f)
          }}
        />
      </div>

      {!bizId ? (
        <div style={{ padding: '20px', fontSize: 13, color: 'var(--muted-foreground)', display: 'flex', alignItems: 'center', gap: 8 }}>
          <ImageIcon size={14} /> Select a business above to manage its images.
        </div>
      ) : loading ? (
        <div style={{ padding: '20px', fontSize: 13, color: 'var(--muted-foreground)' }}>Loading assets…</div>
      ) : (
        <>
          {message && (
            <div
              style={{
                margin: '12px 16px 0',
                padding: '8px 12px',
                borderRadius: 3,
                fontSize: 12,
                background: message.kind === 'ok' ? 'rgba(5,150,105,0.08)' : 'rgba(239,68,68,0.08)',
                border: `1px solid ${message.kind === 'ok' ? 'rgba(5,150,105,0.3)' : 'rgba(239,68,68,0.3)'}`,
                color: message.kind === 'ok' ? 'var(--accent)' : 'var(--danger)',
              }}
            >
              {message.text}
            </div>
          )}
          {assets.length === 0 ? (
            <div style={{ padding: '24px 20px', fontSize: 13, color: 'var(--muted-foreground)' }}>
              No images yet. Upload a brand image to attach to posts in the approval queue.
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 10, padding: 16 }}>
              {assets.map((a) => (
                <div
                  key={a.id}
                  style={{ border: '1px solid var(--border)', borderRadius: 3, overflow: 'hidden', background: 'var(--background)' }}
                >
                  <div style={{ height: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.25)', overflow: 'hidden' }}>
                    {isImage(a) ? (
                      <img
                        src={a.file_url}
                        alt={a.file_name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                        onError={(e) => {
                          ;(e.currentTarget as HTMLImageElement).style.display = 'none'
                        }}
                      />
                    ) : (
                      <FileText size={22} color="var(--muted-foreground)" />
                    )}
                  </div>
                  <div style={{ padding: '8px 10px' }}>
                    <div style={{ fontSize: 11, color: 'var(--foreground)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={a.file_name}>
                      {a.file_name}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 }}>
                      <span style={{ fontSize: 10, color: 'var(--muted-foreground)', fontFamily: 'JetBrains Mono' }}>{fmtBytes(a.size)}</span>
                      <button
                        onClick={() => handleDelete(a.id, a.file_name)}
                        title="Delete"
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--danger)', display: 'flex', padding: 4 }}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
