import connectDB from "../../config/db.js";
import { ObjectId } from "mongodb";

class Repository {
  static #collection = "repository";

  // ========== DOCUMENT METHODS ==========
  static async getAll(query = {}, options = {}) {
    try {
      const db = await connectDB();
      const collection = await db.collection(this.#collection);
      
      // Build query
      let findQuery = { ...query };
      
      // Search functionality
      if (options.search) {
        const searchRegex = new RegExp(options.search, 'i');
        findQuery.$or = [
          { title: searchRegex },
          { description: searchRegex },
          { category: searchRegex },
          { fileName: searchRegex },
          { "uploadedBy.firstName": searchRegex },
          { "uploadedBy.lastName": searchRegex }
        ];
      }
      
      console.log('📄 Database query:', JSON.stringify(findQuery, null, 2));
      
      const documents = await collection.find(findQuery).sort({ createdAt: -1 }).toArray();
      console.log(`✅ Found ${documents.length} documents`);
      
      return documents;
    } catch (error) {
      console.error('❌ Error in getAll:', error);
      throw error;
    }
  }

  // Create a new document - FIXED
  static async create(documentData) {
    try {
      const db = await connectDB();
      const collection = await db.collection(this.#collection);

      console.log('📄 Creating document with data:', {
        title: documentData.title,
        folderId: documentData.folderId,
        type: documentData.type
      });

      const documentWithDefaults = {
        ...documentData,
        type: documentData.type || 'document',
        version: documentData.version || 1,
        status: documentData.status || 'Draft',
        accessRoles: documentData.accessRoles || ['hr_admin', 'team_lead', 'employee'],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = await collection.insertOne(documentWithDefaults);
      const insertedDoc = { 
        _id: result.insertedId.toString(), // Convert to string
        ...documentWithDefaults 
      };
      
      console.log('✅ Document created with ID:', result.insertedId);
      return insertedDoc;
    } catch (error) {
      console.error('❌ Error in create:', error);
      throw error;
    }
  }

  // Update an existing document - FIXED
  static async update(id, updatedData) {
    try {
      const db = await connectDB();
      const collection = await db.collection(this.#collection);

      console.log('📄 Updating document with ID:', id, 'Type:', typeof id);
      console.log('📄 Update data:', updatedData);

      let queryId;
      try {
        // Try to convert to ObjectId
        if (typeof id === 'string' && ObjectId.isValid(id)) {
          queryId = new ObjectId(id);
        } else {
          queryId = id;
        }
      } catch (err) {
        queryId = id;
      }

      const result = await collection.findOneAndUpdate(
        { _id: queryId },
        {
          $set: {
            ...updatedData,
            updatedAt: new Date(),
          },
        },
        { 
          returnDocument: "after"
        }
      );

      if (result.value) {
        console.log('✅ Document updated successfully:', result.value._id);
        // Ensure _id is string
        return { ...result.value, _id: result.value._id.toString() };
      } else {
        console.log('❌ No document found to update with ID:', id);
        return null;
      }
    } catch (error) {
      console.error('❌ Error in update:', error);
      throw error;
    }
  }

  // Delete a document - FIXED
  static async delete(id) {
    try {
      const db = await connectDB();
      const collection = await db.collection(this.#collection);
      
      console.log('🗑️ Deleting document with ID:', id, 'Type:', typeof id);
      
      let queryId;
      try {
        if (typeof id === 'string' && ObjectId.isValid(id)) {
          queryId = new ObjectId(id);
        } else {
          queryId = id;
        }
      } catch (err) {
        queryId = id;
      }
      
      const result = await collection.deleteOne({ _id: queryId });
      
      console.log('✅ Deleted count:', result.deletedCount, 'for ID:', id);
      
      return result;
    } catch (error) {
      console.error('❌ Error in delete:', error);
      throw error;
    }
  }

  // Get document by ID - FIXED
  static async getById(id) {
    try {
      const db = await connectDB();
      const collection = await db.collection(this.#collection);
      
      console.log('🔍 Getting document by ID:', id, 'Type:', typeof id);
      
      let queryId;
      try {
        if (typeof id === 'string' && ObjectId.isValid(id)) {
          queryId = new ObjectId(id);
        } else {
          queryId = id;
        }
      } catch (err) {
        queryId = id;
      }
      
      const document = await collection.findOne({ _id: queryId });
      
      if (document) {
        console.log('✅ Found document:', document.title);
        // Ensure _id is string
        return { ...document, _id: document._id.toString() };
      } else {
        console.log('❌ Document not found with ID:', id);
        return null;
      }
    } catch (error) {
      console.error('❌ Error in getById:', error);
      throw error;
    }
  }

  // ========== FOLDER METHODS ==========

  // Create a new folder - FIXED
  static async createFolder(folderData) {
    try {
      const db = await connectDB();
      const collection = await db.collection(this.#collection);

      console.log('📁 Creating folder:', folderData.name);

      const folderWithDefaults = {
        ...folderData,
        type: 'folder',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = await collection.insertOne(folderWithDefaults);
      const insertedFolder = { 
        _id: result.insertedId.toString(), // Convert to string
        ...folderWithDefaults 
      };
      
      console.log('✅ Folder created with ID:', result.insertedId);
      return insertedFolder;
    } catch (error) {
      console.error('❌ Error in createFolder:', error);
      throw error;
    }
  }

  // Get all folders - FIXED
  static async getFolders(query = {}) {
    try {
      const db = await connectDB();
      const collection = await db.collection(this.#collection);
      
      const folderQuery = { ...query, type: 'folder' };
      console.log('📁 Fetching folders with query:', folderQuery);
      
      const folders = await collection.find(folderQuery).sort({ name: 1 }).toArray();
      
      // Convert _id to string for all folders
      const foldersWithStringIds = folders.map(folder => ({
        ...folder,
        _id: folder._id.toString()
      }));
      
      console.log(`✅ Found ${foldersWithStringIds.length} folders`);
      
      return foldersWithStringIds;
    } catch (error) {
      console.error('❌ Error in getFolders:', error);
      throw error;
    }
  }

  // Get folder by ID - FIXED
  static async getFolderById(id) {
    try {
      const db = await connectDB();
      const collection = await db.collection(this.#collection);
      
      console.log('🔍 Getting folder by ID:', id);
      
      let queryId;
      try {
        if (typeof id === 'string' && ObjectId.isValid(id)) {
          queryId = new ObjectId(id);
        } else {
          queryId = id;
        }
      } catch (err) {
        queryId = id;
      }
      
      const folder = await collection.findOne({ 
        _id: queryId, 
        type: 'folder' 
      });
      
      if (folder) {
        // Ensure _id is string
        return { ...folder, _id: folder._id.toString() };
      } else {
        console.log('❌ Folder not found with ID:', id);
        return null;
      }
    } catch (error) {
      console.error('❌ Error in getFolderById:', error);
      throw error;
    }
  }

  // Delete folder - FIXED
  static async deleteFolder(id) {
    try {
      const db = await connectDB();
      const collection = await db.collection(this.#collection);
      
      console.log('🗑️ Deleting folder:', id);
      
      // Check if folder exists
      const folder = await this.getFolderById(id);
      if (!folder) {
        throw new Error('Folder not found');
      }
      
      // Move all documents in this folder to root
      await collection.updateMany(
        { folderId: id, type: 'document' },
        { $set: { folderId: null } }
      );
      
      // Delete the folder
      let queryId;
      try {
        if (typeof id === 'string' && ObjectId.isValid(id)) {
          queryId = new ObjectId(id);
        } else {
          queryId = id;
        }
      } catch (err) {
        queryId = id;
      }
      
      const result = await collection.deleteOne({ 
        _id: queryId, 
        type: 'folder' 
      });
      
      console.log('✅ Folder deleted, moved documents to root');
      return result;
    } catch (error) {
      console.error('❌ Error in deleteFolder:', error);
      throw error;
    }
  }

  // ========== VERSION METHODS ==========

  // Get document versions - FIXED
  static async getVersions(documentId) {
    try {
      const db = await connectDB();
      const collection = await db.collection(this.#collection);
      
      const mainDoc = await collection.findOne({ 
        _id: new ObjectId(documentId) 
      });
      
      if (!mainDoc) return [];
      
      let allVersions = [mainDoc];
      
      // Find all versions linked to this document
      const linkedVersions = await collection.find({
        previousVersion: documentId
      })
      .sort({ createdAt: -1 })
      .toArray();
      
      allVersions = [...allVersions, ...linkedVersions];
      
      // Convert _id to string for all versions
      return allVersions
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .map(version => ({ ...version, _id: version._id.toString() }));
    } catch (error) {
      console.error('❌ Error in getVersions:', error);
      throw error;
    }
  }

  // Distinct values for categories
  static async getDistinctCategories() {
    try {
      const db = await connectDB();
      const collection = await db.collection(this.#collection);
      
      const categories = await collection.distinct('category', { 
        type: { $ne: 'folder' },
        category: { $ne: null }
      });
      
      return categories.filter(cat => cat);
    } catch (error) {
      console.error('❌ Error in getDistinctCategories:', error);
      throw error;
    }
  }
}

export default Repository;