const Mustache = require('mustache');
const fs = require('fs');
const fetch = require('node-fetch');
const Parser = require('rss-parser');
const rssParser = new Parser();

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
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Europe/Madrid',
    timeZoneName: 'short'
  },
  dateLocale: "en-US",
};

const openSourceAndContributions = {
  personal: [
    {
      name: "Pict2Cam",
      repo: "adriangl/pict2cam",
      platforms: "Android",
      programmingLanguages: "Kotlin"
    },
    {
      name: "Dev-QuickSettings",
      repo: "adriangl/Dev-QuickSettings",
      platforms: "Android",
      programmingLanguages: "Kotlin"
    },
    {
      name: "OverlayHelper",
      repo: "adriangl/OverlayHelper",
      platforms: "Android",
      programmingLanguages: "Java"
    },
    {
      name: "Dissidia Duodecim Final Fantasy DLC Toolkit",
      repo: "adriangl/DissDlcToolkit",
      platforms: "Windows",
      programmingLanguages: "C#"
    }
  ],
  contributions: [
    {
      name: "PoEditor Android Gradle Plugin",
      repo: "bq/poeditor-android-gradle-plugin",
      platforms: "Android",
      programmingLanguages: "Kotlin"
    },
    {
      name: "Mini Kotlin",
      repo: "bq/mini-kotlin",
      platforms: "Android, Java, Kotlin",
      programmingLanguages: "Kotlin"
    }
  ]
};

async function generateReadme() {
  const blogData = await getMediumPosts(config.postOptions.mediumHandle, config.postOptions.maxPostNumber);

  const templateData = {
    latestUpdateDate : new Date().toLocaleDateString(config.dateLocale, config.dateOptions),
    blogUrl: blogData.blogUrl,
    latestBlogPosts: blogData.latestBlogPosts,
    openSourceProjects: openSourceAndContributions.personal,
    openSourceContributions: openSourceAndContributions.contributions
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

generateReadme();
