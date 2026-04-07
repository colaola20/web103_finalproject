const BASE_URL = "http://localhost:3000";

export const helloWord = async () => {
  try {
    const response = await fetch(`${BASE_URL}/hello`);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "API Request Failed");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching hello word:", error);
    throw error;
  }
};
