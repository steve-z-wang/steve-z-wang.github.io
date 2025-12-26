---
title: "webtask"
summary: "I created webtask, an easy-to-use llm-powered web automation library, for rapid web automation workflow prototyping"
tags:
  - technology
  - automation
  - ai
publishedAt: 2025-12-03
---

A while back, I was working on a side project that required automating some websites that didn't have public APIs.

I started with Playwright, a popular library for controlling browsers programmatically. To interact with a page, you need a unique selector to identify each DOM element. That means opening DevTools, inspecting the HTML, proposing the right selector, and writing code like this:

```python
await page.goto("https://example-shop.com")
await page.click('[data-testid="search-input"]')  # CSS selector
await page.fill('[data-testid="search-input"]', "screwdriver")
await page.click('[data-testid="search-button"]')
```

The problems?
- Selectors are fragile—developers rename `data-testid`, class names change, page structure shifts
- You have to manually write every single step, which is time-consuming

All I wanted was: "Log in, search for a product, add it to cart." But that required dozens of lines of brittle code.

But here's the thing: LLMs can easily understand web pages. Give them a task like "click the login button" and they know what to do. That's the idea behind WebTask.

## Overview

Here's the same shopping cart example, but with WebTask:

```python
from webtask import Webtask
from webtask.integrations.gemini import Gemini

llm = Gemini(model="gemini-2.5-flash", api_key="your-api-key")

wt = Webtask()
agent = await wt.create_agent(llm=llm)

await agent.goto("practicesoftwaretesting.com")
await agent.do("Add 2 Flat-Head Wood Screws to the cart")
```

That's it. No selectors to write, no wait logic to handle, and no worrying about page structure changes.

## Under the Hood

Here's what happens when you run a task:

**1. DOM Processing**

Raw HTML is messy. Here's what a simple login form actually looks like:

```html
<div class="auth-wrapper mx-auto px-4">
  <script>trackPageView('login')</script>
  <form class="space-y-6" data-testid="login-form">
    <div class="hidden"><!-- analytics pixel --></div>
    <button type="button" class="btn-primary w-full">Sign In</button>
    <input type="email" class="form-input" placeholder="Email" />
    <input type="password" class="form-input" placeholder="Password" />
    <button type="submit" class="btn-secondary">Submit</button>
    <a href="/forgot" class="text-sm text-blue-600">Forgot password?</a>
  </form>
</div>
```

WebTask filters out scripts, hidden elements, and non-interactive content. Only the meaningful stuff remains.

**2. Element ID Assignment**

Each interactive element gets a simple ID based on its tag:

```
[button-0] "Sign In"
[input-1] Email input (placeholder: "Email")
[input-2] Password input (placeholder: "Password")
[button-3] "Submit"
[a-4] "Forgot password?"
```

**3. Context Building**

The processed DOM plus a screenshot gets sent to the LLM. This is key—the LLM sees both the structure (text) and the visual layout (image). It knows `button-3` is the submit button because it can read the label AND see where it is on the page.

**4. LLM Decision**

Given the task "log in with test@example.com", the LLM responds:

```json
{"action": "fill", "element_id": "input-1", "value": "test@example.com"}
```

**5. Execution**

WebTask takes the LLM response, maps `input-1` to its XPath, and converts it to a Playwright action:

```python
await page.fill('/html/body/div/form/input[1]', "test@example.com")
```

The loop continues until the task is complete.

## DOM Mode vs Pixel Mode

WebTask supports two interaction modes:

**DOM Mode** — The default. The LLM sees both the screenshot and processed DOM text, but interacts using element IDs. Fast, accurate, and works great for most websites.

**Pixel Mode** — The LLM sees screenshots and clicks by coordinates. Works with computer use models that output x-y coordinates. Handles complex interactions that DOM mode can't reach—canvas elements, image-based CAPTCHAs, drag-and-drop challenges, or anything that doesn't map cleanly to DOM elements.

You can also use both together for maximum accuracy.

## On Building Reliable Workflows

I first tried letting the LLM handle entire workflows automatically. But LLMs make mistakes on long task chains—the more steps, the more likely something breaks. They're also unpredictable, taking different paths each time. And once it fails, recovery is hard.

So WebTask lets agents **maintain memory across tasks**. Break a workflow into steps, call each separately, and the agent remembers context.

Simpler steps mean fewer mistakes. If one fails, restart from there. Use `verify` to check success, and `extract` to pull data for validation:

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

Breaking workflows into steps with checkpoints makes them more stable and easier to debug.

## Use Cases

Beyond my side project, I plan to use WebTask for personal workflows—things like batch job applications, auto-filling forms, or scraping data from sites without APIs. Tasks that used to require manual work or fragile code.

It's also useful for E2E testing. Traditional tests break when pages change. WebTask tests describe user behavior, not DOM structure—more stable and easier to maintain.

## Get Started

WebTask is open source: [github.com/steve-z-wang/webtask](https://github.com/steve-z-wang/webtask)

```bash
pip install pywebtask
```

Try it out. Feedback and feature requests welcome.


## Updates
- **2025-12-26**: Updated title and summaries. 
