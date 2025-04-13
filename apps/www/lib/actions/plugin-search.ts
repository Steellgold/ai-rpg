"use server"

import { prisma } from "@imagine/database/prisma";
import { PluginType, Pricing, Prisma } from "@imagine/database/prisma-client";

export type SearchPluginsParams = {
  query?: string;
  type?: PluginType;
  pricing?: Pricing;
  authorId?: string;
  featured?: boolean;
  tags?: string[];
  limit?: number;
  offset?: number;
  liked?: boolean;
}

export type UIPlugin = Prisma.PluginGetPayload<{
  include: {
    _count: {
      select: { likes: true }
    },
    author: {
      select: {
        id: true;
        display_name: true;
        image_url: true
      }
    },
    tags: {
      select: {
        id: true;
        name: true
      }
    },
    likes: {
      select: {
        id: true;
        userId: true
      }
    }
  }
}>

export const searchPlugins = async ({
  query = "", type, pricing,
  authorId, featured = false,
  tags = [], limit = 20, offset = 0, liked = false
}: SearchPluginsParams): Promise<{
  plugins: UIPlugin[];
  total: number;
  pageCount: number
}> => {
  try {
    const where: Prisma.PluginWhereInput = {
      approved: true,
      status: "APPROVED",
    }

    if (liked) {
      where.likes = {
        some: {
          userId: authorId,
        }
      }
    }
    
    if (query) {
      where.OR = [
        { title: { contains: query, mode: "insensitive" } },
        { description: { contains: query, mode: "insensitive" } },
      ]
    }
    
    if (type) where.type = type as unknown as PluginType
    if (pricing) where.pricing = pricing as unknown as Pricing
    if (authorId) where.authorId = authorId
    if (featured) where.isFeatured = true

    if (tags.length > 0) {
      where.tags = { some: { name: { in: tags } } }
    }
    
    const [plugins, total] = await Promise.all([
      prisma.plugin.findMany({
        where,
        include: {
          author: {
            select: {
              id: true,
              display_name: true,
              image_url: true
            }
          },
          tags: {
            select: {
              id: true,
              name: true
            }
          },
          _count: {
            select: {
              likes: true
            }
          },
          likes: {
            select: {
              id: true,
              userId: true
            }
          }
        },
        orderBy: [
          { isFeatured: "desc" },
          { downloads: "desc" }
        ],
        skip: offset,
        take: limit
      }),
      prisma.plugin.count({ where })
    ])
    
    return {
      plugins,
      total,
      pageCount: Math.ceil(total / limit)
    }
    
  } catch (error) {
    console.error("Error while searching plugins:", error)
    throw new Error("Failed to search plugins")
  }
}

export const countLikedPlugins = async (userId?: string): Promise<number> => {
  if (!userId) return 0;
  
  try {
    const count = await prisma.pluginLike.count({
      where: {
        userId: userId,
        plugin: {
          approved: true,
          status: "APPROVED"
        }
      }
    });
    
    return count;
  } catch (error) {
    console.error("Error counting liked plugins:", error);
    return 0;
  }
}