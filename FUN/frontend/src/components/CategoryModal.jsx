import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getCategories, createCategory, deleteCategory } from '../services/api';

const CategoryModal = ({ show, onClose, onRefreshCategories }) => {
  const { user } = useAuth();
  const [categories, setCategories] = useState([]);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [error, setError] = useState('');

  // Fetch categories when modal opens
  useEffect(() => {
    if (show && user?.userID) {
      fetchData();
    }
  }, [show, user?.userID]);

  const fetchData = async () => {
    try {
      const data = await getCategories(user.userID);
      setCategories(data);
    } catch (err) {
      setError("Failed to load categories.");
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await createCategory(user.userID, newCategoryName);
      setNewCategoryName('');
      await fetchData(); 
      onRefreshCategories(); 
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (categoryID) => {
    if (!window.confirm("Delete this category? Notes in this category might be affected.")) return;
    try {
      await deleteCategory(categoryID, user.userID);
      await fetchData();
      onRefreshCategories();
    } catch (err) {
      setError(err.message);
    }
  };

  if (!show) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3>Manage Categories</h3>
          <button onClick={onClose}>✕</button>
        </div>

        {error && <p className="error-text" style={{color: 'red'}}>{error}</p>}

        <form onSubmit={handleAdd} className="category-form">
          <input 
            type="text"
            value={newCategoryName} 
            onChange={(e) => setNewCategoryName(e.target.value)} 
            placeholder="Work, Personal, etc."
            required
          />
          <button type="submit">Add Category</button>
        </form>

        <ul className="category-list">
          {categories.map(cat => (
            <li key={cat.id} style={{ display: 'flex', justifyContent: 'space-between', margin: '10px 0' }}>
              <span>{cat.name}</span>
              <button onClick={() => handleDelete(cat.id)}>Delete</button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default CategoryModal;