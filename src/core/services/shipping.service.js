import axios from 'axios';
import { config } from '../../config/index.js';

// RajaOngkir API V2 — base URL moved to rajaongkir.komerce.id
const BASE_URL = 'https://rajaongkir.komerce.id/api/v1';

const rajaongkir = axios.create({
  baseURL: BASE_URL,
  headers: { key: config.RAJAONGKIR_API_KEY },
  timeout: 10_000,
});

const isRetryable = (err) =>
  err.code === 'ECONNABORTED' || // timeout
  err.code === 'ECONNRESET' ||
  err.code === 'ENOTFOUND' ||
  !err.response; // no response = network error

const withRetry = async (fn, maxRetries = 2, delayMs = 1000) => {
  let lastErr;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      if (!isRetryable(err) || attempt === maxRetries) throw err;
      await new Promise((r) => setTimeout(r, delayMs));
    }
  }
  throw lastErr;
};

export const makeShippingService = () => {
  /**
   * Search subdistrict by city/area name.
   * Returns array of { id, label, province_name, city_name, district_name, subdistrict_name, zip_code }
   */
  const searchDestination = async (query, limit = 10) => {
    const res = await withRetry(() =>
      rajaongkir.get('/destination/domestic-destination', {
        params: { search: query, limit },
      })
    );
    return res.data?.data ?? [];
  };

  /**
   * Resolve a city name string to a subdistrict ID.
   * Tries to match city_name first, then broader label match.
   */
  const resolveSubdistrictId = async (cityName) => {
    const q = cityName.trim();
    const results = await searchDestination(q, 20);
    if (!results.length) throw new Error(`Destination not found: ${cityName}`);

    // Prefer a result whose city_name matches the query
    const byCity = results.find(
      (r) => r.city_name?.toLowerCase() === q.toLowerCase()
    );
    // Fallback to first result
    return (byCity ?? results[0]).id;
  };

  /**
   * Calculate domestic shipping cost.
   * V2 API uses form-data (URLSearchParams), not JSON.
   * Supports multiple couriers via colon separator: "jne:jnt:tiki:sicepat"
   *
   * Returns flat array: [{ name, code, service, description, cost, etd }]
   */
  const getCost = async ({
    originSubdistrictId,
    destinationSubdistrictId,
    weight,
    couriers = config.SHIPPING_COURIERS,
  }) => {
    const form = new URLSearchParams();
    form.append('origin', String(originSubdistrictId));
    form.append('destination', String(destinationSubdistrictId));
    form.append('weight', String(Math.max(Number(weight) || 1000, 1)));
    form.append('courier', couriers);

    const res = await withRetry(() =>
      rajaongkir.post('/calculate/domestic-cost', form, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      })
    );

    return res.data?.data ?? [];
  };

  /**
   * Resolve city names to subdistrict IDs then calculate cost.
   * This is the main entry point called by the shipping router.
   */
  const getCostByCityName = async ({ originCity, destinationCity, weight, couriers }) => {
    const [originId, destinationId] = await Promise.all([
      resolveSubdistrictId(originCity),
      resolveSubdistrictId(destinationCity),
    ]);
    return getCost({
      originSubdistrictId: originId,
      destinationSubdistrictId: destinationId,
      weight,
      couriers,
    });
  };

  return { getCost, getCostByCityName, searchDestination, resolveSubdistrictId };
};
