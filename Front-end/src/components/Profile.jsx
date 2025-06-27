import React, { useEffect, useState } from 'react'
import { toast, ToastContainer } from 'react-toastify'
import axios from 'axios' // Added missing import
import { BACK_BUTTON, FULL_BUTTON, INPUT_WRAPPER, personalFields, SECTION_WRAPPER } from '../assets/dummy'
import { ChevronLeft, UserCircle, Save } from 'lucide-react' // Added Save import
import { useNavigate } from 'react-router-dom'

const API_URL = 'http://localhost:4000'

// Added Input component (you might need to adjust this based on your actual Input component)
const Input = ({ className, ...props }) => (
  <input className={className} {...props} />
)

const Profile = ({ setCurrentUser, onLogout }) => { // Fixed component name capitalization and prop name
  const [profile, setProfile] = useState({ name: "", email: "" })
  const [passwords, setPassword] = useState({ current: "", new: "", confirm: "" })
  const navigate = useNavigate()

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) return // Fixed: return early if no token, don't make API call
    
    axios
      .get(`${API_URL}/api/user/me`, { 
        headers: { Authorization: `Bearer ${token}` } 
      })
      .then(({ data }) => {
        if (data.success) {
          setProfile({ name: data.user.name, email: data.user.email })
        } else {
          toast.error(data.message)
        }
      })
      .catch(() => toast.error("Unable to load Profile"))
  }, []) // Dependencies are fine as-is since we're only using localStorage

  const saveProfile = async (e) => {
    e.preventDefault() // Fixed typo: preventdefault -> preventDefault
    try {
      const token = localStorage.getItem('token')
      const { data } = await axios.put(
        `${API_URL}/api/user/profile`,
        { name: profile.name, email: profile.email },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      
      if (data.success) {
        setCurrentUser((prev) => ({ // Fixed typo: setCurrenUser -> setCurrentUser
          ...prev,
          name: profile.name,
          avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name || 'User')}&background=random`
        }))
        toast.success("Profile Updated")
      } else {
        toast.error(data.message)
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Profile update failed")
    }
  }

  return (
    <div className='min-h-screen bg-gray-50'>
      <ToastContainer position='top-center' autoClose={3000} />
      <div className='max-w-4xl mx-auto p-6'>
        <button onClick={() => navigate(-1)} className={BACK_BUTTON}> {/* Fixed: Navigate -> navigate */}
          <ChevronLeft className='w-5 h-5 mr-1' />
          Back to Dashboard
        </button>
        
        <div className='flex items-center gap-4 mb-8'>
          <div className='w-16 h-16 rounded-full bg-gradient-to-br from-fuchsia-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold shadow-md'>
            {profile.name ? profile.name[0].toUpperCase() : "U"}
          </div>
          <div>
            <h1 className='text-3xl font-bold text-gray-800'>Account Settings</h1>
            <p className='text-gray-500 text-sm'>Manage your Profile and security settings</p>
          </div>
        </div>

        <div className='grid md:grid-cols-2 gap-8'>
          <section className={SECTION_WRAPPER}>
            <div className='flex items-center gap-2 mb-6'>
              <UserCircle className='text-purple-500 w-5 h-5' />
              <h2 className='text-xl font-semibold text-gray-800'>Personal Information</h2>
            </div>
            
            {/* PERSONAL INFO NAME, EMAIL */}
            <form onSubmit={saveProfile} className='space-y-4'>
              {personalFields.map(({ name, type, placeholder, icon: Icon }) => (
                <div key={name} className={INPUT_WRAPPER}>
                  <Icon className='text-purple-500 w-5 h-5 mr-2' />
                  <Input 
                    type={type} 
                    placeholder={placeholder} 
                    value={profile[name]}
                    onChange={(e) => setProfile({ ...profile, [name]: e.target.value })}
                    className='w-full focus:outline-none text-sm' 
                    required 
                  />
                </div>
              ))}
              <button type="submit" className={FULL_BUTTON}> {/* Added type="submit" for clarity */}
                <Save className='w-4 h-4' /> Save Changes
              </button>
            </form>
          </section>
        </div>
      </div>
    </div>
  )
}

export default Profile