# GraphQL Query Examples for DFD CMS

This document provides example GraphQL queries for fetching content from the WordPress headless CMS.

## GraphQL Endpoint

```
https://yourdomain.com/graphql
```

## Authentication

For authenticated requests (mutations or private content), use Application Passwords:

```javascript
const headers = {
  'Content-Type': 'application/json',
  'Authorization': 'Basic ' + btoa(`${username}:${applicationPassword}`)
};
```

## Portfolio Queries

### Get All Portfolio Items

```graphql
query GetPortfolios {
  portfolios {
    nodes {
      id
      databaseId
      title
      slug
      date
      excerpt
      portfolioFields {
        projectDescription
        projectUrl
        behanceEmbedCode
        projectImage {
          sourceUrl
          altText
          mediaDetails {
            width
            height
          }
        }
      }
    }
  }
}
```

### Get Single Portfolio Item by Slug

```graphql
query GetPortfolioBySlug($slug: ID!) {
  portfolio(id: $slug, idType: SLUG) {
    id
    title
    slug
    date
    content
    excerpt
    portfolioFields {
      projectDescription
      projectUrl
      behanceEmbedCode
      projectImage {
        sourceUrl
        altText
        mediaDetails {
          width
          height
        }
      }
    }
  }
}
```

**Variables:**
```json
{
  "slug": "cedarhurst-brewing"
}
```

### Get Portfolio Item by ID

```graphql
query GetPortfolioById($id: ID!) {
  portfolio(id: $id, idType: DATABASE_ID) {
    id
    title
    portfolioFields {
      projectDescription
      projectUrl
      behanceEmbedCode
      projectImage {
        sourceUrl
        altText
      }
    }
  }
}
```

**Variables:**
```json
{
  "id": 123
}
```

### Get Latest Portfolio Items

```graphql
query GetLatestPortfolios($first: Int = 5) {
  portfolios(first: $first, where: {orderby: {field: DATE, order: DESC}}) {
    nodes {
      id
      title
      slug
      date
      excerpt
      portfolioFields {
        projectDescription
        projectUrl
        behanceEmbedCode
        projectImage {
          sourceUrl
          altText
        }
      }
    }
    pageInfo {
      hasNextPage
      hasPreviousPage
      startCursor
      endCursor
    }
  }
}
```

## Services Queries

### Get All Services

```graphql
query GetServices {
  services {
    nodes {
      id
      databaseId
      title
      slug
      content
      serviceFields {
        serviceDescription
        serviceIcon
      }
    }
  }
}
```

### Get Single Service by Slug

```graphql
query GetServiceBySlug($slug: ID!) {
  service(id: $slug, idType: SLUG) {
    id
    title
    content
    serviceFields {
      serviceDescription
      serviceIcon
    }
  }
}
```

**Variables:**
```json
{
  "slug": "brand-design"
}
```

## Combined Queries

### Get Portfolio and Services Together

```graphql
query GetPortfolioAndServices {
  portfolios(first: 10) {
    nodes {
      id
      title
      slug
      portfolioFields {
        projectDescription
        projectUrl
        projectImage {
          sourceUrl
          altText
        }
      }
    }
  }
  services {
    nodes {
      id
      title
      serviceFields {
        serviceDescription
        serviceIcon
      }
    }
  }
}
```

## Pagination Examples

### Get Portfolio Items with Pagination (Cursor-based)

```graphql
query GetPortfoliosWithPagination($first: Int = 10, $after: String) {
  portfolios(first: $first, after: $after) {
    nodes {
      id
      title
      slug
      portfolioFields {
        projectDescription
        projectUrl
      }
    }
    pageInfo {
      hasNextPage
      hasPreviousPage
      startCursor
      endCursor
    }
  }
}
```

**First Request Variables:**
```json
{
  "first": 10
}
```

**Next Page Variables:**
```json
{
  "first": 10,
  "after": "cursor_value_from_endCursor"
}
```

## Media Queries

### Get Featured Image Details

```graphql
query GetPortfolioWithFeaturedImage {
  portfolios {
    nodes {
      id
      title
      featuredImage {
        node {
          sourceUrl
          altText
          mediaDetails {
            width
            height
            file
          }
          sizes
        }
      }
    }
  }
}
```

## Search Queries

### Search Portfolio by Title

```graphql
query SearchPortfolio($search: String!) {
  portfolios(where: {search: $search}) {
    nodes {
      id
      title
      slug
      excerpt
      portfolioFields {
        projectUrl
        projectImage {
          sourceUrl
        }
      }
    }
  }
}
```

**Variables:**
```json
{
  "search": "cedarhurst"
}
```

## JavaScript Integration Examples

### Using Fetch API

```javascript
// Function to fetch portfolio items
async function fetchPortfolios() {
  const query = `
    query GetPortfolios {
      portfolios {
        nodes {
          id
          title
          slug
          portfolioFields {
            projectDescription
            projectUrl
            behanceEmbedCode
            projectImage {
              sourceUrl
              altText
            }
          }
        }
      }
    }
  `;

  try {
    const response = await fetch('https://yourdomain.com/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query })
    });

    const { data } = await response.json();
    return data.portfolios.nodes;
  } catch (error) {
    console.error('Error fetching portfolios:', error);
    return [];
  }
}

// Use the function
fetchPortfolios().then(portfolios => {
  console.log('Portfolio items:', portfolios);
});
```

### Using with Variables

```javascript
async function fetchPortfolioBySlug(slug) {
  const query = `
    query GetPortfolioBySlug($slug: ID!) {
      portfolio(id: $slug, idType: SLUG) {
        id
        title
        portfolioFields {
          projectDescription
          projectUrl
          behanceEmbedCode
        }
      }
    }
  `;

  const variables = { slug };

  try {
    const response = await fetch('https://yourdomain.com/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query, variables })
    });

    const { data } = await response.json();
    return data.portfolio;
  } catch (error) {
    console.error('Error fetching portfolio:', error);
    return null;
  }
}

// Use the function
fetchPortfolioBySlug('cedarhurst-brewing').then(portfolio => {
  console.log('Portfolio item:', portfolio);
});
```

### Using Axios

```javascript
import axios from 'axios';

const GRAPHQL_URL = 'https://yourdomain.com/graphql';

async function fetchServices() {
  const query = `
    query GetServices {
      services {
        nodes {
          id
          title
          serviceFields {
            serviceDescription
            serviceIcon
          }
        }
      }
    }
  `;

  try {
    const response = await axios.post(GRAPHQL_URL, {
      query
    });

    return response.data.data.services.nodes;
  } catch (error) {
    console.error('Error fetching services:', error);
    return [];
  }
}
```

### Environment Variable Configuration

Create a `.env` file in your frontend:

```env
# WordPress GraphQL API Configuration
# IMPORTANT: Replace with your actual domain and use HTTPS in production
VITE_WP_GRAPHQL_URL=https://yourdomain.com/graphql

# Authentication credentials
# WARNING: Never commit this file to version control
# Use a non-admin username for better security
VITE_WP_API_USER=your_wp_username
VITE_WP_APP_PASSWORD=your_application_password_here
```

**Security Notes:**
- Always use HTTPS in production
- Never use the 'admin' username - create a dedicated API user
- Keep your Application Password secure and rotate it regularly
- Never commit `.env` files to version control
- Use environment-specific `.env` files (`.env.local`, `.env.production`)

Then use it in your code:

```javascript
const GRAPHQL_URL = import.meta.env.VITE_WP_GRAPHQL_URL;

async function fetchWithAuth(query, variables = {}) {
  const username = import.meta.env.VITE_WP_API_USER;
  const password = import.meta.env.VITE_WP_APP_PASSWORD;
  
  const response = await fetch(GRAPHQL_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Basic ' + btoa(`${username}:${password}`)
    },
    body: JSON.stringify({ query, variables })
  });

  return response.json();
}
```

## Error Handling

GraphQL returns errors in a specific format:

```javascript
async function fetchWithErrorHandling(query) {
  try {
    const response = await fetch('https://yourdomain.com/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query })
    });

    const result = await response.json();

    // Check for GraphQL errors
    if (result.errors) {
      console.error('GraphQL errors:', result.errors);
      return null;
    }

    return result.data;
  } catch (error) {
    console.error('Network error:', error);
    return null;
  }
}
```

## Testing in GraphiQL IDE

1. Navigate to your WordPress admin
2. Go to **GraphQL** → **GraphiQL IDE**
3. Copy and paste any query from above
4. Click the "Play" button to execute
5. View results in the right panel

## Additional Resources

- [WPGraphQL Documentation](https://www.wpgraphql.com/docs/introduction)
- [GraphQL Learning Resources](https://graphql.org/learn/)
- [Advanced Custom Fields + WPGraphQL](https://www.wpgraphql.com/acf)

## Common Query Patterns

### Get All Data Needed for Homepage

```graphql
query GetHomepageData {
  # Featured portfolio items
  portfolios(first: 6, where: {orderby: {field: DATE, order: DESC}}) {
    nodes {
      id
      title
      slug
      excerpt
      portfolioFields {
        projectUrl
        projectImage {
          sourceUrl
          altText
        }
      }
    }
  }
  
  # All services
  services {
    nodes {
      id
      title
      serviceFields {
        serviceDescription
        serviceIcon
      }
    }
  }
}
```

This query fetches all the data needed to populate a homepage in a single request, improving performance.
