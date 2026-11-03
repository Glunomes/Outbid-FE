import { useState, type SyntheticEvent } from "react";
import registrationService from "../services/authService";

const Login = () => {

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handeRegistrationSubmit = async(event: SyntheticEvent) => {
    event.preventDefault()

    try {
      await registrationService.login({ email, password });
      setEmail('')
      setPassword('')
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

export default Login;