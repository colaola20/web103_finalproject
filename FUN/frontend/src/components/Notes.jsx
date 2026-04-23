import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getNotes, createNote, updateNote, deleteNote, createCategory } from '../services/api';
import AddNoteModal from './AddNoteModal';
import '../styles/Dashboard.css';
import {ChevronDown} from "lucide-react"

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

  const loadNotes = async () => {
    if (!user?.userID) return;
    try {
      const data = await getNotes(user.userID);
      setNotes(data);
    } catch (err) {
      console.error('Error loading notes:', err);
    }
  };

  useEffect(() => {
    if (!user?.userID) return;
    let cancelled = false;
    getNotes(user.userID)
      .then(data => { if (!cancelled) setNotes(data); })
      .catch(err => console.error('Error loading notes:', err));
    return () => { cancelled = true; };
  }, [user?.userID]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleColorChange = (color) => {
    setFormData(prev => ({ ...prev, color }));
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

      if (categoryName) {
        const matchingCategory = notes.find(note => note.category_name === categoryName);
        if (matchingCategory) {
          categoryID = matchingCategory.category_id;
        } else {
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

  return (
    <div className="notes-view">
      <AddNoteModal
        show={showForm}
        editingNote={editingNote}
        formData={formData}
        formError={formError}
        onChange={handleChange}
        onColorChange={handleColorChange}
        onSubmit={handleSubmit}
        onClose={resetForm}
      />

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
            Tags <ChevronDown size={14}/>
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
