// social.js
// The file includes all the details associated with the social section of EonSound.
// Things like accounts, following, timelines, etc will be managed here.

document.getElementById("addFriendBox").addEventListener("keyup", function (event) {
  if (event.keyCode === 13) {
    event.preventDefault();
    addFriend($('#addFriendBox').val())
  }
});

async function loadActivity() {

}

async function addFriend(username) {
  console.log('Friending', username);
}

async function loadFriends() {
  if (!cacheuser.friends) { cacheuser.friends = [] }

  for (let i = 0; i < cacheuser.friends.length; i++) {
    // Create element
  }

  if (!cacheuser.friends.length) {
    $('#horizontal_friends_list').html('You have no friends :(')
  }

}