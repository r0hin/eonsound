// fetch.js 
// Code readability functions for fetching spotify fetchData.
var spotifyCode: any;
declare var Snackbar: any;
var spotifyToken: any;

async function goFetch(url: string) : Promise<object> {
  return new Promise(async (resolve, reject) => {

    var fetchResult = await fetch(`https://api.spotify.com/v1/${url}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${spotifyCode}`,
      },
    });

    var fetchData = await fetchResult.json();

    if (fetchData.error) {
      console.log(fetchData.error);
      refreshCode()

      var result = await fetch(`https://api.spotify.com/v1/${url}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${spotifyCode}`,
        },
      });
  
      fetchData = await result.json();

      if (fetchData.error) {
        Snackbar.show({pos: 'top-center',text: "Error occured. Please try again later."})
        refreshCode()
        reject(fetchData)
        return;
      }

      refreshCode()
      resolve(fetchData)
      return fetchData
    }

    refreshCode()
    resolve(fetchData)
    return fetchData

  })  
}

async function refreshCode() {
  var result = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization:
        "Basic YjJiMGU0MWQwYTNlNDQ2NGIxMmViYTY2NmExZGUzNmQ6Y2MwMWM3OTExYjRjNDE2ODliOTcxMDM0ZmY5NzM1ODc=",
    },
    body: `grant_type=refresh_token&refresh_token=${spotifyToken}`,
  });

  var fetchData = await result.json();
  var spotifyCode = fetchData.access_token;
}