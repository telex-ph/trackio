import { ObjectId } from 'mongodb';
import connectDB from '../config/db.js';

export const recognitionController = {
  async getRecognitions(req, res) {
    try {
      const db = await connectDB();
      const recognitionsCollection = db.collection('recognitions');
      const usersCollection = db.collection('users');
      
      const { 
        status, 
        page = 1, 
        limit = 12,
        sortBy = 'createdAt',
        sortOrder = 'desc'
      } = req.query;
      
      const filter = {};
      
      if (status && status !== 'all') {
        if (status === 'published') {
          // Include scheduled posts that should now be published
          filter.$or = [
            { status: 'published' },
            { 
              status: 'scheduled',
              scheduleDate: { $lte: new Date() }
            }
          ];
        } else {
          filter.status = status;
        }
      }
      
      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);
      const skip = (pageNum - 1) * limitNum;
      
      const total = await recognitionsCollection.countDocuments(filter);
      
      // Auto-publish scheduled posts that are due
      const now = new Date();
      await recognitionsCollection.updateMany(
        { 
          status: 'scheduled', 
          scheduleDate: { $lte: now }
        },
        { 
          $set: { 
            status: 'published',
            scheduleDate: null,
            updatedAt: now
          }
        }
      );
      
      const recognitions = await recognitionsCollection
        .find(filter)
        .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
        .skip(skip)
        .limit(limitNum)
        .toArray();
      
      // Fetch employee details
      const uniqueEmployeeIds = [...new Set(recognitions.map(r => r.employeeId).filter(Boolean))];
      const employeesMap = {};

      if (uniqueEmployeeIds.length > 0) {
        const employees = await usersCollection.find(
          { employeeId: { $in: uniqueEmployeeIds } },
          { 
            projection: { 
              _id: 1,
              employeeId: 1,
              firstName: 1,
              lastName: 1,
              department: 1,
              role: 1,
              email: 1,
              avatar: 1
            } 
          }
        ).toArray();
        
        employees.forEach(emp => {
          employeesMap[emp.employeeId] = emp;
        });
      }

      const recognitionsWithDetails = recognitions.map((recognition) => {
        const employee = employeesMap[recognition.employeeId];
        
        return {
          ...recognition,
          employee: employee ? {
            _id: employee._id,
            employeeId: employee.employeeId,
            name: `${employee.firstName} ${employee.lastName}`,
            department: employee.department,
            position: employee.role,
            email: employee.email,
            avatar: employee.avatar
          } : {
            name: 'Unknown Employee',
            employeeId: recognition.employeeId,
            department: recognition.department || 'Unknown'
          }
        };
      });
      
      res.json({
        success: true,
        data: recognitionsWithDetails,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum)
        }
      });
      
    } catch (error) {
      console.error('Error fetching recognitions:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Error fetching recognitions',
        error: error.message 
      });
    }
  },

  async getRecognitionById(req, res) {
    try {
      const { id } = req.params;
      
      if (!ObjectId.isValid(id)) {
        return res.status(400).json({ 
          success: false, 
          message: 'Invalid recognition ID' 
        });
      }
      
      const db = await connectDB();
      const recognitionsCollection = db.collection('recognitions');
      const usersCollection = db.collection('users');
      
      const recognition = await recognitionsCollection.findOne({ 
        _id: new ObjectId(id) 
      });
      
      if (!recognition) {
        return res.status(404).json({ 
          success: false, 
          message: 'Recognition not found' 
        });
      }
      
      // Increment view count
      await recognitionsCollection.updateOne(
        { _id: new ObjectId(id) },
        { $inc: { 'engagement.views': 1 } }
      );
      
      // Get employee details
      const employee = await usersCollection.findOne(
        { employeeId: recognition.employeeId },
        { 
          projection: { 
            _id: 1,
            employeeId: 1,
            firstName: 1,
            lastName: 1,
            department: 1,
            role: 1,
            email: 1,
            avatar: 1
          } 
        }
      );
      
      const recognitionWithDetails = {
        ...recognition,
        employee: employee ? {
          _id: employee._id,
          employeeId: employee.employeeId,
          name: `${employee.firstName} ${employee.lastName}`,
          department: employee.department,
          position: employee.role,
          email: employee.email,
          avatar: employee.avatar
        } : {
          name: 'Unknown Employee',
          employeeId: recognition.employeeId,
          department: recognition.department || 'Unknown'
        }
      };
      
      res.json({
        success: true,
        data: recognitionWithDetails
      });
      
    } catch (error) {
      console.error('Error fetching recognition:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Error fetching recognition',
        error: error.message 
      });
    }
  },

  async createRecognition(req, res) {
    try {
      const { 
        title, 
        description, 
        employeeId, 
        recognitionType, 
        tags = [], 
        status = 'draft',
        department = '',
        scheduleDate,
        images = []
      } = req.body;
      
      // Validation
      if (!title || !description || !employeeId) {
        return res.status(400).json({ 
          success: false, 
          message: 'Title, description, and employee are required' 
        });
      }
      
      const db = await connectDB();
      const recognitionsCollection = db.collection('recognitions');
      
      // Process images
      let processedImages = [];
      if (Array.isArray(images) && images.length > 0) {
        processedImages = images.map((img, index) => {
          if (typeof img === 'object' && img.data) {
            return img;
          }
          
          return {
            id: new ObjectId().toString(),
            data: img,
            type: img.match(/^data:image\/(\w+);base64,/)?.[1] || 'jpeg',
            size: Math.floor((img.length * 3) / 4),
            uploadedAt: new Date(),
            name: `image_${Date.now()}_${index}`
          };
        }).slice(0, 5);
      }
      
      // Handle schedule date
      let finalStatus = status;
      let finalScheduleDate = null;
      
      if (scheduleDate) {
        const scheduleDateTime = new Date(scheduleDate);
        if (scheduleDateTime <= new Date()) {
          finalStatus = 'published';
        } else {
          finalStatus = 'scheduled';
          finalScheduleDate = scheduleDateTime;
        }
      }
      
      // Create recognition object
      const recognitionData = {
        title: title.trim(),
        description: description.trim(),
        recognitionType: recognitionType || 'employee_of_month',
        employeeId: employeeId.toString(),
        tags: Array.isArray(tags) ? tags : (tags ? tags.split(',').map(t => t.trim()).filter(t => t) : []),
        images: processedImages,
        status: finalStatus,
        department: department || '',
        scheduleDate: finalScheduleDate,
        engagement: {
          likes: 0,
          comments: 0,
          views: 0,
          shares: 0,
          likedBy: []
        },
        metadata: {
          department: department || '',
          isFeatured: false,
          isHighlighted: false,
          hasImages: processedImages.length > 0
        },
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      // Insert into database
      const result = await recognitionsCollection.insertOne(recognitionData);
      
      const createdRecognition = {
        _id: result.insertedId,
        ...recognitionData
      };
      
      res.status(201).json({
        success: true,
        message: finalStatus === 'scheduled' 
          ? 'Recognition scheduled successfully!' 
          : finalStatus === 'published'
          ? 'Recognition published successfully!'
          : 'Recognition saved as draft!',
        data: createdRecognition
      });
      
    } catch (error) {
      console.error('Error creating recognition:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Error creating recognition',
        error: error.message 
      });
    }
  },

  async updateRecognition(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;
      
      if (!ObjectId.isValid(id)) {
        return res.status(400).json({ 
          success: false, 
          message: 'Invalid recognition ID' 
        });
      }
      
      const db = await connectDB();
      const recognitionsCollection = db.collection('recognitions');
      
      // Check if recognition exists
      const existingRecognition = await recognitionsCollection.findOne({ 
        _id: new ObjectId(id) 
      });
      
      if (!existingRecognition) {
        return res.status(404).json({ 
          success: false, 
          message: 'Recognition not found' 
        });
      }
      
      // Prepare update object
      const update = {
        updatedAt: new Date()
      };
      
      // Handle title
      if (updateData.title !== undefined) {
        update.title = updateData.title.trim();
      }
      
      // Handle description
      if (updateData.description !== undefined) {
        update.description = updateData.description.trim();
      }
      
      // Handle recognition type
      if (updateData.recognitionType !== undefined) {
        update.recognitionType = updateData.recognitionType;
      }
      
      // Handle employee ID
      if (updateData.employeeId !== undefined) {
        update.employeeId = updateData.employeeId.toString();
      }
      
      // Handle department
      if (updateData.department !== undefined) {
        update.department = updateData.department;
      }
      
      // Handle tags
      if (updateData.tags !== undefined) {
        update.tags = Array.isArray(updateData.tags) 
          ? updateData.tags.map(t => t.trim()).filter(t => t)
          : updateData.tags.split(',').map(t => t.trim()).filter(t => t);
      }
      
      // Handle images - FIXED: Combine existing and new images properly
      if (updateData.images !== undefined) {
        let images = [];
        
        // Keep existing images that are still in the array
        const existingImageIds = updateData.images
          .filter(img => typeof img === 'object' && img.id)
          .map(img => img.id);
        
        images = existingRecognition.images.filter(img => 
          existingImageIds.includes(img.id)
        );
        
        // Add new base64 images
        updateData.images.forEach(img => {
          if (typeof img === 'string' && img.startsWith('data:image')) {
            images.push({
              id: new ObjectId().toString(),
              data: img,
              type: img.match(/^data:image\/(\w+);base64,/)?.[1] || 'jpeg',
              size: Math.floor((img.length * 3) / 4),
              uploadedAt: new Date(),
              name: `image_${Date.now()}`
            });
          }
        });
        
        // Limit to 5 images
        update.images = images.slice(0, 5);
        update.metadata = {
          ...existingRecognition.metadata,
          hasImages: images.length > 0
        };
      }
      
      // Handle status and schedule date
      if (updateData.status !== undefined || updateData.scheduleDate !== undefined) {
        const newStatus = updateData.status || existingRecognition.status;
        const newScheduleDate = updateData.scheduleDate ? new Date(updateData.scheduleDate) : existingRecognition.scheduleDate;
        
        if (newScheduleDate && newScheduleDate <= new Date()) {
          update.status = 'published';
          update.scheduleDate = null;
        } else if (newScheduleDate) {
          update.status = 'scheduled';
          update.scheduleDate = newScheduleDate;
        } else {
          update.status = newStatus;
        }
      }
      
      // Perform update
      const result = await recognitionsCollection.updateOne(
        { _id: new ObjectId(id) },
        { $set: update }
      );
      
      if (result.matchedCount === 0) {
        return res.status(404).json({ 
          success: false, 
          message: 'Recognition not found' 
        });
      }
      
      // Get updated recognition
      const updatedRecognition = await recognitionsCollection.findOne({ 
        _id: new ObjectId(id) 
      });
      
      res.json({
        success: true,
        message: 'Recognition updated successfully',
        data: updatedRecognition
      });
      
    } catch (error) {
      console.error('Error updating recognition:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Error updating recognition',
        error: error.message 
      });
    }
  },

  async toggleArchive(req, res) {
    try {
      const { id } = req.params;
      const { action } = req.body;
      
      if (!ObjectId.isValid(id)) {
        return res.status(400).json({ 
          success: false, 
          message: 'Invalid recognition ID' 
        });
      }
      
      if (!['archive', 'restore'].includes(action)) {
        return res.status(400).json({ 
          success: false, 
          message: 'Invalid action. Use "archive" or "restore"' 
        });
      }
      
      const db = await connectDB();
      const recognitionsCollection = db.collection('recognitions');
      
      const recognition = await recognitionsCollection.findOne({ 
        _id: new ObjectId(id) 
      });
      
      if (!recognition) {
        return res.status(404).json({ 
          success: false, 
          message: 'Recognition not found' 
        });
      }
      
      const newStatus = action === 'archive' ? 'archived' : 'published';
      
      await recognitionsCollection.updateOne(
        { _id: new ObjectId(id) },
        { 
          $set: { 
            status: newStatus,
            updatedAt: new Date()
          } 
        }
      );
      
      res.json({
        success: true,
        message: action === 'archive' 
          ? 'Recognition archived successfully' 
          : 'Recognition restored successfully',
        data: { status: newStatus }
      });
      
    } catch (error) {
      console.error('Error toggling archive:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Error updating recognition status',
        error: error.message 
      });
    }
  },

  async deleteRecognition(req, res) {
    try {
      const { id } = req.params;
      
      if (!ObjectId.isValid(id)) {
        return res.status(400).json({ 
          success: false, 
          message: 'Invalid recognition ID' 
        });
      }
      
      const db = await connectDB();
      const recognitionsCollection = db.collection('recognitions');
      
      const result = await recognitionsCollection.deleteOne({ 
        _id: new ObjectId(id) 
      });
      
      if (result.deletedCount === 0) {
        return res.status(404).json({ 
          success: false, 
          message: 'Recognition not found' 
        });
      }
      
      res.json({
        success: true,
        message: 'Recognition deleted successfully'
      });
      
    } catch (error) {
      console.error('Error deleting recognition:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Error deleting recognition',
        error: error.message 
      });
    }
  },

  async toggleLike(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user?.id || req.user?._id || 'anonymous';
      
      if (!ObjectId.isValid(id)) {
        return res.status(400).json({ 
          success: false, 
          message: 'Invalid recognition ID' 
        });
      }
      
      const db = await connectDB();
      const recognitionsCollection = db.collection('recognitions');
      
      const recognition = await recognitionsCollection.findOne({ 
        _id: new ObjectId(id) 
      });
      
      if (!recognition) {
        return res.status(404).json({ 
          success: false, 
          message: 'Recognition not found' 
        });
      }
      
      const hasLiked = recognition.engagement?.likedBy?.includes(userId);
      
      let updateOperation = {};
      let message = '';
      
      if (hasLiked) {
        updateOperation = {
          $inc: { 'engagement.likes': -1 },
          $pull: { 'engagement.likedBy': userId }
        };
        message = 'Unliked successfully';
      } else {
        updateOperation = {
          $inc: { 'engagement.likes': 1 }, 
          $addToSet: { 'engagement.likedBy': userId } 
        };
        message = 'Liked successfully';
      }
      
      await recognitionsCollection.updateOne(
        { _id: new ObjectId(id) },
        updateOperation
      );
      
      const updatedRecognition = await recognitionsCollection.findOne(
        { _id: new ObjectId(id) }
      );
      
      res.json({
        success: true,
        message: message,
        data: {
          likes: updatedRecognition.engagement?.likes || 0,
          isLiked: !hasLiked
        }
      });
      
    } catch (error) {
      console.error('Error toggling like:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Error processing like/unlike',
        error: error.message 
      });
    }
  },

  async searchEmployees(req, res) {
    try {
      const { search = '' } = req.query;
      
      const db = await connectDB();
      const usersCollection = db.collection('users');
      
      if (!search || search.length < 2) {
        return res.json({
          success: true,
          data: []
        });
      }
      
      const employees = await usersCollection
        .find({
          $or: [
            { firstName: { $regex: search, $options: 'i' } },
            { lastName: { $regex: search, $options: 'i' } },
            { employeeId: { $regex: search, $options: 'i' } },
            { department: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } }
          ]
        })
        .project({
          _id: 1,
          employeeId: 1,
          firstName: 1,
          lastName: 1,
          department: 1,
          role: 1,
          email: 1,
          avatar: 1
        })
        .limit(20)
        .toArray();
      
      const formattedEmployees = employees.map(emp => ({
        id: emp.employeeId,
        _id: emp._id,
        employeeId: emp.employeeId,
        name: `${emp.firstName} ${emp.lastName}`,
        department: emp.department,
        position: emp.role,
        email: emp.email,
        avatar: emp.avatar
      }));
      
      res.json({
        success: true,
        data: formattedEmployees
      });
      
    } catch (error) {
      console.error('Error searching employees:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Error searching employees',
        error: error.message 
      });
    }
  }
};