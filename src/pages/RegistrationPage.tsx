import { useState, type SyntheticEvent } from "react";
import { useNavigate } from 'react-router-dom';
import registrationService from "../services/authService";

export const RegistrationPage = () => {

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const navigate = useNavigate();

  const handeRegistrationSubmit = async(event: SyntheticEvent) => {
    event.preventDefault()

    try {
      await registrationService.registerUser({ name, email, password });
      setEmail('');
      setName('');
      setPassword('');
      navigate('/auth/login', { replace:true })
    } catch (error) {
      setError(
        error instanceof Error ? error.message : 'Something went wrong',
      );
      setTimeout(() => setError(''), 5000)
    }
  }

  return (
    <div>
      {error && <p>{error}</p>}
      <form onSubmit={handeRegistrationSubmit}>
        <div>
          <label>Name</label>
          <input 
            type="text" 
            value={name} 
            onChange={e => setName(e.target.value)}
          />
        </div>
        <div>
          <label>Email</label>
          <input 
            type="text" 
            value={email} 
            onChange={e => setEmail(e.target.value)}
          />
        </div>
        <div>
          <label>Password</label>
          <input 
            type="text" 
            value={password} 
            onChange={e => setPassword(e.target.value)}
          />
        </div>
        <button type="submit">Create</button>
      </form>
    </div>
  )
}