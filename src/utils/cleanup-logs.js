const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const logsDir = path.join(process.cwd(), 'logs');

const NODE_ENV = process.env.NODE_ENV;
const MAX_AGE_DAYS = NODE_ENV === 'production' ? 60 : 1;

function cleanupLogs() {
  console.log(`Starting log cleanup in ${NODE_ENV} environment...`);
  console.log(`Max age for deletion: ${MAX_AGE_DAYS} days`);
  console.log(`Looking for logs in: ${logsDir}`);
  
  if (!fs.existsSync(logsDir)) {
    console.log('Logs directory does not exist. Nothing to clean up.');
    return;
  }

  try {
    const now = Date.now();
    const files = fs.readdirSync(logsDir);
    
    console.log(`Found ${files.length} files in logs directory`);
    
    let deletedCount = 0;
    let errorCount = 0;
    let skippedCount = 0;
    
    files.forEach(file => {
      // Skip audit files
      if (file.includes('audit')) {
        console.log(`Skipping audit file: ${file}`);
        skippedCount++;
        return;
      }
      
      const filePath = path.join(logsDir, file);
      
      try {
        const stats = fs.statSync(filePath);
        const fileAgeDays = (now - stats.mtime.getTime()) / (1000 * 60 * 60 * 24);
        
        console.log(`File: ${file}, Age: ${fileAgeDays.toFixed(2)} days, Size: ${(stats.size / 1024).toFixed(2)} KB`);
        
        if (fileAgeDays > MAX_AGE_DAYS) {
          try {
            fs.unlinkSync(filePath);
            deletedCount++;
            console.log(`Successfully deleted: ${file} (${Math.floor(fileAgeDays)} days old)`);
          } catch (deleteErr) {
            errorCount++;
            console.error(`Error deleting ${file}: ${deleteErr.message}`);
          }
        } else {
          console.log(`File ${file} not old enough for deletion (${fileAgeDays.toFixed(2)} days < ${MAX_AGE_DAYS} days)`);
          skippedCount++;
        }
      } catch (statErr) {
        errorCount++;
        console.error(`Error accessing ${file}: ${statErr.message}`);
      }
    });
    
    console.log(`Cleanup complete: ${deletedCount} deleted, ${errorCount} errors, ${skippedCount} skipped`);
  } catch (err) {
    console.error(`Fatal error during cleanup: ${err.message}`);
  }
}

// Run the cleanup
cleanupLogs();

module.exports = cleanupLogs;
