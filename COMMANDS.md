# 🚀 Enhanced Explore API - Command Guide

## ✅ FIXED ISSUES:
- ✅ Nominatim connection errors with timeout & fallbacks
- ✅ Image URL typos in synthesis agent
- ✅ Better error handling for geocoding
- ✅ Server startup automation

## 🖥️ START SERVER:

### Kill any existing server:
```bash
pkill -f "uvicorn.*main:app" || true
```

### Start the server:
```bash
source /Users/yashwanthkrishna/Desktop/Projects/ibm/backend/myenv/bin/activate && cd /Users/yashwanthkrishna/Desktop/Projects/ibm/backend/explore && uvicorn main:app --host 0.0.0.0 --port 8002 --reload
```

## 🌐 TEST FRONTEND URLS:

### With search queries:
- http://localhost:3000/explore/results?q=temples%20in%20warangal
- http://localhost:3000/explore/results?q=Red%20Fort%20Delhi  
- http://localhost:3000/explore/results?q=Ajanta%20Caves
- http://localhost:3000/explore/results?q=Thousand%20Pillar%20Temple

## 🔧 TEST API DIRECTLY:

### Health check:
```bash
curl -s http://localhost:8002/health | jq
```

### API test:
```bash
curl -s -X POST http://localhost:8002/explore -H "Content-Type: application/json" -d '{"query":"temples in warangal"}' | jq '.result.items[0] | {title, coordinates, image}'
```

## 🐛 DEBUG BROWSER ISSUES:

1. **Open browser console** (F12 → Console)
2. **Check for logs**: "Search term:", "Making API call:", "API response"
3. **Network tab**: Check if API calls are successful (200 status)
4. **Application tab**: Check if location permissions are granted

## ✅ EXPECTED BEHAVIOR:

- **No more "Failed to fetch"** errors
- **Unique coordinates** for each temple/place
- **Real images** from Wikipedia, tourism sites
- **Working Street View 360°** with agent coordinates
- **Graceful fallbacks** when Nominatim fails
- **Clear error messages** in console

## 🔥 FEATURES WORKING:

✅ **Agent-discovered coordinates** (unique for each place)
✅ **Real images** from multiple sources  
✅ **Enhanced error handling** with timeouts
✅ **Google Geocoding fallback** when Nominatim fails
✅ **Street View integration** with real coordinates
✅ **Console debugging** for troubleshooting

The system is now production-ready! 🎉