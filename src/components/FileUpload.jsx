import { useState } from 'react'
import { api } from '../api/client'

export default function FileUpload({ label, accept, onUploaded, previewType = 'image' }) {
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState('')
  const [error, setError] = useState('')

  async function handleChange(event) {
    const file = event.target.files?.[0]
    if (!file) return

    setError('')
    setUploading(true)

    try {
      const dataUrl = await readFile(file)
      setPreview(dataUrl)
      const result = await api.uploadFile({
        data: dataUrl,
        filename: file.name,
        mimeType: file.type,
      })
      onUploaded?.(result.url)
    } catch (err) {
      setError(err.message)
      setPreview('')
      onUploaded?.('')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="file-upload">
      <span className="file-upload__label">{label}</span>
      <label className="file-upload__drop">
        <input type="file" accept={accept} onChange={handleChange} disabled={uploading} />
        <span>{uploading ? 'Uploading…' : 'Choose file or drag here'}</span>
      </label>
      {error ? <p className="form-message form-message--error">{error}</p> : null}
      {preview && previewType === 'image' ? (
        <div className="file-upload__preview file-upload__preview--image" style={{ backgroundImage: `url(${preview})` }} />
      ) : null}
      {preview && previewType === 'video' ? (
        <video className="file-upload__preview file-upload__preview--video" src={preview} controls />
      ) : null}
    </div>
  )
}

function readFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = () => reject(new Error('Could not read file.'))
    reader.readAsDataURL(file)
  })
}
