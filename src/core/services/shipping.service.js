import axios from 'axios';
import { config } from '../../config/index.js';

export const makeShippingService = () => {
  const getCost = async ({ originCityId, destinationCityId, weight, couriers = 'jne,jnt,sicepat,pos' }) => {
    const response = await axios.post('https://api.binderbyte.com/v1/cost', {
      api_key: config.BINDERBYTE_API_KEY,
      courier: couriers,
      weight: Math.max(weight || 1000, 1),
      origin: originCityId,
      destination: destinationCityId,
    });

    if (response.data.code !== '200') {
      throw new Error('Failed to fetch shipping cost');
    }

    return response.data.data;
  };

  const searchCity = async (name) => {
    const response = await axios.get('https://api.binderbyte.com/wilayah/kabupaten', {
      params: { api_key: config.BINDERBYTE_API_KEY, search: name },
    });
    return response.data.data || [];
  };

  return { getCost, searchCity };
};
