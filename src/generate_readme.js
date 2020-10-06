require("dotenv").config();
const { githubProjects } = require("./data/github_projects");
const { mediumInfo } = require("./data/medium_info");
const Mustache = require("mustache");
const fs = require("fs");
const Parser = require("rss-parser");
const rssParser = new Parser();
const { Octokit } = require("@octokit/rest");
const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
  userAgent: "GitHub README generator",
});

const README_TEMPLATE_FILE = "./README.mustache";
const README_FILE = "./README.md";

const config = {
  dateOptions: {
    year: "numeric",
    month: "long",
    weekday: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Madrid",
    timeZoneName: "short",
  },
  repoDateOptions: {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "Europe/Madrid",
  },
  dateLocale: "en-US",
};

async function generateReadme() {
  const blogData = await getMediumPosts(
    mediumInfo.handle,
    mediumInfo.maxPostNumber
  );

  const openSourceProjects = await getGitHubDataFromProjects(
    githubProjects.personal
  );
  const openSourceContributions = await getGitHubDataFromProjects(
    githubProjects.contributions
  );

  const templateData = {
    latestUpdateDate: new Date().toLocaleDateString(
      config.dateLocale,
      config.dateOptions
    ),
    blogUrl: blogData.blogUrl,
    latestBlogPosts: blogData.latestBlogPosts,
    openSourceProjects: openSourceProjects,
    openSourceContributions: openSourceContributions,
    version: process.env.npm_package_version,
  };

  // Render all variables in the template
  fs.readFile(README_TEMPLATE_FILE, (err, data) => {
    if (err) throw err;
    const output = Mustache.render(data.toString(), templateData);
    fs.writeFileSync(README_FILE, output);
  });
}

async function getMediumPosts(handle, maxPostNumber) {
  const blogUrl = "https://medium.com/feed/@" + handle;
  const feed = await rssParser.parseURL(blogUrl);

  const latestBlogPosts = [];
  feed.items.slice(0, maxPostNumber).forEach((item) => {
    latestBlogPosts.push({
      link: item.link,
      title: item.title,
      date: new Date(item.pubDate).toLocaleDateString(
        config.dateLocale,
        config.dateOptions
      ),
    });
  });

  return {
    blogUrl: feed.link,
    latestBlogPosts: latestBlogPosts,
  };
}

async function getGitHubDataFromProjects(projects) {
  const projectData = [];

  for (const project of projects) {
    const repoInfo = await octokit.repos.get({
      owner: project.owner,
      repo: project.repo,
    });

    const lastPushUpdate = new Date(repoInfo.data.pushed_at);

    projectData.push({
      name: project.name,
      repo: repoInfo.data.full_name,
      url: repoInfo.data.html_url,
      platforms: project.platforms,
      language: repoInfo.data.language,
      latestUpdatedDate: lastPushUpdate,
      latestUpdate: lastPushUpdate.toLocaleDateString(
        config.dateLocale,
        config.repoDateOptions
      ),
    });
  }

  projectData.sort((a, b) => b.latestUpdatedDate - a.latestUpdatedDate);

  return projectData;
}

generateReadme();
