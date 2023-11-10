const hostname = '{HOSTNAME}';

const environment = {
    production: true,
    baseUrl: hostname,
    redirectUrl: `${hostname}/app/dashboard`,
    loginUrl: `${hostname}/login`,
    workflow: 'public',
};
export default environment;
