import React, { useState } from 'react';

const ServiceForm = ({ initial, onSubmit, loading, submitText }) => {
  const [form, setForm] = useState(initial || {
    title: '', description: '', price: '', duration: '', image: ''
  });
  const [imgFile, setImgFile] = useState(null);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImage = e => {
    const file = e.target.files[0];
    setImgFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setForm(f => ({ ...f, image: reader.result }));
    if (file) reader.readAsDataURL(file);
  };

  const handleSubmit = e => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <form className="service-form" onSubmit={handleSubmit}>
      <input name="title" placeholder="Title" value={form.title} onChange={handleChange} required />
      <input name="description" placeholder="Description" value={form.description} onChange={handleChange} />
      <input name="price" type="number" placeholder="Price" value={form.price} onChange={handleChange} required />
      <input name="duration" type="number" placeholder="Duration (min)" value={form.duration} onChange={handleChange} required />
      <input type="file" accept="image/*" onChange={handleImage} required={!initial} />
      <button type="submit" disabled={loading}>{loading ? 'Saving...' : submitText || 'Save'}</button>
    </form>
  );
};

export default ServiceForm; 