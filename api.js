'use strict';

var api = (function() {

    var url = {
        q: '',
        a: ''
    };

    var lastHttpError = null;

    function logHttpError(response) {
        lastHttpError = response.data;
        console.log(JSON.stringify(lastHttpError, null, 2))
    }

    return {
        getUrlObject() {
            return url;
        },
        getLastHttpError() {
            return lastHttpError;
        },
        init() {
            axios.get('data/api.json')
                .then((response) => {
                    url = response.data;
                    console.log('url: ' + JSON.stringify(url, null, 2));
                })
                .catch((response) => {
                    logHttpError(response);
                });
        },
        getQuestions(quizId, xApiKey) {
            console.log(`getQuestions quizId=${quizId}`);
            return axios({
                method: 'GET',
                url: url.q + quizId,
                headers: {
                    'X-Api-Key': xApiKey
                }
            })
                .then(function(response) {
                    return response.data;
                })
                .catch(function(response) {
                    logHttpError(response);
                });
        },
        postAnswers(obj, xApiKey) {
            return axios({
                method: 'POST',
                url: url.a,
                headers: {
                    'X-Api-Key': xApiKey
                },
                data: { data: JSON.stringify(obj) }
            })
                .then(function(response) {
                    return response.data;
                })
                .catch(function(response) {
                    logHttpError(response);
                });
        }
    }
})();