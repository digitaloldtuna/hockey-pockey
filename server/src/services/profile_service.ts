import { updateProfile } from '../models/profiles';
import { supabaseAdmin } from '../supabase';

const supabase = supabaseAdmin();

export const updateProfileService = async (
  userId: string,
  context: { file?: Express.Multer.File; name: string; email: string; colour?: string }
) => {
  let profileImageUrl: string | null = null;

  if (context.file) {
    // Upload the file to Supabase Storage
    const fileExt = context.file.originalname.split('.').pop();
    const fileName = `${userId}-${Date.now()}.${fileExt}`;
    const { error: uploadError } = await supabase.storage
      .from('profile')
      .upload(fileName, context.file.buffer, {
        contentType: context.file.mimetype,
        cacheControl: '3600',
        upsert: true,
      });

    if (uploadError) throw uploadError;

    // Get the public URL
    const { data: publicUrlData } = supabase.storage.from('profile').getPublicUrl(fileName);
    profileImageUrl = publicUrlData.publicUrl;
  }

  // Build the data object for database update
  const dataToUpdate: any = { name: context.name };
  if (context.colour !== undefined && context.colour !== '') {
    // only accept a plain #rrggbb value
    if (!/^#[0-9a-fA-F]{6}$/.test(context.colour)) {
      throw Error('colour must be a hex value like #ff9767');
    }
    dataToUpdate.colour = context.colour.toLowerCase();
  }
  if (profileImageUrl) dataToUpdate.profileImage = profileImageUrl;

  const updatedProfile = await updateProfile({ userId, profile: dataToUpdate });
  return updatedProfile;
};
