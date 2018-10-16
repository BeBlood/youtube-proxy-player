window.addEventListener("load", function() {
    var fakeLoadingDelay = 1000;
    moment.locale('fr');

    class App {
        constructor() {
            this.YoutubePlayer = new YoutubePlayer('player');
            this.SearchBar = new SearchBar('.searchVideo');
            this.SearchVideoList = new VideoList('#results');
            this.RelatedVideoList = new VideoList('#relatedVideos');
            this.OverlayCollection = new OverlayCollection();
        }
        reloadSearchVideoList(results) {
            this.SearchVideoList.updateData(results);
            this.SearchVideoList.reload();
        }
        reloadRelatedVideoList(results) {
            this.RelatedVideoList.updateData(results);
            this.RelatedVideoList.reload();
        }
    }

    class YoutubePlayer {
        constructor(id) {
            this.player = new YT.Player(id, {
                height: '360',
                width: '640',
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
        load(videoId) {
            this.player.loadVideoById({
                'videoId': videoId
            });

            app.OverlayCollection.create('#relatedVideos');
            Ajax.get({
                url: 'https://www.googleapis.com/youtube/v3/search',
                parameters: {
                    'maxResults': '7',
                    'part': 'snippet',
                    'type': 'video',
                    'relatedToVideoId': videoId,
                    'key': 'AIzaSyB5a5cSSfgexSJEZAosLPCrxpIj-oRXaa4'
                }
            }, function (results) {
                app.reloadRelatedVideoList(JSON.parse(results));
            });
        }
        onReady() {
            console.log('ready');
        }
        onPlayerStateChange() {
            console.log('state change');
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
            app.OverlayCollection.create('.rightBloc');
            Ajax.get({
                url: 'https://www.googleapis.com/youtube/v3/search',
                parameters: {
                    'maxResults': '25',
                    'part': 'snippet',
                    'q': query,
                    'type': 'video',
                    'key': 'AIzaSyB5a5cSSfgexSJEZAosLPCrxpIj-oRXaa4'
                }
            }, function (results) {
                app.reloadSearchVideoList(JSON.parse(results));
            });
        }
    }

    class VideoList {
        constructor(selector) {
            this.element = document.querySelector(selector);
            this.clearAll();
        }
        append(element) {
            this.element.append(element);

            element.addEventListener('click', function (event) {
                app.YoutubePlayer.load(this.dataset.id);
            });
        }
        reload() {
            var self = this;
            this.clearElement();

            Template.load({
                'name': 'video'
            }, function (result) {
                setTimeout(function () { // Juste pour la classe
                    self.data.items.forEach(function (video) {
                        var parsedResult = Template.update(result, {
                            'videoId': video.id.videoId,
                            'titre': video.snippet.title.substr(0, 10) + ' ...',
                            'imageSrc': video.snippet.thumbnails.medium.url,
                            'channel': video.snippet.channelTitle,
                            'date': moment(video.snippet.publishedAt).fromNow()
                        });

                        self.append(Template.toElement(parsedResult));
                    });

                    app.OverlayCollection.destroy('.rightBloc');
                    app.OverlayCollection.destroy('#relatedVideos');
                }, fakeLoadingDelay);
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

    class OverlayCollection {
        constructor() {
            this.overlays = [];
        }
        has(selector) {
            console.log(this.overlays);
            var result = false;

            this.overlays.forEach(function (overlay) {
                if (overlay.selector === selector) {
                    result = true;
                    return;
                }
            });

            return result;
        }
        get(selector) {
            console.log(this.overlays);
            var result = undefined;

            this.overlays.forEach(function (overlay) {
                if (overlay.selector === selector) {
                    result = overlay;
                    return;
                }
            });

            return result;
        }
        create(selector) {
            console.log(this.overlays);
            if (this.has(selector)) {
                return selector;
            }

            this.overlays.push(new Overlay(selector));
        }
        destroy(selector) {
            if (!this.has(selector)) {
                return;
            }

            this.get(selector).destroy();
            this.overlays.splice(this.get(selector), 1);
            delete this.selector;
        }
    }

    class Overlay {
        constructor(selector) {
            this.selector = selector;
            var container = document.querySelector(selector);
            var position = container.getBoundingClientRect();

            this.element = document.createElement('div');
            this.element.classList.add('overlay');

            this.element.style.width =  `${position.width}px`;
            this.element.style.height = `${position.height}px`;
            this.element.style.left = `${position.x}px`;
            this.element.style.top = `${position.y}px`;

            var element = this.element;
            setTimeout(function () {
                element.style.opacity = 0.5;
            }, 10);
            container.parentNode.append(this.element);
        }
        destroy() {
            var element = this.element;
            this.element.style.opacity = 0;
            setTimeout(function () {
                element.parentNode.removeChild(element);
            }, 500);
        }
    }

    app = new App();
});
