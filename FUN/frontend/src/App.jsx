import { useState } from 'react';
import {helloWord} from './services/api.js';
import './App.css';

function App() {
  const [response, setResponse] = useState('Click to test connection');
  const [loading, setLoading] = useState(false);

  const backendTest = async () => {
    setLoading(true);
    try {
      const data = await helloWord();
      setResponse(data.message || 'Connected, but no message found.');
    } catch (error) {
      setResponse(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ 
      display: "flex", 
      flexDirection: "column", 
      alignItems: "center",  
      justifyContent: "center", 
      height: "100vh"          
    }}>
      <div style={{ 
        padding: '20px', 
        border: '1px solid #ff0404', 
        borderRadius: '8px',
        marginBottom: '20px'
      }}>
        <p>{loading ? 'Connecting...' : response}</p>
      </div>
      
      <button onClick={backendTest} disabled={loading}>
        {loading ? 'Testing...' : 'Test Backend Connection'}
      </button>
    </div>
  )
}

export default App