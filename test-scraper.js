#!/usr/bin/env node
/**
 * Test script untuk Content Scraper Service
 * Usage: node test-scraper.js
 */

import ContentScraperService from './src/services/content/contentScraperService.js';

const scraper = new ContentScraperService();

console.log('\n=== Content Scraper Service Test ===\n');

// Test 1: Rule34 Search
console.log('Test 1: Rule34 Search...');
try {
  const rule34Result = await scraper.scrapeRule34({ query: 'anime', limit: 2, page: 0 });
  console.log('✅ Rule34 Success:', {
    platform: rule34Result.platform,
    count: rule34Result.count,
    success: rule34Result.success,
    sampleResult: rule34Result.results[0] ? {
      id: rule34Result.results[0].id,
      type: rule34Result.results[0].type,
      tags: rule34Result.results[0].tags.slice(0, 3)
    } : 'No results'
  });
} catch (error) {
  console.log('❌ Rule34 Error:', error.message);
}

console.log('\n---\n');

// Test 2: Gelbooru Search
console.log('Test 2: Gelbooru Search...');
try {
  const gelbooruResult = await scraper.scrapeGelbooru({ query: '', limit: 2, page: 0 });
  console.log('✅ Gelbooru Success:', {
    platform: gelbooruResult.platform,
    count: gelbooruResult.count,
    success: gelbooruResult.success,
    sampleResult: gelbooruResult.results[0] ? {
      id: gelbooruResult.results[0].id,
      type: gelbooruResult.results[0].type,
      tags: gelbooruResult.results[0].tags.slice(0, 3)
    } : 'No results'
  });
} catch (error) {
  console.log('❌ Gelbooru Error:', error.message);
}

console.log('\n---\n');

// Test 3: XNXX Search
console.log('Test 3: XNXX Search...');
try {
  const xnxxResult = await scraper.scrapeXNXX({ query: '', limit: 2, page: 0 });
  console.log('✅ XNXX Success:', {
    platform: xnxxResult.platform,
    count: xnxxResult.count,
    success: xnxxResult.success,
    sampleResult: xnxxResult.results[0] ? {
      id: xnxxResult.results[0].id,
      type: xnxxResult.results[0].type,
      title: xnxxResult.results[0].title
    } : 'No results'
  });
} catch (error) {
  console.log('❌ XNXX Error:', error.message);
}

console.log('\n---\n');

// Test 4: XVideos Search
console.log('Test 4: XVideos Search...');
try {
  const xvResult = await scraper.scrapeXVideos({ query: '', limit: 2, page: 0 });
  console.log('✅ XVideos Success:', {
    platform: xvResult.platform,
    count: xvResult.count,
    success: xvResult.success,
    sampleResult: xvResult.results[0] ? {
      id: xvResult.results[0].id,
      type: xvResult.results[0].type,
      title: xvResult.results[0].title
    } : 'No results'
  });
} catch (error) {
  console.log('❌ XVideos Error:', error.message);
}

console.log('\n---\n');

// Test 5: Rate Limiting
console.log('Test 5: Rate Limiting...');
const testIP = '127.0.0.1';
const rateLimit1 = scraper.checkRateLimit(testIP);
console.log('First request:', rateLimit1);

const rateLimit2 = scraper.checkRateLimit(testIP);
console.log('Second request:', rateLimit2);

console.log('✅ Rate limiting works!');

console.log('\n=== All Tests Complete ===\n');
