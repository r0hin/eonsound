sessionStorage.setItem('menuOpen', 'false')
contextMenuListener()

function efilter(filtered) {
    filtered = filtered.replace(/</g, '')
    filtered = filtered.replace(/>/g, '')
    filtered = filtered.replace(/"/g, '')
    filtered = filtered.replace(/'/g, '')
    filtered = filtered.replace(/`/g, '')
    
    return filtered
}

function getPosition(e) {
    var posx = 0;
    var posy = 0;
  
    if (!e) var e = window.event;
  
    if (e.pageX || e.pageY) {
      posx = e.pageX;
      posy = e.pageY;
    } else if (e.clientX || e.clientY) {
      posx = e.clientX + document.body.scrollLeft + 
                         document.documentElement.scrollLeft;
      posy = e.clientY + document.body.scrollTop + 
                         document.documentElement.scrollTop;
    }
  
    return {
      x: posx,
      y: posy
    }
  }

function clickInsideElement( e, className ) {
    var el = e.srcElement || e.target;
  
    if ( el.classList.contains(className) ) {
      return el;
    } else {
      while ( el = el.parentNode ) {
        if ( el.classList && el.classList.contains(className) ) {
          return el;
        }
      }
    }
  
    return false;
  }

async function contextMenuListener() {
    document.addEventListener( "contextmenu", (e) => {
        el = clickInsideElement( e, 'track' )
        if (el) {
            sessionStorage.setItem('menuOpen', 'true')
            e.preventDefault();
            menuPosition = getPosition(e);
            menuPositionX = menuPosition.x + "px";
            menuPositionY = menuPosition.y + "px";
    
            menu = document.getElementById('track_context')
            menu.classList.add("context_active");
            menu.style.left = menuPositionX;
            menu.style.top = menuPositionY;

            $('#context-bg').removeClass('hidden')
            window.setTimeout(() => {
                $('#context-bg').addClass('context-bg-active')
            }, 100)

            id = el.getAttribute('track_details').split('//==//').shift()
            url = el.getAttribute('track_details').split('//==//').pop()

            document.getElementById('playbtn').onclick = () => {
                window.musicQueue = []
                window.musicHistory = []
                window.musicActive = {'none': 'none'}
                play(url, id)
            }
            document.getElementById('queuebtn').onclick = () => {
                play(url, id)
            }
                document.getElementById('addbtn').onclick = async () => {

                // Get track details
                const result = await fetch(`https://api.spotify.com/v1/tracks/${id}`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${spotifyCode}`
                    },
                })
        
                const data = await result.json()
        
                if (data.error) {
                    if (sessionStorage.getItem('errorAvoid') == 'true') {
                        // Don't start a loop of errors wasting code use.
                        Snackbar.show({text: "An error occured while loading library options."})
                        return
                    }
        
                    console.log('Error occured. Likely invalid code - request and do it again.');
                    sessionStorage.setItem('errorAvoid', 'true')
                
                    refreshCode()
                    document.getElementById('addbtn').click()
                    return;
                }

                refreshCode()
                sessionStorage.setItem('errorAvoid', 'false')

                snippet_track_artists = ''
                for (let i = 0; i < data.artists.length; i++) {
                    snippet_track_artists += `${data.artists[i].name}, `   
                }

                window.prepare_library_changes = {
                    id: id,
                    url: url,
                    art: data.album.images[0].url,
                    artists: snippet_track_artists,
                    name: data.name,
                    length: data.duration_ms,
                }
                
                toggleBottomSheet('librarySheet')
            }

            // el is element of track. Could add details to the element
        }
        
        else {
            toggleMenuOff();
        }

    });
}

function toggleMenuOff() {
    console.log('Menu off');
    sessionStorage.setItem('menuOpen', 'false')
    $('#context-bg').removeClass('context-bg-active')
    window.setTimeout(() => {
        $('#context-bg').addClass('hidden')
    }, 300)
    document.getElementById('track_context').classList.remove("context_active");
}

document.addEventListener( "click", function(e) {
    if (sessionStorage.getItem('menuOpen') == 'true') {
      toggleMenuOff();
    }
});