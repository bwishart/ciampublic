const axios = require('axios');
const { getTenantInfo } = require('../services/commonUtilService');
const ErrorClass = require('../services/error.service');

module.exports.dataSubject = async (req, res, next) => {
    try {
        if (!req.session.accessToken) {
            throw new ErrorClass(
                'Unauthorised access - token is not present',
                401
            );
        }
        const tenantInfo = getTenantInfo();
        const options = {
            method: 'POST',
            url: `${tenantInfo.AUTH_SERVER_BASE_URL}/v1.0/privacy/data-subject-presentation`,
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${req.session.accessToken}`,
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

module.exports.dataUsage = async (req, res, next) => {
    try {
        if (!req.session.accessToken) {
            throw new ErrorClass(
                'Unauthorised access - token is not present',
                401
            );
        }
        const tenantInfo = getTenantInfo();
        const options = {
            method: 'POST',
            url: `${tenantInfo.AUTH_SERVER_BASE_URL}/v1.0/privacy/data-usage-approval`,
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${req.session.accessToken}`,
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
module.exports.dataConsents = async (req, res, next) => {
    try {
        if (!req.session.accessToken) {
            throw new ErrorClass(
                'Unauthorised access - token is not present',
                401
            );
        }
        const tenantInfo = getTenantInfo();
        const options = {
            method: 'PATCH',
            url: `${tenantInfo.AUTH_SERVER_BASE_URL}/v1.0/privacy/consents`,
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${req.session.accessToken}`,
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

module.exports.dpcmPurposes = async (req, res, next) => {
    try {
        if (!req.session.apiAccessToken) {
            throw new ErrorClass(
                'Unauthorised access - access access token is not present',
                401
            );
        }
        const tenantInfo = getTenantInfo();
        const options = {
            method: 'GET',
            url: `${tenantInfo.AUTH_SERVER_BASE_URL}/dpcm-mgmt/config/v1.0/privacy/purposes`,
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
