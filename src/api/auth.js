import cryptoBrowserify from 'crypto-browserify';

const authorizationEP = process.env.REACT_APP_AUTH_AUTHORIZATION_EP
const clientId = process.env.REACT_APP_AUTH_CLIENT_ID;
const redirectEP = process.env.REACT_APP_AUTH_REDIRECT_EP;
const scope = process.env.REACT_APP_AUTH_SCOPE;
const tokenEP = process.env.REACT_APP_AUTH_TOKEN_EP

const base64URLEncode = str => {
  return str.toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
};

const sha256 = buffer => {
  return cryptoBrowserify.createHash('sha256').update(buffer).digest();
}

/** get tokens */
export const getTokens = () => {
  const accessToken = window.localStorage.getItem('accessToken');
  if (accessToken === null) {
    return null;
  }
  const idToken = window.localStorage.getItem('idToken');
  const refreshToken = window.localStorage.getItem('refreshToken');
  return {
    accessToken,
    idToken,
    refreshToken,
  };
};

/** load authorization URL */
export const loadAuthorizationURL = () => {
  const verifier = base64URLEncode(cryptoBrowserify.randomBytes(32));
  window.localStorage.setItem('verifier', verifier);
  const challenge = base64URLEncode(sha256(verifier));
  const authorizationURL = [
    `${authorizationEP}?`,
    'response_type=code&',
    `client_id=${clientId}&'`,
    `redirect_uri=${redirectEP}&`,
    `scope=${scope}&`,
    `code_challenge_method=S256&`,
    `code_challenge=${challenge}`,
  ].join('');
  window.location.assign(authorizationURL);
};

/** exchange code for tokens  */
export const exchangeCodeforTokens = async code => {
  const verifier = window.localStorage.getItem('verifier');
  window.localStorage.removeItem('verifier');
  const body = [
    'grant_type=authorization_code&',
    `code=${code}&`,
    `redirect_uri=${redirectEP}&`,
    `client_id=${clientId}&`,
    `code_verifier=${verifier}`
  ].join('');
  const response = await fetch(tokenEP, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });
  if (!response.ok) {
    throw Error();
  }
  const { access_token, id_token, refresh_token } = await response.json();
  window.localStorage.setItem('accessToken', access_token);
  window.localStorage.setItem('idToken', id_token);
  window.localStorage.setItem('refreshToken', refresh_token);
}

/** refresh tokens */
export const refreshTokens = async () => {
  const refreshToken = window.localStorage.getItem('refreshToken');
  const body = [
    'grant_type=refresh_token&',
    `refresh_token=${refreshToken}&`,
    `client_id=${clientId}`,
  ].join('');
  const response = await fetch(tokenEP, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });
  if (!response.ok) {
    throw Error();
  }
  const { access_token, id_token } = await response.json();
  window.localStorage.setItem('accessToken', access_token);
  window.localStorage.setItem('idToken', id_token);
}
