import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export const uploadFoodPhoto = async (file, userId) => {
  const fileName = `${userId}/${Date.now()}-${file.name}`
  const { data, error } = await supabase.storage.from('food-photos').upload(fileName, file)
  if (error) throw error
  const { data: urlData } = supabase.storage.from('food-photos').getPublicUrl(fileName)
  return urlData.publicUrl
}
