window.addEventListener("load", function() {
    var app = {
        video: {
            element: document.querySelector('video'),
            onPlayInterval: 0,
            time : 0,
            duration: 0,
            play: function(){
                if(app.playlist.list.length > 0){
                    app.video.removeOverlay();
                    if(app.playlist.list[0].poster !== null && app.playlist.list[0].poster !== ''){
                        app.video.element.setAttribute('poster', app.playlist.list[0].poster);
                    } else {
                        app.video.element.setAttribute('poster', 'img/listen.png');
                    }

                    if(app.video.element.getAttribute("src") === "null"){
                        app.video.load(app.playlist.list[0].src);
                        app.video.play();
                    } else {
                        if(app.video.time === app.video.duration){
                            app.video.element.currentTime = 0;
                        }
                        app.video.element.play();
                        app.video.onPlayInterval = setInterval(app.video.onplay, 25);
                    }
                }
            },
            pause: function(){
                if(!app.video.paused && app.playlist.list.length > 0){
                    app.video.addOverlay('img/pause.png');

                    app.video.element.pause();
                    clearInterval(app.video.onPlayInterval);
                }
            },
            stop: function(){
                app.video.element.pause();
                app.video.element.src = "";
                app.video.element.setAttribute('poster', '');
                app.video.element.load();

                app.video.addOverlay('img/stop.png');
				
				app.progress.value = 0;
				app.progress.update();

                // Suppresion de l'interval onplay
                clearInterval(app.video.onPlayInterval);
            },
            load: function(src){
                app.video.element.src = src;
                app.video.element.load();

                app.video.time = 0;
                app.video.element.addEventListener('loadedmetadata', function() {
                    app.video.duration = app.video.element.duration;
                });
            },
            setVolume: function(){
                app.video.element.volume = this.value/100;
            },
            fullscreen: function() {
                if (app.video.element.mozRequestFullScreen) {
                    app.video.element.mozRequestFullScreen();
                } else if (app.video.element.webkitRequestFullScreen) {
                    app.video.element.webkitRequestFullScreen();
                }
            },
            addOverlay: function(name){
                var overlay = document.querySelector('#overlay');
                overlay.firstElementChild.setAttribute('src', name);
                overlay.classList.remove('hidden');
            },
            removeOverlay : function(){
                var overlay = document.querySelector('#overlay');
                overlay.firstElementChild.setAttribute('src', '');
                overlay.classList.add('hidden');
            },
            onplay: function(){
                app.video.time = app.video.element.currentTime;
                app.progress.value = Math.floor(app.video.time / app.video.duration*100);
                app.progress.update();

                if(app.progress.value === 100){
                    app.video.pause();
                    app.playlist.next();
                }
            },
            loadEvents : function(){
                app.controls.play.addEventListener("click", app.video.play);
                app.controls.pause.addEventListener("click", app.video.pause);
                app.controls.stop.addEventListener("click", app.video.stop);
                app.controls.next.addEventListener("click", app.playlist.next);
                app.controls.fullscreen.addEventListener("click", app.video.fullscreen);

                app.progress.element.addEventListener("click", app.progress.click);
                app.progress.element.addEventListener("mousemove", app.progress.hover);

                ['#video'].forEach(function (selector) {
                    document.querySelector(selector).addEventListener('mouseover', function() {
                        app.controls.volume.style.display = 'block';
                        document.querySelector('#volume-container').classList.remove('hidden');
                    });
                    document.querySelector(selector).addEventListener('mouseleave', function() {
                        app.controls.volume.style.display = 'none';
                        document.querySelector('#volume-container').classList.add('hidden');
                    });
                });

                app.controls.volume.addEventListener('change', app.video.setVolume);
            }
        },
        controls: {
            next: document.querySelector("#next"),
            play: document.querySelector("#play"),
            pause: document.querySelector("#pause"),
            stop: document.querySelector("#stop"),
            fullscreen: document.querySelector("#fullscreen"),
            volume: document.querySelector("#volume")
        },
        progress: {
            element: document.querySelector("#progress"),
            value: 0,
            update : function(){
                this.element.firstElementChild.style.width = this.value + "%";
                this.element.firstElementChild.innerText = this.value + "%";
            },
            click : function(e){
                if(app.playlist.list.length > 0) {
                    var time = ((e.offsetX / app.progress.element.clientWidth).toFixed(2) * app.video.duration).toFixed(0);

                    app.video.time = time;
                    app.video.element.currentTime = time;

                    app.progress.value = (e.offsetX / app.progress.element.clientWidth * 100).toFixed(0);
                    app.progress.update();
                }
            },
            hover : function(e){
                if(app.playlist.list.length > 0){
                    if(app.progress.element.lastElementChild.tagName !== 'DIV'){
                        app.progress.element.removeChild(app.progress.element.lastElementChild);
                    }

                    var time = ((e.offsetX/e.target.clientWidth).toFixed(2) * app.video.duration).toFixed(0);

                    var span = document.createElement('span');
                    span.classList = 'tooltiptext';
                    span.innerText = time;
                    app.progress.element.appendChild(span);
                }
            }
        },
        playlist: {
            element: document.querySelector('#playlist'),
            list: [],
            state: -1,
            count: 0,
            load: function(url){
                if(url.indexOf('xml') !== -1){
                    app.ajax.getRss(url, function(res) {
                        var feed = JSON.parse(res);
                        var poster = feed.feed.image;
                        feed.items.forEach(function (item) {
                            console.log(poster);
                            app.playlist.addRss(item, poster);
                        });
                    });
                } else {
                    app.playlist.addVideo(url, 'nouvelle vidéo');
                }

                //On update le local storage
                app.playlist.save();
            },
            addRss : function(item, poster) {
                var id = app.playlist.count++;

                app.playlist.list.push({
                    id: id,
                    src: item.guid,
                    poster: poster,
                    type: 'rss',
                    title: item.title
                });

                var li = document.createElement('li');
                li.classList.add('video');
                li.setAttribute('data-target', id+'');
                li.addEventListener('contextmenu', function(e) {
                    var id = this.getAttribute('data-target');
                    if(app.playlist.search(id) === app.playlist.list[0] && app.playlist.list.length-1 > 0){
                        app.playlist.next();
                    } else {
                        app.playlist.remove(id);
                    }
                    e.preventDefault();
                });

                var img = document.createElement('img');
                img.setAttribute('src', 'img/rss.png');

                var title = document.createElement('span');
                title.innerText = item.title.substr(0, 50);

                li.appendChild(img);
                li.appendChild(title);

                app.playlist.element.appendChild(li);
            },
            addVideo : function(src, title) {
                var id = app.playlist.count++;
                app.playlist.list.push({
                    id: id,
                    src: src,
                    type: 'video',
                    title: title
                });

                var li = document.createElement('li');
                li.classList.add('video');
                li.setAttribute('data-target', id+'');
                li.addEventListener('contextmenu', function(e) {
                    var id = this.getAttribute('data-target');
                    if(app.playlist.search(id) === app.playlist.list[0] && app.playlist.list.length-1 > 0){
                        app.playlist.next();
                    } else {
                        app.playlist.remove(id);
                    }
                    e.preventDefault();
                });

                var img = document.createElement('img');
                img.setAttribute('src', 'img/mp4.png');

                var span = document.createElement('span');
                span.innerText = title;

                li.appendChild(img);
                li.appendChild(span);

                app.playlist.element.appendChild(li);
            },
            search : function(id){
                for(var i = 0; i < app.playlist.list.length; i++){
                    if(app.playlist.list[i].id === parseInt(id)){
                        return app.playlist.list[i];
                    }
                }
            },
            remove : function(id) {
                var element = app.playlist.search(id);
                app.playlist.list.splice(app.playlist.list.indexOf(element), 1);

                var video = document.querySelector('li.video[data-target="'+id+'"]');
                video.parentElement.removeChild(video);

                //On update le local storage
                app.playlist.save();
            },
            next : function(){
                if(app.playlist.list.length > 0) {
                    app.playlist.remove(app.playlist.list[0].id);

                    app.video.load(app.playlist.list[0].src);

                    app.video.play();
                } else {
                    app.video.stop();
                }
            },
            save : function () {
                setTimeout(function () {
                    if (typeof(Storage) !== "undefined") {
                        localStorage.setItem('playlist', JSON.stringify(app.playlist.list));
                    }
                }, 1000);
            },
            init : function () {
                if(localStorage.getItem('playlist') !== null) {
                    app.playlist.list = JSON.parse(localStorage.getItem('playlist'));

                    app.playlist.list.forEach(function (link) {
                        var li = document.createElement('li');
                        li.classList.add('video');
                        li.setAttribute('data-target', link.id+'');
                        li.setAttribute('draggable', 'true');
                        li.addEventListener('contextmenu', function(e) {
                            var id = this.getAttribute('data-target');
                            if(app.playlist.search(id) === app.playlist.list[0]){
                                app.playlist.next();
                            } else {
                                app.playlist.remove(id);
                            }
                            e.preventDefault();
                        });

                        var img = document.createElement('img');
                        if(link.type === 'rss') {
                            img.setAttribute('src', 'img/rss.png');
                        } else if (link.type === 'video'){
                            img.setAttribute('src', 'img/mp4.png');
                        }

                        var span = document.createElement('span');
                        span.innerText = link.title.substr(0, 50);

                        li.appendChild(img);
                        li.appendChild(span);

                        app.playlist.element.appendChild(li);
                    });
                }
            },
            switch : function (first, second) {
                // On récupère les deux élements
                var firstElement = app.playlist.search(first);
                var secondElement = app.playlist.search(second);

                // On récupère leurs index respectifs
                var firstOffset = app.playlist.list.indexOf(firstElement);
                var secondOffset = app.playlist.list.indexOf(secondElement);

                // On switch
                app.playlist.list[firstOffset] = secondElement;
                app.playlist.list[secondOffset] = firstElement;
            },
            dragAndDrop : function () {
                function handleDragStart(e) {
                    this.classList.add('dragging');

                    dragSrcEl = this;

                    e.dataTransfer.effectAllowed = 'move';
                    e.dataTransfer.setData('text/html', this.innerHTML);
                }

                function handleDragEnter(e) {
                    this.classList.add('dragover');
                }

                function handleDragOver(e) {
                    if (e.preventDefault) { e.preventDefault(); }

                    e.dataTransfer.dropEffect = 'move';
                    return false;
                }

                function handleDragLeave(e) {
                    this.classList.remove('dragover');
                }

                function handleDrop(e) {
                    if (e.stopPropagation) {
                        e.stopPropagation();
                    }

                    if (dragSrcEl !== this) {
                        dragSrcEl.innerHTML = this.innerHTML;
                        this.innerHTML = e.dataTransfer.getData('text/html');
                        app.playlist.switch(dragSrcEl.getAttribute('data-target'), this.getAttribute('data-target'));
                    }
                    return false;
                }

                function handleDragEnd(e) {
                    [].forEach.call(cols, function (col) {
                        col.classList.remove('dragover');
                        col.classList.remove('dragging');
                    });
                }

                var cols = document.querySelectorAll('ul > li.video');

                [].forEach.call(cols, function(col) {
                    col.addEventListener('dragstart', handleDragStart,  false);
                    col.addEventListener('dragenter', handleDragEnter,  false);
                    col.addEventListener('dragover',  handleDragOver,   false);
                    col.addEventListener('dragleave', handleDragLeave,  false);
                    col.addEventListener('drop',      handleDrop,       false);
                    col.addEventListener('dragend',   handleDragEnd,    false);
                });

                var dragSrcEl = null;
            }
        },
        modal: {
            element: document.querySelector('#modal'),
            show: function() {
                app.modal.element.style.display = "block";
                document.querySelector('#link').focus();
            },
            hide : function() {
                app.modal.element.style.display = "none";
                document.querySelector("#link").value = '';
            },
            valid : function() {
                var url = document.querySelector("#link").value;

                if(app.modal.isURL(url)){
                    app.playlist.load(url);
                }

                app.modal.hide();
            },
            isURL : function (url) {
                var pattern = new RegExp('^(https?:\\/\\/)?'+ // protocol
                    '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.?)+[a-z]{2,}|'+ // domain name
                    '((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
                    '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // port and path
                    '(\\?[;&a-z\\d%_.~+=-]*)?'+ // query string
                    '(\\#[-a-z\\d_]*)?$','i'); // fragment locator
                return pattern.test(url);
            },
            loadEvents : function(){
                document.querySelector('#modal').addEventListener("click", function(event) {
                    if(event.target.id === 'modal'){
                        app.modal.hide();
                    }
                });

                document.querySelector('#toogleModal').addEventListener("click", app.modal.show);
                document.querySelector("#modal button").addEventListener("click", app.modal.valid);
                document.querySelector('#modal input').addEventListener("keypress", function(e) {
                    if(e.keyCode === 13){
                        app.modal.valid();
                    }
                })
            }
        },
        ajax: {
            getRss: function(url, callback){
                var rssUrl = 'https://api.rss2json.com/v1/api.json?rss_url=' + encodeURIComponent(url);

                var req = new XMLHttpRequest();
                req.open("GET", rssUrl);
                req.onload = function() {
                    if (req.status === 200) {
                        callback(req.responseText);
                    } else {
                        console.log(req.status);
                    }
                };
                req.send();
            }
        }
    };


    app.video.loadEvents();
    app.modal.loadEvents();

    app.playlist.init();
    app.playlist.dragAndDrop();


});