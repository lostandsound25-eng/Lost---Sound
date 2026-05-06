/** @type {import('next').NextConfig} */
const nextConfig = {
  /* 
     We removed the rewrites that were causing the 502 error.
     The blog is now handled directly by the React pages in /app/blog.
  */
};

module.exports = nextConfig;
