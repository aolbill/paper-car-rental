# Google Maps API Setup Instructions

## Current Status
⚠️ **Google Maps API key is not configured**

The application is currently using a fallback text input for location selection. To enable full Google Maps functionality with interactive maps and autocomplete, you need to set up a Google Maps API key.

## Steps to Set Up Google Maps API

### 1. Create a Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Note your project ID

### 2. Enable Required APIs
Enable these APIs in your Google Cloud Console:
- **Maps JavaScript API**
- **Places API** 
- **Geocoding API**

Navigate to: APIs & Services > Library, then search and enable each API.

### 3. Create API Key
1. Go to APIs & Services > Credentials
2. Click "Create Credentials" > "API Key"
3. Copy your API key

### 4. Restrict API Key (Recommended)
1. Click on your API key to edit it
2. Under "Application restrictions":
   - Select "HTTP referrers (web sites)"
   - Add your domain (e.g., `localhost:3000/*` for development)
3. Under "API restrictions":
   - Select "Restrict key"
   - Choose: Maps JavaScript API, Places API, Geocoding API

### 5. Update Environment Variable
Set your API key in the environment:
```bash
VITE_GOOGLE_MAPS_API_KEY=your-actual-api-key-here
```

### 6. Restart Development Server
After setting the API key, restart your development server for changes to take effect.

## Current Fallback Behavior
Without a valid API key, the application:
- ✅ Still allows location input via text fields
- ✅ Processes location data for bookings
- ❌ No interactive maps
- ❌ No autocomplete suggestions
- ❌ No map-based location selection

## Cost Information
- Google Maps APIs have a generous free tier
- First $200/month of usage is free
- Typical car rental app usage will likely stay within free limits

## Troubleshooting
If you're still seeing errors after setup:
1. Verify all three APIs are enabled
2. Check API key restrictions
3. Ensure the key is properly set in environment variables
4. Restart the development server
5. Check browser console for specific error messages

## Security Note
Never commit your API key to version control. Always use environment variables for sensitive credentials.
