import '../styles/DashboardHeader.css';
import { Plus, X } from 'lucide-react';
import MainButton from './MainButton';


const DashboardHeader = ({ showSettings, setShowSettings, showForm, setShowForm, onLogout }) => {
  return (
    <header className="dashboard-header">
      <h1>Note Board</h1>
      <div className="header-actions">
        <button className="settings-btn" onClick={() => setShowSettings(!showSettings)} title="Settings">
          ⚙️
        </button>
        {showSettings && (
          <div className="settings-menu">
            <button onClick={onLogout}>Logout</button>
          </div>
        )}
        <MainButton onClick={() => setShowForm(!showForm)}>
          {showForm ? <X size={16}/> : <><Plus size={16} /> Note</>}
        </MainButton>
      </div>
    </header>
  );
};

export default DashboardHeader;
