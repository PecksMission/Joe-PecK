module.exports = {
  layout: "layouts/post.njk",
  tags: ["post"],
  eleventyComputed: {
    permalink: (data) => `/${data.page.fileSlug}.html`,
  },
};
