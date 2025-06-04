import { Request, Response, NextFunction } from 'express';

// Serialize BigInt values to strings in Express responses
export function bigIntSerializer() {
  return (_req: Request, res: Response, next: NextFunction) => {
    // Store the original json function
    const originalJson = res.json;
    
    // Override the json method
    res.json = function(body) {
      // Custom replacer function to convert BigInt to strings
      const replacer = (_key: string, value: any) => {
        if (typeof value === 'bigint') {
          return value.toString();
        }
        return value;
      };
      
      // Call the original json with serialized body
      return originalJson.call(this, JSON.parse(JSON.stringify(body, replacer)));
    };
    
    next();
  };
} 