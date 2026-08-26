import { useState, useEffect } from "react";
import { getUserTags, deleteTag } from "../services/api";
import "../styles/showTags.css";
import { X, Trash2 } from "lucide-react";

const ShowTags = ({ tags ,show, onClose, refetchTags }) => {
  const [error, setError] = useState("");

  const handleDelete = async (tagID) => {
    if (
      !window.confirm("Delete this tag? Notes with this tag will be updated.")
    )
      return;
    try {
      await deleteTag(tagID);
      const data = await getUserTags();
      refetchTags(data);
    } catch (err) {
      setError(err.message);
    }
  };

  if (!show) return null;

  return (
    <div className="modal-content">
      <div className="modal-header">
        <div className="title">
          <span>Your tags:</span>
        </div>
        <div className="closeBtn">
          <X onClick={onClose} color="#666666" size={20} />
        </div>
      </div>
      <div className="tag-list">
        {error && (
          <p className="error-text" style={{ color: "red" }}>
            {error}
          </p>
        )}
        <ul className="tag-list">
          {tags.map((tag) => (
            <li
              key={tag.id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                margin: "10px 0",
              }}
            >
              <p>{tag.name}</p>
              <button
                className="icon-button"
                onClick={() => handleDelete(tag.id)}
              >
                <Trash2 color="#666666" size={20} />
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ShowTags;
