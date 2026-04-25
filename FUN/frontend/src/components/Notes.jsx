import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getNotes, createNote, updateNote, deleteNote, createCategory } from '../services/api';
import AddNoteModal from './AddNoteModal';
import Note from './Note';
import MainButton from './MainButton';
import RegularButton from './RegularButton';
import '../styles/Dashboard.css';
import {ChevronDown} from "lucide-react"
import CategoryModal from "../components/CategoryModal";
import {FolderEdit, Plus} from "lucide-react"

const Notes = ({ categories, onUpdate, showForm, setShowForm, onRefreshData }) => {
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
  const [showCategoryModal, setShowCategoryModal] = useState(false);

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

      const selectedCategoryID = formData.categoryID;

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
          //no creating of new category unless user make them from the category management modal
          // const newCategory = await createCategory(user.userID, categoryName);
          // categoryID = newCategory.id;
        }
      }

      if (editingNote) {
        await updateNote(
          editingNote.id,
          user.userID,
          formData.title,
          formData.content,
          formData.color,
          selectedCategoryID,
          formData.is_pinned
        );
      } else {
        await createNote(
          user.userID,
          selectedCategoryID,
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
      categoryID: note.category_id || '',
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
      categoryID: null,
    });
  };

  const filteredNotes = selectedCategory === 'All'
    ? notes
    : notes.filter(note => note.category_name === selectedCategory);

  const pinnedNotes = filteredNotes.filter(note => note.is_pinned);
  const unpinnedNotes = filteredNotes.filter(note => !note.is_pinned);
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
        categories={categories}
      />

      {/* Filters and Categories */}
      <div className='filter-cotegories-container'>
          {/* Filters */}
        <div className="filters-section">
          <span className="filters-label">Filters:</span>
          <div className="filter-buttons">
            {uniqueCategories.map(cat =>
              selectedCategory === cat ? (
                <MainButton key={cat} onClick={() => setSelectedCategory(cat)}>{cat}</MainButton>
              ) : (
                <RegularButton key={cat} onClick={() => setSelectedCategory(cat)}>{cat}</RegularButton>
              )
            )}
            <RegularButton className="tags-btn">
              Tags <ChevronDown size={14}/>
            </RegularButton>
          </div>
        </div>

        {/* Categories */}
        <div className='categories-section'>
          <span className="filters-label">Categories:</span>
          <RegularButton onClick={() => setShowCategoryModal(true)}><Plus  size={14} /> Add</RegularButton>
        </div>

        {/* Logic for Category Modal */}
        <CategoryModal
          show={showCategoryModal}
          onClose={() => setShowCategoryModal(false)}
          onRefreshCategories={onRefreshData} 
        />
      </div>
      

      {/* Pinned Notes Section */}
      {pinnedNotes.length > 0 && (
        <div className="pinned-section">
          <h2 className="pinned-title">📌 Pinned Notes</h2>
          <div className="notes-grid">
            {pinnedNotes.map(note => (
              <Note key={note.id} note={note} onEdit={handleEdit} onDelete={handleDelete} />
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
              <Note key={note.id} note={note} onEdit={handleEdit} onDelete={handleDelete} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Notes;
