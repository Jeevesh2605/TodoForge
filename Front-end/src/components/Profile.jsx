import React, { useEffect, useState } from 'react'
import { toast, ToastContainer } from 'react-toastify'
import axios from 'axios'
import { BACK_BUTTON, DANGER_BTN, FULL_BUTTON, INPUT_WRAPPER, personalFields, SECTION_WRAPPER, securityFields } from '../assets/dummy'
import { ChevronLeft, UserCircle, Save, Shield, LogOut, Lock } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const API_URL = 'http://localhost:4000'

// Input component
const Input = ({ className, ...props }) => (
  <input className={className} {...props} />
)

const Profile = ({ setCurrentUser, onLogout }) => {
  const [profile, setProfile] = useState({ name: "", email: "" })
  const [passwords, setPasswords] = useState({ current: "", new: "", confirm: "" })
  const navigate = useNavigate()

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) return
    
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
  }, [])

  const saveProfile = async (e) => {
    e.preventDefault()
    try {
      const token = localStorage.getItem('token')
      const { data } = await axios.put(
        `${API_URL}/api/user/profile`,
        { name: profile.name, email: profile.email },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      
      if (data.success) {
        setCurrentUser((prev) => ({
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

  const changePassword = async (e) => {
    e.preventDefault()
    if (passwords.new !== passwords.confirm) {
      return toast.error("Passwords do not match")
    }
    try {
      const token = localStorage.getItem('token')
      const { data } = await axios.put(
        `${API_URL}/api/user/password`,
        { currentPassword: passwords.current, newPassword: passwords.new },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      if (data.success) {
        toast.success("Password Changed")
        setPasswords({ current: "", new: "", confirm: "" })
      } else {
        toast.error(data.message)
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Password change failed")
    }
  }

  return (
    <>
      <ToastContainer position='top-center' autoClose={3000} />
      <div className='max-w-3xl mx-auto p-4 ml-4'>
        <button onClick={() => navigate(-1)} className={BACK_BUTTON}>
          <ChevronLeft className='w-5 h-5 mr-1' />
          Back to Dashboard
        </button>
        
        <div className='flex items-center gap-4 mb-6'>
          <div className='w-14 h-14 rounded-full bg-gradient-to-br from-fuchsia-500 to-purple-600 flex items-center justify-center text-white text-xl font-bold shadow-md'>
            {profile.name ? profile.name[0].toUpperCase() : "U"}
          </div>
          <div>
            <h1 className='text-2xl font-bold text-white'>Account Settings</h1>
            <p className='text-gray-300 text-sm'>Manage your Profile and security settings</p>
          </div>
        </div>

        <div className='grid md:grid-cols-2 gap-6'>
          <section className={`${SECTION_WRAPPER} p-4`}>
            <div className='flex items-center gap-2 mb-4'>
              <UserCircle className='text-purple-500 w-5 h-5' />
              <h2 className='text-lg font-semibold text-gray-800'>Personal Information</h2>
            </div>
            
            <form onSubmit={saveProfile} className='space-y-3'>
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
              <button type="submit" className={FULL_BUTTON}>
                <Save className='w-4 h-4' /> Save Changes
              </button>
            </form>
          </section>
          
          <section className={`${SECTION_WRAPPER} p-4`}>
            <div className='flex items-center gap-2 mb-4'>
              <Shield className='text-purple-500 w-5 h-5' />
              <h2 className='text-lg font-semibold text-gray-800'>Security</h2>
            </div>

            <form onSubmit={changePassword} className='space-y-3'>
              {securityFields.map(({ name, placeholder }) => (
                <div key={name} className={INPUT_WRAPPER}>
                  <Lock className='text-purple-500 w-5 h-5 mr-2' />
                  <Input 
                    type="password"
                    placeholder={placeholder} 
                    value={passwords[name]}
                    onChange={(e) => setPasswords({ ...passwords, [name]: e.target.value })}
                    className='w-full focus:outline-none text-sm' 
                    required 
                  />
                </div>
              ))}
              <button type="submit" className={FULL_BUTTON}>
                <Shield className='w-4 h-4'/> Change Password  
              </button>

              <div className='mt-6 pt-4 border-t border-purple-100'>
                <h3 className='text-red-600 font-semibold mb-3 flex items-center gap-2'>
                  <LogOut className='w-4 h-4' /> Danger Zone
                </h3>
                <button className={DANGER_BTN} onClick={onLogout}>
                  Logout
                </button>
              </div>
            </form>
          </section>
        </div>
      </div>
    </>
  )
}

export default Profile