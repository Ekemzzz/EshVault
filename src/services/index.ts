//
//  Database service layer.
//  
//  All functions talk to Supabase through the single typed `supabase` client
//  (see src/lib/supabase.ts). Because RLS is enforced server-side, the same
//  client is safe to use in the browser with only the public anon key: no
//  secret key is ever imported here.
//  
export * as extensionsService from './extensions.service'
export * as contentService from './content.service'
export * as taxonomyService from './taxonomy.service'
export * as storageService from './storage.service'
export * as authService from './auth.service'
export * as savedService from './saved.service'
export { DatabaseError, unwrap } from './errors'
export { mapPublishedExtension } from './mappers'
