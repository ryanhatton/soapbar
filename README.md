# Soapbox API
Soapbar API is a flexible and fast profanity filter that can be integrated into any app or site.

## Technology used:
* [Upstash](https://upstash.com/) - for Redis and Vector Database
* [Hono](https://hono.dev/) - backend framework
* [Cloudflare Workers](https://workers.cloudflare.com/) - for scalable, high performance API deployment
* [Next.js](https://nextjs.org/) - React framework
* [Vercel](https://vercel.com/) - web app deployment

## API Features
Make an API request:
```js
const res = await fetch('https://soapbar.ryanhattonmain.workers.dev/', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ message }),
})
```

There are three attri messages for profanity and will trigger two attributes:
    1. ```isProfanity``` : ```boolean``` 
    2. ```score``` : ```float```
    3. ```flaggedFor``` : ```string```

__Output without Profanity:__
```json
{
  "isProfanity": false,
  "score": 0.80131274
}
```

__Output with Profanity:__
```json
{
  "isProfanity": true,
  "score": 0.86926556,
  "flaggedFor": "sh!+"
}
```

### Rate Limits
Currently the rate limits are set to the following:
```tsx 
const RATE_LIMIT_WINDOW = 60; // Time window in seconds
const MAX_REQUESTS = 100; // Max requests per IP within time window
``` 

## Project Folder Structure
There are two main folders:
1. ```soapbar/api``` - contains the api logic (cloudflare workers, hono, redis, rate limiting) and vector database seed file parsing and seed file
2. ```soapbar/web``` -  contains the nextjs web app 

## Project Scripts
For seeding vector database to Upstash with current dataset file ```training_dataset.csv```:
```bash
yarn tsx seed
```  

Spinning up the API server on localhost. __NOTE: The rate limiter looks for IP address__
```bash
yarn wrangler dev index
```

Deploy cloudflare workers using the ```wrangler.toml``` file, to deploy the```api/index.ts``` file
```bash
yarn deploy
``` 
or 
```bash
wrangler deploy --minify index.ts
```

## Future Updates
1. Model optimization - increase chance of catching profanity permutations
2. Multi-language support - currently API only supports english
