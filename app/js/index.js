var firebaseConfig = {
    apiKey: "AIzaSyBNf1JpByuDebVLq_lns8fYv4Pyo3kzvoM",
    authDomain: "eonsound.firebaseapp.com",
    databaseURL: "https://eonsound.firebaseio.com",
    projectId: "eonsound",
    storageBucket: "eonsound.appspot.com",
    messagingSenderId: "824179683788",
    appId: "1:824179683788:web:81830e10e40b4b887ded69"
  };

firebase.initializeApp(firebaseConfig);

firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
      // User is signed in / signed up.

      console.log('Authenticating via Spotify');
      window.location.replace('https://accounts.spotify.com/authorize?client_id=b2b0e41d0a3e4464b12eba666a1de36d&response_type=code&redirect_uri=http://localhost:6968/auth.html')
      // ...
    } else {
    }
  })

function switchLogup(el) {

    $(el).attr('onclick', 'switchLogin(this)')
    $(el).html('Login')
    $('#signtitle').html('Create an account')
    $('#submitbtn').attr('onclick', 'signup()')

}

function switchLogin(el) {

    $(el).attr('onclick', 'switchLogup(this)')
    $(el).html('Create an Account')
    $('#signtitle').html('Sign In')
    $('#submitbtn').attr('onclick', 'login()')

}

function login() {
 
    email = $('#emailbox').val()
    pass = $('#passbox').val()

    firebase.auth().signInWithEmailAndPassword(email, pass).catch(function(error) {
        alert(error.message + '\n\n' + '>: ' + error.code)
    });

}

function signup() {

    email = $('#emailbox').val()
    pass = $('#passbox').val()

    firebase.auth().createUserWithEmailAndPassword(email, pass).catch(function(error) {
        alert(error.message + '\n\n' + '>: ' + error.code)
    });

}