export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          operationName?: string
          query?: string
          variables?: Json
          extensions?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      _prisma_migrations: {
        Row: {
          applied_steps_count: number
          checksum: string
          finished_at: string | null
          id: string
          logs: string | null
          migration_name: string
          rolled_back_at: string | null
          started_at: string
        }
        Insert: {
          applied_steps_count?: number
          checksum: string
          finished_at?: string | null
          id: string
          logs?: string | null
          migration_name: string
          rolled_back_at?: string | null
          started_at?: string
        }
        Update: {
          applied_steps_count?: number
          checksum?: string
          finished_at?: string | null
          id?: string
          logs?: string | null
          migration_name?: string
          rolled_back_at?: string | null
          started_at?: string
        }
        Relationships: []
      }
      Character: {
        Row: {
          abilities: string[] | null
          age: number | null
          background: string | null
          backstory: string | null
          createdAt: string
          description: string
          flaws: string | null
          id: string
          imageUrl: string | null
          isMain: boolean
          motivations: string | null
          name: string
          outfit: string | null
          personality: string | null
          relationships: string[] | null
          storyId: string
          updatedAt: string
        }
        Insert: {
          abilities?: string[] | null
          age?: number | null
          background?: string | null
          backstory?: string | null
          createdAt?: string
          description: string
          flaws?: string | null
          id: string
          imageUrl?: string | null
          isMain?: boolean
          motivations?: string | null
          name: string
          outfit?: string | null
          personality?: string | null
          relationships?: string[] | null
          storyId: string
          updatedAt?: string
        }
        Update: {
          abilities?: string[] | null
          age?: number | null
          background?: string | null
          backstory?: string | null
          createdAt?: string
          description?: string
          flaws?: string | null
          id?: string
          imageUrl?: string | null
          isMain?: boolean
          motivations?: string | null
          name?: string
          outfit?: string | null
          personality?: string | null
          relationships?: string[] | null
          storyId?: string
          updatedAt?: string
        }
        Relationships: [
          {
            foreignKeyName: "Character_storyId_fkey"
            columns: ["storyId"]
            isOneToOne: false
            referencedRelation: "Story"
            referencedColumns: ["id"]
          },
        ]
      }
      Choice: {
        Row: {
          consequence: string | null
          createdAt: string
          description: string | null
          id: string
          isCustomChoice: boolean
          isItemRelated: boolean
          isPersonalized: boolean
          loadingMessage: string | null
          sceneId: string
          text: string
          updatedAt: string
        }
        Insert: {
          consequence?: string | null
          createdAt?: string
          description?: string | null
          id: string
          isCustomChoice?: boolean
          isItemRelated?: boolean
          isPersonalized?: boolean
          loadingMessage?: string | null
          sceneId: string
          text: string
          updatedAt?: string
        }
        Update: {
          consequence?: string | null
          createdAt?: string
          description?: string | null
          id?: string
          isCustomChoice?: boolean
          isItemRelated?: boolean
          isPersonalized?: boolean
          loadingMessage?: string | null
          sceneId?: string
          text?: string
          updatedAt?: string
        }
        Relationships: [
          {
            foreignKeyName: "Choice_sceneId_fkey"
            columns: ["sceneId"]
            isOneToOne: false
            referencedRelation: "Scene"
            referencedColumns: ["id"]
          },
        ]
      }
      ChoiceItem: {
        Row: {
          choiceId: string
          consumed: boolean
          createdAt: string
          id: string
          itemId: string
          updatedAt: string
        }
        Insert: {
          choiceId: string
          consumed?: boolean
          createdAt?: string
          id: string
          itemId: string
          updatedAt?: string
        }
        Update: {
          choiceId?: string
          consumed?: boolean
          createdAt?: string
          id?: string
          itemId?: string
          updatedAt?: string
        }
        Relationships: [
          {
            foreignKeyName: "ChoiceItem_choiceId_fkey"
            columns: ["choiceId"]
            isOneToOne: false
            referencedRelation: "Choice"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ChoiceItem_itemId_fkey"
            columns: ["itemId"]
            isOneToOne: false
            referencedRelation: "Item"
            referencedColumns: ["id"]
          },
        ]
      }
      GameSave: {
        Row: {
          characterClass: string | null
          characterName: string
          createdAt: string
          currentSceneId: string
          id: string
          lastPlayed: string
          name: string
          notes: string | null
          progress: number
          storyId: string
          updatedAt: string
          userId: string
        }
        Insert: {
          characterClass?: string | null
          characterName: string
          createdAt?: string
          currentSceneId: string
          id: string
          lastPlayed?: string
          name?: string
          notes?: string | null
          progress?: number
          storyId: string
          updatedAt?: string
          userId: string
        }
        Update: {
          characterClass?: string | null
          characterName?: string
          createdAt?: string
          currentSceneId?: string
          id?: string
          lastPlayed?: string
          name?: string
          notes?: string | null
          progress?: number
          storyId?: string
          updatedAt?: string
          userId?: string
        }
        Relationships: [
          {
            foreignKeyName: "GameSave_storyId_fkey"
            columns: ["storyId"]
            isOneToOne: false
            referencedRelation: "Story"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "GameSave_userId_fkey"
            columns: ["userId"]
            isOneToOne: false
            referencedRelation: "User"
            referencedColumns: ["id"]
          },
        ]
      }
      InventoryItem: {
        Row: {
          createdAt: string
          gameSaveId: string
          id: string
          isBroken: boolean
          isEquipped: boolean
          itemId: string
          quantity: number
          remainingUses: number | null
          updatedAt: string
        }
        Insert: {
          createdAt?: string
          gameSaveId: string
          id: string
          isBroken?: boolean
          isEquipped?: boolean
          itemId: string
          quantity?: number
          remainingUses?: number | null
          updatedAt?: string
        }
        Update: {
          createdAt?: string
          gameSaveId?: string
          id?: string
          isBroken?: boolean
          isEquipped?: boolean
          itemId?: string
          quantity?: number
          remainingUses?: number | null
          updatedAt?: string
        }
        Relationships: [
          {
            foreignKeyName: "InventoryItem_gameSaveId_fkey"
            columns: ["gameSaveId"]
            isOneToOne: false
            referencedRelation: "GameSave"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "InventoryItem_itemId_fkey"
            columns: ["itemId"]
            isOneToOne: false
            referencedRelation: "Item"
            referencedColumns: ["id"]
          },
        ]
      }
      Item: {
        Row: {
          brokenImageUrl: string | null
          createdAt: string
          description: string
          durability: number | null
          effect: string | null
          id: string
          imageUrl: string | null
          isBroken: boolean
          last_mentioned_in: string | null
          name: string
          rarity: Database["public"]["Enums"]["ItemRarity"]
          storyId: string
          type: Database["public"]["Enums"]["ItemType"]
          updatedAt: string
          usage_count: number | null
          useCount: number | null
        }
        Insert: {
          brokenImageUrl?: string | null
          createdAt?: string
          description: string
          durability?: number | null
          effect?: string | null
          id: string
          imageUrl?: string | null
          isBroken?: boolean
          last_mentioned_in?: string | null
          name: string
          rarity?: Database["public"]["Enums"]["ItemRarity"]
          storyId: string
          type?: Database["public"]["Enums"]["ItemType"]
          updatedAt?: string
          usage_count?: number | null
          useCount?: number | null
        }
        Update: {
          brokenImageUrl?: string | null
          createdAt?: string
          description?: string
          durability?: number | null
          effect?: string | null
          id?: string
          imageUrl?: string | null
          isBroken?: boolean
          last_mentioned_in?: string | null
          name?: string
          rarity?: Database["public"]["Enums"]["ItemRarity"]
          storyId?: string
          type?: Database["public"]["Enums"]["ItemType"]
          updatedAt?: string
          usage_count?: number | null
          useCount?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "Item_storyId_fkey"
            columns: ["storyId"]
            isOneToOne: false
            referencedRelation: "Story"
            referencedColumns: ["id"]
          },
        ]
      }
      Job: {
        Row: {
          completedAt: string | null
          createdAt: string
          error: string | null
          id: string
          input: Json
          output: Json | null
          progress: number
          stage: Database["public"]["Enums"]["JobStage"] | null
          startedAt: string | null
          status: Database["public"]["Enums"]["JobStatus"]
          storyId: string | null
          updatedAt: string
          userId: string
        }
        Insert: {
          completedAt?: string | null
          createdAt?: string
          error?: string | null
          id: string
          input: Json
          output?: Json | null
          progress?: number
          stage?: Database["public"]["Enums"]["JobStage"] | null
          startedAt?: string | null
          status?: Database["public"]["Enums"]["JobStatus"]
          storyId?: string | null
          updatedAt?: string
          userId: string
        }
        Update: {
          completedAt?: string | null
          createdAt?: string
          error?: string | null
          id?: string
          input?: Json
          output?: Json | null
          progress?: number
          stage?: Database["public"]["Enums"]["JobStage"] | null
          startedAt?: string | null
          status?: Database["public"]["Enums"]["JobStatus"]
          storyId?: string | null
          updatedAt?: string
          userId?: string
        }
        Relationships: [
          {
            foreignKeyName: "Job_storyId_fkey"
            columns: ["storyId"]
            isOneToOne: false
            referencedRelation: "Story"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Job_userId_fkey"
            columns: ["userId"]
            isOneToOne: false
            referencedRelation: "User"
            referencedColumns: ["id"]
          },
        ]
      }
      SaveHistory: {
        Row: {
          choiceId: string | null
          createdAt: string
          gameSaveId: string
          id: string
          sceneId: string
          timestamp: string
          updatedAt: string
        }
        Insert: {
          choiceId?: string | null
          createdAt?: string
          gameSaveId: string
          id: string
          sceneId: string
          timestamp?: string
          updatedAt?: string
        }
        Update: {
          choiceId?: string | null
          createdAt?: string
          gameSaveId?: string
          id?: string
          sceneId?: string
          timestamp?: string
          updatedAt?: string
        }
        Relationships: [
          {
            foreignKeyName: "SaveHistory_choiceId_fkey"
            columns: ["choiceId"]
            isOneToOne: false
            referencedRelation: "Choice"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "SaveHistory_gameSaveId_fkey"
            columns: ["gameSaveId"]
            isOneToOne: false
            referencedRelation: "GameSave"
            referencedColumns: ["id"]
          },
        ]
      }
      Scene: {
        Row: {
          content: string
          createdAt: string
          diceRoll: number | null
          id: string
          imagePrompt: string | null
          imageUrl: string | null
          order: number
          selected_choice_id: string | null
          storyId: string
          title: string
          updatedAt: string
        }
        Insert: {
          content: string
          createdAt?: string
          diceRoll?: number | null
          id: string
          imagePrompt?: string | null
          imageUrl?: string | null
          order?: number
          selected_choice_id?: string | null
          storyId: string
          title: string
          updatedAt?: string
        }
        Update: {
          content?: string
          createdAt?: string
          diceRoll?: number | null
          id?: string
          imagePrompt?: string | null
          imageUrl?: string | null
          order?: number
          selected_choice_id?: string | null
          storyId?: string
          title?: string
          updatedAt?: string
        }
        Relationships: [
          {
            foreignKeyName: "Scene_storyId_fkey"
            columns: ["storyId"]
            isOneToOne: false
            referencedRelation: "Story"
            referencedColumns: ["id"]
          },
        ]
      }
      SceneCharacter: {
        Row: {
          characterId: string
          createdAt: string
          id: string
          role: string | null
          sceneId: string
          updatedAt: string
        }
        Insert: {
          characterId: string
          createdAt?: string
          id: string
          role?: string | null
          sceneId: string
          updatedAt?: string
        }
        Update: {
          characterId?: string
          createdAt?: string
          id?: string
          role?: string | null
          sceneId?: string
          updatedAt?: string
        }
        Relationships: [
          {
            foreignKeyName: "SceneCharacter_characterId_fkey"
            columns: ["characterId"]
            isOneToOne: false
            referencedRelation: "Character"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "SceneCharacter_sceneId_fkey"
            columns: ["sceneId"]
            isOneToOne: false
            referencedRelation: "Scene"
            referencedColumns: ["id"]
          },
        ]
      }
      SceneItem: {
        Row: {
          createdAt: string
          id: string
          isHidden: boolean
          itemId: string
          sceneId: string
          updatedAt: string
        }
        Insert: {
          createdAt?: string
          id: string
          isHidden?: boolean
          itemId: string
          sceneId: string
          updatedAt?: string
        }
        Update: {
          createdAt?: string
          id?: string
          isHidden?: boolean
          itemId?: string
          sceneId?: string
          updatedAt?: string
        }
        Relationships: [
          {
            foreignKeyName: "SceneItem_itemId_fkey"
            columns: ["itemId"]
            isOneToOne: false
            referencedRelation: "Item"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "SceneItem_sceneId_fkey"
            columns: ["sceneId"]
            isOneToOne: false
            referencedRelation: "Scene"
            referencedColumns: ["id"]
          },
        ]
      }
      SceneTransition: {
        Row: {
          choiceId: string
          createdAt: string
          destinationSceneId: string
          id: string
          sourceSceneId: string
          updatedAt: string
        }
        Insert: {
          choiceId: string
          createdAt?: string
          destinationSceneId: string
          id: string
          sourceSceneId: string
          updatedAt?: string
        }
        Update: {
          choiceId?: string
          createdAt?: string
          destinationSceneId?: string
          id?: string
          sourceSceneId?: string
          updatedAt?: string
        }
        Relationships: [
          {
            foreignKeyName: "SceneTransition_choiceId_fkey"
            columns: ["choiceId"]
            isOneToOne: false
            referencedRelation: "Choice"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "SceneTransition_destinationSceneId_fkey"
            columns: ["destinationSceneId"]
            isOneToOne: false
            referencedRelation: "Scene"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "SceneTransition_sourceSceneId_fkey"
            columns: ["sourceSceneId"]
            isOneToOne: false
            referencedRelation: "Scene"
            referencedColumns: ["id"]
          },
        ]
      }
      Story: {
        Row: {
          coverImageUrl: string | null
          createdAt: string
          creatorId: string
          current_scene: number | null
          current_scene_id: string | null
          forkedFromId: string | null
          genre: string[] | null
          goal: string
          hasItems: boolean
          id: string
          isChildrenStory: boolean
          isPublic: boolean
          max_scenes: number | null
          narrativeStyle: Database["public"]["Enums"]["NarrativeStyle"]
          notes: string | null
          possibleEndings: string[] | null
          synopsis: string
          title: string
          updatedAt: string
        }
        Insert: {
          coverImageUrl?: string | null
          createdAt?: string
          creatorId: string
          current_scene?: number | null
          current_scene_id?: string | null
          forkedFromId?: string | null
          genre?: string[] | null
          goal: string
          hasItems?: boolean
          id: string
          isChildrenStory?: boolean
          isPublic?: boolean
          max_scenes?: number | null
          narrativeStyle: Database["public"]["Enums"]["NarrativeStyle"]
          notes?: string | null
          possibleEndings?: string[] | null
          synopsis: string
          title: string
          updatedAt?: string
        }
        Update: {
          coverImageUrl?: string | null
          createdAt?: string
          creatorId?: string
          current_scene?: number | null
          current_scene_id?: string | null
          forkedFromId?: string | null
          genre?: string[] | null
          goal?: string
          hasItems?: boolean
          id?: string
          isChildrenStory?: boolean
          isPublic?: boolean
          max_scenes?: number | null
          narrativeStyle?: Database["public"]["Enums"]["NarrativeStyle"]
          notes?: string | null
          possibleEndings?: string[] | null
          synopsis?: string
          title?: string
          updatedAt?: string
        }
        Relationships: [
          {
            foreignKeyName: "Story_creatorId_fkey"
            columns: ["creatorId"]
            isOneToOne: false
            referencedRelation: "User"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Story_forkedFromId_fkey"
            columns: ["forkedFromId"]
            isOneToOne: false
            referencedRelation: "Story"
            referencedColumns: ["id"]
          },
        ]
      }
      User: {
        Row: {
          createdAt: string
          daily_limit_messages: number | null
          display_name: string
          email: string
          id: string
          image_url: string | null
          premium: boolean
          updatedAt: string
        }
        Insert: {
          createdAt?: string
          daily_limit_messages?: number | null
          display_name?: string
          email: string
          id: string
          image_url?: string | null
          premium?: boolean
          updatedAt?: string
        }
        Update: {
          createdAt?: string
          daily_limit_messages?: number | null
          display_name?: string
          email?: string
          id?: string
          image_url?: string | null
          premium?: boolean
          updatedAt?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_user:
        | {
            Args: {
              id: string
              email: string
            }
            Returns: undefined
          }
        | {
            Args: {
              id: string
              email: string
              display_name?: string
              image_url?: string
            }
            Returns: undefined
          }
    }
    Enums: {
      ItemRarity: "COMMON" | "UNCOMMON" | "RARE" | "EPIC" | "LEGENDARY"
      ItemType:
        | "WEAPON"
        | "ARMOR"
        | "POTION"
        | "KEY"
        | "TOOL"
        | "DOCUMENT"
        | "QUEST"
        | "MISC"
      JobStage:
        | "INITIALIZED"
        | "GENERATING_STORY"
        | "CREATING_STORY"
        | "CREATING_MAIN_CHARS"
        | "CREATING_SEC_CHARS"
        | "CREATING_FIRST_SCENE"
        | "GENERATING_BANNER"
        | "UPLOADING_BANNER"
        | "GENERATING_SCENE_IMG"
        | "UPLOADING_SCENE_IMG"
        | "FINALIZING"
        | "GENERATING_ITEMS"
      JobStatus: "PENDING" | "RUNNING" | "COMPLETED" | "FAILED"
      NarrativeStyle: "FirstPerson" | "SecondPerson" | "ThirdPerson"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
