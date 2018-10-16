class Ajax {
    constructor() {

    }
    get(query, callback) {
        var xhr = new XMLHttpRequest();

        xhr.onreadystatechange = function() {
            if (this.readyState === XMLHttpRequest.DONE) {
                if (this.status === 200) {
                    callback(this.response);
                } else {
                    throw new Error('Request: bad status code: ' + this.status);
                }
            }
        };

        xhr.open('GET', this.buildUrl(query));
        xhr.send();
    }
    buildUrl(query) {
        if (query.parameters === undefined || query.parameters === null) {
            return query.url;
        }

        var url = query.url + '?';
        var queryParameters = Object.values(query.parameters);
        var parameterNames = Object.keys(query.parameters);

        for (var i = 0; i < queryParameters.length; i++) {
            url += parameterNames[i] + '=' + queryParameters[i];
            if (i !== parameterNames.length - 1) {
                url += '&';
            }
        }
        return url
    }
}

Ajax = new Ajax();
