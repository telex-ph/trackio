import React, { useState, useEffect, useCallback } from 'react';
import { useStore } from "../../store/useStore";
import api from '../../utils/axios';

const HRRepository = () => {
  const [folders, setFolders] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedFolder, setSelectedFolder] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showVersionsModal, setShowVersionsModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showFolderModal, setShowFolderModal] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [versions, setVersions] = useState([]);
  const [archivedDocuments, setArchivedDocuments] = useState([]);
  const [viewArchived, setViewArchived] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [newFolder, setNewFolder] = useState({ name: '', description: '' });
  
  const [newDocument, setNewDocument] = useState({
    title: '',
    description: '',
    category: 'Policies',
    folderId: '',
    accessRoles: ['hr_admin', 'team_lead', 'employee'],
    file: null,
    fileName: '',
    fileType: ''
  });

  const [editDocument, setEditDocument] = useState({
    title: '',
    description: '',
    category: 'Policies',
    folderId: '',
    accessRoles: []
  });

  const user = useStore((state) => state.user);
  const userRole = user?.role || 'employee';
  const userId = user?._id || '';
  
  const normalizedRole = userRole?.replace(/-/g, '_');
  const categories = ['Policies', 'Contracts', 'NTE', 'COE', 'Clearance', 'Other'];

  const getAuthenticatedApi = () => {
    if (!user) return api;
    
    const authenticatedApi = api.create({
      baseURL: import.meta.env.VITE_API_BASE_URL,
      timeout: 30000,
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    authenticatedApi.interceptors.request.use(
      (config) => {
        config.headers['x-user-id'] = userId;
        config.headers['x-user-role'] = userRole;
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );
    
    authenticatedApi.interceptors.response.use(
      (response) => {
        console.log(`✅ ${response.config.method?.toUpperCase()} ${response.config.url}:`, response.status);
        return response;
      },
      async (error) => {
        console.error(`❌ API Error (${error.config?.url}):`, error.response?.status, error.message);
        
        const code = error.response?.data?.code;
        
        if (window.location.pathname === "/login") {
          return Promise.reject(error);
        }
        
        if (code === "ACCESS_TOKEN_EXPIRED") {
          try {
            await api.post("/auth/create-new-token");
            return authenticatedApi(error.config);
          } catch (refreshError) {
            console.error("Refresh token failed:", refreshError);
            window.location.href = "/login";
            return Promise.reject(refreshError);
          }
        } else if (code === "REFRESH_TOKEN_EXPIRED") {
          window.location.href = "/login";
        }
        
        if (error.response?.data?.error) {
          setError(error.response.data.error);
        } else if (error.message === 'Network Error') {
          setError('Network error. Please check your connection.');
        } else if (error.code === 'ERR_NETWORK') {
          setError('Server connection failed. Please try again.');
        }
        
        return Promise.reject(error);
      }
    );
    
    return authenticatedApi;
  };

  const fetchFolders = useCallback(async () => {
    try {
      setError(null);
      const authApi = getAuthenticatedApi();
      const response = await authApi.get('/repository/folders');
      
      if (response.data && Array.isArray(response.data)) {
        setFolders(response.data);
      } else {
        setFolders([]);
      }
    } catch (error) {
      console.error('Error fetching folders:', error);
      if (error.response?.status !== 401) {
        setError('Failed to load folders: ' + (error.response?.data?.error || error.message));
      }
      setFolders([]);
    }
  }, [user]);

  const fetchDocuments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const authApi = getAuthenticatedApi();
      const params = {};
      
      if (selectedCategory && selectedCategory !== '' && selectedCategory !== 'All') {
        params.category = selectedCategory;
      }
      
      if (selectedFolder && selectedFolder !== 'null') {
        params.folderId = selectedFolder;
      } else if (selectedFolder === 'null') {
        params.folderId = 'null';
      }
      
      if (searchQuery) {
        params.search = searchQuery;
      }
      
      const response = await authApi.get('/repository/documents', { params });
      
      if (response.data && Array.isArray(response.data)) {
        setDocuments(response.data);
      } else {
        setDocuments([]);
      }
    } catch (error) {
      console.error('Error fetching documents:', error);
      if (error.response?.status !== 401) {
        setError('Failed to load documents: ' + (error.response?.data?.error || error.message));
      }
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, selectedFolder, searchQuery, user]);

  const fetchArchivedDocuments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const authApi = getAuthenticatedApi();
      const params = {};
      
      if (searchQuery) {
        params.search = searchQuery;
      }
      
      const response = await authApi.get('/repository/archived', { params });
      
      if (response.data && Array.isArray(response.data)) {
        setArchivedDocuments(response.data);
      } else {
        setArchivedDocuments([]);
      }
    } catch (error) {
      console.error('Error fetching archived:', error);
      if (error.response?.status !== 401) {
        setError('Failed to load archived documents: ' + (error.response?.data?.error || error.message));
      }
      setArchivedDocuments([]);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, user]);

  useEffect(() => {
    if (user) {
      fetchFolders();
    } else {
      setError('Please login to access HR Repository');
    }
  }, [fetchFolders, user]);

  useEffect(() => {
    if (user) {
      if (viewArchived) {
        fetchArchivedDocuments();
      } else {
        fetchDocuments();
      }
    }
  }, [selectedCategory, selectedFolder, viewArchived, searchQuery, fetchDocuments, fetchArchivedDocuments, user]);

  const fetchVersions = async (docId) => {
    try {
      const authApi = getAuthenticatedApi();
      const response = await authApi.get(`/repository/documents/${docId}/versions`);
      
      if (response.data && Array.isArray(response.data)) {
        setVersions(response.data);
      } else {
        setVersions([]);
      }
    } catch (error) {
      console.error('Error fetching versions:', error);
      alert('Error: ' + (error.response?.data?.error || error.message || 'Failed to load versions'));
    }
  };

  const handleCreateFolder = async (e) => {
    e.preventDefault();
    
    if (!newFolder.name.trim()) {
      alert('Folder name is required');
      return;
    }
    
    try {
      const authApi = getAuthenticatedApi();
      const response = await authApi.post('/repository/folders', newFolder);
      
      alert('Folder created successfully!');
      
      setShowFolderModal(false);
      setNewFolder({ name: '', description: '' });
      fetchFolders();
      
      if (response.data?._id) {
        setSelectedFolder(response.data._id);
      }
    } catch (error) {
      console.error('Create folder error:', error);
      alert('Failed to create folder: ' + (error.response?.data?.error || error.message || 'Unknown error'));
    }
  };

  const handleDeleteFolder = async (folderId) => {
    if (!folderId) return;
    
    if (!confirm('Are you sure you want to delete this folder?\n\nDocuments inside will be moved to root folder.')) return;
    
    try {
      const authApi = getAuthenticatedApi();
      await authApi.delete(`/repository/folders/${folderId}`);
      
      alert('Folder deleted successfully! Documents moved to root.');
      
      if (selectedFolder === folderId) {
        setSelectedFolder(null);
      }
      fetchFolders();
    } catch (error) {
      console.error('Delete folder error:', error);
      alert('Failed to delete folder: ' + (error.response?.data?.error || error.message || 'Unknown error'));
    }
  };

  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      try {
        const reader = new FileReader();
        
        reader.onload = (event) => {
          resolve(event.target.result);
        };
        
        reader.onerror = (error) => {
          reject(new Error('Failed to convert file to base64'));
        };
        
        reader.readAsDataURL(file);
      } catch (error) {
        reject(error);
      }
    });
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    
    if (!user) {
      alert('Please login first');
      return;
    }
    
    if (!newDocument.file) {
      alert('Please select a file');
      return;
    }
    
    if (newDocument.file.size > 20 * 1024 * 1024) {
      alert('File size must be less than 20MB');
      return;
    }
    
    if (!newDocument.title.trim() && !newDocument.file.name) {
      alert('Please enter a document title or select a file with a name');
      return;
    }
    
    try {
      setUploading(true);
      setError(null);
      
      const fileData = await fileToBase64(newDocument.file);
      
      const uploadData = {
        title: newDocument.title.trim() || newDocument.file.name.replace(/\.[^/.]+$/, ""),
        description: newDocument.description.trim(),
        category: newDocument.category,
        folderId: newDocument.folderId || '',
        accessRoles: JSON.stringify(newDocument.accessRoles),
        fileData: fileData,
        fileName: newDocument.file.name,
        fileType: newDocument.file.type
      };

      const authApi = getAuthenticatedApi();
      await authApi.post('/repository/upload', uploadData);

      alert('✅ Document uploaded successfully!');
      
      setShowUploadModal(false);
      setNewDocument({
        title: '', 
        description: '', 
        category: 'Policies',
        folderId: '', 
        accessRoles: ['hr_admin', 'team_lead', 'employee'], 
        file: null, 
        fileName: '', 
        fileType: ''
      });
      
      if (viewArchived) {
        fetchArchivedDocuments();
      } else {
        fetchDocuments();
      }

    } catch (error) {
      console.error('Upload Error:', error);
      
      let errorMessage = 'Upload failed: ';
      if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
        errorMessage = 'Network error. Please check your connection and try again.';
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage += error.message;
      } else {
        errorMessage = 'Unknown error occurred during upload.';
      }
      
      alert(errorMessage);
      setError(errorMessage);
    } finally {
      setUploading(false);
    }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    
    if (!selectedDocument) return;
    
    try {
      const authApi = getAuthenticatedApi();
      
      const updateData = {
        ...editDocument,
        folderId: editDocument.folderId || ''
      };
      
      await authApi.put(`/repository/documents/${selectedDocument._id}`, updateData);
      
      alert('Document updated successfully!');
      
      setShowEditModal(false);
      
      if (viewArchived) {
        fetchArchivedDocuments();
      } else {
        fetchDocuments();
      }
    } catch (error) {
      console.error('Edit error:', error);
      alert('Update failed: ' + (error.response?.data?.error || error.message || 'Unknown error'));
    }
  };

  const handleStatusChange = async (docId, newStatus) => {
    if (!docId) return;
    
    if (!confirm(`Are you sure you want to change status to "${newStatus}"?`)) return;
    
    try {
      const authApi = getAuthenticatedApi();
      await authApi.patch(`/repository/documents/${docId}/status`, { status: newStatus });
      
      alert('Status updated successfully!');
      
      if (viewArchived) {
        fetchArchivedDocuments();
      } else {
        fetchDocuments();
      }
    } catch (error) {
      console.error('Status change error:', error);
      alert('Status update failed: ' + (error.response?.data?.error || error.message || 'Unknown error'));
    }
  };

  const handleDelete = async () => {
    if (!selectedDocument) return;
    
    const confirmMessage = viewArchived 
      ? 'Are you sure you want to PERMANENTLY DELETE this document?\n\nThis action cannot be undone!'
      : 'Are you sure you want to delete this document?\n\nIt will be moved to archive.';
    
    if (!confirm(confirmMessage)) return;
    
    try {
      const authApi = getAuthenticatedApi();
      await authApi.delete(`/repository/documents/${selectedDocument._id}`);
      
      alert(viewArchived ? 'Document permanently deleted!' : 'Document moved to archive!');
      
      setShowDeleteModal(false);
      
      if (viewArchived) {
        fetchArchivedDocuments();
      } else {
        fetchDocuments();
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('Delete failed: ' + (error.response?.data?.error || error.message || 'Unknown error'));
    }
  };

  const handleRestore = async (versionId) => {
    if (!versionId || !selectedDocument) return;
    
    if (!confirm('Restore to this version?\n\nCurrent version will be archived.')) return;
    
    try {
      const authApi = getAuthenticatedApi();
      await authApi.post(`/repository/documents/${selectedDocument._id}/restore`, { versionId });
      
      alert('Version restored successfully!');
      
      setShowVersionsModal(false);
      
      if (viewArchived) {
        fetchArchivedDocuments();
      } else {
        fetchDocuments();
      }
    } catch (error) {
      console.error('Restore error:', error);
      alert('Restore failed: ' + (error.response?.data?.error || error.message || 'Unknown error'));
    }
  };

  const openEditModal = (doc) => {
    if (!doc) return;
    
    setSelectedDocument(doc);
    setEditDocument({
      title: doc.title || '',
      description: doc.description || '',
      category: doc.category || 'Policies',
      folderId: doc.folderId || '',
      accessRoles: doc.accessRoles || ['hr_admin', 'team_lead', 'employee']
    });
    setShowEditModal(true);
  };

  const openVersionsModal = async (doc) => {
    if (!doc) return;
    
    setSelectedDocument(doc);
    await fetchVersions(doc._id);
    setShowVersionsModal(true);
  };

  const openDeleteModal = (doc) => {
    if (!doc) return;
    
    setSelectedDocument(doc);
    setShowDeleteModal(true);
  };

  const getFolderName = (folderId) => {
    if (!folderId || folderId === 'null') return 'Root';
    const folder = folders.find(f => f._id === folderId);
    return folder ? folder.name : 'Unknown Folder';
  };

  const handleDownload = async (fileUrl) => {
    if (!fileUrl) {
      alert('No file URL provided');
      return;
    }
    
    try {
      const filename = fileUrl.split('/').pop();
      
      const authApi = getAuthenticatedApi();
      const response = await authApi.get(`/repository/download/${filename}`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      window.URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error('Download error:', error);
      alert('Failed to download file: ' + (error.response?.data?.error || 'Network error'));
    }
  };

  const isHRAdmin = ['admin_hr_head', 'admin', 'hr_admin'].includes(normalizedRole);
  const displayDocuments = viewArchived ? archivedDocuments : documents;

  if (!user) {
    return (
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-6">📁 HR Document Repository</h1>
        <div className="bg-white rounded-lg p-8 text-center">
          <div className="text-red-500 text-6xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold mb-4">Authentication Required</h2>
          <p className="text-gray-600 mb-6">Please login to access the HR Document Repository.</p>
          <button
            onClick={() => window.location.href = '/login'}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">📁 HR Document Repository</h1>

      {error && (
        <div className="mb-6 p-4 bg-red-50 rounded-lg">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-red-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <h3 className="font-semibold text-red-800">Error</h3>
          </div>
          <p className="mt-2 text-red-600">{error}</p>
          <div className="mt-3 flex gap-2">
            <button 
              onClick={() => setError(null)}
              className="px-3 py-1 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 text-sm"
            >
              Dismiss
            </button>
            <button 
              onClick={() => viewArchived ? fetchArchivedDocuments() : fetchDocuments()}
              className="px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      <div className="mb-6 bg-white rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">📂 Folders</h2>
          {isHRAdmin && !viewArchived && (
            <button
              onClick={() => setShowFolderModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New Folder
            </button>
          )}
        </div>
        
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setSelectedFolder(null)}
            className={`px-4 py-3 rounded-lg flex items-center gap-2 ${selectedFolder === null ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg>
            <span>All Files</span>
            <span className="text-xs bg-gray-200 px-2 py-1 rounded-full">{documents.filter(d => !d.folderId).length}</span>
          </button>
          
          {folders.map(folder => (
            <div key={folder._id} className="relative group">
              <button
                onClick={() => setSelectedFolder(folder._id)}
                className={`px-4 py-3 rounded-lg flex items-center gap-2 ${selectedFolder === folder._id ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                </svg>
                <span className="truncate max-w-[150px]">{folder.name}</span>
                {folder.description && (
                  <span className="text-xs text-gray-500 ml-2 hidden md:inline">({folder.description})</span>
                )}
                <span className="text-xs bg-gray-200 px-2 py-1 rounded-full">
                  {documents.filter(d => d.folderId === folder._id).length}
                </span>
              </button>
              
              {isHRAdmin && !viewArchived && (
                <button
                  onClick={() => handleDeleteFolder(folder._id)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-red-600"
                  title="Delete Folder"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="mb-8 bg-white rounded-lg p-6">
        <div className="flex flex-wrap gap-4 items-center justify-between mb-6">
          <div className="flex gap-2">
            <button
              onClick={() => {
                setViewArchived(false);
                setSelectedCategory('');
                setSearchQuery('');
              }}
              className={`px-5 py-2.5 rounded-lg font-medium ${!viewArchived ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              📄 Active Documents ({documents.length})
            </button>
            <button
              onClick={() => {
                setViewArchived(true);
                setSelectedCategory('');
                setSearchQuery('');
              }}
              className={`px-5 py-2.5 rounded-lg font-medium ${viewArchived ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              🗄️ Archived Documents ({archivedDocuments.length})
            </button>
          </div>
          
          {isHRAdmin && !viewArchived && (
            <button
              onClick={() => setShowUploadModal(true)}
              className="px-5 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Upload Document
            </button>
          )}
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          {!viewArchived && (
            <div className="flex-1">
              <h3 className="text-lg font-semibold mb-3">Filter by Category</h3>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedCategory('')}
                  className={`px-4 py-2 rounded-lg ${selectedCategory === '' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                >
                  All Categories
                </button>
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-4 py-2 rounded-lg ${selectedCategory === cat ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex-1">
            <h3 className="text-lg font-semibold mb-3">Search Documents</h3>
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by title, description, category..."
                className="w-full px-4 py-2 pl-10 bg-gray-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <svg className="w-5 h-5 absolute left-3 top-2.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg overflow-hidden">
        <div className="px-6 py-4 bg-gray-50">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold">
                {viewArchived 
                  ? `🗄️ Archived Documents (${archivedDocuments.length})` 
                  : selectedFolder 
                    ? `📂 ${getFolderName(selectedFolder)} (${documents.length})`
                    : selectedCategory 
                      ? `${selectedCategory} (${documents.length})`
                      : `📁 All Documents (${documents.length})`}
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Showing documents accessible to: <span className="font-medium">{userRole}</span>
                {isHRAdmin && <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">HR Admin Access</span>}
              </p>
            </div>
            
            {loading && (
              <div className="flex items-center gap-2 text-blue-600">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                <span className="text-sm">Loading...</span>
              </div>
            )}
          </div>
        </div>

        {loading && documents.length === 0 && archivedDocuments.length === 0 ? (
          <div className="p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600 font-medium">Loading documents...</p>
            <p className="text-sm text-gray-500">Please wait</p>
          </div>
        ) : displayDocuments.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <svg className="w-20 h-20 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-lg font-medium mb-2">No documents found</p>
            <p className="text-gray-400 mb-4">
              {searchQuery 
                ? `No results for "${searchQuery}"`
                : viewArchived
                  ? 'No archived documents'
                  : 'Upload a document to get started'
              }
            </p>
            {!viewArchived && isHRAdmin && (
              <button
                onClick={() => setShowUploadModal(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 inline-flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Upload First Document
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
            {displayDocuments.map(doc => (
              <div key={doc._id} className="rounded-lg p-4 hover:bg-gray-50">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${
                      doc.status === 'Approved' ? 'bg-green-500' :
                      doc.status === 'Draft' ? 'bg-yellow-500' :
                      doc.status === 'Archived' ? 'bg-gray-500' :
                      'bg-blue-500'
                    }`}></div>
                    <span className="text-xs font-medium text-gray-600">{doc.status}</span>
                    {doc.version > 1 && (
                      <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
                        v{doc.version}
                      </span>
                    )}
                  </div>
                  <div className="flex gap-1">
                    {isHRAdmin && !viewArchived && (
                      <>
                        <button
                          onClick={() => openEditModal(doc)}
                          className="p-1.5 text-gray-400 hover:text-yellow-600 hover:bg-yellow-50 rounded"
                          title="Edit"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => openVersionsModal(doc)}
                          className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                          title="Version History"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </button>
                      </>
                    )}
                  </div>
                </div>

                <div className="mb-3">
                  <div className="flex items-center gap-2 mb-2">
                    {doc.fileType?.includes('pdf') ? (
                      <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                        <span className="text-red-600 font-bold text-sm">PDF</span>
                      </div>
                    ) : doc.fileType?.includes('word') || doc.fileType?.includes('doc') ? (
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <span className="text-blue-600 font-bold text-sm">DOC</span>
                      </div>
                    ) : doc.fileType?.includes('excel') || doc.fileType?.includes('sheet') ? (
                      <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                        <span className="text-green-600 font-bold text-sm">XLS</span>
                      </div>
                    ) : doc.fileType?.includes('image') ? (
                      <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                        <span className="text-purple-600 font-bold text-sm">IMG</span>
                      </div>
                    ) : (
                      <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                        <span className="text-gray-600 font-bold text-sm">FILE</span>
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold truncate" title={doc.title}>{doc.title}</h3>
                      <p className="text-xs text-gray-500 truncate" title={doc.fileName}>{doc.fileName}</p>
                    </div>
                  </div>
                  
                  {doc.description && (
                    <p className="text-sm text-gray-600 mt-2 line-clamp-2">{doc.description}</p>
                  )}
                </div>

                <div className="text-xs text-gray-500 space-y-1 mb-3">
                  <div className="flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{new Date(doc.createdAt).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'short', 
                      day: 'numeric' 
                    })}</span>
                  </div>
                  {doc.folderId && doc.folderId !== 'null' && (
                    <div className="flex items-center gap-1">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                      </svg>
                      <span className="truncate">{getFolderName(doc.folderId)}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <span>By: {doc.uploadedBy?.firstName || doc.uploadedBy || 'Unknown'}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    <span>Access: {doc.accessRoles?.join(', ')?.replace(/_/g, ' ') || 'All'}</span>
                  </div>
                </div>

                <div className="flex gap-2 pt-3">
                  <button
                    onClick={() => handleDownload(doc.fileUrl)}
                    className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 flex items-center justify-center gap-1"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Download
                  </button>
                  
                  {isHRAdmin && (
                    <div className="flex gap-1">
                      {!viewArchived ? (
                        <>
                          <button
                            onClick={() => handleStatusChange(doc._id, 'Archived')}
                            className="px-3 py-2 bg-gray-100 text-gray-700 text-sm rounded-lg hover:bg-gray-200 flex items-center gap-1"
                            title="Archive"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                            </svg>
                            <span className="hidden sm:inline">Archive</span>
                          </button>
                          <button
                            onClick={() => openDeleteModal(doc)}
                            className="px-3 py-2 bg-red-100 text-red-700 text-sm rounded-lg hover:bg-red-200 flex items-center gap-1"
                            title="Delete"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            <span className="hidden sm:inline">Delete</span>
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => handleStatusChange(doc._id, 'Draft')}
                            className="px-3 py-2 bg-green-100 text-green-700 text-sm rounded-lg hover:bg-green-200 flex items-center gap-1"
                            title="Restore"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                            </svg>
                            <span className="hidden sm:inline">Restore</span>
                          </button>
                          <button
                            onClick={() => openDeleteModal(doc)}
                            className="px-3 py-2 bg-red-100 text-red-700 text-sm rounded-lg hover:bg-red-200 flex items-center gap-1"
                            title="Delete Permanently"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            <span className="hidden sm:inline">Delete</span>
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showFolderModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg w-full max-w-md">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold">📁 New Folder</h3>
                <button 
                  onClick={() => setShowFolderModal(false)}
                  className="text-gray-400 hover:text-gray-600 p-1"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <form onSubmit={handleCreateFolder}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Folder Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={newFolder.name}
                      onChange={e => setNewFolder({...newFolder, name: e.target.value})}
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                      placeholder="Enter folder name"
                      maxLength={50}
                    />
                    <p className="text-xs text-gray-500 mt-1">Max 50 characters</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description (Optional)</label>
                    <textarea
                      value={newFolder.description}
                      onChange={e => setNewFolder({...newFolder, description: e.target.value})}
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows="3"
                      placeholder="Optional folder description"
                      maxLength={200}
                    />
                    <p className="text-xs text-gray-500 mt-1">Max 200 characters</p>
                  </div>
                </div>
                
                <div className="flex justify-end gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowFolderModal(false)}
                    className="px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Create Folder
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">📤 Upload New Document</h2>
                <button
                  onClick={() => {
                    setShowUploadModal(false);
                    setNewDocument({
                      title: '',
                      description: '',
                      category: 'Policies',
                      folderId: '',
                      accessRoles: ['hr_admin', 'team_lead', 'employee'],
                      file: null,
                      fileName: '',
                      fileType: ''
                    });
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleUpload}>
                <div className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Document Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={newDocument.title}
                      onChange={e => setNewDocument({...newDocument, title: e.target.value})}
                      required
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter document title"
                      maxLength={100}
                    />
                    <p className="text-xs text-gray-500 mt-1">Will use filename if empty</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description (Optional)
                    </label>
                    <textarea
                      value={newDocument.description}
                      onChange={e => setNewDocument({...newDocument, description: e.target.value})}
                      rows={2}
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter document description"
                      maxLength={500}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Category <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={newDocument.category}
                        onChange={e => setNewDocument({...newDocument, category: e.target.value})}
                        required
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {categories.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Folder (Optional)
                      </label>
                      <select
                        value={newDocument.folderId}
                        onChange={e => setNewDocument({...newDocument, folderId: e.target.value})}
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Root (No Folder)</option>
                        {folders.map(folder => (
                          <option key={folder._id} value={folder._id}>{folder.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Access Permissions</label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                      {['hr_admin', 'team_lead', 'employee'].map(role => (
                        <label key={role} className="flex items-center p-2 rounded-lg hover:bg-gray-50 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={newDocument.accessRoles.includes(role)}
                            onChange={e => {
                              if (e.target.checked) {
                                setNewDocument({
                                  ...newDocument,
                                  accessRoles: [...newDocument.accessRoles, role]
                                });
                              } else {
                                setNewDocument({
                                  ...newDocument,
                                  accessRoles: newDocument.accessRoles.filter(r => r !== role)
                                });
                              }
                            }}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="ml-2 capitalize">{role.replace(/_/g, ' ')}</span>
                        </label>
                      ))}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Select who can access this document</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      File Upload <span className="text-red-500">*</span> (Max 20MB)
                    </label>
                    <div className={`border-2 border-dashed rounded-lg p-6 text-center ${newDocument.file ? 'border-green-300 bg-green-50' : 'border-gray-300 hover:border-blue-300'}`}>
                      <input
                        type="file"
                        onChange={e => {
                          const file = e.target.files[0];
                          if (file) {
                            if (file.size > 20 * 1024 * 1024) {
                              alert('File size must be less than 20MB');
                              e.target.value = '';
                              return;
                            }
                            setNewDocument({
                              ...newDocument, 
                              file,
                              fileName: file.name,
                              fileType: file.type,
                              title: newDocument.title || file.name.replace(/\.[^/.]+$/, "")
                            });
                          }
                        }}
                        className="hidden"
                        id="file-upload"
                        accept=".pdf,.doc,.docx,.xlsx,.xls,.txt,.ppt,.pptx,.png,.jpg,.jpeg"
                        required
                      />
                      <label htmlFor="file-upload" className="cursor-pointer">
                        {newDocument.file ? (
                          <div className="space-y-3">
                            <svg className="w-12 h-12 mx-auto text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <p className="font-medium truncate">{newDocument.file.name}</p>
                            <p className="text-sm text-green-600">
                              File size: {(newDocument.file.size / (1024 * 1024)).toFixed(2)} MB
                            </p>
                            <p className="text-xs text-gray-500">Click to change file</p>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            <svg className="w-12 h-12 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                            </svg>
                            <p className="text-gray-600 font-medium">Click to select file</p>
                            <p className="text-sm text-gray-500">
                              PDF, DOC, DOCX, XLSX, PPT, TXT, PNG, JPG (Max 20MB)
                            </p>
                          </div>
                        )}
                      </label>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setShowUploadModal(false);
                        setNewDocument({
                          title: '',
                          description: '',
                          category: 'Policies',
                          folderId: '',
                          accessRoles: ['hr_admin', 'team_lead', 'employee'],
                          file: null,
                          fileName: '',
                          fileType: ''
                        });
                      }}
                      className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={uploading}
                    >
                      {uploading ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                          Uploading...
                        </>
                      ) : (
                        <>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                          </svg>
                          Upload Document
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {showEditModal && selectedDocument && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg w-full max-w-lg">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold">✏️ Edit Document</h3>
                <button 
                  onClick={() => setShowEditModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <form onSubmit={handleEdit}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Document Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={editDocument.title}
                      onChange={e => setEditDocument({...editDocument, title: e.target.value})}
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                    <textarea
                      value={editDocument.description}
                      onChange={e => setEditDocument({...editDocument, description: e.target.value})}
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows="3"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Category <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={editDocument.category}
                        onChange={e => setEditDocument({...editDocument, category: e.target.value})}
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      >
                        {categories.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Folder</label>
                      <select
                        value={editDocument.folderId}
                        onChange={e => setEditDocument({...editDocument, folderId: e.target.value})}
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Root (No Folder)</option>
                        {folders.map(folder => (
                          <option key={folder._id} value={folder._id}>{folder.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Access Permissions</label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                      {['hr_admin', 'team_lead', 'employee'].map(role => (
                        <label key={role} className="flex items-center p-2 rounded-lg hover:bg-gray-50 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={editDocument.accessRoles.includes(role)}
                            onChange={e => {
                              if (e.target.checked) {
                                setEditDocument({
                                  ...editDocument,
                                  accessRoles: [...editDocument.accessRoles, role]
                                });
                              } else {
                                setEditDocument({
                                  ...editDocument,
                                  accessRoles: editDocument.accessRoles.filter(r => r !== role)
                                });
                              }
                            }}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="ml-2 capitalize">{role.replace(/_/g, ' ')}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {showDeleteModal && selectedDocument && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg w-full max-w-md">
            <div className="p-6">
              <div className="text-center mb-6">
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
                  <svg className="h-8 w-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.986-.833-2.756 0L4.072 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold mb-2">
                  {viewArchived ? 'Permanently Delete' : 'Delete Document'}
                </h3>
                <p className="text-gray-600 mb-3">
                  Are you sure you want to {viewArchived ? 'permanently delete' : 'delete'} 
                  <span className="font-semibold block mt-1">"{selectedDocument.title}"</span>
                </p>
                <div className={`p-3 rounded-lg ${viewArchived ? 'bg-red-50 text-red-700' : 'bg-yellow-50 text-yellow-700'}`}>
                  <p className="text-sm font-medium">
                    {viewArchived 
                      ? "⚠️ This action cannot be undone!"
                      : "📦 Document will be moved to archive."}
                  </p>
                </div>
              </div>
              
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className={`px-4 py-2 rounded-lg text-white ${viewArchived ? 'bg-red-600 hover:bg-red-700' : 'bg-yellow-600 hover:bg-yellow-700'}`}
                >
                  {viewArchived ? "Delete Permanently" : "Move to Archive"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showVersionsModal && selectedDocument && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-2xl font-bold">🕒 Version History</h3>
                  <p className="text-gray-600 mt-1 truncate max-w-2xl">{selectedDocument.title}</p>
                </div>
                <button 
                  onClick={() => setShowVersionsModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-4">
                {versions.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p>No version history available</p>
                  </div>
                ) : (
                  versions.map(version => (
                    <div key={version._id} className={`rounded-lg p-5 ${version._id === selectedDocument._id ? 'bg-blue-50' : 'hover:bg-gray-50'}`}>
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-3 mb-3">
                            <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                              version.status === 'Approved' ? 'bg-green-100 text-green-800' :
                              version.status === 'Draft' ? 'bg-yellow-100 text-yellow-800' :
                              version.status === 'Archived' ? 'bg-gray-100 text-gray-800' :
                              'bg-blue-100 text-blue-800'
                            }`}>
                              {version.status}
                            </div>
                            <div className="text-lg font-semibold">
                              Version {version.version}
                            </div>
                            {version._id === selectedDocument._id && (
                              <div className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                                Current Version
                              </div>
                            )}
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="font-medium text-gray-700 mb-1">File Information:</p>
                              <p className="text-gray-600">{version.fileName}</p>
                              <p className="text-gray-500 text-xs">
                                {(version.fileSize / 1024).toFixed(1)} KB • {version.fileType}
                              </p>
                            </div>
                            
                            {version.uploadedBy && (
                              <div>
                                <p className="font-medium text-gray-700 mb-1">Uploaded By:</p>
                                <p className="text-gray-600">
                                  {typeof version.uploadedBy === 'object' 
                                    ? `${version.uploadedBy.firstName} ${version.uploadedBy.lastName}`
                                    : version.uploadedBy}
                                </p>
                              </div>
                            )}
                            
                            <div>
                              <p className="font-medium text-gray-700 mb-1">Created:</p>
                              <p className="text-gray-600">
                                {new Date(version.createdAt).toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric'
                                })}
                              </p>
                              <p className="text-gray-500 text-xs">
                                {new Date(version.createdAt).toLocaleTimeString()}
                              </p>
                            </div>
                            
                            <div>
                              <p className="font-medium text-gray-700 mb-1">Changes:</p>
                              <p className="text-gray-600">{version.history?.[version.history.length - 1]?.action || 'Created'}</p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex flex-col gap-2 min-w-[200px]">
                          <button
                            onClick={() => handleDownload(version.fileUrl)}
                            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center justify-center gap-2"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                            Download This Version
                          </button>
                          
                          {isHRAdmin && version._id !== selectedDocument._id && version.status !== 'Archived' && (
                            <button
                              onClick={() => handleRestore(version._id)}
                              className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200"
                            >
                              Restore This Version
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HRRepository;