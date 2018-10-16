window.addEventListener("load", function() {

    class App {
        constructor() {
            this.youtubePlayer = new YoutubePlayer('player');
            this.SearchBar = new SearchBar();
        }
    }

    class YoutubePlayer {
        constructor(id) {
            this.player = new YT.Player(id, {
                height: '360',
                width: '640',
                videoId: 'M7lc1UVf-VE',
                events: {
                    'onReady': this.onPlayerReady,
                    'onStateChange': this.onPlayerStateChange
                },
                playerVars: {
                    autoplay: 1,
                    modestbranding: 1,
                    rel: 0
                }
            });
        }
        onReady() {
            console.log('ready');
        }
        onPlayerStateChange() {
            console.log('state change');
        }
    }

    class ProgressBar {
        constructor() {

        }
    }

    class SearchBar {
        constructor() {

        }
        search(query) {
            Ajax.get({
                url: 'https://www.googleapis.com/youtube/v3/search',
                parameters: {
                    'maxResults': '25',
                    'part': 'snippet',
                    'q': query,
                    'type': '',
                    'key': 'AIzaSyB5a5cSSfgexSJEZAosLPCrxpIj-oRXaa4'
                }
            }, function (results) {
                console.log(results);
            });
        }
    }

    class SearchList {
        constructor() {

        }
    }

    app = new App();
    app.SearchBar.search('test');
});
