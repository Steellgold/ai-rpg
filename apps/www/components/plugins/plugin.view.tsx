"use client";

import React, { useState } from "react";
import Image from "next/image";
import { ArrowLeft, Heart, Star, Users, Download, Tag, Code, Info, Settings, PlayCircle, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import { getPluginGradient } from "@/lib/plugin-gradients";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { capitalizeFirstLetter } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { Component } from "@/lib/types/component";
import { UIPlugin } from "@/lib/actions/plugin-search";

const PluginCard: Component<{ children: React.ReactNode; title?: React.ReactNode; className?: string }> = ({
  children,
  title,
  className = ""
}) => {
  return (
    <div className={cn("bg-card rounded-lg border border-border overflow-hidden", className)}>
      {title && (
        <div className="px-4 py-3 border-b border-border flex items-center justify-between">
          {typeof title === "string" ? <h3 className="font-semibold text-sm">{title}</h3> : title}
        </div>
      )}
      <div className="px-4 py-3">
        {children}
      </div>
    </div>
  );
};

type PluginViewProps = {
  plugin: UIPlugin;
  relatedPlugins?: UIPlugin[];
  userCredits?: number;
  userId?: string;
  onClose: () => void;
  onAdd: (plugin: UIPlugin) => void;
  onRemove: (plugin: string) => void;
  onView: (plugin: UIPlugin) => void;
};

export const PluginView: React.FC<PluginViewProps> = ({
  plugin,
  relatedPlugins = [],
  userId,
  onClose,
  onAdd,
  onRemove,
  onView
}) => {


  const [isLiked, setIsLiked] = useState(plugin.likes?.some((like) => like.userId === userId) || false);
  const [likeCount, setLikeCount] = useState(plugin._count?.likes || 0);
  const createdAt = new Date(plugin.createdAt);
  const updatedAt = new Date(plugin.updatedAt);
  const updatedAtFormatted = formatDistanceToNow(updatedAt, { addSuffix: true });
  
  const gradientClasses = getPluginGradient(plugin.type);
  const gradientStyle = `bg-gradient-to-br ${gradientClasses}`;
  
  const getPriceDisplay = () => {
    if (plugin.pricing === "FREE") return "Gratuit";
    if (plugin.pricing === "CREDITS") return `${plugin.price} crédits`;
    return `${plugin.price}€`;
  };
  
  const handleLike = async () => {
    try {
      setIsLiked(!isLiked);
      setLikeCount(isLiked ? likeCount - 1 : likeCount + 1);
      
      const updatedPlugin = {
        ...plugin,
        isLiked: !isLiked,
        _count: {
          ...plugin._count,
          likes: isLiked ? likeCount - 1 : likeCount + 1
        }
      };
      
      if (isLiked) onRemove(plugin.id);
      else onAdd(updatedPlugin);
    } catch (error) {
      console.error("Error handling like:", error);
      setIsLiked(isLiked);
      setLikeCount(isLiked ? likeCount : likeCount);
    }
  };
  
  const rating = plugin.rating || 0;
  const reviewCount = (plugin.reviews || []).length || 0;

  return (
    <>
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b border-border">
        <div className="container mx-auto px-4 flex items-center h-14 max-w-screen-2xl">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onClose} 
            className="text-muted-foreground hover:bg-muted/50"
          >
            <ArrowLeft size={20} />
          </Button>
          <h2 className="text-lg font-semibold ml-2">{plugin.title}</h2>
        </div>
      </div>

      <div className={cn("w-full py-6", gradientStyle)}>
        <div className="container mx-auto px-4 max-w-screen-2xl">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <div className="w-20 h-20 rounded-md overflow-hidden flex items-center justify-center bg-white/10 border border-white/20">
              <p className="text-5xl select-none">{plugin.emoji}</p>
            </div>
            
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-bold text-white">{plugin.title}</h1>
                {plugin.isOfficial && <Badge variant="secondary" className="bg-blue-600/90 text-white border-none">Official</Badge>}
                {plugin.isFeatured && <Badge variant="secondary" className="bg-amber-500/90 text-white border-none">Featured</Badge>}
              </div>
              
              <div className="flex items-center mt-2 text-white/80">
                <span>By</span>
                <div className="flex items-center ml-2">
                  {plugin.author.image_url ? (
                    <Image
                      src={plugin.author.image_url} alt={plugin.author.display_name}
                      width={24} height={24}
                      className="rounded-full mr-2"
                    />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center mr-2">
                      <Users size={12} className="text-white" />
                    </div>
                  )}
                  <span>{plugin.author.display_name}</span>
                </div>
              </div>
            </div>
            
            <div className="flex gap-2 self-start mt-2 md:mt-0 md:self-center">
              <Button 
                size="lg"
                onClick={onAdd.bind(null, plugin)}
                className="bg-white text-black hover:bg-white/90 font-medium"
              >
                {plugin.pricing === "FREE" ? "Ajouter" : "Acheter"}
              </Button>
              <Button 
                size="lgIcon"
                variant={isLiked ? "default" : "outline"}
                onClick={handleLike}
                className={cn(
                  "border-white/20 bg-white/10 hover:bg-white/20",
                  isLiked && "bg-white/20 text-white"
                )}
              >
                <Heart size={20} className={isLiked ? "fill-white" : ""} />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 pb-16 pt-6 max-w-screen-2xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <PluginCard>
              <p className="text-foreground leading-relaxed">{plugin.description}</p>
              
              <div className="flex flex-wrap gap-2 mt-3">
                {plugin.tags.map((tag: any) => (
                  <Badge key={tag.id} variant="secondary" className="rounded-full">
                    {tag.name}
                  </Badge>
                ))}
              </div>
            </PluginCard>
            
            <div className="bg-card rounded-lg border border-border overflow-hidden">
              <Tabs defaultValue="description">
                <div className="border-b border-border">
                  <TabsList className="h-10 w-full justify-start rounded-none bg-transparent p-0">
                    <TabsTrigger
                      value="description" 
                      className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none h-10 px-4"
                    >
                      <Info size={16} className="mr-2" />
                      Description
                    </TabsTrigger>
                    <TabsTrigger 
                      value="configuration" 
                      className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none h-10 px-4"
                    >
                      <Settings size={16} className="mr-2" />
                      Configuration
                    </TabsTrigger>
                    <TabsTrigger 
                      value="usage" 
                      className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none h-10 px-4"
                    >
                      <PlayCircle size={16} className="mr-2" />
                      Utilisation
                    </TabsTrigger>
                    <TabsTrigger 
                      value="examples" 
                      className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none h-10 px-4"
                    >
                      <Code size={16} className="mr-2" />
                      Exemples
                    </TabsTrigger>
                    <TabsTrigger 
                      value="reviews" 
                      className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none h-10 px-4"
                    >
                      <MessageSquare size={16} className="mr-2" />
                      Avis ({reviewCount})
                    </TabsTrigger>
                  </TabsList>
                </div>
                <div className="px-4 py-3">
                  <TabsContent value="description" className="mt-0 pt-0">
                    {plugin.content ? (
                      <div dangerouslySetInnerHTML={{ __html: plugin.content }} />
                    ) : (
                      <p className="text-muted-foreground">Aucune description détaillée disponible.</p>
                    )}
                  </TabsContent>
                  <TabsContent value="configuration" className="mt-0 pt-0">
                    {plugin.configuration ? (
                      <div className="relative">
                        <pre className="bg-muted p-3 rounded-lg overflow-x-auto text-sm">
                          <code>{JSON.stringify(plugin.configuration, null, 2)}</code>
                        </pre>
                      </div>
                    ) : (
                      <p className="text-muted-foreground">Aucune configuration disponible.</p>
                    )}
                  </TabsContent>
                  <TabsContent value="usage" className="mt-0 pt-0">
                    <p className="text-muted-foreground">Documentation d&apos;utilisation en cours de préparation.</p>
                  </TabsContent>
                  <TabsContent value="examples" className="mt-0 pt-0">
                    {plugin.examples ? (
                      <div className="relative">
                        <pre className="bg-muted p-3 rounded-lg overflow-x-auto text-sm">
                          <code>{plugin.examples}</code>
                        </pre>
                      </div>
                    ) : (
                      <p className="text-muted-foreground">Aucun exemple disponible.</p>
                    )}
                  </TabsContent>
                  <TabsContent value="reviews" className="mt-0 pt-0">
                    <div className="space-y-4">
                      {reviewCount > 0 ? (
                        plugin.reviews.map((review: any) => (
                          <div key={review.id} className="space-y-2">
                            <div className="flex justify-between items-start">
                              <div className="flex items-center gap-2">
                                {review.user.image_url ? (
                                  <Image 
                                    src={review.user.image_url} 
                                    alt={review.user.display_name}
                                    width={32}
                                    height={32}
                                    className="rounded-full"
                                  />
                                ) : (
                                  <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                                    <Users size={14} />
                                  </div>
                                )}
                                <div>
                                  <p className="font-medium">{review.user.display_name}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {formatDistanceToNow(new Date(review.createdAt), { addSuffix: true, locale: fr })}
                                  </p>
                                </div>
                              </div>
                              <div className="flex">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star
                                    key={star}
                                    size={16}
                                    className={star <= review.rating ? "text-amber-500 fill-amber-500" : "text-muted-foreground"}
                                  />
                                ))}
                              </div>
                            </div>
                            {review.content && <p className="text-sm">{review.content}</p>}
                            <Separator className="mt-4" />
                          </div>
                        ))
                      ) : (
                        <div className="py-4 text-center">
                          <MessageSquare size={24} className="mx-auto text-muted-foreground mb-2" />
                          <p className="text-muted-foreground">Aucun avis pour le moment.</p>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                </div>
              </Tabs>
            </div>
          </div>
          
          {/* Sidebar */}
          <div className="space-y-4 lg:sticky lg:top-20">
            {/* Plugin information card */}
            <PluginCard title="Informations">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-sm text-muted-foreground">Prix</p>
                  <p className="font-medium">{getPriceDisplay()}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Type</p>
                  <div className={`inline-block px-2 py-1 rounded text-xs font-medium text-white ${gradientStyle}`}>
                    {capitalizeFirstLetter(plugin.type.toLowerCase())}
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Créé le</p>
                  <p className="font-medium">{createdAt.toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Mis à jour</p>
                  <p className="font-medium">{updatedAtFormatted}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Version</p>
                  <p className="font-medium">{plugin.version || "1.0.0"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Téléchargements</p>
                  <p className="font-medium">{plugin.downloads.toLocaleString()}</p>
                </div>
              </div>
            </PluginCard>
            
            {/* Statistics card */}
            <PluginCard title="Statistiques">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-muted/50 rounded-lg p-3 text-center">
                  <Download size={18} className="mx-auto mb-1 text-muted-foreground" />
                  <p className="text-lg font-bold">{plugin.downloads}</p>
                  <p className="text-xs text-muted-foreground">Téléchargements</p>
                </div>
                <div className="bg-muted/50 rounded-lg p-3 text-center">
                  <Heart size={18} className="mx-auto mb-1 text-muted-foreground" />
                  <p className="text-lg font-bold">{likeCount}</p>
                  <p className="text-xs text-muted-foreground">Likes</p>
                </div>
              </div>
              
              {/* Rating */}
              <div className="mt-3 bg-muted/50 rounded-lg p-3 text-center">
                <div className="flex justify-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      size={18}
                      className={star <= rating ? "text-amber-500 fill-amber-500" : "text-muted-foreground"}
                    />
                  ))}
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  {rating > 0 ? (
                    <>
                      <span className="font-medium">{rating.toFixed(1)}</span> sur 5 ({reviewCount} avis)
                    </>
                  ) : (
                    "Aucune évaluation"
                  )}
                </p>
              </div>
            </PluginCard>
            
            {(relatedPlugins || []).length > 0 && (
              <PluginCard title="Plugins similaires">
                <div className="divide-y divide-border -mx-4 -my-3">
                  {relatedPlugins.map((relatedPlugin) => {
                    const relatedGradient = getPluginGradient(relatedPlugin.type);
                    
                    return (
                      <button
                        key={relatedPlugin.id}
                        onClick={() => onView(relatedPlugin)}
                        className="flex items-center p-3 hover:bg-muted/50 transition-colors w-full text-left"
                      >
                        <div className={`w-8 h-8 rounded-md mr-3 ${relatedGradient}`}>
                          <p className="text-5xl select-none">{plugin.emoji}</p>
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate text-sm">{relatedPlugin.title}</p>
                          <div className="flex items-center text-xs text-muted-foreground">
                            <span className="truncate">{relatedPlugin.author.display_name}</span>
                            <span className="mx-1 text-muted-foreground/50">•</span>
                            {relatedPlugin.pricing === "FREE" ? (
                              <span>Gratuit</span>
                            ) : relatedPlugin.pricing === "CREDITS" ? (
                              <span>{relatedPlugin.price} crédits</span>
                            ) : (
                              <span>{relatedPlugin.price}€</span>
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </PluginCard>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default PluginView;