export default function handleSupabaseErrors(data: any, error: any) {
  if (error) {
    throw new Error(error.message);
  }
}
