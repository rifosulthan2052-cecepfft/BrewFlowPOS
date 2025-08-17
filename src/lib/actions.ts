
'use server';

import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

const inviteUserSchema = z.object({
    email: z.string().email(),
    shop_id: z.string().uuid(),
});

export async function inviteUser(input: { email: string; shop_id: string }) {
    try {
        const { email, shop_id } = inviteUserSchema.parse(input);

        // Ensure you use the service role key for admin actions
        const supabaseAdmin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!,
            {
                auth: {
                    autoRefreshToken: false,
                    persistSession: false
                }
            }
        );

        const redirectTo = `${process.env.NEXT_PUBLIC_SITE_URL}?type=invite`;

        // Invite the user by email.
        const { data: inviteData, error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
            redirectTo: redirectTo,
        });

        if (inviteError) {
            // Handle case where user already exists
            if (inviteError.message.includes('User already registered')) {
                 const { data: { users }, error: getUserError } = await supabaseAdmin.auth.admin.listUsers({ email });
                 if(getUserError || users.length === 0) {
                    throw new Error("User already exists, but could not retrieve user details.");
                 }
                 const user = users[0];

                 // Check if user is already a member of ANY shop
                 const { data: existingMembership, error: memberCheckError } = await supabaseAdmin
                    .from('shop_members')
                    .select('shop_id')
                    .eq('user_id', user.id)
                    .limit(1);
                
                 if (memberCheckError) throw new Error(`Failed to check existing memberships: ${memberCheckError.message}`);

                 if (existingMembership && existingMembership.length > 0) {
                     if(existingMembership[0].shop_id === shop_id) {
                        throw new Error('This user is already a member of your shop.');
                     } else {
                        throw new Error('This user is already a member of another shop.');
                     }
                 }
                
                // If user exists but is not in any shop, add them to this one.
                const { error: insertError } = await supabaseAdmin
                    .from('shop_members')
                    .insert({ shop_id: shop_id, user_id: user.id });

                if (insertError) {
                    throw new Error(`Failed to add existing user to shop: ${insertError.message}`);
                }
                
                // Resend invitation so they can log in
                const { error: resendError } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
                    redirectTo: redirectTo,
                });

                if(resendError) throw new Error(`Failed to resend invitation: ${resendError.message}`);

                return { success: true, message: 'Existing user added to your shop and invitation resent.' };
            }
            throw new Error(`Failed to invite user: ${inviteError.message}`);
        }
        
        if (!inviteData.user) {
            throw new Error("Invitation sent, but no user object was returned.");
        }

        const invitedUser = inviteData.user;

        // Explicitly set user_metadata after creation
        const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
            invitedUser.id,
            { user_metadata: { password_set: false } }
        );

        if (updateError) {
             // Clean up by deleting the invited user if metadata update fails
            await supabaseAdmin.auth.admin.deleteUser(invitedUser.id);
            throw new Error(`Failed to set user metadata: ${updateError.message}`);
        }


        // Add the invited user to the shop_members table
        const { error: insertError } = await supabaseAdmin
            .from('shop_members')
            .insert({ shop_id: shop_id, user_id: invitedUser.id });

        if (insertError) {
            // Clean up by deleting the invited user if insert fails
            await supabaseAdmin.auth.admin.deleteUser(invitedUser.id);
            throw new Error(`Failed to add user to shop: ${insertError.message}`);
        }

        return { success: true, message: 'Invitation sent successfully.' };

    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
