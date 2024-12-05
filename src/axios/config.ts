import axios from "axios";

// Add an interceptor for error responses
axios.interceptors.response.use(
  (response) => response, // Pass through successful responses
  (error) => {
    // Transform the error response
    if (error.response) {
      // Include only status, message, and body
      const simplifiedError = {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data,
      };
      return Promise.reject(simplifiedError);
    }

    // If no response (e.g., network error), pass the original error
    return Promise.reject({
      message: error.message,
    });
  }
);
