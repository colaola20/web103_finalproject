import '../styles/AddNoteModal.css';
import MainButton from './MainButton';
import RegularButton from './RegularButton';

const COLOR_PALETTE = ['#fff3cd', '#c7e9f5', '#f5d5e0', '#d4f5e8', '#e5d7f5', '#ffe8d6', '#e8e8e8', '#ffeb99'];

const AddNoteModal = ({ show, editingNote, formData, formError, onChange, onColorChange, onSubmit, onClose }) => {
  if (!show) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-dialog">
        <div className="modal-header">
          <h2>{editingNote ? 'Edit Note' : 'New Note'}</h2>
          <button className="modal-close-btn" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={onSubmit} className="modal-form">
          {formError && <div className="form-error">{formError}</div>}

          <div className="form-group">
            <label>Title</label>
            <input
              type="text"
              name="title"
              placeholder="Note title"
              value={formData.title}
              onChange={onChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Content</label>
            <textarea
              name="content"
              placeholder="Write your note here..."
              value={formData.content}
              onChange={onChange}
              rows="6"
              required
            />
          </div>

          <div className="form-group">
            <label>Tags (comma-separated)</label>
            <input
              type="text"
              name="tags"
              placeholder="work, personal, urgent..."
              value={formData.tags}
              onChange={onChange}
            />
          </div>

          <div className="form-group">
            <label>Color</label>
            <div className="color-palette">
              {COLOR_PALETTE.map(color => (
                <button
                  key={color}
                  type="button"
                  className={`color-swatch ${formData.color === color ? 'active' : ''}`}
                  style={{ backgroundColor: color }}
                  onClick={() => onColorChange(color)}
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
                onChange={onChange}
              />
              Pin this note
            </label>
          </div>

          <div className="modal-buttons">
            <RegularButton type="button" className="modal-cancel" onClick={onClose}>Cancel</RegularButton>
            <MainButton type="submit">Save</MainButton>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddNoteModal;
