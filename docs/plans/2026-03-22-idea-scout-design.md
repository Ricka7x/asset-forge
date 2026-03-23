# Idea Scout - Project Design

## Overview
**Idea Scout** is a CLI tool that scrapes multiple online sources (Reddit, Google Trends, Hacker News, Twitter, GitHub) to discover project ideas and generates comprehensive markdown reports with ranked suggestions.

## Goals
- Provide developers with curated project ideas from trending discussions
- Automate idea discovery across multiple platforms
- Generate actionable MD reports with scoring and categorization
- Be lightweight, fast, and configurable

## Architecture

### Core Components
1. **Source Plugins** - Modular plugins for each data source
2. **Processor Pipeline** - Normalization, deduplication, categorization, scoring
3. **Output Formatter** - MD report generation with templates
4. **Cache Layer** - Local JSON cache to respect rate limits

### Technology Stack
- **Language:** TypeScript
- **Runtime:** Bun (for consistency with asset-forge)
- **CLI Framework:** Citty (same as asset-forge)
- **Package Manager:** Bun

## Source Plugins

### Reddit Plugin
- **Subreddits:** r/SomebodyMakeThis, r/AppIdeas, r/Lightbulb, r/StartupIdeas
- **Data:** Post titles, descriptions, upvotes, comments
- **Rate Limit:** 1 request/second
- **Cache:** 1 hour

### Google Trends Plugin
- **Categories:** Technology, Business, Science
- **Data:** Trending search terms, volume growth, related queries
- **Rate Limit:** 1 request/minute
- **Cache:** 6 hours

### Hacker News Plugin
- **Sources:** "Ask HN: What problem do you wish someone would solve?" posts
- **Data:** Post text, comments, points
- **Rate Limit:** 2 requests/second
- **Cache:** 2 hours

### Twitter Plugin
- **Sources:** Trending developer hashtags, "build in public" threads
- **Data:** Tweet text, engagement metrics, hashtags
- **Rate Limit:** Follows Twitter API limits
- **Cache:** 2 hours

### GitHub Plugin
- **Sources:** Trending repositories, "awesome-" lists
- **Data:** Repo names, descriptions, star growth, issues
- **Rate Limit:** 10 requests/minute
- **Cache:** 4 hours

## Processing Pipeline

### 1. Fetch
All enabled sources fetch ideas concurrently with rate limiting.

### 2. Normalize
Convert platform-specific data to standard format:
```typescript
interface Idea {
  id: string;
  title: string;
  description: string;
  source: 'reddit' | 'google-trends' | 'hacker-news' | 'twitter' | 'github';
  url: string;
  timestamp: Date;
  rawData: any;
}
```

### 3. Deduplicate
- Levenshtein distance (< 20% difference in titles)
- URL matching across sources
- Keyword similarity check

### 4. Categorize
Auto-tag ideas by topic:
- **AI/ML:** GPT, LLM, machine learning, AI assistant
- **Developer Tools:** CLI, API, library, framework, VS Code
- **Productivity:** task manager, calendar, note-taking, automation
- **SaaS:** subscription, monthly, freemium, B2B
- **Open Source:** MIT license, GitHub, community, contributors

### 5. Score
Weighted scoring algorithm:
```typescript
Score = (popularity * 0.3) +
        (freshness * 0.2) +
        (uniqueness * 0.15) +
        (feasibility * 0.2) +
        (demand * 0.15)
```

### 6. Rank
Sort by total score, then by popularity.

### 7. Format
Generate MD report with template system.

## Output Format

### MD Report Structure
```
# Project Ideas Report - {date}

## Executive Summary
- Total ideas found: {count}
- Top categories: {categories}
- Highest potential idea: {topIdea.title}

## Ideas by Potential Score (Ranked)

### ⭐⭐⭐ {score} - {idea.title}
**Source:** {idea.source} | **Category:** {idea.category}
**URL:** {idea.url}
**Posted:** {idea.timestamp}

**Description:**
{idea.description}

**Metrics:**
- Popularity: {idea.metrics.popularity}/10
- Freshness: {idea.metrics.freshness}/10
- Uniqueness: {idea.metrics.uniqueness}/10
- Feasibility: {idea.metrics.feasibility}/10
- Demand: {idea.metrics.demand}/10
- **Total Score:** {idea.score}/10

**Tags:** #{tag1} #{tag2} #{tag3}
```

### Output Options
- Stdout: `idea-scout generate > ideas.md`
- File: `idea-scout generate --output ~/projects/ideas.md`
- Formats: MD (default), JSON, CSV
- Templates: Default, minimal, custom

## Directory Structure
```
idea-scout/
├── src/
│   ├── cli.ts          # Main CLI entry point
│   ├── commands.ts     # Command definitions
│   ├── sources/        # Source plugins
│   │   ├── reddit.ts
│   │   ├── google-trends.ts
│   │   ├── hacker-news.ts
│   │   ├── twitter.ts
│   │   └── github.ts
│   ├── processor.ts    # Idea processing pipeline
│   ├── categorizer.ts  # Topic classification
│   ├── scorer.ts       # Potential scoring algorithm
│   └── formatter.ts    # MD report generation
├── templates/          # MD report templates
├── cache/              # Local data cache
├── package.json
└── tsconfig.json
```

## Configuration
Stored in `~/.config/idea-scout/config.json`:
```json
{
  "sources": {
    "reddit": {
      "enabled": true,
      "subreddits": ["SomebodyMakeThis", "AppIdeas"],
      "min_upvotes": 10
    },
    "google-trends": {
      "enabled": true,
      "categories": ["Technology"],
      "regions": ["US"]
    }
  },
  "output": {
    "directory": "~/Documents/idea-scout",
    "template": "default"
  }
}
```

## Commands
- `idea-scout generate` - Generate ideas report
- `idea-scout config` - View/edit configuration
- `idea-scout sources list` - List available sources
- `idea-scout cache clear` - Clear cached data

## Next Steps
1. Create new project directory: `/Users/ricka7x/Projects/idea-scout`
2. Initialize with Bun, TypeScript, Citty
3. Implement core CLI structure
4. Build Reddit plugin (simplest to start)
5. Add processor pipeline
6. Implement scoring algorithm
7. Create MD formatter
8. Test with real data
9. Add remaining source plugins
10. Polish configuration system

## Success Criteria
- Generates usable project ideas from at least 3 sources
- Produces readable MD reports with scoring
- Respects API rate limits with caching
- Runs in under 30 seconds
- Configurable via JSON config file

## Risks & Mitigations
- **API changes:** Use stable endpoints, monitor, update plugins
- **Rate limiting:** Implement caching, respect limits, retry logic
- **Data quality:** Filter low-quality content, validate URLs
- **Performance:** Concurrent fetching, efficient processing