import { makeExecutableSchema } from '@graphql-tools/schema'
import { DateTimeResolver, BigIntMock } from 'graphql-scalars'
import { Context } from './context'
import BigInt from 'graphql-bigint'
import services from './services'

const typeDefs = `
type Unit {
  id: bigInt
  unit_name: String
  reservation: [Reservation!]!
  lock: [Lock!]!
}
type Reservation {
  id: bigInt!
  unit_id: Unit!
  guest_name: String
  check_in: DateTime
  check_out: DateTime
  is_cancelled: Boolean
  access_code:  [AccessCode!]!
}
type Lock {
  id: bigInt!
  unit_id: Unit!
  remote_lock_id: String!
  access_code: [AccessCode!]!
}
type AccessCode {
  id: bigInt!
  lock_id: Lock!
  reservation_id: Reservation
  passcode: String
  remote_passcode_id: String
}

type Query {
  getUnit: Unit!
  getReservation(unit_id: Int!): [Reservation!]!
}
type Mutation {
  createReservation(unitID: Int!, guestName: String!, checkIn: DateTime!, checkOut: DateTime!): Reservation!
  createUnit(unitName: String!, reservation: [ReservationCreateInput]): Unit!
  updateReservation(reservationID: Int!, unitID: Int!, guestName: String!, checkIn: DateTime!, checkOut: DateTime!):Reservation!
  cancelReservation(reservationID: Int!, unitID: Int!, guestName: String!, checkIn: DateTime!, checkOut: DateTime!):Boolean
}
input ReservationCreateInput {
  unit_id: bigInt
  guest_name: String,
  check_in: DateTime,
  check_out: DateTime
}
scalar DateTime
scalar bigInt
`

const resolvers = {
  bigInt: BigInt,
  Query: {
    getUnit: (_parent: any, _args: any, context: Context) => {
      return context.prisma.unit.findUnique({
        where: {
          id: 2,
        },
      });
    },
    getReservation: (_parent: any, args: { unit_id: number }, context: Context) => {
      return context.prisma.reservation.findMany({
        where: {
          unit_id: args.unit_id,
        },
      });
    }
  },

  DateTime: DateTimeResolver,
  Mutation: {
    createReservation: async (
      _parent: any,
      args: { unitID: number, guestName: string, checkIn: Date, checkOut: Date },
      context: Context,
    ) => {
      const reservation = await context.prisma.reservation.create({
        data: {
          unit: {
            connect: {
              id: args.unitID,
            }
          },
          guest_name: args.guestName,
          check_in: args.checkIn,
          check_out: args.checkOut
        },
      })
      const lock = await services.getUnitLockIfExist(args.unitID)
      if (lock) {
        console.log("found lock and updating it's passcode")
        services.updateLockData(reservation, lock, context)
      }
      return reservation
    },
    updateReservation: async (
      _parent: any,
      args: { reservationID: number, unitID: number, guestName: string, checkIn: Date, checkOut: Date },
      context: Context,
    ) => {
      const reservation = await context.prisma.reservation.update({
        where: {
          id: args.reservationID
        },
        data: {
          unit: {
            connect: {
              id: args.unitID,
            }
          },
          guest_name: args.guestName,
          check_in: args.checkIn,
          check_out: args.checkOut
        },
      })
      const lock = await services.getUnitLockIfExist(args.unitID)
      if (lock) {
        services.updateLockData(reservation, lock, context)
      }
      return reservation
    },
    cancelReservation: async (
      _parent: any,
      args: { reservationID: number, unitID: number, guestName: string, checkIn: Date, checkOut: Date },
      context: Context,
    ) => {
      const reservation = await context.prisma.reservation.update({
        where: {
          id: args.reservationID
        },
        data: {
          is_cancelled: true
        },
      })
      const lock = await services.getUnitLockIfExist(args.unitID)
      if (lock) {
        services.deletePassCodeIfExist(lock)
      }
      return true
    },
  }
}

interface ReservationCreateInput {
  unit_id: number
  guest_name: string,
  check_in: Date,
  check_out: Date
}

interface UnitCreateInput {
  unit_name: string
  reservation?: ReservationCreateInput[],
}

export const schema = makeExecutableSchema({
  resolvers,
  typeDefs,
})

