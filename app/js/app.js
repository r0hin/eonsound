var firebaseConfig = { apiKey: "AIzaSyBNf1JpByuDebVLq_lns8fYv4Pyo3kzvoM", authDomain: "eonsound.firebaseapp.com", databaseURL: "https://eonsound.firebaseio.com", projectId: "eonsound", storageBucket: "eonsound.appspot.com", messagingSenderId: "824179683788", appId: "1:824179683788:web:81830e10e40b4b887ded69" };
firebase.initializeApp(firebaseConfig);
window.db = firebase.firestore()

firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
      // User is signed in.

      window.user = user

      if (!user.emailVerified) {
            $('#unverified').removeClass('hidden')
            return;
      }

      appContent()

    } else {
        window.location.replace('welcome.html')
    }
})

function sendVerification(el) {
    user.sendEmailVerification().then(function() {

        $(el).addClass('hidden')
        $('#sentEmail').removeClass("hidden")

        // Email sent.
    }).catch(function(error) {
        alert(error)
    });
}

async function appContent() {

    initSpotifyCode()

    doc = await db.collection('app').doc('details').get()
    window.cachedetails = doc.data()

    doc = await db.collection('users').doc(user.uid).get()
    if (!doc.exists) {
        $('#finish_profile').removeClass("hidden")
        return;
    }

    window.cacheuser = doc.data()

    $('#pfpimg1').get(0).src = cacheuser.url
    $('#pfpimg2').get(0).src = cacheuser.url
    $('#pfpimg1').removeClass('hidden')
    // Show toolbar now to ensure things remain smooth.
    $('#toolbar').removeClass('hidden')

    $('#name1').html(`${cacheuser.name}<span id="username1" class="chip">${cacheuser.username}</span>`)



}

async function createUser() {
    // Much to dangerous processes to create user locally. Refer to cloud function.

    // Duplicate formatting as to not take long for returning errors.

    if(/\s/g.test($('#usernamebox').val().toLowerCase())) {
        $('#createAccFeedback').removeClass('hidden')
        $('#createAccFeedback').html('Your username contains whitespace.')
        return;
    }

    if (cachedetails.usernames.includes($('#usernamebox').val())) {
        $('#createAccFeedback').removeClass('hidden')
        $('#createAccFeedback').html('That username is taken!')
        return;
    }

    toggleloader()

    name = $('#namebox').val()
    username = $('#usernamebox').val().toLowerCase()

    await user.updateProfile({
        displayName: name,
    })

    var createAccount = firebase.functions().httpsCallable('createAccount');
    createAccount({username: username, displayname: name}).then((result) => {
        if (result.data) {
            toggleloader()
            showcomplete()
            window.setTimeout(() => {
                appContent()

                $('#finish_profile').removeClass('fadeIn')
                $('#finish_profile').addClass('fadeOut')
                window.setTimeout(() => {
                    $('#finish_profile').addClass('hidden')
                }, 800)

            }, 1200)
        }
        else {
            alert('Error occured.')
            window.location.replace('404.html')
        }
    })
}

async function initSpotifyCode() {
    // Check if access token stored in database is valid

    doc = await db.collection('users').doc(user.uid).collection('access').doc('spotify').get()

    if (!doc.exists) {
        window.location.replace('auth.html')
    }

    // data.access is the refresh token, so exchange it for an actual token
    token = doc.data().access
    window.spotifyToken = token

    // Exchange refresh token for a new token
    const result = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': 'Basic YjJiMGU0MWQwYTNlNDQ2NGIxMmViYTY2NmExZGUzNmQ6Y2MwMWM3OTExYjRjNDE2ODliOTcxMDM0ZmY5NzM1ODc='
        },
        body: `grant_type=refresh_token&refresh_token=${token}`
    })

    const data = await result.json()
    window.spotifyCode = data.access_token
}

async function refreshCode() {
    const result = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': 'Basic YjJiMGU0MWQwYTNlNDQ2NGIxMmViYTY2NmExZGUzNmQ6Y2MwMWM3OTExYjRjNDE2ODliOTcxMDM0ZmY5NzM1ODc='
        },
        body: `grant_type=refresh_token&refresh_token=${spotifyToken}`
    })

    const data = await result.json()
    window.spotifyCode = data.access_token
}

function logout() {
    Snackbar.show({text: "Logging out..."})
    window.setTimeout(() => {
        firebase.auth().signOut().then(function() {
            // Sign-out successful.
        })
    }, 1500)
}