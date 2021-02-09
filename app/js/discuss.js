window.musicData = {}

document.getElementById('discussionsearchbox').addEventListener("keyup", function(event) {
  if (event.keyCode === 13) { event.preventDefault(); searchDiscussion(document.getElementById('discussionsearchbox').value)}
});


function setDefaultVolume() {
  var vol = localStorage.getItem('defaultVolume')
  if (!vol || vol == '100') {
    player.decreaseVolume(1)
    player.increaseVolume(1)
    $('#defaultvolumetext').html('Default Volume: 100%')
    return;
  }

  $('#defaultvolumetext').html('Default Volume: ' + vol + '%')

  var vol = parseFloat(`0.${vol}`)

  player.decreaseVolume(1)
  player.increaseVolume(vol)
}

function initDiscussions() {
  initSpotifyCode();
  setDefaultVolume();
  // Get trending searches
}

async function searchDiscussion(q) {
  console.log('Search for discussions of ID', q)
  document.getElementById('discussionsearchbox').value = '';
  $("#theSearchResults").empty();

  var searchData = await goFetch(`search?q=${q}&type=track&limit=5`)
  if (searchData.tracks.items.length === 0) {
    $("#theSearchResults").html('No tracks found for: ' + q)
  }
  for (let i = 0; i < searchData.tracks.items.length; i++) {
    // Build search element.
    element = searchData.tracks.items[i]

    a = document.createElement('div')
    a.setAttribute('class', 'track')
    a.setAttribute('onclick', `musicActive.none = 'none'; queueSongWithoutData('${element.id}')`)

    a.innerHTML = `
      <img src="${element.album.images[0].url}"></img>
      <h3>${element.name}</h3>
      <p>${artistToString(element.artists)}</p>
    `
    
    $('#theSearchResults').get(0).appendChild(a)
  }

  $('#theSearchResults').removeClass('hidden');
  $('#trending_searches').addClass('hidden');
}

function closeSearch() {
  $('#trending_searches').removeClass('hidden')
  $('#theSearchResults').addClass('hidden');
}

function confirmSongPlayed() {
  window.setTimeout(()=>{textWidth=$("#playing_track_details").width(),songActionWidth=textWidth+0+0,contentWidth=songActionWidth+68+24,playerWidth="calc(100% - "+contentWidth+"px)",$("#InjectedWidth").get(0).innerHTML=`\n      .songactions {\n        left: ${songActionWidth}px !important;\n        transition: all 1s !important;\n      }\n    \n      #player .plyr {\n        width: ${playerWidth} !important;\n        transition: all 1s !important;\n      }\n      `},1550);
}

function openDiscussion(id) {
  window.setTimeout(()=>{textWidth=$("#playing_track_details").width(),songActionWidth=textWidth+0+0,contentWidth=songActionWidth+68+24,playerWidth="calc(100% - "+contentWidth+"px)",$("#InjectedWidth").get(0).innerHTML=`\n      .songactions {\n        left: ${songActionWidth}px !important;\n        transition: all 1s !important;\n      }\n    \n      #player .plyr {\n        width: ${playerWidth} !important;\n        transition: all 1s !important;\n      }\n      `},1550);
  console.log('Open discussion of ID', id)
}

function closeDiscussion() {
  console.log('Close discussion of ID')
}