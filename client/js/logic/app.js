var app = angular.module('blackjackapp', []);

app.factory('apiLayer', function($q) {
    return {
        apiGetCall: function(url, callback) {
            return this.apiCall("GET", url, null);
        },

        apiPostCall: function(url, data, callback) {
            return this.apiCall("POST", url, data);
        },

        apiCall: function(type, url, data) {
            console.log(type, url, data);
            var deferred = $q.defer();
            $.ajax({
                type: type,
                url: url,
                data: data ? JSON.stringify(data) : null,
                contentType: data ? "application/json" : "",
                success: function(response) {
                    if (response.error && response.error.code) {
                        deferred.reject(response);
                    } else {
                        deferred.resolve(response);
                    }

                },
                error: function(XMLHttpRequest, textStatus, errorThrown) {
                    var err = {
                        error: {
                            code: 1
                        }
                    };
                    deferred.reject(err);
                }
            });
            return deferred.promise;
        }
    };
});

app.factory('socket', function($rootScope) {
    var socket = null;
    return {
        connect: function(url) {
            socket = io(url, {
                path: "/ws"
            });
        },
        on: function(eventName, callback) {
            socket.on(eventName, function() {
                var args = arguments;
                $rootScope.$apply(function() {
                    callback.apply(socket, args);
                });
            });
        },
        emit: function(eventName, data, callback) {
            socket.emit(eventName, data, function() {
                var args = arguments;
                $rootScope.$apply(function() {
                    if (callback) {
                        callback.apply(socket, args);
                    }
                });
            });
        }
    };
});

String.prototype.format = function() {
    var formatted = this;
    for (var arg in arguments) {
        formatted = formatted.replace("{" + arg + "}", arguments[arg]);
    }
    return formatted;
};
