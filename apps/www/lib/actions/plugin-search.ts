"use server"

import { getPluginGradient } from "@/lib/plugin-gradients";
import { prisma as db } from "@imagine/database/prisma";
import { PluginType, Pricing, Prisma } from "@imagine/database/prisma-client";
import { PluginType as UIPluginType, Pricing as UIPricing } from "@imagine/types/plugin";

export type SearchPluginsParams = {
  query?: string
  type?: UIPluginType
  pricing?: UIPricing
  authorId?: string
  featured?: boolean
  tags?: string[]
  limit?: number
  offset?: number
}

export type UIPlugin = {
  id: string
  title: string
  description: string
  icon: string | React.ReactNode
  author: {
    id: string
    name: string
    image_url?: string
  }
  likes: number
  downloads: number
  type: UIPluginType
  isOfficial: boolean
  featured?: boolean
  pricing?: string
  creditPrice: number | null | undefined
  dollarPrice: number | null | undefined
  usageCredits: number | null | undefined
  tags?: Array<{ id: string; name: string }>
  gradientColors: string
}

export const searchPlugins = async ({
  query = "", type, pricing,
  authorId, featured = false,
  tags = [], limit = 20, offset = 0
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
    
    if (query) {
      where.OR = [
        { title: { contains: query, mode: "insensitive" } },
        { description: { contains: query, mode: "insensitive" } },
      ]
    }
    
    if (type) where.type = type as unknown as PluginType
    if (pricing) where.pricing = pricing as unknown as Pricing
    if (authorId) where.authorId = authorId
    if (featured) where.featured = true

    if (tags.length > 0) {
      where.tags = { some: { name: { in: tags } } }
    }
    
    const [plugins, total] = await Promise.all([
      db.plugin.findMany({
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
          }
        },
        orderBy: [
          { featured: "desc" },
          { downloads: "desc" }
        ],
        skip: offset,
        take: limit
      }),
      db.plugin.count({ where })
    ])
    
    const formattedPlugins: UIPlugin[] = plugins.map(plugin => ({
      id: plugin.id,
      title: plugin.title,
      description: plugin.description,
      icon: plugin.icon || "🧩",
      author: {
        id: plugin.author.id,
        name: plugin.author.display_name,
        image_url: plugin.author.image_url || undefined
      },
      likes: plugin._count.likes,
      downloads: plugin.downloads,
      type: plugin.type as unknown as UIPluginType,
      isOfficial: plugin.isOfficial,
      featured: plugin.featured,
      pricing: plugin.pricing as unknown as string,
      creditPrice: plugin.creditPrice || null,
      euroPrice: plugin.dollarPrice || null,
      usageCredits: plugin.usageCredits || null,
      tags: plugin.tags,
      gradientColors: getPluginGradient(plugin.type as unknown as UIPluginType || UIPluginType.NARRATIVE)
    }))
    
    return {
      plugins: formattedPlugins,
      total,
      pageCount: Math.ceil(total / limit)
    }
    
  } catch (error) {
    console.error("Error while searching plugins:", error)
    throw new Error("Failed to search plugins")
  }
}