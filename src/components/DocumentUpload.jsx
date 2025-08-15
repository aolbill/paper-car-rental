import React, { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { useAuth } from '../context/FirebaseAuthContext'
import { documentService } from '../services/documentService'
import './DocumentUpload.css'

const DocumentUpload = ({ documentType, onUploadComplete }) => {
  const { user, userProfile } = useAuth()
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)

  const documentTypes = documentService.getDocumentTypes()
  const docInfo = documentTypes[documentType]
  const currentDoc = userProfile?.documents?.[documentType]

  const onDrop = useCallback(async (acceptedFiles) => {
    if (!acceptedFiles.length) return
    
    const file = acceptedFiles[0]
    setUploading(true)
    setError(null)
    setSuccess(false)
    setUploadProgress(0)

    try {
      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 200)

      const result = await documentService.uploadDocument(file, user.uid, documentType)
      
      clearInterval(progressInterval)
      setUploadProgress(100)
      
      if (result.success) {
        setSuccess(true)
        setTimeout(() => {
          setSuccess(false)
          setUploadProgress(0)
          if (onUploadComplete) {
            onUploadComplete(documentType, result)
          }
        }, 2000)
      } else {
        setError(result.error)
        setUploadProgress(0)
      }
    } catch (err) {
      setError('Upload failed. Please try again.')
      setUploadProgress(0)
    } finally {
      setUploading(false)
    }
  }, [user, documentType, onUploadComplete])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png'],
      'application/pdf': ['.pdf']
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    multiple: false,
    disabled: uploading
  })

  const handleRemove = async () => {
    if (!currentDoc?.url) return
    
    try {
      setUploading(true)
      const result = await documentService.deleteDocument(
        user.uid, 
        documentType, 
        currentDoc.fileName || ''
      )
      
      if (result.success && onUploadComplete) {
        onUploadComplete(documentType, { deleted: true })
      }
    } catch (err) {
      setError('Failed to remove document')
    } finally {
      setUploading(false)
    }
  }

  const getStatusIcon = () => {
    if (success) {
      return (
        <svg className="status-icon success" width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2"/>
        </svg>
      )
    }
    
    if (currentDoc?.verified) {
      return (
        <svg className="status-icon verified" width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2"/>
        </svg>
      )
    }
    
    if (currentDoc?.uploaded) {
      return (
        <svg className="status-icon pending" width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2"/>
        </svg>
      )
    }
    
    return (
      <svg className="status-icon upload" width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" stroke="currentColor" strokeWidth="2"/>
      </svg>
    )
  }

  const getStatusText = () => {
    if (success) return 'Upload successful!'
    if (currentDoc?.verified) return 'Verified'
    if (currentDoc?.uploaded) return 'Pending review'
    return 'Not uploaded'
  }

  const getStatusClass = () => {
    if (success) return 'success'
    if (currentDoc?.verified) return 'verified'
    if (currentDoc?.uploaded) return 'pending'
    return 'not-uploaded'
  }

  return (
    <div className="document-upload-container">
      <div className="document-header">
        <div className="document-info">
          <h3 className="document-title">
            {getStatusIcon()}
            {docInfo?.name}
            {docInfo?.required && <span className="required-badge">Required</span>}
          </h3>
          <p className="document-description">{docInfo?.description}</p>
        </div>
        
        <div className={`document-status ${getStatusClass()}`}>
          {getStatusText()}
        </div>
      </div>

      {error && (
        <div className="upload-error">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" stroke="currentColor" strokeWidth="2"/>
          </svg>
          {error}
        </div>
      )}

      {currentDoc?.uploaded ? (
        <div className="uploaded-document">
          <div className="document-preview">
            <div className="file-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" stroke="currentColor" strokeWidth="2"/>
                <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </div>
            <div className="file-info">
              <p className="file-name">Document uploaded</p>
              <p className="file-date">
                {currentDoc.uploadedAt ? 
                  `Uploaded ${new Date(currentDoc.uploadedAt).toLocaleDateString()}` : 
                  'Upload date unknown'
                }
              </p>
            </div>
          </div>
          
          <div className="document-actions">
            {currentDoc.url && (
              <a 
                href={currentDoc.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="view-document-btn"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" strokeWidth="2"/>
                  <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
                </svg>
                View
              </a>
            )}
            
            <button 
              onClick={handleRemove}
              className="remove-document-btn"
              disabled={uploading}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" stroke="currentColor" strokeWidth="2"/>
              </svg>
              Replace
            </button>
          </div>
        </div>
      ) : (
        <div
          {...getRootProps()}
          className={`upload-dropzone ${isDragActive ? 'drag-active' : ''} ${uploading ? 'uploading' : ''}`}
        >
          <input {...getInputProps()} />
          
          {uploading ? (
            <div className="upload-progress">
              <div className="progress-circle">
                <svg width="48" height="48" viewBox="0 0 24 24">
                  <circle
                    cx="12"
                    cy="12"
                    r="10"
                    fill="none"
                    stroke="#e5e7eb"
                    strokeWidth="2"
                  />
                  <circle
                    cx="12"
                    cy="12"
                    r="10"
                    fill="none"
                    stroke="#3b82f6"
                    strokeWidth="2"
                    strokeDasharray={`${2 * Math.PI * 10}`}
                    strokeDashoffset={`${2 * Math.PI * 10 * (1 - uploadProgress / 100)}`}
                    strokeLinecap="round"
                    transform="rotate(-90 12 12)"
                  />
                </svg>
                <span className="progress-text">{uploadProgress}%</span>
              </div>
              <p>Uploading document...</p>
            </div>
          ) : (
            <div className="upload-content">
              <div className="upload-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                  <path d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" stroke="currentColor" strokeWidth="2"/>
                </svg>
              </div>
              
              <div className="upload-text">
                <p className="upload-primary">
                  {isDragActive ? 'Drop file here' : 'Click to upload or drag and drop'}
                </p>
                <p className="upload-secondary">
                  PNG, JPG, PDF up to 10MB
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="upload-requirements">
        <h4>Requirements:</h4>
        <ul>
          <li>Clear, readable image or PDF</li>
          <li>All information must be visible</li>
          <li>File size must be under 10MB</li>
          <li>Accepted formats: JPG, PNG, PDF</li>
        </ul>
      </div>
    </div>
  )
}

export default DocumentUpload
