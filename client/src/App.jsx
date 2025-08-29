import React, {useState, useEffect} from 'react'

const ListItems = ({items, type}) => (
  <div>
    <h2>{type}</h2>
    <ul>
      {items.map((item, index) => (
        <li key={index}>
          {type === 'Neighbors' ? (
            <>Name: {item.neighbor}, Power: {item.specialPower}</>
          ) : (
            <>Name: {item.name}, Location: {item.location}, Park: {item.park}</>
          )}
        </li>
      ))}
    </ul>
  </div>
)

const AddForm = ({type, onSubmit}) => {
  const [formData, setFormData] = useState(
    type === 'Neighbors'
      ? {neighbor: '', specialPower: ''}
      : {name: '', location: '', park: ''}
  )

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(formData)
    setFormData(
      type === 'Neighbors'
        ? {neighbor: '', specialPower: ''}
        : {name: '', location: '', park: ''}
    )
  }

  return (
    <form onSubmit={handleSubmit}>
      {type === 'Neighbors' ? (
        <>
          <input
            type="text"
            placeholder="Neighbor name"
            value={formData.neighbor}
            onChange={(e) => setFormData({
              ...formData,
              neighbor: e.target.value
            })}
          />
          <input
            type="text"
            placeholder="Special power"
            value={formData.specialPower}
            onChange={(e) => setFormData({
              ...formData,
              specialPower: e.target.value
            })}
          />
        </>
      ) : (
        <>
          <input
            type="text"
            placeholder="Pet name"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
          />
          <input
            type="text"
            placeholder="Location"
            value={formData.location}
            onChange={(e) => setFormData({
              ...formData,
              location: e.target.value
            })}
          />
          <input
            type="text"
            placeholder="Park"
            value={formData.park}
            onChange={(e) => setFormData({...formData, park: e.target.value})}
          />
        </>
      )}
      <button type="submit">Add {type.slice(0, -1)}</button>
    </form>
  )
}

const App = () => {
  const [neighbors, setNeighbors] = useState([])
  const [pets, setPets] = useState([])
  const baseurl = process.env.NODE_ENV === 'Production'
    ? 'https://bqwalker.com'
    : 'http://localhost:3001';

  useEffect(() => {
    fetchNeighbors()
    fetchPets()
  }, [])

  const fetchNeighbors = async () => {
    try {
      const response = await fetch(`${baseurl}/api/neighbors`)
      const data = await response.json()
      setNeighbors(data)
    } catch (error) {
      console.error('Error fetching neighbors:', error)
    }
  }

  const fetchPets = async () => {
    try {
      const response = await fetch(`${baseurl}/api/pets`)
      const data = await response.json()
      setPets(data)
    } catch (error) {
      console.error('Error fetching pets:', error)
    }
  }

  const addNeighbor = async (neighborData) => {
    try {
      const response = await fetch(`${baseurl}/api/neighbors`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(neighborData)
      })
      if (response.ok) {
        fetchNeighbors()
      }
    } catch (error) {
      console.error('Error adding neighbor:', error)
    }
  }

  const addPet = async (petData) => {
    try {
      const response = await fetch(`${baseurl}/api/pets`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(petData)
      })
      if (response.ok) {
        fetchPets()
      }
    } catch (error) {
      console.error('Error adding pet:', error)
    }
  }

  return (
    <div>
      <h2>Welcome to the Neighborhood</h2>
      <AddForm type="Neighbors" onSubmit={addNeighbor}/>
      <ListItems items={neighbors} type="Neighbors"/>
      <AddForm type="Pets" onSubmit={addPet}/>
      <ListItems items={pets} type="Pets"/>
    </div>
  )
}

export default App