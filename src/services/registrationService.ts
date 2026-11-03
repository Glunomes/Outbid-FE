const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const registerUser = async(data: {
  name:string;
  email:string;
  password:string;
}) => {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();

    const message = Array.isArray(error.message)
    ? error.message.join(', ')
    : error.message;

  throw new Error(message || 'Error while register account');
}


  return response.json() as Promise<{
    id: string;
    name: string;
    email: string;
  }>;
}

export default {
  registerUser,
};