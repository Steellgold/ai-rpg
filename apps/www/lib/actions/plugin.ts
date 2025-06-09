"use server"

import { revalidatePath } from "next/cache";
import { auth } from "../supabase/auth";
import { prisma } from "@imagine/database/prisma";
import { Prisma } from "@imagine/database/prisma-client";

export const fetchPluginDetails = async(pluginId: string) => {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    const plugin = await prisma.plugin.findUnique({
      where: {
        id: pluginId,
        OR: [
          { approved: true },
          { authorId: userId }
        ]
      },
      include: {
        _count: {
          select: {
            likes: true
          },
        },
        author: {
          select: {
            id: true,
            display_name: true,
            image_url: true
          },
        },
        tags: {
          select: {
            id: true,
            name: true
          },
        },
        reviews: {
          orderBy: {
            createdAt: "desc",
          },
          select: {
            id: true,
            content: true,
            rating: true,
            createdAt: true,
            user: {
              select: {
                id: true,
                display_name: true,
                image_url: true,
              },
            },
          },
        },
      },
    });

    if (!plugin) {
      throw new Error("Plugin not found or not accessible");
    }

    const relatedPlugins = await prisma.plugin.findMany({
      where: {
        id: { not: pluginId },
        approved: true,
        OR: [
          { type: plugin.type },
          {
            tags: {
              some: {
                id: {
                  in: plugin.tags.map(tag => tag.id)
                }
              }
            }
          }
        ]
      },
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
        { isFeatured: "desc" },
        { downloads: "desc" }
      ],
      take: 5 // Limit to 5 related plugins
    });

    let isPurchased = false;
    let isLiked = false;
    let userCredits = 0;

    if (userId) {
      const purchase = await prisma.pluginPurchase.findUnique({
        where: {
          pluginId_userId: {
            pluginId: plugin.id,
            userId,
          },
        },
      });

      isPurchased = !!purchase;

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { credits: true },
      });

      userCredits = user?.credits || 0;

      const like = await prisma.pluginLike.findUnique({
        where: {
          pluginId_userId: {
            pluginId: plugin.id,
            userId,
          },
        },
      });

      isLiked = !!like;
    }

    await prisma.plugin.update({
      where: { id: plugin.id },
      data: { views: { increment: 1 } },
    });

    return {
      plugin: {
        ...plugin,
        isPurchased,
        isLiked,
      },
      relatedPlugins,
      userCredits,
    };
  } catch (error) {
    console.error("Error fetching plugin details:", error);
    throw new Error("Failed to load plugin details");
  }
}

export type RelatedPlugin = Prisma.PluginGetPayload<{
  include: {
    author: {
      select: {
        id: true;
        display_name: true;
        image_url: true;
      };
    };
    tags: {
      select: {
        id: true;
        name: true;
      };
    };
    _count: {
      select: {
        likes: true;
      };
    };
  };
}>;

export type FetchRelatedPluginsResult = RelatedPlugin[];

export const fetchRelatedPlugins = async(pluginId: string): Promise<FetchRelatedPluginsResult> => {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    const referencePlugin = await prisma.plugin.findUnique({
      where: {
        id: pluginId,
        OR: [
          { approved: true },
          { authorId: userId }
        ]
      },
      select: {
        type: true,
        tags: {
          select: {
            id: true
          }
        }
      }
    });

    if (!referencePlugin) {
      throw new Error("Plugin not found or not accessible");
    }

    const relatedPlugins = await prisma.plugin.findMany({
      where: {
        id: { not: pluginId },
        approved: true,
        OR: [
          { type: referencePlugin.type },
          {
            tags: {
              some: {
                id: {
                  in: referencePlugin.tags.map(tag => tag.id)
                }
              }
            }
          }
        ]
      },
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
        { isFeatured: "desc" },
        { downloads: "desc" }
      ],
      take: 5
    });

    return relatedPlugins;
  } catch (error) {
    console.error("Error fetching related plugins:", error);
    throw new Error("Failed to load related plugins");
  }
}

export const likePlugin = async(pluginId: string) => {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return { success: false, error: "Authentication required" };
    }

    const existingLike = await prisma.pluginLike.findUnique({
      where: {
        pluginId_userId: {
          pluginId,
          userId,
        },
      },
    });

    if (existingLike) {
      await prisma.pluginLike.delete({
        where: {
          pluginId_userId: {
            pluginId,
            userId,
          },
        },
      });
    } else {
      await prisma.pluginLike.create({
        data: {
          pluginId,
          userId,
        },
      });
    }

    const likeCount = await prisma.pluginLike.count({
      where: { pluginId },
    });

    revalidatePath(`/plugin/${pluginId}`);
    return { success: true, liked: !existingLike, likeCount };
  } catch (error) {
    console.error("Error liking plugin:", error);
    return { success: false, error: "Failed to process like action" };
  }
}

export const addReview = async(options: { pluginId: string; rating: number; content: string | null }) => {
  try {
    const { pluginId, rating, content } = options;
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return { success: false, error: "Authentication required" };
    }

    const existingReview = await prisma.review.findUnique({
      where: {
        pluginId_userId: {
          pluginId,
          userId,
        },
      },
    });

    if (existingReview) {
      const updatedReview = await prisma.review.update({
        where: {
          pluginId_userId: {
            pluginId,
            userId,
          },
        },
        data: {
          rating,
          content,
        },
        include: {
          user: {
            select: {
              id: true,
              display_name: true,
              image_url: true,
            },
          },
        },
      });

      await updatePluginRating(pluginId);

      revalidatePath(`/plugin/${pluginId}`);
      return { success: true, review: updatedReview };
    }

    const newReview = await prisma.review.create({
      data: {
        pluginId,
        userId,
        rating,
        content,
      },
      include: {
        user: {
          select: {
            id: true,
            display_name: true,
            image_url: true,
          },
        },
      },
    });

    await updatePluginRating(pluginId);

    revalidatePath(`/plugin/${pluginId}`);
    return { success: true, review: newReview };
  } catch (error) {
    console.error("Error adding review:", error);
    return { success: false, error: "Failed to add review" };
  }
}

const updatePluginRating = async (pluginId: string) => {
  const reviews = await prisma.review.findMany({
    where: { pluginId },
    select: { rating: true },
  });

  if (reviews.length === 0) {
    await prisma.plugin.update({
      where: { id: pluginId },
      data: { rating: null },
    });
    return;
  }

  const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
  const averageRating = totalRating / reviews.length;

  await prisma.plugin.update({
    where: { id: pluginId },
    data: { rating: averageRating },
  });
}