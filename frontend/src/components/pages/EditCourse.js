import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './CreateCourse.css';
import { coursesAPI } from '../services/api';

const EditCourse = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    title: '',
    code: '',
    description: '',
    type: '',
    price: '0',
    capacity: '30',
    auto_confirm: false
  });

  useEffect(() => {
    loadCourse();
  }, [id]);

  const loadCourse = async () => {
    try {
      setLoading(true);
      const course = await coursesAPI.getCourseDetail(id);
      setFormData({
        title: course.title,
        code: course.code,
        description: course.description || '',
        type: course.type || '',
        price: course.price.toString(),
        capacity: course.capacity.toString(),
        auto_confirm: course.auto_confirm
      });
    } catch (err) {
      setError('Nepodařilo se načíst kurz');
      console.error('Error loading course:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleUpdateCourse = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      const courseData = {
        code: formData.code,
        title: formData.title,
        description: formData.description,
        type: formData.type,
        price: parseFloat(formData.price),
        capacity: parseInt(formData.capacity),
        auto_confirm: formData.auto_confirm
      };

      await coursesAPI.updateCourse(id, courseData);
      alert('Kurz byl úspěšně upraven!');
      navigate('/instructor/courses');
    } catch (err) {
      setError(err.message || 'Úprava kurzu se nezdařila');
      console.error('Error updating course:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate(-1);
  };

  if (loading) {
    return (
      <div className="create-course">
        <div className="loading-state">
          <p>Načítání kurzu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="create-course">
      <h1 className="page-title">Upravit kurz</h1>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <form onSubmit={handleUpdateCourse} className="course-form">
        <div className="form-section">
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Název kurzu *</label>
              <input
                type="text"
                name="title"
                className="input-field"
                placeholder="např. Webové technologie"
                value={formData.title}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Kód kurzu *</label>
              <input
                type="text"
                name="code"
                className="input-field"
                placeholder="např. WEB-101"
                value={formData.code}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Typ kurzu *</label>
              <select
                name="type"
                className="input-field"
                value={formData.type}
                onChange={handleChange}
                required
              >
                <option value="">-- Vyberte typ --</option>
                <option value="HARDWARE">Hardware</option>
                <option value="OS">Operating Systems</option>
                <option value="AI">Artificial Intelligence</option>
                <option value="WEB">Web Development</option>
                <option value="SECURITY">Security</option>
                <option value="NETWORKS">Networks</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Popis kurzu</label>
              <textarea
                name="description"
                className="input-field textarea"
                rows="4"
                placeholder="Popište obsah a cíle kurzu..."
                value={formData.description}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-row two-columns">
            <div className="form-group">
              <label className="form-label">Cena (Kč) *</label>
              <input
                type="number"
                name="price"
                className="input-field"
                min="0"
                step="0.01"
                value={formData.price}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Kapacita *</label>
              <input
                type="number"
                name="capacity"
                className="input-field"
                min="1"
                value={formData.capacity}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="auto_confirm"
                  checked={formData.auto_confirm}
                  onChange={handleChange}
                />
                Automatické potvrzení studentů
              </label>
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button 
            type="submit" 
            className="button button-success"
            disabled={saving}
          >
            {saving ? '⏳ Ukládám změny...' : '✓ Uložit změny'}
          </button>
          <button 
            type="button" 
            className="button button-secondary"
            onClick={handleCancel}
          >
            Zrušit
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditCourse;