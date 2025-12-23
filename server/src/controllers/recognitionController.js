// src/controllers/recognitionController.js
import { ObjectId } from 'mongodb';
import connectDB from '../config/db.js';
import { generatePDFCertificate } from '../utils/pdfGenerator.js';

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
        sortOrder = 'desc',
        recognitionType,
        employeeId
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
      
      if (recognitionType) {
        filter.recognitionType = recognitionType;
      }
      
      if (employeeId) {
        filter.employeeId = employeeId.toString();
      }
      
      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);
      const skip = (pageNum - 1) * limitNum;
      
      const total = await recognitionsCollection.countDocuments(filter);
      
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

  async getRecognitionByEmployeeId(req, res) {
    try {
      const { employeeId } = req.params;
      
      if (!employeeId) {
        return res.status(400).json({ 
          success: false, 
          message: 'Employee ID is required' 
        });
      }
      
      const db = await connectDB();
      const recognitionsCollection = db.collection('recognitions');
      const usersCollection = db.collection('users');
      
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
      
      if (!employee) {
        return res.status(404).json({ 
          success: false, 
          message: 'Employee not found' 
        });
      }
      
      const recognitions = await recognitionsCollection
        .find({ 
          employeeId: employeeId.toString(),
          status: { $in: ['published', 'scheduled', 'draft'] }
        })
        .sort({ createdAt: -1 })
        .toArray();
      
      const employeeData = {
        _id: employee._id,
        employeeId: employee.employeeId,
        name: `${employee.firstName} ${employee.lastName}`,
        department: employee.department,
        position: employee.role,
        email: employee.email,
        avatar: employee.avatar
      };
      
      const formattedRecognitions = recognitions.map(recognition => ({
        ...recognition,
        employee: employeeData
      }));
      
      res.json({
        success: true,
        data: formattedRecognitions,
        employee: employeeData,
        count: formattedRecognitions.length
      });
      
    } catch (error) {
      console.error('Error fetching employee recognitions:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Error fetching employee recognitions',
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
      
      if (!title || !description || !employeeId) {
        return res.status(400).json({ 
          success: false, 
          message: 'Title, description, and employee are required' 
        });
      }
      
      const db = await connectDB();
      const recognitionsCollection = db.collection('recognitions');
      const usersCollection = db.collection('users');
      
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
          .slice(0, 5);
      }
      
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
      
      if (employee) {
        recognitionData.employeeName = `${employee.firstName} ${employee.lastName}`;
        recognitionData.employeePosition = employee.role;
      } else if (employeeName) {
        recognitionData.employeeName = employeeName;
        recognitionData.employeePosition = employeePosition || '';
      }
      
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
      
      const existingRecognition = await recognitionsCollection.findOne({ 
        _id: new ObjectId(id) 
      });
      
      if (!existingRecognition) {
        return res.status(404).json({ 
          success: false, 
          message: 'Recognition not found' 
        });
      }
      
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
      
      const update = {
        updatedAt: new Date()
      };
      
      if (updateData.title !== undefined) {
        update.title = updateData.title.trim();
      }
      
      if (updateData.description !== undefined) {
        update.description = updateData.description.trim();
      }
      
      if (updateData.recognitionType !== undefined) {
        update.recognitionType = updateData.recognitionType;
      }
      
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
      
      if (updateData.department !== undefined) {
        update.department = updateData.department;
      }
      
      if (updateData.tags !== undefined) {
        update.tags = Array.isArray(updateData.tags) 
          ? updateData.tags.map(t => t.trim()).filter(t => t)
          : updateData.tags.split(',').map(t => t.trim()).filter(t => t);
      }
      
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
            .slice(0, 5);
        }
        
        update.images = processedImages;
        update.metadata = {
          ...existingRecognition.metadata,
          hasImages: processedImages.length > 0
        };
      }
      
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
      
      const updatedRecognition = await recognitionsCollection.findOne({ 
        _id: new ObjectId(id) 
      });
      
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
  },

  async generateCertificate(req, res) {
    try {
      const { 
        recognitionId, 
        employeeId, 
        type, 
        title, 
        employeeName, 
        date,
        preview = false 
      } = req.body;

      console.log('🔵 Certificate generation request:', {
        recognitionId,
        employeeName,
        title,
        preview
      });

      // Basic validation
      if (!recognitionId || !employeeName || !title) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields for certificate generation'
        });
      }

      // Generate certificate data
      const certificateData = {
        recognitionId: recognitionId,
        employeeName: employeeName,
        employeeId: employeeId || 'N/A',
        title: title,
        recognitionType: type || 'recognition',
        date: date || new Date(),
        issuedDate: new Date(),
        certificateNumber: `CERT-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
        issuer: "Your Company",
        signature: "CEO Signature",
        seal: "Company Seal"
      };

      console.log('📄 Generating certificate with data:', certificateData);

      // Generate PDF certificate
      const pdfBuffer = await generatePDFCertificate(certificateData);
      
      // Set appropriate headers
      if (preview) {
        // For preview (view in browser)
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'inline; filename=certificate-preview.pdf');
        console.log('👁️ Sending certificate for preview');
      } else {
        // For download
        res.setHeader('Content-Type', 'application/pdf');
        const filename = `certificate_${certificateData.employeeName.replace(/\s+/g, '_')}_${certificateData.certificateNumber}.pdf`;
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        console.log('⬇️ Sending certificate for download');
      }
      
      res.send(pdfBuffer);

    } catch (error) {
      console.error('❌ Error generating certificate:', error);
      
      // Send error response
      res.status(500).json({
        success: false,
        message: 'Error generating certificate',
        error: error.message
      });
    }
  },

  async getCertificate(req, res) {
    try {
      const { recognitionId } = req.params;
      
      if (!recognitionId) {
        return res.status(400).json({
          success: false,
          message: 'Recognition ID is required'
        });
      }

      const db = await connectDB();
      const recognitionsCollection = db.collection('recognitions');
      
      let recognition;
      try {
        recognition = await recognitionsCollection.findOne({
          _id: ObjectId.isValid(recognitionId) ? new ObjectId(recognitionId) : recognitionId
        });
      } catch (error) {
        console.error('Error finding recognition:', error);
        recognition = null;
      }

      if (!recognition) {
        return res.status(404).json({
          success: false,
          message: 'Recognition not found'
        });
      }

      // Generate certificate data from recognition
      const certificateData = {
        recognitionId: recognition._id,
        employeeName: recognition.employeeName || 'Employee',
        employeeId: recognition.employeeId || 'N/A',
        title: recognition.title || 'Recognition',
        recognitionType: recognition.recognitionType || 'recognition',
        date: recognition.createdAt || new Date(),
        issuedDate: new Date(),
        certificateNumber: `CERT-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
        issuer: "Your Company",
        signature: "CEO Signature",
        seal: "Company Seal"
      };

      // Generate PDF
      const pdfBuffer = await generatePDFCertificate(certificateData);

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `inline; filename="certificate_${certificateData.employeeName.replace(/\s+/g, '_')}.pdf"`);
      res.send(pdfBuffer);

    } catch (error) {
      console.error('Error getting certificate:', error);
      res.status(500).json({
        success: false,
        message: 'Error getting certificate',
        error: error.message
      });
    }
  }
};