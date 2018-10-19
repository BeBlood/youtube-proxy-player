

const { createApp, createServer } = require('yion');

const app = createApp();
const httpServer = createServer(app);

app.link('/css', __dirname + '/css');
app.link('/img', __dirname + '/img');
app.link('/js', __dirname + '/js');
app.link('/partials', __dirname + '/partials');

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html', 'index.html', 'text/html', false);
});

httpServer.listen(8080);
console.log('Server started on port 8080');
