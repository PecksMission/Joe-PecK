module.exports = function (eleventyConfig) {
  // Only process .njk and .md files as templates
  // Existing .html files are passthrough copied unchanged

  // Static assets
  eleventyConfig.addPassthroughCopy("*.html");
  eleventyConfig.addPassthroughCopy("*.{jpg,jpeg,webp,png,gif,ico,mp4,mov,heic,HEIC}");
  eleventyConfig.addPassthroughCopy("robots.txt");
  eleventyConfig.addPassthroughCopy("sitemap.xml");
  eleventyConfig.addPassthroughCopy("CNAME");
  eleventyConfig.addPassthroughCopy("admin");
  eleventyConfig.addPassthroughCopy("images");

  // Date filter for post templates
  eleventyConfig.addFilter("postDate", (dateObj) => {
    const d = new Date(dateObj);
    return d.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  });

  // Short date filter (e.g., "March 4, 2026")
  eleventyConfig.addFilter("shortDate", (dateObj) => {
    const d = new Date(dateObj);
    return d.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  });

  // Collection: all blog posts sorted by date descending
  eleventyConfig.addCollection("allPosts", function (collectionApi) {
    const cmsPosts = collectionApi
      .getFilteredByTag("post")
      .sort((a, b) => b.date - a.date);

    // Merge with legacy posts data
    const legacyPosts = require("./_data/legacyPosts.json");
    const legacy = legacyPosts.map((p) => ({
      data: p,
      date: new Date(p.date),
      url: p.url,
      isLegacy: true,
    }));

    // Combine and sort by date descending
    const all = [...cmsPosts, ...legacy].sort((a, b) => {
      const dateA = a.date instanceof Date ? a.date : new Date(a.date);
      const dateB = b.date instanceof Date ? b.date : new Date(b.date);
      return dateB - dateA;
    });

    return all;
  });

  return {
    dir: {
      input: ".",
      output: "_site",
      includes: "_includes",
      data: "_data",
    },
    templateFormats: ["njk", "md"],
    htmlTemplateEngine: "njk",
    markdownTemplateEngine: "njk",
  };
};
