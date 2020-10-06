require('dotenv').config()

const Mustache = require('mustache');
const fs = require('fs');
const fetch = require('node-fetch');
const Parser = require('rss-parser');
const rssParser = new Parser();
const { Octokit } = require("@octokit/rest");
const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
  userAgent: 'adriangl GitHub README generator'
});

const README_TEMPLATE_FILE = './README.mustache';
const README_FILE = './README.md'

const config = {
  postOptions : {
    mediumHandle : 'adrian.gl',
    maxPostNumber : 5,
  },
  weatherOptions: {
    cityQuery: 'Móstoles,ES',
    units: 'metric',
  },
  dateOptions: {
    year: 'numeric',
    month: 'long',
    weekday: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Europe/Madrid',
    timeZoneName: 'short'
  },
  repoDateOptions: {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'Europe/Madrid'
  },
  dateLocale: "en-US",
};

const openSourceAndContributions = {
  personal: [
    {
      name: "Pict2Cam",
      owner: "adriangl",
      repo: "pict2cam",
      platforms: "Android",
    },
    {
      name: "Dev-QuickSettings",
      owner: "adriangl",
      repo: "Dev-QuickSettings",
      platforms: "Android",
    },
    {
      name: "OverlayHelper",
      owner: "adriangl",
      repo: "OverlayHelper",
      platforms: "Android",
    },
    {
      name: "Dissidia Duodecim Final Fantasy DLC Toolkit",
      owner: "adriangl",
      repo: "DissDlcToolkit",
      platforms: "Windows",
    }
  ],
  contributions: [
    {
      name: "PoEditor Android Gradle Plugin",
      owner: "bq",
      repo: "poeditor-android-gradle-plugin",
      platforms: "Android",
    },
    {
      name: "Mini Kotlin",
      owner: "bq",
      repo: "mini-kotlin",
      platforms: "Android, Kotlin",
    },
    {
      name: "Android App Updates Helper",
      owner: "bq",
      repo: "android-app-updates-helper",
      platforms: "Android",
    }
  ]
};

async function generateReadme() {
  const blogData = await getMediumPosts(config.postOptions.mediumHandle, config.postOptions.maxPostNumber);

  openSourceProjects = await getGitHubDataFromProjects(openSourceAndContributions.personal);
  openSourceContributions = await getGitHubDataFromProjects(openSourceAndContributions.contributions);

  const templateData = {
    latestUpdateDate : new Date().toLocaleDateString(config.dateLocale, config.dateOptions),
    blogUrl: blogData.blogUrl,
    latestBlogPosts: blogData.latestBlogPosts,
    openSourceProjects: openSourceProjects,
    openSourceContributions: openSourceContributions
  };

  // Render all variables in the template
  fs.readFile(README_TEMPLATE_FILE, (err, data) =>  {
    if (err) throw err;
    const output = Mustache.render(data.toString(), templateData);
    fs.writeFileSync(README_FILE, output);
  });
}

async function getMediumPosts(handle, maxPostNumber) {
  const blogUrl = "https://medium.com/feed/@" + handle;
  const feed = await rssParser.parseURL(blogUrl);

  let latestBlogPosts = [];
  feed.items.slice(0, maxPostNumber).forEach((item) => {
    latestBlogPosts.push({ 
      link : item.link, 
      title : item.title, 
      date: new Date(item.pubDate).toLocaleDateString(config.dateLocale, config.dateOptions) 
    })
  });

  return { 
    blogUrl: feed.link, 
    latestBlogPosts: latestBlogPosts
  };
}

async function getGitHubDataFromProjects(projects) {
  const projectData = []

  for (const project of projects) {
    repoInfo = await octokit.repos.get({
      owner: project.owner,
      repo: project.repo
    });

    const lastPushUpdate = new Date(repoInfo.data.pushed_at)

    projectData.push({
      name: project.name,
      repo: repoInfo.data.full_name,
      platforms: project.platforms,
      language: repoInfo.data.language,
      latestUpdatedDate: lastPushUpdate,
      latestUpdate: lastPushUpdate.toLocaleDateString(config.dateLocale, config.repoDateOptions)
    })
  }

  projectData.sort((a, b) => b.latestUpdatedDate - a.latestUpdatedDate);
  
  return projectData;
}

generateReadme();
