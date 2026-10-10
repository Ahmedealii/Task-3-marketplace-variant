import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { api } from '../api'

const defaults = { title: '', description: '', price: 0, category: 'other', condition: 'used', status: 'active' }

export default function ListingForm() {
  const nav = useNavigate()
  const { id } = useParams()
  const [form, setForm] = useState(defaults)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!id) {
      setForm(defaults)
      return
    }

    async function loadListing() {
      try {
        const res = await api.get('/listings/' + id)
        const listing = res.data.listing
        setForm({
          title: listing.title,
          description: listing.description || '',
          price: Number(listing.price),
          category: listing.category,
          condition: listing.condition,
          status: listing.status
        })
      } catch (err) {
        setError(err?.response?.data?.message || 'Unable to load listing')
      }
    }

    loadListing()
  }, [id])

  function onChange(e) {
    const { name, value } = e.target
    setForm(prev => ({
      ...prev,
      [name]: name === 'price' ? Number(value) : value
    }))
  }

  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    const payload = {
      title: form.title,
      description: form.description,
      price: form.price,
      category: form.category,
      condition: form.condition,
      status: form.status
    }

    try {
      if (id) {
        await api.patch('/listings/' + id, payload)
      } else {
        await api.post('/listings', payload)
      }
      nav('/listings')
    } catch (err) {
      setError(err?.response?.data?.message || 'Save failed')
    }
  }

  return (
    <div className="max-w-lg mx-auto card">
      <h1 className="text-xl font-semibold mb-4">{id ? 'Edit' : 'New'} Listing</h1>
      <form onSubmit={onSubmit} className="space-y-3">
        <label className="block text-sm font-medium" htmlFor="title">Title</label>
        <input id="title" name="title" value={form.title} onChange={onChange} className="input" required />

        <label className="block text-sm font-medium" htmlFor="price">Price</label>
        <input id="price" name="price" type="number" min="0" value={form.price} onChange={onChange} className="input" required />

        <label className="block text-sm font-medium" htmlFor="category">Category</label>
        <select id="category" name="category" value={form.category} onChange={onChange} className="input">
          <option value="textbooks">Textbooks</option>
          <option value="electronics">Electronics</option>
          <option value="furniture">Furniture</option>
          <option value="clothing">Clothing</option>
          <option value="other">Other</option>
        </select>

        <label className="block text-sm font-medium" htmlFor="condition">Condition</label>
        <select id="condition" name="condition" value={form.condition} onChange={onChange} className="input">
          <option value="new">New</option>
          <option value="like-new">Like new</option>
          <option value="used">Used</option>
          <option value="worn">Worn</option>
        </select>

        {id && (
          <>
            <label className="block text-sm font-medium" htmlFor="status">Status</label>
            <select id="status" name="status" value={form.status} onChange={onChange} className="input">
              <option value="active">Active</option>
              <option value="sold">Sold</option>
            </select>
          </>
        )}

        <label className="block text-sm font-medium" htmlFor="description">Description</label>
        <textarea id="description" name="description" value={form.description} onChange={onChange} className="input" rows="4" />

        {error && <div className="text-red-600 text-sm">{error}</div>}
        <button className="btn" type="submit">Save</button>
      </form>
    </div>
  )
}
