export interface UserType {
  username: string;
  id: string;
  avatar_url: string;
  name: string;
  email: string;
  bio: string;
  role: string;
}

/**
 * Blog frontmatter model — mirrors the blog collection schema in
 * `.source/source.config.mjs` (content/blogs/*.mdx).
 */
export type BlogMeta = {
  title: string;
  description?: string;
  tags?: string[];
  thumbnail?: string;
  banner?: string;
  createdAt: string;
  updatedAt: string;
};

export type ExperienceType = {
  id: number;
  company: string;
  role: string;
  description?: string;
  companyUrl?: string;
  companyLogo?: string;
  location?: string;
  period: string;
  start: Date;
  end?: Date;
  created_at: Date;
  updated_at: Date;
};

export type EducationType = {
  id: number;
  school: string;
  degree: string;
  field: string;
  description?: string;
  period: string;
  start: Date;
  end?: Date;
  created_at: Date;
  updated_at: Date;
};

export interface CloudinaryFile {
  asset_id: string;
  public_id: string;
  format: string;
  version: number;
  resource_type: string;
  type: string;
  created_at: string;
  bytes: number;
  width: number;
  height: number;
  asset_folder: string;
  display_name: string;
  url: string;
  secure_url: string;
}

export interface CloudinaryFolder {
  __meta: {
    name: string;
    path: string;
  };
  files?: CloudinaryFile[];
  [key: string]: any;
}

export type TestimonialCategoryType =
  | "SOFTWARE_ENGINEER"
  | "GUESTBOOK"
  | "MENTOR";

export type TestimonialType = {
  id: number;
  quote: string;
  name: string;
  role: string;
  avatar: string;
  category: TestimonialCategoryType;
  order: number;
  createdAt: Date | string;
  updatedAt: Date | string;
};
