import connectDB from "../../config/db.js";
import { ObjectId } from "mongodb";

class Repository {
  static #collection = "repository";

  // ========== SIMPLE FIXED METHODS ==========
  static async getAll(query = {}, options = {}) {
    try {
      const db = await connectDB();
      const collection = await db.collection(this.#collection);
      
      let findQuery = { ...query };
      
      if (options.search) {
        const searchRegex = new RegExp(options.search, 'i');
        findQuery.$or = [
          { title: searchRegex },
          { description: searchRegex },
          { category: searchRegex },
          { fileName: searchRegex },
        ];
      }
      
      console.log('📄 Database query:', JSON.stringify(findQuery, null, 2));
      
      const documents = await collection.find(findQuery).sort({ createdAt: -1 }).toArray();
      console.log(`✅ Found ${documents.length} documents`);
      
      return documents.map(doc => ({
        ...doc,
        _id: doc._id ? doc._id.toString() : doc._id
      }));
    } catch (error) {
      console.error('❌ Error in getAll:', error);
      throw error;
    }
  }

  static async create(documentData) {
    try {
      const db = await connectDB();
      const collection = await db.collection(this.#collection);

      console.log('📄 Creating document with data:', {
        title: documentData.title,
        folderId: documentData.folderId
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
      
      console.log('✅ Document created with ID:', result.insertedId);
      
      // Return the inserted document with string ID
      return {
        _id: result.insertedId.toString(),
        ...documentWithDefaults
      };
    } catch (error) {
      console.error('❌ Error in create:', error);
      throw error;
    }
  }

  // ========== FIXED UPDATE METHOD ==========
  static async update(id, updatedData) {
    try {
      const db = await connectDB();
      const collection = await db.collection(this.#collection);

      console.log('📄 Updating document with ID:', id);
      console.log('📄 Update data:', updatedData);

      // Convert string ID to ObjectId
      let objectId;
      try {
        objectId = new ObjectId(id);
      } catch (err) {
        console.error('❌ Invalid ObjectId:', id);
        throw new Error('Invalid document ID');
      }

      // Create update object
      const updateObj = {
        $set: {
          ...updatedData,
          updatedAt: new Date(),
        }
      };

      console.log('📄 Update operation:', JSON.stringify(updateObj, null, 2));

      // Perform update
      const result = await collection.updateOne(
        { _id: objectId },
        updateObj
      );

      console.log('📄 Update result:', {
        matchedCount: result.matchedCount,
        modifiedCount: result.modifiedCount
      });

      if (result.matchedCount === 0) {
        console.log('❌ No document found with ID:', id);
        return null;
      }

      // Fetch updated document
      const updatedDocument = await collection.findOne({ _id: objectId });
      
      if (!updatedDocument) {
        console.log('❌ Failed to fetch updated document');
        return null;
      }

      console.log('✅ Document updated successfully');
      
      // Return with string ID
      return {
        ...updatedDocument,
        _id: updatedDocument._id.toString()
      };
    } catch (error) {
      console.error('❌ Error in update:', error);
      console.error('❌ Error stack:', error.stack);
      throw error;
    }
  }

  static async delete(id) {
    try {
      const db = await connectDB();
      const collection = await db.collection(this.#collection);
      
      console.log('🗑️ Deleting document with ID:', id);
      
      let objectId;
      try {
        objectId = new ObjectId(id);
      } catch (err) {
        console.error('❌ Invalid ObjectId:', id);
        throw new Error('Invalid document ID');
      }
      
      const result = await collection.deleteOne({ _id: objectId });
      
      console.log('✅ Deleted count:', result.deletedCount);
      
      return result;
    } catch (error) {
      console.error('❌ Error in delete:', error);
      throw error;
    }
  }

  static async getById(id) {
    try {
      const db = await connectDB();
      const collection = await db.collection(this.#collection);
      
      console.log('🔍 Getting document by ID:', id);
      
      let objectId;
      try {
        objectId = new ObjectId(id);
      } catch (err) {
        console.error('❌ Invalid ObjectId:', id);
        return null;
      }
      
      const document = await collection.findOne({ _id: objectId });
      
      if (document) {
        console.log('✅ Found document:', document.title);
        return {
          ...document,
          _id: document._id.toString()
        };
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
      
      console.log('✅ Folder created with ID:', result.insertedId);
      
      return {
        _id: result.insertedId.toString(),
        ...folderWithDefaults
      };
    } catch (error) {
      console.error('❌ Error in createFolder:', error);
      throw error;
    }
  }

  static async getFolders(query = {}) {
    try {
      const db = await connectDB();
      const collection = await db.collection(this.#collection);
      
      const folderQuery = { ...query, type: 'folder' };
      console.log('📁 Fetching folders with query:', folderQuery);
      
      const folders = await collection.find(folderQuery).sort({ name: 1 }).toArray();
      
      return folders.map(folder => ({
        ...folder,
        _id: folder._id.toString()
      }));
    } catch (error) {
      console.error('❌ Error in getFolders:', error);
      throw error;
    }
  }

  static async getFolderById(id) {
    try {
      const db = await connectDB();
      const collection = await db.collection(this.#collection);
      
      console.log('🔍 Getting folder by ID:', id);
      
      let objectId;
      try {
        objectId = new ObjectId(id);
      } catch (err) {
        console.error('❌ Invalid ObjectId:', id);
        return null;
      }
      
      const folder = await collection.findOne({ 
        _id: objectId, 
        type: 'folder' 
      });
      
      if (folder) {
        return {
          ...folder,
          _id: folder._id.toString()
        };
      } else {
        console.log('❌ Folder not found with ID:', id);
        return null;
      }
    } catch (error) {
      console.error('❌ Error in getFolderById:', error);
      throw error;
    }
  }

  static async deleteFolder(id) {
    try {
      const db = await connectDB();
      const collection = await db.collection(this.#collection);
      
      console.log('🗑️ Deleting folder:', id);
      
      const folder = await this.getFolderById(id);
      if (!folder) {
        throw new Error('Folder not found');
      }
      
      let objectId;
      try {
        objectId = new ObjectId(id);
      } catch (err) {
        console.error('❌ Invalid ObjectId:', id);
        throw new Error('Invalid folder ID');
      }
      
      // Move all documents in this folder to root
      await collection.updateMany(
        { folderId: id, type: 'document' },
        { $set: { folderId: null } }
      );
      
      // Delete the folder
      const result = await collection.deleteOne({ 
        _id: objectId, 
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
  static async getVersions(documentId) {
    try {
      const db = await connectDB();
      const collection = await db.collection(this.#collection);
      
      let objectId;
      try {
        objectId = new ObjectId(documentId);
      } catch (err) {
        console.error('❌ Invalid ObjectId:', documentId);
        return [];
      }
      
      const mainDoc = await collection.findOne({ _id: objectId });
      
      if (!mainDoc) return [];
      
      let allVersions = [mainDoc];
      
      // Find all versions linked to this document
      const linkedVersions = await collection.find({
        previousVersion: documentId
      })
      .sort({ createdAt: -1 })
      .toArray();
      
      allVersions = [...allVersions, ...linkedVersions];
      
      return allVersions
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .map(version => ({
          ...version,
          _id: version._id.toString()
        }));
    } catch (error) {
      console.error('❌ Error in getVersions:', error);
      throw error;
    }
  }

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