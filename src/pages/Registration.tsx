import { useState, type SyntheticEvent } from "react";
import registrationService from "../services/registrationService";

const Registation = () => {

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handeRegistrationSubmit = async(event: SyntheticEvent) => {
    event.preventDefault()

    try {
      await registrationService.registerUser({ name, email, password });
    } catch (error) {
      setError(
        error instanceof Error ? error.message : 'Something went wrong',
      );
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

export default Registation;