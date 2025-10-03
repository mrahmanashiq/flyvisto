const fs = require('fs').promises;
const path = require('path');
const { Logger } = require('../config');

/**
 * Server Logs Service
 * Provides log file reading and filtering capabilities for QA testing
 */

class ServerLogsService {
  constructor() {
    this.logDirectory = process.env.LOG_DIRECTORY || 'logs';
    this.maxLines = 1000; // Maximum lines to return
    this.defaultLines = 100; // Default lines to return
  }

  /**
   * Get log files in the log directory
   */
  async getLogFiles() {
    try {
      const files = await fs.readdir(this.logDirectory);
      const logFiles = files
        .filter((file) => file.endsWith('.log'))
        .map((file) => ({
          name: file,
          path: path.join(this.logDirectory, file),
          size: 0, // Will be populated when reading
        }));

      // Get file sizes
      for (const file of logFiles) {
        try {
          const stats = await fs.stat(file.path);
          file.size = stats.size;
          file.lastModified = stats.mtime;
        } catch (_error) {
          Logger.warn('Could not get stats for log file', {
            file: file.name,
            error: _error.message,
          });
        }
      }

      return logFiles;
    } catch (error) {
      Logger.error('Error reading log directory', { error: error.message });
      return [];
    }
  }

  /**
   * Read log file with filtering options
   */
  async readLogFile(filename, options = {}) {
    const {
      lines = this.defaultLines,
      level = null,
      dateFrom = null,
      dateTo = null,
      search = null,
      reverse = false,
    } = options;

    try {
      const filePath = path.join(this.logDirectory, filename);

      // Check if file exists
      try {
        await fs.access(filePath);
      } catch {
        throw new Error(`Log file ${filename} not found`);
      }

      // Read file content
      const content = await fs.readFile(filePath, 'utf8');
      let logLines = content.split('\n').filter((line) => line.trim() !== '');

      // Apply filters
      if (level) {
        logLines = logLines.filter(
          (line) =>
            line.toLowerCase().includes(`"level":"${level.toLowerCase()}"`) ||
            line.toLowerCase().includes(`level: ${level.toLowerCase()}`),
        );
      }

      if (dateFrom) {
        const fromDate = new Date(dateFrom);
        logLines = logLines.filter((line) => {
          const timestamp = this.extractTimestamp(line);
          return timestamp && timestamp >= fromDate;
        });
      }

      if (dateTo) {
        const toDate = new Date(dateTo);
        logLines = logLines.filter((line) => {
          const timestamp = this.extractTimestamp(line);
          return timestamp && timestamp <= toDate;
        });
      }

      if (search) {
        const searchLower = search.toLowerCase();
        logLines = logLines.filter((line) =>
          line.toLowerCase().includes(searchLower),
        );
      }

      // Reverse if requested (newest first)
      if (reverse) {
        logLines = logLines.reverse();
      }

      // Limit lines
      const limitedLines = logLines.slice(-lines);

      return {
        filename,
        totalLines: logLines.length,
        returnedLines: limitedLines.length,
        lines: limitedLines,
        filters: {
          level,
          dateFrom,
          dateTo,
          search,
          reverse,
        },
      };
    } catch (error) {
      Logger.error('Error reading log file', {
        filename,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Extract timestamp from log line
   */
  extractTimestamp(line) {
    try {
      // Try to parse JSON log format first
      const jsonMatch = line.match(/"timestamp":"([^"]+)"/);
      if (jsonMatch) {
        return new Date(jsonMatch[1]);
      }

      // Try to parse standard log format
      const timestampMatch = line.match(
        /^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z)/,
      );
      if (timestampMatch) {
        return new Date(timestampMatch[1]);
      }

      // Try to parse other common formats
      const otherMatch = line.match(/(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2})/);
      if (otherMatch) {
        return new Date(otherMatch[1]);
      }

      return null;
    } catch {
      return null;
    }
  }

  /**
   * Get log statistics
   */
  async getLogStats(filename) {
    try {
      const filePath = path.join(this.logDirectory, filename);
      const content = await fs.readFile(filePath, 'utf8');
      const lines = content.split('\n').filter((line) => line.trim() !== '');

      const stats = {
        totalLines: lines.length,
        levels: {},
        dateRange: {
          earliest: null,
          latest: null,
        },
      };

      // Analyze log levels and date range
      for (const line of lines) {
        // Count log levels
        const levelMatch = line.match(/"level":"([^"]+)"/);
        if (levelMatch) {
          const level = levelMatch[1];
          stats.levels[level] = (stats.levels[level] || 0) + 1;
        }

        // Track date range
        const timestamp = this.extractTimestamp(line);
        if (timestamp) {
          if (
            !stats.dateRange.earliest ||
            timestamp < stats.dateRange.earliest
          ) {
            stats.dateRange.earliest = timestamp;
          }
          if (!stats.dateRange.latest || timestamp > stats.dateRange.latest) {
            stats.dateRange.latest = timestamp;
          }
        }
      }

      return stats;
    } catch (error) {
      Logger.error('Error getting log stats', {
        filename,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Search across all log files
   */
  async searchAllLogs(searchTerm, options = {}) {
    const { lines = 50 } = options;

    try {
      const logFiles = await this.getLogFiles();
      const results = [];

      for (const file of logFiles) {
        try {
          const fileResults = await this.readLogFile(file.name, {
            ...options,
            search: searchTerm,
            lines: Math.min(lines, 100), // Limit per file
          });

          if (fileResults.lines.length > 0) {
            results.push({
              filename: file.name,
              matches: fileResults.lines.length,
              lines: fileResults.lines,
            });
          }
        } catch (error) {
          Logger.warn('Error searching in log file', {
            file: file.name,
            error: error.message,
          });
        }
      }

      return {
        searchTerm,
        totalMatches: results.reduce((sum, result) => sum + result.matches, 0),
        files: results,
      };
    } catch (error) {
      Logger.error('Error searching logs', { error: error.message });
      throw error;
    }
  }
}

module.exports = new ServerLogsService();
