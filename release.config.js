module.exports = {
    branches: "workflow",
    repositoryUrl: "https://github.com/abhiverma001/my-react-app/",
    plugins: [
        '@semantic-release/commit-analyzer',
        '@semantic-release/release-notes-generator',
        '@semantic-release/github'
    ]
}