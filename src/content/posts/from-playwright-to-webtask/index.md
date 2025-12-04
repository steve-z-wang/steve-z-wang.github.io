---
title: "How I Built My Web Agent from Scratch"
summary: "Why I built an LLM-powered browser automation tool that understands natural language instead of CSS selectors."
tags:
  - technology
  - automation
  - ai
publishedAt: 2025-12-03
---

A while back, I was working on a side project that required automating some websites that didn't have public APIs.

I started with Playwright, which is pretty much the industry standard for browser automation. But I quickly found the whole development process incredibly time-consuming. For example, just to click a simple button on a page, I had to open DevTools, carefully find the right selector, and then write a bunch of code like this:

```python
await page.goto("https://example-shop.com")
await page.click('[data-testid="search-input"]')
await page.fill('[data-testid="search-input"]', "screwdriver")
await page.click('[data-testid="search-button"]')
await page.wait_for_selector('.product-item')
await page.click('.product-item:first-child .add-to-cart')
```

If the page structure changes one day, all this code might break. Forms are even worse—an endless stream of `fill`, `click`, and `select` operations. And don't even get me started on edge cases and error handling.

What I actually wanted to do was simple: "Log in to the website, search for a product, add it to the cart." But to accomplish this straightforward goal, I had to write dozens of lines of code.

So I started thinking: since LLMs can already understand web content, why am I still manually writing all these tedious selectors?

That's how WebTask was born.

## Overview

Here's the same shopping cart example, but with WebTask:

```python
from webtask import Webtask
from webtask.integrations.gemini import Gemini

wt = Webtask()

llm = Gemini(model="gemini-2.5-flash", api_key="your-api-key")
agent = await wt.create_agent(llm=llm)

await agent.goto("practicesoftwaretesting.com")
await agent.do("Add 2 Flat-Head Wood Screws to the cart")
```

That's it. No selectors to write, no wait logic to handle, and no worrying about page structure changes.

## Under the Hood

When you tell WebTask "click the login button," here's what happens:

1. **DOM Processing**: WebTask captures the page's HTML and filters out noise—scripts, hidden elements, non-interactive content. Only the meaningful stuff remains.

2. **Element ID Assignment**: Each interactive element gets a clean, human-readable ID like `button-0`, `textbox-1`, `link-2`. These IDs are based on the element's semantic role, not its CSS class or position.

3. **Context Building**: The processed DOM (with element IDs) plus a screenshot gets sent to the LLM.

4. **LLM Decision**: The LLM understands the page and responds with something like "click element button-3".

5. **Execution**: WebTask translates that element ID back to an XPath selector and executes the action in the browser.

The key insight is that the LLM never sees raw HTML selectors like `div.container > button.primary[data-testid="submit"]`. Instead, it sees something like this:

```
[button-0] "Sign In"
[textbox-1] Email input field
[textbox-2] Password input field
[button-3] "Submit"
[link-4] "Forgot password?"
```

Clean, semantic, and easy for the LLM to reason about. This abstraction is what makes WebTask reliable—the LLM works with meaningful IDs while WebTask handles the messy DOM translation behind the scenes.

## DOM Mode vs Visual Mode

WebTask supports two interaction modes:

**Text Mode (DOM-based)** — The default. The LLM sees element IDs and the processed DOM text. Fast, uses fewer tokens, and works great for most websites.

**Visual Mode (Pixel-based)** — The LLM sees screenshots with bounding boxes and clicks by coordinates. Better for complex layouts, canvas elements, or when the DOM structure is unusual.

You can also use both together for maximum accuracy.

## Staying Reliable

Initially, I considered whether I could just give the LLM a complete task description and let it handle everything end-to-end automatically. But in practice, I found that LLMs tend to make mistakes when handling long chains of tasks—the more steps, the higher the probability of something going wrong, and once it fails, it's hard to recover. Plus, the LLM might take a different path each time.

So WebTask is designed to let the agent **maintain memory across multiple tasks**. You can break down a complex workflow into fixed steps, calling each one separately, while the agent retains memory from previous steps.

Each step is relatively simple, so the LLM is less likely to make mistakes. Even if one step fails, you can restart from that step instead of starting over from scratch. More importantly, you can use `verify` after each step to confirm whether the operation succeeded, and `extract` to pull out key information for further validation:

```python
# Step 1: Search and add to cart
await agent.do("Search for Flat-Head Wood Screws, add the first two to cart")

# Verify: Cart actually has items
is_correct = await agent.verify("The cart has 2 items")
if not is_correct:
    # Handle error...

# Step 2: Go to checkout
await agent.do("Click the cart, go to checkout page")

# Extract order info for confirmation
from pydantic import BaseModel

class OrderSummary(BaseModel):
    total_items: int
    total_price: float

order = await agent.extract(OrderSummary, "Extract order summary information")
assert order.total_items == 2

# Step 3: Fill in shipping address and confirm
await agent.do("Fill in shipping address and submit order")
```

This approach breaks a complex shopping workflow into three controllable steps, each with a checkpoint. Compared to having the LLM complete the entire flow in one go, this is much more stable, and problems are easier to locate and fix.

## Use Cases

Beyond specific web workflow automation, I've been using WebTask to handle some daily repetitive tasks. For example, batch job applications—opening job sites, searching positions, filtering by criteria, then clicking through to apply one by one. This kind of thing used to require either manual work or writing a bunch of fragile scraping code. Now it's just a few lines of Python.

Another use case is end-to-end testing for my own web applications. Traditional E2E tests require maintaining tons of Playwright code, and tests break whenever the page changes. With WebTask, tests describe user behavior rather than DOM structure, so they're more stable and easier to maintain.

## Get Started

WebTask is still under active development. The code is open source on GitHub: [github.com/steve-z-wang/webtask](https://github.com/steve-z-wang/webtask)

To get started:

```bash
pip install pywebtask
```

If you have similar needs, or any thoughts and suggestions, feel free to try it out and reach out. If you have feature requests or interesting use cases, I'd love to discuss them.
