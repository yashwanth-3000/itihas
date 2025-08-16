const fs = require('fs');
const path = require('path');

// Map of files and their needed relative path depth
const importMappings = {
  // App pages need to go up to src
  'src/app/page.tsx': '../',
  'src/app/layout.tsx': '../',
  'src/app/chat/page.tsx': '../../',
  'src/app/explore/page.tsx': '../../',
  'src/app/explore/results/page.tsx': '../../../',
  'src/app/explore/communities/page.tsx': '../../../',
  'src/app/explore/communities/[id]/page.tsx': '../../../../',
  
  // Components need to go up to src
  'src/components/ui/animated-hero.tsx': '../../',
  'src/components/ui/filter-badge.tsx': '../../',
  'src/components/ui/model-selector.tsx': '../../',
  'src/components/ui/label.tsx': '../../',
  'src/components/ui/auth-modal.tsx': '../../',
  'src/components/ui/animated-testimonials.tsx': '../../',
  'src/components/ui/dialog.tsx': '../../',
  'src/components/ui/button.tsx': '../../',
  'src/components/ui/tubelight-navbar.tsx': '../../',
  'src/components/ui/theme-toggle.tsx': '../../',
  'src/components/ui/input.tsx': '../../',
  'src/components/ui/agent-plan.tsx': '../../',
};

function fixImports() {
  for (const [filePath, relativePath] of Object.entries(importMappings)) {
    try {
      let content = fs.readFileSync(filePath, 'utf8');
      
      // Replace @/components with relative path
      content = content.replace(
        /from ['"]@\/components\//g, 
        `from '${relativePath}components/`
      );
      
      // Replace @/contexts with relative path  
      content = content.replace(
        /from ['"]@\/contexts\//g,
        `from '${relativePath}contexts/`
      );
      
      // Replace @/lib with relative path
      content = content.replace(
        /from ['"]@\/lib\//g,
        `from '${relativePath}lib/`
      );
      
      fs.writeFileSync(filePath, content);
      console.log(`Fixed imports in ${filePath}`);
    } catch (error) {
      console.error(`Error processing ${filePath}:`, error.message);
    }
  }
}

fixImports();
console.log('All imports fixed!');