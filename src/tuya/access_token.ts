import { context } from '../context';
import { createReqConfig, callRequest } from './request';

export async function createAccessToken() {
    const config = await createReqConfig("get", "/v1.0/token?grant_type=1", false, "", "")
    const access_token_res = await callRequest(config)
    const credentials = await context.prisma.credentials.create({
        data: {
            access_token: access_token_res.result.access_token,
            expires_in: new Date(new Date().getTime() + (access_token_res.result.expire_time * 1000)),
            refresh_token: access_token_res.result.refresh_token,
            uid: access_token_res.result.uid
        }
    })
    return credentials.access_token
}
export async function refreshAccessToken(id: bigint, refresh_token: string) {
    console.log(refresh_token)
    const config = await createReqConfig("get", `/v1.0/token/${refresh_token}`, false, "", "")
    const refresh_token_res = await callRequest(config)
    console.log(refresh_token_res)
    const credentials = await context.prisma.credentials.update({
        where: {
            id: id
        },
        data: {
            access_token: refresh_token_res.result.access_token,
            expires_in: new Date(new Date().getTime() + (refresh_token_res.result.expire_time * 1000)),
            refresh_token: refresh_token_res.result.refresh_token,
            uid: refresh_token_res.result.uid
        }
    })
    return credentials.access_token
}
export async function getAccessToken() {
    const credentials = await context.prisma.credentials.findFirst()
    if (credentials) {
        const expireTime = credentials.expires_in.getTime()
        const remainingMinutesToExpire = (expireTime - new Date().getTime()) / (1000 * 60)
        if (remainingMinutesToExpire <= 2) {
            return refreshAccessToken(credentials.id, credentials.refresh_token);
        }
        //returning from db
        return credentials.access_token
    }
    else {
        return createAccessToken()
    }
}