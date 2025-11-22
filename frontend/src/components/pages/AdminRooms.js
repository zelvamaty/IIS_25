import React, { useState, useEffect } from 'react';
import './AdminRooms.css';
import { roomsAPI } from '../services/api';

const AdminRooms = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBuilding, setFilterBuilding] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    capacity: '',
    building: '',
    floor: '',
    equipment: [],
  });

  useEffect(() => {
    loadRooms();
  }, []);

  const loadRooms = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await roomsAPI.getRooms();
      setRooms(data);
    } catch (err) {
      setError('Nepodařilo se načíst místnosti');
      console.error('Error loading rooms:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (room) => {
    setEditingRoom(room);
    setFormData({
      name: room.name || '',
      capacity: room.capacity || '',
      building: room.building || '',
      floor: room.floor || '',
      equipment: room.equipment || [],
    });
    setShowModal(true);
  };

  const handleAddNew = () => {
    setEditingRoom(null);
    setFormData({
      name: '',
      capacity: '',
      building: '',
      floor: '',
      equipment: [],
    });
    setShowModal(true);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEquipmentChange = (e) => {
    const { value, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      equipment: checked
        ? [...prev.equipment, value]
        : prev.equipment.filter(item => item !== value)
    }));
  };

  const handleSave = async () => {
    try {
      // Automaticky vytvor location z building a floor
      const location = formData.building && formData.floor 
        ? `${formData.building}, ${formData.floor}. patro`
        : (formData.building || '');

      const roomData = {
        name: formData.name,
        capacity: parseInt(formData.capacity),
        location: location,
        building: formData.building,
        floor: formData.floor ? parseInt(formData.floor) : null,
        equipment: formData.equipment,
      };

      if (editingRoom) {
        await roomsAPI.updateRoom(editingRoom.id, roomData);
        alert('Místnost byla úspěšně upravena');
      } else {
        await roomsAPI.createRoom(roomData);
        alert('Místnost byla úspěšně vytvořena');
      }

      setShowModal(false);
      await loadRooms();
    } catch (err) {
      alert(err.message || 'Operace se nezdařila');
      console.error('Error saving room:', err);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Opravdu chcete smazat místnost ${name}?`)) {
      return;
    }

    try {
      await roomsAPI.deleteRoom(id);
      alert('Místnost byla smazána');
      await loadRooms();
    } catch (err) {
      alert(err.message || 'Smazání místnosti se nezdařilo');
      console.error('Error deleting room:', err);
    }
  };



  const filteredRooms = rooms.filter(room => {
    const matchesSearch = room.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         room.building?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesBuilding = !filterBuilding || room.building === filterBuilding;
    return matchesSearch && matchesBuilding;
  });

  const uniqueBuildings = [...new Set(rooms.map(r => r.building).filter(Boolean))];

  if (loading) {
    return (
      <div className="admin-rooms">
        <div className="loading-state">
          <p>Načítání místností...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-rooms">
        <div className="error-state">
          <p>{error}</p>
          <button className="button" onClick={loadRooms}>
            Zkusit znovu
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-rooms">
      <div className="page-header">
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
              {uniqueBuildings.map(building => (
                <option key={building} value={building}>{building}</option>
              ))}
            </select>
          </div>
        </div>
      </div>



      {/* Rooms Grid */}
      {filteredRooms.length === 0 ? (
        <div className="empty-state">
          <p>Žádné místnosti nenalezeny</p>
        </div>
      ) : (
        <div className="rooms-grid">
          {filteredRooms.map(room => (
            <div key={room.id} className="room-card">
              <div className="room-header">
                <div className="room-name">{room.name}</div>
                
              </div>
              
              <div className="room-body">
                {room.location && (
                  <div className="room-info-item">
                    <span className="info-icon">📍</span>
                    <span>{room.location}</span>
                  </div>
                )}
                
                {room.building && (
                  <div className="room-info-item">
                    <span className="info-icon">🏢</span>
                    <span>{room.building} - {room.floor}. patro</span>
                  </div>
                )}
                
                <div className="room-info-item">
                  <span className="info-icon">👥</span>
                  <span>Kapacita: {room.capacity} míst</span>
                </div>
                
                {room.equipment && room.equipment.length > 0 && (
                  <div className="room-equipment">
                    <div className="equipment-label">Vybavení:</div>
                    <div className="equipment-tags">
                      {room.equipment.map((item, index) => (
                        <span key={index} className="equipment-tag">{item}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="room-footer">
                <button className="button button-small" onClick={() => handleEdit(room)}>
                  ✏️ Upravit
                </button>
                <button className="button button-small button-danger" onClick={() => handleDelete(room.id, room.name)}>
                  🗑️ Smazat
                </button>
              </div>
            </div>
          ))}
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
                <input 
                  type="text" 
                  name="name"
                  className="input-field" 
                  placeholder="např. A112" 
                  value={formData.name}
                  onChange={handleFormChange}
                  required
                />
              </div>
              
              <div className="form-row two-columns">
                <div>
                  <label className="form-label">Budova *</label>
                  <input 
                    type="text" 
                    name="building"
                    className="input-field" 
                    placeholder="např. Budova A"
                    value={formData.building}
                    onChange={handleFormChange}
                    required
                  />
                </div>
                <div>
                  <label className="form-label">Patro *</label>
                  <input 
                    type="number" 
                    name="floor"
                    className="input-field" 
                    placeholder="1" 
                    value={formData.floor}
                    onChange={handleFormChange}
                    required
                  />
                </div>
              </div>
              
              <div className="form-row">
                <label className="form-label">Kapacita *</label>
                <input 
                  type="number" 
                  name="capacity"
                  className="input-field" 
                  placeholder="30" 
                  value={formData.capacity}
                  onChange={handleFormChange}
                  required
                />
              </div>
            
            
            </div>
            <div className="modal-footer">
              <button className="button button-secondary" onClick={() => setShowModal(false)}>
                Zrušit
              </button>
              <button className="button button-success" onClick={handleSave}>
                💾 Uložit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminRooms;