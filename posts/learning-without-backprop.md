---
title: "Learning Without Backprop"
summary: "Exploring biologically plausible alternatives to backpropagation using local learning rules."
tags:
  - technology
  - machine learning
  - neuroscience
publishedAt: 2025-02-03
---

## The Problem with Backprop

Modern neural networks learn through backpropagation. When the network makes a mistake, the error flows backward through every layer, telling each weight exactly how to change.

This works remarkably well, but has two problems:

1. **The brain doesn't do this.** There's no known biological mechanism for sending precise error signals backward through neurons.

2. **Catastrophic forgetting.** Updating all weights globally based on new data can erase what was learned before. Train a network on cats, then train it on dogs, and it forgets cats.

So how does the brain learn?

## Global Reward, Local Updates

Both backprop and the brain use a global signal—"how well did I do?" The difference is what happens next.

Backprop computes exactly how much each weight contributed to the error and updates all of them precisely. This requires information to flow backward through the network.

The brain does something simpler. Neurons that fire together wire together—this is called Hebbian learning. When dopamine (the reward signal) is released, it strengthens whatever connections were just active. Each synapse only needs local information—which neurons fired—plus a broadcast signal saying "that was good."

No backward pass. No precise error attribution. Just: "something worked, reinforce it."

Can we train neural networks this way?

## The Algorithm

GRLU (Global Reward Local Updates) replaces the backward pass with two forward passes:

1. Run the network with small positive noise added to neuron outputs
2. Run it again with negative noise (the opposite perturbation)
3. Compare: which one performed better?
4. Update weights in the direction that helped

Each layer only needs to know two things: what noise did I add, and did overall performance improve? That's it. The global reward signal ("this was better") combined with local information ("I added positive noise") is enough to learn.

## Results

On MNIST (handwritten digit recognition) with a shallow network (784 → 256 → 10) after 10 epochs:

| Noise Pairs | Test Accuracy |
| ----------- | ------------- |
| 1           | ~90%          |
| 16          | 92.83%        |
| 128         | 94.45%        |

With more epochs, this reaches ~98% accuracy—same as backprop on this task.

Why multiple noise pairs? A single pair has high variance—sometimes noise helps by luck, sometimes it hurts by luck. Sampling multiple pairs and averaging gives more reliable updates. This technique comes from Evolution Strategy, a family of optimization algorithms that use random sampling instead of gradients.

More pairs means better accuracy, but the single-pair result is more biologically plausible—the brain doesn't run 128 parallel trials before deciding.

## The Limitation

This approach struggles with deep networks.

When there are many layers with thousands of neurons, the global reward signal gets diluted. If the network got the answer right, which neuron deserves credit? If it got it wrong, which neuron is at fault? With only a single "good" or "bad" signal broadcast to everyone, it's hard to tell. This is called the credit assignment problem.

Backprop solves this elegantly—it computes exactly how much each layer contributed. But that requires the backward pass we're trying to avoid.

## What This Tells Us About the Brain

Here's what's interesting: the brain faces the same limitation. Yet it clearly works. How?

The answer is that biology doesn't use one learning algorithm—it uses two:

| System | Brain Region | Algorithm | Timescale |
| ------ | ------------ | --------- | --------- |
| Feature extraction | Neocortex | Evolution Strategy | Millions of years |
| Fast memory | Hippocampus | Hebbian learning | Milliseconds |

Evolution Strategy is named after biological evolution for a reason—both work the same way: random mutations, keep what survives. Your visual cortex wasn't learned in your lifetime; it was shaped over millions of years of evolutionary pressure. The basic features—edges, shapes, faces—came pre-installed at birth.

Hebbian learning then handles fast adaptation on top of this frozen foundation. You can learn a new face in seconds because you're not learning to see from scratch—you're just forming new associations in a space that evolution already structured.

No backprop anywhere. A single algorithm cannot efficiently do both deep feature extraction and fast memory formation. Biology solved this by separating the two systems entirely.

## Code

[github.com/steve-z-wang/grlu](https://github.com/steve-z-wang/grlu)
