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
            name: recognition.employeeName || 'Unknown Employee',
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
          name: recognition.employeeName || 'Unknown Employee',
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
      const io = req.app.get('socketio');
      const { 
        title, 
        description, 
        employeeId, 
        recognitionType, 
        tags = [], 
        status = 'draft',
        department = '',
        scheduleDate,
        images = [],
        employeeName,
        employeePosition
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
      const usersCollection = db.collection('users');
      
      // Get employee details
      const employee = await usersCollection.findOne(
        { employeeId: employeeId.toString() },
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
      
      // Handle images - should be Cloudinary objects
      let processedImages = [];
      if (Array.isArray(images) && images.length > 0) {
        processedImages = images
          .filter(img => img && (img.url || img.secure_url) && img.public_id)
          .map(img => ({
            url: img.url || img.secure_url,
            secure_url: img.secure_url || img.url,
            public_id: img.public_id,
            name: img.name || `image_${Date.now()}`,
            uploadedAt: img.uploadedAt || new Date()
          }))
          .slice(0, 5); // Limit to 5 images
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
        department: department || (employee ? employee.department : ''),
        scheduleDate: finalScheduleDate,
        metadata: {
          department: department || (employee ? employee.department : ''),
          isFeatured: false,
          isHighlighted: false,
          hasImages: processedImages.length > 0
        },
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      // Add employee name if provided or from database
      if (employee) {
        recognitionData.employeeName = `${employee.firstName} ${employee.lastName}`;
        recognitionData.employeePosition = employee.role;
      } else if (employeeName) {
        recognitionData.employeeName = employeeName;
        recognitionData.employeePosition = employeePosition || '';
      }
      
      // Insert into database
      const result = await recognitionsCollection.insertOne(recognitionData);
      
      const createdRecognition = {
        _id: result.insertedId,
        ...recognitionData,
        employee: employee ? {
          _id: employee._id,
          employeeId: employee.employeeId,
          name: `${employee.firstName} ${employee.lastName}`,
          department: employee.department,
          position: employee.role,
          email: employee.email,
          avatar: employee.avatar
        } : {
          name: employeeName || 'Unknown Employee',
          employeeId: employeeId,
          department: department || 'Unknown'
        }
      };
      
      // Emit socket event
      if (io) {
        if (finalStatus === 'published') {
          io.to('admin-room').emit('adminNewRecognition', createdRecognition);
          io.emit('newRecognition', createdRecognition);
        } else if (finalStatus === 'scheduled') {
          io.to('admin-room').emit('adminRecognitionScheduled', createdRecognition);
        } else {
          io.to('admin-room').emit('adminRecognitionDraftCreated', createdRecognition);
        }
      }
      
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
      const io = req.app.get('socketio');
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
      const usersCollection = db.collection('users');
      
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
      
      // Get employee details if employeeId is being updated
      let employee = null;
      if (updateData.employeeId) {
        employee = await usersCollection.findOne(
          { employeeId: updateData.employeeId.toString() },
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
        if (employee) {
          update.employeeName = `${employee.firstName} ${employee.lastName}`;
          update.employeePosition = employee.role;
          update.department = employee.department;
        } else if (updateData.employeeName) {
          update.employeeName = updateData.employeeName;
          update.employeePosition = updateData.employeePosition || '';
        }
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
      
      // Handle images
      if (updateData.images !== undefined) {
        let processedImages = [];
        
        if (Array.isArray(updateData.images) && updateData.images.length > 0) {
          processedImages = updateData.images
            .filter(img => img && (img.url || img.secure_url) && img.public_id)
            .map(img => ({
              url: img.url || img.secure_url,
              secure_url: img.secure_url || img.url,
              public_id: img.public_id,
              name: img.name || `image_${Date.now()}`,
              uploadedAt: img.uploadedAt || new Date()
            }))
            .slice(0, 5); // Limit to 5 images
        }
        
        update.images = processedImages;
        update.metadata = {
          ...existingRecognition.metadata,
          hasImages: processedImages.length > 0
        };
      }
      
      // Handle status and schedule date
      let newStatus = existingRecognition.status;
      if (updateData.status !== undefined || updateData.scheduleDate !== undefined) {
        newStatus = updateData.status || existingRecognition.status;
        const newScheduleDate = updateData.scheduleDate ? new Date(updateData.scheduleDate) : existingRecognition.scheduleDate;
        
        if (newScheduleDate && newScheduleDate <= new Date()) {
          update.status = 'published';
          update.scheduleDate = null;
          newStatus = 'published';
        } else if (newScheduleDate) {
          update.status = 'scheduled';
          update.scheduleDate = newScheduleDate;
          newStatus = 'scheduled';
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
      
      // Get employee details for the response
      const currentEmployee = await usersCollection.findOne(
        { employeeId: updatedRecognition.employeeId },
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
        ...updatedRecognition,
        employee: currentEmployee ? {
          _id: currentEmployee._id,
          employeeId: currentEmployee.employeeId,
          name: `${currentEmployee.firstName} ${currentEmployee.lastName}`,
          department: currentEmployee.department,
          position: currentEmployee.role,
          email: currentEmployee.email,
          avatar: currentEmployee.avatar
        } : {
          name: updatedRecognition.employeeName || 'Unknown Employee',
          employeeId: updatedRecognition.employeeId,
          department: updatedRecognition.department || 'Unknown'
        }
      };
      
      // Emit socket event
      if (io) {
        if (newStatus === 'published' && existingRecognition.status !== 'published') {
          io.to('admin-room').emit('adminRecognitionPublished', recognitionWithDetails);
          io.emit('recognitionPublished', recognitionWithDetails);
        } else {
          io.to('admin-room').emit('adminRecognitionUpdated', recognitionWithDetails);
          if (newStatus === 'published') {
            io.emit('recognitionUpdated', recognitionWithDetails);
          }
        }
      }
      
      res.json({
        success: true,
        message: 'Recognition updated successfully',
        data: recognitionWithDetails
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
      const io = req.app.get('socketio');
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
      
      const newStatus = action === 'archive' ? 'archived' : 'published';
      const previousStatus = recognition.status;
      
      await recognitionsCollection.updateOne(
        { _id: new ObjectId(id) },
        { 
          $set: { 
            status: newStatus,
            updatedAt: new Date()
          } 
        }
      );
      
      // Get updated recognition with employee details
      const updatedRecognition = await recognitionsCollection.findOne({ 
        _id: new ObjectId(id) 
      });
      
      const employee = await usersCollection.findOne(
        { employeeId: updatedRecognition.employeeId },
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
        ...updatedRecognition,
        employee: employee ? {
          _id: employee._id,
          employeeId: employee.employeeId,
          name: `${employee.firstName} ${employee.lastName}`,
          department: employee.department,
          position: employee.role,
          email: employee.email,
          avatar: employee.avatar
        } : {
          name: updatedRecognition.employeeName || 'Unknown Employee',
          employeeId: updatedRecognition.employeeId,
          department: updatedRecognition.department || 'Unknown'
        }
      };
      
      // Emit socket event
      if (io) {
        if (action === 'archive') {
          io.to('admin-room').emit('adminRecognitionArchived', { 
            recognitionId: id,
            title: recognition.title,
            data: recognitionWithDetails
          });
          if (previousStatus === 'published') {
            io.emit('recognitionArchived', { 
              recognitionId: id,
              title: recognition.title 
            });
          }
        } else {
          io.to('admin-room').emit('adminRecognitionRestored', {
            recognitionId: id,
            title: recognition.title,
            data: recognitionWithDetails
          });
          io.emit('recognitionRestored', {
            recognitionId: id,
            title: recognition.title
          });
        }
      }
      
      res.json({
        success: true,
        message: action === 'archive' 
          ? 'Recognition archived successfully' 
          : 'Recognition restored successfully',
        data: recognitionWithDetails
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
      const io = req.app.get('socketio');
      const { id } = req.params;
      
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
      
      const result = await recognitionsCollection.deleteOne({ 
        _id: new ObjectId(id) 
      });
      
      if (result.deletedCount === 0) {
        return res.status(404).json({ 
          success: false, 
          message: 'Recognition not found' 
        });
      }
      
      // Emit socket event
      if (io) {
        io.to('admin-room').emit('adminRecognitionDeleted', { 
          recognitionId: id,
          title: recognition.title
        });
        if (recognition.status === 'published') {
          io.emit('recognitionDeleted', { 
            recognitionId: id,
            title: recognition.title
          });
        }
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