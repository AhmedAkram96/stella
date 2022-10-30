var axios = require('axios');
import { getAccessToken } from "./access_token";

function calcSign(clientId: any, timestamp: any, strToSign: any, secret: any) {
    var str = clientId + timestamp + "" + strToSign;
    var hash = CryptoJS.HmacSHA256(str, secret);
    var hashInBase64 = hash.toString();
    var signUp = hashInBase64.toUpperCase();
    return signUp;
}
function calcSignWithToken(clientId: any, access_token: string, timestamp: any, strToSign: any, secret: any) {
    var str = clientId + access_token + timestamp + "" + strToSign;
    var hash = CryptoJS.HmacSHA256(str, secret);
    var hashInBase64 = hash.toString();
    var signUp = hashInBase64.toUpperCase();
    return signUp;
}
function createStrToSign(method: string, body: string, headers: string, url: string) {
    const hash = CryptoJS.SHA256(body)
    var stringToSign: any = method + "\n" + hash + "\n" + headers + "\n" + url
    return stringToSign
}
export async function createReqConfig(method: string, path: string, withAccessToken: boolean, extraHeaders: any, body: any) {
    var strToSign = createStrToSign(method.toUpperCase(), body, extraHeaders, path)
    const timeData = new Date().getTime()
    let sign;
    if (withAccessToken) {
        const access_token = await getAccessToken()
        sign = calcSignWithToken(process.env.ACCESS_ID, access_token, timeData, strToSign, process.env.ACCESS_SECRET)
    }
    else {
        sign = calcSign(process.env.ACCESS_ID, timeData, strToSign, process.env.ACCESS_SECRET)
    }
    let extras = {}
    if (extraHeaders != "") {
        extras = { ...extras, ...JSON.parse(extraHeaders) }
    }
    var config = {
        method: method,
        url: process.env.HOST + path,
        headers: {
            ...extras,
            'client_id': process.env.ACCESS_ID,
            'sign': sign,
            't': timeData,
            'sign_method': process.env.SIGN_METHOD,
        }
    };
    return config
}
export function callRequest(config: any) {
    return axios(config)
        .then(function (response: { data: any; }) {
            return response.data;
        })
        .catch(function (error: any) {
            console.log(error);
            return error
        });
}
