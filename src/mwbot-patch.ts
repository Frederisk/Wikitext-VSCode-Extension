import MWBot from "mwbot";

const originalRequest = MWBot.prototype.request;

MWBot.prototype.request = function (this: unknown, params: object = {}, customRequestOptions: RequestOptions = {}) {
    const method = customRequestOptions.method?.toUpperCase();
    if (method === 'GET') {
        const modifiedOptions: RequestOptions = {
            ...customRequestOptions,
            method: 'GET',
            qs: {
                ...(customRequestOptions.qs || {}),
                ...params
            }
        };

        return originalRequest.call(this, {}, modifiedOptions);
    }
    return originalRequest.call(this, params, customRequestOptions);
};
