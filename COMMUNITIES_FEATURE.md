# Communities Feature Documentation

## Overview
The Communities feature allows users to discover and share hidden cultural and natural places that are known primarily to locals. This feature encourages the preservation and sharing of cultural heritage and natural treasures.

## Features Implemented

### 🏛️ Community Places Page (`/explore/communities`)
- **Glass/Monochrome Design**: Follows the website's aesthetic with glassmorphism effects and monochrome styling
- **Responsive Grid Layout**: Adapts to different screen sizes with proper spacing
- **Category Filtering**: Filter places by Cultural, Natural, Historical, or Spiritual categories
- **Sorting Options**: Sort by newest, highest rated, or most saved
- **Real-time Statistics**: View counts, save counts, and ratings for each place

### 📝 Place Upload Form
- **Multi-step Process**: 4-step guided form for easy submission
  1. **Basic Info**: Name and category selection
  2. **Details**: Significance, interesting facts, and importance rating (1-10)
  3. **Location**: Address input with optional GPS coordinates
  4. **Photos**: Image upload with drag-and-drop support
- **Progress Tracking**: Visual progress indicator with step validation
- **Rich Input Options**: Multiple facts, rating slider, location detection

### 🔍 Place Detail Modal
- **Comprehensive View**: Full place information with image gallery
- **Interactive Elements**: Save button, view tracking, and author information
- **Responsive Design**: Works seamlessly on all device sizes

### 🛠️ Backend Integration
- **REST API**: Full CRUD operations for community places
- **Data Persistence**: In-memory storage (easily replaceable with database)
- **Real-time Updates**: Automatic view and save count tracking
- **Error Handling**: Graceful fallbacks and error management

## Key Components

### 1. PlaceUploadForm (`src/components/ui/place-upload-form.tsx`)
- Comprehensive form with file upload
- Step-by-step validation
- Glass morphism styling
- Geolocation integration

### 2. Communities API (`src/app/api/communities/route.ts`)
- GET: Fetch places with filtering and sorting
- POST: Create new places
- PATCH: Update place statistics (views, saves)

### 3. Communities Page (`src/app/explore/communities/page.tsx`)
- Main listing view with filters
- Card-based place display
- Modal detail view
- Loading states and error handling

## Data Structure

```typescript
interface CommunityPlace {
  id: string;
  name: string;
  significance: string;
  facts: string[];
  location: {
    lat?: number;
    lng?: number;
    address: string;
  };
  images: string[];
  rating: number; // 1-10 scale for preservation importance
  saves: number;
  views: number;
  author: {
    name: string;
    avatar: string;
  };
  dateAdded: Date;
  category: 'cultural' | 'natural' | 'historical' | 'spiritual';
}
```

## Design Philosophy

### Glass/Monochrome Aesthetics
- **Backdrop Blur**: Consistent use of `backdrop-blur-md` for glass effects
- **Semi-transparent Backgrounds**: White/black overlays with opacity for depth
- **Border Styling**: Subtle borders with `border-white/20` for definition
- **Typography**: Clean, system fonts for readability
- **Color Palette**: Minimal use of color, primarily black, white, and subtle accents

### User Experience
- **Progressive Disclosure**: Information revealed step-by-step
- **Visual Feedback**: Hover states, loading animations, and transitions
- **Accessibility**: Proper contrast ratios and keyboard navigation
- **Mobile-first**: Responsive design that works on all devices

## Navigation Integration
- Added quick access link from main explore page
- Appears after the intro animation completes
- Consistent with existing navigation patterns

## Future Enhancements
- [ ] Database integration (MongoDB/PostgreSQL)
- [ ] User authentication and profiles
- [ ] Image upload to cloud storage
- [ ] Advanced search and filtering
- [ ] Map view integration
- [ ] Community moderation features
- [ ] Social features (comments, likes)
- [ ] Offline support with PWA capabilities

## Technical Notes
- Built with Next.js 14 and TypeScript
- Uses Framer Motion for animations
- Tailwind CSS for styling
- Lucide React for icons
- Responsive design with mobile-first approach

## Usage
1. Navigate to `/explore/communities`
2. Browse existing places or click "Add Place"
3. Fill out the multi-step form to share a hidden place
4. Click on any place card to view detailed information
5. Use filters and sorting to find specific types of places