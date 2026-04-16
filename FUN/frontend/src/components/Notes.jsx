import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getNotes, createNote, updateNote, deleteNote, createCategory } from '../services/api';
import '../styles/Dashboard.css';

const Notes = ({ categories, onUpdate, showForm, setShowForm }) => {
  const { user } = useAuth();
  const [notes, setNotes] = useState([]);
  const [editingNote, setEditingNote] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [formError, setFormError] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    tags: '',
    color: '#fff3cd',
    is_pinned: false,
  });

  useEffect(() => {
    loadNotes();
  }, [user?.userID]);

  const loadNotes = async () => {
    if (!user?.userID) return;
    try {
      const data = await getNotes(user.userID);
      setNotes(data);
    } catch (err) {
      console.error('Error loading notes:', err);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    try {
      // Extract first tag as category
      const tagsArray = formData.tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);
      
      const categoryName = tagsArray.length > 0 ? tagsArray[0] : null;
      let categoryID = null;

      // If category name provided, find or create it
      if (categoryName) {
        const matchingCategory = notes.find(note => note.category_name === categoryName);
        if (matchingCategory) {
          categoryID = matchingCategory.category_id;
        } else {
          // Create new category
          const newCategory = await createCategory(user.userID, categoryName);
          categoryID = newCategory.id;
        }
      }

      if (editingNote) {
        await updateNote(
          editingNote.id,
          user.userID,
          formData.title,
          formData.content,
          formData.color,
          categoryID,
          formData.is_pinned
        );
      } else {
        await createNote(
          user.userID,
          categoryID,
          formData.title,
          formData.content,
          formData.color
        );
      }
      loadNotes();
      resetForm();
      onUpdate();
    } catch (err) {
      console.error('Error saving note:', err);
      setFormError(err.message || 'Error saving note');
    }
  };

  const handleDelete = async (noteID) => {
    if (window.confirm('Delete this note?')) {
      try {
        await deleteNote(noteID, user.userID);
        loadNotes();
        onUpdate();
      } catch (err) {
        console.error('Error deleting note:', err);
      }
    }
  };

  const handleEdit = (note) => {
    setEditingNote(note);
    setFormData({
      title: note.title,
      content: note.content,
      tags: note.category_name || '',
      color: note.color || '#fff3cd',
      is_pinned: note.is_pinned || false,
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingNote(null);
    setFormError('');
    setFormData({
      title: '',
      content: '',
      tags: '',
      color: '#fff3cd',
      is_pinned: false,
    });
  };

  // Filter notes based on selected category
  const filteredNotes = selectedCategory === 'All' 
    ? notes 
    : notes.filter(note => note.category_name === selectedCategory);

  const pinnedNotes = filteredNotes.filter(note => note.is_pinned);
  const unpinnedNotes = filteredNotes.filter(note => !note.is_pinned);

  // Get unique categories for filter buttons
  const uniqueCategories = ['All', ...new Set(notes.map(note => note.category_name).filter(Boolean))];

  // Color palette
  const colorPalette = ['#fff3cd', '#c7e9f5', '#f5d5e0', '#d4f5e8', '#e5d7f5', '#ffe8d6', '#e8e8e8', '#ffeb99'];

  return (
    <div className="notes-view">
      {/* Modal Form */}
      {showForm && (
        <div className="modal-overlay">
          <div className="modal-dialog">
            <div className="modal-header">
              <h2>New Note</h2>
              <button 
                className="modal-close-btn" 
                onClick={() => setShowForm(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="modal-form">
              {formError && (
                <div className="form-error">
                  {formError}
                </div>
              )}
              
              <div className="form-group">
                <label>Title</label>
                <input
                  type="text"
                  name="title"
                  placeholder="Note title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Content</label>
                <textarea
                  name="content"
                  placeholder="Write your note here..."
                  value={formData.content}
                  onChange={handleChange}
                  rows="6"
                  required
                />
              </div>

              <div className="form-group">
                <label>Tags (comma-seperated)</label>
                <input
                  type="text"
                  name="tags"
                  placeholder="work, personal, urgent..."
                  value={formData.tags}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>Color</label>
                <div className="color-palette">
                  {colorPalette.map(color => (
                    <button
                      key={color}
                      type="button"
                      className={`color-swatch ${formData.color === color ? 'active' : ''}`}
                      style={{ backgroundColor: color }}
                      onClick={() => setFormData(prev => ({ ...prev, color }))}
                    />
                  ))}
                </div>
              </div>

              <div className="form-group checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    name="is_pinned"
                    checked={formData.is_pinned}
                    onChange={handleChange}
                  />
                  Pin this note
                </label>
              </div>

              <div className="modal-buttons">
                <button 
                  type="button" 
                  className="btn-cancel" 
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-save">
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="filters-section">
        <span className="filters-label">Filters:</span>
        <div className="filter-buttons">
          {uniqueCategories.map(cat => (
            <button
              key={cat}
              className={`filter-btn ${selectedCategory === cat ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </button>
          ))}
          <button className="filter-btn tags-btn">
            Tags <span>▼</span>
          </button>
        </div>
      </div>

      {/* Pinned Notes Section */}
      {pinnedNotes.length > 0 && (
        <div className="pinned-section">
          <h2 className="pinned-title">📌 Pinned Notes</h2>
          <div className="notes-grid">
            {pinnedNotes.map(note => (
              <div key={note.id} className="note-card" style={{ backgroundColor: note.color }}>
                <div className="note-header">
                  <h3>{note.title}</h3>
                  <span className="pin-icon">📌</span>
                </div>
                <p className="note-content">{note.content}</p>
                {note.category_name && (
                  <div className="note-tags">
                    <span className="tag">#{note.category_name}</span>
                  </div>
                )}
                <div className="note-footer">
                  <button onClick={() => handleEdit(note)} className="icon-btn">✏️</button>
                  <button onClick={() => handleDelete(note.id)} className="icon-btn">🗑️</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Regular Notes */}
      <div className="unpinned-section">
        {unpinnedNotes.length === 0 && pinnedNotes.length === 0 ? (
          <p className="empty">No notes yet. Create one to get started!</p>
        ) : unpinnedNotes.length === 0 ? (
          <p className="empty">All notes are pinned!</p>
        ) : (
          <div className="notes-grid">
            {unpinnedNotes.map(note => (
              <div key={note.id} className="note-card" style={{ backgroundColor: note.color }}>
                <div className="note-header">
                  <h3>{note.title}</h3>
                </div>
                <p className="note-content">{note.content}</p>
                {note.category_name && (
                  <div className="note-tags">
                    <span className="tag">#{note.category_name}</span>
                  </div>
                )}
                <div className="note-footer">
                  <button onClick={() => handleEdit(note)} className="icon-btn">✏️</button>
                  <button onClick={() => handleDelete(note.id)} className="icon-btn">🗑️</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Notes;
