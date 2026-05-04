/**
 * Helper to extract error message from axios error or generic error object
 */
export const getErrorMessage = (error: unknown, defaultMessage: string): string => {
  if (error && typeof error === "object" && "response" in error) {
    const axiosError = error as { 
      response?: { 
        data?: { 
          message?: string;
          errors?: Array<{ message: string }>;
        } 
      } 
    };
    
    // 1. Try top-level message
    if (axiosError.response?.data?.message) {
      return axiosError.response.data.message;
    }
    
    // 2. Try first error in errors array
    if (axiosError.response?.data?.errors?.[0]?.message) {
      return axiosError.response.data.errors[0].message;
    }

    return defaultMessage;
  }
  
  if (error && typeof error === "object" && "message" in error) {
    return (error as { message: string }).message;
  }
  
  return defaultMessage;
};
