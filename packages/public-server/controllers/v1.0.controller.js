const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const { getTenantInfo } = require('../services/commonUtilService');
const ErrorClass = require('../services/error.service');

module.exports.getAttributes = async (req, res, next) => {
    try {
        if (!req.session.apiAccessToken) {
            throw new ErrorClass(
                'Unauthorised access - access token is not present',
                401
            );
        }
        const tenantInfo = getTenantInfo();
        const options = {
            method: 'GET',
            url: `${tenantInfo.AUTH_SERVER_BASE_URL}/v1.0/attributes?search= (scope="tenant"%26sourceType="schema")`,
            headers: {
                Authorization: `Bearer ${req.session.apiAccessToken}`,
            },
        };
        const response = await axios(options);
        res.status(200).send(response.data);
    } catch (error) {
        let err;
        if (error?.response?.data?.messageId) {
            err = new ErrorClass(
                `${error.response.data.messageId} ${error.response.data.messageDescription}`,
                error.response.status
            );
        } else if (error?.response?.body) {
            err = new ErrorClass(error.response.body, error.response.status);
        } else if (error?.response?.status) {
            err = new ErrorClass(
                error.response.statusText,
                error.response.status
            );
        } else {
            err = error;
        }
        next(err);
    }
};

module.exports.postAttributes = async (req, res, next) => {
    try {
        if (!req.session.apiAccessToken) {
            throw new ErrorClass(
                'Unauthorised access - access token is not present',
                401
            );
        }
        const tenantInfo = getTenantInfo();
        const options = {
            method: 'POST',
            url: `${tenantInfo.AUTH_SERVER_BASE_URL}/v1.0/attributes`,
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${req.session.apiAccessToken}`,
            },
            data: req.body,
        };
        const response = await axios(options);
        res.status(200).send(response.data);
    } catch (error) {
        let err;
        if (error?.response?.data?.messageId) {
            err = new ErrorClass(
                `${error.response.data.messageId} ${error.response.data.messageDescription}`,
                error.response.status
            );
        } else if (error?.response?.body) {
            err = new ErrorClass(error.response.body, error.response.status);
        } else if (error?.response?.status) {
            err = new ErrorClass(
                error.response.statusText,
                error.response.status
            );
        } else {
            err = error;
        }
        next(err);
    }
};

module.exports.postThemes = async (req, res, next) => {
    try {
        if (!req.session.apiAccessToken) {
            throw new ErrorClass(
                'Unauthorised access - access token is not present',
                401
            );
        }
        const tenantInfo = getTenantInfo();
        const data = new FormData();
        data.append('files', fs.readFileSync(req.files[0].path));
        data.append('configuration', req.body.configuration);
        const options = {
            method: 'POST',
            url: `${tenantInfo.AUTH_SERVER_BASE_URL}/v1.0/branding/themes`,
            headers: {
                'Content-Type': 'multipart/form-data',
                Authorization: `Bearer ${req.session.apiAccessToken}`,
            },
            data,
        };
        const response = await axios(options);
        res.status(200).send(response.data);
    } catch (error) {
        let err;
        if (error?.response?.data?.messageId) {
            err = new ErrorClass(
                `${error.response.data.messageId} ${error.response.data.messageDescription}`,
                error.response.status
            );
        } else if (error?.response?.body) {
            err = new ErrorClass(error.response.body, error.response.status);
        } else if (error?.response?.status) {
            err = new ErrorClass(
                error.response.statusText,
                error.response.status
            );
        } else {
            err = error;
        }
        next(err);
    }
};

module.exports.putThemes = async (req, res, next) => {
    try {
        if (!req.session.apiAccessToken) {
            throw new ErrorClass(
                'Unauthorised access - access token is not present',
                401
            );
        }
        const tenantInfo = getTenantInfo();
        const data = new FormData();
        let url = `${tenantInfo.AUTH_SERVER_BASE_URL}/v1.0/branding/themes/${req.query.id}`;
        if (req.query.path) {
            url += `${req.query.path}`;
            data.append('file', fs.readFileSync(req.files[0].path));
        } else {
            data.append('files', fs.readFileSync(req.files[0].path));
            data.append('configuration', req.body.configuration);
        }
        const options = {
            method: 'PUT',
            url,
            headers: {
                'Content-Type': 'multipart/form-data',
                Authorization: `Bearer ${req.session.apiAccessToken}`,
            },
            data,
        };
        const response = await axios(options);
        res.status(200).send(response.data);
    } catch (error) {
        let err;
        if (error?.response?.data?.messageId) {
            err = new ErrorClass(
                `${error.response.data.messageId} ${error.response.data.messageDescription}`,
                error.response.status
            );
        } else if (error?.response?.body) {
            err = new ErrorClass(error.response.body, error.response.status);
        } else if (error?.response?.status) {
            err = new ErrorClass(
                error.response.statusText,
                error.response.status
            );
        } else {
            err = error;
        }
        next(err);
    }
};

module.exports.getThemes = async (req, res, next) => {
    try {
        if (!req.session.apiAccessToken) {
            throw new ErrorClass(
                'Unauthorised access - access token is not present',
                401
            );
        }
        const tenantInfo = getTenantInfo();
        let url = `${tenantInfo.AUTH_SERVER_BASE_URL}/v1.0/branding/themes`;
        if (req.query.path) {
            url += `/${req.query.path}`;
        }
        const options = {
            method: 'GET',
            url,
            headers: {
                Authorization: `Bearer ${req.session.apiAccessToken}`,
            },
        };
        const response = await axios(options);
        res.status(200).send(response.data);
    } catch (error) {
        let err;
        if (error?.response?.data?.messageId) {
            err = new ErrorClass(
                `${error.response.data.messageId} ${error.response.data.messageDescription}`,
                error.response.status
            );
        } else if (error?.response?.body) {
            err = new ErrorClass(error.response.body, error.response.status);
        } else if (error?.response?.status) {
            err = new ErrorClass(
                error.response.statusText,
                error.response.status
            );
        } else {
            err = error;
        }
        next(err);
    }
};

module.exports.deleteAuthenticators = async (req, res, next) => {
    try {
        if (!req.session.apiAccessToken) {
            throw new ErrorClass(
                'Unauthorised access - access token is not present',
                401
            );
        }
        const tenantInfo = getTenantInfo();
        const options = {
            method: 'DELETE',
            url: `${tenantInfo.AUTH_SERVER_BASE_URL}/v1.0/authenticators/${req.query.qrCodeId}`,
            headers: {
                Authorization: `Bearer ${req.session.apiAccessToken}`,
            },
        };
        const response = await axios(options);
        res.status(200).send(response.data);
    } catch (error) {
        let err;
        if (error?.response?.data?.messageId) {
            err = new ErrorClass(
                `${error.response.data.messageId} ${error.response.data.messageDescription}`,
                error.response.status
            );
        } else if (error?.response?.body) {
            err = new ErrorClass(error.response.body, error.response.status);
        } else if (error?.response?.status) {
            err = new ErrorClass(
                error.response.statusText,
                error.response.status
            );
        } else {
            err = error;
        }
        next(err);
    }
};

module.exports.authnmethods = async (req, res, next) => {
    try {
        if (!req.session.apiAccessToken) {
            throw new ErrorClass(
                'Unauthorised access - access token is not present',
                401
            );
        }
        const tenantInfo = getTenantInfo();
        const options = {
            method: 'GET',
            url: `${tenantInfo.AUTH_SERVER_BASE_URL}/v1.0/authnmethods/signatures?_embedded=${req.query._embedded}&search=${req.query.search}`,
            headers: {
                Authorization: `Bearer ${req.session.apiAccessToken}`,
            },
        };
        const response = await axios(options);
        res.status(200).send(response.data);
    } catch (error) {
        let err;
        if (error?.response?.data?.messageId) {
            err = new ErrorClass(
                `${error.response.data.messageId} ${error.response.data.messageDescription}`,
                error.response.status
            );
        } else if (error?.response?.body) {
            err = new ErrorClass(error.response.body, error.response.status);
        } else if (error?.response?.status) {
            err = new ErrorClass(
                error.response.statusText,
                error.response.status
            );
        } else {
            err = error;
        }
        next(err);
    }
};
