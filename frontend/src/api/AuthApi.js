import axios from "axios";

// Define the base URL for your API
const AUTH_API_URL = process.env.REACT_APP_AUTH_API_URL || "http://localhost:8000/auth";

// Create a function to log in
export const login = async (data) => {
    try {
      const response = await axios.post(`${AUTH_API_URL}/login`, data);
      return response.data; // Return response if needed
    } catch (error) {
      if (error.response) {
        console.error("Error logging in:", error.response.data);
        throw new Error(error.response.data.message);
      }
      console.error("Error logging in:", error);
      throw error; // Re-throw the error to handle it in the component
    }
  };