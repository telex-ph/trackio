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
      
      // Properly handle ObjectId fields
      if (findQuery.folderId && findQuery.folderId !== 'null') {
        try {
          findQuery.folderId = new ObjectId(findQuery.folderId);
        } catch (err) {
          console.log('Invalid folderId in query, treating as string:', findQuery.folderId);
        }
      } else if (findQuery.folderId === 'null') {
        findQuery.folderId = null;
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

  // Create a new document
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
      const insertedDoc = { _id: result.insertedId, ...documentWithDefaults };
      
      console.log('✅ Document created with ID:', result.insertedId);
      return insertedDoc;
    } catch (error) {
      console.error('❌ Error in create:', error);
      throw error;
    }
  }

  // Update an existing document
  static async update(id, updatedData) {
    try {
      const db = await connectDB();
      const collection = await db.collection(this.#collection);

      console.log('📄 Updating document:', id, 'with data:', updatedData);

      const result = await collection.findOneAndUpdate(
        { _id: new ObjectId(id) },
        {
          $set: {
            ...updatedData,
            updatedAt: new Date(),
          },
        },
        { returnDocument: "after" }
      );

      console.log('✅ Document updated:', result.value?._id);
      return result.value;
    } catch (error) {
      console.error('❌ Error in update:', error);
      throw error;
    }
  }

  // Delete a document
  static async delete(id) {
    try {
      const db = await connectDB();
      const collection = await db.collection(this.#collection);
      console.log('🗑️ Deleting document:', id);
      
      const result = await collection.deleteOne({ _id: new ObjectId(id) });
      console.log('✅ Deleted count:', result.deletedCount);
      
      return result;
    } catch (error) {
      console.error('❌ Error in delete:', error);
      throw error;
    }
  }

  // Get document by ID
  static async getById(id) {
    try {
      const db = await connectDB();
      const collection = await db.collection(this.#collection);
      
      let query;
      try {
        query = { _id: new ObjectId(id) };
      } catch (err) {
        query = { _id: id };
      }
      
      const document = await collection.findOne(query);
      return document;
    } catch (error) {
      console.error('❌ Error in getById:', error);
      throw error;
    }
  }

  // ========== FOLDER METHODS ==========

  // Create a new folder
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
      const insertedFolder = { _id: result.insertedId, ...folderWithDefaults };
      
      console.log('✅ Folder created with ID:', result.insertedId);
      return insertedFolder;
    } catch (error) {
      console.error('❌ Error in createFolder:', error);
      throw error;
    }
  }

  // Get all folders
  static async getFolders(query = {}) {
    try {
      const db = await connectDB();
      const collection = await db.collection(this.#collection);
      
      const folderQuery = { ...query, type: 'folder' };
      console.log('📁 Fetching folders with query:', folderQuery);
      
      const folders = await collection.find(folderQuery).sort({ name: 1 }).toArray();
      console.log(`✅ Found ${folders.length} folders`);
      
      return folders;
    } catch (error) {
      console.error('❌ Error in getFolders:', error);
      throw error;
    }
  }

  // Get folder by ID
  static async getFolderById(id) {
    try {
      const db = await connectDB();
      const collection = await db.collection(this.#collection);
      
      let query;
      try {
        query = { 
          _id: new ObjectId(id), 
          type: 'folder' 
        };
      } catch (err) {
        query = { 
          _id: id, 
          type: 'folder' 
        };
      }
      
      const folder = await collection.findOne(query);
      return folder;
    } catch (error) {
      console.error('❌ Error in getFolderById:', error);
      throw error;
    }
  }

  // Delete folder
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
      const result = await collection.deleteOne({ 
        _id: new ObjectId(id), 
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

  // Get document versions
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
      
      return allVersions.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
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