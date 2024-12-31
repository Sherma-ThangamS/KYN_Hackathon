import axios from "axios";
const apiKey = process.env.REACT_APP_CURRENTS_API_KEY;

const result = await axios.get(`https://api.currentsapi.services/v1/available/categories?apiKey=${apiKey}`);
const categories = result.data.categories

export default categories
