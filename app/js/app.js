// app.js
// App related content such as user handling, account management and UI optimizations.

var firebaseConfig = {
  apiKey: "AIzaSyBNf1JpByuDebVLq_lns8fYv4Pyo3kzvoM",
  authDomain: "eonsound.firebaseapp.com",
  databaseURL: "https://eonsound.firebaseio.com",
  projectId: "eonsound",
  storageBucket: "eonsound.appspot.com",
  messagingSenderId: "824179683788",
  appId: "1:824179683788:web:81830e10e40b4b887ded69",
};

firebase.initializeApp(firebaseConfig);
window.db = firebase.firestore();

firebase.auth().onAuthStateChanged(function (user) {
  if (user) {
    // User is signed in.
		window.user = user;

    if (!user.emailVerified) {
      $("#unverified").removeClass("hidden");
      return;
    }

    appContent();

  } else {
    window.location.replace("welcome.html");
  }
});


async function sendVerification(el) {
  await user.sendEmailVerification()
  
  $(el).addClass("hidden");
  $("#sentEmail").removeClass("hidden");
}

async function appContent() {
  if (window.location.href.includes('firebaseapp')) {
    // Production version: show browse
    if (!localStorage.getItem('firstTimeOpen')) {
      localStorage.setItem('firstTimeOpen', '.')
      tabe('first')
    }
    else {
      tabe('browse')
    }
  }
  else {
    tabe('dev')
  }

  initSpotifyCode();

  doc = await db.collection("app").doc("details").get();
  window.cachedetails = doc.data();

  doc = await db.collection("users").doc(user.uid).get();
  if (!doc.exists) {
    $("#finish_profile").removeClass("hidden");
    return;
  }

  window.cacheuser = doc.data();
  loadUserPlaylists(cacheuser.playlistsPreview);
  loadLibrary()

  $("#userpfp1").get(0).src = cacheuser.url;
  $("#userpfp2").get(0).src = cacheuser.url;
  $("#usercard").imagesLoaded(function () {
    $("#usercard").removeClass("hidden");
  })
  $("#username1").html(`<b>${cacheuser.name}</b>${cacheuser.username}`);
}

async function createUser() {
  // Much to dangerous processes to create user locally. Refer to cloud function.
  // Duplicate formatting as to not take long for returning errors.

  if (/\s/g.test($("#usernamebox").val().toLowerCase())) {
    $("#createAccFeedback").removeClass("hidden");
    $("#createAccFeedback").html("Your username contains whitespace.");
    return;
  }

  if (cachedetails.usernames.includes($("#usernamebox").val().toLowerCase())) {
    $("#createAccFeedback").removeClass("hidden");
    $("#createAccFeedback").html("That username is taken!");
    return;
  }

  toggleloader();

  name = $("#namebox").val();
  username = $("#usernamebox").val().toLowerCase();

  await user.updateProfile({
    displayName: name,
  });

  var createAccount = firebase.functions().httpsCallable("createAccount");
  createAccount({ username: username, displayname: name }).then((result) => {
    if (result.data) {
      toggleloader(); showcomplete();
      window.setTimeout(() => {
        appContent();

        $("#finish_profile").removeClass("fadeIn");
        $("#finish_profile").addClass("fadeOut");
        window.setTimeout(() => {
          $("#finish_profile").addClass("hidden");
        }, 800);
      }, 1200);
    } else {
      alert("Error occured.");
      window.location.replace("404.html");
    }
  });
}

async function initSpotifyCode() {
  // Check if access token stored in database is valid

  doc = await db.collection("users").doc(user.uid).collection("access").doc("spotify").get();

  if (!doc.exists) {
    window.location.replace("auth.html");
  }

  // data.access is the refresh token, so exchange it for an actual token
  token = doc.data().access;
  window.spotifyToken = token;

  // Exchange refresh token for a new token
  try {
    const result = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: "Basic YjJiMGU0MWQwYTNlNDQ2NGIxMmViYTY2NmExZGUzNmQ6Y2MwMWM3OTExYjRjNDE2ODliOTcxMDM0ZmY5NzM1ODc=",
    },
    body: `grant_type=refresh_token&refresh_token=${token}`,
  });
  
  if (result.status >= 400 && result.status < 600) {
    throw new Error("Bad response from server");
  }

  const data = await result.json();

  window.spotifyCode = data.access_token;

  } catch (error) {
    Snackbar.show({pos: 'top-center',text: "If your password was changed, please reauthenticate <a href='auth.html'>here</a>."})
  }
}

function logout() {
  Snackbar.show({pos: 'top-center', text: "Logging out..." });
  window.setTimeout(async () => {
    await firebase.auth().signOut()
  }, 500);
}

function preparenpicchange() {
  $("#pfpghost").empty();
  h = document.createElement("input");
  h.id = "newpicel";
  h.style.display = "none";
  h.setAttribute("type", "file");
  h.setAttribute("accept", "image/*");
  document.getElementById("pfpghost").appendChild(h);
  $("#newpicel").change(function () {
    changepfp();
  });
  $("#newpicel").click();
}

async function changepfp() {
  toggleloader();
  file = document.getElementById("newpicel").files[0];
  ext = file.name.split(".").pop();

  var storageRef = firebase.storage().ref();
  var fileRef = storageRef.child(`logos/${user.uid}.${ext}`);

  await fileRef.put(file);

  window.setTimeout(() => {
    toggleloader();
    showcomplete();

    // Change existing records
    document.getElementById("userpfp1").src = "https://firebasestorage.googleapis.com/v0/b/eonsound.appspot.com/o/logos%2F" + user.uid + "." + ext + "?alt=media&" + new Date().getTime();
    document.getElementById("userpfp2").src = "https://firebasestorage.googleapis.com/v0/b/eonsound.appspot.com/o/logos%2F" + user.uid + "." + ext + "?alt=media&" + new Date().getTime();
  }, 800);

  $("#newpicel").remove();
}

function shuffled(a) {
  var j, x, i;
  for (i = a.length - 1; i > 0; i--) {
      j = Math.floor(Math.random() * (i + 1));
      x = a[i];
      a[i] = a[j];
      a[j] = x;
  }
  return a;
}

async function copyText(text) {
  return new Promise((resolve, reject) => {
    navigator.clipboard.writeText(text).then(function() {
      Snackbar.show({pos: 'top-center', text: "Copied link to clipboard."})
      resolve('Yes')
    }, function(err) {
      alert("Unable to copy to clipboard. Text is shown below: \n\n" + text)
      resolve('yes')
    });
  })
}