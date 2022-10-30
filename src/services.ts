import { AccessCode, Lock, Unit } from "@prisma/client";
import { context } from './context'
import { generateAccessCode, deleteAccessCode } from './tuya/acess_code'
import { Context } from './context'

const getUnitLockIfExist = (unitId: number): Promise<Lock> | any => {
    return context.prisma.lock.findFirst({
        where: {
            unit_id: unitId,
        },
    });
}
async function deletePassCodeIfExist(lock: Lock) {
    const access_code = await context.prisma.accessCode.findFirst({
        where: {
            lock_id: lock.id,
        },
    });
    if (access_code) {
        console.log("old access code data is deleted ")
        deleteAccessCode(lock.remote_lock_id, access_code.passcode, Boolean(process.env.FAKE_API)) //delete from tuya
        const deleted = await context.prisma.accessCode.deleteMany({
            where: {
                id: access_code.id
            }
        })
        console.log({ deleted })
    }
    return true
}
async function updateLockData(reservation: any, lock: Lock, context: Context) {
    const deviceId = lock.remote_lock_id;
    await
        deletePassCodeIfExist(lock);
    const access_code = await generateAccessCode(deviceId, reservation.check_in, reservation.check_out, Boolean(process.env.FAKE_API))
    const AccessCode = await context.prisma.accessCode.create({
        data: {
            lock: {
                connect: {
                    id: lock.id,
                }
            },
            reservation: {
                connect: {
                    id: reservation.id,
                }
            },
            passcode: access_code,
            remote_passcode_id: "temp" //according to documentation nothing is sent but an ID
        },
    })
    console.log(AccessCode)
    console.log("new access code data is created")
}
export default { getUnitLockIfExist, updateLockData, deletePassCodeIfExist }