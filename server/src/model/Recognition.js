import { ObjectId } from 'mongodb';

export class Recognition {
  constructor(data) {
    this.title = data.title;
    this.description = data.description;
    this.recognitionType = data.recognitionType || 'employee_of_month';
    this.employeeId = data.employeeId;
    this.postedById = data.postedById ? new ObjectId(data.postedById) : null;
    this.tags = data.tags || [];
    
    // Store Cloudinary image objects
    this.images = data.images || []; // Should be array of {url, secure_url, public_id, name}
    
    this.status = data.status || 'draft';
    this.metadata = {
      department: data.department || '',
      isFeatured: false,
      isHighlighted: false,
      hasImages: data.images && data.images.length > 0
    };
    this.scheduleDate = data.scheduleDate ? new Date(data.scheduleDate) : null;
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  validate() {
    const errors = [];
    
    if (!this.title || this.title.trim() === '') {
      errors.push('Title is required');
    }
    
    if (!this.description || this.description.trim() === '') {
      errors.push('Description is required');
    }
    
    if (!this.employeeId) {
      errors.push('Employee ID is required');
    }
    
    return errors;
  }
}

export const RecognitionTypes = {
  EMPLOYEE_OF_MONTH: 'employee_of_month',
  EXCELLENCE_AWARD: 'excellence_award',
  INNOVATION: 'innovation',
  TEAM_PLAYER: 'team_player',
  OTHER: 'other'
};

export const RecognitionStatus = {
  DRAFT: 'draft',
  PUBLISHED: 'published',
  SCHEDULED: 'scheduled',
  PENDING_REVIEW: 'pending_review',
  ARCHIVED: 'archived'
};