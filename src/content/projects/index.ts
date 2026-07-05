// Backward-compatible entry point for `@/content/projects`. The real
// implementations live in src/content/live.ts (DB snapshot + seed fallback).
// Kept as a re-export so existing imports continue to work and this remains
// "the single seam" referenced in the project docs.
export {
  getAllProjects,
  getProjectBySlug,
  getFeaturedProjects,
  getArtProjects,
  getSiteContent,
} from '../live';
