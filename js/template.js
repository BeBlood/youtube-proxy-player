class Template {
    constructor() {

    }
    update(templateText, parameters) {
        var keys = Object.keys(parameters);
        var values = Object.values(parameters);

        for (var i = 0; i < values.length; i++) {
            templateText = templateText.replace(new RegExp(`{{ ${keys[i]} }}`, 'g'), values[i]);
        }

        return templateText;
    }
    load(template, callback) {
        Ajax.get({
            url: './partials/' + template.name + '.html.template'
        }, function (result) {
            if (template.parameters === undefined || template.parameters === null) {
                callback(result);
                return;
            }

            callback(this.update(result, template.parameters));
            return;
        });
    }
    toElement(templateText) {
        var div = document.createElement('div');
        div.innerHTML = templateText.trim();
        return div.firstChild;
    }
}

Template = new Template();
