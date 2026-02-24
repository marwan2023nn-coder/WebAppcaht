export function isValidBase64(str: string): boolean {
    try {
      return btoa(atob(str)) === str;
    } catch (err) {
      return false;
    }
  }
  
  export function formatBase64Image(base64String: string): string {
    // Remove potential data URL prefix if it exists
    const base64Data = base64String.replace(/^data:image\/\w+;base64,/, '');
    
    // Add data URL prefix if it's missing
    if (isValidBase64(base64Data)) {
      return `data:image/png;base64,${base64Data}`;
    }
    
    return base64String;
  }