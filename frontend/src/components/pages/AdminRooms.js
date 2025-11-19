import React, { useState } from 'react';
import './AdminRooms.css';

const AdminRooms = () => {
  const [rooms, setRooms] = useState([
    { id: 1, name: 'A112', capacity: 30, building: 'Budova A', floor: 1, equipment: ['Projektor', 'Tabule', 'PC'], status: 'Dostupná' },
    { id: 2, name: 'B205', capacity: 50, building: 'Budova B', floor: 2, equipment: ['Projektor', 'Mikrofon'], status: 'Dostupná' },
    { id: 3, name: 'C101', capacity: 20, building: 'Budova C', floor: 1, equipment: ['Tabule'], status: 'Obsazená' },
    { id: 4, name: 'A301', capacity: 40, building: 'Budova A', floor: 3, equipment: ['Projektor', 'Tabule', 'PC', 'Klimatizace'], status: 'Dostupná' },
    { id: 5, name: 'D407', capacity: 100, building: 'Budova D', floor: 4, equipment: ['Projektor', 'Mikrofon', 'Ozvučení'], status: 'Údržba' }
  ]);

  const [showModal, setShowModal] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBuilding, setFilterBuilding] = useState('');

  const handleEdit = (room) => {
    setEditingRoom(room);
    setShowModal(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Opravdu chcete smazat tuto místnost?')) {
      setRooms(rooms.filter(room => room.id !== id));
    }
  };

  const handleAddNew = () => {
    setEditingRoom(null);
    setShowModal(true);
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'Dostupná': return '#10b981';
      case 'Obsazená': return '#ef4444';
      case 'Údržba': return '#f59e0b';
      default: return '#64748b';
    }
  };

  const filteredRooms = rooms.filter(room => {
    const matchesSearch = room.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         room.building.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesBuilding = !filterBuilding || room.building === filterBuilding;
    return matchesSearch && matchesBuilding;
  });

  return (
    <div className="admin-rooms">
      <div className="page-header">
        <h1 className="page-title">Správa místností</h1>
        <button className="button button-success" onClick={handleAddNew}>
          ➕ Přidat místnost
        </button>
      </div>

      {/* Filters */}
      <div className="filter-section">
        <div className="filter-inputs">
          <div className="form-group">
            <label className="form-label">Hledat místnost</label>
            <input
              type="text"
              className="input-field"
              placeholder="Název nebo budova..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Budova</label>
            <select
              className="input-field"
              value={filterBuilding}
              onChange={(e) => setFilterBuilding(e.target.value)}
            >
              <option value="">Všechny budovy</option>
              <option value="Budova A">Budova A</option>
              <option value="Budova B">Budova B</option>
              <option value="Budova C">Budova C</option>
              <option value="Budova D">Budova D</option>
            </select>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="rooms-stats">
        <div className="stat-card">
          <div className="stat-value">{rooms.length}</div>
          <div className="stat-label">Celkem místností</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: '#10b981' }}>
            {rooms.filter(r => r.status === 'Dostupná').length}
          </div>
          <div className="stat-label">Dostupných</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: '#ef4444' }}>
            {rooms.filter(r => r.status === 'Obsazená').length}
          </div>
          <div className="stat-label">Obsazených</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: '#f59e0b' }}>
            {rooms.filter(r => r.status === 'Údržba').length}
          </div>
          <div className="stat-label">V údržbě</div>
        </div>
      </div>

      {/* Rooms Grid */}
      <div className="rooms-grid">
        {filteredRooms.map(room => (
          <div key={room.id} className="room-card">
            <div className="room-header">
              <div className="room-name">{room.name}</div>
              <div className="room-status" style={{ background: getStatusColor(room.status) }}>
                {room.status}
              </div>
            </div>
            
            <div className="room-body">
              <div className="room-info-item">
                <span className="info-icon">🏢</span>
                <span>{room.building} - {room.floor}. patro</span>
              </div>
              
              <div className="room-info-item">
                <span className="info-icon">👥</span>
                <span>Kapacita: {room.capacity} míst</span>
              </div>
              
              <div className="room-equipment">
                <div className="equipment-label">Vybavení:</div>
                <div className="equipment-tags">
                  {room.equipment.map((item, index) => (
                    <span key={index} className="equipment-tag">{item}</span>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="room-footer">
              <button className="button button-small" onClick={() => handleEdit(room)}>
                ✏️ Upravit
              </button>
              <button className="button button-small button-danger" onClick={() => handleDelete(room.id)}>
                🗑️ Smazat
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredRooms.length === 0 && (
        <div className="empty-state">
          <p>Žádné místnosti nenalezeny</p>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingRoom ? 'Upravit místnost' : 'Přidat místnost'}</h2>
              <button className="close-button" onClick={() => setShowModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="form-row">
                <label className="form-label">Název místnosti *</label>
                <input type="text" className="input-field" placeholder="např. A112" defaultValue={editingRoom?.name} />
              </div>
              <div className="form-row two-columns">
                <div>
                  <label className="form-label">Budova *</label>
                  <select className="input-field" defaultValue={editingRoom?.building}>
                    <option value="">Vyberte budovu</option>
                    <option value="Budova A">Budova A</option>
                    <option value="Budova B">Budova B</option>
                    <option value="Budova C">Budova C</option>
                    <option value="Budova D">Budova D</option>
                  </select>
                </div>
                <div>
                  <label className="form-label">Patro *</label>
                  <input type="number" className="input-field" placeholder="1" defaultValue={editingRoom?.floor} />
                </div>
              </div>
              <div className="form-row">
                <label className="form-label">Kapacita *</label>
                <input type="number" className="input-field" placeholder="30" defaultValue={editingRoom?.capacity} />
              </div>
              <div className="form-row">
                <label className="form-label">Status</label>
                <select className="input-field" defaultValue={editingRoom?.status}>
                  <option value="Dostupná">Dostupná</option>
                  <option value="Obsazená">Obsazená</option>
                  <option value="Údržba">Údržba</option>
                </select>
              </div>
              <div className="form-row">
                <label className="form-label">Vybavení</label>
                <div className="checkbox-group">
                  <label className="checkbox-label">
                    <input type="checkbox" defaultChecked={editingRoom?.equipment.includes('Projektor')} />
                    Projektor
                  </label>
                  <label className="checkbox-label">
                    <input type="checkbox" defaultChecked={editingRoom?.equipment.includes('Tabule')} />
                    Tabule
                  </label>
                  <label className="checkbox-label">
                    <input type="checkbox" defaultChecked={editingRoom?.equipment.includes('PC')} />
                    PC
                  </label>
                  <label className="checkbox-label">
                    <input type="checkbox" defaultChecked={editingRoom?.equipment.includes('Mikrofon')} />
                    Mikrofon
                  </label>
                  <label className="checkbox-label">
                    <input type="checkbox" defaultChecked={editingRoom?.equipment.includes('Klimatizace')} />
                    Klimatizace
                  </label>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="button button-secondary" onClick={() => setShowModal(false)}>
                Zrušit
              </button>
              <button className="button button-success" onClick={() => setShowModal(false)}>
                Uložit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminRooms;