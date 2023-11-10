const axios = require('axios');
const { getTenantInfo } = require('../services/commonUtilService');
const ErrorClass = require('../services/error.service');

module.exports.schemaAttributes = async (req, res, next) => {
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
            url: `${tenantInfo.AUTH_SERVER_BASE_URL}/v2.0/Schema/attributes?filter=customAvailable`,
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

module.exports.me = async (req, res, next) => {
    try {
        const tenantInfo = getTenantInfo();
        const options = {
            method: 'GET',
            url: `${tenantInfo.AUTH_SERVER_BASE_URL}/v2.0/Me`,
            headers: {
                Authorization: `Bearer ${req.session.accessToken}`,
                Accept: 'application/scim+json',
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

module.exports.updateUserInfo = async (req, res, next) => {
    try {
        const tenantInfo = getTenantInfo();
        const options = {
            method: 'PATCH',
            url: `${tenantInfo.AUTH_SERVER_BASE_URL}/v2.0/Users/${req.params.id}`,
            headers: {
                Authorization: `Bearer ${req.session.apiAccessToken}`,
                Accept: 'application/scim+json',
                'Content-Type': 'application/scim+json',
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

module.exports.deleteUser = async (req, res, next) => {
    try {
        const tenantInfo = getTenantInfo();
        const options = {
            method: 'DELETE',
            url: `${tenantInfo.AUTH_SERVER_BASE_URL}/v2.0/Users/${req.params.id}`,
            headers: {
                Authorization: `Bearer ${req.session.apiAccessToken}`,
            },
        };
        const response = await axios(options);
        res.status(204).send(response.data);
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

module.exports.getEnrollments = async (req, res, next) => {
    try {
        const tenantInfo = getTenantInfo();
        const options = {
            method: 'GET',
            url: `${tenantInfo.AUTH_SERVER_BASE_URL}/v2.0/factors/${req.params.type}`,
            headers: {
                Authorization: `Bearer ${req.session.accessToken}`,
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

module.exports.deleteEnrollments = async (req, res, next) => {
    try {
        const tenantInfo = getTenantInfo();
        const options = {
            method: 'DELETE',
            url: `${tenantInfo.AUTH_SERVER_BASE_URL}/v2.0/factors/${req.params.type}/${req.params.id}`,
            headers: {
                Authorization: `Bearer ${req.session.accessToken}`,
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

module.exports.PasswordPolicies = async (req, res, next) => {
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
            url: `${tenantInfo.AUTH_SERVER_BASE_URL}/v2.0/PasswordPolicies`,
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
