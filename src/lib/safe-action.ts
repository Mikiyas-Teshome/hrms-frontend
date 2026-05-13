export type ActionResult<T = void> = 
  | { success: true; data: T }
  | { success: false; error: string; code?: string };

export async function safeAction<T>(
  action: () => Promise<T>
): Promise<ActionResult<T>> {
  try {
    const data = await action();
    return { success: true, data };
  } catch (error: any) {
    const message = error instanceof Error ? error.message : "An unexpected error occurred";    
    return { 
      success: false, 
      error: message,
      code: error.code
    };
  }
}
