import { sha256 } from 'js-sha256';

export function validate_hex(queries){

  const SHARED_SECRET = '07898aae7e5bd05e8f9e5a3e70e47495';
  
  const query_hash = queries;
  console.log(query_hash);
  // Remove and save the "signature" entry
  const signature = query_hash.signature;
  delete query_hash.signature;
  console.log(signature);

  const sorted_params = Object.entries(query_hash)
    .map(([k, v]) => `${k}=${Array.isArray(v) ? v.join(',') : v}`)
    .sort()
    .join('');    

  const calculated_signature = sha256.hmac(SHARED_SECRET, sorted_params);
  console.log(calculated_signature);

  if (signature !== calculated_signature) {
    console.log("Is not equal");
  }else{
    console.log("Is equal");
  }

}