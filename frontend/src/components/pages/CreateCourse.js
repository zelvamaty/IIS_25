import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './CreateCourse.css';
import { coursesAPI } from '../services/api';

const CreateCourse = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    title: '',
    code: '',
    description: '',
    type: '', // ✅ PRIDANÉ
    price: '0',
    capacity: '30',
    auto_confirm: false
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSaveCourse = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const courseData = {
        code: formData.code,
        title: formData.title,
        description: formData.description,
        type: formData.type, // ✅ PRIDANÉ
        price: parseFloat(formData.price),
        capacity: parseInt(formData.capacity),
        auto_confirm: formData.auto_confirm
      };

      const newCourse = await coursesAPI.createCourse(courseData);
      console.log('Created course:', newCourse);
      alert('Kurz byl úspěšně vytvořen! Nyní jste garantem tohoto kurzu.');
      navigate('/instructor/courses'); // Presmeruj na moje kurzy
    } catch (err) {
      setError(err.message || 'Vytvoření kurzu se nezdařilo');
      console.error('Error creating course:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate(-1); // Vrátiť sa späť
  };

  return (
    <div className="create-course">

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <form onSubmit={handleSaveCourse} className="course-form">
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

        <div className="info-message">
          <p>ℹ️ Po vytvoření kurzu se automaticky stanete garantem tohoto kurzu.</p>
          <p>💡 Kurz musí být schválen administrátorem, než bude viditelný pro ostatní.</p>
        </div>

        <div className="form-actions">
          <button 
            type="submit" 
            className="button button-success"
            disabled={loading}
          >
            {loading ? '⏳ Vytvářím kurz...' : '✓ Vytvořit kurz'}
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

export default CreateCourse;