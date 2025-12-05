import { Link } from 'react-router-dom';
// Adicionei 'Users' na importação dos ícones
import { LayoutDashboard, Map, Sprout, Tractor, ClipboardList, Users } from 'lucide-react';

export const DashboardLayout = ({ children }) => {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f4f4f9' }}>
      
      <aside style={{ 
        width: '260px', 
        backgroundColor: '#1b5e20', 
        color: 'white', 
        padding: '20px', 
        display: 'flex', 
        flexDirection: 'column',
        boxShadow: '4px 0 10px rgba(0,0,0,0.1)'
      }}>
        <h2 style={{ marginBottom: '40px', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.5rem' }}>
          🌱 Cultiva+
        </h2>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <Link to="/" style={linkStyle}><LayoutDashboard size={20}/> Dashboard</Link>
          <Link to="/areas" style={linkStyle}><Map size={20}/> Áreas</Link>
          <Link to="/plantas" style={linkStyle}><Sprout size={20}/> Plantas</Link>
          <Link to="/cultivos" style={linkStyle}><Tractor size={20}/> Cultivos</Link>
          <Link to="/tarefas" style={linkStyle}><ClipboardList size={20}/> Tarefas</Link>
          <Link to="/relatorios" style={linkStyle}><ClipboardList size={20}/> Relatórios</Link>
          
          {/* LINHA NOVA: Divisor e Link de Admin */}
          <hr style={{width: '100%', borderColor: 'rgba(255,255,255,0.2)', margin: '10px 0'}} />
          <Link to="/admin" style={linkStyle}><Users size={20}/> Utilizadores</Link>
        </nav>
      </aside>

      <main style={{ flex: 1, padding: '40px', overflowY: 'auto' }}>
        {children}
      </main>

    </div>
  );
};

const linkStyle = {
  color: 'white',
  textDecoration: 'none',
  padding: '12px',
  borderRadius: '8px',
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  fontSize: '1rem',
  transition: 'background 0.2s',
  cursor: 'pointer'
};