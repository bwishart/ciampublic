const axios = require('axios');
const {
    getTenantInfo,
    getUserIpAddress,
} = require('../services/commonUtilService');
const ErrorClass = require('../services/error.service');

module.exports.initiateNotification = async (req, res, next) => {
    try {
        if (!req.session.accessToken) {
            throw new ErrorClass(
                'Unauthorised access - token is not present',
                401
            );
        }
        if (!req.body.userId) {
            throw new ErrorClass(
                "Request doesn't contain user id, Please send request with user id.",
                400
            );
        }
        const { userId } = req.body;
        const tenantInfo = getTenantInfo();
        const ownerOptions = {
            method: 'GET',
            url: `${tenantInfo.AUTH_SERVER_BASE_URL}/v1.0/authenticators?search=owner%20%3D%20%22${userId}%22`,
            headers: {
                Authorization: `Bearer ${req.session.accessToken}`,
            },
        };
        const ownerResponse = await axios(ownerOptions);
        if (!ownerResponse.data.total) {
            throw new ErrorClass(
                `The user-${userId} doesn't have any authenticators set, Please register authenticators.`,
                400
            );
        }
        const signatureOptions = {
            method: 'GET',
            url: `${tenantInfo.AUTH_SERVER_BASE_URL}/v1.0/authnmethods/signatures?search=owner%20%3D%20%22${userId}%22`,
            headers: {
                Authorization: `Bearer ${req.session.accessToken}`,
            },
        };
        const signatureResponse = await axios(signatureOptions);
        if (!signatureResponse.data.total) {
            throw new ErrorClass(
                `The user-${userId} doesn't have any signatures set, Please register authenticators.`,
                400
            );
        }
        const data = signatureResponse.data.signatures[0];
        res.status(200).send({
            authId: data.attributes.authenticatorId,
            signatureId: data.id,
        });
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
module.exports.pushNotification = async (req, res, next) => {
    try {
        if (!req.session.accessToken) {
            throw new ErrorClass(
                'Unauthorised access - token is not present',
                401
            );
        }
        if (!req.body.authId) {
            throw new ErrorClass(
                "Request doesn't contain authentication id, Please send request with authentication id.",
                400
            );
        }
        if (!req.body.signatureId) {
            throw new ErrorClass(
                "Request doesn't contain push Signature id, Please send request with push Signature id.",
                400
            );
        }
        const tenantInfo = getTenantInfo();

        const { title, additionalData, message, signatureId, authId } =
            req.body;
        const userIpAddress = getUserIpAddress(req);
        const body = {
            expiresIn: 60,
            pushNotification: {
                sound: 'default',
                message: 'Request to approve the request',
                send: true,
                title,
            },
            authenticationMethods: [
                {
                    methodType: 'signature',
                    id: signatureId,
                },
            ],
            logic: 'OR',
            transactionData: {
                additionalData,
                message,
                originIpAddress: userIpAddress,
                originUserAgent: 'Browser',
            },
        };
        const options = {
            method: 'POST',
            url: `${tenantInfo.AUTH_SERVER_BASE_URL}/v1.0/authenticators/${authId}/verifications`,
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${req.session.accessToken}`,
            },
            data: body,
        };
        const response = await axios(options);
        res.status(202).send({
            expiryTime: response.data.expiryTime,
            authId: response.data.authenticatorId,
            pushId: response.data.id,
        });
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
module.exports.verifyNotification = async (req, res, next) => {
    try {
        if (!req.session.accessToken) {
            throw new ErrorClass(
                'Unauthorised access - token is not present',
                401
            );
        }
        if (!req.body.authId) {
            throw new ErrorClass(
                "Request doesn't contain authentication id, Please send request with authentication id.",
                400
            );
        }
        if (!req.body.pushId) {
            throw new ErrorClass(
                "Request doesn't contain push notification id, Please send request with push notification id.",
                400
            );
        }
        const tenantInfo = getTenantInfo();
        const ownerOptions = {
            method: 'GET',
            url: `${tenantInfo.AUTH_SERVER_BASE_URL}/v1.0/authenticators/${req.body.authId}/verifications/${req.body.pushId}`,
            headers: {
                Authorization: `Bearer ${req.session.accessToken}`,
            },
        };
        const ownerResponse = await axios(ownerOptions);
        res.status(200).send({
            status: ownerResponse.data.state,
        });
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

module.exports.enrollNotification = async (req, res, next) => {
    try {
        if (!req.session.apiAccessToken) {
            throw new ErrorClass(
                'Unauthorised access - token is not present',
                401
            );
        }
        if (!req.body.owner) {
            throw new ErrorClass(
                "Request doesn't contain owner id, Please send request with owner id.",
                400
            );
        }
        if (!req.body.accountName) {
            throw new ErrorClass(
                "Request doesn't contain account username, Please send request with account username.",
                400
            );
        }
        const tenantInfo = getTenantInfo();
        const body = {
            owner: req.body.owner,
            clientId: tenantInfo.AUTH_CLIENT_ID,
            accountName: req.body.accountName,
        };

        const options = {
            method: 'POST',
            url: `${tenantInfo.AUTH_SERVER_BASE_URL}/v1.0/authenticators/initiation?qrcodeInResponse=true`,
            headers: {
                Authorization: `Bearer ${req.session.apiAccessToken}`,
            },
            data: body,
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
