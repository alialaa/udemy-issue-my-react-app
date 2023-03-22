# Getting Started with CI-CD (Github Actions) for React App

## Project Overview:-

- In this project we will create a GitHub Repo with Master Branch and a Development Branch
- Both Branches will be protected, that means no one will be able to push the code into this, if someone want to push the code into Development or Master first they have to open a pull request.
- Then that pull request have to be approved in the branch by authorized member.

- Master Branch will be containing the code which will be deployed on production so we will not push anything directly into master branch.
- On the other side our Development branch will contain the latest developed code.

- If any team member is working on any new feature, then he/she will create a new branch, lets call is Feature1 branch
- When they are done they will open a new pull request to merge the code with development branch
- Once pull request gets opened a workflow will run, this workflow will check code will not break any test and we will also check code formatting etc.
- Once this workflow get completed some from our them will check and approve the pull request.
- Once full request will approved code will merge with Development branch 

- Once we will merger the code into development we would like to run some workflow
- This workflow will also check the checks and code formatting etc.. and deploye the code on some staging server.

- If application is running fine on staging server then
- We will open a new pull request to merger the development branch code with Master Branch
- At this time also a workflow will run to check the checks and code formatting post some from team will review and approve the pull request and code will get merger with Master Branch
- Once merge gets completed again a workflow will run that will check the all checks and code formatting and deploye the code on Productions server.

# Workflows:-
### 
1. 'First Workflow will be doing belwo things:
- Install Dependencies like in our code nodejs and npm
- Check Code Formatting
- Run Automated Tests
- Upload code Coverage as an Artifact to download the reports.
- Cache Dependencies #so our next workflow will take less time to run as all the depencencies will get stored 

2. Second Workflow will be doing below things
- Install Dependencies like in our code nodejs and npm
- Check Code Formatting
- Run Automated Tests
- Upload code Coverage as an Artifact
- Build Project
- Upload Build as an Artifact
- Deploye to staging Server
- Cache Dependencies

3. Third Workflow will be doing below things:
- Install Dependencies like in our code nodejs and npm
- Check Code Formatting
- Run Automated Tests
- Upload code Coverage as an Artifact #To download the reports.
- Cache Dependencies #so our next workflow will take less time to run as all the depencencies will get stored 

4. Fourth Workflow will be doing below things
- Install Dependencies like in our code nodejs and npm
- Check Code Formatting
- Run Automated Tests
- Upload code Coverage as an Artifact
- Build Project
- Upload Build as an Artifact
- Create a Release
- Deploye to Production Server
- Upload Coverage to Codecov
- Cache Dependencies

5. Need to configure below notification service also in our workflow
- Job Failure --> Create Issue
- Issue Created --> Send a Slack Message
- Release Created --> Send a Slack Message'


## Setting Up our Repository
https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-code-owners

In react Application directory need to create :
- '.github' directly and inside '.github' create a workflows names directory which will basically contain the workflow yaml files
- Also in react dir create a file name 'CODEOWNERS' this file will contain specific file's owner details like file
```
* @abhiverma001
*.js @abhiverma001
*.yml @abhiverma001
/public/ @abhiverma001

```

- Create a new repo names "react-app" 
- Push you local react app dir code into this repo.
- Create a new branch nameed 'development'
- Go to setting --> brnches --> add new protection rule --> branch name 'master' --> check the option like Require pull request review and inside both the options , read and check other options if required --> Require status checks
- create the rule
- Do the same process for 'development' branch
- Now if you try to push something you will get the error.
- Git fetch #this command will fetch the development branch of any other branch

- Follow the link to get more details for below process (https://docs.npmjs.com/cli/v9/commands/npm-ci)
- git checkout -b workflow #to switch to workflow branch here we will prepare the workflows
- create a new workflow yaml file named 'code-check-test.yml'
```
name: Test Code before push to Dev Branch

on:
  pull_request:
    branches: [development]

jobs:
  code-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Use Nodejs
        uses: actions/setup-node@v1
        with:
          node-version: "16.x"
      - run: npm ci #this is similer to install the npm
      - run: npm run format #it will arrange the code in correct format.
      - run: npm run format:check #This will check the code format
      - run: npm test -- --coverage #This will to the testing of code.
        env:
          CI: true
```
- push it to repo
- post pusing it, you need to create a a new pull request  -- >base: development --> compare: workflow
- once you create this new workflow , created workflow will run (this workflow should pass)
- Need to go back to setting --> Branches -->Rules -- master rule edit --> Require status checks to pass before merging - check out the build option here
- do the same process for development process
- Setting --> Collaborators --> add your github username(Pull request will be approved by) here --> Copy the invite link and accept the invitation ( this used will approve the pull request )


## Application Push in Dev Branch and Deploye the code in staging environment.
- Create a new workflow yaml file to build the code and deploye using surge if first workflow is passed.

```
name: Build the code and Deploy using Surge
on:
  push:
    branches: [development]

jobs:
  build:
    if: github.event_name == 'push' #it's mean post pull request gets approved and marged with development brancg this work flow wiht run.
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Use Nodejs
        uses: actions/setup-node@v1
        with:
          node-version: "12.x"
      - run: npm ci #this is similer to install the npm
      - run: npm run format:check #This will check the code format
      - run: npm test -- --coverage #This will to the testing of code.
        env:
          CI: true
      - name: Build project
        run: |
          ls
          npm run build
          ls
      - name: install the 'surge' to Deploy the our build
        run: npm install -g surge

      - name: Deploy to Staging
        run: surge --project ./build --domain
          dev-my-react-app-abhiverma001.surge.sh
        env:
          SURGE_LOGIN: ${{ secrets.SURGE_LOGIN }} #To get the login id you can run command locally 'surge whoami'
          SURGE_TOKEN: ${{ secrets.SURGE_TOKEN }} #To get the tocken you can run the command locally 'surge token' then create the secrets in github repo

```
- push it
- from other account check if checks are passed then approve and merge pull request

- Caching NPM Dependencies & Uploading artifacts in out workflows
https://docs.github.com/en/actions/using-workflows/caching-dependencies-to-speed-up-workflows
https://github.com/actions/cache\
- here we will be configuring a new step in the same above worklow to cache the npm dependencies.
- Also we will configure the artifacts for tests and build. you can download them from actions dashboard.
```
name: Test, Build and Deploy the Application using Surge on Dev Infra Along with Cache NPM Dependencies & Artifacts Upload.
on:
  push:
    branches: [development]

jobs:
  build-dev:
    if: github.event_name == 'push' #it's mean post pull request gets approved and marged with development branch it workflow will run
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Cache node_modules
        uses: actions/cache@v1
        with:
          path: ~/.npm #this is default npm cache path for linux runner
          key: ${{ runner.os }}-node-${{ hashFiles('**/package-lok.json') }}
          restore-keys: |
            ${{ runner.os }}-node-
          #this is used, if github doesn't find any cache in above key, it will take the older cache from this.

      - name: Use Nodejs
        uses: actions/setup-node@v1
        with:
          node-version: "12.x"
      - run: npm ci #this is similer to install the npm
      - run: npm run format  #This will arrange the code in correct format        
      - run: npm run format:check #This will check the code format 
      - run: npm test -- --coverage #This will to the testing of code.
        env:
          CI: true
      - name: Upload Test Coverage #it will upload the code test inside the coverage folder named code-coverage in our repo
        uses: actions/upload-artifact@v1
        with:
          name: code-coverage
          path: coverage

      - name: Build project
        run: npm run build

      - name: Upload build folder #used for artifacts, if build is success, we will have to build artifacts inside our build folder in repo.
        uses: actions/upload-artifact@v1
        with:
          name: build
          path: build

      - name: install the 'surge' to Deploy the our build
        run: npm install -g surge

      - name: Deploy to Staging
        run: surge --project ./build --domain
          dev-my-react-app-abhiverma001.surge.sh
        env:
          SURGE_LOGIN: ${{ secrets.SURGE_LOGIN }} #To get the login id you can run command locally 'surge whoami'
          SURGE_TOKEN: ${{ secrets.SURGE_TOKEN }} #To get the tocken you can run the command locally 'surge token' then create the secrets in github repo


```
- Push this workflow	
- Check the workflow output
- In your actions workflow on button you can check the artifacts.
- Here second workflow is completed, now we will jump for next workflow to merge the code from development branch to master in next lecture.

## Semantic versioning & Conventional Commits
https://semver.org/
https://www.conventionalcommits.org/en/v1.0.0/

- Semantic is used for versioning, here we will be using it for out Release versioning notes.
- Semantic Versioning 2.0.0
- in above version below is brief 
1.MAJOR version when you make incompatible API changes
2.MINOR version when you add functionality in a backwards compatible manner
3.PATCH version when you make backwards compatible bug fixes

- Conventional Commits - read the documents
```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

- Installing Semantic-release in Our Project
https://github.com/semantic-release/semantic-release
- follow this for installation https://github.com/semantic-release/semantic-release/blob/master/docs/usage/installation.md#installation
- then create a file inside our repo project named 'release.config.js
```
module.exports = {
    branches: "master",
    repositoryUrl: "https://github.com/abhiverma001/my-react-app/",
    plugins: [
        '@semantic-release/commit-analyzer',
        '@semantic-release/release-notes-generator',
        '@semantic-release/github'
    ]
}
```

-git add A
-git commit -m"fix: fix description"      #using this for conventional commit
-git push
-'npx semantic-release'  #running this command locally, you will get an idea how this will happen in your github workflow.

## Work on workflow for Master Branch.
- Lets configure semantic in our workflow
```
name: Deploy Application On Prod Along with Release notes and Code Coverange
on:
  push:
    branches: [master]

jobs:
  build-prod:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Cache node_modules
        uses: actions/cache@v1
        with:
          path: ~/.npm #this is default npm cache path for linux runner
          key: ${{ runner.os }}-node-${{ hashFiles('**/package-lok.json') }}
          restore-keys: |
            ${{ runner.os }}-node-
          #this is used, if github doesn't find any cache in above key, it will take the older cache from this.

      - name: Use Nodejs
        uses: actions/setup-node@v1
        with:
          node-version: "18.x"
      - run: npm ci #this is similer to install the npm
      - run: npm run format #This will arrange the code in correct format
      - run: npm run format:check #This will check the code format
      - run: npm test -- --coverage #This will to the testing of code.
        env:
          CI: true
      - name: Upload Test Coverage #it will upload the code test inside the coverage folder named code-coverage in our repo
        uses: actions/upload-artifact@v1
        with:
          name: code-coverage
          path: coverage

      - name: Build project
        run: npm run build

      - name: Upload build folder #used for artifacts, if build is success, we will have to build artifacts inside our build folder in repo.
        uses: actions/upload-artifact@v1
        with:
          name: build
          path: build
      
      - name: Create a Release
        run: npx semantic-release
        env:
          GITHUB_TOKEN: ${{ secrets.MY_TOKEN }}

      - name: install the 'surge' to Deploy the our build
        run: npm install -g surge

      - name: Deploy to Prod
        run: surge --project ./build --domain
          prod-my-react-app-abhiverma001.surge.sh
        env:
          SURGE_LOGIN: ${{ secrets.SURGE_LOGIN }} #To get the login id you can run command locally 'surge whoami'.
          SURGE_TOKEN: ${{ secrets.SURGE_TOKEN }} #To get the tocken you can run the command locally 'surge token' then create the secrets in github repo
```
-git add A
-git commit -m"feat: some feature"
-git push

- for testing purpose you can delete the protection rule for your master branch for time being only, later you can enable it again.
- once this workflow is run, check the release option in your repo and check the notes, also refer the workflow output

- now lets upload release assets
- lets add the code coverage and build details also in our release notes.
- first edit the 'release.config.js' file then edit the existing above workflow

```
modules.exports = {
      branches: "master"  #branches for whihc you want to make the release notes https://github.com/semantic-release/semantic-release/blob/master/docs/usage/installation.md#installation
      repositoryUrl: "https://github.com/abhiverma001/my-react-app/"
      plugins: [
         '@semantic-release/commit-analyzer', 
         '@semantic-release/release-notes-generator', 
         '@semantic-release/npm', 
         ['@semantic-release/github', {
              assets: [
                  { path: "build.zip", label: "Build"},
                  { path: "coverage.zip", label: "Coverage"},
              ]
         }]
      ]
}
```



- In workflow make the zip file of build and coverage folders.

```
name: Build the code and Deploy using Surge on prod environment and make the release notes.
on:
  pull_request:
    branches: [development, master]
  push:
    branches: [development, master]      

jobs:
  build:
    runs-on: ubuntu-latest
    env:                   #making here secrets can be access at any steps where it needed.
          SURGE_LOGIN: ${{ secrets.SURGE_LOGIN }} #To get the login id you can run command locally 'surge whoami'
          SURGE_TOCKEN: ${{ secrets.SURGE_TOCKEN }} #To get the tocken you can run the command locally 'surge token' then create the secrets in github repo  
    steps:
      - uses: actions/checkout@v2
      - name: Cache node_modules
        uses: actions/cache@v1
        with:
          path: ~/.npm   #this is default npm cache path for linux runner
          key: ${{ runner.os }}-node-${{ hashFiles('**/package-lok.json') }}
          restore-keys: |
            ${{ runner.os }}-node-        #this is use, if github doesn't find any cache in above key, it will take the older cache from this.
            
      - name: Use Nodejs
        uses: actions/setup-node@v1
        with:
          node-version: "12.x"
      - run: npm ci #this is similer to install the npm
      - run: npm run format:check #This will check the code format
      - run: npm test -- --coverage #This will to the testing of code.
        env:
          CI: true
      - name: Upload Test Coverage      #used for artifacts, it will upload the code test inside the coverage folder named code-coverage in our repo
        uses: actions/upload-artifact@v1
        with:
          name: code-coverage
          path: coverage    
      - name: Build project
        run: npm run build
      - name: Upload build folder     #used for artifacts, if build is success, we will have to build artifacts inside our build folder in repo.
        uses: actions/upload-artifact@v1
        with:
          name: build
          path: build          
      - uses: actions/download-artifact      #it used to download your artifacts in workspace.
      - name: Zip Assets             #make the zip file coverage and build folder for semantic release
        if: github.event_name == 'push' && github.ref == 'ref/heads/master'
        run: |
          zip -r build.zip ./build
          zip -r coverage.zip ./coverage 

      - name: Create a Release
        if: github.event_name == 'push' && github.ref == 'ref/heads/master'   #it will make sure, this step will execute when there is push event in master branch only.
        run: npx semantic-release
        evv:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}   #this token is already generated by github. or you can create your own secret, with your github token and name it like ABHI-GITHUB-TOKEN, so when  it will make the release note, your name will be there.

      - name: install the 'surge' to Deploy the our build
        run: npm install -g surge

      - name: Deploy to Staging
        run: surge --project ./build --domain
        if: github.event_name == 'push' && github.ref == 'ref/heads/development'         
          dev-my-react-app-abhiverma001.surge.sh
          
       - name: Deploy to Production
        run: surge --project ./build --domain
        if: github.event_name == 'push' && github.ref == 'ref/heads/master'         
          prod-my-react-app-abhiverma001.surge.sh
       
```

- Push it in repo and create the pull request to merge with dev then with master branch

- Uploading COde Coverage Reports to Codecov
https://about.codecov.io/
- visit to this link and add login with your github id then open the react-app repo get the CODECOV_TOKEN
- make a secret with the same name in react-app repo
- then add a step in workflow for CODECOV to upload the reports on CODECOV

```
      - name: Upload Coverage reports to codecov 
        if: github.event_name == 'push' && github.ref == 'ref/heads/master'    
        run: npx codecov
        env:
         CODECOV_TOKEN: ${{ secrets.CODECOV_TOKEN }}
         
```

- push the complete workflow and check the output details in workflow for this step.
- visit to codecov and your repo, there report will be published.



## Sending Slack Message when a New Release is Published.
- Create a new workflow 
- This workflow will run when there is a new release 
- For this we need a slack webhook details for this follow the below steps
  - Open api.slack.com --> Create an app --> From Scratch --> Provide any custom Name --Pick yoiur workspace like ITABHI --> Create APP --> Incoming Webhooks --> activate it --> Add new webhook --> select you channel where you want to get notification -->allow --> copy the Sample curl request post channel address.
  - you will get like this 
  ```curl -X POST -H 'Content-type: application/json' --data '{"text":"Hello, World!"}' https://hooks.slack.com/services/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
  ```
  - create a secret of 'https://hooks.slack.com/services/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'
    
- lets create a workflow named 'release-slack-notification'

```
name: Notify on Release in Slack

on:
  release:
   type: [published]

jobs:
  slack-message:
  runs-on: ubuntu-latest
  steps:
    - name: Slack Message 
      run: |                                                    #make a secret of "https://hooks.slack.com/services/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" name 'SLACK_WEBHOOK'
        curl -X POST -H 'Content-type: application/json' --data '{"text":"Hello, World! New Release ${{ github.event.release.tag_name }} is out, <${{ github.event.release.html_url }}|check it out now.>"}' ${{ secrets.SLACK_WEBHOOK }}



# complete curl command is coppied form slack webhook
# then we costomized it so that we can get a customized message with all required details in slack channel.
# ${{ github.event.release.tag_name }} this is used to pull the release event name from github
# <${{ github.event.release.html_url }}|check it out now.>" this is used to pull the release even url from github events.

```

- now push this in git


# Opening an Automated Issue when the Workflow fails

- here we will create a new step in each workflow, it will check if any workflow gets failed a issue will be created automatically and will be assign to specific person.
- Lets add a new step, if anyone create a pull request for Master and Development, it will check the running workflows status, if any workflow fails it will create an issue and assing the issue to that member who created the pull request.
```
- name: Open Issue If Workflow Fails
         if: faliure() && github.event_name == 'pull_request'
         run: |
           curl --request POST \
           --url https://apt.github.com/repos/${{ github.repository }}/issues \
           --header 'authorization: Bearer ${{ secrets.GITHHUB_TOKEN }}' \
           --header 'content-type: application/json' \
           --data '{
           "title": "Automated issues for commit: ${{ github.sha }}",
           "body": "This issue was automatically created by the GitHub Actions workflow **${{ github.workflow }}**. \n\n The commit hash was: _${{ github.sha }}_.",
           "assignees": ["${{ github.event.pull_request.user.login }}"]     
           }'
           
```

           
      





# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
