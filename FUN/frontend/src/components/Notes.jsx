import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getNotes, createNote, updateNote, deleteNote, createCategory, createTag, linkTagToNote, getNoteTags, clearNoteTags } from '../services/api';
import AddNoteModal from './AddNoteModal';
import Note from './Note';
import MainButton from './MainButton';
import RegularButton from './RegularButton';
import '../styles/Dashboard.css';
import {ChevronDown} from "lucide-react"
import AddCategoryModal from "./AddCategoryModal";
import {List, Plus} from "lucide-react"
import ShowCategoriesModal from './ShowCategoriesModal';

const Notes = ({ categories, onUpdate, showForm, setShowForm, onRefreshData }) => {
  const { user } = useAuth();
  const [notes, setNotes] = useState([]);
  const [editingNote, setEditingNote] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [formError, setFormError] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: '',
    tags: '',
    color: '#fff3cd',
    is_pinned: false,
  });
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showCategories, setShowCategories] = useState(false)
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
      const categoryID = formData.category;
      let noteID;

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
        noteID = editingNote.id;
      } else {
        const result = await createNote(
          user.userID,
          categoryID,
          formData.title,
          formData.content,
          formData.color,
          formData.is_pinned
        );
        noteID = result.noteID;
      }

      await clearNoteTags(noteID);
      const tagNames = formData.tags.split(',').map(t => t.trim()).filter(Boolean);
      for (const name of tagNames) {
        const tagResult = await createTag(user.userID, name);
        await linkTagToNote(noteID, tagResult.tagID);
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

  const handlePin = async (note) => {
    try {
      await updateNote(note.id, user.userID, note.title, note.content, note.color, note.category_id, !note.is_pinned);
      loadNotes();
    } catch (err) {
      console.error('Error pinning note:', err);
    }
  };

  const handleEdit = async (note) => {
    setEditingNote(note);
    let tagString = '';
    try {
      const existing = await getNoteTags(note.id);
      tagString = existing.map(t => t.name).join(', ');
    } catch (err) {
      console.error('Error loading tags:', err);
    }
    setFormData({
      title: note.title,
      content: note.content,
      category: note.category_id || '',
      tags: tagString,
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
      category: '',
      tags: '',
      color: '#fff3cd',
      is_pinned: false,
    });
  };

  const filteredNotes = selectedCategory === 'All'
    ? notes
    : notes.filter(note => note.category_name === selectedCategory);

  const pinnedNotes = filteredNotes.filter(note => note.is_pinned);
  const unpinnedNotes = filteredNotes.filter(note => !note.is_pinned);
  const uniqueCategories = ['All', ...new Set(categories.map(cat => cat.name).filter(Boolean))];

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
          <div className="category-actions">
            <RegularButton onClick={() => setShowCategoryModal(true)}><Plus  size={14} /> Add</RegularButton>
            <RegularButton onClick={() => setShowCategories(true)}><List size={14}/> Show All</RegularButton>
          </div>
          <div className="category-modal-anchor">
            <AddCategoryModal
              show={showCategoryModal}
              onClose={() => setShowCategoryModal(false)}
              onRefreshCategories={onRefreshData}
            />
            <ShowCategoriesModal 
              show={showCategories}
              onClose={() => setShowCategories(false)}
              onRefreshCategories={onRefreshData}
            />
          </div>
        </div>
      </div>
      

      {/* Pinned Notes Section */}
      {pinnedNotes.length > 0 && (
        <div className="pinned-section">
          <h2 className="pinned-title">📌 Pinned Notes</h2>
          <div className="notes-grid">
            {pinnedNotes.map(note => (
              <Note key={note.id} note={note} onEdit={handleEdit} onDelete={handleDelete} onPin={handlePin} />
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
              <Note key={note.id} note={note} onEdit={handleEdit} onDelete={handleDelete} onPin={handlePin} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Notes;
