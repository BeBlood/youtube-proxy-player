window.addEventListener("load", function() {

    class App {
        constructor() {
            this.YoutubePlayer = new YoutubePlayer('player');
            this.SearchBar = new SearchBar('.searchVideo');
            this.SearchList = new SearchList('#results');
        }
        reloadList(results) {
            this.SearchList.updateData(results);
            this.SearchList.reload();
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
                    autoplay: 0,
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
        constructor(selector) {
            this.container = document.querySelector(selector);
            this.button = this.container.querySelector('i');
            this.input = this.container.querySelector('input');

            this.loadEvents();
        }
        loadEvents() {
            var self = this;

            this.button.addEventListener('click', function (event) {
                self.search(self.input.value);
            });

            this.input.addEventListener('keypress', function (event) {
                if (event.key === 'Enter') {
                    self.search(self.input.value);
                }
            });
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
                app.reloadList(JSON.parse(results));
            });
        }
    }

    class SearchList {
        constructor(id) {
            this.element = document.querySelector(id);
            this.clearAll();
        }
        append(videoData) {

        }
        reload() {
            var self = this;
            this.clearElement();

            Template.load({
                'name': 'video'
            }, function (result) {
                self.data.items.forEach(function (video) {
                    var parsedResult = Template.update(result, {
                        'videoId': video.id.videoId,
                        'titre': video.snippet.title,
                        'imageSrc': video.snippet.thumbnails.medium.url,
                        'channel': video.snippet.channelTitle,
                        'date': video.snippet.publishedAt
                    });

                    console.log(parsedResult);
                })
            });
        }
        clearAll() {
            this.clearData();
            this.clearElement();
        }
        clearData() {
            this.data = {};

        }
        clearElement() {
            while (this.element.firstChild) {
                this.element.removeChild(this.element.firstChild);
            }
        }
        updateData(data) {
            this.data = data;
        }
    }

    app = new App();
});
