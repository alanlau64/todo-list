export function myFetch(url, options) {
    return new Promise((res, rej) => {
        const method = options && options.method ? options.method : 'GET';

        const xhttp = new XMLHttpRequest();
        xhttp.open(method, url, true);

        if (options && options.headers) {
            Object.entries(options.headers).forEach(([header, value]) => {
                xhttp.setRequestHeader(header, value);
            });
        }

        xhttp.onreadystatechange = function () {
            if (this.readyState === 4 && this.status >= 200 && this.status < 300) {
                const obj = {
                    json: function () {
                        // return new Promise((resolve, _) => {
                        //   resolve(JSON.parse(xhttp.response));
                        // });
                        return JSON.parse(xhttp.response);
                    }
                }
                res(obj);
            }
        };

        xhttp.onerror = () => {
            rej(new Error('Network Error'));
        };

        options && options.body ? xhttp.send(options.body) : xhttp.send();
    });
}