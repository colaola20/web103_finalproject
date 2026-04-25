import "../styles/DashboardHeader.css";
import { Plus, X, FolderEdit } from "lucide-react";
import MainButton from "./MainButton";
import { useState } from "react";
import CategoryModal from "./CategoryModal";

const DashboardHeader = ({
  showSettings,
  setShowSettings,
  showForm,
  setShowForm,
  onLogout,
  onRefreshData
}) => {
  const [showCategoryModal, setShowCategoryModal] = useState(false);

  return (
    <header className="dashboard-header">
      <h1>Note Board</h1>
      <div className="header-actions">
        <button
          className="settings-btn"
          onClick={() => setShowSettings(!showSettings)}
          title="Settings"
        >
          ⚙️
        </button>
        {showSettings && (
          <div className="settings-menu">
            <button onClick={onLogout}>Logout</button>
          </div>
        )}
        <MainButton onClick={() => setShowForm(!showForm)}>
          {showForm ? (
            <X size={16} />
          ) : (
            <>
              <Plus size={16} /> Note
            </>
          )}
        </MainButton>

        <button
          className="icon-btn"
          onClick={() => setShowCategoryModal(true)}
          title="Manage Categories"
        >
          <FolderEdit color="#4A90E2" size={20} />
        </button>

        {/* Logic for Category Modal */}
        <CategoryModal
          show={showCategoryModal}
          onClose={() => setShowCategoryModal(false)}
          onRefreshCategories={onRefreshData} 
        />
      </div>
    </header>
  );
};

export default DashboardHeader;
