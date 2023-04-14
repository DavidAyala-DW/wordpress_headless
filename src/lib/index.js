import { sha256 } from 'js-sha256';

export function validate_hex(queries){

  const SHARED_SECRET = process.env.SHOPIFY_APP_SECRET;
  
  const query_hash = queries;
  
  const signature = query_hash.signature;
  delete query_hash.signature;

  const sorted_params = Object.entries(query_hash)
    .map(([k, v]) => `${k}=${Array.isArray(v) ? v.join(',') : v}`)
    .sort()
    .join('');    

  const calculated_signature = sha256.hmac(SHARED_SECRET, sorted_params);

  return signature === calculated_signature

}