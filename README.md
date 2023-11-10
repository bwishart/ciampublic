# One time steps to setup the application:
1. Clone the repo
2. Run `npm i`
3. Run `npx lerna bootstrap`

# Use any of the below commands to run the application 
`npm start` - To run the application for demo purpose

- This will build the ui code and serve it on the backend server

`npm run dev` - To run the application in developement mode
- Modify the .env file in packages --> public-server folder *BASEURL* to https and hostname,port as per requirement
- Modify the context_build.sh in packages-->public-ui folder *HOSTNAME* to https and hostname,port as per requirement

- It spins up the backend and ui servers in development mode(enables hot reloding)
### Note: 
- if you are running **npm run dev** command, please allow insecure access in the browser for both server and ui ports and please discard any changes in the public-ui folder before running **npm start**.
- If you are running on windows you will need to run the stop script to stop the application(refer *Stop ISV Demo apps section* - https://github.com/iamdemoing/demo_setup/blob/main/Setting%20up%20ISV%20Demo%20apps.docx)
