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
      setError('Failed to load rooms');
      console.error('Error loading rooms:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (room) => {
    
    let building = room.building || '';
    let floor = room.floor || '';
    if (!building && room.location) {
      const parts = room.location.split(',');
      if (parts.length >= 2) {
        building = parts[0].trim();
        floor = parts[1].replace(/\D/g, ''); 
      }
    }
    
    setEditingRoom(room);
    setFormData({
      name: room.name || '',
      capacity: room.capacity || '',
      building: building,
      floor: floor,
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

 
  const handleSave = async () => {
    if (!formData.name || !formData.name.trim()) {
      alert('Room name is required');
      return;
    }
    
    if (!formData.building || !formData.building.trim()) {
      alert('Building is required');
      return;
    }
    
    if (!formData.floor || formData.floor === '') {
      alert('Floor is required');
      return;
    }
    
    if (!formData.capacity || formData.capacity === '') {
      alert('Capacity is required');
      return;
    }
    
    if (parseInt(formData.capacity) < 1) {
      alert('Capacity must be at least 1');
      return;
    }
  
    try {
      const location = formData.building && formData.floor 
        ? `${formData.building}, ${formData.floor}. floor`
        : (formData.building || '');
  
      const roomData = {
        name: formData.name.trim(),
        capacity: parseInt(formData.capacity),
        location: location,
        building: formData.building.trim(),
        floor: parseInt(formData.floor),
        equipment: formData.equipment,
      };
  
      if (editingRoom) {
        await roomsAPI.updateRoom(editingRoom.id, roomData);
        alert('Room has been successfully updated');
      } else {
        await roomsAPI.createRoom(roomData);
        alert('Room has been successfully created');
      }
  
      setShowModal(false);
      await loadRooms();
    } catch (err) {
      alert(err.message || 'Operation failed');
      console.error('Error saving room:', err);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Do you really want to delete room ${name}?`)) {
      return;
    }

    try {
      await roomsAPI.deleteRoom(id);
      alert('Room has been deleted');
      await loadRooms();
    } catch (err) {
      alert(err.message || 'Deleting room failed');
      console.error('Error deleting room:', err);
    }
  };

  const filteredRooms = rooms.filter(room => {
    const matchesSearch = room.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         room.building?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesBuilding = !filterBuilding || room.building === filterBuilding;
    return matchesSearch && matchesBuilding;
  });


  if (loading) {
    return (
      <div className="admin-rooms">
        <div className="loading-state">
          <p>Loading rooms...</p>
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
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-rooms">
      <div className="filter-section">
        <div className="filter-inputs">
          <div className="form-group">
            <label className="form-label">Search Room</label>
            <input
              type="text"
              className="input-field"
              placeholder="Name or building..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>
      <div className="action-bar">
      <button className="button button-success button-small" onClick={handleAddNew}>
        Add Room
      </button>
    </div>

      {filteredRooms.length === 0 ? (
        <div className="">
          <p>No rooms found</p>
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
                    <span>{room.building} - {room.floor}. floor</span>
                  </div>
                )}
                
                <div className="room-info-item">
                  <span className="info-icon">👥</span>
                  <span>Capacity: {room.capacity}</span>
                </div>
                
                {room.equipment && room.equipment.length > 0 && (
                  <div className="room-equipment">
                    <div className="equipment-label">Equipment:</div>
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
                  Edit
                </button>
                <button className="button button-small button-danger" onClick={() => handleDelete(room.id, room.name)}>
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingRoom ? 'Edit Room' : 'Add Room'}</h2>
              <button className="close-button" onClick={() => setShowModal(false)}>×</button>
            </div>
            <div className="modal-body">
  <div className="form-row">
    <label className="form-label">Room Name *</label>
    <input 
      type="text" 
      name="name"
      className="input-field" 
      placeholder="e.g. A112" 
      value={formData.name}
      onChange={handleFormChange}
      required
    />
  </div>
  
  <div className="form-row">
    <label className="form-label">Building *</label>
    <input 
      type="text" 
      name="building"
      className="input-field" 
      placeholder="e.g. Building A"
      value={formData.building}
      onChange={handleFormChange}
      required
    />
  </div>

  <div className="form-row">
    <label className="form-label">Floor *</label>
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
  
  <div className="form-row">
    <label className="form-label">Capacity *</label>
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
                Cancel
              </button>
              <button className="button button-success" onClick={handleSave}>
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminRooms;