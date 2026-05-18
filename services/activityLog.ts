import { supabase } from './supabase';

export type LogAction =
  | 'login'
  | 'logout'
  | 'report_submitted'
  | 'report_downloaded'
  | 'report_reviewed'
  | 'factory_assigned'
  | 'user_created'
  | 'user_deleted';

export async function logActivity(
  action: LogAction,
  details?: string,
) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: profile } = await supabase
      .from('profiles')
      .select('officer_id, role, region')
      .eq('id', user.id)
      .single();

    if (!profile) return;

    await supabase.from('activity_logs').insert({
      user_id: user.id,
      officer_id: profile.officer_id,
      role: profile.role,
      region: profile.region,
      action,
      details,
    });
  } catch (_) {
    // Silently fail — never block the user action
  }
}
