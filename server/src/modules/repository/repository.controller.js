import Repository from './repository.model.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { ObjectId } from 'mongodb';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ensureUploadsDir = () => {
  const uploadsDir = path.join(process.cwd(), 'uploads');
  
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
    console.log('✅ Uploads directory created at:', uploadsDir);
  }
  return uploadsDir;
};

// ========== FOLDER CONTROLLERS ==========

export const getFolders = async (req, res) => {
  try {
    console.log('📁 GET folders request');
    const folders = await Repository.getFolders();
    return res.status(200).json(folders);
  } catch (error) {
    console.error("❌ Error fetching folders:", error);
    return res.status(500).json({
      message: "Failed to fetch folders",
      error: error.message,
    });
  }
};

export const createFolder = async (req, res) => {
  try {
    const userId = req.headers['x-user-id'];
    console.log('📁 CREATE folder request from user:', userId);
    
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    const { name, description } = req.body;
    
    if (!name || name.trim() === '') {
      return res.status(400).json({ error: 'Folder name is required' });
    }
    
    const folderData = {
      name: name.trim(),
      description: (description || '').trim(),
      createdBy: userId,
    };
    
    const folder = await Repository.createFolder(folderData);
    return res.status(201).json(folder);
  } catch (error) {
    console.error("❌ Error creating folder:", error);
    return res.status(500).json({
      message: "Failed to create folder",
      error: error.message,
    });
  }
};

export const deleteFolder = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.headers['x-user-id'];
    
    console.log('🗑️ DELETE folder request:', id, 'from user:', userId);
    
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    const folder = await Repository.getFolderById(id);
    if (!folder) {
      return res.status(404).json({ error: 'Folder not found' });
    }
    
    await Repository.deleteFolder(id);
    return res.status(200).json({ 
      message: 'Folder deleted successfully',
      movedDocuments: 'All documents moved to root folder'
    });
  } catch (error) {
    console.error("❌ Error deleting folder:", error);
    return res.status(500).json({
      message: "Failed to delete folder",
      error: error.message,
    });
  }
};

// ========== DOCUMENT CONTROLLERS ==========

export const getDocuments = async (req, res) => {
  try {
    const { category, folderId, search } = req.query;
    const userRole = req.headers['x-user-role'];
    const userId = req.headers['x-user-id'];
    
    console.log('📄 GET documents request:', {
      userRole,
      userId,
      category,
      folderId,
      search
    });
    
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    let query = { 
      type: 'document',
      status: { $ne: 'Archived' }
    };
    
    const normalizedRole = userRole?.replace(/-/g, '_');
    const hrAdminRoles = ['admin_hr_head', 'admin', 'hr_admin'];
    
    if (!hrAdminRoles.includes(normalizedRole)) {
      if (normalizedRole === 'employee') {
        query.accessRoles = { $in: ['employee'] };
      } else if (normalizedRole === 'team_lead') {
        query.accessRoles = { $in: ['team_lead', 'employee'] };
      }
    }
    
    if (category && category !== '' && category !== 'All') {
      query.category = category;
    }
    
    if (folderId && folderId !== 'null' && folderId !== '') {
      query.folderId = folderId;
    } else if (folderId === 'null' || folderId === '') {
      query.folderId = null;
    }
    
    const options = search ? { search } : {};
    const documents = await Repository.getAll(query, options);
    
    return res.status(200).json(documents);
  } catch (error) {
    console.error("❌ Error fetching documents:", error);
    return res.status(500).json({
      message: "Failed to fetch documents",
      error: error.message,
    });
  }
};

export const getArchivedDocuments = async (req, res) => {
  try {
    const { search } = req.query;
    const userId = req.headers['x-user-id'];
    
    console.log('🗄️ GET archived documents request from user:', userId);
    
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    const query = { 
      type: 'document',
      status: 'Archived'
    };
    
    const options = search ? { search } : {};
    const documents = await Repository.getAll(query, options);
    
    return res.status(200).json(documents);
  } catch (error) {
    console.error("❌ Error fetching archived documents:", error);
    return res.status(500).json({
      message: "Failed to fetch archived documents",
      error: error.message,
    });
  }
};

export const getDocumentVersions = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.headers['x-user-id'];
    
    console.log('🕒 GET document versions for:', id);
    
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    const versions = await Repository.getVersions(id);
    return res.status(200).json(versions);
  } catch (error) {
    console.error("❌ Error fetching document versions:", error);
    return res.status(500).json({
      message: "Failed to fetch document versions",
      error: error.message,
    });
  }
};

export const getCategories = async (req, res) => {
  try {
    console.log('📋 GET categories request');
    const categories = await Repository.getDistinctCategories();
    return res.status(200).json(categories);
  } catch (error) {
    console.error("❌ Error fetching categories:", error);
    return res.status(500).json({
      message: "Failed to fetch categories",
      error: error.message,
    });
  }
};

export const uploadDocument = async (req, res) => {
  let uniqueFileName = null;
  const uploadsDir = ensureUploadsDir();
  
  try {
    const userId = req.headers['x-user-id'];
    const userRole = req.headers['x-user-role'];
    const { title, description, category, folderId, accessRoles, fileData, fileName, fileType } = req.body;
    
    console.log('📤 UPLOAD request received:', { 
      userId, 
      userRole,
      title: title?.substring(0, 50),
      fileName,
      fileType,
      folderId: folderId || 'null',
      hasFileData: !!fileData
    });
    
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    if (!fileData) {
      return res.status(400).json({ error: 'File data is required' });
    }

    let parsedAccessRoles = ['hr_admin', 'team_lead', 'employee'];
    if (accessRoles) {
      try {
        if (typeof accessRoles === 'string') {
          parsedAccessRoles = JSON.parse(accessRoles);
        } else {
          parsedAccessRoles = accessRoles;
        }
      } catch (e) {
        console.warn('Failed to parse accessRoles, using default');
      }
    }
    
    let finalFolderId = null;
    console.log('📁 Processing folderId:', folderId);
    
    if (folderId && folderId !== '' && folderId !== 'null') {
      try {
        const folder = await Repository.getFolderById(folderId);
        if (folder) {
          finalFolderId = folderId;
          console.log('📁 Using folder:', folder.name);
        } else {
          console.warn('📁 Folder not found, using null');
          finalFolderId = null;
        }
      } catch (err) {
        console.error('📁 Error checking folder:', err.message);
        finalFolderId = null;
      }
    }
    
    console.log('📁 Final folderId to save:', finalFolderId);
    
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 8);
    const safeFileName = (fileName || 'unnamed')
      .replace(/\s+/g, '_')
      .replace(/[^a-zA-Z0-9._-]/g, '');
    uniqueFileName = `${timestamp}_${randomString}_${safeFileName}`;
    
    const filePath = path.join(uploadsDir, uniqueFileName);
    
    try {
      if (!fileData.includes('base64,')) {
        return res.status(400).json({ error: 'Invalid file data format' });
      }
      
      const base64Data = fileData.replace(/^data:[^;]+;base64,/, '');
      const fileBuffer = Buffer.from(base64Data, 'base64');
      
      const fileSizeMB = fileBuffer.length / (1024 * 1024);
      if (fileSizeMB > 20) {
        return res.status(400).json({ error: `File size (${fileSizeMB.toFixed(2)}MB) exceeds 20MB limit` });
      }
      
      fs.writeFileSync(filePath, fileBuffer);
      console.log(`✅ File saved: ${uniqueFileName} (${fileSizeMB.toFixed(2)}MB)`);
      
      const documentData = {
        title: (title || fileName || 'Untitled Document').trim(),
        description: (description || '').trim(),
        category: category || 'Policies',
        folderId: finalFolderId,
        fileName: fileName || 'unknown',
        fileType: fileType || 'application/octet-stream',
        fileSize: fileBuffer.length,
        fileUrl: `/api/repository/download/${uniqueFileName}`,
        accessRoles: parsedAccessRoles,
        uploadedBy: userId,
        version: 1,
        status: 'Draft',
        type: 'document',
      };
      
      console.log('📄 Saving document to database:', {
        title: documentData.title,
        folderId: documentData.folderId,
        fileName: documentData.fileName
      });
      
      const document = await Repository.create(documentData);
      
      console.log("✅ UPLOAD SUCCESS - Document ID:", document._id);
      return res.status(201).json(document);
      
    } catch (fileError) {
      console.error('❌ File processing error:', fileError);
      return res.status(500).json({ error: 'Failed to process file: ' + fileError.message });
    }
    
  } catch (error) {
    console.error("❌ UPLOAD ERROR:", error.message);
    console.error(error.stack);
    
    if (uniqueFileName && fs.existsSync(path.join(uploadsDir, uniqueFileName))) {
      try {
        fs.unlinkSync(path.join(uploadsDir, uniqueFileName));
        console.log('🗑️ Cleaned up file:', uniqueFileName);
      } catch (cleanupError) {
        console.error('Failed to cleanup file:', cleanupError);
      }
    }
    
    return res.status(500).json({ 
      message: "Failed to upload document",
      error: error.message 
    });
  }
};

export const updateDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.headers['x-user-id'];
    const updateData = req.body;
    
    console.log('✏️ UPDATE document request for ID:', id);
    console.log('✏️ Update data:', updateData);
    
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    let document = await Repository.getById(id);
    
    if (!document) {
      console.error('❌ Document not found with ID:', id);
      return res.status(404).json({ 
        error: 'Document not found',
        details: `Document with ID ${id} does not exist`
      });
    }
    
    console.log('📄 Found document to update:', document.title, 'ID:', document._id);
    
    const dataToUpdate = {
      title: updateData.title || document.title,
      description: updateData.description || document.description,
      category: updateData.category || document.category,
      accessRoles: updateData.accessRoles || document.accessRoles,
      updatedAt: new Date(),
    };
    
    if (updateData.folderId !== undefined) {
      if (updateData.folderId === '' || updateData.folderId === 'null') {
        dataToUpdate.folderId = null;
      } else if (updateData.folderId) {
        try {
          const folder = await Repository.getFolderById(updateData.folderId);
          if (folder) {
            dataToUpdate.folderId = updateData.folderId;
          } else {
            console.warn('Folder not found, keeping original');
            dataToUpdate.folderId = document.folderId;
          }
        } catch (err) {
          console.warn('Error processing folderId:', err.message);
          dataToUpdate.folderId = document.folderId;
        }
      } else {
        dataToUpdate.folderId = document.folderId;
      }
    } else {
      dataToUpdate.folderId = document.folderId;
    }
    
    console.log('✏️ Final update data to save:', dataToUpdate);
    
    const updatedDocument = await Repository.update(id, dataToUpdate);
    
    if (!updatedDocument) {
      return res.status(500).json({ 
        error: 'Update failed',
        details: 'Could not update document in database'
      });
    }
    
    console.log('✅ UPDATE SUCCESS - Document updated:', updatedDocument._id);
    return res.status(200).json(updatedDocument);
    
  } catch (error) {
    console.error("❌ Error updating document:", error);
    console.error("❌ Error stack:", error.stack);
    
    return res.status(500).json({
      message: "Failed to update document",
      error: error.message,
    });
  }
};

export const updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userId = req.headers['x-user-id'];
    
    console.log('🔄 UPDATE status request:', id, 'to', status, 'by', userId);
    
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    if (!['Draft', 'Approved', 'Archived'].includes(status)) {
      return res.status(400).json({ 
        error: 'Invalid status',
        validStatuses: ['Draft', 'Approved', 'Archived']
      });
    }
    
    console.log('🔍 Getting document by ID:', id);
    let document = await Repository.getById(id);
    
    if (!document) {
      console.error('❌ Document not found with ID:', id);
      return res.status(404).json({ 
        error: 'Document not found',
        details: `Document with ID ${id} does not exist`
      });
    }
    
    console.log('📄 Found document to update status:', {
      id: document._id,
      title: document.title,
      currentStatus: document.status,
      newStatus: status
    });
    
    const updateData = { 
      status: status,
      updatedAt: new Date()
    };
    
    console.log('🔄 Updating document with data:', updateData);
    
    // FIXED: Use the document's string _id for update
    const updatedDocument = await Repository.update(document._id, updateData);
    
    if (!updatedDocument) {
      console.error('❌ Update returned null');
      return res.status(500).json({ 
        error: 'Status update failed',
        details: 'Could not update document status in database'
      });
    }
    
    console.log('✅ Status updated successfully:', {
      documentId: updatedDocument._id,
      newStatus: updatedDocument.status,
      updatedAt: updatedDocument.updatedAt
    });
    
    return res.status(200).json({
      message: 'Status updated successfully',
      document: updatedDocument
    });
    
  } catch (error) {
    console.error("❌ Error updating document status:", error);
    console.error("❌ Error stack:", error.stack);
    
    return res.status(500).json({
      message: "Failed to update document status",
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

export const restoreVersion = async (req, res) => {
  try {
    const { id } = req.params;
    const { versionId } = req.body;
    const userId = req.headers['x-user-id'];
    
    console.log('↩️ RESTORE version request:', versionId, 'for document:', id);
    
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    const versionToRestore = await Repository.getById(versionId);
    if (!versionToRestore) {
      return res.status(404).json({ error: 'Version not found' });
    }
    
    const currentDocument = await Repository.getById(id);
    if (!currentDocument) {
      return res.status(404).json({ error: 'Document not found' });
    }
    
    // Archive current version
    await Repository.update(currentDocument._id, { 
      status: 'Archived',
      updatedAt: new Date()
    });
    
    // Create new document from version
    const restoredDocumentData = {
      title: versionToRestore.title,
      description: versionToRestore.description,
      category: versionToRestore.category,
      folderId: versionToRestore.folderId,
      fileName: versionToRestore.fileName,
      fileType: versionToRestore.fileType,
      fileSize: versionToRestore.fileSize,
      fileUrl: versionToRestore.fileUrl,
      accessRoles: versionToRestore.accessRoles,
      previousVersion: currentDocument._id,
      version: (currentDocument.version || 1) + 1,
      uploadedBy: userId,
      status: 'Draft',
      type: 'document',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    const restoredDocument = await Repository.create(restoredDocumentData);
    
    console.log('✅ Version restored successfully:', restoredDocument._id);
    return res.status(200).json(restoredDocument);
  } catch (error) {
    console.error("❌ Error restoring version:", error);
    return res.status(500).json({
      message: "Failed to restore version",
      error: error.message,
    });
  }
};

export const deleteDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.headers['x-user-id'];
    const userRole = req.headers['x-user-role'];
    
    console.log('🗑️ DELETE document request:', id, 'by user:', userId);
    
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    let document = await Repository.getById(id);
    
    if (!document) {
      return res.status(404).json({ 
        error: 'Document not found',
        details: `Document with ID ${id} does not exist`
      });
    }
    
    const normalizedRole = userRole?.replace(/-/g, '_');
    const hrAdminRoles = ['admin_hr_head', 'admin', 'hr_admin'];
    
    if (!hrAdminRoles.includes(normalizedRole)) {
      return res.status(403).json({ error: 'Unauthorized - HR Admin access required' });
    }
    
    if (document.fileUrl) {
      try {
        const fileName = document.fileUrl.split('/').pop();
        const uploadsDir = ensureUploadsDir();
        const filePath = path.join(uploadsDir, fileName);
        
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
          console.log('🗑️ File deleted:', fileName);
        }
      } catch (fileError) {
        console.warn('⚠️ Failed to delete file:', fileError.message);
      }
    }
    
    const result = await Repository.delete(id);
    
    console.log('✅ Document deleted successfully');
    return res.status(200).json({ 
      message: 'Document deleted successfully',
      documentId: id,
      deletedCount: result.deletedCount
    });
  } catch (error) {
    console.error("❌ Error deleting document:", error);
    return res.status(500).json({
      message: "Failed to delete document",
      error: error.message,
    });
  }
};

export const downloadDocument = async (req, res) => {
  try {
    const { filename } = req.params;
    const userId = req.headers['x-user-id'];
    
    console.log('⬇️ DOWNLOAD request:', filename, 'by user:', userId);
    
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    const uploadsDir = ensureUploadsDir();
    const filePath = path.join(uploadsDir, filename);
    
    if (!fs.existsSync(filePath)) {
      console.error('❌ File not found:', filePath);
      return res.status(404).json({ 
        error: 'File not found',
        filename: filename
      });
    }
    
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Type', 'application/octet-stream');
    
    console.log('✅ Sending file:', filename);
    return res.download(filePath);
  } catch (error) {
    console.error("❌ Error downloading document:", error);
    return res.status(500).json({
      message: "Failed to download document",
      error: error.message,
    });
  }
};