export const basicUserInfo = JSON.stringify({
    query: `{
      user {
        id
        login
        campus
        firstName
        lastName
        email
      }
    }`,
});