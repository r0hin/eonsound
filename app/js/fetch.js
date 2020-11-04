// fetch.js 
// Code readability functions for fetching spotify data.

async function goFetch(url) {
  return new Promise(async (resolve, reject) => {

    const result = await fetch(`https://api.spotify.com/v1/${url}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${spotifyCode}`,
      },
    });

    const data = await result.json();

    if (data.error) {
      refreshCode()

      const result = await fetch(`${url}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${spotifyCode}`,
        },
      });
  
      const data = await result.json();
      
      if (data.error) {
        Snackbar.show({text: "Error occured. Please try again later."})
        refreshCode()
        reject(data)
        return;
      }

      refreshCode()
      resolve(data)
      return data
    }

    refreshCode()
    resolve(data)
    return data

  })  
}

async function refreshCode() {
  const result = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization:
        "Basic YjJiMGU0MWQwYTNlNDQ2NGIxMmViYTY2NmExZGUzNmQ6Y2MwMWM3OTExYjRjNDE2ODliOTcxMDM0ZmY5NzM1ODc=",
    },
    body: `grant_type=refresh_token&refresh_token=${spotifyToken}`,
  });

  const data = await result.json();
  window.spotifyCode = data.access_token;
}