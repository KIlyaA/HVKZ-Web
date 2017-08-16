import hmacsha1 from 'hmacsha1';

const OAUTH_CONSUMER_SECRET = 'hcNl9cGhwIEHkVBkoloksvxsJ3amCw';
const OAUTH_TOKEN_SECRET = 'GUxfS.kHMriSL2ILTUAnzdDvaIzsvmq0smej8rcn';
const KEY = OAUTH_CONSUMER_SECRET + '&' + OAUTH_TOKEN_SECRET;
const GET = 'GET';

export default (url: string, params: {[k: string]: string}) => {
  let base = GET + '&' + encodeURIComponent(url) + '&';
  let keys = Object.keys(params).sort((a, b) => a.localeCompare(b));

  for (let i = 0; i < keys.length; i++) {
    let key = keys[i] + '=' + params[keys[i]];

    if (i + 1 !== keys.length) {
      key += '&';
    }

    base += encodeURIComponent(key);
  }

  return hmacsha1(KEY, base.replace('%40', '%2540'));
};