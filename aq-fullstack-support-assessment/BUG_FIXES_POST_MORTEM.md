# Bug Fixes Post-Mortem

## Overview

This document outlines the debugging process and solutions for three bugs reported in the emissions visualization application. The application consists of a backend API that fetches emission data from the FootPrint Network API and a frontend that displays this data in an animated chart.

## Bug 1: Chart Not Always Showing

**Description**: The chart does not consistently render when loading the frontend. The behavior is inconsistent - sometimes it shows, sometimes it doesn't.

### Root Cause

1. The frontend lacks proper loading state handling
2. No retry mechanism for failed API calls
3. No error boundaries to handle failed data fetching
4. The chart component only renders when data is available, without showing loading or error states

### Solution

1. Enhanced the data store (`dataStore.ts`) with:
   - Loading state tracking
   - Error state handling
   - Retry mechanism with exponential backoff
   - Proper state management for the fetched data

2. Modified the Home component to:
   - Show loading state while data is being fetched
   - Display error messages when data fetching fails
   - Implement proper error boundaries
   - Add retry functionality for failed requests

## Bug 2: Not Showing All Countries

**Description**: The chart only shows 8-10 countries instead of all 269 countries.

### Root Cause #2

1. The backend is filtering out countries in `seeds.controller.js`
2. The `SKIPPED_COUNTRIES` array in the configuration is unnecessarily excluding countries
3. The data transformation process might be dropping some countries

### Solution #2

1. Removed unnecessary country filtering in `seeds.controller.js`
2. Modified the data transformation process to ensure all countries are included
3. Added validation to ensure all countries are present in the final output

## Bug 3: Years Not Looping

**Description**: The chart should loop through years but keeps increasing beyond the last year (2025).

### Root Cause #3

1. The year increment logic in `Home.vue` doesn't properly handle the year range
2. The year comparison is using strict equality which might cause issues with type conversion
3. No validation of year boundaries

### Solution #3

1. Modified the year increment logic to properly handle the year range
2. Added proper type conversion for year comparison
3. Implemented boundary checking for years

## Testing

For each bug fix, we implemented the following tests:

1. **Bug 1 Tests**:
   - Test loading state transitions
   - Test error handling
   - Test retry mechanism
   - Test data persistence

2. **Bug 2 Tests**:
   - Test that all 269 countries are present
   - Test data transformation integrity
   - Test sorting functionality
   - Test data completeness

3. **Bug 3 Tests**:
   - Test year looping functionality
   - Test year boundary conditions
   - Test year increment/decrement
   - Test data consistency across year transitions
