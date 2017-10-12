function QueryString() {
    // This function is anonymous, is executed immediately and
    // the return value is assigned to QueryString!
    var query_string = {};
    var query = window.location.search.substring(1);
    var vars = query.split("&");
    for (var i = 0; i < vars.length; i++) {
        var pair = vars[i].split("=");
        // If first entry with this name
        if (typeof query_string[pair[0]] === "undefined") {
            query_string[pair[0]] = decodeURIComponent(pair[1]);
            // If second entry with this name
        } else if (typeof query_string[pair[0]] === "string") {
            var arr = [query_string[pair[0]], decodeURIComponent(pair[1])];
            query_string[pair[0]] = arr;
            // If third or later entry with this name
        } else {
            query_string[pair[0]].push(decodeURIComponent(pair[1]));
        }
    }
    return query_string;
}

function msToTime(s) {
    var ms = s % 1000;
    s = (s - ms) / 1000;
    var secs = s % 60;
    s = (s - secs) / 60;
    var mins = s % 60;
    var hrs = (s - mins) / 60;

    return hrs + ':' + mins + ':' + secs;
}

function findWithAttr(array, attr, value) {
    for (var i = 0; i < array.length; i += 1) {
        if (array[i][attr] === value) {
            return array[i];
        }
    }
}

function findIndexWithAttr(array, attr, value) {
    for (var i = 0; i < array.length; i += 1) {
        if (array[i][attr] === value) {
            return i;
        }
    }
}

function unixToLocal(unix_utc) {
    var unix_utc_date = new Date(unix_utc * 1000);

    var newDate = new Date(unix_utc_date.getTime() + date.getTimezoneOffset() * 60 * 1000);

    var offset = date.getTimezoneOffset() / 60;
    var hours = date.getHours();

    newDate.setHours(hours - offset);

    return newDate;
}

var callProtocol = function(url, customId) {
    var e = document.createElement('a');
    e.id = 'customId';
    var strParams = "";
    if (typeof params !== 'undefined') {
        Object.keys(params).forEach(function(key) {
            strParams += strParams !== "" ? '&' : '';
            strParams += key + '=' + encodeURI(params[key]);
        });
    }
    e.href = url;
    document.getElementsByTagName('body')[0].appendChild(e);
    e.click();
    e.parentNode.removeChild(e);
};

function popupCenter(url, title, w, h) {
    // Fixes dual-screen position                         Most browsers      Firefox
    var dualScreenLeft = window.screenLeft !== undefined ? window.screenLeft : screen.left;
    var dualScreenTop = window.screenTop !== undefined ? window.screenTop : screen.top;

    var width = window.innerWidth ? window.innerWidth : document.documentElement.clientWidth ? document.documentElement.clientWidth : screen.width;
    var height = window.innerHeight ? window.innerHeight : document.documentElement.clientHeight ? document.documentElement.clientHeight : screen.height;

    if (!w) {
        w = width * 0.75;
    }

    if (!h) {
        h = height * 0.75;
    }

    var left = ((width / 2) - (w / 2)) + dualScreenLeft;
    var top = ((height / 2) - (h / 2)) + dualScreenTop;
    var newWindow = window.open(url, title, 'scrollbars=yes, width=' + w + ', height=' + h + ', top=' + top + ', left=' + left);

    // Puts focus on the newWindow
    if (window.focus) {
        newWindow.focus();
    }
}

String.prototype.customHtmlEncode = function() {
    return this.replaceAll(' ', '_');
};

String.prototype.customHtmlDecode = function() {
    return this.replaceAll('_', ' ');
};

function getDomain() {
    return location.protocol + '//' + location.hostname + (location.port ? ':' + location.port : '');
}

String.prototype.replaceAll = function(f, r) {
    return this.split(f).join(r);
};
