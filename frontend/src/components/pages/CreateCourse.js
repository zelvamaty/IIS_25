import React, { useState } from 'react';
import './CreateCourse.css';

const CreateCourse = () => {
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    type: '',
    description: '',
    price: '',
    rating: '',
    allowNews: false
  });

  const [terms, setTerms] = useState([]);
  const [showTermForm, setShowTermForm] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleAddTerm = () => {
    setShowTermForm(true);
  };

  const handleSaveCourse = (e) => {
    e.preventDefault();
    console.log('Saving course:', formData, terms);
  };

  const handleCancel = () => {
    console.log('Cancel');
  };

  return (
    <div className="create-course">

      <form onSubmit={handleSaveCourse} className="course-form">
        <div className="form-section">
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Název kurzu *</label>
              <input
                type="text"
                name="name"
                className="input-field"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Označení kurzu *</label>
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
                <option value="">Vyberte typ</option>
                <option value="prednaska">Přednáška</option>
                <option value="cviceni">Cvičení</option>
                <option value="zkouska">Zkouška</option>
                <option value="domaci-ukol">Domácí úkol</option>
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
                value={formData.description}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-row two-columns">
            <div className="form-group">
              <label className="form-label">Cena (Kč)</label>
              <input
                type="number"
                name="price"
                className="input-field"
                value={formData.price}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Celkové hodnocení (0-100)</label>
              <input
                type="number"
                name="rating"
                className="input-field"
                min="0"
                max="100"
                value={formData.rating}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-row">
            
          </div>
        </div>

        <div className="terms-section">
          <div className="section-header">
            <h2 className="section-title">Termíny kurzu</h2>
            <button 
              type="button" 
              className="button button-success"
              onClick={handleAddTerm}
            >
              + Přidat termín
            </button>
          </div>

          <div className="terms-list">
            {terms.length === 0 ? (
              <div className="empty-state">
                <p>Zatím nebyly přidány žádné termíny</p>
              </div>
            ) : (
              <table className="table">
                <thead>
                  <tr>
                    <th>Název</th>
                    <th>Typ</th>
                    <th>Datum</th>
                    <th>Čas</th>
                    <th>Akce</th>
                  </tr>
                </thead>
                <tbody>
                  {terms.map((term, index) => (
                    <tr key={index}>
                      <td>{term.name}</td>
                      <td>{term.type}</td>
                      <td>{term.date}</td>
                      <td>{term.time}</td>
                      <td>
                        <button 
                          type="button" 
                          className="button button-danger button-small"
                        >
                          Smazat
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="button button-success">
            Uložit kurz
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