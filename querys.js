export const userDetails = JSON.stringify({
        query: `{
          user {
            id
            login
          }
        }`,
});

export const XP = JSON.stringify({
    query: `{
        transaction {
            type
            amount
            createdAt
            event {
                path
            }
        }
    }`
})