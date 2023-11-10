const axios = require('axios');
const { getTenantInfo } = require('../services/commonUtilService');
const ErrorClass = require('../services/error.service');

module.exports.updateTheme = async (req, res, next) => {
    const tenantInfo = getTenantInfo();
    const themeId = '';
    const url = tenantInfo.AUTH_SERVER_BASE_URL,
        token = req.session.accessToken;
    const options = {
        method: 'POST',
        url: `${url}/v1.0/branding/themes/${themeId}`,
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
        data: {
            enabled: true,
            phoneNumber: req.body.phoneNumber,
        },
    };
    try {
        res.status(201).send({});
    } catch (err) {
        const error = new ErrorClass('Error while sending otp to phone !', 500);
        next(error);
    }
};

module.exports.getApplicationDetails = async (req, res, next) => {
    const tenantInfo = getTenantInfo();
    const url = tenantInfo.AUTH_SERVER_BASE_URL;
    const appID = req.params?.id || tenantInfo.ISV_APP_ID;
    const appConfig = {
        method: 'get',
        url: `${url}/v1.0/applications/${appID}`,
        headers: {
            Authorization: `Bearer ${req.session.apiAccessToken}`,
        },
    };

    try {
        const response = await axios(appConfig);
        res.status(201).send(response?.data);
    } catch (err) {
        const error = new ErrorClass(err, err?.response?.status || 500);
        next(error);
    }
};

module.exports.updateApplicationDetails = async (req, res, next) => {
    const tenantInfo = getTenantInfo();
    const url = tenantInfo.AUTH_SERVER_BASE_URL;
    const appID = req.params?.id || tenantInfo.ISV_APP_ID;
    const { icon, defaultIcon, xforce, type, _links, ...payload } = req.body;
    payload.templateId = '1';
    const appConfig = {
        method: 'PUT',
        url: `${url}/v1.0/applications/${appID}`,
        headers: {
            'Content-Type': 'application/json;charset=UTF-8',
            Authorization: `Bearer ${req.session.apiAccessToken}`,
        },
        data: payload,
    };

    try {
        const response = await axios(appConfig);
        res.status(201).send(response?.data);
    } catch (err) {
        const error = new ErrorClass(err, err?.response?.status || 500);
        next(error);
    }
};
