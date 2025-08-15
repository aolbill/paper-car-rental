import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage'
import { doc, updateDoc } from 'firebase/firestore'
import { storage, db } from '../lib/firebase'

export const documentService = {
  // Upload document to Firebase Storage
  async uploadDocument(file, userId, documentType) {
    try {
      // Validate file
      if (!file) {
        throw new Error('No file provided')
      }

      // Check file size (max 10MB)
      const maxSize = 10 * 1024 * 1024 // 10MB
      if (file.size > maxSize) {
        throw new Error('File size must be less than 10MB')
      }

      // Check file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf']
      if (!allowedTypes.includes(file.type)) {
        throw new Error('Only JPEG, PNG, and PDF files are allowed')
      }

      // Create unique filename
      const timestamp = Date.now()
      const fileName = `${userId}/${documentType}/${timestamp}_${file.name}`
      
      // Create storage reference
      const storageRef = ref(storage, `documents/${fileName}`)
      
      // Upload file
      const snapshot = await uploadBytes(storageRef, file)
      
      // Get download URL
      const downloadURL = await getDownloadURL(snapshot.ref)
      
      // Update user document in Firestore
      await this.updateDocumentRecord(userId, documentType, downloadURL)
      
      return {
        success: true,
        url: downloadURL,
        fileName: fileName
      }
    } catch (error) {
      console.error('Document upload error:', error)
      return {
        success: false,
        error: error.message
      }
    }
  },

  // Update document record in user profile
  async updateDocumentRecord(userId, documentType, url) {
    try {
      const userDocRef = doc(db, 'users', userId)
      
      const updateData = {
        [`documents.${documentType}.uploaded`]: true,
        [`documents.${documentType}.url`]: url,
        [`documents.${documentType}.uploadedAt`]: new Date().toISOString(),
        [`documents.${documentType}.verified`]: false, // Admin needs to verify
        updatedAt: new Date().toISOString()
      }
      
      await updateDoc(userDocRef, updateData)
      
      return { success: true }
    } catch (error) {
      console.error('Error updating document record:', error)
      return { success: false, error: error.message }
    }
  },

  // Delete document
  async deleteDocument(userId, documentType, fileName) {
    try {
      // Delete from storage
      const storageRef = ref(storage, `documents/${fileName}`)
      await deleteObject(storageRef)
      
      // Update Firestore record
      const userDocRef = doc(db, 'users', userId)
      const updateData = {
        [`documents.${documentType}.uploaded`]: false,
        [`documents.${documentType}.url`]: '',
        [`documents.${documentType}.verified`]: false,
        updatedAt: new Date().toISOString()
      }
      
      await updateDoc(userDocRef, updateData)
      
      return { success: true }
    } catch (error) {
      console.error('Error deleting document:', error)
      return { success: false, error: error.message }
    }
  },

  // Verify document (admin only)
  async verifyDocument(userId, documentType, isVerified) {
    try {
      const userDocRef = doc(db, 'users', userId)
      const updateData = {
        [`documents.${documentType}.verified`]: isVerified,
        [`documents.${documentType}.verifiedAt`]: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      
      // Update overall verification status if all documents are verified
      // This would be called after checking all document statuses
      
      await updateDoc(userDocRef, updateData)
      
      return { success: true }
    } catch (error) {
      console.error('Error verifying document:', error)
      return { success: false, error: error.message }
    }
  },

  // Get document types and their requirements
  getDocumentTypes() {
    return {
      nationalId: {
        name: 'National ID',
        description: 'Clear photo of your National ID (front and back)',
        required: true,
        acceptedFormats: ['image/jpeg', 'image/png', 'application/pdf']
      },
      proofOfResidence: {
        name: 'Proof of Residence',
        description: 'Utility bill, bank statement, or lease agreement (not older than 3 months)',
        required: true,
        acceptedFormats: ['image/jpeg', 'image/png', 'application/pdf']
      },
      kraPin: {
        name: 'KRA PIN Certificate',
        description: 'Valid KRA PIN certificate',
        required: true,
        acceptedFormats: ['image/jpeg', 'image/png', 'application/pdf']
      }
    }
  },

  // Check if user has all required documents
  checkDocumentCompleteness(userProfile) {
    if (!userProfile?.documents) return { complete: false, missing: [] }
    
    const documentTypes = this.getDocumentTypes()
    const missing = []
    
    Object.keys(documentTypes).forEach(type => {
      const doc = userProfile.documents[type]
      if (!doc || !doc.uploaded) {
        missing.push(documentTypes[type].name)
      }
    })
    
    return {
      complete: missing.length === 0,
      missing,
      totalRequired: Object.keys(documentTypes).length,
      uploaded: Object.keys(documentTypes).length - missing.length
    }
  },

  // Get verification status
  getVerificationStatus(userProfile) {
    if (!userProfile?.documents) return 'not-started'
    
    const documentTypes = this.getDocumentTypes()
    let uploaded = 0
    let verified = 0
    
    Object.keys(documentTypes).forEach(type => {
      const doc = userProfile.documents[type]
      if (doc?.uploaded) uploaded++
      if (doc?.verified) verified++
    })
    
    const total = Object.keys(documentTypes).length
    
    if (uploaded === 0) return 'not-started'
    if (uploaded < total) return 'incomplete'
    if (verified === 0) return 'pending-review'
    if (verified < total) return 'partial-verified'
    return 'verified'
  }
}

export default documentService
