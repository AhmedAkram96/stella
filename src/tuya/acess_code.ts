import CryptoJS from 'crypto-js';
import { createReqConfig, callRequest } from './request';


async function getTicket(device_id: string) {
    const config = await createReqConfig("post", `/v1.0/devices/${device_id}/door-lock/password-ticket`, true, "", "")
    const ticket_res = await callRequest(config)
    return [ticket_res.result.ticket_id, ticket_res.result.ticket_key] as const
}
function encryptDecryptTicket(ticket_key: string) {
    //decrypting ticket key to get original key
    const originalKey = CryptoJS.AES.decrypt(ticket_key, process.env.ACCESS_SECRET!).toString(CryptoJS.enc.Hex);
    //encrypting
    const text = CryptoJS.enc.Utf8.parse(originalKey);
    const key = CryptoJS.enc.Utf8.parse(process.env.ACCESS_SECRET!);

    const encrypted = CryptoJS.AES.encrypt(text, key, { mode: CryptoJS.mode.ECB, padding: CryptoJS.pad.Pkcs7 });
    return encrypted.ciphertext.toString(CryptoJS.enc.Hex);
}
export async function generateAccessCode(device_id: string, check_in: Date, check_out: Date, fake: boolean) {
    if (fake) {
        return "124367346"
    }
    const [ticket_id, ticket_key] = await getTicket(device_id)
    let password = encryptDecryptTicket(ticket_key)
    const body = {
        "password": password,
        "password_type": "ticket",
        "ticket_id": ticket_id,
        "effective_time": new Date(check_in).getTime() / 1000, //in secs
        "invalid_time": new Date(check_out).getTime() / 1000, // in secs
        "name": "test",
        "phone": 11233213,
    }
    const config = await createReqConfig("post", `/v1.0/devices/${device_id}/door-lock/password-ticket`, true, "", body)


    const access_code_res = await callRequest(config)
    return access_code_res.result.id
}
export async function deleteAccessCode(device_id: string, password_id: string, fake: boolean) {
    if (fake) {
        return true
    }
    const config = await createReqConfig("delete", `/v1.0/devices/${device_id}/door-lock/temp-passwords/${password_id}`, true, "", "")
    const output = await callRequest(config)
    console.log(output)
    return output
}
