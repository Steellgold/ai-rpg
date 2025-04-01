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
        }
        Insert: {
          abilities?: string[] | null
          age?: number | null
          background?: string | null
          backstory?: string | null
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
        }
        Update: {
          abilities?: string[] | null
          age?: number | null
          background?: string | null
          backstory?: string | null
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
          description: string | null
          id: string
          isCustomChoice: boolean
          isPersonalized: boolean
          loadingMessage: string | null
          sceneId: string
          text: string
        }
        Insert: {
          consequence?: string | null
          description?: string | null
          id: string
          isCustomChoice?: boolean
          isPersonalized?: boolean
          loadingMessage?: string | null
          sceneId: string
          text: string
        }
        Update: {
          consequence?: string | null
          description?: string | null
          id?: string
          isCustomChoice?: boolean
          isPersonalized?: boolean
          loadingMessage?: string | null
          sceneId?: string
          text?: string
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
      GameSave: {
        Row: {
          characterClass: string | null
          characterName: string
          currentSceneId: string
          id: string
          lastPlayed: string
          name: string
          notes: string | null
          progress: number
          storyId: string
          userId: string
        }
        Insert: {
          characterClass?: string | null
          characterName: string
          currentSceneId: string
          id: string
          lastPlayed?: string
          name?: string
          notes?: string | null
          progress?: number
          storyId: string
          userId: string
        }
        Update: {
          characterClass?: string | null
          characterName?: string
          currentSceneId?: string
          id?: string
          lastPlayed?: string
          name?: string
          notes?: string | null
          progress?: number
          storyId?: string
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
      SaveHistory: {
        Row: {
          choiceId: string | null
          gameSaveId: string
          id: string
          sceneId: string
          timestamp: string
        }
        Insert: {
          choiceId?: string | null
          gameSaveId: string
          id: string
          sceneId: string
          timestamp?: string
        }
        Update: {
          choiceId?: string | null
          gameSaveId?: string
          id?: string
          sceneId?: string
          timestamp?: string
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
          id: string
          imagePrompt: string | null
          imageUrl: string | null
          order: number
          storyId: string
          title: string
        }
        Insert: {
          content: string
          id: string
          imagePrompt?: string | null
          imageUrl?: string | null
          order?: number
          storyId: string
          title: string
        }
        Update: {
          content?: string
          id?: string
          imagePrompt?: string | null
          imageUrl?: string | null
          order?: number
          storyId?: string
          title?: string
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
          id: string
          role: string | null
          sceneId: string
        }
        Insert: {
          characterId: string
          id: string
          role?: string | null
          sceneId: string
        }
        Update: {
          characterId?: string
          id?: string
          role?: string | null
          sceneId?: string
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
      SceneTransition: {
        Row: {
          choiceId: string
          destinationSceneId: string
          id: string
          sourceSceneId: string
        }
        Insert: {
          choiceId: string
          destinationSceneId: string
          id: string
          sourceSceneId: string
        }
        Update: {
          choiceId?: string
          destinationSceneId?: string
          id?: string
          sourceSceneId?: string
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
          difficulty: Database["public"]["Enums"]["Difficulty"]
          genre: string[] | null
          goal: string
          id: string
          narrativeStyle: Database["public"]["Enums"]["NarrativeStyle"]
          possibleEndings: string[] | null
          synopsis: string
          title: string
          updatedAt: string
        }
        Insert: {
          coverImageUrl?: string | null
          createdAt?: string
          creatorId: string
          difficulty: Database["public"]["Enums"]["Difficulty"]
          genre?: string[] | null
          goal: string
          id: string
          narrativeStyle: Database["public"]["Enums"]["NarrativeStyle"]
          possibleEndings?: string[] | null
          synopsis: string
          title: string
          updatedAt: string
        }
        Update: {
          coverImageUrl?: string | null
          createdAt?: string
          creatorId?: string
          difficulty?: Database["public"]["Enums"]["Difficulty"]
          genre?: string[] | null
          goal?: string
          id?: string
          narrativeStyle?: Database["public"]["Enums"]["NarrativeStyle"]
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
        ]
      }
      User: {
        Row: {
          createdAt: string
          daily_limit_messages: number | null
          email: string
          id: string
          premium: boolean
          updatedAt: string
        }
        Insert: {
          createdAt?: string
          daily_limit_messages?: number | null
          email: string
          id: string
          premium?: boolean
          updatedAt: string
        }
        Update: {
          createdAt?: string
          daily_limit_messages?: number | null
          email?: string
          id?: string
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
      [_ in never]: never
    }
    Enums: {
      Difficulty: "Easy" | "Medium" | "Hard"
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
