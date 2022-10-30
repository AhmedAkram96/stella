import { PrismaClient, Prisma } from '@prisma/client'

const prisma = new PrismaClient()


async function main() {
    console.log(`Start seeding ...`)
    const unitdata = {
        unit_name: "seed_unit"
    }
    const unit = await prisma.unit.create({
        data: unitdata,
    })
    console.log(`Created unit with id: ${unit.id}`)
    const lockData = {
        unit_id: unit.id,
        remote_lock_id: "8874604198cdac02b162"
    }
    const lock = await prisma.lock.create({
        data: lockData,
    })
    console.log(`Created lock with id: ${lock.id} attached to unit with id: ${unit.id}`)
    console.log(`Seeding finished.`)
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
