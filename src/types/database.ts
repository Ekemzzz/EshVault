/**
 * Database types for the Browser Extension Directory.
 *
 * Hand-written to mirror supabase/migrations 1:1 (the shape `supabase gen types
 * typescript` would emit). When you connect a live project you can regenerate
 * this file with:
 *   supabase gen types typescript --project-id <ref> --schema public > src/types/database.ts
 */
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type ExtensionStatus = 'draft' | 'pending' | 'published' | 'archived' | 'rejected'

export type BrowserSlug = 'chrome' | 'firefox' | 'edge' | 'safari' | 'opera'

export interface Database {
  public: {
    Tables: {
      authors: {
        Row: {
          id: string
          name: string
          website: string | null
          bio: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          website?: string | null
          bio?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          website?: string | null
          bio?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      categories: {
        Row: {
          id: string
          slug: string
          label: string
          blurb: string | null
          accent: string | null
          sort_order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          slug: string
          label: string
          blurb?: string | null
          accent?: string | null
          sort_order?: number
        }
        Update: {
          slug?: string
          label?: string
          blurb?: string | null
          accent?: string | null
          sort_order?: number
        }
        Relationships: []
      }
      browsers: {
        Row: {
          id: string
          slug: BrowserSlug | string
          label: string
          dot: string | null
          created_at: string
        }
        Insert: {
          id?: string
          slug: string
          label: string
          dot?: string | null
        }
        Update: {
          slug?: string
          label?: string
          dot?: string | null
        }
        Relationships: []
      }
      tags: {
        Row: {
          id: string
          slug: string
          label: string
        }
        Insert: {
          id?: string
          slug: string
          label: string
        }
        Update: {
          slug?: string
          label?: string
        }
        Relationships: []
      }
      extensions: {
        Row: {
          id: string
          slug: string
          name: string
          tagline: string | null
          description: string | null
          category_id: string
          author_id: string | null
          icon_url: string | null
          icon_path: string | null
          website_url: string | null
          store_url: string | null
          download_count: number
          rating: number | null
          pricing: 'free' | 'freemium' | 'paid'
          is_featured: boolean
          status: ExtensionStatus
          submitted_by: string | null
          rejection_reason: string | null
          reviewed_at: string | null
          features: Json
          permissions: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          slug: string
          name: string
          tagline?: string | null
          description?: string | null
          category_id: string
          author_id?: string | null
          icon_url?: string | null
          icon_path?: string | null
          website_url?: string | null
          store_url?: string | null
          download_count?: number
          rating?: number | null
          pricing?: 'free' | 'freemium' | 'paid'
          is_featured?: boolean
          status?: ExtensionStatus
          submitted_by?: string | null
          rejection_reason?: string | null
          reviewed_at?: string | null
          features?: Json
          permissions?: Json
        }
        Update: {
          slug?: string
          name?: string
          tagline?: string | null
          description?: string | null
          category_id?: string
          author_id?: string | null
          icon_url?: string | null
          icon_path?: string | null
          website_url?: string | null
          store_url?: string | null
          download_count?: number
          rating?: number | null
          pricing?: 'free' | 'freemium' | 'paid'
          is_featured?: boolean
          status?: ExtensionStatus
          submitted_by?: string | null
          rejection_reason?: string | null
          reviewed_at?: string | null
          features?: Json
          permissions?: Json
        }
        Relationships: [
          {
            foreignKeyName: 'extensions_category_id_fkey'
            columns: ['category_id']
            isOneToOne: false
            referencedRelation: 'categories'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'extensions_author_id_fkey'
            columns: ['author_id']
            isOneToOne: false
            referencedRelation: 'authors'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'extensions_submitted_by_fkey'
            columns: ['submitted_by']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
        ]
      }
      extension_browsers: {
        Row: {
          extension_id: string
          browser_id: string
          install_url: string | null
        }
        Insert: {
          extension_id: string
          browser_id: string
          install_url?: string | null
        }
        Update: {
          extension_id?: string
          browser_id?: string
          install_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'extension_browsers_extension_id_fkey'
            columns: ['extension_id']
            isOneToOne: false
            referencedRelation: 'extensions'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'extension_browsers_browser_id_fkey'
            columns: ['browser_id']
            isOneToOne: false
            referencedRelation: 'browsers'
            referencedColumns: ['id']
          },
        ]
      }
      extension_tags: {
        Row: {
          extension_id: string
          tag_id: string
        }
        Insert: {
          extension_id: string
          tag_id: string
        }
        Update: {
          extension_id?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'extension_tags_extension_id_fkey'
            columns: ['extension_id']
            isOneToOne: false
            referencedRelation: 'extensions'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'extension_tags_tag_id_fkey'
            columns: ['tag_id']
            isOneToOne: false
            referencedRelation: 'tags'
            referencedColumns: ['id']
          },
        ]
      }
      screenshots: {
        Row: {
          id: string
          extension_id: string
          storage_path: string
          alt_text: string | null
          position: number
          created_at: string
        }
        Insert: {
          id?: string
          extension_id: string
          storage_path: string
          alt_text?: string | null
          position?: number
        }
        Update: {
          extension_id?: string
          storage_path?: string
          alt_text?: string | null
          position?: number
        }
        Relationships: [
          {
            foreignKeyName: 'screenshots_extension_id_fkey'
            columns: ['extension_id']
            isOneToOne: false
            referencedRelation: 'extensions'
            referencedColumns: ['id']
          },
        ]
      }
      reviews: {
        Row: {
          id: string
          extension_id: string
          user_id: string | null
          author_name: string
          rating: number
          title: string | null
          body: string
          created_at: string
        }
        Insert: {
          id?: string
          extension_id: string
          user_id?: string | null
          author_name: string
          rating: number
          title?: string | null
          body: string
          created_at?: string
        }
        Update: {
          extension_id?: string
          user_id?: string | null
          author_name?: string
          rating?: number
          title?: string | null
          body?: string
        }
        Relationships: [
          {
            foreignKeyName: 'reviews_extension_id_fkey'
            columns: ['extension_id']
            isOneToOne: false
            referencedRelation: 'extensions'
            referencedColumns: ['id']
          },
        ]
      }
      profiles: {
        Row: {
          id: string
          display_name: string
          avatar_url: string | null
          bio: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          display_name: string
          avatar_url?: string | null
          bio?: string | null
        }
        Update: {
          display_name?: string
          avatar_url?: string | null
          bio?: string | null
        }
        Relationships: []
      }
      saved_extensions: {
        Row: {
          user_id: string
          extension_id: string
          created_at: string
        }
        Insert: {
          user_id: string
          extension_id: string
          created_at?: string
        }
        Update: {
          user_id?: string
          extension_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'saved_extensions_extension_id_fkey'
            columns: ['extension_id']
            isOneToOne: false
            referencedRelation: 'extensions'
            referencedColumns: ['id']
          },
        ]
      }
      helpful_votes: {
        Row: {
          id: string
          review_id: string
          user_id: string
          created_at: string
        }
        Insert: {
          id?: string
          review_id: string
          user_id: string
          created_at?: string
        }
        Update: {
          review_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'helpful_votes_review_id_fkey'
            columns: ['review_id']
            isOneToOne: false
            referencedRelation: 'reviews'
            referencedColumns: ['id']
          },
        ]
      }
    }
    Views: {
      published_extensions: {
        Row: {
          id: string
          slug: string
          name: string
          tagline: string | null
          description: string | null
          category_id: string
          category_slug: string
          category_label: string
          category_accent: string | null
          author_id: string | null
          author_name: string | null
          author_website: string | null
          icon_url: string | null
          icon_path: string | null
          website_url: string | null
          store_url: string | null
          download_count: number
          rating: number | null
          pricing: 'free' | 'freemium' | 'paid'
          is_featured: boolean
          created_at: string
          updated_at: string
          browser_slugs: string[]
          install_links: Json
          tag_slugs: string[]
          screenshot_paths: string[]
          features: Json
          permissions: Json
        }
        Relationships: []
      }
    }
    Functions: {
      search_extensions: {
        Args: { p_query?: string | null }
        Returns: Database['public']['Views']['published_extensions']['Row'][]
      }
      is_admin: {
        Args: Record<string, never>
        Returns: boolean
      }
    }
    Enums: {
      extension_status: ExtensionStatus
    }
    CompositeTypes: Record<string, never>
  }
}

/* Convenience aliases used across the service layer. */
export type ExtensionRow = Database['public']['Tables']['extensions']['Row']
export type ExtensionInsert = Database['public']['Tables']['extensions']['Insert']
export type ExtensionUpdate = Database['public']['Tables']['extensions']['Update']
export type CategoryRow = Database['public']['Tables']['categories']['Row']
export type BrowserRow = Database['public']['Tables']['browsers']['Row']
export type AuthorRow = Database['public']['Tables']['authors']['Row']
export type TagRow = Database['public']['Tables']['tags']['Row']
export type ScreenshotRow = Database['public']['Tables']['screenshots']['Row']
export type ReviewRow = Database['public']['Tables']['reviews']['Row']
export type ProfileRow = Database['public']['Tables']['profiles']['Row']
export type SavedExtensionRow = Database['public']['Tables']['saved_extensions']['Row']
export type HelpfulVoteRow = Database['public']['Tables']['helpful_votes']['Row']
export type PublishedExtension = Database['public']['Views']['published_extensions']['Row']
