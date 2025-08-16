const fs = require('fs');

const filesToFix = [
  'src/app/chat/page.tsx',
  'src/app/explore/communities/[id]/page.tsx', 
  'src/app/explore/communities/page.tsx',
  'src/app/explore/page.tsx',
  'src/app/explore/results/page.tsx'
];

filesToFix.forEach(file => {
  try {
    let content = fs.readFileSync(file, 'utf8');
    
    // Fix mismatched quotes: change '..."; to '...';
    content = content.replace(/from '([^']+)";/g, "from '$1';");
    
    fs.writeFileSync(file, content);
    console.log(`Fixed quotes in ${file}`);
  } catch (error) {
    console.error(`Error fixing ${file}:`, error.message);
  }
});

console.log('All quotes fixed!');