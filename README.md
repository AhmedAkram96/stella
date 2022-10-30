# stella
Property management system

## Manual to use:

1. clone the repo and open the repo directory.
2. run `npm install`
3. create user `ss` in postgresql and make sure it has permissions to create db.
4. create `.env` file and fill it with secret data sent in email
5. run `npx prisma migrate dev` to create DB and seed data.
6. finally, run `npm run dev` to start the server at `http://localhost:4000/graphql`

## notes:

1. only get `access_token` and `refresh_token` apis are working from `tuya` apis, others giving permission denied.
2. to compensate this, I created some fake responses that will rpely with the needed data to complete the flow.
3. this fake flow is feature flagged with an env variable.
4. initially, seed data of `unit` with id=1 and `lock` are created.


you can use these mutations insdie graphiql and observe changes in Database and server logs:



- `mutation {
  createReservation(unitID: 1, guestName: "akram", checkIn:"2022-11-30T19:31:08.382Z", checkOut:"2022-12-01T19:31:08.382Z"){
    id,
    guest_name,
  }
}`

- `mutation {
  updateReservation(reservationID:1,
	unitID: 1,
  guestName: "akram_2"
  checkIn:"2023-01-28T19:31:08.382Z",
  checkOut: "2023-02-28T19:31:08.382Z"){
    guest_name,
  	id,
  	}
	}`
  
- `mutation {
  cancelReservation(reservationID:1,
	unitID: 1,
  guestName: "akram_2"
  checkIn:"2023-01-28T19:31:08.382Z",
  checkOut: "2023-02-28T19:31:08.382Z")
	}`
